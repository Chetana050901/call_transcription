const express = require('express');
const router = express.Router();
const axios = require('axios');
const Call = require('../models/Call');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { google } = require('googleapis');

//Google Sheets auth config
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

//Validate ISO date string
const validateDateFormat = dateString =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(dateString);

//Download recording, transcribe, summarize, return results
async function handleRecording(recordingUrl, OPENAI_API_KEY) {
  const tmpFile = tmp.fileSync({ postfix: '.mp3' });
  const writer = fs.createWriteStream(tmpFile.name);

  const response = await axios({
    method: 'get',
    url: recordingUrl,
    responseType: 'stream'
  });

  await new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  const formData = new FormData();
  formData.append('file', fs.createReadStream(tmpFile.name));
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');

  const whisperResp = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    formData,
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders()
      }
    }
  );

  const segments = whisperResp.data.segments || [];
  const transcript = segments.map(s => s.text).join(' ');


  const gptResult = await summarize(transcript, OPENAI_API_KEY);

  tmpFile.removeCallback();

  return {
    transcript,
    summary: gptResult.summary,
    sentiment: gptResult.sentiment,
    bullets: gptResult.bullets
  };
}

//Summarize transcript and detect sentiment using GPT
async function summarize(transcript, OPENAI_API_KEY) {
  const prompt = `
    You are a precise assistant. Summarize the following call transcript **strictly in valid JSON format**, and nothing else.

    Output JSON structure:
    {
      "summary": "A concise summary of the call in no more than 3 short sentences.",
      "bullets": [
        "Action or objection point 1",
        "Action or objection point 2",
        ...
      ],
      "sentiment": "Positive" // must be one of: Positive, Neutral, Negative
    }

    Transcript:
    """
    ${transcript}
    """

    Rules:
    - Output only valid JSON, no commentary or explanation.
    - "summary" must be clear and no longer than 3 sentences.
    - "bullets" must be a list of key actions, decisions, or objections mentioned.
    - "sentiment" must be exactly one of: Positive, Neutral, Negative.

    Now respond with the JSON only.
    `;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    },
    {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    }
  );

  let text = response.data.choices[0].message.content.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```[\s\S]*?\n/, '');
    text = text.replace(/```$/, '');
  }

  return JSON.parse(text);
}

//Append rows to Google Sheet
async function appendToSheet(rows, sheetId, sheetName) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: rows }
  });

  return response.data;
}

//Main route: process Ringba calls, save to DB, summarize, write to Sheet
router.post('/process', async (req, res) => {
  try {
    const accountId = process.env.RINGBA_ACC_ID_1;
    const apiKey = process.env.RINGBA_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!accountId || !apiKey || !OPENAI_API_KEY)
      throw new Error('Missing environment variables');

    const { reportStart, reportEnd, sheetId, sheetName, ...params } = req.body;

    if (!reportStart || !reportEnd || !validateDateFormat(reportStart) || !validateDateFormat(reportEnd)) {
      return res.status(400).json({ error: 'Invalid or missing reportStart/reportEnd' });
    }

    const startDate = new Date(reportStart), endDate = new Date(reportEnd);
    if (startDate >= endDate) {
      return res.status(400).json({ error: 'reportStart must be before reportEnd' });
    }

    const { data } = await axios.post(
      `https://api.ringba.com/v2/${accountId}/calllogs`,
      { reportStart, reportEnd, ...params },
      {
        headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    if (!data.isSuccessful || !data.report?.records) {
      return res.status(500).json({ error: 'Invalid Ringba API response', response: data });
    }

    const calls = data.report.records.map(record => ({
      callId: record.inboundCallId,
      timestamp: new Date(record.callDt),
      campaignId: record.campaignId,
      campaignName: record.campaignName,
      payout: record.payoutAmount || 0,
      duration: record.callLengthInSeconds || 0,
      hasRecording: !!record.recordingUrl,
      recordingUrl: record.recordingUrl || null,
      rawJson: record
    }));

    const bulkOps = calls.map(doc => ({
      updateOne: {
        filter: { callId: doc.callId },
        update: { $set: doc },
        upsert: true
      }
    }));

    const mongoResult = await Call.bulkWrite(bulkOps);

    const callsWithRecordings = calls.filter(c => c.recordingUrl);

    const results = await Promise.allSettled(
      callsWithRecordings.map(async (call) => {
        try {
          const transcriptAndSentiment = await handleRecording(call.recordingUrl, OPENAI_API_KEY);
          await Call.updateOne(
            { callId: call.callId },
            { $set: { ...transcriptAndSentiment, hasRecording: true } }
          );
          return { callId: call.callId, hasRecording: true, ...transcriptAndSentiment };
        } catch (err) {
          console.error(`Failed to process callId ${call.callId}:`, err.message);
          return { callId: call.callId, hasRecording: false, error: err.message };
        }
      })
    );


    const enrichedCalls = calls.map(call => {
      const result = results.find(r => r.value?.callId === call.callId)?.value || {};
      return {
        ...call,
        ...result
      };
    });

    const rows = [
      [
        'Call ID', 'Timestamp', 'Campaign ID', 'Campaign Name',
        'Payout', 'Duration (s)', 'Has Recording', 'Recording URL',
        'Summary', 'Sentiment', 'Bullets'
      ],
      ...enrichedCalls.map(call => [
        call.callId,
        call.timestamp.toISOString(),
        call.campaignId,
        call.campaignName,
        call.payout,
        call.duration,
        call.hasRecording,
        call.recordingUrl,
        call.summary || '',
        call.sentiment || '',
        Array.isArray(call.bullets) ? call.bullets.join('; ') : '',
      ])
    ];

    // Write all enriched data to Google Sheet
    const sheetResponse = await appendToSheet(rows, sheetId, sheetName);
    console.log('✅ Data written to Google Sheet:', sheetResponse.updates.updatedCells);

    res.json({
      success: true,
      recordsProcessed: calls.length,
      inserted: mongoResult.upsertedCount,
      updated: mongoResult.modifiedCount,
      transactionId: data.transactionId,
      enrichedCalls
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

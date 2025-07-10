# Call Transcription 
## Ringba Call Processing API
A Node.js service that processes Ringba call logs, transcribes recordings, analyzes sentiment, and exports data to Google Sheets.

## Features
- Fetch call logs from Ringba API
- Download and transcribe call recordings using OpenAI Whisper
- Generate summaries and sentiment analysis with GPT-4
- Store data in MongoDB
- Export enriched data to Google Sheets

## Prerequisites
- Node.js + Express.js
- MongoDB
- OpenAI API key
- Ringba API credentials
- Google Sheets API credentials

## Environment Variables
```
RINGBA_ACC_ID_1=your_ringba_account_id
RINGBA_API_KEY=your_ringba_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Setup
1. Install dependencies:
```bash
npm install express axios tmp form-data googleapis
```
2. Place your Google Sheets credentials in `credentials.json`

3. Set up your MongoDB connection and Call model

## API Endpoint
**POST** `/api/calls/process`

### Request Body
```json
{
  "reportStart": "2024-01-01T00:00:00Z",
  "reportEnd": "2024-01-31T23:59:59Z",
  "sheetId": "your_google_sheet_id",
  "sheetName": "Sheet1"
}
```

### Response
```json
{
    "success": true,
    "recordsProcessed": 20,
    "inserted": 20,
    "updated": 0,
    "transactionId": "TR8cb57645-f679-4a71-b920-88e170bcb09d",
    "enrichedCalls": [
        {
            "callId": "RGB9390050D33CD09C54EDB1C54235DC1CDF96BA8E0V3FKQ01",
            "timestamp": "2025-07-07T16:44:44.561Z",
            "campaignId": "CA2ed30a6f2e7d401c8345a0a0a251da72",
            "campaignName": "Gutters - Nationwide - Variable Rate",
            "payout": 0,
            "duration": 23,
            "hasRecording": true,
            "recordingUrl": "https://media.ringba.com/recording-public?v=v1&k=eBEF%2fJlux2eoho8ICubzqGWefw7eEpHbS5liyu4GOjYH0Rp69cFqgbx26dzOWvImK6%2bhEXZM8rR%2bLB3f5iS1nGD0J87e3vXyd7HhICCCZRG4dq12zdLUxdI%2fgHae%2fOwkOTEjxcxAHH4cI2E8VY44JnGGUXPC72blP4Oe1Bs%2fqPHDJIJTPJKZT7ntWepuIXqOwvm3UTvZE%2fYUWnnDDGdCbg1LCnpGf9gg8N1BH4SRRWXw8%2bJcE58UN16UPWsKy7Ipdy3mnaTpcTRL7pb0dst3HQ1cGo8%3d",
            "rawJson": {
                "campaignName": "Gutters - Nationwide - Variable Rate",
                "campaignId": "CA2ed30a6f2e7d401c8345a0a0a251da72",
                "inboundCallId": "RGB9390050D33CD09C54EDB1C54235DC1CDF96BA8E0V3FKQ01",
                "callDt": 1751906684561,
                "inboundPhoneNumber": "+15732017237",
                "number": "+13218782517",
                "numberPoolId": "",
                "numberPoolName": "",
                "timeToCallInSeconds": 0,
                "callLengthInSeconds": 23,
                "connectedCallLengthInSeconds": 5,
                "hasConnected": true,
                "isDuplicate": false,
                "hasPreviouslyConnected": false,
                "isLive": false,
                "recordingUrl": "https://media.ringba.com/recording-public?v=v1&k=eBEF%2fJlux2eoho8ICubzqGWefw7eEpHbS5liyu4GOjYH0Rp69cFqgbx26dzOWvImK6%2bhEXZM8rR%2bLB3f5iS1nGD0J87e3vXyd7HhICCCZRG4dq12zdLUxdI%2fgHae%2fOwkOTEjxcxAHH4cI2E8VY44JnGGUXPC72blP4Oe1Bs%2fqPHDJIJTPJKZT7ntWepuIXqOwvm3UTvZE%2fYUWnnDDGdCbg1LCnpGf9gg8N1BH4SRRWXw8%2bJcE58UN16UPWsKy7Ipdy3mnaTpcTRL7pb0dst3HQ1cGo8%3d",
                "timeToConnectInSeconds": 18
            },
            "transcript": " Thank you for calling Lee Filter. For a new gutter system, please press 1.",
            "summary": "The call was an automated message from Lee Filter regarding a new gutter system.",
            "sentiment": "Neutral",
            "bullets": [
                "Press 1 for a new gutter system"
            ]
        },
    ]
}
```

## What It Does
1. Fetches call logs from Ringba for the specified date range
2. Downloads call recordings and transcribes them using OpenAI Whisper
3. Generates summaries, bullet points, and sentiment analysis using GPT-4
4. Saves all data to MongoDB
5. Exports enriched data to Google Sheets with headers

## Output Columns
- Call ID, Timestamp, Campaign ID, Campaign Name
- Payout, Duration, Has Recording, Recording URL
- Summary, Sentiment, Bullets

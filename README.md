# Call Transcription 
## Ringba Call Processing API
A Node.js service that processes Ringba call logs, transcribes recordings, analyzes sentiment, and exports data to Google Sheets.

## Prerequisites
- Node.js + Express.js
- MongoDB
- OpenAI API key
- Ringba API credentials
- Google Sheets API credentials

## Environment Variables
```
PORT=8000
RINGBA_ACC_ID_1=your_ringba_account_id
RINGBA_API_KEY=your_ringba_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Setup
1. Install dependencies or node modules (npm install):
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
  "success": true,
  "recordsProcessed": 5,
  "inserted": 5,
  "updated": 0,
  "transactionId": "TR12345678-aaaa-bbbb-cccc-1234567890ab",
  "enrichedCalls": [
    {
      "callId": "CALL1234567890ABCDEF",
      "timestamp": "2025-07-10T10:30:00.000Z",
      "campaignId": "CA9876543210abcdef",
      "campaignName": "Home Improvement",
      "payout": 25,
      "duration": 120,
      "hasRecording": true,
      "recordingUrl": "https://example.com/recording.mp3",
      "rawJson": {
        "campaignName": "Home Improvement",
        "campaignId": "CA9876543210abcdef",
        "inboundCallId": "CALL1234567890ABCDEF",
        "callDt": 1752000000000,
        "inboundPhoneNumber": "+1234567890",
        "number": "+0987654321",
        "numberPoolId": "POOL001",
        "numberPoolName": "Main Pool",
        "timeToCallInSeconds": 2,
        "callLengthInSeconds": 120,
        "connectedCallLengthInSeconds": 100,
        "hasConnected": true,
        "isDuplicate": false,
        "hasPreviouslyConnected": false,
        "isLive": false,
        "recordingUrl": "https://example.com/recording.mp3",
        "timeToConnectInSeconds": 3
      },
      "transcript": "Thank you for calling Home Improvement Services. How may I help you? Hi, I need help with my kitchen renovation. Sure, I can assist you with that.",
      "summary": "Caller inquired about kitchen renovation services. Representative provided assistance.",
      "sentiment": "Positive",
      "bullets": [
        "Caller asked about kitchen renovation.",
        "Representative assisted with information."
      ]
    }
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

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
  "recordsProcessed": 150,
  "inserted": 50,
  "updated": 100,
  "transactionId": "ringba_transaction_id",
  "enrichedCalls": [...]
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

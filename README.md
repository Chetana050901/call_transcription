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
            "callId": "RGB6FC632A251AB107C98C3ECBC27DE81BA8F50DA6FV3LX301",
            "timestamp": "2025-07-07T13:59:05.543Z",
            "campaignId": "CA8278ed3f26e9495b881fe3833174d007",
            "campaignName": "Roofing Contractors",
            "payout": 0,
            "duration": 78,
            "hasRecording": true,
            "recordingUrl": "https://media.ringba.com/recording-public?v=v1&k=Nt3KXBilep97jRQlJvMpmJyCLePl9mxk%2bYxczu7%2b%2ft2vNmEnqvNp9tiY60swUOeXzhL6O0lk0rHFhQExXW17Efa2ETFRRIezYJWb1mc8JLjMw0UnUlydFz6m3lPU3jlaabvYJZgxlPQh8NZQ8WpK6Xa%2b44AsxNn%2fhD7cJlgTdFHyEsnTn%2b4uv2nPNxWx6GI2Xs2uJpaiQSb77JLTr9b66o4tzMTjdCqeNzSZVTiiFSJwkgwSAuOkickJ6uc4BLmNod%2bPbw%2bCa8mFVe5CUk9vRL9CwWM%3d",
            "rawJson": {
                "campaignName": "Roofing Contractors",
                "campaignId": "CA8278ed3f26e9495b881fe3833174d007",
                "inboundCallId": "RGB6FC632A251AB107C98C3ECBC27DE81BA8F50DA6FV3LX301",
                "callDt": 1751896745543,
                "inboundPhoneNumber": "+12259335505",
                "number": "+18338052312",
                "numberPoolId": "",
                "numberPoolName": "",
                "timeToCallInSeconds": 0,
                "callLengthInSeconds": 78,
                "connectedCallLengthInSeconds": 40,
                "hasConnected": true,
                "isDuplicate": false,
                "hasPreviouslyConnected": false,
                "isLive": false,
                "recordingUrl": "https://media.ringba.com/recording-public?v=v1&k=Nt3KXBilep97jRQlJvMpmJyCLePl9mxk%2bYxczu7%2b%2ft2vNmEnqvNp9tiY60swUOeXzhL6O0lk0rHFhQExXW17Efa2ETFRRIezYJWb1mc8JLjMw0UnUlydFz6m3lPU3jlaabvYJZgxlPQh8NZQ8WpK6Xa%2b44AsxNn%2fhD7cJlgTdFHyEsnTn%2b4uv2nPNxWx6GI2Xs2uJpaiQSb77JLTr9b66o4tzMTjdCqeNzSZVTiiFSJwkgwSAuOkickJ6uc4BLmNod%2bPbw%2bCa8mFVe5CUk9vRL9CwWM%3d",
                "timeToConnectInSeconds": 38
            },
            "transcript": " This call may be recorded for quality assurance purposes.  Please hold to be connected.  Calls and appointments may be recorded for quality and training purposes.  Thank you for calling Bachman's Roofing, Solar, and Exteriors.  This is Katie.  How can I assist you?  Yes, ma'am.  Yes, ma'am.  Is this not Western Soda Blasting?  No, sir.  This is Bachman's Roofing, Solar, and Exteriors.  Okay.  All right.  Thank you.  This is Katie.  How can I assist you?  Yes, ma'am.  Is this not Western Soda Blasting?  No, sir.  This is Bachman's Roofing, Solar, and Exteriors.  Okay.  All right. ",
            "summary": "A caller mistakenly contacted Bachman's Roofing, Solar, and Exteriors instead of Western Soda Blasting. The representative clarified the company's identity to the caller. The call ended after the clarification.",
            "sentiment": "Neutral",
            "bullets": [
                "Caller intended to reach Western Soda Blasting.",
                "Representative clarified the company identity."
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

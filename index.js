const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Replace with your Google Service Account credentials
const serviceAccount = require('./service-account.json');

// Your Google Sheet ID
const SPREADSHEET_ID = '162gFgJfxelvbioof_kTRer5_5LPZJnmfDTdt9WW2JBw';

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

app.post('/add-item', async (req, res) => {
  const { articleNumber, note } = req.body;

  if (!articleNumber) {
    return res.status(400).json({ error: 'articleNumber is required' });
  }

  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Tabelle1!A:B',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[articleNumber, note || 'bitte bestellen']]
      }
    });

    res.status(200).json({ success: true, result: response.data });
  } catch (error) {
    console.error('Error appending to sheet:', error);
    res.status(500).json({ error: 'Failed to append data to Google Sheet' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

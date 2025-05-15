
const express = require('express');
const { google } = require('googleapis');
const keys = require('./bestellfix-api-b0a7710a4149.json');

const SPREADSHEET_ID = '162gFgJfxelvbioof_kTRer5_5LPZJnmfDTdt9WW2JBw';

const app = express();
app.use(express.json());

async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: keys,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

app.post('/add', async (req, res) => {
  const { artikelnummer, notizen } = req.body;

  try {
    const sheets = await getAuthSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:B',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[artikelnummer, notizen || '']],
      },
    });
    res.status(200).send('Erfolgreich hinzugefügt!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Fehler beim Hinzufügen.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));

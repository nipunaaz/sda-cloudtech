const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// Load Google credentials
const credentials = require('./credentials.json');
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your Google Sheet ID

// Set up Google OAuth2 client
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to handle form submission
app.post('/submit_course_details', async (req, res) => {
  const { fullName, email, courseName, completionDate, additionalComments } = req.body;

  // Data to append to Google Sheet
  const values = [
    [fullName, email, courseName, completionDate, additionalComments],
  ];

  const resource = {
    values,
  };

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:E', // Adjust the range if needed
      valueInputOption: 'RAW',
      resource,
    });

    res.status(200).send('Course completion details submitted successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving data to Google Sheets.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

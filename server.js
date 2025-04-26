const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Load Google Sheets credentials
const credentials = JSON.parse(fs.readFileSync('credentials.json'));

// Set up the Google Sheets API client
const sheets = google.sheets('v4');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    SCOPES
);

const spreadsheetId = 'https://docs.google.com/spreadsheets/d/1VhGzoV3rIq_fWihZsLosuKEWXEb6AOv-JSl051dmJ6I/edit?usp=sharing';

// Signup route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        await sheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: 'Sheet1!A:B', // Change sheet range as necessary
            valueInputOption: 'RAW',
            resource: {
                values: [[username, password]],
            },
        });
        res.json({ message: 'Signup successful!' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving data to Google Sheets' });
    }
});

// Signin route
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const response = await sheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: 'Sheet1!A:B', // Same range as signup
        });
        
        const rows = response.data.values;
        const user = rows.find(row => row[0] === username && row[1] === password);

        if (user) {
            res.json({ message: 'Signin successful!' });
        } else {
            res.status(400).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data from Google Sheets' });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

const express = require('express');
const helmet = require('helmet');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const key = require('./keys/sheet-grabber-295609-9fc82beacf7f.json');
const { sheetParser } = require('./sheetParser');

const app = express();
const port = 3000;

app.use(helmet());

app.get('/', (req, res) => {
  res.send('Are you ready to grab some sheets?');
});

app.get('/:sheetID.json', (req, res) => {
  const doc = new GoogleSpreadsheet(req.params.sheetID);
  doc.useServiceAccountAuth({
    client_email: key.client_email,
    private_key: key.private_key,
  })
    .then(sheetParser(doc, res, req))
    .catch((err) => {
      console.log(err);
      res.json({ error: `service acc error : ${err}` });
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

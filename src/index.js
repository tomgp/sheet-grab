require('dotenv').config()
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
// const key = require('../keys/sheet-grabber-295609-9fc82beacf7f.json');
const { googleSheetParser } = require('./googleSheetParser');

const app = express();
const port = process.env.EXPRESS_PORT ? process.env.EXPRESS_PORT : 3000;

app.use(helmet());

app.get('/', (req, res) => {
  res.json({health:'ready and willing'});
});

app.get('/:sheetID.json', cors(), (req, res) => {
  const doc = new GoogleSpreadsheet(req.params.sheetID);
  doc.useServiceAccountAuth({
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY,
  })
  .then(googleSheetParser(res, req, doc))
  .catch((err) => {
    res.json({ error: `service acc error : ${err}` });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

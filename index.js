const key = require('./keys/sheet-grabber-295609-9fc82beacf7f.json')

const express = require('express');
const helmet = require("helmet");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { parseRows } = require("./parse-rows");


 
const app = express()
const port = 3000 

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
    .then( sheetParser(doc, res, req) )
    .catch((err)=>{
        console.log(err)
        res.json({ error:`service acc error : ${err}` })
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

function sheetParser(doc, res, req) {
    return (err, data) => {
        doc.loadInfo()
            .then(() => {
                const sheetPromises = doc.sheetsByIndex
                    .filter(ws => (ws.title.indexOf('-nopub') === -1)) // exclued sheets with -nopub switch
                    .map((ws) => {
                        return ws.getRows()
                            .then((rows)=>parseRows(rows, ws.title))
                            .then(data => {
                                return {
                                    title: ws.title,
                                    data
                                };
                            });
                    });

                Promise.all(sheetPromises)
                    .then((csvs) => {
                        res.json({
                            id: `${req.params.sheetID}`,
                            ssid: `${doc.spreadsheetId}`,
                            title: doc.title,
                            sheets: csvs
                        });
                    });
            })
            .catch((err) => {
                res.json({ error: `load info : ${err}` });
            });


    };
}


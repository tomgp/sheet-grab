const { parseRows } = require('./parse-rows');

function sheetParser(doc, res, req) {
  return (err, data) => {
    doc.loadInfo()
      .then(() => {
        const sheetPromises = doc.sheetsByIndex
          .filter((ws) => (ws.title.indexOf('-nopub') === -1)) // exclued sheets with -nopub switch
          .map((ws) => ws.getRows()
            .then((rows) => parseRows(rows, ws.title))
            .then((data) => ({
              title: ws.title,
              data,
            })));

        Promise.all(sheetPromises)
          .then((csvs) => {
            res.json({
              id: `${req.params.sheetID}`,
              ssid: `${doc.spreadsheetId}`,
              title: doc.title,
              sheets: csvs,
            });
          });
      })
      .catch((err) => {
        res.json({ error: `load info : ${err}` });
      });
  };
}
exports.sheetParser = sheetParser;

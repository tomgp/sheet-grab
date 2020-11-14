const { parseRows } = require('./parse-rows');

function sheetParser(doc, res, req) {
  return () => {
    doc.loadInfo()
      .then(() => {
        const sheetPromises = doc.sheetsByIndex
          .filter((ws) => (ws.title.indexOf('-nopub') === -1)) // exclued sheets with -nopub switch
          .map((ws) => ws.getRows()
            .then((rows) => ({
              title: ws.title,
              data: parseRows(rows, ws.title),
            })));

        Promise.all(sheetPromises)
          .then((csvs) => {
            res.json({
              ssid: `${doc.spreadsheetId}`,
              title: doc.title,
              sheets: csvs,
            });
          });
      })
      .catch((loadError) => {
        res.json({ error: `load info : ${loadError}` });
      });
  };
}
exports.sheetParser = sheetParser;

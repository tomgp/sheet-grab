const { parseRows } = require('./parse-rows');

function structureByTitle(sheets){
  const restructured = {};
  sheets.forEach((sheet)=>{
    restructured[sheet.title.replace(' -config', '')] = sheet.data;
  });
  return restructured;
}

function sheetParser(res, req, doc) {
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
          .then((sheets) => {
            res.json({
              ssid: `${doc.spreadsheetId}`,
              title: doc.title,
              sheets: structureByTitle(sheets),
            });
          });
      })
      .catch((loadError) => {
        res.json({ error: `load info : ${loadError}` });
      });
  };
}
exports.sheetParser = sheetParser;

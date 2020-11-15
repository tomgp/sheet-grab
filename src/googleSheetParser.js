const { csvFormat, csvParseRows } = require('d3-dsv');
const objectPath = require('object-path');

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

function structureRow(rowObj) {
  const entries = Object.entries(rowObj);
  const structured = {};
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    objectPath.set(structured, key, value);
  }
  return structured;
}

function parseRows(rows, title) {
  const sheetJSON = rows.reduce((acc, row) => {
    const cleanRow = {};
    const rowEntries = Object.entries(row);
    rowEntries.forEach(([key, value]) => {
      if (key.charAt(0) !== '_') {
        cleanRow[key] = value;
      }
    });
    acc.push(structureRow(cleanRow));
    return acc;
  }, []);
  if (title.indexOf('-config') > -1) {
    // slightly awkwardly converting the google sheet object to some plain JSON
    // then using d3 to format as a csv as god intended
    const pureRows = csvParseRows(csvFormat(sheetJSON));
    const configObject = {};
    pureRows.forEach((r) => {
      if (r[0].indexOf('.list') > 1) {
        const [key] = r[0].split('.');
        const values = r[1].split(',');
        configObject[key] = values;
      } else {
        configObject[r[0]] = r[1];
      }
    });
    return configObject;
  }
  return sheetJSON;
}

exports.googleSheetParser = sheetParser;

const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.API_KEY }).base('appJfcrndaPluRMco');
const table = base('Table 1');

function checkDatabase(eachPageCallback, doneCallback) {
  table.select({
    view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
    eachPageCallback(records, fetchNextPage);
  }, function done(err) {
    doneCallback(err);
  });
}

function removeFromDatabase(id, removeCallback) {
  table.destroy([id], function (err, deletedRecords) {
    if (err) {
      console.error(`There was an issue removing the user ID from the database: ${err}`);
      return;
    }

    removeCallback(deletedRecords);
  });
}

function addToDatabase(email, diningDate, fastPassDate, addCallback) {
  table.create([
    {
      "fields": {
        "Email": email,
        "Dining Date": diningDate,
        "FastPass Date": fastPassDate
      }
    }
  ], function (err, records) {
    if (err) {
      return res.send(`There was an issue writing to the database. Please try again later.`);
    }

    return addCallback();
  });
}

module.exports = {checkDatabase, removeFromDatabase, addToDatabase};
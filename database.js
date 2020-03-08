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

function addToDatabase(email, phone, diningDate, fastPassDate, localTime, localDiningDate, localFastPassDate, res, addCallback) {
  table.create([
    {
      "fields": {
        "Email": email,
        "Dining Date": diningDate,
        "FastPass Date": fastPassDate,
        "Local Time": localTime,
        "Local Dining Date": localDiningDate,
        "Local FastPass Date": localFastPassDate,
        "Phone": phone,
      }
    }
  ], function (err, records) {
    if (err) {
      return res.send(`There was an issue writing to the database: ${err}`);
    }

    return addCallback();
  });
}

module.exports = {checkDatabase, removeFromDatabase, addToDatabase};

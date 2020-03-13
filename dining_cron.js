require('dotenv').config({ path: __dirname + '/.env' });
const {checkDatabase} = require('./database');
const {dayBeforeDiningReminder, todayDiningReminder } = require('./send_email');
const momentTz = require('moment-timezone');
var moment = require('moment');

console.log('Dining cron job ran!');

// Check Airtable for any date matches
checkDatabase((records, fetchNextPage) => {
  // Today in UTC (with DST) when this runs at 10:00 UTC (6am EST)
  var today = momentTz().utc().format().split('T')[0];
  const dayBefore = moment(today).add(1, 'd').utc().format().split('T')[0];

  // Loop through records
  records.forEach(record => {
    if (record.get('Dining Date').includes(dayBefore)) {
      dayBeforeDiningReminder({
        id: record.getId(),
        email: record.get('Email'),
        phone: record.get('Phone'),
      });
    } else if (record.get('Dining Date').includes(today)) {
      todayDiningReminder({
        id: record.getId(),
        email: record.get('Email'),
        phone: record.get('Phone'),
      });
    }
  });

  fetchNextPage();

}, err => {
  if (err) {
    console.error(`There was an error when checking the database: ${err}`)
  }
});

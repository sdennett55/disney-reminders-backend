require('dotenv').config({ path: __dirname + '/.env' });
const {checkDatabase} = require('./database');
const {dayBeforeDiningReminder, todayDiningReminder, dayBeforeFastPassReminder, todayFastPassReminder } = require('./send_email');
const momentTz = require('moment-timezone');
var moment = require('moment');

console.log('Cron job ran!');

// Check Airtable for any date matches
checkDatabase((records, fetchNextPage) => {
  // Today in UTC when this runs at 12:00 UTC (7am EST)
  var today = momentTz().utc().format().split('T')[0];
  const dayBefore = moment(today).add(1, 'd').utc().format().split('T')[0];

  // Loop through records
  records.forEach(record => {
    console.log(`dayBefore: ${dayBefore} today: ${today} FastPass Date: ${record.get('FastPass Date')} Dining Date: ${record.get('Dining Date')}`);
    if (record.get('Dining Date').includes(dayBefore)) {
      dayBeforeDiningReminder({
        email: record.get('Email'),
        localTime: record.get("Local Time"),
      });
    } else if (record.get('Dining Date').includes(today)) {
      todayDiningReminder(record.get('Email'));
    } else if (record.get('FastPass Date').includes(dayBefore)) {
      dayBeforeFastPassReminder({
        email: record.get('Email'),
        localTime: record.get("Local Time")
      });
    } else if (record.get('FastPass Date').includes(today)) {
      todayFastPassReminder(record.get('Email'));
    }
  });

  fetchNextPage();

}, err => {
  if (err) {
    console.error(`There was an error when checking the database: ${err}`)
  }
});

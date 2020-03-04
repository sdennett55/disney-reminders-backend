require('dotenv').config({ path: __dirname + '/.env' });
const {checkDatabase} = require('./database');
const {dayBeforeDiningReminder, todayDiningReminder, dayBeforeFastPassReminder, todayFastPassReminder } = require('./send_email');

console.log('Cron job ran!');

// Check Airtable for any date matches
checkDatabase((records, fetchNextPage) => {
  var today = new Date();
  today.setHours(7, 0, 0, 0);
  const dayBefore = new Date(today.setDate(today.getDate() + 1));

  var formattedToday = today.toISOString();
  var formattedDayBefore = dayBefore.toISOString();

  // Loop through records
  records.forEach(record => {
    console.log(`formattedDayBefore: ${formattedDayBefore} formattedToday: ${formattedToday} FastPass Date: record.get('FastPass Date')`);
    if (record.get('Dining Date') === formattedDayBefore) {
      dayBeforeDiningReminder({
        email: record.get('Email'),
        localTime: record.get("Local Time"),
      });
    } else if (record.get('Dining Date') === formattedToday) {
      todayDiningReminder(record.get('Email'));
    } else if (record.get('FastPass Date') === formattedDayBefore) {
      dayBeforeFastPassReminder({
        email: record.get('Email'),
        localTime: record.get("Local Time")
      });
    } else if (record.get('FastPass Date') === formattedToday) {
      todayFastPassReminder(record.get('Email'));
    }
  });

  fetchNextPage();

}, err => {
  if (err) {
    console.error(`There was an error when checking the database: ${err}`)
  }
});

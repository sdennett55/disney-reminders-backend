require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cron = require('node-cron');
const bodyParser = require('body-parser');
const validator = require("email-validator");
const isValidDate = require('date-fns/isValid');
const parseISO = require('date-fns/parseISO');
const sendEmail = require('./send_email');
const { checkDatabase, removeFromDatabase, addToDatabase } = require('./database');

const environment = process.env.NODE_ENV;
// @TODO: Add production link here
const RELATIVE_PATH = environment === 'development' ? 'http://localhost:8000' : 'https://reminders.disneytoolkit.com';

// Routes
var app = express();

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

app.post('/api/submitEmail', function (req, res) {
  const { email, diningDate, fastPassDate } = req.body.user;

  // Validate the date and email
  if (!validator.validate(email)) {
    return res.send(`Your email is not valid.`);
  }
  if (!isValidDate(parseISO(diningDate))) {
    return res.send(`Your date is not valid.`);
  }
  if (!isValidDate(parseISO(fastPassDate))) {
    return res.send(`Your date is not valid.`);
  }

  // Check Airtable
  checkDatabase((records, fetchNextPage) => {
    // Check if email already exists in Airtable
    if (records.find(record => record.get('Email') === email)) {
      return res.send(`Email already exists in the database.`);
    }

    fetchNextPage();
  }, err => {
    if (err) {
      console.error(`There was an error when checking the database: ${err}`)
    }

    // Write User to the Airtable
    addToDatabase(email, diningDate, fastPassDate, () => {
      // Send confirmation email
      sendEmail({
        to: email,
        subject: 'Confirmation for Disney Reservations Reminder!',
        body: `Thanks for signing up! <br/><br/> This is just a confirmation email to let you know that ${email} will be receiving an email 24 hours before it's time to make Dining Reservations on ${diningDate} and on the morning of.<br/><br/> You will also be receiving an email 24 hours before it's time to make FastPass Reservations on ${fastPassDate} and on the morning of.  <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe?email=${email}">unsubscribe</a> at any time.`
      }).then(successMessage => {
        console.log(successMessage);
        return res.send(`Success!`);
      }).catch(error => {
        console.error(`There was an issue sending the confirmation email: ${error}`);
      });
    });
  });


});

app.get('/api/unsubscribe', function (req, res) {
  const { email } = req.query;

  // Find ID in the Airtable
  checkDatabase((records, fetchNextPage) => {
    var emailMatch = records.find(record => record.get('Email') === email);
    var id = emailMatch ? emailMatch.getId() : null;

    // If no ID matches yet, keep looking
    if (!id) {
      fetchNextPage();
    } else {
      // Remove ID from Airtable
      removeFromDatabase(id, deletedRecords => {
        console.log('Deleted', deletedRecords.length, 'records');
        // Send success message
        return res.send(`${email} has been successfully unsubscribed!`);
      });
    }
  }, err => {
    if (err) {
      console.error(`There was an issue finding the user ID in the database: ${err}`)
    }

    return res.send('This email does not currently exist in the database.');
  });

});

// Check everyday at 6am for Dates
cron.schedule('0 6 * * *', () => {
  // If it's the day before it's time to book Dining Reservations, send an email.

  // Check Airtable
  checkDatabase((records, fetchNextPage) => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const dayBefore = new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0];
    
    // Check if diningDate is the day before
    if (records.find(record => record.get('Dining Date') === dayBefore && record.get('FastPass Date') === dayBefore))  {
      // send combinedDayBeforeReminder to record.get('Email') and removeFromDatabase the record.getId()
    } else if (records.find(record => record.get('Dining Date') === formattedToday && record.get('FastPass Date') === formattedToday)) {
      // send combinedTodayReminder to record.get('Email') and removeFromDatabase the record.getId()
    } else if (records.find(record => record.get('Dining Date') === dayBefore)) {
      // send dayBeforeDiningReminder to record.get('Email') and removeFromDatabase the record.getId()
    } else if (records.find(record => record.get('Dining Date') === formattedToday)) {
      // send todayDiningReminder to record.get('Email') and removeFromDatabase the record.getId()
    } else if (records.find(record => record.get('FastPass Date') === dayBefore)) {
      // send dayBeforeFastPassReminder to record.get('Email') and removeFromDatabase the record.getId()
    } else if (records.find(record => record.get('FastPass Date') === formattedToday)) {
      // send todayFastPassReminder to record.get('Email') and removeFromDatabase the record.getId()
    }

    fetchNextPage();
  }, err => {
    if (err) {
      console.error(`There was an error when checking the database: ${err}`)
    }

    // Write User to the Airtable
    addToDatabase(email, diningDate, fastPassDate, () => {
      // Send confirmation email
      sendEmail({
        to: email,
        subject: 'Reminder to make Dining Reservations tommorrow!',
        body: `Thanks for signing up! <br/><br/> This is just a confirmation email to let you know that ${email} will be receiving an email 24 hours before it's time to make Dining Reservations on ${diningDate} and on the morning of.<br/><br/> You will also be receiving an email 24 hours before it's time to make FastPass Reservations on ${fastPassDate} and on the morning of.  <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe?email=${email}">unsubscribe</a> at any time.`
      }).then(successMessage => {
        console.log(successMessage);
        return res.send(`Success!`);
      }).catch(error => {
        console.error(`There was an issue sending the confirmation email: ${error}`);
      });
    });
  });
});

app.listen(process.env['PORT'], () => console.log(`Example app listening on port ${process.env['PORT']}!`))
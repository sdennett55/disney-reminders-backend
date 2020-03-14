require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const validator = require("email-validator");
const isValidDate = require('date-fns/isValid');
const parseISO = require('date-fns/parseISO');
const {sendEmail} = require('./send_email');
const sendText = require('./send_text');
const { checkDatabase, removeFromDatabase, addToDatabase } = require('./database');
const cors = require('cors');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const Sentry = require('@sentry/node'); // white space add
Sentry.init({ dsn: 'https://d4e891bb61ad4db29a96263feffd48fe@sentry.io/3357421' });

const environment = process.env.NODE_ENV;
const RELATIVE_PATH = environment === 'development' ? 'http://localhost:8000' : 'https://disney-reminders-backend.herokuapp.com';

// Routes
var app = express();

app.use(cors());

app.use(helmet());

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

app.post('/api/submitEmail', function (req, res) {
  const { email, phone, diningDate, fastPassDate, localTime, localDiningDate, localFastPassDate } = req.body.user;

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
  if (phone && !phoneUtil.isValidNumber(phoneUtil.parse('+' + phone))) {
    return res.send(`Your phone number is not valid.`);
  }

  // Check Airtable
  checkDatabase((records, fetchNextPage) => {
    // Check if email already exists in Airtable
    if (records.find(record => record.get('Email') === email)) {
      return res.send(`Email already exists in the database.`);
    }

    fetchNextPage();
  }, (err, records) => {
    if (err) {
      console.error(`There was an error when checking the database: ${err}`)
    }

    // Write User to the Airtable
    addToDatabase(email, phone, diningDate, fastPassDate, localTime, localDiningDate, localFastPassDate, res, (records) => {
      const id = records.find(record => record.get('Email') === email).getId();

      // Send confirmation text
      if (phone) {
        sendText({phone, text: `Confirmation from DisneyTookit that you will receive a text on this number!
        \n\nDining Reservations: ${localDiningDate} at 6am ET
        \nFastPass+ Reservations: ${localFastPassDate} at 7am ET
        \n\nGo here to unsubscribe at any time: ${RELATIVE_PATH}/api/unsubscribe/${id}`});
      }

      // Send confirmation email
      sendEmail({
        to: email,
        subject: 'Confirmation for Disney Reservations Reminder!',
        body: `Thanks for signing up! <br/><br/> This is just a confirmation email to let you know that ${email} will be receiving an email 24 hours before it's time to make Dining Reservations on ${localDiningDate} and on the morning of.<br/><br/> You will also be receiving an email 24 hours before it's time to make FastPass Reservations on ${localFastPassDate} and on the morning of.  <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe/${id}">unsubscribe</a> at any time.`
      }).then(successMessage => {
        console.log(successMessage);
        return res.send(`Success!`);
      }).catch(error => {
        console.error(`There was an issue sending the confirmation email: ${error}`);
      });
    });
  });


});

app.get('/api/unsubscribe/:id', function (req, res) {
  const { id } = req.params;

  // Find ID in the Airtable
  checkDatabase((records, fetchNextPage) => {
    var idMatch = records.find(record => record.getId() === id);

    // If no ID matches yet, keep looking
    if (!idMatch) {
      fetchNextPage();
    } else {
      // Remove ID from Airtable
      removeFromDatabase(id, deletedRecords => {
        console.log('Deleted', deletedRecords.length, 'records');
        // Send success message
        return res.send(`User with email ${idMatch.get('Email')} has been successfully unsubscribed!`);
      });
    }
  }, err => {
    if (err) {
      console.error(`There was an issue finding the user ID in the database: ${err}`)
    }

    return res.send('This user does not currently exist in the database.');
  });

});

app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`))

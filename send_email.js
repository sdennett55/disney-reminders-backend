require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const sendText = require("./send_text");

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken();

const environment = process.env.NODE_ENV;
const RELATIVE_PATH =
  environment === "development"
    ? "http://localhost:8000"
    : "https://disney-reminders-backend.herokuapp.com";

function sendEmail({ to, subject, body }) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "disneytoolkit@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    var mailOptions = {
      from: "disneytoolkit@gmail.com",
      to,
      subject,
      html: body
    };

    transporter.sendMail(
      mailOptions,
      function(error, info) {
        if (error) {
          reject(error);
        } else {
          resolve(`Email sent to ${to}:` + info.response);
        }
      },
      {
        scheduled: true,
        timezone: "America/New_York"
      }
    );
  });
}

function dayBeforeDiningReminder({id, email, phone }) {
  if (phone) {
    sendText({
      phone,
      text: `Reminder to make your Disney Dining Reservations tommorrow at 7am EST! \n\nGo here to unsubscribe at any time: ${RELATIVE_PATH}/api/unsubscribe/${id}`
    });
  }
  return sendEmail({
    to: email,
    subject: "Reminder to make your Disney Dining Reservations tommorrow!",
    body: `Tomorrow at 7am EST you can start booking your Dining Reservations for your trip to Walt Disney World! <br/><br/>Make sure to set an alarm so you can start booking right away! We will send you a courtesy email in the morning, as well. Good luck!

    <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe/${id}">unsubscribe</a> at any time.`
  })
    .then(successMessage => {
      console.log(successMessage);
    })
    .catch(error => {
      console.error(
        `There was an issue sending the dining reminder email: ${error}`
      );
    });
}

function todayDiningReminder({id, email, phone }) {
  if (phone) {
    sendText({
      phone,
      text: `Reminder to make your Disney Dining Reservations today! \n\nhttps://disneyworld.disney.go.com/dining/ \n\nGo here to unsubscribe at any time: ${RELATIVE_PATH}/api/unsubscribe/${id}`
    });
  }
  return sendEmail({
    to: email,
    subject: "Reminder to make your Advanced Dining Reservations TODAY!",
    body: `Today, starting now, you can begin making your Dining Reservations for your trip to Walt Disney World! Good luck! <br/><br/>Dining Reservations: <a href="https://disneyworld.disney.go.com/dining/">https://disneyworld.disney.go.com/dining/</a>

    <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe/${id}">unsubscribe</a> at any time.`
  })
    .then(successMessage => {
      console.log(successMessage);
    })
    .catch(error => {
      console.error(
        `There was an issue sending the day of dining reminder email: ${error}`
      );
    });
}

function dayBeforeFastPassReminder({id, email, phone }) {
  if (phone) {
    sendText({
      phone,
      text: `Reminder to make your FastPass+ Reservations tommorrow at 7am EST! \n\nGo here to unsubscribe at any time: ${RELATIVE_PATH}/api/unsubscribe/${id}`
    });
  }
  return sendEmail({
    to: email,
    subject: "Reminder to book your Disney FastPass+ reservations tommorrow!",
    body: `Tomorrow at 7am EST you can start booking your FastPass+ Reservations for your trip to Walt Disney World!<br/><br/> Make sure to set an alarm so you can start booking right away! We will send you a courtesy email in the morning as well. Good luck!

    <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe/${id}">unsubscribe</a> at any time.`
  })
    .then(successMessage => {
      console.log(successMessage);
    })
    .catch(error => {
      console.error(
        `There was an issue sending the FastPass reminder email: ${error}`
      );
    });
}

function todayFastPassReminder({id, email, phone }) {
  if (phone) {
    sendText({
      phone,
      text: `Reminder to make your Disney Dining Reservations today! \n\nhttps://disneyworld.disney.go.com/fastpass-plus/select-party/ \n\nGo here to unsubscribe at any time: ${RELATIVE_PATH}/api/unsubscribe/${id}`
    });
  }
  return sendEmail({
    to: email,
    subject: "Reminder to make your FastPass+ Reservations TODAY!",
    body: `Today, starting now, you can begin making your FastPass+ Reservations for your trip to Walt Disney World! Good luck! <br/><br/>FastPass Reservations: <a href="https://disneyworld.disney.go.com/fastpass-plus/select-party/">https://disneyworld.disney.go.com/fastpass-plus/select-party/</a>

    <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe/${id}">unsubscribe</a> at any time.`
  })
    .then(successMessage => {
      console.log(successMessage);
    })
    .catch(error => {
      console.error(
        `There was an issue sending the day of dining reminder email: ${error}`
      );
    });
}

module.exports = {
  sendEmail,
  dayBeforeDiningReminder,
  todayDiningReminder,
  dayBeforeFastPassReminder,
  todayFastPassReminder
};

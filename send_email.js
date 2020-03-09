var nodemailer = require("nodemailer");
const sendText = require("./send_text");

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
        user: "disneytoolkit@gmail.com",
        pass: process.env["EMAIL_PASSWORD"]
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

function dayBeforeDiningReminder({ email, phone }) {
  if (phone) {
    sendText({
      phone,
      text: `Reminder to make your Disney Dining Reservations tommorrow at 7am EST!`
    });
  }
  return sendEmail({
    to: email,
    subject: "Reminder to make your Disney Dining Reservations tommorrow!",
    body: `Tomorrow at 7am EST you can start booking your Dining Reservations for your trip to Walt Disney World! <br/><br/>Make sure to set an alarm so you can start booking right away! We will send you a courtesy email in the morning, as well. Good luck!

    <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe?email=${email}">unsubscribe</a> at any time.`
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

function todayDiningReminder({ email, phone }) {
  if (phone) {
    sendText({
      phone,
      text: `Reminder to make your Disney Dining Reservations today!`
    });
  }
  return sendEmail({
    to: email,
    subject: "Reminder to make your Advanced Dining Reservations TODAY!",
    body: `Today, starting now, you can begin making your Dining Reservations for your trip to Walt Disney World! Good luck! <br/><br/>Dining Reservations: <a href="https://disneyworld.disney.go.com/dining/">https://disneyworld.disney.go.com/dining/</a>

    <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe?email=${email}">unsubscribe</a> at any time.`
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

function dayBeforeFastPassReminder({ email, phone }) {
  if (phone) {
    sendText({
      phone,
      text: `Reminder to make your FastPass+ Reservations tommorrow at 7am EST!`
    });
  }
  return sendEmail({
    to: email,
    subject: "Reminder to book your Disney FastPass+ reservations tommorrow!",
    body: `Tomorrow at 7am EST you can start booking your FastPass+ Reservations for your trip to Walt Disney World!<br/><br/> Make sure to set an alarm so you can start booking right away! We will send you a courtesy email in the morning as well. Good luck!

    <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe?email=${email}">unsubscribe</a> at any time.`
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

function todayFastPassReminder({ email, phone }) {
  if (phone) {
    sendText({
      phone,
      text: `Reminder to make your Disney Dining Reservations today!`
    });
  }
  return sendEmail({
    to: email,
    subject: "Reminder to make your FastPass+ Reservations TODAY!",
    body: `Today, starting now, you can begin making your FastPass+ Reservations for your trip to Walt Disney World! Good luck! <br/><br/>FastPass Reservations: <a href="https://disneyworld.disney.go.com/fastpass-plus/select-party/">https://disneyworld.disney.go.com/fastpass-plus/select-party/</a>

    <br/><br/>Please feel free to <a href="${RELATIVE_PATH}/api/unsubscribe?email=${email}">unsubscribe</a> at any time.`
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

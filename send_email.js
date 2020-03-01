var nodemailer = require('nodemailer');

function sendEmail({ to, subject, body }) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'waitupgame@gmail.com',
        pass: process.env['EMAIL_PASSWORD']
      }
    });
  
    var mailOptions = {
      from: 'waitupgame@gmail.com',
      to,
      subject,
      html: body
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        resolve('Email sent: ' + info.response);
      }
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    });
  })
}

module.exports = sendEmail;
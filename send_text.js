require("dotenv").config({ path: __dirname + "/.env" });
const Nexmo = require("nexmo");

// Texting
const nexmo = new Nexmo({
  apiKey: process.env.TEXT_API_KEY,
  apiSecret: process.env.TEXT_API_SECRET
});

function sendText({ phone, text }) {
  const from = "18018933628";

  nexmo.message.sendSms(from, phone, text, (err, responseData) => {
    if (err) {
      console.log(err);
    } else {
      if (responseData.messages[0]["status"] === "0") {
        console.log("Message sent successfully.");
      } else {
        console.log(
          `Message failed with error: ${responseData.messages[0]["error-text"]}`
        );
      }
    }
  });
}

module.exports = sendText;

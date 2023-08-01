// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const dotenv = require('dotenv');
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);


client.messages
  .create({
     body: 'Lets try $3 and also Thursday at 3pm',
     from: process.env.TWILIO_PHONE_NUMBER,
     to: process.env.PERSONAL_PHONE_NUMBER
   })
  .then(message => console.log(message.sid));
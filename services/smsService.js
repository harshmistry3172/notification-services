require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_SID; 
const authToken = process.env.TWILIO_TOKEN;
const client = twilio(accountSid, authToken);

// Send SMS
const sendSMS = async (to, body) => {
  try {
    await client.messages.create({
      body,          
      from: process.env.TWILIO_NUMBER, 
      to: to,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
};

module.exports = { sendSMS };

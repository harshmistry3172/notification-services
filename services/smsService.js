require('dotenv').config();
const twilio = require('twilio');

// Twilio credentials (replace with your actual Account SID and Auth Token)
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
    console.log('SMS sent');
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS');
  }
};

module.exports = { sendSMS };

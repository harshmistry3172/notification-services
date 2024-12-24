require('dotenv').config();
const nodemailer = require('nodemailer');

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Email
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, 
      to,
      subject,
      text,
    });
    console.log('Email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendEmail };

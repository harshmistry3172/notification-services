const nodemailer = require('nodemailer');

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'harshmistry3172@gmail.com',
    pass: 'asmh nsmx uakq xkby',
  },
});

// Send Email
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: 'mistry.hh31@gmail.com',
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

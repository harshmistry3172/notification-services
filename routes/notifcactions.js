const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const router = express.Router();
require('dotenv').config();

// Send Notification to the user
router.post('/notifications', async (req, res) => {
    try {
      const { userId, type, content } = req.body;
  
      // Find the user to get their email
      const user = await User.findOne({ email: userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Create the notification
      const notification = new Notification({
        userId: user._id,
        type,
        content,
        status: 'pending',  
      });
      await notification.save();
  
      // Send email if the notification type is 'email'
      if (type === 'email') {
        const subject = content.subject;
        const text = content.text;
        try {
          await sendEmail(user.email, subject, text);
          notification.status = 'sent';
          await notification.save();
          res.status(201).json({ message: 'Notification created and email sent successfully', notification });
        } catch (emailError) {
          notification.status = 'failed';
          await notification.save();
          res.status(500).json({ error: 'Error sending email: ' + emailError.message });
        }
      }
      else if (type === 'sms') {  
        try {
            // console.log(user.phone, content.text);
          await sendSMS(user.phone, content.text);
          notification.status = 'sent';
          await notification.save();
          res.status(201).json({ message: 'Notification created and SMS sent successfully', notification });
        } catch (smsError) {
          await notification.save();
          res.status(500).json({ error: 'Error sending SMS: ' + smsError.message });
        }
      }  else {
        // If notification is not email, just return the notification
        res.status(201).json({ message: 'Notification created with pending status', notification });
      }
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



// Get User Notifications
router.get('/users/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params;
    const notifications = await Notification.find({ userId: id });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



//Add Sample User Data
router.post('/users', async (req, res) => {
    try {
      const { name, email, phone } = req.body;
  
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }
  
      // Create a new user
      const user = new User({ name, email, phone });
      await user.save();
  
      res.status(201).json({ message: 'User added successfully.', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;

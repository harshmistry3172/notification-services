// routes/notifications.js
const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendNotificationToKafka = require('../kafka/kafkaProducer'); // Import Kafka producer
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const { sendInAppNotification } = require('../services/inAppNotifyService');
const router = express.Router();

// Send Notification to the user
router.post('/notifications', async (req, res) => {
  try {
    const { userId, type, content } = req.body;
    console.log(userId, type, content);

    const user = await User.findOne({ email: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = new Notification({
      userId: user._id,
      type,
      content,
      status: 'pending',
    });

    await notification.save();
    await sendNotificationToKafka(
      {
        userId: user._id,
        type,
        content,
        status: 'pending',
        _id: notification._id,
      }, type
    );
    res.status(201).json({ message: 'Notification created and enqueued for processing', notification });
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

// Add Sample User Data
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

// Update socket id in User Data
router.put('/users/:email/socketId', async (req, res) => {
  try {
    const { email } = req.params;
    const { socketId } = req.body;

    if (!socketId) {
      return res.status(400).json({ message: 'socketId is required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update socketId
    user.socketId = socketId;
    await user.save();

    res.status(200).json({ message: 'Socket ID updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

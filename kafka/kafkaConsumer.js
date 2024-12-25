const { Kafka } = require('kafkajs');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKER],
});

const emailConsumer = kafka.consumer({ groupId: 'email-consumers' });
const smsConsumer = kafka.consumer({ groupId: 'sms-consumers' });

const dbUri = process.env.MONGO_URI;
mongoose
  .connect(dbUri)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// Generic function to process notifications
async function processNotification(message, type) {
  const notification = JSON.parse(message.value.toString());
  const { userId, content } = notification;
  const user = await User.findById(userId);

  if (!user) {
    console.error('User not found');
    return;
  }

  let status = 'failed';
  try {
    if (type === 'email') {
      await sendEmail(user.email, content.subject, content.text);
    } else if (type === 'sms') {
      await sendSMS(user.phone, content.text);
    }
    status = 'sent';

    await Notification.findByIdAndUpdate(notification._id, { status });
    console.log(`${type} notification processed and status updated`);
  } catch (error) {
    console.error(`Error processing ${type} notification:`, error);
  }
}

// Run Email Consumer
async function runEmailConsumer() {
  await emailConsumer.connect();
  await emailConsumer.subscribe({ topics:[ process.env.EMAIL_TOPIC], fromBeginning: true });

  await emailConsumer.run({
    eachMessage: async ({ message }) => {
      await processNotification(message, 'email');
    },
  });
}

// Run SMS Consumer
async function runSmsConsumer() {
  await smsConsumer.connect();
  await smsConsumer.subscribe({ topics: [process.env.SMS_TPOIC], fromBeginning: true });

  await smsConsumer.run({
    eachMessage: async ({ message }) => {
      await processNotification(message, 'sms');
    },
  });
}

// Start Consumers
runEmailConsumer().catch(console.error);
runSmsConsumer().catch(console.error);

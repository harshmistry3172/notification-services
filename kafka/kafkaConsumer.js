const { Kafka } = require('kafkajs');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendInAppNotification } = require('../services/inAppNotifyService');
const { getIO } = require('../config/socket');

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKER],
});

const emailConsumer = kafka.consumer({ groupId: 'email-consumers' });
const smsConsumer = kafka.consumer({ groupId: 'sms-consumers' });
const inappConsumer = kafka.consumer({ groupId: 'inapp-consumers' });

async function processNotification(message, type, io) {
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
    } else {
      await sendInAppNotification(user.socketId,content.text,io)
    }
    status = 'sent';

    await Notification.findByIdAndUpdate(notification._id, { status });
    console.log(`${type} notification processed and status updated`);
  } catch (error) {
    console.error(`Error processing ${type} notification:`, error);
  }
}

// Run Email Consumer
async function runEmailConsumer(io) {
  await emailConsumer.connect();
  await emailConsumer.subscribe({ topics: [process.env.EMAIL_TOPIC], fromBeginning: true });

  await emailConsumer.run({
    eachMessage: async ({ message }) => {
      await processNotification(message, 'email', io);  // Pass io to the processNotification function
    },
  });
}

// Run SMS Consumer
async function runSmsConsumer(io) {
  await smsConsumer.connect();
  await smsConsumer.subscribe({ topics: [process.env.SMS_TOPIC], fromBeginning: true });

  await smsConsumer.run({
    eachMessage: async ({ message }) => {
      await processNotification(message, 'sms', io);  // Pass io to the processNotification function
    },
  });
}

// Run In-App Consumer
async function runInAppConsumer(io) {
  await inappConsumer.connect();
  await inappConsumer.subscribe({ topics: [process.env.IN_APP_TOPIC], fromBeginning: true });

  await inappConsumer.run({
    eachMessage: async ({ message }) => {
      await processNotification(message, 'in-app', io);  // Pass io to the processNotification function
    },
  });
}

module.exports = { runEmailConsumer, runSmsConsumer, runInAppConsumer };

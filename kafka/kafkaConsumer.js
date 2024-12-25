// kafka/kafkaConsumer.js
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

const consumer = kafka.consumer({ groupId: 'notification-consumers' });

const dbUri = process.env.MONGO_URI;
mongoose
  .connect(dbUri)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const notification = JSON.parse(message.value.toString()); 
      const { userId, type, content } = notification;
    console.log("HEllo", notification);
    const userIdObject = new mongoose.Types.ObjectId(userId);

    // Use the ObjectId in your query
    const user = await User.findById(userIdObject);
      // const user = await User.findById(mongoose.Types.ObjectId(userId));
      if (!user) {
        console.error('User not found');
        return;
      }

      let status = 'failed';
      try {
        if (type === 'email') {
          await sendEmail(user.email, content.subject, content.text);
          status = 'sent';
        } else if (type === 'sms') {
          await sendSMS(user.phone, content.text);
          status = 'sent';
        } else if (type === 'in-app') {
          // Implement in-app notification logic here
          status = 'sent';
        }
        
        // Update the notification status in the database
        await Notification.findByIdAndUpdate(notification._id, { status });
        console.log('Notification processed and status updated');
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    },
  });
}

run().catch(console.error);

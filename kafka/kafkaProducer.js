const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

async function sendNotificationToKafka(notification) {
  await producer.connect();
  try {
    await producer.send({
      topic: process.env.KAFKA_TOPIC, 
      messages: [
        {
          value: JSON.stringify(notification),
        },
      ],
    });
    console.log('Notification sent to Kafka');
  } catch (err) {
    console.error('Error sending notification to Kafka:', err);
  }
}

module.exports = sendNotificationToKafka;

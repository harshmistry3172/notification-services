const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

async function sendNotificationToKafka(notification, type) {
  const topic = type === 'email' ? process.env.EMAIL_TOPIC : process.env.SMS_TPOIC; // Choose the correct topic
  console.log(topic);
  await producer.connect();
  try {
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(notification),
        },
      ],
    });
    console.log(`Notification sent to Kafka topic: ${topic}`);
  } catch (err) {
    console.error('Error sending notification to Kafka:', err);
  }
}

module.exports = sendNotificationToKafka;

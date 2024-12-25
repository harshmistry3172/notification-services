const { getIO } = require('../config/socket');

const sendInAppNotification = async (socketId, message, io) => {
  try {
    await io.to(socketId).emit('new-notification', message);
  } catch (error) {
    console.error('Error sending in-app notification:', error);
  }
};


module.exports = { sendInAppNotification };

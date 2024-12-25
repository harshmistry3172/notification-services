const { getIO } = require('../config/socket');

/**
 * Sends an in-app notification to the specified user.
 * @param {string} socketId - The socket ID of the user to send the notification to.
 * @param {string} message - The notification message to send.
 */
const sendInAppNotification = async (socketId, message, io) => {
  try {
    await io.to(socketId).emit('new-notification', message);
  } catch (error) {
    console.error('Error sending in-app notification:', error);
  }
};


module.exports = { sendInAppNotification };

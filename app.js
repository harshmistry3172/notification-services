const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notifcactions');
const cors = require('cors');
require('dotenv').config();
const { initSocket, getIO } = require('./config/socket'); // Import socket initialization
const { runEmailConsumer, runSmsConsumer, runInAppConsumer } = require('./kafka/kafkaConsumer');
const connectDB = require('./config/dbconfig');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas Connection
connectDB();

// Initialize Socket.IO
const server = require('http').createServer(app);
initSocket(server);

// Routes
app.use('/api', notificationRoutes);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const io = getIO();

runEmailConsumer(io).catch((error) => {
  console.error('Error starting Email Consumer:', error);
});
runSmsConsumer(io).catch((error) => {
  console.error('Error starting SMS Consumer:', error);
});
runInAppConsumer(io).catch((error) => {
  console.error('Error starting In-App Consumer:', error);
});
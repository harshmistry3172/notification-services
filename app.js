const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notifcactions');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas Connection
const dbUri = process.env.MONGO_URI;
mongoose
  .connect(dbUri)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

// Routes
app.use('/api', notificationRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

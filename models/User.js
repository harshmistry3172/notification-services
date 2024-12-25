const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String},
  email: { type: String , required: true },
  phone: { type: String },
  socketId: { type: String }
});

module.exports = mongoose.model('User', userSchema);
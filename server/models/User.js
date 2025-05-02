const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  userType: { type: String, enum: ['admin', 'driver'], required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

  const accountLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleNo: { type: String, required: true },
    reason: { type: String, required: true },
    cost: { type: Number, required: true },
    date: { type: Date, required: true },
  });

  module.exports = mongoose.model('AccountLog', accountLogSchema);
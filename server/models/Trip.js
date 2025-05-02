const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleNo: { type: String, required: true },
  initialKm: { type: Number, required: true },
  finalKm: { type: Number, required: true },
  pricePerKm: { type: Number, required: true },
  kmDriven: { type: Number, required: true },
  totalCharges: { type: Number, required: true },
  time: { type: Date, required: true },
});

module.exports = mongoose.model('Trip', tripSchema);
const mongoose = require('mongoose');

const mileageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleNo: { type: String, required: true },
  initialKm: { type: Number, required: true },
  finalKm: { type: Number, required: true },
  distance: { type: Number, required: true },
  fuelUsed: { type: Number, required: true },
  mileage: { type: Number, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model('Mileage', mileageSchema);
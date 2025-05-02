const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Mileage = require('../models/Mileage');
const Trip = require('../models/Trip');

router.post('/mileage', auth, async (req, res) => {
  console.log('Received mileage data:', req.body);
  console.log('User from auth:', req.user);

  const { vehicleNo, initialKm, finalKm, distance, fuelUsed, mileage, date } = req.body;

  if (!vehicleNo || !date || initialKm == null || finalKm == null || distance == null || fuelUsed == null || mileage == null) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (typeof initialKm !== 'number' || typeof finalKm !== 'number' || typeof distance !== 'number' || typeof fuelUsed !== 'number' || typeof mileage !== 'number') {
    return res.status(400).json({ message: 'Numeric fields must be numbers' });
  }

  if (initialKm < 0 || finalKm < 0 || distance < 0 || fuelUsed <= 0 || mileage <= 0) {
    return res.status(400).json({ message: 'Numeric fields must be positive (fuelUsed and mileage must be greater than 0)' });
  }

  try {
    const newMileage = new Mileage({
      user: req.user.id,
      vehicleNo,
      initialKm,
      finalKm,
      distance,
      fuelUsed,
      mileage,
      date: new Date(date),
    });
    console.log('Mileage object to save:', newMileage);
    await newMileage.save();
    res.json({ message: 'Mileage data saved successfully' });
  } catch (err) {
    console.error('Detailed error saving mileage:', err);
    res.status(500).json({ message: 'Server error while saving mileage data', error: err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  console.log('Accessing /history route');
  console.log('User from auth:', req.user);
  try {
    const mileage = await Mileage.find({ user: req.user.id }).select('vehicleNo date distance fuelUsed mileage -_id').lean();
    const trips = await Trip.find({ user: req.user.id }).select('vehicleNo time initialKm finalKm kmDriven totalCharges -_id').lean();

    const history = [
      ...mileage.map(entry => ({
        date: entry.date,
        type: 'Mileage',
        details: `Vehicle: ${entry.vehicleNo}, Distance: ${entry.distance} km, Fuel: ${entry.fuelUsed} L, Mileage: ${entry.mileage} km/L`,
      })),
      ...trips.map(entry => ({
        date: entry.time,
        type: 'Trip',
        details: `Vehicle: ${entry.vehicleNo}, Initial KM: ${entry.initialKm}, Final KM: ${entry.finalKm}, Distance: ${entry.kmDriven} km, Total Amount: ₹${entry.totalCharges}`,
      })),
    ];

    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log('History data to send:', history);

    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Server error while fetching history', error: err.message });
  }
});

module.exports = router;
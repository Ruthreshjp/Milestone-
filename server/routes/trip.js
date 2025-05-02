const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');

// Removed any incorrect imports like: const mileage = require('../routes/mileage');

router.post('/trip', auth, async (req, res) => {
  console.log('Received trip data:', req.body);
  console.log('User from auth:', req.user);

  const { vehicleNo, initialKm, finalKm, pricePerKm, kmDriven, totalCharges, time } = req.body;

  if (!vehicleNo || !initialKm || !finalKm || !pricePerKm || !kmDriven || !totalCharges || !time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (
    typeof initialKm !== 'number' || initialKm < 0 ||
    typeof finalKm !== 'number' || finalKm < 0 ||
    typeof pricePerKm !== 'number' || pricePerKm <= 0 ||
    typeof kmDriven !== 'number' || kmDriven < 0 ||
    typeof totalCharges !== 'number' || totalCharges < 0
  ) {
    return res.status(400).json({ message: 'Numeric fields must be positive (pricePerKm must be greater than 0)' });
  }

  try {
    const newTrip = new Trip({
      user: req.user.id,
      vehicleNo,
      initialKm,
      finalKm,
      pricePerKm,
      kmDriven,
      totalCharges,
      time: new Date(time),
    });
    console.log('Trip object to save:', newTrip);
    await newTrip.save();
    res.json({ message: 'Trip data saved successfully' });
  } catch (err) {
    console.error('Detailed error saving trip:', err);
    res.status(500).json({ message: 'Server error while saving trip data', error: err.message });
  }
});

module.exports = router;
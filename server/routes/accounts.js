const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AccountLog = require('../models/AccountLog');
const Trip = require('../models/Trip');

router.post('/accountlog', auth, async (req, res) => {
  console.log('Received account log data:', req.body);
  console.log('User from auth:', req.user);

  const { vehicleNo, reason, cost } = req.body;

  if (!vehicleNo || !reason || !cost) {
    return res.status(400).json({ message: 'Vehicle number, reason, and cost are required' });
  }

  const costNum = parseFloat(cost);
  if (isNaN(costNum) || costNum <= 0) {
    return res.status(400).json({ message: 'Cost must be a positive number' });
  }

  try {
    const newLog = new AccountLog({
      user: req.user.id,
      vehicleNo,
      reason,
      cost: costNum,
      date: new Date(),
    });
    console.log('Account log to save:', newLog);
    await newLog.save();
    res.json({ message: 'Expense saved successfully' });
  } catch (err) {
    console.error('Detailed error adding expense:', err);
    res.status(500).json({ message: 'Server error while adding expense', error: err.message });
  }
});

router.get('/accountlog', auth, async (req, res) => {
  console.log('Fetching account logs for user:', req.user);
  try {
    const logs = await AccountLog.find({ user: req.user.id }).select('vehicleNo reason cost date -_id').lean();
    console.log('Fetched account logs:', logs);
    res.json(logs);
  } catch (err) {
    console.error('Detailed error fetching account logs:', err);
    res.status(500).json({ message: 'Server error while fetching account logs', error: err.message });
  }
});

router.get('/accountlog/summary', auth, async (req, res) => {
  console.log('Fetching account log summary for user:', req.user);
  const { period = 'monthly' } = req.query; // Default to monthly, can be 'monthly' or 'yearly'
  const now = new Date();
  let startDate;

  if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
  } else if (period === 'yearly') {
    startDate = new Date(now.getFullYear(), 0, 1); // Start of current year
  } else {
    return res.status(400).json({ message: 'Invalid period. Use "monthly" or "yearly"' });
  }

  try {
    // Fetch expenses from AccountLog
    const expenses = await AccountLog.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).select('cost date -_id').lean();
    const totalExpense = expenses.reduce((sum, log) => sum + log.cost, 0);

    // Fetch income from Trip (totalCharges as income)
    const trips = await Trip.find({
      user: req.user.id,
      time: { $gte: startDate }
    }).select('totalCharges time -_id').lean();
    const totalIncome = trips.reduce((sum, trip) => sum + trip.totalCharges, 0);

    // Calculate profit/loss
    const profitLoss = totalIncome - totalExpense;

    // Prepare detailed logs for display
    const detailedLogs = [
      ...expenses.map(log => ({
        date: log.date,
        type: 'Expense',
        details: `Cost: ₹${log.cost.toFixed(2)} on ${new Date(log.date).toLocaleDateString()}`,
      })),
      ...trips.map(trip => ({
        date: trip.time,
        type: 'Income',
        details: `Trip Income: ₹${trip.totalCharges.toFixed(2)} on ${new Date(trip.time).toLocaleDateString()}`,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      logs: detailedLogs,
      summary: {
        totalExpense: totalExpense.toFixed(2),
        totalIncome: totalIncome.toFixed(2),
        profitLoss: profitLoss.toFixed(2),
      },
    });
  } catch (err) {
    console.error('Detailed error fetching account log summary:', err);
    res.status(500).json({ message: 'Server error while fetching account log summary', error: err.message });
  }
});

module.exports = router;
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  vehicleNo: { type: String, required: true },
  reason: { type: String, required: true },
  cost: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);
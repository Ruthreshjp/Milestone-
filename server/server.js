require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mileageRoutes = require('./routes/mileage');
const accountRoutes = require('./routes/accounts');
const usersRoutes = require('./routes/users');
const tripRoutes = require('./routes/trip');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost/milestone_project')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', mileageRoutes);
app.use('/api', accountRoutes);
app.use('/api', usersRoutes);
app.use('/api', tripRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const mileageRoutes = require('./routes/mileage');
const tripRoutes = require('./routes/trip');
const accountRoutes = require('./routes/accounts');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', mileageRoutes);
app.use('/api', tripRoutes);
app.use('/api', accountRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
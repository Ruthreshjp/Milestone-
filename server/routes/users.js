const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  console.log('Received signup request:', req.body);
  const { email, username, userType, password } = req.body;

  if (!email || !username || !userType || !password) {
    return res.status(400).json({ message: 'Email, username, user type, and password are required' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    let mappedUserType = userType.toLowerCase();
    if (mappedUserType === 'owner') mappedUserType = 'admin';
    else if (mappedUserType === 'driver') mappedUserType = 'driver';

    user = new User({
      email,
      username,
      userType: mappedUserType,
      password: await bcrypt.hash(password, 10),
    });

    await user.validate();
    await user.save();
    console.log('User saved successfully:', user);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error details:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: err.message, details: err.errors });
    }
    res.status(500).json({ message: 'Server error during signup', error: err.message });
  }
});

router.post('/signin', async (req, res) => {
  console.log('Received signin request:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error during signin:', err);
    res.status(500).json({ message: 'Server error during signin', error: err.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  console.log('Fetching profile for user:', req.user);
  try {
    const user = await User.findById(req.user.id).select('username -_id').lean();
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User data fetched from DB:', user);
    res.json(user);
  } catch (err) {
    console.error('Detailed error fetching profile:', err);
    res.status(500).json({ message: 'Server error while fetching profile', error: err.message });
  }
});

module.exports = router;
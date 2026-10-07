const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// In-memory fallback user store when MongoDB is not connected
const memoryUsers = new Map();

function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (isMongoConnected()) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ status: 'error', message: 'User already exists with this email.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword
      });
      await user.save();

      const token = jwt.sign({ id: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        status: 'success',
        token,
        user: { id: user._id.toString(), email: user.email, name: user.name }
      });
    } else {
      if (memoryUsers.has(normalizedEmail)) {
        return res.status(409).json({ status: 'error', message: 'User already exists with this email.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const id = 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

      const user = { id, name: name.trim(), email: normalizedEmail, password: hashedPassword };
      memoryUsers.set(normalizedEmail, user);

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        status: 'success',
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message || 'Signup failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (isMongoConnected()) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
      }

      const token = jwt.sign({ id: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        status: 'success',
        token,
        user: { id: user._id.toString(), email: user.email, name: user.name }
      });
    } else {
      const user = memoryUsers.get(normalizedEmail);
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        status: 'success',
        token,
        user: { id: user.id, email: user.email, name: user.name }
      });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message || 'Login failed' });
  }
});

module.exports = router;

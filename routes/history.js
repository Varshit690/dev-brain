const express = require('express');
const mongoose = require('mongoose');
const History = require('../models/History');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// In-memory fallback history store when MongoDB is not connected
const memoryHistory = [];

function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// Function to save an analysis history record (called internally or via endpoint)
async function saveAnalysisRecord({ userId, code, language, complexity, max_depth, details, vulnerabilities }) {
  if (isMongoConnected()) {
    const record = new History({
      userId,
      code,
      language,
      complexity,
      max_depth,
      details,
      vulnerabilities
    });
    return await record.save();
  } else {
    const record = {
      _id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      userId,
      code,
      language,
      complexity,
      max_depth,
      details,
      vulnerabilities,
      createdAt: new Date()
    };
    memoryHistory.unshift(record);
    return record;
  }
}

// GET /api/history - Retrieve history for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    if (isMongoConnected()) {
      const records = await History.find({ userId }).sort({ createdAt: -1 }).limit(50);
      return res.json({ status: 'success', history: records });
    } else {
      const records = memoryHistory.filter(h => h.userId === userId).slice(0, 50);
      return res.json({ status: 'success', history: records });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch history' });
  }
});

module.exports = {
  router,
  saveAnalysisRecord
};

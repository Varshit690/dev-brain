const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'javascript'
  },
  complexity: {
    type: String,
    required: true
  },
  max_depth: {
    type: Number,
    default: 0
  },
  details: {
    type: [String],
    default: []
  },
  vulnerabilities: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.History || mongoose.model('History', HistorySchema);

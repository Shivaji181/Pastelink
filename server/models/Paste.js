const mongoose = require('mongoose');

const pasteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  max_views: {
    type: Number,
    default: null,
  },
  current_views: {
    type: Number,
    default: 0,
  },
  ttl_seconds: {
    type: Number,
    default: null,
  },
  expires_at: {
    type: Date,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Paste', pasteSchema);

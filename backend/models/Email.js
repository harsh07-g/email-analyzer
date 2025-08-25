
const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true,
  },
  rawHeaders: {
    type: String,
    required: true,
  },
  esp: {
    type: String,
    required: true,
  },
  receivingChain: [
    {
      from: String,
      by: String,
      protocol: String,
      timestamp: String,
    }
  ],
  isProcessed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Email', emailSchema);
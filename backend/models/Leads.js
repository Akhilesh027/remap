const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: String,
    contact: String,
    project: String,
    source: String,
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Interested', 'Closed', 'Lost'],
      default: 'New',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
      callResponse: { type: String },

    created: {
      type: Date,
      default: Date.now,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);

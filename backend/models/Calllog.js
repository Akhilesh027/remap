const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, required: true },
  duration: { type: Number, default: null },
  notes: { type: String, default: '' },
});

module.exports = mongoose.model('CallLog', CallLogSchema);

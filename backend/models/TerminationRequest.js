const mongoose = require('mongoose');

const terminationRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  reason: String,
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // optional, if different from userId
});


module.exports = mongoose.model('TerminationRequest', terminationRequestSchema);

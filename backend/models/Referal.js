const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: { type: String, required: true },
  referred: { type: String, required: true },
  phone: { type: String, required: true },
  relation: { type: String, default: '' },
  status: { type: String, default: 'New', enum: ['New', 'Contacted', 'Booked'] },
  date: { type: Date, default: Date.now },
  reward: { type: String, default: 'Pending' },
  notes: { type: String, default: '' },
  director: { type: String, default: '' },
  executive: { type: String, default: '' },
  venture: { type: String, default: '' },
  originalPrice: { type: Number, default: 0 },
  commissionPct: { type: Number, default: 0 },
  commissionAmt: { type: Number, default: 0 },
});

module.exports = mongoose.model('Referral', referralSchema);

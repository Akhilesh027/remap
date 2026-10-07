// models/Walkin.js
const mongoose = require('mongoose');

const WalkinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  purpose: String,
  status: { type: String, enum: ['Visited', 'Converted'], default: 'Visited' },
  notes: String,
  assigned: String,
}, { timestamps: true });

module.exports = mongoose.model('Walkin', WalkinSchema);

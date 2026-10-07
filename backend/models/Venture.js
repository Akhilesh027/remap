const mongoose = require('mongoose');

const ventureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  registered: {
    type: String,
    required: true,
    trim: true
  },
  approvedBy: {
    type: String,
    required: true,
    trim: true
  },
  googleMapLink: {
    type: String,
    trim: true
  },
  brochure: {
    filename: String,
    path: String,
    mimetype: String
  },
  layout: {
    filename: String,
    path: String,
    mimetype: String
  },
  highlights: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  units: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ventureSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Venture', ventureSchema);
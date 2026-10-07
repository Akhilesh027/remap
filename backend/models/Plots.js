const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  plotNumber: {
    type: String,
    required: true,
    trim: true
  },
  plotLocation: {
    type: String,
    required: true,
    trim: true
  },
  plotFacing: {
    type: String,
    trim: true
  },
  plotVaastu: {
    type: String,
    trim: true
  },
  documents: {
    filename: String,
    path: String,
    mimetype: String
  },
  images: [{
    filename: String,
    path: String,
    mimetype: String
  }],
  mapStatus: {
    type: Map,
    of: String,
    default: {}
  },
  ventureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venture',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'sold'],
    default: 'available'
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

plotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Plot', plotSchema);
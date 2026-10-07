const mongoose = require('mongoose');

const departmentMessageSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    required: true,

  },
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt
});

module.exports = mongoose.model("DepartmentMessage", departmentMessageSchema);


const mongoose = require("mongoose");
// --- Notification Schema ---
const notificationSchema = new mongoose.Schema({
  // Who performed the action
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Assumes you have a User model
    ref: 'User', 
    required: true
  },
  
  // What the notification is about (the property being created/updated)
  target_id: {
    type: String,
    required: true
  },
  
  // A clear, human-readable message to display
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Type of action (for filtering/icon display)
  action_type: {
    type: String,
    default: 'property_created'
  },
  
  // Status flags
  is_read: {
    type: Boolean,
    default: false
  },
  
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
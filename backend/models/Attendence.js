// models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loginTime: { type: Date, required: true, default: Date.now },
  logoutTime: { type: Date },
});

module.exports = mongoose.model("Attendance", attendanceSchema);

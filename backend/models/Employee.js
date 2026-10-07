const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: String,
  phoneNumber: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  duties: String,
  address: String,
  zip: String,
  role: { type: String },
  files: [String],
  status: { type: String, enum: ["active", "terminated"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);

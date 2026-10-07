// models/Recruitment.js
const mongoose = require("mongoose");

const recruitmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    contact: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Interview Scheduled", "Hired"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recruitment", recruitmentSchema);

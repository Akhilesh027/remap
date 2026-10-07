// models/CabBooking.js
const mongoose = require("mongoose");

const cabBookingSchema = new mongoose.Schema(
  {
    executive: { type: String, required: true }, // Who booked the cab
    pickup: { type: String, required: true },
    destination: { type: String, required: true },
    time: { type: String, required: true }, // ISO datetime string
    date: { type: String, required: true }, // YYYY-MM-DD
    purpose: { type: String },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CabBooking", cabBookingSchema);

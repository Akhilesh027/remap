const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Legacy fields for backward compatibility
    propertyName: { type: String },
    propertyLocation: { type: String },
    plote: { type: String },
    // New comprehensive fields
    ventureName: { type: String },
    location: { type: String },
    plotNumber: { type: String },
    plotSize: { type: String },
    facing: { type: String },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Inactive", "Completed", "On Hold"]
    },
    vastu: { type: String },
    currentPhase: { type: Number, default: 1, min: 1, max: 5 },
    overview: { type: String },
    previousOwner: { type: String },
    registrationOffice: { type: String },
    registrationNumber: { type: String },
    registrationDate: { type: Date },
    plotAddress: { type: String },
    surveyNumber: { type: String },
    surveyReference: { type: String },
    legalStatus: { type: String },
    price: { type: Number, required: true },
    documents: [
      {
        type: { type: String, required: true },
        name: { type: String, required: true },
        fileName: { type: String, required: true },
        originalName: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ],
    updates: [
      {
        message: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ],
    bannerImage: { type: String } // Store the file path or URL
  },
  { timestamps: true }
);

module.exports = mongoose.models.Client || mongoose.model("Client", clientSchema);

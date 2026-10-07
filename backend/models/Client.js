const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, index: true },
    phone: { type: String },
    bannerImage: { type: String, default: "" },
    status: { type: String, default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Client || mongoose.model("Client", clientSchema);

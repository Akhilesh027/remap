// backend/runSeed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const seedAll = require("./seedData.js");

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for standalone seed run.");
    await seedAll();
    console.log("Seeding finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

run();

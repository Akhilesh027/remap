const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "admin@remap-digitalness.com";
    const password = "22446688";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.role = "admin";
      existingUser.name = existingUser.name || "Admin";
      await existingUser.save();
      console.log(`Updated existing user ${email} with new password and role 'admin'.`);
    } else {
      const newUser = new User({
        name: "Admin User",
        email: email,
        password: hashedPassword,
        role: "admin",
      });
      await newUser.save();
      console.log(`Created new admin user ${email}.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin credentials:", error);
    process.exit(1);
  }
}

seedAdmin();

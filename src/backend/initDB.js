const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Department = require("./models/Department");
const AcademicYear = require("./models/AcademicYear");

const initializeDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      AcademicYear.deleteMany({})
    ]);

    // Create default departments
    const departments = await Department.insertMany([
      { name: "CSE" },
      { name: "ECE" },
      { name: "IT" },
      { name: "MECH" },
      { name: "CIVIL" },
      { name: "EEE" },
      { name: "LIBRARY" },
      { name: "ACCOUNTS" },
      { name: "ACADEMICS" },
      { name: "SCHOLARSHIP" }
    ]);

    // Create current academic year based on current year
    const currentYear = new Date().getFullYear();
    await AcademicYear.create({ 
      from: currentYear,
      to: currentYear + 1
    });

    // Add super admin details first
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      email: "admin@vnrvjiet.in",
      password: hashedPassword,
      role: "super_admin"
    });

    console.log("Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
};

initializeDB();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Department = require("./models/Department");
const AcademicYear = require("./models/AcademicYear");
const Student = require("./models/Student");
const Faculty = require("./models/Faculty");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seedData = async () => {
  // Delete all existing data to avoid duplicates on multiple runs
  await User.deleteMany({});
  await Department.deleteMany({});
  await AcademicYear.deleteMany({});
  await Student.deleteMany({});
  await Faculty.deleteMany({});

  // Create Departments
  const departments = await Department.insertMany([
    { name: "Computer Science" },
    { name: "Electrical" },
    { name: "Mechanical" },
  ]);

  // Create Academic Years
  const academicYears = await AcademicYear.insertMany([
    { from: 2023, to: 2024 },
    { from: 2024, to: 2025 },
  ]);

  // Helper function for password hashing
  const hashPassword = async (plainPwd) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPwd, salt);
  };

  // Create Users with hashed passwords
  const users = await Promise.all([
    {
      email: "superadmin@vnrvjiet.in",
      password: await hashPassword("superpassword"),
      role: "super_admin",
    },
    {
      email: "deptoperator@vnrvjiet.in",
      password: await hashPassword("operatorpass"),
      role: "department_operator",
      department: departments[0]._id,
    },
  ].map(user => new User(user).save()));

  // Create Students
  const students = await Student.insertMany([
    {
      rollNumber: "2307101001",
      name: "Srinivas Reddy",
      class: "CSE 3rd Year",
      department: departments[0]._id,
      academicYear: academicYears._id,
      phone: "9876543210",
      email: "srinivas@example.com",
      parentName: "Reddy Sr.",
      parentPhone: "9876543211",
      dues: [],
    },
    {
      rollNumber: "2307101002",
      name: "Anita Sharma",
      class: "CSE 3rd Year",
      department: departments[0]._id,
      academicYear: academicYears._id,
      phone: "9876543220",
      email: "anita@example.com",
      parentName: "Mr. Sharma",
      parentPhone: "9876543221",
      dues: [],
    },
  ]);

  // Create Faculty
  const faculty = await Faculty.insertMany([
    {
      facultyId: "FAC1001",
      name: "Dr. P. Sudheer Benarji",
      email: "sudheer.ben@vnrvjiet.in",
      department: departments[0]._id,
      role: "hod",
      phone: "9876500011",
      dues: [],
    },
  ]);

  console.log("Mock data inserted successfully");
  process.exit();
};

const run = async () => {
  await connectDB();
  await seedData();
};

run();

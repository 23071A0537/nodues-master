const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Due = require("../models/Due");
const Department = require("../models/Department");

router.get("/student-dues/:rollNumber", async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all departments
    const departments = await Department.find();
    
    // Get all dues for this student
    const dues = await Due.find({ 
      personId: req.params.rollNumber,
      status: "pending"
    });

    // Organize dues by department
    const departmentDues = departments.map(dept => ({
      department: dept.name,
      dues: dues.filter(due => due.department === dept.name)
    }));

    res.json({
      name: student.name,
      departmentDues
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

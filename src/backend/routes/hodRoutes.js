const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getStudents, getDepartmentStats, getStudentDues } = require("../controllers/hodController");

// Get all students in HOD's department
router.get("/students", protect, authorizeRoles("hod"), getStudents);

// NEW: Get department statistics
router.get("/department-stats", protect, authorizeRoles("hod"), getDepartmentStats);

// Get student details with dues
router.get("/student/:rollNumber/dues", protect, authorizeRoles("hod"), getStudentDues);

module.exports = router;

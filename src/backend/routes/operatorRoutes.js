const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  addDue,
  getDuesByDepartment,
  getAllDues,
  clearDue,
  getStats,
  updatePaymentStatus,
  getTotalPendingAmount,
  addDueBulk,
  getAllStudentsWithDueStatus,
  getAllStudentDues,
  downloadDuesSample
} = require("../controllers/operatorController");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const authorizeDepartments = require("../middleware/authorizeSections");

// ➕ Add a new due (only department operators)
router.post("/add-due", protect, authorizeRoles("department_operator"), addDue);

router.post("/add-due-bulk", protect, authorizeRoles("department_operator"), addDueBulk);

// 📊 Get stats for operator dashboard
router.get("/stats", protect, authorizeRoles("department_operator"), getStats);

// 🔹 Fetch ALL students (not department-filtered)
router.get(
  "/students",
  protect,
  authorizeRoles("department_operator"),
  async (req, res) => {
    try {
      const students = await Student.find()
        .populate("academicYear", "from to")
        .sort({ rollNumber: 1 });
      res.json(students);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch students", error: err.message });
    }
  }
);

// 🔹 Fetch ALL faculty (not department-filtered)
router.get(
  "/faculty",
  protect,
  authorizeRoles("department_operator"),
  async (req, res) => {
    try {
      const faculty = await Faculty.find()
        .populate("department", "name")
        .sort({ name: 1 });
      res.json(faculty);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch faculty", error: err.message });
    }
  }
);

// Get all students with due status (accounts operator only)
router.get(
  "/all-students",
  protect,
  authorizeRoles("department_operator"),
  authorizeDepartments("ACCOUNTS"),
  getAllStudentsWithDueStatus
);

// Get all dues for a specific student (accounts operator only) - MUST be before other /:id routes
router.get(
  "/all-student/:rollNumber/dues",
  protect,
  authorizeRoles("department_operator"),
  authorizeDepartments("ACCOUNTS"),
  getAllStudentDues
);

// 📄 Get all dues (only Accounts & Academics operators OR super_admin)
router.get(
  "/all",
  protect,
  authorizeRoles("department_operator", "super_admin"),
  authorizeDepartments("ACCOUNTS", "ACADEMICS"),
  getAllDues
);

// 🏢 Get dues for a department (operator)
router.get(
  "/department/:department",
  protect,
  authorizeRoles("department_operator"),
  getDuesByDepartment
);

router.get(
  "/totalPending/:department",
  protect,
  authorizeRoles("department_operator"),
  getTotalPendingAmount
);

// Update payment status - MUST come before /dues/:id routes
router.put(
  "/update-payment-status/:id",
  protect,
  authorizeRoles("department_operator"),
  authorizeDepartments("ACCOUNTS"),
  updatePaymentStatus
);

// Update payment status for dues table (alternative endpoint)
router.put(
  "/dues/:id/payment",
  protect,
  authorizeRoles("department_operator", "super_admin"),
  authorizeDepartments("ACCOUNTS"),
  updatePaymentStatus
);

// ✅ Clear a due (department operator) - EXCLUDE ACCOUNTS
router.put(
  "/clear-due/:id",
  protect,
  authorizeRoles("department_operator"),
  async (req, res, next) => {
    // Prevent accounts operator from clearing dues
    if (req.user.department === "ACCOUNTS") {
      return res.status(403).json({ 
        message: "Accounts operators can only change payment status, not clear dues" 
      });
    }
    next();
  },
  clearDue
);

// NEW: Download Dues Sample Template (accessible by operators)
router.get(
  "/download-dues-sample",
  protect,
  authorizeRoles("department_operator"),
  downloadDuesSample
);

// 🔹 Get all faculty with due status (accounts operator only)
router.get(
  "/all-faculty",
  protect,
  authorizeRoles("department_operator"),
  authorizeDepartments("ACCOUNTS"),
  async (req, res) => {
    try {
      const dues = await require("../models/Due").find({ personType: "Faculty" });
      const facultyList = await Faculty.find().sort({ name: 1 });
      
      const facultyWithDues = facultyList.map(f => ({
        ...f.toObject(),
        totalDues: dues.filter(d => d.personId === f.facultyId).length,
        totalAmount: dues
          .filter(d => d.personId === f.facultyId && d.status === "pending")
          .reduce((sum, d) => sum + d.amount, 0),
        paymentDue: dues.filter(d => d.personId === f.facultyId && d.paymentStatus === "due").length > 0
      }));

      res.json(facultyWithDues);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch faculty", error: err.message });
    }
  }
);

// 🔹 Get all dues for a specific faculty (accounts operator only)
router.get(
  "/all-faculty/:facultyId/dues",
  protect,
  authorizeRoles("department_operator"),
  authorizeDepartments("ACCOUNTS"),
  async (req, res) => {
    try {
      const { facultyId } = req.params;
      const dues = await require("../models/Due").find({
        personId: facultyId,
        personType: "Faculty"
      }).sort({ dateAdded: -1 });
      res.json(dues);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch faculty dues", error: err.message });
    }
  }
);

// 🔹 HR: Get all faculty with due status
router.get(
  "/hr/faculty-dues",
  protect,
  authorizeRoles("department_operator"),
  authorizeDepartments("HR"),
  async (req, res) => {
    try {
      const dues = await require("../models/Due").find({ 
        personType: "Faculty",
        status: "pending"
      }).sort({ dateAdded: -1 });
      res.json(dues);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch faculty dues", error: err.message });
    }
  }
);

// 🔹 HR: Get faculty stats
router.get(
  "/hr/faculty-stats",
  protect,
  authorizeRoles("department_operator"),
  authorizeDepartments("HR"),
  async (req, res) => {
    try {
      const Faculty = require("../models/Faculty");
      const Due = require("../models/Due");

      const totalFaculty = await Faculty.countDocuments();
      const facultyWithDues = await Due.distinct("personId", {
        personType: "Faculty",
        status: "pending"
      });
      const totalDuesAmount = await Due.aggregate([
        {
          $match: {
            personType: "Faculty",
            status: "pending"
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);

      res.json({
        totalFaculty,
        facultyWithDues: facultyWithDues.length,
        totalDuesAmount: totalDuesAmount[0]?.total || 0
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats", error: err.message });
    }
  }
);

// 🔹 HR: Get specific faculty dues
router.get(
  "/hr/faculty/:facultyId",
  protect,
  authorizeRoles("department_operator"),
  authorizeDepartments("HR"),
  async (req, res) => {
    try {
      const { facultyId } = req.params;
      const Faculty = require("../models/Faculty");
      const Due = require("../models/Due");

      const faculty = await Faculty.findOne({ facultyId });
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }

      const dues = await Due.find({
        personId: facultyId,
        personType: "Faculty"
      }).sort({ dateAdded: -1 });

      res.json({
        _id: faculty._id,
        personName: faculty.name,
        personId: faculty.facultyId,
        department: faculty.department?.name || "N/A",
        dues
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch faculty details", error: err.message });
    }
  }
);

module.exports = router;

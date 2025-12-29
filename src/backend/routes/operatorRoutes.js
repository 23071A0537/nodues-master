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

module.exports = router;

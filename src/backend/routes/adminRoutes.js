const express = require('express');
const router = express.Router();

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Make sure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Academic Years
router.get('/academic-years', protect, authorizeRoles('super_admin'), adminController.getAcademicYears);
router.post('/academic-years', protect, authorizeRoles('super_admin'), adminController.addAcademicYear);
router.delete('/academic-years/:id', protect, authorizeRoles('super_admin'), adminController.deleteAcademicYear);

// Departments
router.get('/departments', protect, authorizeRoles('super_admin'), adminController.getDepartments);
router.post('/departments', protect, authorizeRoles('super_admin'), adminController.addDepartment);
router.delete('/departments/:id', protect, authorizeRoles('super_admin'), adminController.deleteDepartment);

// Users
router.get('/users', protect, authorizeRoles('super_admin'), adminController.getUsers);
router.post('/users', protect, authorizeRoles('super_admin'), adminController.addUser);
router.delete('/users/:id', protect, authorizeRoles('super_admin'), adminController.deleteUser);
router.put('/users/:userId/change-password', protect, authorizeRoles('super_admin'), adminController.adminChangeUserPassword);

// Import Students / Faculty
router.post('/import-students', protect, authorizeRoles('super_admin'), upload.single('file'), adminController.importStudents);
router.post('/import-faculty', protect, authorizeRoles('super_admin'), upload.single('file'), adminController.importFaculty);

// Download Sample Excel Files
router.get('/download-student-sample', protect, authorizeRoles('super_admin'), adminController.downloadStudentSample);
router.get('/download-faculty-sample', protect, authorizeRoles('super_admin'), adminController.downloadFacultySample);
router.get('/download-dues-sample', protect, authorizeRoles('super_admin'), adminController.downloadDuesSample);

// List Students and Faculty
router.get('/students', protect, authorizeRoles('super_admin'), adminController.getStudents);
router.get('/faculty', protect, authorizeRoles('super_admin'), adminController.getFaculty);
router.put('/faculty/:id', protect, authorizeRoles('super_admin'), adminController.updateFaculty);

// Dashboard Stats
router.get('/dashboard-stats', protect, authorizeRoles('super_admin'), adminController.getDashboardStats);

// Department-wise due statistics
router.get('/department-due-stats', protect, authorizeRoles('super_admin'), adminController.getDepartmentDueStats);

// Role management routes
router.get('/users/:userId/details', protect, authorizeRoles('super_admin'), adminController.getUserDetails);
router.put('/users/:userId/roles', protect, authorizeRoles('super_admin'), adminController.updateUserRoles);

module.exports = router;

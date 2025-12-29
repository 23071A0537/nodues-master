const express = require('express');
const router = express.Router();
const { registerUser, loginUser, changePassword, adminChangePassword } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Login route
router.post('/login', loginUser);

// Register route (protected, only for admin)
router.post('/register', registerUser);

// Change password route (protected)
router.put('/change-password', protect, changePassword);

// Admin change any user's password (protected, only for super_admin and admin)
router.put('/admin-change-password', protect, authorizeRoles('super_admin', 'admin'), adminChangePassword);

module.exports = router;

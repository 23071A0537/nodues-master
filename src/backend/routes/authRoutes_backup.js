const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Login route
router.post('/login', loginUser);

// Register route (protected, only for admin)
router.post('/register', registerUser);

module.exports = router;
"const { protect } = require('../middleware/authMiddleware');"  
""  
"// Change password route (protected)"  
"router.put('/change-password', protect, changePassword);" 

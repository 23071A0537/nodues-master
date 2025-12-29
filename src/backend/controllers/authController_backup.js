const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, department: user.department || null },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Register user (admin only)
exports.registerUser = async (req, res) => {
  const { email, password, role, department } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (['department_operator', 'hod'].includes(role) && !department) {
      return res.status(400).json({ message: 'Department is required for this role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role,
      department: department || null
    });

    await user.save();
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};
"// Change password"  
"exports.changePassword = async (req, res) => {"  
"  const { currentPassword, newPassword } = req.body;"  
""  
"  try {"  
"    if (!req.user) {"  
"      return res.status(401).json({ message: 'Not authenticated' });"  
"    }"  
""  
"    const user = await User.findById(req.user.id);"  
"    if (!user) {"  
"      return res.status(404).json({ message: 'User not found' });"  
"    }"  
""  
"    // Verify current password"  
"    const isMatch = await bcrypt.compare(currentPassword, user.password);"  
"    if (!isMatch) {"  
"      return res.status(400).json({ message: 'Current password is incorrect' });"  
"    }"  
""  
"    // Hash new password"  
"    const hashedNewPassword = await bcrypt.hash(newPassword, 10);"  
"    user.password = hashedNewPassword;"  
"    await user.save();"  
""  
"    res.json({ message: 'Password changed successfully' });"  
"  } catch (err) {"  
"    console.error('Change password error:', err);"  
"    res.status(500).json({ message: 'Server error during password change' });"  
"  }"  
"};" 

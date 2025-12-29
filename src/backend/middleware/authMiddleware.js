const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as needed

const express = require('express');
const app = express();

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
// Middleware to verify JWT token and attach user to request
const protect = async (req, res, next) => {
  let token = null;

  // Check token from header 'Authorization: Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user object to req (excluding password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Middleware to check if user role is authorized
// Usage: authorizeRoles('super_admin', 'department_operator')
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: 'Access denied: No user found' });
    }

    // Check if user has any of the allowed roles (supports composite roles)
    const userRoles =
      req.user.roles && req.user.roles.length > 0
        ? req.user.roles
        : [req.user.role];

    const hasPermission = userRoles.some((role) => roles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(
          ', '
        )}. Your roles: ${userRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };

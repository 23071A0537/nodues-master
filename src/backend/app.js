const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const rateLimiter = require("./middleware/rateLimiter");
const sanitizer = require("./middleware/inputSanitizer");
const adminRoutes = require("./routes/adminRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api/auth', rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 })); // Login attempts
app.use('/api', rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 })); // General API

// Apply input sanitization
app.use(sanitizer);

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/operator", operatorRoutes);
app.use("/api/public", publicRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Don't expose error details in production
  const message = process.env.NODE_ENV === "production" 
    ? "An error occurred" 
    : err.message;
  
  res.status(err.status || 500).json({ 
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      process.exit(1);
    }
  }
};

connectDB();

module.exports = app;
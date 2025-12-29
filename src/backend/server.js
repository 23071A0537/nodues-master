const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // <-- add urlencoded parser

// Simple request log
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Detailed logging (defensive checks)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.query && typeof req.query === "object" && Object.keys(req.query).length > 0) {
    console.log("Query params:", req.query);
  }
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    console.log("Body:", req.body);
  }
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const hodRoutes = require('./routes/hodRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Mount routes with proper prefixes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/public', publicRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'VNRVJIET No-Dues API Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

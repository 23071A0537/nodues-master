const mongoose = require('mongoose');
require('dotenv').config(); // If you use .env for DB URL

// Change this to your MongoDB connection string if not using .env
const MONGODB_URI = 'mongodb+srv://23071a0537_db_user:F0uOLBwkIxRM1K3P@cluster0.7whokse.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const Student = require('../models/Student');
 // Adjust the path as needed

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("Connected to MongoDB.");

  const result = await Student.deleteMany({});
  console.log(`Deleted ${result.deletedCount} students.`);
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});

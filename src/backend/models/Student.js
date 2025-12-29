const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  section: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  fatherName: { type: String, required: true },
  fatherMobile: { type: String, required: true },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear', // <-- Correct model name for population
    required: true 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Student', StudentSchema);

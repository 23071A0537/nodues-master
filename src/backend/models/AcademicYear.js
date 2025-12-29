const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  from: { type: Number, required: true },
  to: { type: Number, required: true }
}, {
  timestamps: true
});

academicYearSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('AcademicYear', academicYearSchema);

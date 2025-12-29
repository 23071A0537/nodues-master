const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  employeeCode: { type: String, required: true, unique: true },
  facultyId: { type: String, required: true, unique: true }, // mapped to employeeCode
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String, trim: true }, // flexible string, no enum restriction here
  email: { type: String, trim: true },
  mobile: { type: String, trim: true },
  role: {
    type: String,
    enum: ["super_admin", "hod", "department_operator", "faculty"], // added "faculty"
    required: true
  },
  staffType: {
    type: String,
    enum: ["teaching", "non-teaching"],
    default: "teaching"
  }
  // Add other fields as required
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);

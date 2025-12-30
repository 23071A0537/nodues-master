const mongoose = require('mongoose');

const dueSchema = new mongoose.Schema({
  // Store rollNumber (if Student) or facultyId (if Faculty)
  personId: { type: String, required: true },

  // Store the name directly to avoid population later
  personName: { type: String, required: true },

  personType: { type: String, required: true, enum: ['Student', 'Faculty'] },
  department: { type: String, required: true }, // department name
  description: { type: String, required: true }, // e.g., "Library fine" or "Mess fee"
  amount: { type: Number, required: true, default: 0 },
  dueDate: { type: Date, required: true },

  clearDate: { type: Date, default: null }, // null if pending
  status: { type: String, enum: ['pending', 'cleared'], default: 'pending' },
  dateAdded: { type: Date, default: Date.now },

  // 🔹 New field for payment status
  paymentStatus: { type: String, enum: ['due', 'done'], default: 'due' },

  // New fields
  category: { type: String, enum: ['payable', 'non-payable'], default: 'payable' }, // whether student has to pay money
  link: { type: String, default: '' }, // Google Drive link, optional
  
  // 🔹 New field for due type/reason
  dueType: { 
    type: String, 
    required: true,
    enum: [
      'damage-to-property',
      'fee-delay',
      'scholarship-issue',
      'library-fine',
      'hostel-dues',
      'lab-equipment',
      'sports-equipment',
      'exam-malpractice',
      'other'
    ]
  }
});

module.exports = mongoose.model('Due', dueSchema);

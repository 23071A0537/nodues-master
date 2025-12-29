const AcademicYear = require('../models/AcademicYear');
const Department = require('../models/Department');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Due = require('../models/Due');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const fs = require('fs');
const mongoose = require('mongoose');

// --- Academic Years ---
exports.getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find();
    res.json(years);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch academic years" });
  }
};

exports.addAcademicYear = async (req, res) => {
  const { from, to } = req.body;
  try {
    const exists = await AcademicYear.findOne({ from, to });
    if (exists) return res.status(400).json({ message: "Academic year already exists" });
    const year = await AcademicYear.create({ from, to });
    res.status(201).json(year);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AcademicYear.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Academic year not found" });
    res.json({ message: "Academic year deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --- Departments ---
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch departments", error: err.message });
  }
};

exports.addDepartment = async (req, res) => {
  const { name } = req.body;
  try {
    const exists = await Department.findOne({ name });
    if (exists) return res.status(400).json({ message: "Department already exists" });
    const dept = await Department.create({ name });
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --- Users ---
exports.addUser = async (req, res) => {
  const { email, password, role, department } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userObj = {
      email,
      password: hashedPassword,
      role,
      department: department || null
    };

    const user = new User(userObj);
    await user.save();

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        department: user.department || null
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('facultyRef', 'name employeeCode')
      .lean();
    
    const usersWithRoles = users.map(user => ({
      _id: user._id,
      email: user.email,
      role: user.role,
      roles: user.roles || [user.role],
      displayRoles: user.roles ? user.roles.join(' & ') : user.role,
      department: user.department || null,
      hodDepartment: user.hodDepartment || null,
      facultyRef: user.facultyRef,
      isFromFaculty: user.isFromFaculty || false
    }));
    
    res.json(usersWithRoles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (req.user.id === id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: `User ${user.email} deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Admin change user password
exports.adminChangeUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: `Password changed successfully for ${user.email}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user roles (add/remove composite roles)
exports.updateUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles, department, hodDepartment } = req.body;

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: "At least one role is required" });
    }

    // Validate that department_operator role has a department
    if (roles.includes('department_operator') && !department) {
      return res.status(400).json({ 
        message: "Department is required when adding Operator role" 
      });
    }

    // Validate that HOD role has a department
    if (roles.includes('hod') && !hodDepartment) {
      return res.status(400).json({ 
        message: "HOD Department is required when adding HOD role" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update roles
    user.roles = roles;
    user.role = roles[0]; // Primary role is first in array
    
    // Update departments
    if (roles.includes('department_operator')) {
      user.department = department;
    }
    if (roles.includes('hod')) {
      user.hodDepartment = hodDepartment;
    }

    await user.save();

    res.json({ 
      message: "User roles updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        roles: user.roles,
        department: user.department,
        hodDepartment: user.hodDepartment
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user with all role details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('facultyRef', 'name employeeCode department designation');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      roles: user.roles || [user.role],
      department: user.department,
      hodDepartment: user.hodDepartment,
      facultyRef: user.facultyRef,
      isFromFaculty: user.isFromFaculty,
      displayRoles: user.roles ? user.roles.join(' & ') : user.role
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// --- Students Import ---
exports.importStudents = async (req, res) => {
  if (!req.file || !req.body.academicYear) {
    return res.status(400).json({ 
      message: 'Missing required file or academic year' 
    });
  }

  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    // Validate required columns
    const requiredFields = [
      'Name of the Student',
      'H.T.No.',
      'Branch',
      'Section',
      'Email',
      'Mobile',
      'Father Name',
      'Father Mobile'
    ];

    const firstRow = rows[0];
    const missingFields = requiredFields.filter(field => 
      !Object.keys(firstRow).some(key => 
        key.trim().toLowerCase() === field.trim().toLowerCase()
      )
    );

    const incompleteRows = rows.filter(row => !row["Branch"]);
      if (incompleteRows.length) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          message: "Some students are missing required 'Branch'.",
          errorField: "Branch",
          details: incompleteRows.map((row, i) => ({
            rowNum: i + 2, // Excel row (header+1)
            student: row["Name of the Student"],
            rollNumber: row["H.T.No."]
          }))
        });
      }

    if (missingFields.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        message: 'Missing required columns',
        errorField: missingFields.join(', ')
      });
    }

    const academicYear = await AcademicYear.findById(req.body.academicYear);
    if (!academicYear) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Invalid academic year' });
    }

    // Process students
    const students = rows.map(row => ({
      name: row['Name of the Student'],
      rollNumber: row['H.T.No.'],
      branch: row['Branch'],
      section: row['Section'],
      email: row['Email'],
      mobile: row['Mobile'],
      fatherName: row['Father Name'],
      fatherMobile: row['Father Mobile'],
      academicYear: academicYear._id
    }));

    await Student.insertMany(students);

    // Cleanup
    fs.unlinkSync(filePath);

    res.json({
      message: 'Students imported successfully',
      imported: students.length
    });

  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({
      message: error.message || 'Failed to import students',
      error: error
    });
  }
};


// --- Faculty Import ---
exports.importFaculty = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });

  const { staffType } = req.body;
  
  if (!staffType || !['teaching', 'non-teaching'].includes(staffType)) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Staff type (teaching/non-teaching) is required" });
  }

  const filePath = req.file.path;
  try {
    const wb = xlsx.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws, { defval: "" });

    const getTrimmedField = (row, key) => {
      if (key in row) return row[key];
      const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === key.trim().toLowerCase());
      return foundKey ? row[foundKey] : undefined;
    };

    let validFaculty = [];
    let skipped = 0;
    let errors = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const rowNum = i + 2;

      const empCode = getTrimmedField(item, "Employee Code");
      const empName = getTrimmedField(item, "Employee Name");
      const deptName = getTrimmedField(item, "Department");
      const designation = getTrimmedField(item, "Designation");
      const email = getTrimmedField(item, "Email");
      const mobile = getTrimmedField(item, "Mobile");

      if (!empCode || !empName || !deptName) {
        errors.push(`Row ${rowNum}: Missing required fields.`);
        continue;
      }

      const exists = await Faculty.findOne({ employeeCode: empCode });
      if (exists) {
        skipped++;
        continue;
      }

      let department = await Department.findOne({ name: deptName.trim() });
      if (!department) {
        department = await Department.create({ name: deptName.trim() });
      }

      validFaculty.push({
        employeeCode: empCode,
        facultyId: empCode,
        name: empName,
        department: department._id,
        designation: designation || "",
        email: email || "",
        mobile: mobile || "",
        role: "faculty",
        staffType: staffType
      });
    }

    if (validFaculty.length > 0) {
      await Faculty.insertMany(validFaculty);
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ imported: validFaculty.length, skipped, errors });
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("Import faculty error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const departments = await Department.countDocuments();
    const academicYears = await AcademicYear.countDocuments();
    const students = await Student.countDocuments();
    const faculty = await Faculty.countDocuments();

    res.json({
      totalUsers,
      departments,
      academicYears,
      students,
      faculty
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get department-wise due statistics
exports.getDepartmentDueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get all departments
    const departments = await Department.find().lean();

    // Build match condition for aggregation
    const matchCondition = { status: 'pending' };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      matchCondition.dateAdded = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // Aggregate dues by department
    const dueStats = await Due.aggregate([
      {
        $match: matchCondition
      },
      {
        $group: {
          _id: '$department',
          payableDues: {
            $sum: {
              $cond: [{ $eq: ['$category', 'payable'] }, 1, 0]
            }
          },
          nonPayableDues: {
            $sum: {
              $cond: [{ $eq: ['$category', 'non-payable'] }, 1, 0]
            }
          },
          payableAmount: {
            $sum: {
              $cond: [{ $eq: ['$category', 'payable'] }, '$amount', 0]
            }
          },
          nonPayableAmount: {
            $sum: {
              $cond: [{ $eq: ['$category', 'non-payable'] }, '$amount', 0]
            }
          },
          totalDues: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Create a map for quick lookup
    const statsMap = new Map();
    dueStats.forEach(stat => {
      statsMap.set(stat._id, stat);
    });

    // Combine department info with stats
    const departmentStats = departments.map(dept => {
      const stats = statsMap.get(dept.name) || {
        payableDues: 0,
        nonPayableDues: 0,
        payableAmount: 0,
        nonPayableAmount: 0,
        totalDues: 0,
        totalAmount: 0
      };

      return {
        departmentName: dept.name,
        payableDues: stats.payableDues,
        nonPayableDues: stats.nonPayableDues,
        payableAmount: stats.payableAmount,
        nonPayableAmount: stats.nonPayableAmount,
        totalDues: stats.totalDues,
        totalAmount: stats.totalAmount
      };
    });

    // Calculate overall totals
    const overallStats = {
      totalPayableDues: departmentStats.reduce((sum, d) => sum + d.payableDues, 0),
      totalNonPayableDues: departmentStats.reduce((sum, d) => sum + d.nonPayableDues, 0),
      totalPayableAmount: departmentStats.reduce((sum, d) => sum + d.payableAmount, 0),
      totalNonPayableAmount: departmentStats.reduce((sum, d) => sum + d.nonPayableAmount, 0),
      totalDues: departmentStats.reduce((sum, d) => sum + d.totalDues, 0),
      totalAmount: departmentStats.reduce((sum, d) => sum + d.totalAmount, 0)
    };

    res.json({
      departmentStats: departmentStats.sort((a, b) => b.totalAmount - a.totalAmount),
      overallStats,
      dateRange: startDate && endDate ? { startDate, endDate } : null
    });

  } catch (err) {
    console.error('Error fetching department due stats:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update faculty details
exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { designation, role } = req.body;
    const updated = await Faculty.findByIdAndUpdate(
      id,
      { designation, role },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getStudents = async (req, res) => {
  try {
    const { academicYear, rollNumber } = req.query;
    let filter = {};

    // Only add academicYear if it is a valid ObjectId
    if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
      filter.academicYear = academicYear;
    }

    // Only add rollNumber if not empty and is a string
    if (rollNumber && typeof rollNumber === "string" && rollNumber.trim().length > 0) {
      filter.rollNumber = { $regex: new RegExp(rollNumber.trim(), "i") };
    }

    // Return all students, sorted by creation date descending (latest first)
    const students = await Student.find(filter)
      .populate('academicYear', 'from to')
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    console.error("GET /admin/students error:", err.message, err.stack);
    res.status(500).json({
      message: "Failed to fetch students",
      error: err.message,
    });
  }
};


// List Faculty
exports.getFaculty = async (req, res) => {
  try {
    const { staffType } = req.query;
    let filter = {};
    
    if (staffType && ['teaching', 'non-teaching'].includes(staffType)) {
      filter.staffType = staffType;
    }
    
    const faculty = await Faculty.find(filter)
      .populate('department', 'name')
      .select('-dues')
      .sort({ name: 1 });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// NEW: Download Sample Excel for Students
exports.downloadStudentSample = async (req, res) => {
  try {
    const workbook = xlsx.utils.book_new();
    
    // Sample data with proper column headers
    const sampleData = [
      {
        'S.No.': 1,
        'Name of the Student': 'John Doe',
        'H.T.No.': '23071A0501',
        'Branch': 'CSE',
        'Section': 'A',
        'Email': 'john.doe@example.com',
        'Mobile': '9876543210',
        'Father Name': 'Mr. Doe',
        'Father Mobile': '9876543211'
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 8 },  // S.No.
      { wch: 25 }, // Name
      { wch: 15 }, // H.T.No.
      { wch: 10 }, // Branch
      { wch: 10 }, // Section
      { wch: 30 }, // Email
      { wch: 15 }, // Mobile
      { wch: 20 }, // Father Name
      { wch: 15 }  // Father Mobile
    ];

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=Student_Upload_Sample.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error generating student sample:', err);
    res.status(500).json({ message: 'Failed to generate sample file', error: err.message });
  }
};

// NEW: Download Sample Excel for Faculty
exports.downloadFacultySample = async (req, res) => {
  try {
    const workbook = xlsx.utils.book_new();
    
    // Sample data with proper column headers
    const sampleData = [
      {
        'S.No': 1,
        'Employee Code': 'EMP001',
        'Employee Name': 'Dr. Jane Smith',
        'Department': 'Computer Science',
        'Designation': 'Associate Professor',
        'Email': 'jane.smith@vnrvjiet.in',
        'Mobile': '9876543210'
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 8 },  // S.No
      { wch: 15 }, // Employee Code
      { wch: 25 }, // Employee Name
      { wch: 20 }, // Department
      { wch: 25 }, // Designation
      { wch: 30 }, // Email
      { wch: 15 }  // Mobile
    ];

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Faculty');
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=Faculty_Upload_Sample.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error generating faculty sample:', err);
    res.status(500).json({ message: 'Failed to generate sample file', error: err.message });
  }
};

// NEW: Download Sample Excel for Dues
exports.downloadDuesSample = async (req, res) => {
  try {
    const workbook = xlsx.utils.book_new();
    
    // Sample data with proper column headers matching AddDue form
    const sampleData = [
      {
        'personId': '23071A0501',
        'personName': 'John Doe',
        'personType': 'Student',
        'department': 'CSE',
        'description': 'Library Fine',
        'amount': 500,
        'dueDate': '2025-12-31',
        'category': 'payable',
        'link': 'https://drive.google.com/...'
      },
      {
        'personId': 'EMP001',
        'personName': 'Dr. Jane Smith',
        'personType': 'Faculty',
        'department': 'ECE',
        'description': 'Equipment Return',
        'amount': 0,
        'dueDate': '2025-11-30',
        'category': 'non-payable',
        'link': ''
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 15 }, // personId
      { wch: 25 }, // personName
      { wch: 12 }, // personType
      { wch: 15 }, // department
      { wch: 30 }, // description
      { wch: 10 }, // amount
      { wch: 12 }, // dueDate
      { wch: 12 }, // category
      { wch: 40 }  // link
    ];

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Dues');
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename=Dues_Upload_Template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error generating dues sample:', err);
    res.status(500).json({ message: 'Failed to generate sample file', error: err.message });
  }
};

// --- More CRUD endpoints (students, faculty, stats, etc.) as per your original file, unchanged ---

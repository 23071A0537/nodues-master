const Dues = require("../models/Due");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Department = require("../models/Department");
const mongoose = require("mongoose");  // make sure you also import your model
const xlsx = require('xlsx');

// Note: HR operators use the same addDue controller as other operators
// but they are restricted to adding dues only for faculty (personType: "Faculty")
// This is enforced at the frontend and the business logic ensures:
// 1. HR can only see faculty in their dropdown
// 2. HR cannot access /operator/students endpoint
// 3. HR cannot access /operator/all (external dues)
// 4. HR has dedicated /operator/hr/* endpoints for faculty management

// ➕ Add dues for a student or faculty
exports.addDue = async (req, res) => {
  try {
    const { personId, personType, department, description, amount, dueDate, category, link, dueType } = req.body;

    // HR operators can only add faculty dues
    if (req.user.department === "HR" && personType !== "Faculty") {
      return res.status(403).json({ 
        message: "HR operators can only add dues for faculty members" 
      });
    }

    // Validate dueType
    if (!dueType) {
      return res.status(400).json({ message: "Due type is required" });
    }

    // Check if person exists by rollNumber or facultyId
    let personExists;
    if (personType === "Student") {
      personExists = await Student.findOne({ rollNumber: personId });
    } else if (personType === "Faculty") {
      personExists = await Faculty.findOne({ facultyId: personId });
    } else {
      return res.status(400).json({ message: "Invalid person type" });
    }

    if (!personExists) {
      return res.status(404).json({ message: `${personType} not found` });
    }

    const newDue = new Dues({
      personId,
      personName: personExists.name,
      personType,
      department,
      description,
      amount,
      dueDate,
      clearDate: null,
      status: "pending",
      category: category || 'payable',
      link: link || '',
      dueType
    });

    await newDue.save();
    res.status(201).json({ message: "Due added successfully", due: newDue });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.addDueBulk = async (req, res) => {
  try {
    const dues = req.body;

    if (!Array.isArray(dues)) {
      return res.status(400).json({ message: "Invalid data format. Expected an array of dues." });
    }

    if (dues.length === 0) {
      return res.status(400).json({ message: "No dues data provided" });
    }

    const requiredFields = ['personId', 'personType', 'department', 'description', 'amount', 'dueDate', 'dueType'];
    const firstDue = dues[0];
    const missingFields = requiredFields.filter(field => !(field in firstDue));
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required columns: ${missingFields.join(', ')}`,
        hint: "Download the template file to see the correct format"
      });
    }

    const duesToInsert = [];
    const failedEntries = [];

    for (let i = 0; i < dues.length; i++) {
      const due = dues[i];
      const rowNum = i + 2;
      
      const { personId, personType, department, description, amount, dueDate, category, link, dueType } = due;

      if (!personId || !personType || !description || !dueDate || !dueType) {
        failedEntries.push({ 
          row: rowNum, 
          personId, 
          reason: "Missing required fields (personId, personType, description, dueDate, or dueType)" 
        });
        continue;
      }

      if (personType !== "Student" && personType !== "Faculty") {
        failedEntries.push({ 
          row: rowNum, 
          personId, 
          reason: "Invalid personType. Must be 'Student' or 'Faculty'" 
        });
        continue;
      }

      if (category && category !== "payable" && category !== "non-payable") {
        failedEntries.push({ 
          row: rowNum, 
          personId, 
          reason: "Invalid category. Must be 'payable' or 'non-payable'" 
        });
        continue;
      }

      const validDueTypes = [
        'damage-to-property', 'fee-delay', 'scholarship-issue', 
        'library-fine', 'hostel-dues', 'lab-equipment', 
        'sports-equipment', 'exam-malpractice', 'other'
      ];
      if (!validDueTypes.includes(dueType)) {
        failedEntries.push({ 
          row: rowNum, 
          personId, 
          reason: `Invalid dueType. Must be one of: ${validDueTypes.join(', ')}` 
        });
        continue;
      }

      try {
        let personExists;
        if (personType === "Student") {
          personExists = await Student.findOne({ rollNumber: personId });
        } else if (personType === "Faculty") {
          personExists = await Faculty.findOne({ facultyId: personId });
        }

        if (!personExists) {
          failedEntries.push({ 
            row: rowNum, 
            personId, 
            reason: `${personType} not found in database` 
          });
          continue;
        }

        let parsedDate;
        if (typeof dueDate === "number") {
          const utc_days = Math.floor(dueDate - 25569);
          const utc_value = utc_days * 86400;
          const date_info = new Date(utc_value * 1000);
          parsedDate = new Date(Date.UTC(date_info.getFullYear(), date_info.getMonth(), date_info.getDate()));
        } else {
          parsedDate = new Date(dueDate);
          if (isNaN(parsedDate.getTime())) {
            failedEntries.push({ 
              row: rowNum, 
              personId, 
              reason: "Invalid date format. Use YYYY-MM-DD" 
            });
            continue;
          }
        }

        duesToInsert.push({
          personId,
          personName: personExists.name,
          personType,
          department: department || personExists.department || personExists.branch || "Unknown",
          description,
          amount: Number(amount) || 0,
          dueDate: parsedDate,
          clearDate: null,
          status: "pending",
          paymentStatus: "due",
          category: category || 'payable',
          link: link || '',
          dueType
        });
      } catch (innerErr) {
        failedEntries.push({ 
          row: rowNum, 
          personId, 
          reason: innerErr.message 
        });
      }
    }

    let insertedDues = [];
    if (duesToInsert.length > 0) {
      insertedDues = await Dues.insertMany(duesToInsert);
    }

    const response = {
      message: `Bulk dues processed: ${insertedDues.length} added, ${failedEntries.length} failed`,
      insertedCount: insertedDues.length,
      failedCount: failedEntries.length,
      success: insertedDues.length > 0
    };

    if (failedEntries.length > 0) {
      response.failedEntries = failedEntries;
    }

    res.status(insertedDues.length > 0 ? 201 : 400).json(response);
  } catch (error) {
    console.error("Bulk due error:", error);
    res.status(500).json({ 
      message: "Failed to process bulk dues", 
      error: error.message,
      hint: "Check if the Excel file format matches the template"
    });
  }
};



// 📄 Get dues by department (for operators)
exports.getDuesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;

    const dues = await Dues.find({ department })
      .populate("personId", "name rollNumber email");

    res.status(200).json(dues);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// Enhanced stats with breakdown for operator dashboard
exports.getStats = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // All operators now see all students regardless of department
    const totalStudents = await Student.countDocuments();

    let departmentRef = req.user.department;
    let departmentName = null;

    if (departmentRef && typeof departmentRef === "object" && departmentRef.name) {
      departmentName = String(departmentRef.name).toUpperCase();
    } else if (departmentRef && typeof departmentRef === "string") {
      if (mongoose.Types.ObjectId.isValid(departmentRef)) {
        const deptDoc = await Department.findById(departmentRef).lean();
        if (deptDoc) departmentName = String(deptDoc.name).toUpperCase();
        else departmentName = String(departmentRef).toUpperCase();
      } else {
        departmentName = String(departmentRef).toUpperCase();
      }
    } else {
      return res.status(400).json({ message: "Department not set for user" });
    }

    console.log("📊 Fetching stats for department:", departmentName);

    // Get detailed breakdown for operator's department
    const deptStats = await Dues.aggregate([
      { 
        $match: { 
          department: departmentName, 
          status: "pending" 
        } 
      },
      {
        $group: {
          _id: null,
          totalDues: { $sum: 1 },
          payableDues: {
            $sum: { $cond: [{ $eq: ["$category", "payable"] }, 1, 0] }
          },
          nonPayableDues: {
            $sum: { $cond: [{ $eq: ["$category", "non-payable"] }, 1, 0] }
          },
          payableAmount: {
            $sum: { $cond: [{ $eq: ["$category", "payable"] }, "$amount", 0] }
          },
          nonPayableAmount: {
            $sum: { $cond: [{ $eq: ["$category", "non-payable"] }, "$amount", 0] }
          },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    console.log("📊 Department stats aggregation result:", deptStats);

    const breakdown = deptStats[0] || {
      totalDues: 0,
      payableDues: 0,
      nonPayableDues: 0,
      payableAmount: 0,
      nonPayableAmount: 0,
      totalAmount: 0
    };

    // Department-specific dues
    const deptDues = breakdown.totalDues;

    // All other pending dues
    const externalDues = await Dues.countDocuments({
      department: { $ne: departmentName },
      status: "pending"
    });

    const response = {
      totalStudents,
      deptDues,
      externalDues,
      pendingAmount: breakdown.totalAmount,
      breakdown: {
        payableDues: breakdown.payableDues,
        nonPayableDues: breakdown.nonPayableDues,
        payableAmount: breakdown.payableAmount,
        nonPayableAmount: breakdown.nonPayableAmount,
        totalDues: breakdown.totalDues,
        totalAmount: breakdown.totalAmount
      }
    };

    console.log("📊 Sending response:", JSON.stringify(response, null, 2));

    res.json(response);

  } catch (err) {
    console.error("❌ Error in getStats:", err);
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};


exports.clearDue = async (req, res) => {
  try {
    console.log("➡️ ClearDue called with ID:", req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Due ID" });
    }

    const due = await Dues.findById(req.params.id);
    if (!due) {
      return res.status(404).json({ message: "Due not found" });
    }

    console.log("✅ Due found:", due);

    // NEW LOGIC: Check if due is payable
    // If payable -> require payment to be done
    // If non-payable -> can clear directly
    if (due.category === "payable" && due.paymentStatus !== "done") {
      console.log("❌ Payable due - Payment not done, current status:", due.paymentStatus);
      return res.status(400).json({ 
        message: "Payment must be completed before clearing this due (Payable category)" 
      });
    }

    // For non-payable dues, operator can clear directly
    due.status = "cleared";
    due.clearDate = new Date();

    await due.save();

    console.log("✅ Due cleared:", due._id);
    res.json({ 
      message: due.category === "payable" 
        ? "Payable due cleared successfully (after payment)" 
        : "Non-payable due cleared successfully",
      due 
    });
  } catch (err) {
    console.error("❌ Error clearing due:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// 📄 Get all dues (for accounts & academics)
exports.getAllDues = async (req, res) => {
  try {
    const dues = await Dues.find()
      .populate("personId", "name rollNumber email");

    res.status(200).json(dues);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// ✅ Update payment status (only accounts operator)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    console.log("Update payment status called:", { id, paymentStatus });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid due ID" });
    }

    if (!["done", "due"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status. Must be 'done' or 'due'" });
    }

    const due = await Dues.findById(id);
    if (!due) {
      return res.status(404).json({ message: "Due not found" });
    }

    // Prevent changing from "done" back to "due"
    if (due.paymentStatus === "done" && paymentStatus === "due") {
      return res.status(400).json({ 
        message: "Cannot change payment status back to unpaid once marked as paid" 
      });
    }

    due.paymentStatus = paymentStatus;
    await due.save();

    console.log("Payment status updated successfully:", due._id);

    res.status(200).json({ 
      message: "Payment status updated successfully", 
      due 
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// GET total pending amount for a department
exports.getTotalPendingAmount = async (req, res) => {
  try {
    const { department } = req.params;

    const totalPendingAgg = await Dues.aggregate([
      { $match: { department, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({ total: totalPendingAgg[0]?.total || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching total pending amount", error: err.message });
  }
};

// Get all students with due status (for accounts operator)
exports.getAllStudentsWithDueStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "department_operator") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Use aggregation pipeline for better performance
    const studentsWithDueStatus = await Student.aggregate([
      {
        $lookup: {
          from: "academicyears", // MongoDB pluralizes collection names
          localField: "academicYear",
          foreignField: "_id",
          as: "academicYearData"
        }
      },
      {
        $unwind: {
          path: "$academicYearData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "dues",
          let: { rollNumber: "$rollNumber" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$personId", "$$rollNumber"] },
                    { $eq: ["$status", "pending"] }
                  ]
                }
              }
            },
            {
              $count: "pendingCount"
            }
          ],
          as: "pendingDues"
        }
      },
      {
        $addFields: {
          hasPendingDues: {
            $cond: {
              if: { $gt: [{ $size: "$pendingDues" }, 0] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          rollNumber: 1,
          name: 1,
          academicYear: {
            from: { $ifNull: ["$academicYearData.from", 0] },
            to: { $ifNull: ["$academicYearData.to", 0] }
          },
          section: 1,
          department: "$branch",
          hasPendingDues: 1
        }
      },
      {
        $sort: { rollNumber: 1 }
      }
    ]);

    res.status(200).json(studentsWithDueStatus);
  } catch (error) {
    console.error("Error fetching all students:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all dues for a specific student (for accounts operator)
exports.getAllStudentDues = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "department_operator" || req.user.department !== "ACCOUNTS") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { rollNumber } = req.params;

    // Verify student exists
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get student details
    const studentDetails = {
      name: student.name,
      rollNumber: student.rollNumber,
      fatherName: student.fatherName,
      mobile: student.mobile
    };

    // Get dues for this student from all departments
    const dues = await Dues.find({
      personId: rollNumber,
      personType: "Student"
    }).sort({ category: 1, dueDate: 1 }); // sort by category then due date

    res.status(200).json({
      student: studentDetails,
      dues
    });
  } catch (error) {
    console.error("Error fetching all student dues:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// NEW: Download Sample Excel for Dues (for operators)
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
        'link': 'https://drive.google.com/...',
        'dueType': 'library-fine'
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
        'link': '',
        'dueType': 'lab-equipment'
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
      { wch: 40 }, // link
      { wch: 20 }  // dueType
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

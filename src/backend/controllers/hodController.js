const Student = require("../models/Student");
const Dues = require("../models/Due");
const Faculty = require("../models/Faculty");

// Get all students in HOD's department with due status
exports.getStudents = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "hod") {
      return res.status(403).json({ message: "Access denied" });
    }

    const hodDepartment = req.user.hodDepartment || req.user.department;
    
    if (!hodDepartment) {
      return res.status(400).json({ message: "HOD department not set" });
    }

    const students = await Student.aggregate([
      {
        $match: { branch: hodDepartment }
      },
      {
        $lookup: {
          from: "academicyears",
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
            from: "$academicYearData.from",
            to: "$academicYearData.to"
          },
          section: 1,
          hasPendingDues: 1
        }
      },
      {
        $sort: { rollNumber: 1 }
      }
    ]);

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get department statistics for HOD
exports.getDepartmentStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "hod") {
      return res.status(403).json({ message: "Access denied" });
    }

    const hodDepartment = req.user.hodDepartment || req.user.department;
    
    if (!hodDepartment) {
      return res.status(400).json({ message: "HOD department not set" });
    }

    // Get total students in department
    const totalStudents = await Student.countDocuments({ branch: hodDepartment });

    // Get students with their dues
    const studentsWithDues = await Student.aggregate([
      { $match: { branch: hodDepartment } },
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
            }
          ],
          as: "pendingDues"
        }
      },
      {
        $project: {
          rollNumber: 1,
          hasDues: { $gt: [{ $size: "$pendingDues" }, 0] }
        }
      }
    ]);

    const studentsWithPendingDues = studentsWithDues.filter(s => s.hasDues).length;

    // Get dues breakdown for department students
    const studentRollNumbers = studentsWithDues.map(s => s.rollNumber);

    const duesBreakdown = await Dues.aggregate([
      {
        $match: {
          personId: { $in: studentRollNumbers },
          personType: "Student",
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

    const breakdown = duesBreakdown[0] || {
      totalDues: 0,
      payableDues: 0,
      nonPayableDues: 0,
      payableAmount: 0,
      nonPayableAmount: 0,
      totalAmount: 0
    };

    res.json({
      departmentName: hodDepartment,
      totalStudents,
      studentsWithDues: studentsWithPendingDues,
      studentsWithoutDues: totalStudents - studentsWithPendingDues,
      breakdown
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get student details with dues
exports.getStudentDues = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "hod") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { rollNumber } = req.params;
    const hodDepartment = req.user.hodDepartment || req.user.department;

    const student = await Student.findOne({ 
      rollNumber,
      branch: hodDepartment 
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found in your department" });
    }

    const studentDetails = {
      name: student.name,
      rollNumber: student.rollNumber,
      fatherName: student.fatherName,
      mobile: student.mobile
    };

    const dues = await Dues.find({
      personId: rollNumber,
      personType: "Student"
    }).sort({ category: 1, dueDate: 1 });

    res.json({
      student: studentDetails,
      dues
    });
  } catch (error) {
    console.error("Error fetching student dues:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

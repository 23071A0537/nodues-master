import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../operator/OperatorDashboard.css";

interface Student {
  _id: string;
  rollNumber: string;
  name: string;
  academicYear: { from: number; to: number };
  section: string;
  hasPendingDues: boolean;
}

interface DepartmentStats {
  departmentName: string;
  totalStudents: number;
  studentsWithDues: number;
  studentsWithoutDues: number;
  breakdown: {
    totalDues: number;
    payableDues: number;
    nonPayableDues: number;
    payableAmount: number;
    nonPayableAmount: number;
    totalAmount: number;
  };
}

const HODDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [departmentStats, setDepartmentStats] =
    useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Search filters
  const [searchRollNumber, setSearchRollNumber] = useState("");
  const [searchAcademicYear, setSearchAcademicYear] = useState("");
  const [searchSection, setSearchSection] = useState("");
  const [dueStatusFilter, setDueStatusFilter] = useState<
    "all" | "withDues" | "noDues"
  >("all");

  useEffect(() => {
    fetchStudents();
    fetchDepartmentStats();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = students;

    if (searchRollNumber) {
      filtered = filtered.filter((student) =>
        student.rollNumber
          .toLowerCase()
          .includes(searchRollNumber.toLowerCase())
      );
    }

    if (searchAcademicYear) {
      filtered = filtered.filter(
        (student) =>
          student.academicYear.from.toString().includes(searchAcademicYear) ||
          student.academicYear.to.toString().includes(searchAcademicYear)
      );
    }

    if (searchSection) {
      filtered = filtered.filter((student) =>
        student.section.toLowerCase().includes(searchSection.toLowerCase())
      );
    }

    // Filter by due status
    if (dueStatusFilter === "withDues") {
      filtered = filtered.filter((student) => student.hasPendingDues);
    } else if (dueStatusFilter === "noDues") {
      filtered = filtered.filter((student) => !student.hasPendingDues);
    }

    setFilteredStudents(filtered);
  }, [
    students,
    searchRollNumber,
    searchAcademicYear,
    searchSection,
    dueStatusFilter,
  ]);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/hod/students");
      setStudents(res.data);
      setFilteredStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentStats = async () => {
    try {
      const res = await api.get("/hod/department-stats");
      setDepartmentStats(res.data);
    } catch (err) {
      console.error("Failed to fetch department stats", err);
    }
  };

  const handleStudentClick = (rollNumber: string) => {
    navigate(`/hod/student/${rollNumber}`);
  };

  if (loading) {
    return (
      <div className="operator-main-content">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="operator-main-content">
      <header className="operator-dashboard-header">
        <h1>👨‍🏫 HOD Dashboard</h1>
        <p>View and manage student dues in your department</p>
      </header>

      {/* NEW: Department Statistics Table */}
      {departmentStats && (
        <section style={{ marginBottom: "30px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#4f46e5",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            📊 {departmentStats.departmentName} Department Overview
          </h2>

          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#4338ca",
                }}
              >
                {departmentStats.totalStudents}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#3730a3",
                  fontWeight: "600",
                }}
              >
                Total Students
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#dc2626",
                }}
              >
                {departmentStats.studentsWithDues}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#991b1b",
                  fontWeight: "600",
                }}
              >
                Students with Dues
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#16a34a",
                }}
              >
                {departmentStats.studentsWithoutDues}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#166534",
                  fontWeight: "600",
                }}
              >
                Students No Dues
              </div>
            </div>
          </div>

          {/* Dues Breakdown Table */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#eef2ff" }}>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontWeight: "700",
                      color: "#4338ca",
                      fontSize: "14px",
                      borderBottom: "2px solid #c7d2fe",
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontWeight: "700",
                      color: "#4338ca",
                      fontSize: "14px",
                      borderBottom: "2px solid #c7d2fe",
                    }}
                  >
                    Number of Dues
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#4338ca",
                      fontSize: "14px",
                      borderBottom: "2px solid #c7d2fe",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{ transition: "background-color 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fef3c7")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  <td
                    style={{
                      padding: "16px",
                      fontWeight: "600",
                      color: "#1f2937",
                      fontSize: "14px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        backgroundColor: "#fef3c7",
                        color: "#d97706",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      Payable Dues
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#d97706",
                      fontSize: "16px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {departmentStats.breakdown.payableDues}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#d97706",
                      fontSize: "16px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    ₹{departmentStats.breakdown.payableAmount.toLocaleString()}
                  </td>
                </tr>

                <tr
                  style={{ transition: "background-color 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e0e7ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  <td
                    style={{
                      padding: "16px",
                      fontWeight: "600",
                      color: "#1f2937",
                      fontSize: "14px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        backgroundColor: "#e0e7ff",
                        color: "#4338ca",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      Non-Payable Dues
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#4338ca",
                      fontSize: "16px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {departmentStats.breakdown.nonPayableDues}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "right",
                      fontWeight: "700",
                      color: "#4338ca",
                      fontSize: "16px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    ₹
                    {departmentStats.breakdown.nonPayableAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#f3f4f6", fontWeight: "700" }}>
                  <td
                    style={{
                      padding: "16px",
                      color: "#1f2937",
                      fontSize: "15px",
                      borderTop: "2px solid #c7d2fe",
                    }}
                  >
                    TOTAL
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#dc2626",
                      fontSize: "17px",
                      borderTop: "2px solid #c7d2fe",
                    }}
                  >
                    {departmentStats.breakdown.totalDues}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "right",
                      color: "#dc2626",
                      fontSize: "17px",
                      borderTop: "2px solid #c7d2fe",
                    }}
                  >
                    ₹{departmentStats.breakdown.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {/* Search Filters */}
      <div
        style={{
          marginBottom: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151",
              fontSize: "14px",
            }}
          >
            Roll Number:
          </label>
          <input
            type="text"
            value={searchRollNumber}
            onChange={(e) => setSearchRollNumber(e.target.value)}
            placeholder="Search roll number"
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              transition: "border-color 0.2s",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151",
              fontSize: "14px",
            }}
          >
            Academic Year:
          </label>
          <input
            type="text"
            value={searchAcademicYear}
            onChange={(e) => setSearchAcademicYear(e.target.value)}
            placeholder="e.g., 2023"
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              transition: "border-color 0.2s",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151",
              fontSize: "14px",
            }}
          >
            Section:
          </label>
          <input
            type="text"
            value={searchSection}
            onChange={(e) => setSearchSection(e.target.value)}
            placeholder="e.g., A, B"
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              transition: "border-color 0.2s",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151",
              fontSize: "14px",
            }}
          >
            Due Status:
          </label>
          <select
            value={dueStatusFilter}
            onChange={(e) =>
              setDueStatusFilter(
                e.target.value as "all" | "withDues" | "noDues"
              )
            }
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "white",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All Students</option>
            <option value="withDues">With Pending Dues</option>
            <option value="noDues">No Dues</option>
          </select>
        </div>
      </div>

      {/* Summary Info */}
      <div
        style={{
          marginBottom: "20px",
          padding: "12px 16px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          color: "#0c4a6e",
          fontSize: "14px",
          fontWeight: "500",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span>
          Showing {filteredStudents.length} of {students.length} students
        </span>
        <span>
          With Dues: {filteredStudents.filter((s) => s.hasPendingDues).length}
        </span>
        <span>
          No Dues: {filteredStudents.filter((s) => !s.hasPendingDues).length}
        </span>
      </div>

      {/* Students Table */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 20px 0 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              margin: "0",
              color: "#1f2937",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Students in Your Department
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Click on a student's roll number to view detailed information
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "16px 20px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Roll Number
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "16px 20px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "16px 20px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Academic Year
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "16px 20px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Section
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "16px 20px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Due Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student._id}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                  onClick={() => handleStudentClick(student.rollNumber)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <td
                    style={{
                      padding: "16px 20px",
                      color: "#4f46e5",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    {student.rollNumber}
                  </td>
                  <td
                    style={{
                      padding: "16px 20px",
                      color: "#1f2937",
                      fontSize: "14px",
                    }}
                  >
                    {student.name}
                  </td>
                  <td
                    style={{
                      padding: "16px 20px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {student.academicYear.from}-{student.academicYear.to}
                  </td>
                  <td
                    style={{
                      padding: "16px 20px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {student.section}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: student.hasPendingDues
                          ? "#fef2f2"
                          : "#f0fdf4",
                        color: student.hasPendingDues ? "#dc2626" : "#16a34a",
                        border: `1px solid ${
                          student.hasPendingDues ? "#fecaca" : "#bbf7d0"
                        }`,
                      }}
                    >
                      {student.hasPendingDues ? "Due" : "No Due"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <p>No students found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HODDashboard;

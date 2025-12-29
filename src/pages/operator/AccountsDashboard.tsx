import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../operator/OperatorDashboard.css";

interface Student {
  _id: string;
  rollNumber: string;
  name: string;
  academicYear?: { from: number; to: number }; // Make it optional
  section: string;
  department: string;
  hasPendingDues: boolean;
}

const AccountsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search filters
  const [searchRollNumber, setSearchRollNumber] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [dueStatusFilter, setDueStatusFilter] = useState<
    "all" | "pending" | "cleared"
  >("all");

  useEffect(() => {
    fetchStudents();
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

    if (searchName) {
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchDepartment) {
      filtered = filtered.filter((student) =>
        student.department
          .toLowerCase()
          .includes(searchDepartment.toLowerCase())
      );
    }

    if (dueStatusFilter === "pending") {
      filtered = filtered.filter((student) => student.hasPendingDues);
    } else if (dueStatusFilter === "cleared") {
      filtered = filtered.filter((student) => !student.hasPendingDues);
    }

    setFilteredStudents(filtered);
  }, [
    students,
    searchRollNumber,
    searchName,
    searchDepartment,
    dueStatusFilter,
  ]);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/operator/all-students");
      if (!Array.isArray(res.data)) {
        throw new Error("Invalid response format");
      }
      setStudents(res.data);
      setFilteredStudents(res.data);
    } catch (err: any) {
      console.error("Failed to fetch students", err);
      setError(err?.response?.data?.message || "Failed to load students");
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (rollNumber: string) => {
    navigate(`/operator/student/${rollNumber}`);
  };

  if (loading) {
    return (
      <div className="operator-main-content">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="operator-main-content">
        <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>
          <p>{error}</p>
          <button
            onClick={fetchStudents}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="operator-main-content">
      <header className="operator-dashboard-header">
        <h1>💰 Accounts Dashboard</h1>
        <p>
          Search students and manage payment clearance across all departments
        </p>
      </header>

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
            Student Name:
          </label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search by name"
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
            Department:
          </label>
          <input
            type="text"
            value={searchDepartment}
            onChange={(e) => setSearchDepartment(e.target.value)}
            placeholder="e.g., CSE, ECE"
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
                e.target.value as "all" | "pending" | "cleared"
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
            <option value="pending">With Pending Dues</option>
            <option value="cleared">No Dues</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
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
            All Students
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Click on a student's roll number to view detailed information and
            manage dues
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
                  Department
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
                    {student.academicYear
                      ? `${student.academicYear.from}-${student.academicYear.to}`
                      : "N/A"}
                  </td>
                  <td
                    style={{
                      padding: "16px 20px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {student.department || "N/A"}
                  </td>
                  <td
                    style={{
                      padding: "16px 20px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {student.section || "N/A"}
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

export default AccountsDashboard;

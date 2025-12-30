import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./OperatorDashboard.css";

interface Student {
  _id: string;
  rollNumber: string;
  name: string;
  academicYear?: { from: number; to: number };
  section: string;
  department: string;
  hasPendingDues: boolean;
}

const AccountsStudentDues: React.FC = () => {
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
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading student dues...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">📚 Student Dues Management</h2>

      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="dashboard-filters">
        <input
          type="text"
          placeholder="🔍 Search by Roll Number..."
          value={searchRollNumber}
          onChange={(e) => setSearchRollNumber(e.target.value)}
          className="dashboard-input"
        />
        <input
          type="text"
          placeholder="🔍 Search by Name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="dashboard-input"
        />
        <input
          type="text"
          placeholder="🔍 Search by Department..."
          value={searchDepartment}
          onChange={(e) => setSearchDepartment(e.target.value)}
          className="dashboard-input"
        />
        <select
          value={dueStatusFilter}
          onChange={(e) =>
            setDueStatusFilter(e.target.value as "all" | "pending" | "cleared")
          }
          className="dashboard-select"
        >
          <option value="all">All Students</option>
          <option value="pending">With Pending Dues</option>
          <option value="cleared">Cleared</option>
        </select>
      </div>

      {/* Summary */}
      <div className="dashboard-summary">
        <p>
          <strong>Total Students:</strong> {filteredStudents.length} /{" "}
          {students.length}
        </p>
        <p>
          <strong>With Pending Dues:</strong>{" "}
          {filteredStudents.filter((s) => s.hasPendingDues).length}
        </p>
        <p>
          <strong>Dues Cleared:</strong>{" "}
          {filteredStudents.filter((s) => !s.hasPendingDues).length}
        </p>
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          No students found
        </p>
      ) : (
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Name</th>
                <th>Department</th>
                <th>Section</th>
                <th>Pending Dues</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student._id}
                  className={
                    student.hasPendingDues
                      ? "dashboard-row-pending"
                      : "dashboard-row-cleared"
                  }
                >
                  <td>{student.rollNumber}</td>
                  <td>{student.name}</td>
                  <td>{student.department}</td>
                  <td>{student.section}</td>
                  <td>
                    {student.hasPendingDues ? (
                      <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                        ✓ Yes
                      </span>
                    ) : (
                      <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                        ✓ No
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="dashboard-btn-view"
                      onClick={() => handleStudentClick(student.rollNumber)}
                    >
                      View Dues
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountsStudentDues;

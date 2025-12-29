import React, { useState } from "react";
import api from "../api";
import "./StudentDuesLookup.css";

interface Due {
  _id: string;
  department: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface DepartmentDues {
  department: string;
  dues: Due[];
}

const StudentDuesLookup: React.FC = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [departmentDues, setDepartmentDues] = useState<DepartmentDues[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await api.get(`/public/student-dues/${rollNumber}`);
      setStudentName(response.data.name);
      setDepartmentDues(response.data.departmentDues);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch dues");
      setDepartmentDues([]);
      setStudentName("");
    }
    setLoading(false);
  };

  return (
    <div className="student-lookup-container">
      <div className="student-lookup-card">
        <h1>Check Your Dues Status</h1>
        <p className="student-lookup-subtitle">
          Enter your roll number to view pending dues
        </p>

        <form onSubmit={handleSubmit} className="student-lookup-form">
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Enter Roll Number"
            className="student-lookup-input"
          />
          <button
            type="submit"
            className="student-lookup-button"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Dues"}
          </button>
        </form>

        {error && <div className="student-lookup-error">{error}</div>}

        {searched && !error && (
          <div className="student-lookup-results">
            {studentName && <h2>Dues Status for {studentName}</h2>}

            <table className="student-lookup-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {departmentDues.map((dept) => (
                  <tr key={dept.department}>
                    <td>{dept.department}</td>
                    <td
                      className={
                        dept.dues.length === 0 ? "no-dues" : "has-dues"
                      }
                    >
                      {dept.dues.length === 0
                        ? "No Dues"
                        : `${dept.dues.length} Due(s)`}
                    </td>
                    <td>
                      {dept.dues.length > 0 ? (
                        <ul className="dues-list">
                          {dept.dues.map((due) => (
                            <li key={due._id}>
                              {due.description} - ₹{due.amount}
                              <br />
                              <small>
                                Due Date:{" "}
                                {new Date(due.dueDate).toLocaleDateString()}
                              </small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "✓ Cleared"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="student-lookup-footer">
          <a href="/login" className="student-lookup-login-link">
            Login to Management Portal
          </a>
        </div>
      </div>
    </div>
  );
};

export default StudentDuesLookup;

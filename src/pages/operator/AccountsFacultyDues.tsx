import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./OperatorDashboard.css";

interface Faculty {
  _id: string;
  facultyId: string;
  name: string;
  email: string;
  department?: { name: string };
  totalDues: number;
  totalAmount: number;
  paymentDue: boolean;
}

const AccountsFacultyDues: React.FC = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search filters
  const [searchFacultyId, setSearchFacultyId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [dueStatusFilter, setDueStatusFilter] = useState<
    "all" | "pending" | "no-dues"
  >("all");

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = faculty;

    if (searchFacultyId) {
      filtered = filtered.filter((f) =>
        f.facultyId.toLowerCase().includes(searchFacultyId.toLowerCase())
      );
    }

    if (searchName) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (dueStatusFilter === "pending") {
      filtered = filtered.filter((f) => f.totalDues > 0);
    } else if (dueStatusFilter === "no-dues") {
      filtered = filtered.filter((f) => f.totalDues === 0);
    }

    setFilteredFaculty(filtered);
  }, [faculty, searchFacultyId, searchName, dueStatusFilter]);

  const fetchFaculty = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/operator/all-faculty");
      if (!Array.isArray(res.data)) {
        throw new Error("Invalid response format");
      }
      setFaculty(res.data);
      setFilteredFaculty(res.data);
    } catch (err: any) {
      console.error("Failed to fetch faculty", err);
      setError(err?.response?.data?.message || "Failed to load faculty");
      setFaculty([]);
      setFilteredFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyClick = (facultyId: string) => {
    navigate(`/operator/faculty/${facultyId}`);
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading faculty dues...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">👨‍🏫 Faculty Dues Management</h2>

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
          placeholder="🔍 Search by Faculty ID..."
          value={searchFacultyId}
          onChange={(e) => setSearchFacultyId(e.target.value)}
          className="dashboard-input"
        />
        <input
          type="text"
          placeholder="🔍 Search by Name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="dashboard-input"
        />
        <select
          value={dueStatusFilter}
          onChange={(e) =>
            setDueStatusFilter(e.target.value as "all" | "pending" | "no-dues")
          }
          className="dashboard-select"
        >
          <option value="all">All Faculty</option>
          <option value="pending">With Pending Dues</option>
          <option value="no-dues">No Dues</option>
        </select>
      </div>

      {/* Summary */}
      <div className="dashboard-summary">
        <p>
          <strong>Total Faculty:</strong> {filteredFaculty.length} /{" "}
          {faculty.length}
        </p>
        <p>
          <strong>With Pending Dues:</strong>{" "}
          {filteredFaculty.filter((f) => f.totalDues > 0).length}
        </p>
        <p>
          <strong>Total Amount Due:</strong> ₹
          {filteredFaculty
            .filter((f) => f.totalDues > 0)
            .reduce((sum, f) => sum + f.totalAmount, 0)}
        </p>
      </div>

      {/* Faculty Table */}
      {filteredFaculty.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          No faculty found
        </p>
      ) : (
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Faculty ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>No. of Dues</th>
                <th>Total Amount (₹)</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((f) => (
                <tr
                  key={f._id}
                  className={
                    f.totalDues > 0
                      ? "dashboard-row-pending"
                      : "dashboard-row-cleared"
                  }
                >
                  <td>{f.facultyId}</td>
                  <td>{f.name}</td>
                  <td>{f.email}</td>
                  <td>{f.department?.name || "N/A"}</td>
                  <td>
                    <strong>{f.totalDues}</strong>
                  </td>
                  <td>
                    <strong>₹{f.totalAmount}</strong>
                  </td>
                  <td>
                    {f.paymentDue ? (
                      <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                        ⚠️ Due
                      </span>
                    ) : (
                      <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                        ✓ Clear
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="dashboard-btn-view"
                      onClick={() => handleFacultyClick(f.facultyId)}
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

export default AccountsFacultyDues;

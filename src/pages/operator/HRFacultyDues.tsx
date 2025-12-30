import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./HRFacultyDues.css";

interface FacultyDue {
  _id: string;
  personName: string;
  personId: string;
  department: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentStatus: string;
  dateAdded: string;
  dueType?: string;
  category?: string;
}

const HRFacultyDues: React.FC = () => {
  const navigate = useNavigate();
  const [dues, setDues] = useState<FacultyDue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    fetchFacultyDues();
  }, []);

  const fetchFacultyDues = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/operator/hr/faculty-dues");
      setDues(res.data);
    } catch (err) {
      setError("Failed to load faculty dues ❌");
    }
    setLoading(false);
  };

  const filteredDues = dues.filter((d) => {
    const matchesSearch =
      d.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.personId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredDues.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2
        style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "20px" }}
      >
        👨‍🏫 Faculty Dues Management
      </h2>

      {/* Filters */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "10px 14px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            flex: 1,
            minWidth: "200px",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="cleared">Cleared</option>
        </select>
      </div>

      {/* Summary */}
      <div
        style={{
          marginBottom: "20px",
          padding: "16px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: "0 0 8px 0", color: "#0c4a6e", fontWeight: "600" }}>
          📊 Summary
        </p>
        <p style={{ margin: "4px 0", color: "#0369a1" }}>
          <strong>Total Dues Shown:</strong> {filteredDues.length}
        </p>
        <p style={{ margin: "4px 0", color: "#0369a1" }}>
          <strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading faculty dues...</p>
      ) : error ? (
        <p style={{ color: "#dc2626" }}>{error}</p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                  Name
                </th>
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
                  Employee ID
                </th>
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
                  Department
                </th>
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
                  Description
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
                  Status
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDues.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    No faculty dues found
                  </td>
                </tr>
              ) : (
                filteredDues.map((d) => (
                  <tr
                    key={d._id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    <td style={{ padding: "16px", color: "#1f2937" }}>
                      {d.personName}
                    </td>
                    <td style={{ padding: "16px", color: "#1f2937" }}>
                      {d.personId}
                    </td>
                    <td style={{ padding: "16px", color: "#6b7280" }}>
                      {d.department}
                    </td>
                    <td style={{ padding: "16px", color: "#6b7280" }}>
                      {d.description}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      ₹{d.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor:
                            d.status === "pending" ? "#fef2f2" : "#f0fdf4",
                          color: d.status === "pending" ? "#dc2626" : "#16a34a",
                        }}
                      >
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <button
                        onClick={() =>
                          navigate(`/operator/hr-faculty/${d.personId}`)
                        }
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HRFacultyDues;

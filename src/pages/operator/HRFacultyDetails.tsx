import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";

interface FacultyDetail {
  _id: string;
  personName: string;
  personId: string;
  department: string;
  dues: Array<{
    _id: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
}

const HRFacultyDetails: React.FC = () => {
  const { facultyId } = useParams();
  const [faculty, setFaculty] = useState<FacultyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFacultyDetails = async () => {
      try {
        const res = await api.get(`/operator/hr/faculty/${facultyId}`);
        setFaculty(res.data);
      } catch (err) {
        setError("Failed to load faculty details ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchFacultyDetails();
  }, [facultyId]);

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;
  if (error)
    return <div style={{ padding: "20px", color: "#dc2626" }}>{error}</div>;
  if (!faculty) return <div style={{ padding: "20px" }}>Faculty not found</div>;

  const totalDues = faculty.dues.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2
        style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "20px" }}
      >
        Faculty Details
      </h2>

      {/* Faculty Info */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{ fontWeight: "600", color: "#6b7280", fontSize: "12px" }}
            >
              Name
            </label>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "16px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              {faculty.personName}
            </p>
          </div>
          <div>
            <label
              style={{ fontWeight: "600", color: "#6b7280", fontSize: "12px" }}
            >
              Employee ID
            </label>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "16px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              {faculty.personId}
            </p>
          </div>
          <div>
            <label
              style={{ fontWeight: "600", color: "#6b7280", fontSize: "12px" }}
            >
              Department
            </label>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "16px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              {faculty.department}
            </p>
          </div>
          <div>
            <label
              style={{ fontWeight: "600", color: "#6b7280", fontSize: "12px" }}
            >
              Total Dues
            </label>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "16px",
                fontWeight: "700",
                color: "#dc2626",
              }}
            >
              ₹{totalDues.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Dues List */}
      <h3
        style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}
      >
        Dues
      </h3>
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
                  textAlign: "left",
                  fontWeight: "700",
                  color: "#4338ca",
                  fontSize: "14px",
                  borderBottom: "2px solid #c7d2fe",
                }}
              >
                Due Date
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
            </tr>
          </thead>
          <tbody>
            {faculty.dues.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  No dues found
                </td>
              </tr>
            ) : (
              faculty.dues.map((due) => (
                <tr key={due._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "16px", color: "#1f2937" }}>
                    {due.description}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#1f2937",
                    }}
                  >
                    ₹{due.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "16px", color: "#6b7280" }}>
                    {new Date(due.dueDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor:
                          due.status === "pending" ? "#fef2f2" : "#f0fdf4",
                        color: due.status === "pending" ? "#dc2626" : "#16a34a",
                      }}
                    >
                      {due.status.charAt(0).toUpperCase() + due.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRFacultyDetails;

import React, { useEffect, useState } from "react";
import api from "../../api";

interface FacultyStats {
  totalFaculty: number;
  facultyWithDues: number;
  totalDuesAmount: number;
}

const HRFacultyDashboard: React.FC = () => {
  const [stats, setStats] = useState<FacultyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/operator/hr/faculty-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch HR stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2
        style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "20px" }}
      >
        👨‍💼 HR Faculty Management Dashboard
      </h2>

      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "30px",
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
              style={{ fontSize: "2rem", fontWeight: "700", color: "#4338ca" }}
            >
              {stats.totalFaculty}
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                color: "#3730a3",
                fontWeight: "600",
              }}
            >
              Total Faculty
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
              style={{ fontSize: "2rem", fontWeight: "700", color: "#dc2626" }}
            >
              {stats.facultyWithDues}
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                color: "#991b1b",
                fontWeight: "600",
              }}
            >
              Faculty with Dues
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              padding: "20px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
            }}
          >
            <div
              style={{ fontSize: "2rem", fontWeight: "700", color: "#d97706" }}
            >
              ₹{stats.totalDuesAmount.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                color: "#92400e",
                fontWeight: "600",
              }}
            >
              Total Dues Amount
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          padding: "16px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          color: "#0c4a6e",
        }}
      >
        <p style={{ margin: "0", fontWeight: "600" }}>ℹ️ HR Dashboard</p>
        <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
          Manage faculty dues and track all faculty-related financial matters
          for the HR department.
        </p>
      </div>
    </div>
  );
};

export default HRFacultyDashboard;

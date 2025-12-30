import React, { useEffect, useState } from "react";
import api from "../../api";
import "../operator/OperatorDashboard.css";

interface Stats {
  totalFaculty: number;
  totalDues: number;
  totalPendingAmount: number;
  facultyWithDues: number;
  payableDues: number;
  nonPayableDues: number;
}

const HRDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalFaculty: 0,
    totalDues: 0,
    totalPendingAmount: 0,
    facultyWithDues: 0,
    payableDues: 0,
    nonPayableDues: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch all faculty
      const facultyRes = await api.get("/operator/faculty");
      const allDuesRes = await api.get("/operator/all");

      const facultyList = facultyRes.data || [];
      const allDues = allDuesRes.data || [];

      // Filter faculty dues
      const facultyDues = allDues.filter(
        (d: any) => d.personType === "Faculty"
      );

      const totalPendingAmount = facultyDues
        .filter((d: any) => d.status === "pending")
        .reduce((sum: number, d: any) => sum + d.amount, 0);

      const facultyWithDuesSet = new Set(
        facultyDues.map((d: any) => d.personId)
      );

      setStats({
        totalFaculty: facultyList.length,
        totalDues: facultyDues.length,
        totalPendingAmount,
        facultyWithDues: facultyWithDuesSet.size,
        payableDues: facultyDues.filter((d: any) => d.category === "payable")
          .length,
        nonPayableDues: facultyDues.filter(
          (d: any) => d.category === "non-payable"
        ).length,
      });
    } catch (err: any) {
      console.error("Failed to fetch stats", err);
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading HR Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">👨‍💼 HR Dashboard</h2>

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

      {/* Stats Grid */}
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
            backgroundColor: "#eff6ff",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #3b82f6",
          }}
        >
          <div style={{ fontSize: "12px", color: "#1e40af" }}>
            Total Faculty
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "bold", color: "#1e40af" }}
          >
            {stats.totalFaculty}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fefce8",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #eab308",
          }}
        >
          <div style={{ fontSize: "12px", color: "#854d0e" }}>Total Dues</div>
          <div
            style={{ fontSize: "28px", fontWeight: "bold", color: "#854d0e" }}
          >
            {stats.totalDues}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fef2f2",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #dc2626",
          }}
        >
          <div style={{ fontSize: "12px", color: "#7f1d1d" }}>
            Total Pending Amount
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "bold", color: "#991b1b" }}
          >
            ₹{stats.totalPendingAmount}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fef3c7",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #d97706",
          }}
        >
          <div style={{ fontSize: "12px", color: "#78350f" }}>
            Faculty with Dues
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "bold", color: "#b45309" }}
          >
            {stats.facultyWithDues}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ecfdf5",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #16a34a",
          }}
        >
          <div style={{ fontSize: "12px", color: "#15803d" }}>Payable Dues</div>
          <div
            style={{ fontSize: "28px", fontWeight: "bold", color: "#16a34a" }}
          >
            {stats.payableDues}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#e0e7ff",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #4f46e5",
          }}
        >
          <div style={{ fontSize: "12px", color: "#3730a3" }}>
            Non-Payable Dues
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "bold", color: "#4f46e5" }}
          >
            {stats.nonPayableDues}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div
        style={{
          backgroundColor: "#f0f9ff",
          border: "1px solid #0284c7",
          padding: "16px",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <p style={{ margin: 0, color: "#0c4a6e", fontSize: "14px" }}>
          ℹ️ <strong>HR Department:</strong> You can add dues for faculty
          members. These will be managed by the Accounts department for payment
          processing and then cleared by their respective departments.
        </p>
      </div>
    </div>
  );
};

export default HRDashboard;

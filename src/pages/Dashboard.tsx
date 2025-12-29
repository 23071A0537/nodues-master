import React, { useEffect, useState } from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaUsers,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "./Dashboard.css";

type Stats = {
  totalUsers: number;
  departments: number;
  academicYears: number;
  students: number;
  faculty: number;
};

type DepartmentDueStats = {
  departmentName: string;
  payableDues: number;
  nonPayableDues: number;
  payableAmount: number;
  nonPayableAmount: number;
  totalDues: number;
  totalAmount: number;
};

type OverallStats = {
  totalPayableDues: number;
  totalNonPayableDues: number;
  totalPayableAmount: number;
  totalNonPayableAmount: number;
  totalDues: number;
  totalAmount: number;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [departmentDueStats, setDepartmentDueStats] = useState<
    DepartmentDueStats[]
  >([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard-stats");
        setStats(res.data);
      } catch (err: any) {
        setError("Failed to load dashboard stats.");
      }
    };

    const fetchDepartmentDueStats = async () => {
      try {
        const res = await api.get("/admin/department-due-stats");
        setDepartmentDueStats(res.data.departmentStats);
        setOverallStats(res.data.overallStats);
      } catch (err: any) {
        console.error("Failed to load department due stats", err);
      }
    };

    Promise.all([fetchStats(), fetchDepartmentDueStats()]).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading)
    return <div className="dashboard-loading">Loading Dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-welcome">
        <h1>Welcome, Admin!</h1>
        <p>
          Manage the institute efficiently with an overview of key metrics and
          quick actions.
        </p>
      </header>

      <section className="dashboard-stats-grid">
        <div
          className="stat-card users clickable"
          onClick={() => navigate("/admin/users")}
          style={{ cursor: "pointer" }}
          title="Click to manage users"
        >
          <FaUsers className="stat-icon" />
          <div>
            <p className="stat-number">{stats?.totalUsers}</p>
            <p className="stat-label">Total Users</p>
          </div>
        </div>

        <div
          className="stat-card departments clickable"
          onClick={() => navigate("/admin/departments")}
          style={{ cursor: "pointer" }}
          title="Click to manage departments"
        >
          <FaBuilding className="stat-icon" />
          <div>
            <p className="stat-number">{stats?.departments}</p>
            <p className="stat-label">Departments</p>
          </div>
        </div>

        <div
          className="stat-card academic-years clickable"
          onClick={() => navigate("/admin/academic-years")}
          style={{ cursor: "pointer" }}
          title="Click to manage academic years"
        >
          <FaCalendarAlt className="stat-icon" />
          <div>
            <p className="stat-number">{stats?.academicYears}</p>
            <p className="stat-label">Academic Years</p>
          </div>
        </div>

        <div
          className="stat-card students clickable"
          onClick={() => navigate("/admin/students")}
          style={{ cursor: "pointer" }}
          title="Click to manage students"
        >
          <FaGraduationCap className="stat-icon" />
          <div>
            <p className="stat-number">{stats?.students}</p>
            <p className="stat-label">Students</p>
          </div>
        </div>

        <div
          className="stat-card faculty clickable"
          onClick={() => navigate("/admin/faculty")}
          style={{ cursor: "pointer" }}
          title="Click to manage faculty"
        >
          <FaChalkboardTeacher className="stat-icon" />
          <div>
            <p className="stat-number">{stats?.faculty}</p>
            <p className="stat-label">Faculty</p>
          </div>
        </div>
      </section>

      {/* Department-wise Due Statistics */}
      {overallStats && (
        <section style={{ marginTop: "40px" }}>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#4f46e5",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            📊 Department-wise Due Analysis
          </h2>

          {/* Overall Summary Cards */}
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
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#d97706",
                }}
              >
                {overallStats.totalPayableDues}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#92400e",
                  fontWeight: "600",
                }}
              >
                Total Payable Dues
              </div>
            </div>

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
                {overallStats.totalNonPayableDues}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#3730a3",
                  fontWeight: "600",
                }}
              >
                Total Non-Payable Dues
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
                ₹{overallStats.totalAmount.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#991b1b",
                  fontWeight: "600",
                }}
              >
                Total Pending Amount
              </div>
            </div>
          </div>

          {/* Department Table */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
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
                      Department
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        fontWeight: "700",
                        color: "#d97706",
                        fontSize: "14px",
                        borderBottom: "2px solid #c7d2fe",
                      }}
                    >
                      Payable Dues
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
                      Non-Payable Dues
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        fontWeight: "700",
                        color: "#dc2626",
                        fontSize: "14px",
                        borderBottom: "2px solid #c7d2fe",
                      }}
                    >
                      Total Amount
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        fontWeight: "700",
                        color: "#374151",
                        fontSize: "14px",
                        borderBottom: "2px solid #c7d2fe",
                      }}
                    >
                      Total Dues
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departmentDueStats.map((dept, index) => (
                    <tr
                      key={dept.departmentName}
                      style={{
                        backgroundColor: index % 2 === 0 ? "white" : "#f9fafb",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#eef2ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          index % 2 === 0 ? "white" : "#f9fafb")
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
                        {dept.departmentName}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          textAlign: "center",
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
                          {dept.payableDues}
                        </span>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#92400e",
                            marginTop: "4px",
                          }}
                        >
                          ₹{dept.payableAmount.toLocaleString()}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          textAlign: "center",
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
                          {dept.nonPayableDues}
                        </span>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#3730a3",
                            marginTop: "4px",
                          }}
                        >
                          ₹{dept.nonPayableAmount.toLocaleString()}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          textAlign: "right",
                          fontWeight: "700",
                          color: "#dc2626",
                          fontSize: "15px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        ₹{dept.totalAmount.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "14px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        {dept.totalDues}
                      </td>
                    </tr>
                  ))}
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
                        color: "#d97706",
                        fontSize: "15px",
                        borderTop: "2px solid #c7d2fe",
                      }}
                    >
                      {overallStats.totalPayableDues}
                      <div style={{ fontSize: "12px", marginTop: "2px" }}>
                        ₹{overallStats.totalPayableAmount.toLocaleString()}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        color: "#4338ca",
                        fontSize: "15px",
                        borderTop: "2px solid #c7d2fe",
                      }}
                    >
                      {overallStats.totalNonPayableDues}
                      <div style={{ fontSize: "12px", marginTop: "2px" }}>
                        ₹{overallStats.totalNonPayableAmount.toLocaleString()}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        textAlign: "right",
                        color: "#dc2626",
                        fontSize: "16px",
                        borderTop: "2px solid #c7d2fe",
                      }}
                    >
                      ₹{overallStats.totalAmount.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        color: "#374151",
                        fontSize: "15px",
                        borderTop: "2px solid #c7d2fe",
                      }}
                    >
                      {overallStats.totalDues}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="dashboard-actions">
        <Link to="/admin/users" className="action-btn">
          👥 Manage Users
        </Link>
        <Link to="/admin/departments" className="action-btn">
          🏢 Manage Departments
        </Link>
        <Link to="/admin/academic-years" className="action-btn">
          📅 Academic Years
        </Link>
        <Link to="/admin/students" className="action-btn">
          🎓 Manage Students
        </Link>
        <Link to="/admin/faculty" className="action-btn">
          👨‍🏫 Manage Faculty
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;

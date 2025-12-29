import React, { useEffect, useState } from "react";
import {
  FaCoins,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaUserGraduate,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// Removed import OperatorSidebar from "./OperatorSidebar";
import api from "../../api";
import "./OperatorDashboard.css";

interface DepartmentBreakdown {
  payableDues: number;
  nonPayableDues: number;
  payableAmount: number;
  nonPayableAmount: number;
  totalDues: number;
  totalAmount: number;
}

const OperatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [operatorName, setOperatorName] = useState("");
  const [operatorDept, setOperatorDept] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    deptDues: 0,
    externalDues: 0,
    pendingAmount: 0,
    breakdown: {
      payableDues: 0,
      nonPayableDues: 0,
      payableAmount: 0,
      nonPayableAmount: 0,
      totalDues: 0,
      totalAmount: 0,
    } as DepartmentBreakdown,
  });

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setOperatorName(user.email);
      setOperatorEmail(user.email);
      setOperatorDept(user.department || "N/A");
    }

    const fetchStats = async () => {
      try {
        const res = await api.get("/operator/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    fetchStats();
  }, []);

  // ✅ show external dept dues only for accounts or academic operator
  const canViewExternalDues =
    operatorDept === "ACCOUNTS" || operatorDept === "ACADEMICS";

  // Check if accounts operator
  const isAccountsOperator = operatorDept === "ACCOUNTS";
  const canViewAllDues =
    operatorDept === "ACCOUNTS" || operatorDept === "ACADEMICS";

  return (
    // Removed the outer div with className "operator-layout-container"
    // Removed the <OperatorSidebar /> component
    // Kept only the main content div
    <div className="operator-main-content">
      <header className="operator-dashboard-header">
        <h1>
          👋 Welcome, {operatorName}{" "}
          <span className="operator-dept">({operatorDept} Operator)</span>
        </h1>
        <p>Manage your department dues efficiently and track stats.</p>
      </header>

      {/* Special buttons for accounts operator */}
      {isAccountsOperator && (
        <div
          style={{
            marginBottom: "30px",
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/operator/accounts-dashboard")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.2s",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4338ca";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 8px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#4f46e5";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
            }}
          >
            💰 Manage All Students & Payments
          </button>
        </div>
      )}

      <section className="operator-stats-grid">
        <div className="stat-card students">
          <FaUserGraduate className="stat-icon" />
          <div>
            <p className="stat-number">{stats.totalStudents}</p>
            <p className="stat-label">Students across Institute</p>
          </div>
        </div>

        <div className="stat-card dept-dues">
          <FaCoins className="stat-icon" />
          <div>
            <p className="stat-number">{stats.deptDues}</p>
            <p className="stat-label">Dept. Dues</p>
          </div>
        </div>

        {/* ✅ Conditionally render this only for accounts/academic operator */}
        {canViewExternalDues && (
          <div className="stat-card external-dues">
            <FaFileInvoiceDollar className="stat-icon" />
            <div>
              <p className="stat-number">{stats.externalDues}</p>
              <p className="stat-label">External Dept. Dues</p>
            </div>
          </div>
        )}

        <div className="stat-card pending-amount">
          <FaMoneyBillWave className="stat-icon" />
          <div>
            <p className="stat-number">₹{stats.pendingAmount}</p>
            <p className="stat-label">Pending Amount</p>
          </div>
        </div>
      </section>

      {/* NEW: Department Dues Breakdown Table - Only show if breakdown exists */}
      {stats.breakdown && (
        <section style={{ marginTop: "40px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#4f46e5",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            📊 {operatorDept} Department - Dues Breakdown
          </h2>

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
                    {stats.breakdown.payableDues || 0}
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
                    ₹{(stats.breakdown.payableAmount || 0).toLocaleString()}
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
                    {stats.breakdown.nonPayableDues || 0}
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
                    ₹{(stats.breakdown.nonPayableAmount || 0).toLocaleString()}
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
                    {stats.breakdown.totalDues || 0}
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
                    ₹{(stats.breakdown.totalAmount || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default OperatorDashboard;

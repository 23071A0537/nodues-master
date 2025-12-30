import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import "../operator/OperatorDashboard.css";

interface Due {
  _id: string;
  description: string;
  amount: number;
  category: string;
  link: string;
  status: string;
  dueDate: string;
  department: string;
  paymentStatus: "due" | "done";
  dueType?: string;
}

interface StudentDetails {
  name: string;
  rollNumber: string;
  fatherName: string;
  mobile: string;
}

const AccountsStudentDetails: React.FC = () => {
  const { rollNumber } = useParams<{ rollNumber: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingPaymentId, setChangingPaymentId] = useState<string | null>(
    null
  );
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [pendingPaymentChange, setPendingPaymentChange] = useState<{
    dueId: string;
    newStatus: "due" | "done";
  } | null>(null);

  useEffect(() => {
    if (rollNumber) {
      fetchStudentDues();
    }
  }, [rollNumber]);

  const fetchStudentDues = async () => {
    try {
      const res = await api.get(`/operator/all-student/${rollNumber}/dues`);
      setStudent(res.data.student);
      setDues(res.data.dues || []);
    } catch (err) {
      console.error("Failed to fetch student dues", err);
      navigate("/operator/accounts-dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = async (
    dueId: string,
    newStatus: "due" | "done"
  ) => {
    const due = dues.find((d) => d._id === dueId);

    // If changing from "due" to "done", show confirmation
    if (due && due.paymentStatus === "due" && newStatus === "done") {
      setPendingPaymentChange({ dueId, newStatus });
      setShowPaymentConfirm(true);
      return;
    }

    // If trying to change from "done" to "due", prevent it
    if (due && due.paymentStatus === "done" && newStatus === "due") {
      alert("Cannot change payment status back to unpaid once marked as paid.");
      return;
    }

    // Otherwise, proceed with the change
    await executePaymentStatusChange(dueId, newStatus);
  };

  const executePaymentStatusChange = async (
    dueId: string,
    newStatus: "due" | "done"
  ) => {
    setChangingPaymentId(dueId);
    try {
      await api.put(`/operator/update-payment-status/${dueId}`, {
        paymentStatus: newStatus,
      });
      fetchStudentDues();
    } catch (err) {
      console.error("Failed to update payment status", err);
      alert("Failed to update payment status");
    } finally {
      setChangingPaymentId(null);
    }
  };

  const confirmPaymentChange = async () => {
    if (!pendingPaymentChange) return;

    await executePaymentStatusChange(
      pendingPaymentChange.dueId,
      pendingPaymentChange.newStatus
    );

    setShowPaymentConfirm(false);
    setPendingPaymentChange(null);
  };

  // Group dues by department
  const groupDuesByDepartment = (dues: Due[]) => {
    const grouped: { [key: string]: Due[] } = {};
    dues.forEach((due) => {
      if (!grouped[due.department]) {
        grouped[due.department] = [];
      }
      grouped[due.department].push(due);
    });
    return Object.entries(grouped).map(([department, dues]) => ({
      department,
      dues,
    }));
  };

  const departmentDues = groupDuesByDepartment(dues);

  if (loading) {
    return (
      <div className="operator-main-content">
        <div>Loading...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="operator-main-content">
        <div>Student not found</div>
      </div>
    );
  }

  return (
    <div className="operator-main-content">
      <header className="operator-dashboard-header">
        <h1>👨‍🎓 Student Details</h1>
        <p>
          View detailed information and manage payment clearance for{" "}
          {student.name}
        </p>
      </header>

      {/* Student Details Card - same as HOD */}
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            color: "#1f2937",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Student Information
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Name
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              {student.name}
            </div>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Roll Number
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#4f46e5",
              }}
            >
              {student.rollNumber}
            </div>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Father Name
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              {student.fatherName}
            </div>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Mobile
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              {student.mobile}
            </div>
          </div>
        </div>
      </div>

      {/* Dues Table - Student Lookup Style with Payment Controls */}
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
            padding: "20px 24px",
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
            Payment Status Management - {student.name}
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Update payment status for dues. Department operators will clear dues
            after payment.
          </p>
        </div>

        <div style={{ overflowX: "auto", padding: "20px 24px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e5e7eb",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "12px 16px",
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
                    border: "1px solid #e5e7eb",
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Details & Payment
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentDues.map((dept) => (
                <tr
                  key={dept.department}
                  style={{
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "12px 16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      fontSize: "14px",
                    }}
                  >
                    {dept.department}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "12px 16px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor:
                          dept.dues.length === 0 ? "#f0fdf4" : "#fef2f2",
                        color: dept.dues.length === 0 ? "#16a34a" : "#dc2626",
                        border: `1px solid ${
                          dept.dues.length === 0 ? "#bbf7d0" : "#fecaca"
                        }`,
                      }}
                    >
                      {dept.dues.length === 0
                        ? "No Dues"
                        : `${dept.dues.length} Due(s)`}
                    </span>
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "12px 16px",
                    }}
                  >
                    {dept.dues.length > 0 ? (
                      <ul
                        style={{
                          margin: "0",
                          padding: "0 0 0 20px",
                          listStyle: "disc",
                          color: "#374151",
                        }}
                      >
                        {dept.dues.map((due) => (
                          <li
                            key={due._id}
                            style={{
                              marginBottom: "12px",
                              fontSize: "14px",
                              lineHeight: "1.5",
                            }}
                          >
                            <div style={{ fontWeight: "500" }}>
                              {due.description} -{" "}
                              <span
                                style={{
                                  color: "#dc2626",
                                  fontWeight: "600",
                                }}
                              >
                                ₹{due.amount}
                              </span>
                              {due.dueType && (
                                <span
                                  style={{
                                    marginLeft: "8px",
                                    padding: "2px 8px",
                                    borderRadius: "8px",
                                    fontSize: "11px",
                                    backgroundColor: "#f3f4f6",
                                    color: "#6b7280",
                                    fontWeight: "500",
                                  }}
                                >
                                  {due.dueType
                                    .split("-")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")}
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginTop: "2px",
                                marginBottom: "6px",
                              }}
                            >
                              Due Date:{" "}
                              {new Date(due.dueDate).toLocaleDateString()}
                              {due.link && (
                                <>
                                  {" | "}
                                  <a
                                    href={due.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#4f46e5",
                                      textDecoration: "none",
                                    }}
                                  >
                                    View Link
                                  </a>
                                </>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  backgroundColor:
                                    due.category === "payable"
                                      ? "#fef3c7"
                                      : "#e0e7ff",
                                  color:
                                    due.category === "payable"
                                      ? "#d97706"
                                      : "#3730a3",
                                }}
                              >
                                {due.category}
                              </span>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  backgroundColor:
                                    due.status === "pending"
                                      ? "#fef2f2"
                                      : "#f0fdf4",
                                  color:
                                    due.status === "pending"
                                      ? "#dc2626"
                                      : "#16a34a",
                                }}
                              >
                                {due.status}
                              </span>
                              {due.status === "pending" && (
                                <select
                                  value={due.paymentStatus}
                                  onChange={(e) =>
                                    handlePaymentStatusChange(
                                      due._id,
                                      e.target.value as "due" | "done"
                                    )
                                  }
                                  disabled={
                                    changingPaymentId === due._id ||
                                    due.paymentStatus === "done"
                                  }
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: "8px",
                                    border: "2px solid #e5e7eb",
                                    fontSize: "11px",
                                    fontWeight: "500",
                                    cursor:
                                      changingPaymentId === due._id ||
                                      due.paymentStatus === "done"
                                        ? "not-allowed"
                                        : "pointer",
                                    backgroundColor:
                                      due.paymentStatus === "done"
                                        ? "#f0fdf4"
                                        : "#fef2f2",
                                    color:
                                      due.paymentStatus === "done"
                                        ? "#16a34a"
                                        : "#dc2626",
                                    outline: "none",
                                  }}
                                >
                                  <option value="due">Unpaid</option>
                                  <option value="done">Paid</option>
                                </select>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span
                        style={{
                          color: "#16a34a",
                          fontWeight: "500",
                          fontSize: "14px",
                        }}
                      >
                        ✓ Cleared
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {departmentDues.length === 0 && (
            <div
              style={{
                padding: "40px 24px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <p style={{ fontSize: "16px", margin: "0" }}>
                No dues found for this student.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <button
          onClick={() => navigate("/operator/accounts-dashboard")}
          style={{
            padding: "12px 24px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4338ca";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#4f46e5";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                color: "#1f2937",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Confirm Payment Status Change
            </h3>
            <p
              style={{
                margin: "0 0 8px 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Are you sure you want to mark this due as{" "}
              <strong style={{ color: "#16a34a" }}>Paid</strong>?
            </p>
            <p
              style={{
                margin: "0 0 24px 0",
                color: "#dc2626",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              ⚠️ Warning: This action cannot be undone. Once marked as paid, it
              cannot be changed back to unpaid.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowPaymentConfirm(false);
                  setPendingPaymentChange(null);
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPaymentChange}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsStudentDetails;

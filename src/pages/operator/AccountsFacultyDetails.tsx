import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import "./OperatorDashboard.css";

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
  dateAdded: string;
}

interface FacultyDetails {
  name: string;
  facultyId: string;
  email: string;
  department?: { name: string };
}

const AccountsFacultyDetails: React.FC = () => {
  const { facultyId } = useParams<{ facultyId: string }>();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<FacultyDetails | null>(null);
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (facultyId) {
      fetchFacultyDues();
    }
  }, [facultyId]);

  const fetchFacultyDues = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/operator/all-faculty/${facultyId}/dues`);

      // Find faculty details from the dues
      if (res.data.length > 0) {
        setFaculty({
          name: res.data[0].personName,
          facultyId: facultyId!,
          email: "N/A",
          department: { name: res.data[0].department },
        });
      }

      setDues(res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch faculty dues", err);
      setError("Failed to load faculty dues");
      navigate("/operator/accounts-faculty-dues");
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
      setDues(
        dues.map((d) =>
          d._id === dueId ? { ...d, paymentStatus: newStatus } : d
        )
      );
      alert("Payment status updated successfully!");
    } catch (err: any) {
      console.error("Failed to update payment status", err);
      alert(err?.response?.data?.message || "Failed to update payment status");
    } finally {
      setChangingPaymentId(null);
    }
  };

  const confirmPaymentStatusChange = async () => {
    setShowPaymentConfirm(false);
    if (pendingPaymentChange) {
      await executePaymentStatusChange(
        pendingPaymentChange.dueId,
        pendingPaymentChange.newStatus
      );
      setPendingPaymentChange(null);
    }
  };

  const getTotalAmount = () => {
    return dues.reduce((sum, d) => sum + d.amount, 0);
  };

  const getPendingAmount = () => {
    return dues
      .filter((d) => d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const getPayableAmount = () => {
    return dues
      .filter((d) => d.category === "payable")
      .reduce((sum, d) => sum + d.amount, 0);
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading faculty dues...</p>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Faculty not found</p>
      </div>
    );
  }

  return (
    <div className="accounts-details-container" style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/operator/accounts-faculty-dues")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "15px",
          }}
        >
          ← Back to Faculty Dues
        </button>
      </div>

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

      {/* Faculty Information */}
      <div
        style={{
          backgroundColor: "#f3f4f6",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ margin: "0 0 12px 0" }}>👨‍🏫 Faculty Information</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <div>
            <strong>Name:</strong> {faculty.name}
          </div>
          <div>
            <strong>Faculty ID:</strong> {faculty.facultyId}
          </div>
          <div>
            <strong>Email:</strong> {faculty.email}
          </div>
          <div>
            <strong>Department:</strong> {faculty.department?.name || "N/A"}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#fef2f2",
            padding: "12px",
            borderRadius: "8px",
            borderLeft: "4px solid #dc2626",
          }}
        >
          <div style={{ fontSize: "12px", color: "#7f1d1d" }}>Total Amount</div>
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#991b1b" }}
          >
            ₹{getTotalAmount()}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fef3c7",
            padding: "12px",
            borderRadius: "8px",
            borderLeft: "4px solid #d97706",
          }}
        >
          <div style={{ fontSize: "12px", color: "#78350f" }}>Pending</div>
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#b45309" }}
          >
            ₹{getPendingAmount()}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ecfdf5",
            padding: "12px",
            borderRadius: "8px",
            borderLeft: "4px solid #16a34a",
          }}
        >
          <div style={{ fontSize: "12px", color: "#15803d" }}>Payable</div>
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#16a34a" }}
          >
            ₹{getPayableAmount()}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#f0fdf4",
            padding: "12px",
            borderRadius: "8px",
            borderLeft: "4px solid #22c55e",
          }}
        >
          <div style={{ fontSize: "12px", color: "#166534" }}>Total Dues</div>
          <div
            style={{ fontSize: "20px", fontWeight: "bold", color: "#22c55e" }}
          >
            {dues.length}
          </div>
        </div>
      </div>

      {/* Dues Table */}
      {dues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <p>No dues found for this faculty</p>
        </div>
      ) : (
        <div className="dashboard-table-wrapper">
          <table
            className="dashboard-table"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Due Type
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Due Date
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Department
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Payment Status
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {dues.map((due) => (
                <tr
                  key={due._id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    backgroundColor:
                      due.status === "cleared" ? "#f0fdf4" : "transparent",
                  }}
                >
                  <td style={{ padding: "12px" }}>{due.description}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    ₹{due.amount}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor:
                          due.category === "payable" ? "#fef3c7" : "#e0e7ff",
                        color:
                          due.category === "payable" ? "#d97706" : "#3730a3",
                      }}
                    >
                      {due.category === "payable" ? "Payable" : "Non-Payable"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {due.dueType
                      ? due.dueType
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")
                      : "N/A"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {new Date(due.dueDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px" }}>{due.department}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        backgroundColor:
                          due.status === "pending" ? "#fecaca" : "#bbf7d0",
                        color: due.status === "pending" ? "#7f1d1d" : "#166534",
                        fontWeight: "bold",
                      }}
                    >
                      {due.status.charAt(0).toUpperCase() + due.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {due.category === "payable" ? (
                      <select
                        value={due.paymentStatus}
                        onChange={(e) =>
                          handlePaymentStatusChange(
                            due._id,
                            e.target.value as "due" | "done"
                          )
                        }
                        disabled={changingPaymentId === due._id}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "4px",
                          border:
                            due.paymentStatus === "done"
                              ? "2px solid #16a34a"
                              : "2px solid #dc2626",
                          cursor:
                            changingPaymentId === due._id ? "wait" : "pointer",
                          backgroundColor:
                            due.paymentStatus === "done"
                              ? "#dcfce7"
                              : "#fee2e2",
                          color:
                            due.paymentStatus === "done"
                              ? "#16a34a"
                              : "#dc2626",
                          fontWeight: "bold",
                        }}
                      >
                        <option value="due">Due (Unpaid)</option>
                        <option value="done">Done (Paid)</option>
                      </select>
                    ) : (
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: "#f3f4f6",
                          color: "#6b7280",
                          fontSize: "12px",
                        }}
                      >
                        N/A
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {due.link && (
                      <a
                        href={due.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#2563eb",
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        📎 View
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3 style={{ margin: "0 0 12px 0" }}>
              Confirm Payment Status Change
            </h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Are you sure you want to mark this payment as done? This action
              cannot be reversed.
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
                  backgroundColor: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPaymentStatusChange}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsFacultyDetails;

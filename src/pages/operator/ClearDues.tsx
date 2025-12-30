import React, { useEffect, useState } from "react";
import api from "../../api";
import "./ClearDues.css";

interface Due {
  _id: string;
  personName: string;
  personId: string;
  personType: string;
  department: string;
  description: string;
  amount: number;
  dueDate: string;
  clearDate?: string | null;
  status: string;
  dateAdded: string;
  paymentStatus: "due" | "done";
  category?: string;
  dueType?: string;
}

const ClearDue: React.FC = () => {
  const [dues, setDues] = useState<Due[]>([]);
  const [filteredDues, setFilteredDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDueId, setSelectedDueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);

  useEffect(() => {
    fetchDues();
    fetchTotalPendingAmount();
  }, []);

  useEffect(() => {
    if (dues.length > 0) filterDues();
  }, [dues, searchQuery, dateRange, statusFilter]);

  const fetchDues = async () => {
    setLoading(true);
    setError("");
    try {
      const storedUser = sessionStorage.getItem("user");
      const department = storedUser ? JSON.parse(storedUser).department : "";
      const res = await api.get(`/operator/department/${department}`);
      setDues(res.data);
    } catch (err) {
      console.error("Failed to fetch dues", err);
      setError("Failed to load dues ❌");
    }
    setLoading(false);
  };

  const fetchTotalPendingAmount = async () => {
    try {
      const storedUser = sessionStorage.getItem("user");
      const department = storedUser ? JSON.parse(storedUser).department : "";
      const res = await api.get(`/operator/totalPending/${department}`);
      setTotalPendingAmount(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch total pending amount", err);
    }
  };

  const handleClearClick = (dueId: string) => {
    setSelectedDueId(dueId);
    setShowConfirm(true);
  };

  const confirmClearDue = async () => {
    if (!selectedDueId) return;
    try {
      await api.put(`/operator/clear-due/${selectedDueId}`);
      setShowConfirm(false);
      setSelectedDueId(null);
      fetchDues();
      fetchTotalPendingAmount();
    } catch (err: any) {
      console.error("Failed to clear due", err);
      setError(err?.response?.data?.message || "Failed to clear due ❌");
    }
  };

  const filterDues = () => {
    let temp = [...dues];

    // Search
    if (searchQuery.trim() !== "") {
      temp = temp.filter(
        (d) =>
          d.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.personId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      temp = temp.filter((d) => {
        const addedDate = new Date(d.dateAdded);
        return addedDate >= startDate && addedDate <= endDate;
      });
    }

    // Status / Payment filter - UPDATED LOGIC
    if (statusFilter !== "all") {
      temp = temp.filter((d) => {
        if (statusFilter === "pending-at-accounts") {
          // Pending status at accounts (not cleared)
          return d.status === "pending";
        }
        if (statusFilter === "cleared-at-accounts") {
          // Cleared by department operator
          return d.status === "cleared";
        }
        if (statusFilter === "payable") {
          // Payable dues (pending)
          return d.category === "payable" && d.status === "pending";
        }
        if (statusFilter === "non-payable") {
          // Non-payable dues (pending)
          return d.category === "non-payable" && d.status === "pending";
        }
        return true;
      });
    }

    setFilteredDues(temp);
    setTotalAmount(temp.reduce((sum, d) => sum + d.amount, 0));
  };

  return (
    <div className="clear-due-container">
      <h2 className="clear-due-title">Clear Dues</h2>

      {/* Filters */}
      <div className="clear-due-filters">
        <input
          type="text"
          placeholder="🔍 Search by name or ID..."
          className="clear-due-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="clear-due-date-container">
          <label>📅 From:</label>
          <input
            type="date"
            className="clear-due-date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
          />

          <label>To:</label>
          <input
            type="date"
            className="clear-due-date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
          />
        </div>

        <select
          className="clear-due-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Dues</option>
          <option value="pending-at-accounts">Pending at Accounts</option>
          <option value="cleared-at-accounts">Cleared at Accounts</option>
          <option value="payable">Dues with payment (Payable)</option>
          <option value="non-payable">Dues with payment (Non-payable)</option>
        </select>
      </div>

      {/* Enhanced Summary with category breakdown */}
      <div className="clear-due-summary">
        <p>
          <strong>Showing:</strong> {filteredDues.length} of {dues.length} dues
        </p>
        <p>
          <strong>Pending at Accounts:</strong>{" "}
          {filteredDues.filter((d) => d.status === "pending").length}
        </p>
        <p>
          <strong>Cleared at Accounts:</strong>{" "}
          {filteredDues.filter((d) => d.status === "cleared").length}
        </p>
        <p>
          <strong>Payable Dues (Pending):</strong>{" "}
          {
            filteredDues.filter(
              (d) => d.category === "payable" && d.status === "pending"
            ).length
          }
        </p>
        <p>
          <strong>Non-Payable Dues (Pending):</strong>{" "}
          {
            filteredDues.filter(
              (d) => d.category === "non-payable" && d.status === "pending"
            ).length
          }
        </p>
        <p>
          <strong>Total Pending Amount:</strong> ₹{totalPendingAmount}
        </p>
        <p>
          <strong>Total Amount (Filtered):</strong> ₹{totalAmount}
        </p>
      </div>

      {loading ? (
        <p className="clear-due-loading">Loading dues...</p>
      ) : error ? (
        <p className="clear-due-error">{error}</p>
      ) : (
        <div className="clear-due-table-wrapper">
          <table className="clear-due-table">
            <thead>
              <tr>
                <th>Person Name</th>
                <th>Person ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Due Type</th>
                <th>Amount</th>
                <th>Added Date</th>
                <th>Due Date</th>
                <th>Clear Date</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDues.length === 0 ? (
                <tr>
                  <td colSpan={12} className="clear-due-no-data">
                    No dues found
                  </td>
                </tr>
              ) : (
                filteredDues.map((d) => (
                  <tr
                    key={d._id}
                    className={
                      d.status === "cleared" ? "clear-due-row-cleared" : ""
                    }
                  >
                    <td>{d.personName}</td>
                    <td>{d.personId}</td>
                    <td>{d.description}</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "600",
                          backgroundColor:
                            d.category === "payable" ? "#fef3c7" : "#e0e7ff",
                          color:
                            d.category === "payable" ? "#d97706" : "#3730a3",
                        }}
                      >
                        {d.category === "payable" ? "Payable" : "Non-Payable"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "500",
                          backgroundColor: "#f3f4f6",
                          color: "#374151",
                        }}
                      >
                        {d.dueType
                          ? d.dueType
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")
                          : "N/A"}
                      </span>
                    </td>
                    <td>₹{d.amount}</td>
                    <td>{new Date(d.dateAdded).toLocaleDateString()}</td>
                    <td>{new Date(d.dueDate).toLocaleDateString()}</td>
                    <td>
                      {d.clearDate
                        ? new Date(d.clearDate).toLocaleDateString()
                        : "Not Cleared"}
                    </td>
                    <td
                      className={
                        d.paymentStatus === "done"
                          ? "clear-due-payment-done"
                          : "clear-due-payment-due"
                      }
                    >
                      {d.category === "payable"
                        ? d.paymentStatus === "done"
                          ? "Accounts Cleared"
                          : "Accounts not cleared"
                        : "N/A (Non-Payable)"}
                    </td>
                    <td className={`clear-due-status ${d.status}`}>
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </td>
                    <td>
                      {d.status === "pending" ? (
                        d.category === "payable" ? (
                          // Payable dues require payment
                          <button
                            className="clear-due-btn-clear"
                            onClick={() => handleClearClick(d._id)}
                            disabled={d.paymentStatus === "due"}
                            title={
                              d.paymentStatus === "due"
                                ? "Payment must be completed by Accounts before clearing"
                                : "Clear this due"
                            }
                          >
                            Clear
                          </button>
                        ) : (
                          // Non-payable dues can be cleared directly
                          <button
                            className="clear-due-btn-clear"
                            onClick={() => handleClearClick(d._id)}
                            title="Clear this non-payable due directly"
                            style={{
                              backgroundColor: "#16a34a",
                              cursor: "pointer",
                            }}
                          >
                            Clear
                          </button>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showConfirm && (
        <div className="clear-due-modal-overlay">
          <div className="clear-due-modal">
            <h3 className="clear-due-modal-title">Confirm Clear</h3>
            <p className="clear-due-modal-text">
              Are you sure you want to clear this due?
            </p>
            {selectedDueId &&
              (() => {
                const selectedDue = filteredDues.find(
                  (d) => d._id === selectedDueId
                );
                if (selectedDue?.category !== "payable") {
                  return (
                    <p
                      style={{
                        marginTop: "12px",
                        padding: "8px",
                        backgroundColor: "#e0e7ff",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#3730a3",
                      }}
                    >
                      ℹ️ This is a <strong>non-payable</strong> due and can be
                      cleared directly without payment.
                    </p>
                  );
                }
                return null;
              })()}
            <div className="clear-due-modal-actions">
              <button
                className="clear-due-btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="clear-due-btn-confirm"
                onClick={confirmClearDue}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClearDue;

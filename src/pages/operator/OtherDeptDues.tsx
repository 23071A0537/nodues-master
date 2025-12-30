import React, { useEffect, useState } from "react";
import api from "../../api";
import "./OtherDeptDues.css";

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
  paymentStatus: string;
  dateAdded: string;
  dueType?: string;
}

const AllDepartmentDues: React.FC = () => {
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDueId, setSelectedDueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    setUserDepartment(user.department || "");

    // HR operators cannot access this page
    if (user.department === "HR") {
      setError("HR operators can only manage faculty dues. Access denied ❌");
      return;
    }

    fetchAllDues();
  }, []);

  const fetchAllDues = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/operator/all");
      // Filter out cleared dues - only show pending
      const pendingDues = res.data.filter(
        (due: Due) => due.status === "pending"
      );
      setDues(pendingDues);
    } catch (err) {
      setError("No access ❌");
    }
    setLoading(false);
  };

  const handleOpenModal = (id: string) => {
    setSelectedDueId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedDueId(null);
    setModalOpen(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedDueId) return;
    try {
      await api.put(`/operator/dues/${selectedDueId}/payment`, {
        paymentStatus: "done",
      });
      handleCloseModal();
      fetchAllDues();
    } catch (err) {
      alert("Failed to update payment ❌");
    }
  };

  // Apply filters (already filtered by pending status from fetchAllDues)
  const filteredDues = dues.filter((d) => {
    const matchesSearch =
      d.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.personId.toLowerCase().includes(searchQuery.toLowerCase());

    const dueDate = new Date(d.dueDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesDate =
      (!start || dueDate >= start) && (!end || dueDate <= end);

    return matchesSearch && matchesDate;
  });

  // Totals - all are pending now
  const totalPendingAmount = filteredDues
    .filter((d) => d.paymentStatus === "due")
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPaidAmount = filteredDues
    .filter((d) => d.paymentStatus === "done")
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="all-dues-container">
      <h2 className="all-dues-title">📄 All Department Dues (Pending Only)</h2>

      {/* Filters */}
      <div className="all-dues-filters">
        <input
          type="text"
          placeholder="Search by name or ID..."
          className="all-dues-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="all-dues-date-filters">
          <label>From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="all-dues-summary">
        <p>
          <strong>Unpaid Dues:</strong> ₹{totalPendingAmount}
        </p>
        <p>
          <strong>Paid (Awaiting Clearance):</strong> ₹{totalPaidAmount}
        </p>
        <p>
          <strong>Total Pending Amount:</strong> ₹
          {totalPendingAmount + totalPaidAmount}
        </p>
        <p>
          <strong>Total Dues Shown:</strong> {filteredDues.length}
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <p className="all-dues-loading">Loading dues...</p>
      ) : error ? (
        <p className="all-dues-error">{error}</p>
      ) : (
        <table className="all-dues-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Person ID</th>
              <th>Department</th>
              <th>Description</th>
              <th>Due Type</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Added</th>
              <th>Due Date</th>
              {userDepartment === "ACCOUNTS" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {filteredDues.length === 0 ? (
              <tr>
                <td
                  colSpan={userDepartment === "ACCOUNTS" ? 10 : 9}
                  className="all-dues-no-data"
                >
                  No pending dues found
                </td>
              </tr>
            ) : (
              filteredDues.map((d) => (
                <tr key={d._id} className="all-dues-row-pending">
                  <td>{d.personName}</td>
                  <td>{d.personId}</td>
                  <td>{d.department}</td>
                  <td>{d.description}</td>
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
                  <td
                    className={
                      d.paymentStatus === "done"
                        ? "all-dues-paid"
                        : "all-dues-due"
                    }
                  >
                    {d.paymentStatus === "done" ? "Paid" : "Unpaid"}
                  </td>
                  <td>{new Date(d.dateAdded).toLocaleDateString()}</td>
                  <td>{new Date(d.dueDate).toLocaleDateString()}</td>
                  {userDepartment === "ACCOUNTS" && (
                    <td>
                      {d.paymentStatus === "due" ? (
                        <button
                          className="all-dues-pay-btn"
                          onClick={() => handleOpenModal(d._id)}
                        >
                          ✅ Mark as Paid
                        </button>
                      ) : (
                        <span className="all-dues-paid-text">✔ Paid</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="dues-modal-overlay">
          <div className="dues-modal-content">
            <h3>Confirm Payment</h3>
            <p>Are you sure you want to mark this due as paid?</p>
            <div className="dues-modal-buttons">
              <button
                className="dues-modal-confirm-btn"
                onClick={handleConfirmPayment}
              >
                Yes, Mark as Paid
              </button>
              <button
                className="dues-modal-cancel-btn"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDepartmentDues;

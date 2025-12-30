import React, { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import api from "../../api";
import "../operator/AddDue.css";

interface Faculty {
  _id: string;
  facultyId: string;
  name: string;
  email: string;
  department?: string;
}

const AddFacultyDue: React.FC = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [category, setCategory] = useState<"payable" | "non-payable">(
    "payable"
  );
  const [link, setLink] = useState("");
  const [dueType, setDueType] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await api.get("/operator/faculty");
      setFaculty(res.data);
      if (res.data.length > 0) {
        setSelectedFacultyId(res.data[0].facultyId);
      }
    } catch (err) {
      console.error("Failed to fetch faculty", err);
      setFaculty([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowConfirmPopup(true);
  };

  const confirmAddDue = async () => {
    setShowConfirmPopup(false);
    setLoading(true);
    setError("");
    setSuccess("");

    const selectedFaculty = faculty.find(
      (f) => f.facultyId === selectedFacultyId
    );

    try {
      const res = await api.post("operator/add-due", {
        personId: selectedFacultyId,
        personName: selectedFaculty?.name,
        personType: "Faculty",
        department: selectedFaculty?.department || "HR",
        description,
        amount,
        dueDate,
        category,
        link,
        dueType,
      });

      setSuccess("✅ Faculty due added successfully!");
      setDescription("");
      setAmount(0);
      setDueDate("");
      setLink("");
      setDueType("");
      setCategory("payable");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || "Failed to add faculty due";
      setError(errorMsg);
      console.error("Failed to add faculty due", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container test-center add-due-container my-2">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h2 className="text-center mb-4 add-due-title">
                ➕ Add Faculty Due
              </h2>

              {error && (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#dcfce7",
                    color: "#15803d",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="add-due-form">
                {/* Select Faculty */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">
                      Select Faculty <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <Select
                      options={faculty.map((f) => ({
                        value: f.facultyId,
                        label: `${f.name} (${f.facultyId})`,
                      }))}
                      value={
                        selectedFacultyId
                          ? {
                              value: selectedFacultyId,
                              label: faculty.find(
                                (f) => f.facultyId === selectedFacultyId
                              )
                                ? `${
                                    faculty.find(
                                      (f) => f.facultyId === selectedFacultyId
                                    )?.name
                                  } (${selectedFacultyId})`
                                : "",
                            }
                          : null
                      }
                      onChange={(option) => {
                        if (option) {
                          setSelectedFacultyId(option.value);
                        }
                      }}
                      isSearchable
                      isDisabled={loading}
                      className="react-select"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">
                      Description <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Training expense, Equipment damage"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Amount & Due Date */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">
                      Amount (₹) <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-col">
                    <label className="form-label">
                      Due Date <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Category & Type */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">
                      Category <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as "payable" | "non-payable")
                      }
                      disabled={loading}
                    >
                      <option value="payable">Payable (Money to Pay)</option>
                      <option value="non-payable">
                        Non-Payable (Adjustment)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Due Type */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">
                      Due Type <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={dueType}
                      onChange={(e) => setDueType(e.target.value)}
                      required
                      style={{
                        color: dueType === "" ? "#9ca3af" : "#1f2937",
                      }}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        -- Select Due Type --
                      </option>
                      <option value="damage-to-property">
                        Damage to College Property
                      </option>
                      <option value="fee-delay">Fee Delay</option>
                      <option value="scholarship-issue">
                        Scholarship Issue
                      </option>
                      <option value="library-fine">Library Fine</option>
                      <option value="hostel-dues">Hostel Dues</option>
                      <option value="lab-equipment">Lab Equipment</option>
                      <option value="sports-equipment">Sports Equipment</option>
                      <option value="exam-malpractice">Exam Malpractice</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Link */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">
                      Google Drive Link (Optional)
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="add-due-submit-btn"
                  disabled={loading}
                  style={{
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Adding..." : "➕ Add Faculty Due"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
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
              maxWidth: "500px",
              width: "90%",
            }}
          >
            <h3 style={{ margin: "0 0 12px 0" }}>Confirm Faculty Due</h3>
            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              <p style={{ margin: "4px 0" }}>
                <strong>Faculty:</strong>{" "}
                {faculty.find((f) => f.facultyId === selectedFacultyId)?.name}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Description:</strong> {description}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Amount:</strong> ₹{amount}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Due Date:</strong> {dueDate}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Category:</strong>{" "}
                {category === "payable" ? "Payable" : "Non-Payable"}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Due Type:</strong> {dueType}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowConfirmPopup(false)}
                disabled={loading}
                style={{
                  padding: "10px 16px",
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
                onClick={confirmAddDue}
                disabled={loading}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Adding..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFacultyDue;

import React, { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import * as XLSX from "xlsx";
import api from "../../api";
import "./AddDue.css";

interface Person {
  facultyId: any;
  _id: string;
  name: string;
  rollNumber?: string;
  email: string;
}

const AddDue: React.FC = () => {
  const navigate = useNavigate();
  const [operatorDept, setOperatorDept] = useState("");
  const [personType, setPersonType] = useState<"faculty">("faculty");
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [department, setDepartment] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [category, setCategory] = useState<"payable" | "non-payable">(
    "payable"
  );
  const [link, setLink] = useState("");
  const [dueType, setDueType] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setDepartment(user.department || "");
      setOperatorDept(user.department || "");
    }
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      // HR operators only fetch faculty
      const res = await api.get(`/operator/faculty`);
      setPersons(res.data);
      if (res.data.length > 0) {
        setSelectedPersonId(res.data[0].facultyId);
      }
    } catch (err) {
      console.error("Failed to fetch faculty", err);
      setPersons([]);
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

    const selectedPerson = persons.find(
      (p) => p.facultyId === selectedPersonId
    );

    try {
      const res = await api.post("operator/add-due", {
        personId: selectedPersonId,
        personName: selectedPerson?.name,
        personType: "Faculty",
        department,
        description,
        amount,
        dueDate,
        category,
        link,
        dueType,
      });

      setSuccess(res.data.message || "Due added successfully ✅");

      setTimeout(() => navigate("/operator"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add due ❌");
    }

    setLoading(false);
  };

  // ✅ Handle bulk Excel file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBulkFile(e.target.files[0]);
    }
  };
  // ✅ Helper: Convert Excel serial to JS Date
  const excelDateToJSDate = (serial: number) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400; // seconds
    const date_info = new Date(utc_value * 1000);
    // Return normalized YYYY-MM-DD date (UTC midnight)
    return new Date(
      Date.UTC(
        date_info.getFullYear(),
        date_info.getMonth(),
        date_info.getDate()
      )
    );
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setError("Please select an Excel file to upload ❌");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Read Excel file
      const data = await bulkFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: true });

      // ✅ Format data correctly
      const formattedData = jsonData.map((row) => {
        let dueDate = row.dueDate;

        if (typeof dueDate === "number") {
          // Excel serial → JS Date → YYYY-MM-DD
          dueDate = excelDateToJSDate(dueDate);
        } else if (typeof dueDate === "string") {
          // String like "2025-10-10" → Date object (UTC)
          const d = new Date(dueDate);
          dueDate = new Date(
            Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
          );
        }

        return {
          personId: row.personId,
          personName: row.personName,
          personType: "Faculty",
          department: row.department || department,
          description: row.description,
          amount: Number(row.amount),
          dueDate,
        };
      });

      // Send bulk data to backend
      const res = await api.post("/operator/add-due-bulk", formattedData);
      setSuccess(res.data.message || "Bulk dues added successfully ✅");
      setBulkFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to add bulk dues ❌");
    }

    setLoading(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Select an Excel file (.xlsx)");
      return;
    }
    setUploading(true);
    setUploadError("");
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // ✅ Use admin route
      const res = await api.post("/admin/import-faculty", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(
        `Import completed: ${res.data.imported} added, ${res.data.skipped} skipped.` +
          (res.data.errors?.length > 0
            ? ` Errors: ${JSON.stringify(res.data.errors)}`
            : "")
      );
      setFile(null);
      setShowAddForm(false); // close modal on success
      await fetchPersons(); // Refresh list after import
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || "Upload failed.");
    }
    setUploading(false);
  };

  // Handle dues template download - Changed to use operator endpoint
  const handleDownloadDuesTemplate = async () => {
    try {
      const response = await api.get("/operator/download-dues-sample", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Dues_Upload_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download dues template", err);
      alert("Failed to download template file. Please contact administrator.");
    }
  };

  return (
    <div className="container test-center add-due-container my-2">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h2 className="text-center mb-4 add-due-title">
                {operatorDept === "HR" ? "➕ Add Faculty Due" : "Add Due"}
              </h2>

              {/* HR Operator Info */}
              {operatorDept === "HR" && (
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    fontSize: "14px",
                    color: "#0c4a6e",
                  }}
                >
                  <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>
                    ℹ️ HR Faculty Dues Management
                  </p>
                  <p style={{ margin: "4px 0 0 0" }}>
                    You can add and manage dues for all faculty members across
                    the institution. Use this to track salary deductions,
                    equipment loss, property damage, and other faculty-related
                    financial matters.
                  </p>
                </div>
              )}

              {/* --- Single Due Form --- */}
              <form onSubmit={handleSubmit} className="add-due-form">
                {/* Faculty Selection */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">
                      👨‍🏫 Select Faculty Member
                    </label>
                    <Select
                      options={persons.map((p) => ({
                        value: p.facultyId,
                        label: `${p.name} (${p.facultyId})`,
                      }))}
                      value={
                        selectedPersonId
                          ? {
                              value: selectedPersonId,
                              label: persons.find(
                                (p) => p.facultyId === selectedPersonId
                              )
                                ? `${
                                    persons.find(
                                      (p) => p.facultyId === selectedPersonId
                                    )?.name
                                  } (${selectedPersonId})`
                                : "",
                            }
                          : null
                      }
                      onChange={(selectedOption: any) =>
                        setSelectedPersonId(selectedOption?.value || "")
                      }
                      isSearchable
                      placeholder="Search faculty by name or ID..."
                    />
                  </div>
                </div>

                {/* Description & Amount */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">📝 Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Salary Deduction, Equipment Loss, Property Damage"
                      required
                    />
                  </div>
                  <div className="form-col">
                    <label className="form-label">💰 Amount</label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="Enter amount in rupees"
                      required
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">📅 Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">📌 Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as "payable" | "non-payable")
                      }
                    >
                      <option value="payable">
                        💳 Payable (Faculty has to pay money)
                      </option>
                      <option value="non-payable">
                        ✓ Non-Payable (No money required)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Due Type */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">
                      🏷️ Due Type <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={dueType}
                      onChange={(e) => setDueType(e.target.value)}
                      required
                      style={{
                        color: dueType === "" ? "#9ca3af" : "#1f2937",
                      }}
                    >
                      <option value="" disabled>
                        -- Select Due Type --
                      </option>
                      <option value="damage-to-property">
                        Damage to College Property
                      </option>
                      <option value="equipment-loss">Equipment Loss</option>
                      <option value="salary-deduction">Salary Deduction</option>
                      <option value="library-fine">Library Fine</option>
                      <option value="lab-equipment">Lab Equipment</option>
                      <option value="research-cost">Research Cost</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Link */}
                <div className="form-row">
                  <div className="form-col">
                    <label className="form-label">
                      🔗 Google Drive Link (Optional)
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>

                {/* Alerts */}
                {error && (
                  <div
                    className="alert alert-danger text-center fw-semibold"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
                {success && (
                  <div
                    className="alert alert-success text-center fw-semibold"
                    role="alert"
                  >
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2 add-due-btn"
                >
                  {loading ? "Adding Due..." : "✅ Add Faculty Due"}
                </button>

                {/* Confirmation Popup */}
                {showConfirmPopup && (
                  <div
                    className="modal-overlay"
                    onClick={() => setShowConfirmPopup(false)}
                  >
                    <div
                      className="modal-content"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h5>Confirm Add Faculty Due</h5>
                      <p>Are you sure you want to add this faculty due?</p>
                      <div className="modal-buttons">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowConfirmPopup(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={confirmAddDue}
                        >
                          Yes, Add Due
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              <hr className="my-4" />

              {/* Bulk Upload Section */}
              <div className="bulk-upload-section">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h5 className="mb-0">📊 Bulk Upload Faculty Dues</h5>
                  <button
                    type="button"
                    className="btn btn-info btn-sm"
                    onClick={handleDownloadDuesTemplate}
                    title="Download Excel template with required format"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                    }}
                  >
                    📥 Download Template
                  </button>
                </div>

                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "13px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontWeight: "600",
                      color: "#0c4a6e",
                    }}
                  >
                    📋 Bulk Upload Instructions:
                  </p>
                  <ul
                    style={{
                      margin: "0",
                      paddingLeft: "20px",
                      color: "#0369a1",
                    }}
                  >
                    <li>
                      Required columns: personId, personName, department,
                      description, amount, dueDate, dueType
                    </li>
                    <li>
                      Optional: category (payable/non-payable), link (Google
                      Drive URL)
                    </li>
                    <li>Date format: YYYY-MM-DD (e.g., 2025-12-31)</li>
                    <li>
                      Click "Download Template" to see the exact format needed
                    </li>
                  </ul>
                </div>

                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="form-control mb-3"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  disabled={loading || !bulkFile}
                  className="btn btn-success w-100 py-2"
                  onClick={handleBulkUpload}
                >
                  {loading ? "Uploading..." : "📤 Upload Bulk Faculty Dues"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Faculty Upload Modal */}
      {showAddForm && (
        <div
          className="users-modal-overlay"
          onClick={() => setShowAddForm(false)}
        >
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Import Faculty from Excel</h2>
            <p className="small-text">
              Columns required: S.No, Employee Code, Employee Name, Department,
              Designation, Email, Mobile
            </p>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                setFile(f || null);
                setUploadError("");
                setUploadResult(null);
              }}
              className="form-control mb-3"
            />
            {uploadError && <p className="error">{uploadError}</p>}
            {uploadResult && <p className="info-text">{uploadResult}</p>}
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button
                className="btn btn-success"
                onClick={handleUpload}
                disabled={uploading || !file}
              >
                {uploading ? "Uploading..." : "Upload Excel"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setFile(null);
                  setUploadError("");
                  setUploadResult(null);
                  setShowAddForm(false);
                }}
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

export default AddDue;

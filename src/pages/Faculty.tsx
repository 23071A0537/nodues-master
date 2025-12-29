import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import * as XLSX from "xlsx";
import api from "../api";
import "./Faculty.css";

type FacultyMember = {
  _id: string;
  employeeCode: string;
  name: string;
  department?: { _id: string; name: string };
  designation?: string;
  email?: string;
  mobile?: string;
  role: string;
};

const DESIGNATIONS = [
  "Prof & Dean Student Progression",
  "Assistant Professor",
  "Professor & HOD",
  "Prof & Dean IQAC",
  "Sr.Assistant Professor",
  "Associate Professor",
  "Assoc.Prof & HOD",
  "Prof & RDC Head",
  "Head, Innovation, Incubation & Entrepreneurship",
  "Professor of Practice",
  "Prof & Controller of Exams",
  "Prof & Dy Dean-Admin & Finance",
  "Prof. &Principal",
  "Prof. & Head",
  "Asst. Comp. Programmer",
  "Prof. & Dean Academics",
  "Professor, Director for Advancement & Dean Admin",
  "Sr. Assistant Professor & HOD",
];

const ROLES = ["super_admin", "operator", "hod", "faculty"];

const requiredFields = [
  "S.No",
  "Employee Code",
  "Employee Name",
  "Designation",
  "Email",
  "Mobile",
];

const validateExcelColumns = async (file: File) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  if (!rows.length) return { valid: false, missing: requiredFields };

  const keys = Object.keys(rows[0] || {}).map((k) =>
    String(k).trim().toLowerCase()
  );

  const missing = requiredFields.filter(
    (f) => !keys.includes(f.trim().toLowerCase())
  );
  if (missing.length) return { valid: false, missing };
  return { valid: true };
};

const Faculty: React.FC = () => {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editDesignation, setEditDesignation] = useState("");
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  // File upload states
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  // Add Faculty form state (for toggling)
  const [showAddForm, setShowAddForm] = useState(false);
  // const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addUploading, setAddUploading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [staffTypeFilter, setStaffTypeFilter] = useState<string>("");
  const [selectedStaffType, setSelectedStaffType] = useState<
    "teaching" | "non-teaching"
  >("teaching");

  useEffect(() => {
    fetchFaculty();
  }, [staffTypeFilter]);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const params = staffTypeFilter ? { staffType: staffTypeFilter } : {};
      const res = await api.get("/admin/faculty", { params });
      setFaculty(res.data);
      setError("");
    } catch (err: any) {
      setFaculty([]); // Ensure data doesn't persist after error
      setError(
        err?.response?.data?.message || "Failed to load faculty members."
      );
    }
    setLoading(false);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const startEditing = (f: FacultyMember) => {
    setEditId(f._id);
    setEditDesignation(f.designation || "");
    setEditRole(f.role);
    setSaveError("");
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditDesignation("");
    setEditRole("");
    setSaveError("");
  };

  // Added missing file change logic for upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFile(files && files[0] ? files[0] : null);
    setUploadError("");
    setUploadResult(null);
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
      const res = await api.post("/import-faculty", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(
        `Import completed: ${res.data.imported} added, ${res.data.skipped} skipped.` +
          (res.data.errors?.length > 0
            ? ` Errors: ${res.data.errors.join(", ")}`
            : "")
      );
      await fetchFaculty(); // Refresh list after import
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || "Upload failed.");
    }
    setUploading(false);
  };

  const handleAddFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAddFile(e.target.files[0]);
    } else {
      setAddFile(null);
    }
  };

  const handleAddUpload = async (e: FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    if (!addFile) {
      setAddError("Please select an Excel file");
      return;
    }

    try {
      const validation = await validateExcelColumns(addFile);
      if (!validation.valid) {
        setAddError(
          `Missing required columns: ${
            validation.missing?.join(", ") || "unknown"
          }`
        );
        return;
      }
    } catch (validationError) {
      setAddError("Error validating Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", addFile);
    formData.append("staffType", selectedStaffType);

    setAddUploading(true);
    try {
      const response = await api.post("/admin/import-faculty", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAddSuccess(
        `Successfully imported ${response.data.imported} ${selectedStaffType} faculty members`
      );
      setShowAddForm(false);
      setAddFile(null);

      await fetchFaculty();
    } catch (err: any) {
      let errorMessage = "Upload failed.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      if (err.response?.data?.errorField) {
        errorMessage += ` (Issue: ${err.response.data.errorField})`;
      }
      setAddError(errorMessage);
    } finally {
      setAddUploading(false);
    }
  };

  const saveChanges = async () => {
    if (!editDesignation || !editRole) {
      setSaveError("Please select both designation and role.");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/admin/faculty/${editId}`, {
        designation: editDesignation,
        role: editRole,
      });
      setEditId(null);
      setEditDesignation("");
      setEditRole("");
      setSaveError("");
      await fetchFaculty();
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || "Save failed.");
    }
    setSaving(false);
  };

  const handleDownloadSample = async () => {
    try {
      const response = await api.get("/admin/download-faculty-sample", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Faculty_Upload_Sample.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download sample file", err);
      alert("Failed to download sample file");
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      f.name.toLowerCase().includes(search) ||
      f.employeeCode.toLowerCase().includes(search) ||
      (f.department?.name?.toLowerCase().includes(search) ?? false)
    );
  });

  // No need for department list since department is not required

  // All backend/logic fixed, UI untouched per user request
  return (
    <div className="faculty-container">
      <h1 className="faculty-title">Faculty Management</h1>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-primary text-light"
          onClick={() => setShowAddForm(true)}
        >
          Add Faculty
        </button>
        <button
          className="btn btn-success"
          onClick={handleDownloadSample}
          title="Download a sample Excel file to see the required format for bulk upload"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Download Excel Template
        </button>

        {/* Staff Type Filter */}
        <select
          value={staffTypeFilter}
          onChange={(e) => setStaffTypeFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "2px solid #e5e7eb",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            backgroundColor: "white",
          }}
        >
          <option value="">All Staff</option>
          <option value="teaching">Teaching Staff</option>
          <option value="non-teaching">Non-Teaching Staff</option>
        </select>
      </div>

      <input
        type="text"
        placeholder="Search by name, employee code, or department"
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      {loading ? (
        <p className="info-text">Loading faculty...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredFaculty.length === 0 ? (
        <p className="no-data">No faculty members found.</p>
      ) : (
        <div className="faculty-grid">
          {filteredFaculty.map((f) => {
            const isEditing = editId === f._id;
            return (
              <div key={f._id} className="faculty-card">
                <div className="card-header">
                  <h3>{f.name}</h3>
                  <p className="small-text">Employee Code: {f.employeeCode}</p>
                  <p className="small-text dept">
                    Department: {f.department?.name || "-"}
                  </p>
                  <p
                    className="small-text"
                    style={{
                      backgroundColor:
                        f.staffType === "teaching" ? "#dbeafe" : "#fef3c7",
                      color: f.staffType === "teaching" ? "#1e40af" : "#92400e",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      display: "inline-block",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginTop: "4px",
                    }}
                  >
                    {f.staffType === "teaching"
                      ? "👨‍🏫 Teaching"
                      : "👔 Non-Teaching"}
                  </p>
                </div>
                <div className="card-body">
                  <label>Designation:</label>
                  {isEditing ? (
                    <select
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      disabled={saving}
                      className="edit-select"
                    >
                      <option value="">Select Designation</option>
                      {DESIGNATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p>{f.designation || "-"}</p>
                  )}
                  <label>Role:</label>
                  {isEditing ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      disabled={saving}
                      className="edit-select"
                    >
                      <option value="">Select Role</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p>{f.role}</p>
                  )}
                  <label>Email:</label>
                  <p>{f.email || "-"}</p>
                  <label>Mobile:</label>
                  <p>{f.mobile || "-"}</p>
                </div>
                <div className="card-footer">
                  {isEditing ? (
                    <>
                      <button
                        className="btn-save"
                        onClick={saveChanges}
                        disabled={saving}
                      >
                        Save
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={cancelEditing}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      {saveError && (
                        <p className="error small-error">{saveError}</p>
                      )}
                    </>
                  ) : (
                    <button
                      className="btn-edit"
                      onClick={() => startEditing(f)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddForm && (
        <div
          className="faculty-modal-overlay"
          onClick={() => setShowAddForm(false)}
        >
          <div className="faculty-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Faculty via Excel</h2>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontWeight: "600",
                  color: "#0c4a6e",
                }}
              >
                📋 Upload Instructions:
              </p>
              <ul
                style={{
                  margin: "0",
                  paddingLeft: "20px",
                  color: "#0369a1",
                }}
              >
                <li>
                  Required columns: S.No, Employee Code, Employee Name,
                  Department, Designation, Email, Mobile
                </li>
                <li>
                  Not sure about the format?{" "}
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0369a1",
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: "0 4px",
                      fontWeight: "600",
                    }}
                  >
                    Download Sample Excel
                  </button>
                </li>
              </ul>
            </div>

            <form onSubmit={handleAddUpload} className="faculty-upload-form">
              <label htmlFor="staffTypeSelect" style={{ marginBottom: "12px" }}>
                Staff Type:
                <select
                  id="staffTypeSelect"
                  value={selectedStaffType}
                  onChange={(e) =>
                    setSelectedStaffType(
                      e.target.value as "teaching" | "non-teaching"
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "8px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <option value="teaching">👨‍🏫 Teaching Staff</option>
                  <option value="non-teaching">👔 Non-Teaching Staff</option>
                </select>
              </label>

              <label htmlFor="facultyFileInput">
                Select Excel File:
                <input
                  id="facultyFileInput"
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleAddFileChange}
                  required
                  disabled={addUploading}
                />
              </label>

              {addError && <p className="faculty-error">{addError}</p>}
              {addSuccess && <p className="faculty-success">{addSuccess}</p>}
              <div className="faculty-form-buttons">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={addUploading}
                >
                  {addUploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                  disabled={addUploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;

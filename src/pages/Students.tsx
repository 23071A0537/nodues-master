import React, {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import * as XLSX from "xlsx";
import api from "../api";
import "./Students.css";

const requiredFields = [
  "S.No.",
  "Name of the Student",
  "H.T.No.",
  "Branch",
  "Section",
  "Email",
  "Mobile",
  "Father Name",
  "Father Mobile",
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

type Student = {
  _id: string;
  rollNumber: string;
  name: string;
  branch: string;
  section: string;
  academicYear?: string | { _id: string; from: number; to: number };
};

type AcademicYear = {
  _id: string;
  from: number;
  to: number;
};

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [academicYearMap, setAcademicYearMap] = useState<{
    [id: string]: AcademicYear;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [rollNumber, setRollNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, yearsRes] = await Promise.all([
          api.get("/admin/students"),
          api.get("/admin/academic-years"),
        ]);
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        setAcademicYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);
      } catch (err) {
        setError("Failed to load students, academic years, or departments.");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Build lookup for fast academic year id -> {from,to}
  useEffect(() => {
    if (academicYears.length) {
      const map: { [id: string]: AcademicYear } = {};
      academicYears.forEach((ay) => {
        map[ay._id] = ay;
      });
      setAcademicYearMap(map);
    }
  }, [academicYears]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (!file || !selectedAcademicYear) {
      setUploadError("Please select both a file and academic year");
      return;
    }

    // Add validation before upload
    try {
      const validation = await validateExcelColumns(file);
      if (!validation.valid) {
        setUploadError(
          `Missing required columns: ${validation.missing.join(", ")}`
        );
        return;
      }
    } catch (validationError) {
      setUploadError("Error validating Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("academicYear", selectedAcademicYear);

    setUploading(true);
    try {
      const response = await api.post("/admin/import-students", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadSuccess(
        `Successfully imported ${response.data.imported} students`
      );
      setShowUploadForm(false);
      setFile(null);
      setSelectedAcademicYear("");

      // Refresh students list
      const studentsRes = await api.get("/admin/students");
      setStudents(studentsRes.data);
    } catch (err: any) {
      // Show backend error details if available
      let errorMessage = "Upload failed.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      if (err.response?.data?.errorField) {
        errorMessage += ` (Issue: ${err.response.data.errorField})`;
      }
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Handle sample file download
  const handleDownloadSample = async () => {
    try {
      const response = await api.get("/admin/download-student-sample", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Student_Upload_Sample.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download sample file", err);
      alert("Failed to download sample file");
    }
  };

  // Build department list from actual student data
  const departmentList = Array.from(
    new Set(students.map((s) => s.branch).filter(Boolean))
  );

  // Filtering locally in-memory
  const filteredStudents = students.filter((student) => {
    // Department filter
    const matchesDepartment =
      !selectedDepartment || student.branch === selectedDepartment;

    // Roll number filter (case-insensitive)
    const matchesRollNumber =
      !rollNumber ||
      (student.rollNumber &&
        student.rollNumber.toLowerCase().includes(rollNumber.toLowerCase()));

    // Academic Year filter by id (if set, matches string or populated object)
    const matchesAcademicYear =
      !selectedAcademicYear ||
      (typeof student.academicYear === "string"
        ? student.academicYear === selectedAcademicYear
        : student.academicYear &&
          student.academicYear._id === selectedAcademicYear);

    return matchesDepartment && matchesRollNumber && matchesAcademicYear;
  });

  return (
    <div className="students-container">
      <h1>Students Management</h1>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <button
          className="btn btn-primary text-light"
          onClick={() => setShowUploadForm(true)}
        >
          Add Students
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
      </div>

      {/* Search/Filter UI */}
      <div style={{ display: "flex", gap: 18, marginBottom: 28 }}>
        <select
          value={selectedAcademicYear}
          onChange={(e) => setSelectedAcademicYear(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", minWidth: "160px" }}
        >
          <option value="">All Academic Years</option>
          {academicYears.map((year: any) => (
            <option key={year._id} value={year._id}>
              {year.from} - {year.to}
            </option>
          ))}
        </select>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", minWidth: "160px" }}
        >
          <option value="">All Departments</option>
          {departmentList.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          placeholder="Search by Roll Number"
          style={{ padding: "10px", borderRadius: "8px", minWidth: "180px" }}
        />
        <button
          className="btn btn-secondary"
          onClick={() => {
            setSelectedAcademicYear("");
            setRollNumber("");
            setSelectedDepartment("");
          }}
        >
          Reset
        </button>
      </div>

      {loading ? (
        <p className="students-info-text">Loading students...</p>
      ) : error ? (
        <p className="students-error">{error}</p>
      ) : (
        <table className="students-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Name</th>
              <th>Department</th>
              <th>Academic Year</th>
              <th>Class</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  {error ? (
                    <span className="text-danger">{error}</span>
                  ) : (
                    "No students found"
                  )}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student: Student) => {
                let academicYearDisplay = "N/A";
                if (
                  typeof student.academicYear === "string" &&
                  academicYearMap[student.academicYear]
                ) {
                  const year = academicYearMap[student.academicYear];
                  academicYearDisplay = `${year.from ?? "N/A"} - ${
                    year.to ?? "N/A"
                  }`;
                } else if (
                  typeof student.academicYear === "object" &&
                  student.academicYear &&
                  "from" in student.academicYear &&
                  "to" in student.academicYear
                ) {
                  academicYearDisplay = `${
                    (student.academicYear as any).from ?? "N/A"
                  } - ${(student.academicYear as any).to ?? "N/A"}`;
                }
                return (
                  <tr key={student._id}>
                    <td>{student.rollNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.branch}</td>
                    <td>{academicYearDisplay}</td>
                    <td>{student.section}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {showUploadForm && (
        <div
          className="students-modal-overlay"
          onClick={() => (!uploading ? setShowUploadForm(false) : undefined)}
        >
          <div className="students-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Students Excel</h2>

            {/* Help text with sample download */}
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
                  Required columns: S.No., Name of the Student, H.T.No., Branch,
                  Section, Email, Mobile, Father Name, Father Mobile
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

            <form onSubmit={handleUpload} className="students-upload-form">
              <label htmlFor="academicYearSelect">
                Academic Year:
                <select
                  id="academicYearSelect"
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  required
                  disabled={uploading}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year._id} value={year._id}>
                      {year.from}-{year.to}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="excelFileInput">
                Select Excel File:
                <input
                  id="excelFileInput"
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  required
                  disabled={uploading}
                />
              </label>

              {uploadError && <p className="students-error">{uploadError}</p>}
              {uploadSuccess && (
                <p className="students-success">{uploadSuccess}</p>
              )}
              <div className="students-form-buttons">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadForm(false)}
                  disabled={uploading}
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

export default Students;

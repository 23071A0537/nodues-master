import type { FormEvent } from "react";
import React, { useEffect, useState } from "react";
import api from "../api";
import "./AcademicYear.css"; // Make sure to use the new CSS file below

interface AcademicYear {
  _id: string;
  from: number;
  to: number;
}

const AcademicYears: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Fetch academic years from backend
  const fetchAcademicYears = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/academic-years");
      setAcademicYears(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load academic years."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  // Add new academic year
  const handleAddAcademicYear = async (e: FormEvent) => {
    e.preventDefault();
    setAddError("");

    const fromNum = Number(fromYear);
    const toNum = Number(toYear);

    if (!fromYear || !toYear || isNaN(fromNum) || isNaN(toNum)) {
      setAddError("Please enter valid years.");
      return;
    }

    if (toNum <= fromNum) {
      setAddError("The 'To' year must be greater than the 'From' year.");
      return;
    }

    setAdding(true);

    try {
      const res = await api.post("/admin/academic-years", {
        from: fromNum,
        to: toNum,
      });
      setAcademicYears((prev) => [...prev, res.data]);
      setFromYear("");
      setToYear("");
    } catch (err: any) {
      setAddError(
        err?.response?.data?.message || "Failed to add academic year."
      );
    }

    setAdding(false);
  };

  const handleDeleteAcademicYear = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this academic year?"))
      return;
    try {
      await api.delete(`/admin/academic-years/${id}`);
      setAcademicYears((prev) => prev.filter((year) => year._id !== id));
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to delete academic year."
      );
    }
  };

  return (
    <div className="academic-years-page container my-5">
      <div className="card shadow-sm p-4">
        <h1 className="card-title text-center mb-4">
          Academic Years Management
        </h1>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            <ul className="list-group mb-4">
              {academicYears.map((year) => (
                <li
                  key={year._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span className="fw-bold fs-5">
                    {year.from} - {year.to}
                  </span>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteAcademicYear(year._id)}
                    disabled={adding}
                    title="Delete Academic Year"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <h5 className="mt-2">Add New Academic Year</h5>
            <form
              onSubmit={handleAddAcademicYear}
              className="add-academic-year-form row g-3 align-items-center"
            >
              <div className="col">
                <input
                  type="number"
                  className="form-control"
                  placeholder="From Year (e.g., 2023)"
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value)}
                  disabled={adding}
                />
              </div>
              <div className="col">
                <input
                  type="number"
                  className="form-control"
                  placeholder="To Year (e.g., 2024)"
                  value={toYear}
                  onChange={(e) => setToYear(e.target.value)}
                  disabled={adding}
                />
              </div>
              <div className="col-auto">
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Adding...
                    </>
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            </form>
            {addError && (
              <div className="alert alert-danger mt-3 p-2 text-center">
                {addError}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AcademicYears;
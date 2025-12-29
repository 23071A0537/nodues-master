import React, { useEffect, useState, type FormEvent } from "react";
import api from "../api";
import "./Departments.css";

interface Department {
  _id: string;
  name: string;
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/departments");
      setDepartments(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load departments.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      setAddError("Department name cannot be empty.");
      return;
    }
    setAddError("");
    setAdding(true);

    try {
      const response = await api.post("/admin/departments", { name: newDeptName });
      setDepartments((prev) => [...prev, response.data]);
      setNewDeptName("");
    } catch (err: any) {
      setAddError(err?.response?.data?.message || "Failed to add department.");
    }
    setAdding(false);
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      setDepartments((prev) => prev.filter((dept) => dept._id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete department.");
    }
  };

  return (
    <div className="departments-page">
      <h1 className="departments-title">Departments Management</h1>

      {loading ? (
        <p className="departments-status">Loading departments...</p>
      ) : error ? (
        <p className="departments-error">{error}</p>
      ) : (
        <>
          <ul className="departments-list">
            {departments.map((dept) => (
              <li key={dept._id} className="department-item">
                <span className="dept-name">{dept.name}</span>
                <button
                  className="dept-delete-btn"
                  onClick={() => handleDeleteDepartment(dept._id)}
                  title="Delete Department"
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddDepartment} className="add-department-form">
            <input
              type="text"
              placeholder="Enter new department name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="input-text"
              disabled={adding}
            />
            <button type="submit" disabled={adding} className="add-btn">
              {adding ? "Adding..." : "Add Department"}
            </button>
          </form>

          {addError && <p className="departments-error">{addError}</p>}
        </>
      )}
    </div>
  );
};

export default Departments;

import React, { useEffect, useState } from "react";
import api from "../api";
import "./Users.css";

type User = {
  _id: string;
  email: string;
  role: string;
  roles?: string[];
  displayRoles?: string;
  department?: string | null;
  hodDepartment?: string | null;
  facultyRef?: any;
  isFromFaculty?: boolean;
};

type Department = {
  _id: string;
  name: string;
};

const AVAILABLE_ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "department_operator", label: "Department Operator" },
  { value: "hod", label: "HOD" },
  { value: "faculty", label: "Faculty" },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "super_admin",
    department: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [operatorDepartment, setOperatorDepartment] = useState("");
  const [hodDepartmentValue, setHodDepartmentValue] = useState("");
  const [roleUpdateError, setRoleUpdateError] = useState("");
  const defaultPassword = "pass123";

  // Fetch users and departments on mount
  useEffect(() => {
    const fetchUsersAndDepartments = async () => {
      setLoading(true);
      try {
        const [usersRes, deptsRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/departments"),
        ]);
        setUsers(usersRes.data);
        setDepartments(deptsRes.data);
      } catch (err) {
        setError("Failed to load users or departments.");
      }
      setLoading(false);
    };

    fetchUsersAndDepartments();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.email) {
      setSubmitError("Email is required");
      return;
    }

    if (
      (formData.role === "department_operator" || formData.role === "hod") &&
      !formData.department
    ) {
      setSubmitError("Please select a department for this role");
      return;
    }

    try {
      await api.post("/admin/users", {
        email: formData.email,
        password: defaultPassword,
        role: formData.role,
        department: formData.department || null,
      });
      setShowAddForm(false);
      setFormData({ email: "", role: "super_admin", department: "" });
      // refresh users list
      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "Failed to add user");
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/admin/users/${selectedUser._id}`); // Changed from id to _id
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      // Refresh users list
      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "Failed to delete user");
    }
  };

  const handlePasswordClick = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!selectedUser) return;

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      await api.put(`/admin/users/${selectedUser._id}/change-password`, {
        // Changed from id to _id
        newPassword,
      });
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword("");
      alert("Password changed successfully!");
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message || "Failed to change password"
      );
    }
  };

  const handleManageRoles = (user: User) => {
    setRoleModalUser(user);
    setSelectedRoles(user.roles || [user.role]);
    setOperatorDepartment(user.department || "");
    setHodDepartmentValue(user.hodDepartment || "");
    setRoleUpdateError("");
    setShowRoleModal(true);
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        return prev.filter((r) => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleUpdateRoles = async () => {
    if (!roleModalUser) return;

    setRoleUpdateError("");

    if (selectedRoles.length === 0) {
      setRoleUpdateError("User must have at least one role");
      return;
    }

    if (selectedRoles.includes("department_operator") && !operatorDepartment) {
      setRoleUpdateError("Department is required for Operator role");
      return;
    }

    if (selectedRoles.includes("hod") && !hodDepartmentValue) {
      setRoleUpdateError("Department is required for HOD role");
      return;
    }

    try {
      await api.put(`/admin/users/${roleModalUser._id}/roles`, {
        roles: selectedRoles,
        department: operatorDepartment || null,
        hodDepartment: hodDepartmentValue || null,
      });

      setShowRoleModal(false);
      setRoleModalUser(null);

      // Refresh users list
      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
    } catch (err: any) {
      setRoleUpdateError(
        err?.response?.data?.message || "Failed to update roles"
      );
    }
  };

  return (
    <div className="users-container">
      <h1>Users Management</h1>
      <button
        className="btn btn-primary text-light"
        onClick={() => setShowAddForm(true)}
      >
        Add User
      </button>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Roles</th>
              <th>Department</th>
              {/* <th>HOD Dept</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.email}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: "#e0e7ff",
                      color: "#4338ca",
                    }}
                  >
                    {user.displayRoles || user.role}
                  </span>
                </td>
                <td>{user.department || "-"}</td>
                {/* <td>{user.hodDepartment || "-"}</td> */}
                <td>
                  {/* <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleManageRoles(user)}
                    style={{ marginRight: "8px" }}
                  >
                    Manage Roles
                  </button> */}
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handlePasswordClick(user)}
                    style={{ marginRight: "8px" }}
                  >
                    Change Password
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteClick(user)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add User Modal */}
      {showAddForm && (
        <div
          className="users-modal-overlay"
          onClick={() => setShowAddForm(false)}
        >
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add User</h2>
            <form onSubmit={handleAddUser} className="users-add-user-form">
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Role:
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="department_operator">
                    Department Operator
                  </option>
                  <option value="hod">HOD</option>
                </select>
              </label>

              {(formData.role === "department_operator" ||
                formData.role === "hod") && (
                <label>
                  Department:
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <p>
                Default Password: <code>{defaultPassword}</code>
              </p>

              {submitError && <p className="error">{submitError}</p>}

              <div className="users-form-buttons">
                <button type="submit" className=" btn btn-primary me-2">
                  Add
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div
          className="users-modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete user{" "}
              <strong>{selectedUser.email}</strong>?
            </p>
            <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>
              This action cannot be undone.
            </p>
            <div className="users-form-buttons" style={{ marginTop: "24px" }}>
              <button className="btn btn-danger me-2" onClick={confirmDelete}>
                Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedUser && (
        <div
          className="users-modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Change Password</h2>
            <p>
              Change password for <strong>{selectedUser.email}</strong>
            </p>
            <form
              onSubmit={handlePasswordChange}
              className="users-add-user-form"
            >
              <label>
                New Password:
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  required
                />
              </label>

              {passwordError && <p className="error">{passwordError}</p>}

              <div className="users-form-buttons">
                <button type="submit" className="btn btn-primary me-2">
                  Change Password
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword("");
                    setPasswordError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleModal && roleModalUser && (
        <div
          className="users-modal-overlay"
          onClick={() => setShowRoleModal(false)}
        >
          <div
            className="users-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <h2>Manage Roles - {roleModalUser.email}</h2>

            <div style={{ marginTop: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                Select Roles:
              </label>

              {AVAILABLE_ROLES.map((role) => (
                <div key={role.value} style={{ marginBottom: "10px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      cursor: "pointer",
                      backgroundColor: selectedRoles.includes(role.value)
                        ? "#eef2ff"
                        : "white",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.value)}
                      onChange={() => handleRoleToggle(role.value)}
                      style={{
                        marginRight: "10px",
                        width: "18px",
                        height: "18px",
                      }}
                    />
                    <span style={{ fontWeight: "500" }}>{role.label}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Department selection for Operator role */}
            {selectedRoles.includes("department_operator") && (
              <div style={{ marginTop: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "#dc2626",
                  }}
                >
                  * Operator Department (Required):
                </label>
                <select
                  value={operatorDepartment}
                  onChange={(e) => setOperatorDepartment(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #c7d2fe",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Select Department for Operator Role</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Department selection for HOD role */}
            {selectedRoles.includes("hod") && (
              <div style={{ marginTop: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    color: "#dc2626",
                  }}
                >
                  * HOD Department (Required):
                </label>
                <select
                  value={hodDepartmentValue}
                  onChange={(e) => setHodDepartmentValue(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #c7d2fe",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Select Department for HOD Role</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {roleUpdateError && (
              <p className="error" style={{ marginTop: "12px" }}>
                {roleUpdateError}
              </p>
            )}

            <div
              style={{
                marginTop: "24px",
                padding: "12px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              <strong>ℹ️ Note:</strong> User can have multiple roles. For
              example: "Faculty & Operator" means they can access both faculty
              and operator dashboards.
            </div>

            <div className="users-form-buttons" style={{ marginTop: "24px" }}>
              <button
                className="btn btn-primary me-2"
                onClick={handleUpdateRoles}
              >
                Update Roles
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowRoleModal(false);
                  setRoleModalUser(null);
                  setRoleUpdateError("");
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

export default Users;

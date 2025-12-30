import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../operator/OperatorLayout.css";

const HRLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.email?.split("@")[0] || "User");
      } catch {
        setUserName("User");
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="operator-layout">
      {/* Sidebar */}
      <div className={`operator-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h3>👨‍💼 HR Department</h3>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`sidebar-link ${isActive("/hr") ? "active" : ""}`}
            onClick={() => navigate("/hr")}
          >
            📊 Dashboard
          </button>
          <button
            className={`sidebar-link ${
              isActive("/hr/add-faculty-due") ? "active" : ""
            }`}
            onClick={() => navigate("/hr/add-faculty-due")}
          >
            ➕ Add Faculty Due
          </button>
          <button
            className={`sidebar-link ${
              isActive("/hr/change-password") ? "active" : ""
            }`}
            onClick={() => navigate("/hr/change-password")}
          >
            🔐 Change Password
          </button>

          <button className="sidebar-link logout" onClick={handleLogout}>
            🚪 Logout ({userName})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="operator-content">
        <Outlet />
      </div>
    </div>
  );
};

export default HRLayout;

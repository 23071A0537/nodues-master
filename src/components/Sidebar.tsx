import {
  FaBuilding,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaTachometerAlt,
  FaUsers,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <nav className="sidebar-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <FaTachometerAlt style={{ marginRight: "8px" }} /> Dashboard
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <FaUsers style={{ marginRight: "8px" }} /> Users
        </NavLink>

        <NavLink
          to="/admin/departments"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <FaBuilding style={{ marginRight: "8px" }} /> Departments
        </NavLink>

        <NavLink
          to="/admin/academic-years"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <FaCalendarAlt style={{ marginRight: "8px" }} /> Academic Years
        </NavLink>

        <NavLink
          to="/admin/students"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
          title="Manage Students"
        >
          <FaGraduationCap style={{ marginRight: "8px" }} />
          Students
        </NavLink>

        <NavLink
          to="/admin/faculty"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
          title="Manage Faculty"
        >
          <FaChalkboardTeacher style={{ marginRight: "8px" }} />
          Faculty
        </NavLink>
      </nav>

      {/* Add styled logout button */}
      <button
        className="sidebar-logout-btn"
        onClick={handleLogout}
        aria-label="Logout"
        title="Logout"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;

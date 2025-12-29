import React from "react";
import {
  FaChartBar,
  FaCheckCircle,
  FaLock,
  FaPlusCircle,
  FaTachometerAlt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./OperatorSidebar.css";

const OperatorSidebar: React.FC = () => {
  // Get user from sessionStorage
  const userString = sessionStorage.getItem("user");
  let userDept = "";
  if (userString) {
    try {
      const user = JSON.parse(userString);
      userDept = user.department;
    } catch {}
  }

  // Special departments that can view external dues and have restricted sidebar options
  const specialDepartments = ["ACCOUNTS", "ACADEMICS"];

  return (
    <aside className="operator-sidebar">
      <h2 className="sidebar-title">{userDept} Operator</h2>
      <nav className="sidebar-nav">
        <NavLink
          to="/operator"
          end
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <FaTachometerAlt style={{ marginRight: "8px" }} /> Dashboard
        </NavLink>

        {/* Show Add Due and Clear Dues only for non-special departments */}
        {!specialDepartments.includes(userDept) && (
          <>
            <NavLink
              to="/operator/add-due"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <FaPlusCircle style={{ marginRight: "8px" }} /> Add Due
            </NavLink>

            <NavLink
              to="/operator/clear-dues"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <FaCheckCircle style={{ marginRight: "8px" }} /> Clear Dues
            </NavLink>
          </>
        )}

        {/* Render External Dept. Dues only for special departments */}
        {specialDepartments.includes(userDept) && (
          <NavLink
            to="/operator/other-dues"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <FaChartBar style={{ marginRight: "8px" }} /> All Dept. Dues
          </NavLink>
        )}

        {/* Change Password link for all operators */}
        <NavLink
          to="/operator/change-password"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <FaLock style={{ marginRight: "8px" }} /> Change Password
        </NavLink>
      </nav>
    </aside>
  );
};

export default OperatorSidebar;

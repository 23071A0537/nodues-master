import React from "react";
import { Outlet } from "react-router-dom";
import OperatorSidebar from "./OperatorSidebar";

const OperatorLayout: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "calc(100vh - 210px)",
        width: "100%",
        paddingBottom: "70px",
      }}
    >
      {/* Sidebar */}
      <div style={{ width: "250px", flexShrink: 0 }}>
        <OperatorSidebar />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default OperatorLayout;

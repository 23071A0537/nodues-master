import React from "react";
import { Outlet } from "react-router-dom";
import HODSidebar from "./HODSidebar";

const HODLayout: React.FC = () => {
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
        <HODSidebar />
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

export default HODLayout;

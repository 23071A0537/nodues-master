import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Layout.css";

const Layout = () => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "calc(100vh - 210px)",
        width: "100%",
        paddingBottom: "70px",
      }}
    >
      <Sidebar />
      <div className="main-content" style={{ flex: 1 }}>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

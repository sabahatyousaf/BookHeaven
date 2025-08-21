import React from "react";
import Header from "../../utils/Header/Header";
import { Outlet } from "react-router-dom";
import Sidebar from "../../utils/Sidebar/Sidebar";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Header />
      <div className="d-flex">
        <Sidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

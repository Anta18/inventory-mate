// src/components/Layout/Layout.tsx

import React from "react";
import Navbar from "../Navbar/Navbar";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden bg-gray-900">
        {/* Main Content */}
        <div className="flex-1 bg-black custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import NavigatorBar from "../components/NavigatorBar";

export default function AppMainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  );

  return (
    <div className="flex flex-col pt-20  min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Body */}
      <div className="flex flex-1 pb-10">
        {/* Sidebar */}
        <NavigatorBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-0 lg:ml-64" : "ml-0 lg:ml-24"
          } pt-16 lg:pt-0`} // Add padding-top for mobile to avoid overlap with header
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

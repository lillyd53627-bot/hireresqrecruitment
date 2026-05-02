import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex">
      
      {/* SIDEBAR */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

    </div>
  );
}





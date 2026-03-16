import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // ← only import Outlet, no BrowserRouter
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar />
        <main className="p-6 md:p-8 overflow-auto">
          <Outlet />  {/* This renders child pages like Dashboard, Clients, etc. */}
        </main>
      </div>
    </div>
  );
}
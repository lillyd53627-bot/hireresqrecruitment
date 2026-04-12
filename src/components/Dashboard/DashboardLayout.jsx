import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Impersonation detection
  const isImpersonating = localStorage.getItem('is_admin_impersonating') === 'true';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-yellow-500 text-black px-6 py-3 text-sm font-medium flex items-center justify-between sticky top-0 z-50 border-b">
          <div>🔍 You are viewing this dashboard as another user (Admin Mode)</div>
          <button
            onClick={() => {
              localStorage.removeItem('impersonating_user_id');
              localStorage.removeItem('is_admin_impersonating');
              window.location.reload();
            }}
            className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-gray-100"
          >
            Exit Admin Mode
          </button>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggle={toggleSidebar} 
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TopBar with Beta Notice in the middle */}
          <div className="border-b bg-white">
            <TopBar />
            
            {/* Beta Notice - Centered in Top Area */}
            <div className="bg-red-600 text-white text-xs font-medium py-2 text-center tracking-wide">
              🚀 EARLY BETA — Full Launch Coming Soon
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
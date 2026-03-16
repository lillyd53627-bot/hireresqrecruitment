import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, Users, CreditCard, Receipt, 
  FileText, Settings, ChevronLeft, ChevronRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', page: 'AdminDashboard' },
  { icon: Users, label: 'Users', page: 'AdminUsers' },
  { icon: CreditCard, label: 'Subscriptions', page: 'AdminSubscriptions' },
  { icon: Receipt, label: 'Payments', page: 'AdminPayments' },
  { icon: FileText, label: 'Audit Logs', page: 'AdminAuditLogs' },
  { icon: Settings, label: 'Settings', page: 'AdminSettings' }
];

export default function AdminSidebar({ isCollapsed, onToggle }) {
  const currentPath = window.location.pathname;

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-500" />
              <div>
                <h1 className="font-bold text-lg">Admin Panel</h1>
                <p className="text-xs text-gray-400">HireResQ</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <Shield className="w-6 h-6 text-red-500 mx-auto" />
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentPath.includes(item.page);
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-red-600 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
}
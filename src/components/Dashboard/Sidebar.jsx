import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Search,
  Mail,
  Video,
  BarChart3,
  Sparkles,
  Building2,
  ChevronRight,
  UserCircle,
  Target,
  Settings,
  Shield,           // Added for Admin
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Sparkles, label: "AI Assistant", path: "/dashboard/aiassistant" },
  { icon: Search, label: "AI Sourcing", path: "/dashboard/aisourcing" },
  { icon: Users, label: "Candidates", path: "/dashboard/candidates" },
  { icon: Briefcase, label: "Jobs", path: "/dashboard/jobs" },
  { icon: Building2, label: "Clients", path: "/dashboard/clients" },
  { icon: Mail, label: "Outreach", path: "/dashboard/outreach" },
  { icon: Video, label: "Interviews", path: "/dashboard/interviews" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Target, label: "AI Client Finder", path: "/dashboard/aiclientfinder" },
  { icon: Users, label: "Onboarding", path: "/dashboard/onboardingworkflows" },
  
  // Admin Dashboard Link
  { icon: Shield, label: "Admin Dashboard", path: "/dashboard/admin" },
  
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-black text-white flex flex-col z-40",
        "transition-all duration-300 ease-in-out overflow-hidden",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 text-xl font-bold">HireResQ</div>

      <button
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-8 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
      >
        <ChevronRight
          className={cn(
            "w-5 h-5 text-white transition-transform duration-300",
            !isCollapsed && "rotate-180"
          )}
        />
      </button>

      {/* Scrollable navigation area - prevents cutoff */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                  isActive(item.path)
                    ? "bg-red-600 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 hidden group-hover:block bg-gray-900 text-white text-sm px-3 py-1.5 rounded shadow-lg pointer-events-none whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="mt-6 mx-3 p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">John Recruiter</div>
              <div className="text-xs text-gray-400">Pro Plan</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
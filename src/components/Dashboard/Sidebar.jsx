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
  Shield,
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
  { icon: Shield, label: "Admin Dashboard", path: "/dashboard/admin" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();

  // ✅ FIXED ACTIVE MATCHING
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-black text-white flex flex-col z-40",
        "transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 text-xl font-bold">HireResQ</div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center"
      >
        <ChevronRight
          className={cn(
            "w-5 h-5 transition-transform",
            !isCollapsed && "rotate-180"
          )}
        />
      </button>

      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              isActive(item.path)
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            )}
          >
            <item.icon className="w-5 h-5" />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm font-medium">John Recruiter</p>
              <p className="text-xs text-gray-400">Pro Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
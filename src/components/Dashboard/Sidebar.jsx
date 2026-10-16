// src/components/Dashboard/Sidebar.jsx

import React, { useEffect, useState } from "react";
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
  ChevronLeft,
  UserCircle,
  Target,
  Settings,
  Shield,
  UserPlus,
  PhoneCall,
  Phone,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// ============================================================
// STANDARD DASHBOARD MENU
// ============================================================

const standardMenuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    exact: true,
  },
  {
    icon: Users,
    label: "Candidates",
    path: "/dashboard/candidates",
  },
  {
    icon: Briefcase,
    label: "Jobs",
    path: "/dashboard/jobs",
  },
  {
    icon: Building2,
    label: "Clients",
    path: "/dashboard/clients",
  },
  {
    icon: Mail,
    label: "Outreach",
    path: "/dashboard/outreach",
  },
  {
    icon: Video,
    label: "Interviews",
    path: "/dashboard/interviews",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/dashboard/analytics",
  },
  {
    icon: Target,
    label: "AI Client Finder",
    path: "/dashboard/aiclientfinder",
  },
  {
    icon: Search,
    label: "AI Sourcing",
    path: "/dashboard/aisourcing",
    comingSoon: true,
  },
  {
    icon: Sparkles,
    label: "AI Assistant",
    path: "/dashboard/aiassistant",
    comingSoon: true,
  },
  {
    icon: Users,
    label: "Onboarding",
    path: "/dashboard/onboarding",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/dashboard/settings",
  },
  {
    icon: Shield,
    label: "Admin Dashboard",
    path: "/dashboard/admin",
  },
];

// ============================================================
// INDEPENDENT RECRUITER MENU
// Pricing / Subscription deliberately excluded
// ============================================================

const recruiterMenuItems = [
  {
    icon: LayoutDashboard,
    label: "Recruiter Hub",
    path: "/dashboard/recruiter",
    exact: true,
  },
  {
    icon: Building2,
    label: "My Leads",
    path: "/dashboard/recruiter/leads",
  },
  {
    icon: Briefcase,
    label: "My Vacancies",
    path: "/dashboard/recruiter/vacancies",
  },
  {
    icon: Users,
    label: "My Candidates",
    path: "/dashboard/candidates",
  },
  {
    icon: Target,
    label: "Placements",
    path: "/dashboard/recruiter/placements",
  },
  {
    icon: UserPlus,
    label: "Add Candidate",
    path: "/dashboard/candidates/add",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/dashboard/settings",
  },
];

// ============================================================
// AI SECTION (shared)
// ============================================================

const aiMenuItems = [
  {
    icon: PhoneCall,
    label: "AI Voice Agent",
    path: "/dashboard/ai-voice",
  },
  {
    icon: Phone,
    label: "AI Calls",
    path: "/dashboard/ai-calls",
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function Sidebar({
  isCollapsed = false,
  setIsCollapsed,
  onToggle,
  profile: profileProp = null,
  role: roleProp = null,
}) {
  const location = useLocation();

  const [profile, setProfile] = useState(profileProp);
  const [role, setRole] = useState(roleProp || profileProp?.role || null);
  const [userName, setUserName] = useState(profileProp?.full_name || "User");
  const [loadingRole, setLoadingRole] = useState(!roleProp && !profileProp);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        if (profileProp) {
          if (!mounted) return;
          setProfile(profileProp);
          setRole(profileProp.role || null);
          setUserName(profileProp.full_name || "User");
          setLoadingRole(false);
          return;
        }

        if (roleProp) {
          if (!mounted) return;
          setRole(roleProp);
          setLoadingRole(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setRole(null);
          setLoadingRole(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (error) {
          console.error("Sidebar profile error:", error);
          setLoadingRole(false);
          return;
        }

        setProfile(data);
        setRole(data?.role || null);
        setUserName(data?.full_name || user.email || "User");
        setLoadingRole(false);
      } catch (error) {
        console.error("Unable to load sidebar profile:", error);
        if (mounted) setLoadingRole(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [profileProp, roleProp]);

  useEffect(() => {
    if (profileProp) {
      setProfile(profileProp);
      setRole(profileProp.role || null);
      setUserName(profileProp.full_name || "User");
      setLoadingRole(false);
    }
  }, [profileProp]);

  const handleToggle = () => {
    if (typeof setIsCollapsed === "function") {
      setIsCollapsed((previous) => !previous);
      return;
    }
    if (typeof onToggle === "function") {
      onToggle();
    }
  };

  const isRecruiter = role === "recruiter";
  const menuItems = isRecruiter ? recruiterMenuItems : standardMenuItems;

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item);

    if (item.comingSoon) {
      return (
        <div
          key={item.path}
          title={isCollapsed ? `${item.label} — Coming Soon` : ""}
          aria-disabled="true"
          className={cn(
            "flex items-center h-12 rounded-xl whitespace-nowrap text-gray-500 cursor-not-allowed opacity-70 select-none",
            isCollapsed ? "justify-center px-2" : "gap-3 px-4"
          )}
        >
          <Icon className="w-5 h-5 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="text-sm font-medium flex-1">{item.label}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-red-400 shrink-0">
                Soon
              </span>
            </>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path + (item.section || "")}
        to={item.path}
        title={isCollapsed ? item.label : ""}
        className={cn(
          "flex items-center h-12 rounded-xl transition-colors whitespace-nowrap",
          isCollapsed ? "justify-center px-2" : "gap-3 px-4",
          active
            ? "bg-red-600 text-white"
            : "text-gray-400 hover:bg-white/10 hover:text-white"
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!isCollapsed && (
          <span className="text-sm font-medium">{item.label}</span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50",
        "bg-black text-white",
        "flex flex-col",
        "transition-all duration-300",
        "overflow-hidden",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* LOGO */}
      <div
        className={cn(
          "h-20 shrink-0 flex items-center",
          isCollapsed ? "justify-center" : "px-6"
        )}
      >
        <span className="font-bold text-xl text-white">
          {isCollapsed ? "H" : "HireResQ"}
        </span>
      </div>

      {/* COLLAPSE BUTTON */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-7 -right-3 z-[60] w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-colors"
      >
        <ChevronLeft
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )}
        />
      </button>

      {/* NAVIGATION */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-3">
        <div className="space-y-1">
          {/* Recruiter header */}
          {isRecruiter && !isCollapsed && (
            <div className="px-4 pt-2 pb-3">
              <p className="text-[10px] uppercase tracking-widest text-red-400 font-semibold">
                Independent Recruiter
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your recruitment workspace
              </p>
            </div>
          )}

          {/* Main menu */}
          {menuItems.map(renderMenuItem)}

          {/* ====================== HIRE RESQ AI ====================== */}
          {!isCollapsed && (
            <div className="mt-6 mb-2 px-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                HireResQ AI
              </p>
            </div>
          )}

          {aiMenuItems.map(renderMenuItem)}
        </div>
      </nav>

      {/* USER FOOTER */}
      <div
        className={cn(
          "shrink-0 border-t border-white/10",
          isCollapsed ? "p-3" : "p-4"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "gap-3"
          )}
        >
          <UserCircle className="w-9 h-9 text-red-500 shrink-0" />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-400">
                {isRecruiter
                  ? "Independent Recruiter"
                  : role === "admin"
                  ? "Administrator"
                  : "Recruiter"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
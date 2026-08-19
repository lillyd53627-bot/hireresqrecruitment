// src/components/Dashboard/Sidebar.jsx

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
  ChevronLeft,
  UserCircle,
  Target,
  Settings,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ============================================================
// SIDEBAR MENU
// ============================================================

const menuItems = [
  // ==========================================================
  // DASHBOARD
  // ==========================================================

  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    exact: true,
  },

  // ==========================================================
  // CORE RECRUITMENT
  // ==========================================================

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

  // ==========================================================
  // ANALYTICS
  // ==========================================================

  {
    icon: BarChart3,
    label: "Analytics",
    path: "/dashboard/analytics",
  },

  // ==========================================================
  // AI CLIENT FINDER
  // ==========================================================

  {
    icon: Target,
    label: "AI Client Finder",
    path: "/dashboard/aiclientfinder",
  },

  // ==========================================================
  // COMING SOON
  // ==========================================================

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

  // ==========================================================
  // ONBOARDING
  // ==========================================================

  {
    icon: Users,
    label: "Onboarding",
    path: "/dashboard/onboarding",
  },

  // ==========================================================
  // SETTINGS
  // ==========================================================

  {
    icon: Settings,
    label: "Settings",
    path: "/dashboard/settings",
  },

  // ==========================================================
  // ADMIN
  // ==========================================================

  {
    icon: Shield,
    label: "Admin Dashboard",
    path: "/dashboard/admin",
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function Sidebar({
  isCollapsed = false,
  setIsCollapsed,
  onToggle,
}) {
  const location = useLocation();

  // ==========================================================
  // SUPPORT BOTH PROPS
  //
  // DashboardLayout may pass:
  //
  // setIsCollapsed={setIsCollapsed}
  //
  // OR:
  //
  // onToggle={...}
  // ==========================================================

  const handleToggle = () => {
    if (typeof setIsCollapsed === "function") {
      setIsCollapsed((previous) => !previous);
      return;
    }

    if (typeof onToggle === "function") {
      onToggle();
    }
  };

  // ==========================================================
  // ACTIVE ROUTE
  // ==========================================================

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

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
      {/* ======================================================
          LOGO
      ====================================================== */}

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

      {/* ======================================================
          COLLAPSE BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          isCollapsed
            ? "Expand sidebar"
            : "Collapse sidebar"
        }
        className="
          absolute
          top-7
          -right-3
          z-[60]
          w-7
          h-7
          rounded-full
          bg-red-600
          hover:bg-red-700
          flex
          items-center
          justify-center
          shadow-lg
          transition-colors
        "
      >
        <ChevronLeft
          className={cn(
            "w-4 h-4",
            "transition-transform duration-300",
            isCollapsed && "rotate-180"
          )}
        />
      </button>

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <nav
        className="
          flex-1
          min-h-0
          overflow-y-auto
          overflow-x-hidden
          px-2
          py-3
        "
      >
        <div className="space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            // ==================================================
            // COMING SOON ITEMS
            // These are intentionally NOT clickable.
            // ==================================================

            if (item.comingSoon) {
              return (
                <div
                  key={item.path}
                  title={
                    isCollapsed
                      ? `${item.label} — Coming Soon`
                      : ""
                  }
                  aria-disabled="true"
                  className={cn(
                    "flex items-center",
                    "h-12",
                    "rounded-xl",
                    "whitespace-nowrap",
                    "text-gray-500",
                    "cursor-not-allowed",
                    "opacity-70",
                    "select-none",

                    isCollapsed
                      ? "justify-center px-2"
                      : "gap-3 px-4"
                  )}
                >
                  <Icon
                    className="
                      w-5
                      h-5
                      shrink-0
                    "
                  />

                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">
                        {item.label}
                      </span>

                      <span
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide
                          text-red-400
                          shrink-0
                        "
                      >
                        Soon
                      </span>
                    </>
                  )}
                </div>
              );
            }

            // ==================================================
            // NORMAL NAVIGATION ITEM
            // ==================================================

            return (
              <Link
                key={item.path}
                to={item.path}
                title={
                  isCollapsed
                    ? item.label
                    : ""
                }
                className={cn(
                  "flex items-center",
                  "h-12",
                  "rounded-xl",
                  "transition-colors",
                  "whitespace-nowrap",

                  isCollapsed
                    ? "justify-center px-2"
                    : "gap-3 px-4",

                  active
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon
                  className="
                    w-5
                    h-5
                    shrink-0
                  "
                />

                {!isCollapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

        </div>
      </nav>

      {/* ======================================================
          USER
      ====================================================== */}

      <div
        className={cn(
          "shrink-0 border-t border-white/10",
          isCollapsed ? "p-3" : "p-4"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsed
              ? "justify-center"
              : "gap-3"
          )}
        >
          <UserCircle
            className="
              w-9
              h-9
              text-red-500
              shrink-0
            "
          />

          {!isCollapsed && (
            <div className="min-w-0">
              <p
                className="
                  text-sm
                  font-medium
                  text-white
                  truncate
                "
              >
                John Recruiter
              </p>

              <p className="text-xs text-gray-400">
                Pro Plan
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
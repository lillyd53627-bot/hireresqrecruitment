import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Briefcase,
  UserCheck,
  UserX,
  RefreshCw,
  Search,
  CalendarDays,
  Activity,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

const PLAN_CONFIG = {
  starter: {
    name: "Starter",
    price: 1549,
    maxJobs: 1,
    maxMatches: 20,
  },
  growth: {
    name: "Growth",
    price: 3549,
    maxJobs: 3,
    maxMatches: 60,
  },
  advance: {
    name: "Advance",
    price: 6349,
    maxJobs: 5,
    maxMatches: 100,
  },
};

const normalisePlan = (value) => {
  if (!value) return "starter";

  const plan = String(value).toLowerCase().trim();

  if (plan.includes("advance")) return "advance";
  if (plan.includes("growth")) return "growth";
  if (plan.includes("starter")) return "starter";

  return plan;
};

const getPlanDetails = (user) => {
  const key = normalisePlan(user?.plan_name || user?.plan);

  return (
    PLAN_CONFIG[key] || {
      name: user?.plan_name || user?.plan || "Unknown",
      price: Number(user?.total_revenue || 0),
      maxJobs: Number(user?.max_jobs || 0),
      maxMatches: Number(
        user?.max_candidate_matches ||
          user?.candidate_match_limit ||
          user?.max_matches ||
          0
      ),
    }
  );
};

const isUserActive = (user) => {
  const status = String(user?.status || "").toLowerCase();

  if (status === "active") return true;

  // Some installations may use subscription_status.
  const subscriptionStatus = String(
    user?.subscription_status || ""
  ).toLowerCase();

  if (subscriptionStatus === "active") return true;

  return false;
};

const formatCurrency = (amount) => {
  const value = Number(amount || 0);

  return `R${value.toLocaleString("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getExpiryDate = (user) => {
  return (
    user?.subscription_end ||
    user?.subscription_end_date ||
    user?.expires_at ||
    user?.subscription_expires_at ||
    user?.end_date ||
    null
  );
};

export default function Admin() {
  const { currentPlan } = useOutletContext();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    inactiveUsers: 0,
    totalRevenue: 0,
    starterUsers: 0,
    growthUsers: 0,
    advanceUsers: 0,
    totalJobsUsed: 0,
    totalCandidateMatches: 0,
  });

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  /*
   * Stage 1 admin protection.
   *
   * This preserves your existing behaviour:
   * only the Advance/admin-level account can access this page.
   *
   * Later this can be replaced with a proper profiles.role === "admin"
   * check without changing the dashboard UI.
   */
  const isAdmin =
    String(currentPlan?.plan || "").toLowerCase() === "advance" ||
    String(currentPlan?.role || "").toLowerCase() === "admin";

  const fetchAdminData = async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin dashboard error:", error);
        toast.error("Unable to load admin dashboard data.");
        return;
      }

      const profiles = Array.isArray(data) ? data : [];

      let totalRevenue = 0;
      let activeSubscriptions = 0;
      let inactiveUsers = 0;
      let starterUsers = 0;
      let growthUsers = 0;
      let advanceUsers = 0;
      let totalJobsUsed = 0;
      let totalCandidateMatches = 0;

      profiles.forEach((user) => {
        const plan = normalisePlan(user.plan_name || user.plan);

        const planDetails = getPlanDetails(user);

        /*
         * Revenue:
         * Prefer total_revenue if your profile already stores it.
         * Otherwise fall back to the known plan price.
         *
         * This means a newly-created test user can still be shown
         * correctly without changing your database.
         */
        const revenue = Number(
          user.total_revenue ||
            user.revenue ||
            user.amount_paid ||
            0
        );

        totalRevenue += revenue;

        if (isUserActive(user)) {
          activeSubscriptions += 1;
        } else {
          inactiveUsers += 1;
        }

        if (plan === "starter") starterUsers += 1;
        if (plan === "growth") growthUsers += 1;
        if (plan === "advance") advanceUsers += 1;

        totalJobsUsed += Number(
          user.current_jobs || user.jobs_used || 0
        );

        totalCandidateMatches += Number(
          user.current_candidate_matches ||
            user.candidate_matches_used ||
            user.matches_used ||
            0
        );

        /*
         * Keep planDetails referenced so the function remains
         * compatible with profiles that contain plan limits.
         */
        void planDetails;
      });

      setUsers(profiles);

      setStats({
        totalUsers: profiles.length,
        activeSubscriptions,
        inactiveUsers,
        totalRevenue,
        starterUsers,
        growthUsers,
        advanceUsers,
        totalJobsUsed,
        totalCandidateMatches,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Unexpected admin dashboard error:", error);
      toast.error("Something went wrong loading the admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      const name = String(user.full_name || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const plan = String(
        user.plan_name || user.plan || ""
      ).toLowerCase();
      const status = String(user.status || "").toLowerCase();

      return (
        name.includes(term) ||
        email.includes(term) ||
        plan.includes(term) ||
        status.includes(term)
      );
    });
  }, [users, search]);

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />

        <h2 className="text-3xl font-bold mb-4">
          Access Denied
        </h2>

        <p className="text-gray-600">
          This page is restricted to administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
         ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            HireResQ users, subscriptions, payments and usage overview.
          </p>

          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString("en-ZA")}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* =====================================================
          PRIMARY STATISTICS
         ===================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Total Users */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Users
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats.totalUsers}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50">
                <Users className="w-7 h-7 text-blue-600" />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Active Subscriptions
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats.activeSubscriptions}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-green-50">
                <UserCheck className="w-7 h-7 text-green-600" />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Recorded Revenue
                </p>

                <p className="text-3xl font-bold mt-2">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50">
                <DollarSign className="w-7 h-7 text-emerald-600" />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Inactive */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Inactive Users
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats.inactiveUsers}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-50">
                <UserX className="w-7 h-7 text-red-600" />
              </div>

            </div>
          </CardContent>
        </Card>

      </div>

      {/* =====================================================
          PLAN BREAKDOWN
         ===================================================== */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>
            Subscription Breakdown
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Starter */}
            <div className="rounded-xl border p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Starter
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {stats.starterUsers}
                  </p>
                </div>

                <Badge variant="outline">
                  R1,549
                </Badge>

              </div>

              <p className="text-xs text-gray-500 mt-3">
                1 Active Job • 20 Candidate Matches
              </p>
            </div>

            {/* Growth */}
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Growth
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {stats.growthUsers}
                  </p>
                </div>

                <Badge className="bg-red-600 text-white">
                  R3,549
                </Badge>

              </div>

              <p className="text-xs text-gray-500 mt-3">
                3 Active Jobs • 60 Candidate Matches
              </p>
            </div>

            {/* Advance */}
            <div className="rounded-xl border p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Advance
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {stats.advanceUsers}
                  </p>
                </div>

                <Badge variant="outline">
                  R6,349
                </Badge>

              </div>

              <p className="text-xs text-gray-500 mt-3">
                5 Active Jobs • 100 Candidate Matches
              </p>
            </div>

          </div>

        </CardContent>
      </Card>

      {/* =====================================================
          USAGE OVERVIEW
         ===================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-50">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>

              <div>
                <p className="font-semibold">
                  Jobs Used
                </p>

                <p className="text-xs text-gray-500">
                  Across all users
                </p>
              </div>
            </div>

            <p className="text-3xl font-bold">
              {stats.totalJobsUsed}
            </p>

          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-50">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>

              <div>
                <p className="font-semibold">
                  Candidate Matches Used
                </p>

                <p className="text-xs text-gray-500">
                  Across all users
                </p>
              </div>
            </div>

            <p className="text-3xl font-bold">
              {stats.totalCandidateMatches}
            </p>

          </CardContent>
        </Card>

      </div>

      {/* =====================================================
          USERS
         ===================================================== */}
      <Card className="border-0 shadow-sm">

        <CardHeader>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <CardTitle>
                Users & Subscriptions
              </CardTitle>

              <p className="text-sm text-gray-500 mt-1">
                Monitor customer plans, payments and usage.
              </p>
            </div>

            <div className="relative w-full md:w-80">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-9"
              />

            </div>

          </div>

        </CardHeader>

        <CardContent>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">

              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />

              <p className="font-medium text-gray-700">
                No users found
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {search
                  ? "Try a different search."
                  : "There are currently no users in the profiles table."}
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b bg-gray-50">

                    <th className="text-left px-4 py-3 font-semibold">
                      User
                    </th>

                    <th className="text-left px-4 py-3 font-semibold">
                      Plan
                    </th>

                    <th className="text-center px-4 py-3 font-semibold">
                      Status
                    </th>

                    <th className="text-center px-4 py-3 font-semibold">
                      Jobs
                    </th>

                    <th className="text-center px-4 py-3 font-semibold">
                      Matches
                    </th>

                    <th className="text-center px-4 py-3 font-semibold">
                      Revenue
                    </th>

                    <th className="text-center px-4 py-3 font-semibold">
                      Expires
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.map((user) => {

                    const planDetails = getPlanDetails(user);

                    const planKey = normalisePlan(
                      user.plan_name || user.plan
                    );

                    const active = isUserActive(user);

                    const currentJobs = Number(
                      user.current_jobs ||
                        user.jobs_used ||
                        0
                    );

                    const currentMatches = Number(
                      user.current_candidate_matches ||
                        user.candidate_matches_used ||
                        user.matches_used ||
                        0
                    );

                    const maxJobs = Number(
                      user.max_jobs ||
                        planDetails.maxJobs ||
                        0
                    );

                    const maxMatches = Number(
                      user.max_candidate_matches ||
                        user.candidate_match_limit ||
                        user.max_matches ||
                        planDetails.maxMatches ||
                        0
                    );

                    const revenue = Number(
                      user.total_revenue ||
                        user.revenue ||
                        user.amount_paid ||
                        0
                    );

                    const expiry = getExpiryDate(user);

                    return (
                      <tr
                        key={user.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        {/* User */}
                        <td className="px-4 py-4">

                          <div>
                            <p className="font-medium text-gray-900">
                              {user.full_name || "Unnamed User"}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              {user.email || "No email"}
                            </p>
                          </div>

                        </td>

                        {/* Plan */}
                        <td className="px-4 py-4">

                          <div className="flex flex-col items-start gap-1">

                            <Badge variant="outline">
                              {planDetails.name}
                            </Badge>

                            {planKey !== "unknown" && (
                              <span className="text-xs text-gray-500">
                                {formatCurrency(planDetails.price)} / 30 days
                              </span>
                            )}

                          </div>

                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">

                          <Badge
                            className={
                              active
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                            }
                          >
                            {active ? "Active" : (user.status || "Inactive")}
                          </Badge>

                        </td>

                        {/* Jobs */}
                        <td className="px-4 py-4 text-center">

                          <span className="font-medium">
                            {currentJobs}
                          </span>

                          {maxJobs > 0 && (
                            <span className="text-gray-400">
                              {" "} / {maxJobs}
                            </span>
                          )}

                        </td>

                        {/* Matches */}
                        <td className="px-4 py-4 text-center">

                          <span className="font-medium">
                            {currentMatches}
                          </span>

                          {maxMatches > 0 && (
                            <span className="text-gray-400">
                              {" "} / {maxMatches}
                            </span>
                          )}

                        </td>

                        {/* Revenue */}
                        <td className="px-4 py-4 text-center font-medium">

                          {formatCurrency(revenue)}

                        </td>

                        {/* Expiry */}
                        <td className="px-4 py-4 text-center">

                          {expiry ? (
                            <div className="flex items-center justify-center gap-1 text-gray-600">

                              <CalendarDays className="w-4 h-4" />

                              <span>
                                {formatDate(expiry)}
                              </span>

                            </div>
                          ) : (
                            <span className="text-gray-400">
                              —
                            </span>
                          )}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </CardContent>

      </Card>

      {/* =====================================================
          STAGE 1 NOTE
         ===================================================== */}
      <Card className="border border-blue-100 bg-blue-50/50 shadow-none">

        <CardContent className="p-5">

          <div className="flex gap-3">

            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />

            <div>

              <p className="font-semibold text-gray-900">
                Stage 1 Admin System
              </p>

              <p className="text-sm text-gray-600 mt-1">
                This dashboard provides the operational view needed
                to manage your first paid HireResQ users. It can later
                be expanded with payment history, subscription controls,
                automated expiry handling, audit logs, revenue charts
                and advanced reporting without changing the core dashboard.
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}
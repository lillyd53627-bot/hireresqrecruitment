import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Briefcase,
  Users,
  Building2,
  UserCheck,
  ClipboardPaste,
  ChevronRight,
  Star,
  DollarSign,
  UserPlus,
  Lock,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import TopBar from "@/components/Dashboard/TopBar";

import {
  useNavigate,
} from "react-router-dom";

import { supabase } from "@/lib/supabase";


// ============================================================
// PLAN LEVELS
// ============================================================

const PLAN_LEVELS = {
  starter: 1,
  growth: 2,
  advance: 3,
};


// ============================================================
// HELPERS
// ============================================================

const formatRelative = (iso) => {
  if (!iso) {
    return "—";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const days = Math.floor(
    (Date.now() - date.getTime()) / 86400000
  );

  if (days <= 0) {
    return "Today";
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  if (days < 30) {
    return `${Math.floor(days / 7)} weeks ago`;
  }

  return date.toLocaleDateString("en-ZA");
};


const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "R0";
  }

  const num =
    typeof value === "string"
      ? parseFloat(
          value.replace(/[^\d.-]/g, "")
        )
      : Number(value);

  if (Number.isNaN(num)) {
    return "R0";
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(num);
};


// ============================================================
// DASHBOARD
// ============================================================

export default function Dashboard() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [lastUpdated, setLastUpdated] = useState(
    new Date()
  );

  const [user, setUser] = useState(null);

  const [plan, setPlan] = useState("starter");

  const [role, setRole] = useState("");

  const [authLoading, setAuthLoading] = useState(true);


  // ==========================================================
  // LOAD USER + PLAN
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: {
            user: authUser,
          },
          error: authError,
        } = await supabase.auth.getUser();

        if (
          authError ||
          !authUser
        ) {
          if (mounted) {
            setUser(null);
            setPlan("starter");
            setRole("");
            setAuthLoading(false);
          }

          return;
        }

        if (mounted) {
          setUser(authUser);
        }

        const {
          data: userData,
          error: userError,
        } = await supabase
          .from("users")
          .select("plan, role")
          .eq("email", authUser.email)
          .maybeSingle();

        if (userError) {
          console.warn(
            "Could not load subscription data:",
            userError
          );

          if (mounted) {
            setPlan("starter");
            setRole("");
            setAuthLoading(false);
          }

          return;
        }

        if (mounted) {
          setPlan(
            String(
              userData?.plan || "starter"
            ).toLowerCase()
          );

          setRole(
            String(
              userData?.role || ""
            ).toLowerCase()
          );

          setAuthLoading(false);
        }
      } catch (error) {
        console.error(
          "Dashboard user loading error:",
          error
        );

        if (mounted) {
          setPlan("starter");
          setRole("");
          setAuthLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);


  // ==========================================================
  // ACCESS LEVEL
  // ==========================================================

  const hasFullAccess =
    role === "admin" ||
    role === "developer";

  const userPlanLevel =
    PLAN_LEVELS[plan] || 0;

  const canAccessGrowth =
    hasFullAccess ||
    userPlanLevel >= PLAN_LEVELS.growth;

  const canAccessAdvance =
    hasFullAccess ||
    userPlanLevel >= PLAN_LEVELS.advance;

  const isPaid =
    plan === "starter" ||
    plan === "growth" ||
    plan === "advance";


  // ==========================================================
  // LOAD CRM DATA
  // ==========================================================

  useEffect(() => {
    const safeReadArray = (key) => {
      try {
        const raw =
          localStorage.getItem(key);

        if (
          raw === null ||
          raw === ""
        ) {
          return [];
        }

        const parsed =
          JSON.parse(raw);

        return Array.isArray(parsed)
          ? parsed
          : [];
      } catch (error) {
        console.error(
          `Could not read ${key} from localStorage:`,
          error
        );

        return [];
      }
    };


    const loadData = () => {
      const savedClients =
        safeReadArray("crm_clients");

      const savedJobs =
        safeReadArray("crm_jobs");

      setClients(savedClients);
      setJobs(savedJobs);
      setLastUpdated(new Date());
    };


    loadData();


    const onStorage = (event) => {
      if (
        !event.key ||
        event.key === "crm_clients" ||
        event.key === "crm_jobs"
      ) {
        loadData();
      }
    };


    const onCrmDataUpdated = () => {
      loadData();
    };


    window.addEventListener(
      "storage",
      onStorage
    );

    window.addEventListener(
      "crm-data-updated",
      onCrmDataUpdated
    );


    const interval =
      window.setInterval(
        loadData,
        3000
      );


    return () => {
      window.removeEventListener(
        "storage",
        onStorage
      );

      window.removeEventListener(
        "crm-data-updated",
        onCrmDataUpdated
      );

      window.clearInterval(
        interval
      );
    };
  }, []);


  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {
    const totalClients =
      clients.length;

    const activeClients =
      clients.filter(
        (c) =>
          String(
            c?.status || ""
          ).toLowerCase() === "active"
      ).length;

    const totalJobs =
      jobs.length;

    const openJobs =
      jobs.filter(
        (j) =>
          String(
            j?.status || ""
          ).toLowerCase() === "open"
      ).length;

    const pastedJobs =
      jobs.filter(
        (j) => j?.isPasted
      ).length;

    const allApps =
      jobs.flatMap(
        (j) =>
          Array.isArray(
            j?.applications
          )
            ? j.applications
            : []
      );

    const totalApplicants =
      allApps.length;

    const shortlisted =
      allApps.filter(
        (a) =>
          a?.status ===
          "shortlisted"
      ).length;

    const interviewed =
      allApps.filter(
        (a) =>
          a?.status ===
          "interview"
      ).length;

    const hired =
      allApps.filter(
        (a) =>
          a?.status === "hired"
      ).length;

    const offers =
      allApps.filter(
        (a) =>
          a?.status === "offer"
      ).length;

    let totalRevenue = 0;

    clients.forEach((client) => {
      if (!client?.revenue) {
        return;
      }

      const amount =
        parseFloat(
          String(
            client.revenue
          ).replace(
            /[^\d.-]/g,
            ""
          )
        );

      if (!Number.isNaN(amount)) {
        totalRevenue += amount;
      }
    });

    return {
      totalClients,
      activeClients,
      totalJobs,
      openJobs,
      pastedJobs,
      totalApplicants,
      shortlisted,
      interviewed,
      hired,
      offers,
      totalRevenue,
    };
  }, [clients, jobs]);


  // ==========================================================
  // RECENT JOBS
  // ==========================================================

  const recentJobs =
    useMemo(() => {
      return [...jobs]
        .sort(
          (a, b) =>
            new Date(
              b?.postedAt || 0
            ) -
            new Date(
              a?.postedAt || 0
            )
        )
        .slice(0, 5);
    }, [jobs]);


  // ==========================================================
  // RECENT APPLICANTS
  // ==========================================================

  const recentApplicants =
    useMemo(() => {
      const all =
        jobs.flatMap((job) =>
          (
            Array.isArray(
              job?.applications
            )
              ? job.applications
              : []
          ).map((application) => ({
            ...application,
            jobTitle:
              job?.title ||
              "Untitled Job",
            jobId: job?.id,
            isPasted:
              job?.isPasted,
          }))
        );

      return all
        .sort(
          (a, b) =>
            new Date(
              b?.appliedAt || 0
            ) -
            new Date(
              a?.appliedAt || 0
            )
        )
        .slice(0, 6);
    }, [jobs]);


  // ==========================================================
  // PIPELINE
  // ==========================================================

  const pipeline =
    useMemo(() => {
      const all =
        jobs.flatMap(
          (job) =>
            Array.isArray(
              job?.applications
            )
              ? job.applications
              : []
        );

      return {
        shortlisted:
          all.filter(
            (a) =>
              a?.status ===
              "shortlisted"
          ).length,

        applied:
          all.filter(
            (a) =>
              a?.status ===
              "applied"
          ).length,

        screening:
          all.filter(
            (a) =>
              a?.status ===
              "screening"
          ).length,

        interview:
          all.filter(
            (a) =>
              a?.status ===
              "interview"
          ).length,

        offer:
          all.filter(
            (a) =>
              a?.status === "offer"
          ).length,

        hired:
          all.filter(
            (a) =>
              a?.status === "hired"
          ).length,

        rejected:
          all.filter(
            (a) =>
              a?.status ===
              "rejected"
          ).length,
      };
    }, [jobs]);


  // ==========================================================
  // STATUS COLORS
  // ==========================================================

  const getStatusColor =
    (status) => {
      const map = {
        shortlisted:
          "bg-teal-100 text-teal-700",

        applied:
          "bg-blue-100 text-blue-700",

        screening:
          "bg-purple-100 text-purple-700",

        interview:
          "bg-yellow-100 text-yellow-700",

        offer:
          "bg-orange-100 text-orange-700",

        hired:
          "bg-green-100 text-green-700",

        rejected:
          "bg-red-100 text-red-700",

        open:
          "bg-green-100 text-green-700",

        on_hold:
          "bg-yellow-100 text-yellow-700",

        filled:
          "bg-blue-100 text-blue-700",

        closed:
          "bg-gray-100 text-gray-700",

        active:
          "bg-green-100 text-green-700",
      };

      return (
        map[status] ||
        "bg-gray-100 text-gray-700"
      );
    };


  // ==========================================================
  // FEATURE NAVIGATION
  // ==========================================================

  const handleGrowthFeature =
    (path) => {
      if (canAccessGrowth) {
        navigate(path);
      } else {
        navigate("/pricing");
      }
    };


  const handleAdvanceFeature =
    (path) => {
      if (canAccessAdvance) {
        navigate(path);
      } else {
        navigate("/pricing");
      }
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50">

      <TopBar
        title="Dashboard"
        subtitle={`Live overview · Updated ${lastUpdated.toLocaleTimeString(
          "en-ZA"
        )}`}
      />

      <div className="p-8 space-y-8">

        {/* ==================================================
            SUBSCRIPTION STATUS
        ================================================== */}

        <div className="flex items-center justify-between bg-white border rounded-xl px-5 py-3 shadow-sm">

          <div>
            <p className="text-sm text-gray-500">
              Current Plan
            </p>

            <p className="font-semibold text-gray-900 capitalize">

              {authLoading
                ? "Checking..."
                : hasFullAccess
                ? `${role} — Full Access`
                : `${plan} ${
                    isPaid
                      ? "Plan"
                      : "Account"
                  }`}

            </p>
          </div>


          {!hasFullAccess && (
            <Badge
              className={
                plan === "advance"
                  ? "bg-red-600 text-white"
                  : plan === "growth"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 text-white"
              }
            >
              {plan}
            </Badge>
          )}


          {hasFullAccess && (
            <Badge className="bg-green-600 text-white">
              UNLIMITED ACCESS
            </Badge>
          )}

        </div>


        {/* ==================================================
            LIVE STATS
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {[
            {
              label:
                "Active Clients",

              value:
                stats.activeClients,

              sub:
                `${stats.totalClients} total`,

              icon:
                Building2,

              color:
                "bg-blue-50 text-blue-600",
            },

            {
              label:
                "Open Jobs",

              value:
                stats.openJobs,

              sub:
                `${stats.pastedJobs} pasted`,

              icon:
                Briefcase,

              color:
                "bg-green-50 text-green-600",
            },

            {
              label:
                "Applicants",

              value:
                stats.totalApplicants,

              sub:
                `${stats.shortlisted} shortlisted`,

              icon:
                Users,

              color:
                "bg-purple-50 text-purple-600",
            },

            {
              label:
                "Hired",

              value:
                stats.hired,

              sub:
                `${stats.offers} offers`,

              icon:
                UserCheck,

              color:
                "bg-red-50 text-red-600",
            },
          ].map(
            (stat, index) => {
              const Icon =
                stat.icon;

              return (
                <motion.div
                  key={
                    stat.label
                  }
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index *
                      0.05,
                  }}
                >

                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">

                    <CardContent className="p-5 flex items-center gap-4">

                      <div
                        className={`
                          w-12
                          h-12
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          ${stat.color}
                        `}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div>

                        <p className="text-2xl font-bold">
                          {stat.value}
                        </p>

                        <p className="text-sm font-medium text-gray-700">
                          {stat.label}
                        </p>

                        <p className="text-xs text-gray-400">
                          {stat.sub}
                        </p>

                      </div>

                    </CardContent>

                  </Card>

                </motion.div>
              );
            }
          )}

        </div>


        {/* ==================================================
            REVENUE + PIPELINE
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <Card className="border-0 shadow-sm">

            <CardHeader className="pb-2">

              <CardTitle className="text-base flex items-center gap-2">

                <DollarSign className="w-4 h-4 text-red-600" />

                Client Revenue

              </CardTitle>

            </CardHeader>

            <CardContent>

              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(
                  stats.totalRevenue
                )}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Tracked across{" "}
                {stats.totalClients}{" "}
                clients
              </p>

            </CardContent>

          </Card>


          <Card className="border-0 shadow-sm lg:col-span-2">

            <CardHeader className="pb-2">

              <CardTitle className="text-base">
                Live Applicant Pipeline
              </CardTitle>

            </CardHeader>

            <CardContent>

              <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">

                {[
                  [
                    "shortlisted",
                    "Shortlisted",
                    "text-teal-600",
                  ],

                  [
                    "applied",
                    "Applied",
                    "text-blue-600",
                  ],

                  [
                    "screening",
                    "Screening",
                    "text-purple-600",
                  ],

                  [
                    "interview",
                    "Interview",
                    "text-yellow-600",
                  ],

                  [
                    "offer",
                    "Offer",
                    "text-orange-600",
                  ],

                  [
                    "hired",
                    "Hired",
                    "text-green-600",
                  ],

                  [
                    "rejected",
                    "Rejected",
                    "text-red-600",
                  ],
                ].map(
                  ([
                    key,
                    label,
                    color,
                  ]) => (
                    <div
                      key={key}
                      className="text-center bg-gray-50 rounded-lg p-3"
                    >

                      <p
                        className={`text-xl font-bold ${color}`}
                      >
                        {
                          pipeline[
                            key
                          ]
                        }
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {label}
                      </p>

                    </div>
                  )
                )}

              </div>

            </CardContent>

          </Card>

        </div>


        {/* ==================================================
            RECENT JOBS + APPLICANTS
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* RECENT JOBS */}

          <Card className="border-0 shadow-sm">

            <CardHeader className="flex flex-row items-center justify-between pb-3">

              <CardTitle className="text-lg">
                Recent Jobs
              </CardTitle>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() =>
                  navigate(
                    "/dashboard/jobs"
                  )
                }
              >
                View all

                <ChevronRight className="w-4 h-4 ml-1" />

              </Button>

            </CardHeader>


            <CardContent className="space-y-3">

              {recentJobs.length ===
                0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No jobs yet. Add or paste a job post.
                </p>
              )}


              {recentJobs.map(
                (job) => (
                  <div
                    key={
                      job.id
                    }
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(
                        "/dashboard/jobs"
                      )
                    }
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <div
                        className={`
                          w-10
                          h-10
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                          ${
                            job.isPasted
                              ? "bg-red-100"
                              : "bg-red-50"
                          }
                        `}
                      >

                        {job.isPasted ? (
                          <ClipboardPaste className="w-5 h-5 text-red-600" />
                        ) : (
                          <Briefcase className="w-5 h-5 text-red-600" />
                        )}

                      </div>


                      <div className="min-w-0">

                        <p className="font-medium truncate">
                          {
                            job.title ||
                            "Untitled Job"
                          }
                        </p>

                        <p className="text-xs text-gray-500 truncate">
                          {
                            job.clientName ||
                            "No client"
                          }{" "}
                          ·{" "}
                          {
                            job.location ||
                            "No location"
                          }
                        </p>

                      </div>

                    </div>


                    <div className="flex items-center gap-2 flex-shrink-0">

                      {job.isPasted && (
                        <Badge className="bg-red-600 text-white text-xs font-bold">
                          PASTED
                        </Badge>
                      )}

                      <Badge
                        className={getStatusColor(
                          job.status
                        )}
                      >
                        {
                          job.status ||
                          "open"
                        }
                      </Badge>

                      <span className="text-xs text-gray-400">
                        {
                          (
                            job.applications ||
                            []
                          ).length
                        }{" "}
                        apps
                      </span>

                    </div>

                  </div>
                )
              )}

            </CardContent>

          </Card>


          {/* RECENT APPLICANTS */}

          <Card className="border-0 shadow-sm">

            <CardHeader className="flex flex-row items-center justify-between pb-3">

              <CardTitle className="text-lg">
                Recent Applicants
              </CardTitle>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() =>
                  navigate(
                    "/dashboard/jobs"
                  )
                }
              >
                View all

                <ChevronRight className="w-4 h-4 ml-1" />

              </Button>

            </CardHeader>


            <CardContent className="space-y-3">

              {recentApplicants.length ===
                0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No applicants yet. Add candidates from Job Listings.
                </p>
              )}


              {recentApplicants.map(
                (app, index) => (
                  <div
                    key={
                      app.id ||
                      index
                    }
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >

                    <div className="min-w-0">

                      <div className="flex items-center gap-2 flex-wrap">

                        <p className="font-medium truncate">
                          {
                            app.name ||
                            "Unnamed Applicant"
                          }
                        </p>

                        <Badge
                          className={getStatusColor(
                            app.status
                          )}
                        >
                          {
                            app.status ||
                            "applied"
                          }
                        </Badge>

                        {app.profileText && (
                          <Badge
                            variant="outline"
                            className="text-teal-700 border-teal-300 text-xs"
                          >
                            Profile
                          </Badge>
                        )}

                      </div>


                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {
                          app.jobTitle
                        }
                      </p>

                    </div>


                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatRelative(
                        app.appliedAt
                      )}
                    </span>

                  </div>
                )
              )}

            </CardContent>

          </Card>

        </div>


        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <Card className="border-0 shadow-sm">

          <CardHeader>

            <CardTitle className="text-lg">
              Quick Actions
            </CardTitle>

          </CardHeader>


          <CardContent>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              {/* JOBS */}

              <Button
                className="h-auto py-4 flex-col gap-2 bg-red-600 hover:bg-red-700"
                onClick={() =>
                  navigate(
                    "/dashboard/jobs"
                  )
                }
              >

                <ClipboardPaste className="w-5 h-5" />

                <span className="text-sm">
                  Paste Job Post
                </span>

              </Button>


              {/* APPLICANT */}

              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 border-red-200 text-red-700 hover:bg-red-50"
                onClick={() =>
                  navigate(
                    "/dashboard/jobs"
                  )
                }
              >

                <UserPlus className="w-5 h-5" />

                <span className="text-sm">
                  Add Applicant
                </span>

              </Button>


              {/* CLIENTS */}

              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() =>
                  navigate(
                    "/dashboard/clients"
                  )
                }
              >

                <Building2 className="w-5 h-5" />

                <span className="text-sm">
                  Clients CRM
                </span>

              </Button>


              {/* AI CLIENT FINDER */}

              {canAccessGrowth ? (

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() =>
                    handleGrowthFeature(
                      "/dashboard/aiclientfinder"
                    )
                  }
                >

                  <Star className="w-5 h-5" />

                  <span className="text-sm">
                    AI Lead Finder
                  </span>

                </Button>

              ) : (

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 opacity-60"
                  onClick={() =>
                    navigate(
                      "/pricing"
                    )
                  }
                >

                  <Lock className="w-5 h-5" />

                  <span className="text-sm">
                    AI Lead Finder
                  </span>

                  <span className="text-xs text-red-600">
                    Growth Required
                  </span>

                </Button>

              )}

            </div>

          </CardContent>

        </Card>


        {/* ==================================================
            LIVE INDICATOR
        ================================================== */}

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">

          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

          Live data · refreshes every 3 seconds · last update{" "}

          {lastUpdated.toLocaleTimeString(
            "en-ZA"
          )}

        </div>

      </div>

    </div>
  );
}
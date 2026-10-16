// src/pages/Dashboard/LeadFinder.jsx

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Target,
  Zap,
  MapPin,
  Star,
  Mail,
  Users,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  MessageSquare,
  UserPlus,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Sparkles,
  Linkedin,
  ExternalLink,
  Loader2,
  RefreshCw,
  Lock,
  Crown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Sidebar from "@/components/Dashboard/Sidebar";
import TopBar from "@/components/Dashboard/TopBar";

import { searchHiringCompanies, enrichCompany } from "@/services/enrichment";
import { supabase } from "@/lib/supabase";

import { useNavigate } from "react-router-dom";

const INDUSTRIES = [
  "All",
  "Technology",
  "Finance",
  "Healthcare",
  "Retail",
  "Logistics",
  "Manufacturing",
];

const LOCATIONS = [
  "All",
  "Cape Town",
  "Johannesburg",
  "Durban",
  "Pretoria",
  "Remote",
];

/*
|--------------------------------------------------------------------------
| SUBSCRIPTION ACCESS
|--------------------------------------------------------------------------
|
| Starter = basic access
| Growth  = AI enrichment + contact discovery
| Advance = full access
|
*/

const PLAN_LEVELS = {
  starter: 1,
  growth: 2,
  advance: 3,
  advanced: 3,
  pro: 3,
};

const FEATURE_ACCESS = {
  leadFinder: 1,
  enrichment: 2,
  contactDiscovery: 2,
  outreachGeneration: 2,
  crmConversion: 2,
};

const PLAN_DISPLAY_NAMES = {
  starter: "Starter",
  growth: "Growth",
  advance: "Advance",
  advanced: "Advance",
  pro: "Pro",
};

const generateId = () =>
  Date.now() + Math.floor(Math.random() * 1000);

export default function LeadFinder() {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | USER / SUBSCRIPTION
  |--------------------------------------------------------------------------
  */

  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | LEADS
  |--------------------------------------------------------------------------
  */

  const [leads, setLeads] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | CRM
  |--------------------------------------------------------------------------
  */

  const [existingClients, setExistingClients] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | DIALOGS
  |--------------------------------------------------------------------------
  */

  const [emailOpen, setEmailOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);

  const [generatedEmail, setGeneratedEmail] = useState("");
  const [generatedWhatsapp, setGeneratedWhatsapp] = useState("");

  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD USER + SUBSCRIPTION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setSubscriptionLoading(true);
    setError(null);

    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      const { data, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select(
          `
            id,
            user_id,
            plan_id,
            plan_name,
            amount,
            status,
            starts_at,
            expires_at,
            paystack_reference
          `
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        throw subscriptionError;
      }

      setSubscription(data || null);
    } catch (err) {
      console.error("Subscription loading error:", err);

      setError(
        "Unable to load your subscription. Please refresh the page or contact support."
      );
    } finally {
      setSubscriptionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PLAN
  |--------------------------------------------------------------------------
  */

  const currentPlan = useMemo(() => {
    const rawPlan =
      subscription?.plan_name ||
      subscription?.plan_id ||
      "starter";

    const plan = String(rawPlan).toLowerCase().trim();

    if (plan.includes("growth")) return "growth";
    if (
      plan.includes("advance") ||
      plan.includes("pro") ||
      plan.includes("premium")
    ) {
      return "advance";
    }
    return "starter";
  }, [subscription]);

  const currentPlanLevel =
    PLAN_LEVELS[currentPlan] || PLAN_LEVELS.starter;

  const hasAccess = (feature) => {
    const requiredLevel = FEATURE_ACCESS[feature] || 1;
    return currentPlanLevel >= requiredLevel;
  };

  const requiredPlanFor = (feature) => {
    const requiredLevel = FEATURE_ACCESS[feature] || 1;

    if (requiredLevel <= 1) return "Starter";
    if (requiredLevel === 2) return "Growth";
    return "Advance";
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD EXISTING CLIENTS (duplicate detection only)
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("crm_clients");
      if (saved) {
        setExistingClients(JSON.parse(saved));
      }
    } catch {
      setExistingClients([]);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SEARCH — only when user clicks Run AI Scan (no auto-run on load)
  |--------------------------------------------------------------------------
  */

  const runSearch = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const results = await searchHiringCompanies({
        query: search,
        location: locationFilter === "All" ? "" : locationFilter,
        industry: industryFilter === "All" ? "" : industryFilter,
      });

      /*
       * IMPORTANT:
       * Do not inject fallback/mock companies here.
       */

      if (!Array.isArray(results)) {
        throw new Error("Lead Finder returned invalid data.");
      }

      setLeads(results);
    } catch (err) {
      console.error("Lead Finder error:", err);

      setLeads([]);

      setError(
        err?.message ||
          "Unable to retrieve live hiring companies. Please try again."
      );
    } finally {
      setIsScanning(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ENRICH COMPANY
  |--------------------------------------------------------------------------
  */

  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);

    /*
     * Starter users can see the company,
     * but enrichment/contact discovery is locked.
     */

    if (!hasAccess("enrichment")) {
      return;
    }

    if (lead.enriched) {
      return;
    }

    setIsEnriching(true);

    try {
      const enriched = await enrichCompany(lead);

      setSelectedLead(enriched);

      setLeads((previous) =>
        previous.map((item) =>
          item.id === enriched.id ? enriched : item
        )
      );
    } catch (err) {
      console.error("Enrichment error:", err);

      setError("Company enrichment failed. Please try again.");
    } finally {
      setIsEnriching(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DUPLICATE DETECTION
  |--------------------------------------------------------------------------
  */

  const isDuplicate = (lead) => {
    if (!lead) return false;

    return existingClients.some((client) => {
      const sameName =
        client.name &&
        lead.name &&
        client.name.toLowerCase() === lead.name.toLowerCase();

      const sameWebsite =
        client.website &&
        lead.website &&
        client.website
          .toLowerCase()
          .includes(lead.website.toLowerCase());

      return sameName || sameWebsite;
    });
  };

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const total = leads.length;

    const highIntent = leads.filter(
      (lead) => (lead.score || 0) >= 85
    ).length;

    const newThisScan = leads.filter(
      (lead) => !isDuplicate(lead)
    ).length;

    const avgScore = total
      ? Math.round(
          leads.reduce(
            (sum, lead) => sum + (lead.score || 0),
            0
          ) / total
        )
      : 0;

    return {
      total,
      highIntent,
      newThisScan,
      avgScore,
    };
  }, [leads, existingClients]);

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = search.toLowerCase();

      const matchesSearch =
        !q ||
        lead.name?.toLowerCase().includes(q) ||
        lead.industry?.toLowerCase().includes(q) ||
        lead.location?.toLowerCase().includes(q) ||
        lead.description?.toLowerCase().includes(q);

      const matchesIndustry =
        industryFilter === "All" ||
        lead.industry === industryFilter;

      const matchesLocation =
        locationFilter === "All" ||
        (lead.location || "").includes(locationFilter);

      return matchesSearch && matchesIndustry && matchesLocation;
    });
  }, [leads, search, industryFilter, locationFilter]);

  /*
  |--------------------------------------------------------------------------
  | ADD TO CRM
  |--------------------------------------------------------------------------
  */

  const addToCRM = (lead) => {
    if (!hasAccess("crmConversion")) {
      return;
    }

    if (isDuplicate(lead)) {
      return;
    }

    const primaryManager = lead.hiringManagers?.[0];

    const newClient = {
      id: generateId(),
      name: lead.name,
      industry: lead.industry || "Unknown",
      location: lead.location || "",
      contact: primaryManager?.name || "",
      email:
        primaryManager?.email ||
        lead.companyEmails?.[0] ||
        "",
      phone: "",
      website: lead.website || "",
      status: "pending",
      activeJobs: lead.openRoles || 0,
      totalHires: 0,
      revenue: 0,
      lastContact: new Date().toISOString(),
      notes: [
        {
          id: generateId(),
          text:
            `Added from AI Lead Finder. ` +
            `Score: ${lead.score || 0}%. ` +
            `Hiring signal: ${lead.hiringSignal || "N/A"}. ` +
            `Open roles: ${lead.openRoles || 0}. ` +
            `Source: ${lead.source || "Live enrichment"}`,
          createdAt: new Date().toISOString(),
          author: "AI Lead Finder",
        },
      ],
      timeline: [
        {
          id: generateId(),
          type: "status_change",
          description:
            `Lead converted from AI Lead Finder ` +
            `(Score ${lead.score || 0}%)`,
          date: new Date().toISOString(),
        },
      ],
      reminders: [],
      contacts: (lead.hiringManagers || []).map((manager) => ({
        id: generateId(),
        name: manager.name,
        email: manager.email || "",
        phone: "",
        role: manager.title || "",
      })),
    };

    const updated = [newClient, ...existingClients];

    localStorage.setItem("crm_clients", JSON.stringify(updated));
    setExistingClients(updated);
    setAddedToast(lead.name);

    setTimeout(() => setAddedToast(null), 3000);
  };

  /*
  |--------------------------------------------------------------------------
  | EMAIL
  |--------------------------------------------------------------------------
  */

  const generateEmail = (lead) => {
    if (!hasAccess("outreachGeneration")) {
      return;
    }

    const manager = lead.hiringManagers?.[0];
    const role = lead.recentJobs?.[0] || "key roles";

    const email = `Subject: Supporting ${lead.name}'s growth – ${role}

Hi ${manager?.name?.split(" ")[0] || "there"},

I noticed ${lead.name} is currently hiring for ${
      lead.openRoles || "several"
    } roles, including ${role}.

I specialise in connecting high-growth ${
      lead.industry?.toLowerCase() || ""
    } companies in ${
      lead.location || "South Africa"
    } with pre-vetted talent.

Would you be open to a quick 15-minute call this week to explore how we could support your current hiring goals?

Looking forward to hearing from you.

Best regards,
[Your Name]
HireResQ
[Your Phone] | [Your Email]`;

    setGeneratedEmail(email);
    setEmailOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | WHATSAPP
  |--------------------------------------------------------------------------
  */

  const generateWhatsApp = (lead) => {
    if (!hasAccess("outreachGeneration")) {
      return;
    }

    const manager = lead.hiringManagers?.[0];
    const firstName = manager?.name?.split(" ")[0] || "there";

    const message = `Hi ${firstName} 👋

I came across ${lead.name} and saw you're hiring for several roles right now.

I help ${
      lead.industry?.toLowerCase() || ""
    } companies in ${
      lead.location || "South Africa"
    } find strong talent quickly.

Would you be open to a short chat this week?

Happy to share how HireResQ can support your hiring needs.

Thanks!
[Your Name] – HireResQ`;

    setGeneratedWhatsapp(message);
    setWhatsappOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | COPY
  |--------------------------------------------------------------------------
  */

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UPGRADE BUTTON → /pricing
  |--------------------------------------------------------------------------
  */

  const UpgradeButton = ({ feature = "enrichment", compact = false }) => {
    if (hasAccess(feature)) {
      return null;
    }

    const requiredPlan = requiredPlanFor(feature);

    return (
      <Button
        onClick={() => navigate("/pricing")}
        size={compact ? "sm" : "default"}
        className="bg-red-600 hover:bg-red-700 text-white gap-2"
      >
        <Lock className="w-4 h-4" />
        {compact ? `Unlock ${requiredPlan}` : `Upgrade to ${requiredPlan}`}
      </Button>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SUBSCRIPTION LOADING
  |--------------------------------------------------------------------------
  */

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-500">
            Loading your HireResQ subscription...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <TopBar
          title="AI Lead Finder"
          subtitle="Discover companies currently hiring and push qualified opportunities into your pipeline"
        />

        <div className="p-8">
          {/* PLAN BAR */}
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Current Subscription
                    </p>
                    <p className="font-bold text-gray-900">
                      {PLAN_DISPLAY_NAMES[currentPlan] ||
                        subscription?.plan_name ||
                        "Starter"}
                    </p>
                  </div>
                </div>

                {!hasAccess("enrichment") && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      AI enrichment is available on Growth and Advance.
                    </span>
                    <UpgradeButton feature="enrichment" compact />
                  </div>
                )}

                {hasAccess("enrichment") && (
                  <Badge className="bg-green-100 text-green-700">
                    <Check className="w-4 h-4 mr-1" />
                    AI Enrichment Unlocked
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ERROR */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-800 rounded-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  runSearch();
                }}
              >
                Retry
              </Button>
            </div>
          )}

          {/* TOAST */}
          <AnimatePresence>
            {addedToast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>
                  <strong>{addedToast}</strong> added to CRM
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Leads Found",
                value: stats.total,
                icon: Target,
                color: "bg-purple-50 text-purple-600",
              },
              {
                label: "High Intent (85+)",
                value: stats.highIntent,
                icon: TrendingUp,
                color: "bg-green-50 text-green-600",
              },
              {
                label: "New to CRM",
                value: stats.newThisScan,
                icon: UserPlus,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Avg Lead Score",
                value: `${stats.avgScore}%`,
                icon: Star,
                color: "bg-red-50 text-red-600",
              },
            ].map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedLead ? (
              /* DETAIL VIEW */
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLead(null)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold">
                          {selectedLead.name}
                        </h2>

                        <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" />
                          {selectedLead.score || "—"}%
                        </Badge>

                        {isDuplicate(selectedLead) && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                            Already in CRM
                          </Badge>
                        )}

                        {isEnriching && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            Enriching...
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-500">
                        {selectedLead.industry}
                        {" · "}
                        {selectedLead.location}
                        {" · "}
                        {selectedLead.employees || "Unknown"} employees
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {hasAccess("outreachGeneration") ? (
                      <>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => generateEmail(selectedLead)}
                        >
                          <Mail className="w-4 h-4" />
                          Generate Email
                        </Button>

                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => generateWhatsApp(selectedLead)}
                        >
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp
                        </Button>
                      </>
                    ) : (
                      <UpgradeButton feature="outreachGeneration" />
                    )}

                    {hasAccess("crmConversion") ? (
                      !isDuplicate(selectedLead) ? (
                        <Button
                          className="bg-red-600 hover:bg-red-700 gap-2"
                          onClick={() => addToCRM(selectedLead)}
                        >
                          <UserPlus className="w-4 h-4" />
                          Add to CRM
                        </Button>
                      ) : (
                        <Button disabled variant="outline">
                          Already in CRM
                        </Button>
                      )
                    ) : (
                      <UpgradeButton feature="crmConversion" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Company Overview
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-gray-700">
                          {selectedLead.description ||
                            "No description available."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Website</p>
                            {selectedLead.website ? (
                              <a
                                href={
                                  selectedLead.website.startsWith("http")
                                    ? selectedLead.website
                                    : `https://${selectedLead.website}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-red-600 flex items-center gap-1 hover:underline"
                              >
                                {selectedLead.website}
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <p className="font-medium">—</p>
                            )}
                          </div>

                          <div>
                            <p className="text-gray-500">Hiring Signal</p>
                            <p className="font-medium">
                              {selectedLead.hiringSignal || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">Open Roles</p>
                            <p className="font-medium">
                              {selectedLead.openRoles || 0}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500">Source</p>
                            <p className="font-medium">
                              {selectedLead.source || "Live API"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedLead.recentJobs?.length > 0 && (
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Recent Open Roles
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedLead.recentJobs.map((job) => (
                              <Badge
                                key={job}
                                variant="outline"
                                className="text-sm py-1 px-3"
                              >
                                <Briefcase className="w-3.5 h-3.5 mr-1" />
                                {job}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-6">
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          Hiring Managers
                          {isEnriching && (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          )}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {!hasAccess("contactDiscovery") ? (
                          <div className="text-center py-6">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                              <Lock className="w-6 h-6 text-red-600" />
                            </div>
                            <p className="font-semibold text-gray-900">
                              Hiring Manager Discovery
                            </p>
                            <p className="text-sm text-gray-500 mt-1 mb-4">
                              Upgrade to Growth to unlock hiring manager
                              names and contact details.
                            </p>
                            <UpgradeButton
                              feature="contactDiscovery"
                              compact
                            />
                          </div>
                        ) : (
                          <>
                            {(selectedLead.hiringManagers || []).length ===
                              0 &&
                              !isEnriching && (
                                <p className="text-sm text-gray-400">
                                  No hiring managers found.
                                </p>
                              )}

                            {(selectedLead.hiringManagers || []).map(
                              (manager, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-3"
                                >
                                  <p className="font-medium">
                                    {manager.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {manager.title}
                                  </p>
                                  {manager.email && (
                                    <div className="flex items-center gap-2 mt-2 text-sm">
                                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                                      <span className="text-red-600">
                                        {manager.email}
                                      </span>
                                    </div>
                                  )}
                                  {manager.linkedin && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                                      <Linkedin className="w-3.5 h-3.5" />
                                      LinkedIn found
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Company Emails
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-2">
                        {!hasAccess("contactDiscovery") ? (
                          <div className="text-center py-5">
                            <Lock className="w-7 h-7 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              Contact discovery is locked.
                            </p>
                          </div>
                        ) : (
                          <>
                            {(selectedLead.companyEmails || []).length ===
                              0 &&
                              !isEnriching && (
                                <p className="text-sm text-gray-400">
                                  No emails found.
                                </p>
                              )}

                            {(selectedLead.companyEmails || []).map(
                              (email) => (
                                <div
                                  key={email}
                                  className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                                >
                                  <span>{email}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(email)}
                                  >
                                    {copied ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              )
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* LIST VIEW */
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="border-0 shadow-sm bg-gradient-to-r from-red-600 to-red-700 text-white mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Sparkles className="w-6 h-6" />
                          AI Company Discovery
                        </h3>
                        <p className="text-white/80 mt-1">
                          Discover real companies currently hiring.
                        </p>
                      </div>

                      <Button
                        className="bg-white text-red-600 hover:bg-gray-100 gap-2"
                        onClick={runSearch}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Run AI Scan
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search companies..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) =>
                          event.key === "Enter" && runSearch()
                        }
                        className="pl-10 w-64 bg-white border-gray-200"
                      />
                    </div>

                    <Select
                      value={industryFilter}
                      onValueChange={setIndustryFilter}
                    >
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={locationFilter}
                      onValueChange={setLocationFilter}
                    >
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={runSearch}
                      disabled={isScanning}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          isScanning ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {isScanning && leads.length === 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Searching live hiring data...
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {!isScanning && filteredLeads.length === 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-12 text-center text-gray-400">
                        <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p>No live leads found.</p>
                        <p className="text-sm mt-1">
                          Click <strong>Run AI Scan</strong> or try another
                          search, industry or location.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {filteredLeads.map((lead, index) => {
                    const duplicate = isDuplicate(lead);

                    return (
                      <motion.div
                        key={lead.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-6">
                              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Target className="w-7 h-7 text-red-600" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="text-xl font-bold">
                                        {lead.name}
                                      </h3>

                                      <Badge className="bg-green-100 text-green-700">
                                        {lead.hiringSignal || "Medium"} Intent
                                      </Badge>

                                      {duplicate && (
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                          Already in CRM
                                        </Badge>
                                      )}
                                    </div>

                                    <p className="text-gray-500 mt-1 line-clamp-2">
                                      {lead.description ||
                                        "No description available."}
                                    </p>

                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                                      <span>
                                        {lead.industry || "Unknown"}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {lead.location || "Unknown"}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" />
                                        {lead.openRoles || 0} open roles
                                      </span>
                                      {lead.employees && (
                                        <span className="flex items-center gap-1">
                                          <Users className="w-4 h-4" />
                                          {lead.employees}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right flex-shrink-0">
                                    <div className="flex items-center gap-1 text-2xl font-bold text-red-600">
                                      <Star className="w-6 h-6" />
                                      {lead.score || "—"}%
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Lead Score
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {hasAccess("contactDiscovery")
                                      ? (lead.hiringManagers || []).length
                                      : "🔒"}{" "}
                                    hiring manager
                                    {hasAccess("contactDiscovery")
                                      ? (lead.hiringManagers || []).length !==
                                        1
                                        ? "s"
                                        : ""
                                      : "s"}{" "}
                                    found
                                  </span>

                                  <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {hasAccess("contactDiscovery")
                                      ? (lead.companyEmails || []).length
                                      : "🔒"}{" "}
                                    emails
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white gap-1"
                                  onClick={() => handleSelectLead(lead)}
                                >
                                  View
                                  <ChevronRight className="w-4 h-4" />
                                </Button>

                                {hasAccess("crmConversion") ? (
                                  !duplicate && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1"
                                      onClick={() => addToCRM(lead)}
                                    >
                                      <UserPlus className="w-4 h-4" />
                                      Add
                                    </Button>
                                  )
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1"
                                    onClick={() => navigate("/pricing")}
                                  >
                                    <Lock className="w-4 h-4" />
                                    Unlock
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* EMAIL DIALOG */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-red-600" />
              Personalized Outreach Email
            </DialogTitle>
          </DialogHeader>

          <Textarea
            value={generatedEmail}
            onChange={(event) => setGeneratedEmail(event.target.value)}
            className="min-h-[320px] font-mono text-sm"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 gap-2"
              onClick={() => copyToClipboard(generatedEmail)}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WHATSAPP DIALOG */}
      <Dialog open={whatsappOpen} onOpenChange={setWhatsappOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              WhatsApp Message
            </DialogTitle>
          </DialogHeader>

          <Textarea
            value={generatedWhatsapp}
            onChange={(event) => setGeneratedWhatsapp(event.target.value)}
            className="min-h-[200px] text-sm"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => copyToClipboard(generatedWhatsapp)}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
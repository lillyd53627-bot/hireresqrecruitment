import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import {
  Users,
  Briefcase,
  UserCheck,
  Plus,
  Loader2,
  RefreshCw,
  Building2,
  Target,
  FileText,
  Upload,
  AlertCircle,
  X,
  Search,
  Mic,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { supabase } from "@/lib/supabase";

/* ============================================================
   HELPERS
============================================================ */

const formatZAR = (n) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const STATUS_COLORS = {
  new: "bg-gray-100 text-gray-700",
  available: "bg-blue-100 text-blue-700",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-purple-100 text-purple-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
  open: "bg-green-100 text-green-700",
  interviewing: "bg-yellow-100 text-yellow-700",
  offered: "bg-orange-100 text-orange-700",
  filled: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function normaliseText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(value) {
  return new Set(
    normaliseText(value)
      .split(" ")
      .filter((word) => word.length >= 3)
  );
}

function calculateMatch(candidate, vacancy) {
  const candidateText = normaliseText(
    [
      candidate.job_title,
      candidate.industry,
      candidate.highest_education,
      candidate.skills,
      candidate.experience,
      candidate.cv_text,
    ].join(" ")
  );

  const vacancyText = normaliseText(
    [vacancy.title, vacancy.description, vacancy.location].join(" ")
  );

  if (!candidateText || !vacancyText) return 0;

  const candidateWords = getWords(candidateText);
  const vacancyWords = getWords(vacancyText);
  if (!candidateWords.size || !vacancyWords.size) return 0;

  let matches = 0;
  vacancyWords.forEach((word) => {
    if (candidateWords.has(word)) matches += 1;
  });

  return Math.min(99, Math.round((matches / vacancyWords.size) * 100));
}

/* ============================================================
   COMPONENT
============================================================ */

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [leads, setLeads] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [placements, setPlacements] = useState([]);

  const [clientFinderActive, setClientFinderActive] = useState(false);
  const [clientFinderExpiresLabel, setClientFinderExpiresLabel] = useState("");

  const initialTab = useMemo(() => {
    if (location.pathname.includes("/leads")) return "leads";
    if (location.pathname.includes("/vacancies")) return "vacancies";
    if (location.pathname.includes("/placements")) return "placements";
    return "overview";
  }, [location.pathname]);

  const [tab, setTab] = useState(initialTab);

  const [leadOpen, setLeadOpen] = useState(false);
  const [vacancyOpen, setVacancyOpen] = useState(false);
  const [candidateOpen, setCandidateOpen] = useState(false);
  const [placementOpen, setPlacementOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [leadForm, setLeadForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    industry: "",
    location: "",
    notes: "",
  });

  const [vacancyForm, setVacancyForm] = useState({
    lead_id: "",
    title: "",
    description: "",
    location: "",
    fee_amount: "",
  });

  const emptyCandidateForm = {
    candidate_name: "",
    job_title: "",
    age: "",
    id_number: "",
    ethnicity: "",
    gender: "",
    nationality: "",
    industry: "",
    highest_education: "",
    skills: "",
    experience: "",
    cv_text: "",
  };

  const [candidateForm, setCandidateForm] = useState(emptyCandidateForm);
  const [candidateFileName, setCandidateFileName] = useState("");

  const [placementForm, setPlacementForm] = useState({
    candidate_id: "",
    vacancy_id: "",
    candidate_name: "",
    company_name: "",
    fee_amount: "",
  });

  /* ==========================================================
     AUTH + LOAD
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;
        if (!currentUser) {
          navigate("/login");
          return;
        }

        setUser(currentUser);

        const { data: p, error: profileError } = await supabase
          .from("profiles")
          .select(
            "id, full_name, role, commission_rate, client_finder_expires_at"
          )
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!mounted) return;

        if (p?.role !== "recruiter" && p?.role !== "admin") {
          navigate("/dashboard");
          return;
        }

        setProfile(p);

        const expiresAt = p?.client_finder_expires_at
          ? new Date(p.client_finder_expires_at)
          : null;

        if (expiresAt && expiresAt > new Date()) {
          setClientFinderActive(true);
          setClientFinderExpiresLabel(
            expiresAt.toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          );
        } else {
          setClientFinderActive(false);
          setClientFinderExpiresLabel("");
        }

        await loadAll(currentUser.id);
        if (mounted) setLoading(false);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err.message || "Unable to load recruiter workspace.");
          setLoading(false);
        }
      }
    };

    initialise();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const loadAll = useCallback(async (recruiterId) => {
    setError(null);
    try {
      const [leadsResult, vacanciesResult, candidatesResult, placementsResult] =
        await Promise.all([
          supabase
            .from("recruiter_leads")
            .select("*")
            .eq("recruiter_id", recruiterId)
            .order("created_at", { ascending: false }),
          supabase
            .from("recruiter_vacancies")
            .select("*")
            .eq("recruiter_id", recruiterId)
            .order("created_at", { ascending: false }),
          supabase
            .from("recruiter_candidates")
            .select("*")
            .eq("recruiter_id", recruiterId)
            .order("created_at", { ascending: false }),
          supabase
            .from("recruiter_placements")
            .select("*")
            .eq("recruiter_id", recruiterId)
            .order("created_at", { ascending: false }),
        ]);

      if (leadsResult.error) throw leadsResult.error;
      if (vacanciesResult.error) throw vacanciesResult.error;
      if (candidatesResult.error) throw candidatesResult.error;
      if (placementsResult.error) throw placementsResult.error;

      setLeads(leadsResult.data || []);
      setVacancies(vacanciesResult.data || []);
      setCandidates(candidatesResult.data || []);
      setPlacements(placementsResult.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load recruiter workspace.");
    }
  }, []);

  const rate = Number(profile?.commission_rate ?? 0.5);

  const stats = useMemo(() => {
    const pending = placements.filter((p) => p.status === "pending");
    const approved = placements.filter((p) => p.status === "approved");
    const paid = placements.filter((p) => p.status === "paid");

    const pendingEarn = pending.reduce(
      (sum, p) => sum + Number(p.commission_amount || 0),
      0
    );
    const approvedEarn = approved.reduce(
      (sum, p) => sum + Number(p.commission_amount || 0),
      0
    );
    const paidEarn = paid.reduce(
      (sum, p) => sum + Number(p.commission_amount || 0),
      0
    );

    return {
      leads: leads.length,
      openVacancies: vacancies.filter((v) => v.status === "open").length,
      candidates: candidates.length,
      placements: placements.length,
      pendingEarn,
      approvedEarn,
      paidEarn,
      totalEarn: pendingEarn + approvedEarn + paidEarn,
    };
  }, [leads, vacancies, candidates, placements]);

  const handleUnlockClientFinder = () => {
    navigate("/dashboard/recruiter/client-finder-checkout");
  };

  /* ==========================================================
     SAVE HANDLERS
  ========================================================== */

  const saveLead = async () => {
    if (!user || !leadForm.company_name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("recruiter_leads")
        .insert({
          recruiter_id: user.id,
          company_name: leadForm.company_name.trim(),
          contact_name: leadForm.contact_name || null,
          email: leadForm.email || null,
          phone: leadForm.phone || null,
          industry: leadForm.industry || null,
          location: leadForm.location || null,
          notes: leadForm.notes || null,
          status: "new",
        })
        .select()
        .single();
      if (insertError) throw insertError;
      setLeads((prev) => [data, ...prev]);
      setLeadOpen(false);
      setLeadForm({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        industry: "",
        location: "",
        notes: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveVacancy = async () => {
    if (!user || !vacancyForm.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("recruiter_vacancies")
        .insert({
          recruiter_id: user.id,
          lead_id: vacancyForm.lead_id || null,
          title: vacancyForm.title.trim(),
          description: vacancyForm.description || null,
          location: vacancyForm.location || null,
          fee_amount: Number(vacancyForm.fee_amount) || 0,
          status: "open",
        })
        .select()
        .single();
      if (insertError) throw insertError;
      setVacancies((prev) => [data, ...prev]);
      setVacancyOpen(false);
      setVacancyForm({
        lead_id: "",
        title: "",
        description: "",
        location: "",
        fee_amount: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCandidateFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCandidateFileName(file.name);
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "txt" || extension === "csv") {
      try {
        const text = await file.text();
        setCandidateForm((prev) => ({ ...prev, cv_text: text }));
      } catch {
        setError("Unable to read this file.");
      }
    } else {
      setError(
        "The CV file has been selected. For PDF/DOCX extraction, paste the CV text into the profile box for now."
      );
    }
  };

  const saveCandidate = async () => {
    if (!user || !candidateForm.candidate_name.trim()) {
      setError("Candidate name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        recruiter_id: user.id,
        candidate_name: candidateForm.candidate_name.trim(),
        job_title: candidateForm.job_title || null,
        age: candidateForm.age ? Number(candidateForm.age) : null,
        id_number: candidateForm.id_number || null,
        ethnicity: candidateForm.ethnicity || null,
        gender: candidateForm.gender || null,
        nationality: candidateForm.nationality || null,
        industry: candidateForm.industry || null,
        highest_education: candidateForm.highest_education || null,
        skills: candidateForm.skills || null,
        experience: candidateForm.experience || null,
        cv_text: candidateForm.cv_text || null,
        status: "available",
      };
      const { data, error: insertError } = await supabase
        .from("recruiter_candidates")
        .insert(payload)
        .select()
        .single();
      if (insertError) throw insertError;
      setCandidates((prev) => [data, ...prev]);
      setCandidateOpen(false);
      setCandidateForm(emptyCandidateForm);
      setCandidateFileName("");
      setTab("candidates");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openPlacementForCandidate = (candidate, vacancy = null) => {
    setSelectedCandidate(candidate);
    setPlacementForm({
      candidate_id: candidate.id,
      vacancy_id: vacancy?.id || "",
      candidate_name: candidate.candidate_name || "",
      company_name: vacancy?.company_name || "",
      fee_amount: vacancy?.fee_amount ? String(vacancy.fee_amount) : "",
    });
    setPlacementOpen(true);
  };

  const savePlacement = async () => {
    if (!user || !placementForm.fee_amount) return;
    setSaving(true);
    setError(null);
    try {
      const fee = Number(placementForm.fee_amount) || 0;
      const commission_amount = Math.round(fee * rate * 100) / 100;
      const vacancy = vacancies.find((v) => v.id === placementForm.vacancy_id);
      const lead = leads.find((l) => l.id === vacancy?.lead_id);

      const { data, error: insertError } = await supabase
        .from("recruiter_placements")
        .insert({
          recruiter_id: user.id,
          candidate_id: placementForm.candidate_id || null,
          vacancy_id: placementForm.vacancy_id || null,
          lead_id: vacancy?.lead_id || null,
          company_name:
            placementForm.company_name || lead?.company_name || null,
          candidate_name:
            placementForm.candidate_name ||
            selectedCandidate?.candidate_name ||
            null,
          fee_amount: fee,
          commission_rate: rate,
          commission_amount,
          status: "pending",
        })
        .select()
        .single();
      if (insertError) throw insertError;

      setPlacements((prev) => [data, ...prev]);

      if (placementForm.vacancy_id) {
        await supabase
          .from("recruiter_vacancies")
          .update({ status: "filled" })
          .eq("id", placementForm.vacancy_id)
          .eq("recruiter_id", user.id);
        setVacancies((prev) =>
          prev.map((v) =>
            v.id === placementForm.vacancy_id ? { ...v, status: "filled" } : v
          )
        );
      }

      if (placementForm.candidate_id) {
        await supabase
          .from("recruiter_candidates")
          .update({ status: "placed" })
          .eq("id", placementForm.candidate_id)
          .eq("recruiter_id", user.id);
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === placementForm.candidate_id
              ? { ...c, status: "placed" }
              : c
          )
        );
      }

      setPlacementOpen(false);
      setSelectedCandidate(null);
      setPlacementForm({
        candidate_id: "",
        vacancy_id: "",
        candidate_name: "",
        company_name: "",
        fee_amount: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getCandidateMatches = (candidate) =>
    vacancies
      .filter((v) => v.status === "open")
      .map((vacancy) => ({
        vacancy,
        score: calculateMatch(candidate, vacancy),
      }))
      .filter((item) => item.score >= 10)
      .sort((a, b) => b.score - a.score);

  /* ==========================================================
     RENDER
  ========================================================== */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Hub</h1>
          <p className="text-sm text-gray-500 mt-1">
            Independent recruiter workspace
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => user && loadAll(user.id)}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError(null)} className="text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "My Client Leads",
            value: stats.leads,
            icon: Building2,
            colour: "text-blue-600 bg-blue-50",
          },
          {
            label: "Open Vacancies",
            value: stats.openVacancies,
            icon: Briefcase,
            colour: "text-green-600 bg-green-50",
          },
          {
            label: "My Candidates",
            value: stats.candidates,
            icon: Users,
            colour: "text-purple-600 bg-purple-50",
          },
          {
            label: "Placements",
            value: stats.placements,
            icon: UserCheck,
            colour: "text-red-600 bg-red-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.colour}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-red-600 to-red-700 text-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-white/80 text-sm">Your commission rate</p>
              <p className="text-3xl font-bold">{Math.round(rate * 100)}%</p>
              <p className="text-sm text-white/70 mt-1">
                Flat 50% commission on successful placements.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {formatZAR(stats.pendingEarn)}
                </p>
                <p className="text-xs text-white/70">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatZAR(stats.approvedEarn)}
                </p>
                <p className="text-xs text-white/70">Approved</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatZAR(stats.paidEarn)}
                </p>
                <p className="text-xs text-white/70">Paid</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          className="bg-red-600 hover:bg-red-700 gap-2"
          onClick={() => setCandidateOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Candidate
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setLeadOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Client Lead
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setVacancyOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Vacancy
        </Button>
      </div>

      {/* Optional tools */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Optional tools</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      AI Client Finder
                    </h3>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      R457 / 30 days
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Find companies currently hiring and unlock enrichment for 30
                    days.
                  </p>
                  {clientFinderActive ? (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Badge className="bg-green-100 text-green-700">
                        Active
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Expires {clientFinderExpiresLabel}
                      </span>
                      <Button
                        asChild
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Link to="/dashboard/aiclientfinder">
                          Open Client Finder
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 gap-2"
                        onClick={handleUnlockClientFinder}
                      >
                        <Lock className="w-4 h-4" />
                        Unlock for R457
                      </Button>
                      <span className="text-xs text-gray-500">
                        30-day access
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      AI Voice Agent
                    </h3>
                    <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
                      Coming soon
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Automated voice outreach and call handling for your desk.
                  </p>
                  <div className="mt-4">
                    <Button size="sm" variant="outline" disabled>
                      Coming soon
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">My Candidates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Independent Recruiter Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Building2 className="w-5 h-5 text-red-600" />
                <div>
                  <strong>1. Build your client pipeline</strong>
                  <p className="text-sm text-gray-500">
                    Add companies via{" "}
                    <button
                      type="button"
                      className="text-red-600 underline"
                      onClick={() => navigate("/dashboard/recruiter/leads")}
                    >
                      My Leads
                    </button>
                    .
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Briefcase className="w-5 h-5 text-red-600" />
                <div>
                  <strong>2. Add vacancies</strong>
                  <p className="text-sm text-gray-500">
                    Create vacancies on{" "}
                    <button
                      type="button"
                      className="text-red-600 underline"
                      onClick={() =>
                        navigate("/dashboard/recruiter/vacancies")
                      }
                    >
                      My Vacancies
                    </button>
                    .
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <strong>3. Add candidates</strong>
                  <p className="text-sm text-gray-500">
                    Paste a CV and capture candidate information below.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Target className="w-5 h-5 text-red-600" />
                <div>
                  <strong>4. Match and place</strong>
                  <p className="text-sm text-gray-500">
                    Log placements and track commission on{" "}
                    <button
                      type="button"
                      className="text-red-600 underline"
                      onClick={() =>
                        navigate("/dashboard/recruiter/placements")
                      }
                    >
                      Placements
                    </button>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4 mt-4">
          {candidates.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold">No candidates yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add your first candidate by pasting their profile or CV.
                </p>
                <Button
                  className="mt-4 bg-red-600 hover:bg-red-700"
                  onClick={() => setCandidateOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              </CardContent>
            </Card>
          )}

          {candidates.map((candidate) => {
            const matches = getCandidateMatches(candidate);
            return (
              <Card key={candidate.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">
                          {candidate.candidate_name}
                        </p>
                        <Badge
                          className={
                            STATUS_COLORS[candidate.status] ||
                            STATUS_COLORS.available
                          }
                        >
                          {candidate.status || "available"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {candidate.job_title || "Job title not specified"} ·{" "}
                        {candidate.industry || "Industry not specified"}
                      </p>
                    </div>
                    <Button
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => openPlacementForCandidate(candidate)}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Log Placement
                    </Button>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-red-600" />
                      <h4 className="font-semibold text-sm">Vacancy Matches</h4>
                    </div>
                    {matches.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No strong vacancy matches yet.
                      </p>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-3">
                        {matches.slice(0, 4).map(({ vacancy, score }) => (
                          <div
                            key={vacancy.id}
                            className="border rounded-xl p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium">{vacancy.title}</p>
                                <p className="text-xs text-gray-500">
                                  {vacancy.location}
                                </p>
                              </div>
                              <Badge className="bg-green-100 text-green-700">
                                {score}% Match
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              className="mt-3 bg-red-600 hover:bg-red-700"
                              onClick={() =>
                                openPlacementForCandidate(candidate, vacancy)
                              }
                            >
                              Use for Placement
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Add Candidate */}
      <Dialog open={candidateOpen} onOpenChange={setCandidateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Add Candidate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div>
              <h3 className="font-semibold mb-3">Candidate Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Candidate name *</Label>
                  <Input
                    value={candidateForm.candidate_name}
                    onChange={(e) =>
                      setCandidateForm((f) => ({
                        ...f,
                        candidate_name: e.target.value,
                      }))
                    }
                    placeholder="Full candidate name"
                  />
                </div>
                <div>
                  <Label>Job title</Label>
                  <Input
                    value={candidateForm.job_title}
                    onChange={(e) =>
                      setCandidateForm((f) => ({
                        ...f,
                        job_title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={candidateForm.age}
                    onChange={(e) =>
                      setCandidateForm((f) => ({ ...f, age: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>ID no:</Label>
                  <Input
                    value={candidateForm.id_number}
                    onChange={(e) =>
                      setCandidateForm((f) => ({
                        ...f,
                        id_number: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Ethnicity</Label>
                  <Input
                    value={candidateForm.ethnicity}
                    onChange={(e) =>
                      setCandidateForm((f) => ({
                        ...f,
                        ethnicity: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Input
                    value={candidateForm.gender}
                    onChange={(e) =>
                      setCandidateForm((f) => ({
                        ...f,
                        gender: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input
                    value={candidateForm.nationality}
                    onChange={(e) =>
                      setCandidateForm((f) => ({
                        ...f,
                        nationality: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input
                    value={candidateForm.industry}
                    onChange={(e) =>
                      setCandidateForm((f) => ({
                        ...f,
                        industry: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Highest Education</Label>
                  <Input
                    value={candidateForm.highest_education}
                    onChange={(e) =>
                      setCandidateForm((f) => ({
                        ...f,
                        highest_education: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Skills</Label>
              <Textarea
                value={candidateForm.skills}
                onChange={(e) =>
                  setCandidateForm((f) => ({ ...f, skills: e.target.value }))
                }
                rows={4}
              />
            </div>
            <div>
              <Label>Work Experience</Label>
              <Textarea
                value={candidateForm.experience}
                onChange={(e) =>
                  setCandidateForm((f) => ({
                    ...f,
                    experience: e.target.value,
                  }))
                }
                rows={6}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>CV / Profile Information</Label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.csv"
                    className="hidden"
                    onChange={handleCandidateFile}
                  />
                  <span className="inline-flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    Optional CV Upload
                  </span>
                </label>
              </div>
              {candidateFileName && (
                <p className="text-xs text-gray-500 mb-2">
                  Selected: {candidateFileName}
                </p>
              )}
              <Textarea
                value={candidateForm.cv_text}
                onChange={(e) =>
                  setCandidateForm((f) => ({ ...f, cv_text: e.target.value }))
                }
                rows={12}
                placeholder="Paste the candidate's CV or complete work profile here."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCandidateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={saving || !candidateForm.candidate_name.trim()}
              onClick={saveCandidate}
            >
              {saving ? "Saving Candidate..." : "Add Candidate to Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lead */}
      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Company name *</Label>
              <Input
                value={leadForm.company_name}
                onChange={(e) =>
                  setLeadForm((f) => ({ ...f, company_name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Contact name</Label>
              <Input
                value={leadForm.contact_name}
                onChange={(e) =>
                  setLeadForm((f) => ({ ...f, contact_name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input
                  value={leadForm.email}
                  onChange={(e) =>
                    setLeadForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={leadForm.phone}
                  onChange={(e) =>
                    setLeadForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={leadForm.notes}
                onChange={(e) =>
                  setLeadForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeadOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={saving || !leadForm.company_name.trim()}
              onClick={saveLead}
            >
              {saving ? "Saving..." : "Save Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Vacancy */}
      <Dialog open={vacancyOpen} onOpenChange={setVacancyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vacancy</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Link to client lead</Label>
              <Select
                value={vacancyForm.lead_id}
                onValueChange={(value) =>
                  setVacancyForm((f) => ({ ...f, lead_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job title *</Label>
              <Input
                value={vacancyForm.title}
                onChange={(e) =>
                  setVacancyForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={vacancyForm.location}
                onChange={(e) =>
                  setVacancyForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Placement fee (ZAR)</Label>
              <Input
                type="number"
                value={vacancyForm.fee_amount}
                onChange={(e) =>
                  setVacancyForm((f) => ({
                    ...f,
                    fee_amount: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Job description</Label>
              <Textarea
                value={vacancyForm.description}
                onChange={(e) =>
                  setVacancyForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVacancyOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={saving || !vacancyForm.title.trim()}
              onClick={saveVacancy}
            >
              {saving ? "Saving..." : "Save Vacancy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Placement */}
      <Dialog open={placementOpen} onOpenChange={setPlacementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Candidate Placement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500">Candidate</p>
              <p className="font-semibold">
                {placementForm.candidate_name || "Candidate"}
              </p>
            </div>
            <div>
              <Label>Vacancy</Label>
              <Select
                value={placementForm.vacancy_id}
                onValueChange={(value) => {
                  const vacancy = vacancies.find((v) => v.id === value);
                  setPlacementForm((f) => ({
                    ...f,
                    vacancy_id: value,
                    fee_amount: vacancy?.fee_amount
                      ? String(vacancy.fee_amount)
                      : f.fee_amount,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vacancy" />
                </SelectTrigger>
                <SelectContent>
                  {vacancies
                    .filter((v) => v.status === "open")
                    .map((vacancy) => (
                      <SelectItem key={vacancy.id} value={vacancy.id}>
                        {vacancy.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Company name</Label>
              <Input
                value={placementForm.company_name}
                onChange={(e) =>
                  setPlacementForm((f) => ({
                    ...f,
                    company_name: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Placement fee received (ZAR) *</Label>
              <Input
                type="number"
                value={placementForm.fee_amount}
                onChange={(e) =>
                  setPlacementForm((f) => ({
                    ...f,
                    fee_amount: e.target.value,
                  }))
                }
              />
              {placementForm.fee_amount && (
                <p className="text-xs text-gray-500 mt-2">
                  Estimated commission:{" "}
                  <strong className="text-red-600">
                    {formatZAR(Number(placementForm.fee_amount) * rate)}
                  </strong>
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlacementOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={saving || !placementForm.fee_amount}
              onClick={savePlacement}
            >
              {saving ? "Submitting..." : "Submit Placement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
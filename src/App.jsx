import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { supabase } from "./lib/supabase";

// ============================================================
// PUBLIC WEBSITE PAGES
// ============================================================
import Home from "./pages/Home";
import FeaturesDemo from "./pages/FeaturesDemo";
import Pricing from "./pages/Pricing";
import Demo from "./pages/Demo";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Security from "./pages/Security";
import POPIA from "./pages/POPIA";
import Partners from "./pages/Partners";
import PartnerRegister from "./pages/PartnerRegister";

import Login from "./pages/Login";
import Register from "./pages/Register";

// ============================================================
// FEATURE DEMO PAGES
// ============================================================
import AIClientFinderDemo from "./pages/FeaturesDemo/AIClientFinderDemo";
import AIOutreachDemo from "./pages/FeaturesDemo/AIOutreachDemo";
import AITalentSourcingDemo from "./pages/FeaturesDemo/AITalentSourcingDemo";
import AIVideoScreeningDemo from "./pages/FeaturesDemo/AIVideoScreeningDemo";
import AISmartReportingDemo from "./pages/FeaturesDemo/AISmartReportingDemo";
import AIAssistantDemo from "./pages/FeaturesDemo/AIAssistantdemo";
import CandidatePortalDemo from "./pages/FeaturesDemo/CandidatePortalDemo";
import ClientPortalDemo from "./pages/FeaturesDemo/ClientPortalDemo";
import JobTrackerDemo from "./pages/FeaturesDemo/JobTrackerDemo";
import AIAutomatedInvoicingDemo from "./pages/FeaturesDemo/AIAutomatedInvoicingDemo";

// ============================================================
// DASHBOARD LAYOUT
// ============================================================
import DashboardLayout from "./components/Dashboard/DashboardLayout";

// ============================================================
// DASHBOARD PAGES
// ============================================================
import DashboardHome from "./pages/Dashboard/Dashboard";
import AIAssistant from "./pages/Dashboard/AIAssistant";
import AIClientFinder from "./pages/Dashboard/AIClientFinder";
import AISourcing from "./pages/Dashboard/AISourcing";
import Candidates from "./pages/Dashboard/Candidates";
import AddApplicant from "./pages/Dashboard/AddApplicant";
import JobTracker from "./pages/Dashboard/JobTracker";
import Clients from "./pages/Dashboard/Clients";
import Companies from "./pages/Dashboard/Companies";
import Outreach from "./pages/Dashboard/Outreach";
import Interviews from "./pages/Dashboard/Interviews";
import AISmartReporting from "./pages/Dashboard/AISmartReporting";
import OnboardingWorkflows from "./pages/Dashboard/OnboardingWorkflows";
import Settings from "./pages/Dashboard/Settings";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import SmartReporting from "./pages/Dashboard/SmartReporting";
import AIVideoScreening from "./pages/Dashboard/AIVideoScreening";
import AIVoiceAgent from "./pages/Dashboard/AIVoiceAgent";
import AICalls from "./pages/Dashboard/AICalls";
import CandidateProfile from "./pages/Candidate/Profile";
import PublicCandidates from "./pages/Dashboard/PublicCandidates";
import RecruiterClientFinderCheckout from "./pages/Dashboard/RecruiterClientFinderCheckout";

// Public Job Board pages
import CandidateRegister from "./pages/CandidateRegister";
import PostJob from "./pages/PostJob";
import CandidateDirectory from "./pages/CandidateDirectory";

// Independent Recruiter pages
import RecruiterDashboard from "./pages/Dashboard/RecruiterDashboard";
import RecruiterLeads from "./pages/Dashboard/RecruiterLeads";
import RecruiterVacancies from "./pages/Dashboard/RecruiterVacancies";
import RecruiterPlacements from "./pages/Dashboard/RecruiterPlacements";

// ============================================================
// AUTHENTICATED DASHBOARD GUARD
// ============================================================
function DashboardAuthGuard() {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setLoading(false);
      } catch (error) {
        console.error("Unable to load authentication session:", error);

        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    );
  }

  return <Outlet />;
}

// ============================================================
// APP
// ============================================================
export default function App() {
  return (
    <Routes>
      {/* PUBLIC WEBSITE */}
      <Route path="/" element={<Home />} />
      <Route path="/features" element={<FeaturesDemo />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />

      {/* PARTNERS — public */}
      <Route path="/partners" element={<Partners />} />
      <Route path="/partners/register/:type" element={<PartnerRegister />} />

      {/* AUTHENTICATION */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* LEGAL */}
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/security" element={<Security />} />
      <Route path="/popia" element={<POPIA />} />

      {/* PUBLIC FEATURE DEMOS */}
      <Route path="/demo/ai-client-finder" element={<AIClientFinderDemo />} />
      <Route path="/demo/ai-outreach-engine" element={<AIOutreachDemo />} />
      <Route path="/demo/ai-talent-sourcing" element={<AITalentSourcingDemo />} />
      <Route path="/demo/ai-video-screening" element={<AIVideoScreeningDemo />} />
      <Route path="/demo/smart-reporting" element={<AISmartReportingDemo />} />
      <Route path="/demo/ai-assistant" element={<AIAssistantDemo />} />
      <Route path="/demo/candidate-portal" element={<CandidatePortalDemo />} />
      <Route path="/demo/client-portal" element={<ClientPortalDemo />} />
      <Route path="/demo/job-tracker" element={<JobTrackerDemo />} />
      <Route path="/demo/automated-invoicing" element={<AIAutomatedInvoicingDemo />} />

      {/* PUBLIC JOB BOARD — direct links work when vercel.json is set */}
      <Route path="/candidate-register" element={<CandidateRegister />} />
      <Route path="/post-job" element={<PostJob />} />
      <Route path="/candidates" element={<CandidateDirectory />} />

      {/* AUTHENTICATED DASHBOARD */}
      <Route element={<DashboardAuthGuard />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />

          <Route path="candidates" element={<Candidates />} />
          <Route path="candidates/add" element={<AddApplicant />} />
          <Route path="public-candidates" element={<PublicCandidates />} />

          <Route path="jobs" element={<JobTracker />} />
          <Route path="jobtracker" element={<JobTracker />} />

          <Route path="clients" element={<Clients />} />
          <Route path="companies" element={<Companies />} />

          <Route path="outreach" element={<Outreach />} />
          <Route path="interviews" element={<Interviews />} />

          <Route path="analytics" element={<AISmartReporting />} />
          <Route path="smart-reporting" element={<SmartReporting />} />

          <Route path="aiclientfinder" element={<AIClientFinder />} />
          <Route path="aisourcing" element={<AISourcing />} />
          <Route path="aiassistant" element={<AIAssistant />} />
          <Route path="video-screening" element={<AIVideoScreening />} />

          <Route path="onboarding" element={<OnboardingWorkflows />} />
          <Route path="onboardingworkflows" element={<OnboardingWorkflows />} />

          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminDashboard />} />

          <Route path="ai-voice" element={<AIVoiceAgent />} />
          <Route path="ai-calls" element={<AICalls />} />

          <Route path="recruiter" element={<RecruiterDashboard />} />
          <Route path="recruiter/leads" element={<RecruiterLeads />} />
          <Route path="recruiter/vacancies" element={<RecruiterVacancies />} />
          <Route path="recruiter/placements" element={<RecruiterPlacements />} />
          <Route path="recruiter/client-finder-checkout"
          element={<RecruiterClientFinderCheckout />} />
        
        </Route>

        <Route path="/candidate/profile" element={<CandidateProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
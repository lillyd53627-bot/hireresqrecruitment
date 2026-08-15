// src/App.jsx

import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
import AIVideoScreening from "./pages/Dashboard/AIVideoScreening";
import Candidates from "./pages/Dashboard/Candidates";
import JobTracker from "./pages/Dashboard/JobTracker";
import Clients from "./pages/Dashboard/Clients";
import Companies from "./pages/Dashboard/Companies";
import Outreach from "./pages/Dashboard/Outreach";
import Interviews from "./pages/Dashboard/Interviews";
import AISmartReporting from "./pages/Dashboard/AISmartReporting";
import OnboardingWorkflows from "./pages/Dashboard/OnboardingWorkflows";
import Settings from "./pages/Dashboard/Settings";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import AutomatedInvoicing from "./pages/Dashboard/AutomatedInvoicing";
import CandidatePortal from "./pages/Dashboard/CandidatePortal";
import SmartReporting from "./pages/Dashboard/SmartReporting";

// ============================================================
// APP
// ============================================================
export default function App() {
  return (
    <Routes>

      {/* ======================================================
          PUBLIC WEBSITE
         ====================================================== */}

      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Main navigation */}
      <Route path="/features" element={<FeaturesDemo />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Legal */}
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/security" element={<Security />} />
      <Route path="/popia" element={<POPIA />} />


      {/* ======================================================
          FEATURE DEMOS
         ====================================================== */}

      <Route
        path="/demo/ai-client-finder"
        element={<AIClientFinderDemo />}
      />

      <Route
        path="/demo/ai-outreach-engine"
        element={<AIOutreachDemo />}
      />

      <Route
        path="/demo/ai-talent-sourcing"
        element={<AITalentSourcingDemo />}
      />

      <Route
        path="/demo/ai-video-screening"
        element={<AIVideoScreeningDemo />}
      />

      <Route
        path="/demo/smart-reporting"
        element={<AISmartReportingDemo />}
      />

      <Route
        path="/demo/ai-assistant"
        element={<AIAssistantDemo />}
      />

      <Route
        path="/demo/candidate-portal"
        element={<CandidatePortalDemo />}
      />

      <Route
        path="/demo/client-portal"
        element={<ClientPortalDemo />}
      />

      <Route
        path="/demo/job-tracker"
        element={<JobTrackerDemo />}
      />

      <Route
        path="/demo/automated-invoicing"
        element={<AIAutomatedInvoicingDemo />}
      />


      {/* ======================================================
          DASHBOARD
         ====================================================== */}

      <Route
        path="/dashboard"
        element={<DashboardLayout />}
      >

        {/* Dashboard Home */}
        <Route
          index
          element={<DashboardHome />}
        />

        {/* AI Assistant */}
        <Route
          path="aiassistant"
          element={<AIAssistant />}
        />

        {/* AI Sourcing */}
        <Route
          path="aisourcing"
          element={<AISourcing />}
        />

        {/* AI Client Finder */}
        <Route
          path="aiclientfinder"
          element={<AIClientFinder />}
        />

        {/* Candidates */}
        <Route
          path="candidates"
          element={<Candidates />}
        />

        {/* Jobs */}
        <Route
          path="jobs"
          element={<JobTracker />}
        />

        {/* Job Tracker alias */}
        <Route
          path="jobtracker"
          element={<JobTracker />}
        />

        {/* Clients */}
        <Route
          path="clients"
          element={<Clients />}
        />

        {/* Companies */}
        <Route
          path="companies"
          element={<Companies />}
        />

        {/* Outreach */}
        <Route
          path="outreach"
          element={<Outreach />}
        />

        {/* Interviews */}
        <Route
          path="interviews"
          element={<Interviews />}
        />

        {/* Analytics */}
        <Route
          path="analytics"
          element={<AISmartReporting />}
        />

        {/* Smart Reporting */}
        <Route
          path="smart-reporting"
          element={<SmartReporting />}
        />

        {/* AI Video Screening */}
        <Route
          path="video-screening"
          element={<AIVideoScreening />}
        />

        {/* ==================================================
            ONBOARDING
           ================================================== */}

        {/* Sidebar route */}
        <Route
          path="onboardingworkflows"
          element={<OnboardingWorkflows />}
        />

        {/* Short alias */}
        <Route
          path="onboarding"
          element={<OnboardingWorkflows />}
        />

        {/* ==================================================
            SETTINGS
           ================================================== */}

        <Route
          path="settings"
          element={<Settings />}
        />

        {/* ==================================================
            ADMIN
           ================================================== */}

        <Route
          path="admin"
          element={<AdminDashboard />}
        />

        {/* ==================================================
            OTHER DASHBOARD FEATURES
           ================================================== */}

        {/* Automated Invoicing */}
        <Route
          path="invoicing"
          element={<AutomatedInvoicing />}
        />

        {/* Candidate Portal */}
        <Route
          path="candidateportal"
          element={<CandidatePortal />}
        />

      </Route>


      {/* ======================================================
          UNKNOWN ROUTES
         ====================================================== */}

      {/* Unknown URLs go to PUBLIC HOME */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}
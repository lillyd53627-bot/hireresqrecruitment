// src/App.jsx
import { Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Register from "./pages/Register";

// Company & Legal Pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Security from "./pages/Security";
import POPIA from "./pages/POPIA";
import Demo from "./pages/Demo";

// Feature Demo Pages
import AIClientFinderDemo from "./pages/FeaturesDemo/AIClientFinderDemo";
import AIOutreachDemo from "./pages/FeaturesDemo/AIOutreachDemo";
import AITalentSourcingDemo from "./pages/FeaturesDemo/AITalentSourcingDemo";
import AIVideoScreeningDemo from "./pages/FeaturesDemo/AIVideoScreeningDemo";
import AISmartReportingDemo from "./pages/FeaturesDemo/AISmartReportingDemo";
import AIAssistantDemo from "./pages/FeaturesDemo/AIAssistantdemo";
import AutomatedInvoicingDemo from "./pages/FeaturesDemo/AIAutomatedInvoicingDemo";
import CandidatePortalDemo from "./pages/FeaturesDemo/CandidatePortalDemo";
import ClientPortalDemo from "./pages/FeaturesDemo/ClientPortalDemo";
import JobTrackerDemo from "./pages/FeaturesDemo/JobTrackerDemo";

// Payment & Login
import PaymentSuccess from "./pages/PaymentSuccess";
import Login from "./pages/Login";

// Dashboard Layout
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

// Real Dashboard Pages
import AIAssistant from "./pages/Dashboard/AIAssistant";
import AISourcing from "./pages/Dashboard/AISourcing";
import Candidates from "./pages/Dashboard/Candidates";
import JobTracker from "./pages/Dashboard/JobTracker";
import AIClientFinder from "./pages/Dashboard/AIClientFinder";
import Clients from "./pages/Dashboard/Clients";
import Outreach from "./pages/Dashboard/Outreach";
import Interviews from "./pages/Dashboard/Interviews";
import AISmartReporting from "./pages/Dashboard/AISmartReporting";
import OnboardingWorkflows from "./pages/Dashboard/OnboardingWorkflows";
import Settings from "./pages/Dashboard/Settings";

// Affiliate Pages
import AffiliateLanding from "./pages/affiliateLanding";
import AffiliateRegister from "./pages/affiliateRegister";
import AffiliateDashboard from "./pages/affiliateDashboard";

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/login" element={<Login />} />

      {/* Info Pages */}
      <Route path="/features" element={<Demo />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/demo" element={<Demo />} />

      {/* Legal */}
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/security" element={<Security />} />
      <Route path="/popia" element={<POPIA />} />

      {/* Demo Features */}
      <Route path="/demo/ai-client-finder" element={<AIClientFinderDemo />} />
      <Route path="/demo/ai-outreach-engine" element={<AIOutreachDemo />} />
      <Route path="/demo/ai-talent-sourcing" element={<AITalentSourcingDemo />} />
      <Route path="/demo/ai-video-screening" element={<AIVideoScreeningDemo />} />
      <Route path="/demo/smart-reporting" element={<AISmartReportingDemo />} />
      <Route path="/demo/ai-assistant" element={<AIAssistantDemo />} />
      <Route path="/demo/automated-invoicing" element={<AutomatedInvoicingDemo />} />
      <Route path="/demo/candidate-portal" element={<CandidatePortalDemo />} />
      <Route path="/demo/client-portal" element={<ClientPortalDemo />} />
      <Route path="/demo/job-tracker" element={<JobTrackerDemo />} />

      {/* Affiliate */}
      <Route path="/affiliate" element={<AffiliateLanding />} />
      <Route path="/affiliate/register" element={<AffiliateRegister />} />
      <Route path="/affiliate/dashboard" element={<AffiliateDashboard />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="aiassistant" element={<AIAssistant />} />
        <Route path="aisourcing" element={<AISourcing />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="jobs" element={<JobTracker />} />
        <Route path="aiclientfinder" element={<AIClientFinder />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="outreach" element={<Outreach />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="analytics" element={<AISmartReporting />} />
        <Route path="onboardingworkflows" element={<OnboardingWorkflows />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div>404 Not Found</div>} />

    </Routes>
  );
}

export default App;
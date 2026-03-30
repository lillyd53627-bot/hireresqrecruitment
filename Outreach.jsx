// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Security from "./pages/Security";
import POPIA from "./pages/POPIA";
import FAQ from "./pages/FAQ";

// Demo pages (standalone, marketing-friendly, no sidebar)
import AIClientFinderDemo from "./pages/FeaturesDemo/AIClientFinderDemo";
import AITalentSourcingDemo from "./pages/FeaturesDemo/AITalentSourcingDemo";
import AIVideoScreeningDemo from "./pages/FeaturesDemo/AIVideoScreeningDemo";
import AIOutreachDemo from "./pages/FeaturesDemo/AIOutreachDemo";
import AISmartReportingDemo from "./pages/FeaturesDemo/AISmartReportingDemo";
import AIAutomatedInvoicingDemo from "./pages/FeaturesDemo/AIAutomatedInvoicingDemo";
import JobTrackerDemo from "./pages/FeaturesDemo/JobTrackerDemo";
import ClientPortalDemo from "./pages/FeaturesDemo/ClientPortalDemo";
import CandidatePortalDemo from "./pages/FeaturesDemo/CandidatePortalDemo";

// Protected Real Dashboard
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";

// Layout for public pages
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public pages with Header + Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/security" element={<Security />} />
          <Route path="/popia" element={<POPIA />} />
          <Route path="/faq" element={<FAQ />} />
        </Route>

        {/* Standalone Demo Pages (no sidebar - perfect for marketing) */}
        <Route path="/demo/ai-client-finder" element={<AIClientFinderDemo />} />
        <Route path="/demo/ai-talent-sourcing" element={<AITalentSourcingDemo />} />
        <Route path="/demo/ai-video-screening" element={<AIVideoScreeningDemo />} />
        <Route path="/demo/outreach" element={<AIOutreachDemo />} />
        <Route path="/demo/smart-reporting" element={<AISmartReportingDemo />} />
        <Route path="/demo/automated-invoicing" element={<AIAutomatedInvoicingDemo />} />
        <Route path="/demo/job-tracker" element={<JobTrackerDemo />} />
        <Route path="/demo/client-portal" element={<ClientPortalDemo />} />
        <Route path="/demo/candidate-portal" element={<CandidatePortalDemo />} />

        {/* Protected Real Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          {/* Add more real pages here later */}
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-800">404</h1>
              <p className="text-2xl text-gray-600 mt-4">Page Not Found</p>
              <a href="/" className="mt-6 inline-block bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700">
                Back to Home
              </a>
            </div>
          </div>
        } />

      </Routes>
    </Router>
  );
}

export default App;

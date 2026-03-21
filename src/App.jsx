import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

// Public / marketing pages
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';
import Register from './pages/Register';

// Feature demo pages (public / standalone)
import AIClientFinderDemo from './pages/features/AIClientFinderDemo';
import AITalentSourcingDemo from './pages/features/AITalentSourcingDemo';
import SmartReportingDemo from './pages/features/SmartReportingDemo';
import AutomatedInvoicingDemo from './pages/features/AutomatedInvoicingDemo';
import CandidatePortalDemo from './pages/features/CandidatePortalDemo';
import OutreachDemo from './pages/features/OutreachDemo.jsx';
import AIVideoScreeningDemo from './pages/features/AIVideoScreeningDemo.jsx';
import JobTrackerDemo from './pages/features/JobTrackerDemo.jsx';
import ClientPortalDemo from './pages/features/ClientPortalDemo.jsx';
import Demo from './pages//Demo';  // or adjust path if you placed it elsewhere


// Dashboard layout + pages
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Clients from './pages/Dashboard/Clients';
import Jobs from './pages/Dashboard/Jobs';
import Candidates from './pages/Dashboard/Candidates';
import Companies from './pages/Dashboard/Companies';
import AIAssistant from './pages/Dashboard/AIAssistant';
import Interviews from './pages/Dashboard/Interviews';
import Settings from './pages/Dashboard/Settings';
import Analytics from './pages/Dashboard/Analytics';
import OnboardingWorkflows from './pages/Dashboard/OnboardingWorkflows';
import Contact from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public pages – no layout */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/register" element={<Register />} />

        {/* Public demo pages – standalone (no dashboard layout) */}
        <Route path="/demo" element={<Demo />} />
        <Route path="/demo/ai-client-finder" element={<AIClientFinderDemo />} />
        <Route path="/demo/ai-talent-sourcing" element={<AITalentSourcingDemo />} />
        <Route path="/demo/ai-video-screening" element={<AIVideoScreeningDemo />} />
        <Route path="/demo/smart-reporting" element={<SmartReportingDemo />} />
        <Route path="/demo/automated-invoicing" element={<AutomatedInvoicingDemo />} />
        <Route path="/demo/crm-job-tracker" element={<JobTrackerDemo />} />
        <Route path="/demo/client-portal" element={<ClientPortalDemo />} />
        <Route path="/demo/candidate-portal" element={<CandidatePortalDemo />} />
        <Route path="/demo/outreach" element={<OutreachDemo />} />
        

        {/* Protected dashboard routes – with layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/clients" element={<Clients />} />
          <Route path="/dashboard/jobs" element={<Jobs />} />
          <Route path="/dashboard/candidates" element={<Candidates />} />
          <Route path="/dashboard/companies" element={<Companies />} />
          <Route path="/dashboard/aiassistant" element={<AIAssistant />} />
          <Route path="/dashboard/interviews" element={<Interviews />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/onboardingworkflows" element={<OnboardingWorkflows />} />
        </Route>
        <Route path="/contact" element={<Contact />} />

        {/* Catch-all 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center px-4">
                <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
                <p className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</p>
                <p className="text-gray-600 mb-6">
                  The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Go back to Home
                </Link>
              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAssistant from './pages/AIAssistant';
import AISourcing from './pages/AISourcing';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminDashboard from './pages/AdminDashboard';
import AdminPayments from './pages/AdminPayments';
import AdminSettings from './pages/AdminSettings';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminUsers from './pages/AdminUsers';
import Analytics from './pages/Analytics';
import CandidateProfile from './pages/CandidateProfile';
import Candidates from './pages/Candidates';
import Clients from './pages/Clients';
import Companies from './pages/Companies';
import CompanyBranding from './pages/CompanyBranding';
import Dashboard from './pages/Dashboard';
import Demo from './pages/Demo';
import Home from './pages/Home';
import Interviews from './pages/Interviews';
import Invoicing from './pages/Invoicing';
import Jobs from './pages/Jobs';
import Landing from './pages/Landing';
import OnboardingWorkflows from './pages/OnboardingWorkflows';
import Outreach from './pages/Outreach';
import PaymentCallback from './pages/PaymentCallback';
import Pricing from './pages/Pricing';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Success from './pages/Success';
import TikTokAnalytics from './pages/TikTokAnalytics';
import Contact from './pages/Contact';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistant": AIAssistant,
    "AISourcing": AISourcing,
    "AdminAuditLogs": AdminAuditLogs,
    "AdminDashboard": AdminDashboard,
    "AdminPayments": AdminPayments,
    "AdminSettings": AdminSettings,
    "AdminSubscriptions": AdminSubscriptions,
    "AdminUsers": AdminUsers,
    "Analytics": Analytics,
    "CandidateProfile": CandidateProfile,
    "Candidates": Candidates,
    "Clients": Clients,
    "Companies": Companies,
    "CompanyBranding": CompanyBranding,
    "Dashboard": Dashboard,
    "Demo": Demo,
    "Home": Home,
    "Interviews": Interviews,
    "Invoicing": Invoicing,
    "Jobs": Jobs,
    "Landing": Landing,
    "OnboardingWorkflows": OnboardingWorkflows,
    "Outreach": Outreach,
    "PaymentCallback": PaymentCallback,
    "Pricing": Pricing,
    "Register": Register,
    "Settings": Settings,
    "Success": Success,
    "TikTokAnalytics": TikTokAnalytics,
    "Contact": Contact,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};
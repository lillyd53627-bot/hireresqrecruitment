// src/pages/Home.jsx
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  Menu, 
  X, 
  MessageCircle, 
  Building2, 
  Mail, 
  Users, 
  Video, 
  BarChart3, 
  FileText, 
  Briefcase, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ==================== HEADER ====================
function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = localStorage.getItem("user");

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/pricing", label: "Pricing" },
    { to: "/demo", label: "Demo" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/faq", label: "FAQ" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="text-2xl font-bold text-red-600">
            HireResQ AI
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "text-red-600 font-medium" : "text-gray-700 hover:text-red-600 font-medium"
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isLoggedIn && (
              <Link to="/dashboard" className="text-gray-700 hover:text-red-600 font-medium">
                Dashboard
              </Link>
            )}

            <a
              href="https://wa.me/0834676026"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </nav>

          {isLoggedIn && (
            <Button onClick={handleLogout} className="bg-black text-white hidden md:block">
              Logout
            </Button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="text-gray-800 hover:text-red-600"
              >
                {link.label}
              </NavLink>
            ))}

            {isLoggedIn && (
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-gray-800 hover:text-red-600">
                Dashboard
              </Link>
            )}

            <a
              href="https://wa.me/0834676026"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white text-center py-3 rounded-xl"
            >
              WhatsApp
            </a>

            {isLoggedIn && (
              <Button onClick={handleLogout} className="bg-black text-white w-full">
                Logout
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// ==================== MAIN HOME PAGE ====================
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* New Branded Hero */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                AI-Powered Recruitment
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold leading-tight tracking-tighter">
                HireResQ AI
                <br />
                <span className="text-red-500">Your Automated</span><br />
                Hiring Department
              </h1>

              <p className="text-xl text-gray-300 max-w-lg">
                Recruitment that runs itself. AI finds clients for you. 
                AI finds candidates for you. You focus on results, we automate the work.
              </p>

              <div className="flex flex-wrap gap-4">

<Link to="/register">
  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-2xl flex items-center gap-3">
    Get Started
    <ArrowRight className="w-5 h-5" />
  </Button>
</Link>

<Button 
  variant="outline" 
  size="lg" 
  className="border-white/30 hover:bg-white/10 text-black px-8 py-6 text-lg rounded-2xl flex items-center gap-3"
  asChild
>
  <Link to="/demo">
    <Play className="w-5 h-5" /> Watch Demo
  </Link>
</Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-black p-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-500">HireResQ AI • Dashboard</div>
                </div>

                <div className="p-8 bg-zinc-950">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-xs px-4 py-1 rounded-full mb-4">
                      AI Sourcing Active • Live
                    </div>
                    <div className="text-6xl font-bold text-white">847</div>
                    <p className="text-gray-400">Candidates Found This Week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600">Everything you need to run a high-performance recruitment operation</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border hover:shadow-md transition-all">
              <div className="text-red-600 mb-6"><Building2 size={48} /></div>
              <h3 className="text-2xl font-semibold mb-3">AI Client Finder</h3>
              <p className="text-gray-600 mb-6">Automatically discover companies actively hiring</p>
              <Link to="/demo/ai-client-finder" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border hover:shadow-md transition-all">
              <div className="text-red-600 mb-6"><Mail size={48} /></div>
              <h3 className="text-2xl font-semibold mb-3">AI Outreach Engine</h3>
              <p className="text-gray-600 mb-6">Personalized sequences that book meetings</p>
              <Link to="/demo/ai-outreach-engine" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border hover:shadow-md transition-all">
              <div className="text-red-600 mb-6"><Users size={48} /></div>
              <h3 className="text-2xl font-semibold mb-3">AI Candidate Sourcing</h3>
              <p className="text-gray-600 mb-6">Source from millions of profiles instantly</p>
              <Link to="/demo/ai-talent-sourcing" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border hover:shadow-md transition-all">
              <div className="text-red-600 mb-6"><Video size={48} /></div>
              <h3 className="text-2xl font-semibold mb-3">AI Video Screening</h3>
              <p className="text-gray-600 mb-6">Automated interviews with smart scoring</p>
              <Link to="/demo/ai-video-screening" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border hover:shadow-md transition-all">
              <div className="text-red-600 mb-6"><BarChart3 size={48} /></div>
              <h3 className="text-2xl font-semibold mb-3">Smart Reporting</h3>
              <p className="text-gray-600 mb-6">Real-time analytics and insights</p>
              <Link to="/demo/smart-reporting" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border hover:shadow-md transition-all">
              <div className="text-red-600 mb-6"><Sparkles size={48} /></div>
              <h3 className="text-2xl font-semibold mb-3">AI Recruitment Assistant</h3>
              <p className="text-gray-600 mb-6">Get instant help with sourcing, screening, and shortlisting</p>
              <Link to="/demo/ai-assistant" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border hover:shadow-md transition-all">
              <div className="text-red-600 mb-6"><Users size={48} /></div>
              <h3 className="text-2xl font-semibold mb-3">Candidate Portal</h3>
              <p className="text-gray-600 mb-6">Seamless candidate experience</p>
              <Link to="/demo/candidate-portal" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border hover:shadow-md transition-all">
              <div className="text-red-600 mb-6"><Building2 size={48} /></div>
              <h3 className="text-2xl font-semibold mb-3">Client Portal</h3>
              <p className="text-gray-600 mb-6">White-label portal for your clients</p>
              <Link to="/demo/client-portal" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border hover:shadow-md transition-all">
              <div className="text-red-600 mb-6"><Briefcase size={48} /></div>
              <h3 className="text-2xl font-semibold mb-3">CRM + Job Tracker</h3>
              <p className="text-gray-600 mb-6">Manage your entire pipeline</p>
              <Link to="/demo/job-tracker" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                Learn more <ArrowRight size={18} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== FOOTER WITH NAVIGATION LINKS ==================== */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            
            {/* Brand */}
            <div>
              <h2 className="text-2xl font-bold text-white">HireResQ AI</h2>
              <p className="mt-4 text-sm text-gray-400">
                AI-Powered Hiring. Done for You.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-white">Demo</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/security" className="hover:text-white">Security</Link></li>
                <li><Link to="/popia" className="hover:text-white">POPIA</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 my-10"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400">
              © {new Date().getFullYear()} HireResQ AI. All rights reserved.
            </p>

            <a
              href="https://wa.me/0834676026"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
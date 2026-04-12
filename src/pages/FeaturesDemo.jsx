// src/pages/FeaturesDemo.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Building2, Mail, Users, Video, BarChart3, Sparkles, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeaturesDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">All Features</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our complete AI-powered recruitment suite
          </p>
        </div>

        {/* Features Grid - Same style as homepage */}
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
            <p className="text-gray-600 mb-6">Get instant help with sourcing and shortlisting</p>
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
    </div>
  );
}
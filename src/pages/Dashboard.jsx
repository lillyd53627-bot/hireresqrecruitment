// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Users, Building2, UserCheck, TrendingUp,
  Clock, Circle, ClipboardPaste, ChevronRight, Star,
  DollarSign, MapPin, Mail, Phone, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';
import { useNavigate } from 'react-router-dom';

const formatRelative = (iso) => {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(iso).toLocaleDateString('en-ZA');
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return 'R0';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(num)) return 'R0';
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(num);
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Live load from localStorage + listen for changes
  useEffect(() => {
    const loadData = () => {
      try {
        const savedClients = localStorage.getItem('crm_clients');
        const savedJobs = localStorage.getItem('crm_jobs');
        setClients(savedClients ? JSON.parse(savedClients) : []);
        setJobs(savedJobs ? JSON.parse(savedJobs) : []);
        setLastUpdated(new Date());
      } catch {
        setClients([]);
        setJobs([]);
      }
    };

    loadData();

    // Refresh when storage changes (other tabs / pages)
    const onStorage = (e) => {
      if (e.key === 'crm_clients' || e.key === 'crm_jobs') loadData();
    };
    window.addEventListener('storage', onStorage);

    // Also poll every 3 seconds so same-tab updates appear live
    const interval = setInterval(loadData, 3000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  // ── Live Stats ──────────────────────────────
  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === 'active').length;

    const totalJobs = jobs.length;
    const openJobs = jobs.filter((j) => j.status === 'open').length;
    const pastedJobs = jobs.filter((j) => j.isPasted).length;

    const allApps = jobs.flatMap((j) => j.applications || []);
    const totalApplicants = allApps.length;
    const shortlisted = allApps.filter((a) => a.status === 'shortlisted').length;
    const interviewed = allApps.filter((a) => a.status === 'interview').length;
    const hired = allApps.filter((a) => a.status === 'hired').length;
    const offers = allApps.filter((a) => a.status === 'offer').length;

    // Simple revenue sum from clients (if they have revenue field)
    let totalRevenue = 0;
    clients.forEach((c) => {
      if (c.revenue) {
        const n = parseFloat(String(c.revenue).replace(/[^\d.-]/g, ''));
        if (!isNaN(n)) totalRevenue += n;
      }
    });

    return {
      totalClients,
      activeClients,
      totalJobs,
      openJobs,
      pastedJobs,
      totalApplicants,
      shortlisted,
      interviewed,
      hired,
      offers,
      totalRevenue,
    };
  }, [clients, jobs]);

  // Recent jobs (latest 5)
  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0))
      .slice(0, 5);
  }, [jobs]);

  // Recent applicants across all jobs
  const recentApplicants = useMemo(() => {
    const all = jobs.flatMap((j) =>
      (j.applications || []).map((a) => ({ ...a, jobTitle: j.title, jobId: j.id, isPasted: j.isPasted }))
    );
    return all
      .sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0))
      .slice(0, 6);
  }, [jobs]);

  // Pipeline summary
  const pipeline = useMemo(() => {
    const all = jobs.flatMap((j) => j.applications || []);
    return {
      shortlisted: all.filter((a) => a.status === 'shortlisted').length,
      applied: all.filter((a) => a.status === 'applied').length,
      screening: all.filter((a) => a.status === 'screening').length,
      interview: all.filter((a) => a.status === 'interview').length,
      offer: all.filter((a) => a.status === 'offer').length,
      hired: all.filter((a) => a.status === 'hired').length,
      rejected: all.filter((a) => a.status === 'rejected').length,
    };
  }, [jobs]);

  const getStatusColor = (status) => {
    const map = {
      shortlisted: 'bg-teal-100 text-teal-700',
      applied: 'bg-blue-100 text-blue-700',
      screening: 'bg-purple-100 text-purple-700',
      interview: 'bg-yellow-100 text-yellow-700',
      offer: 'bg-orange-100 text-orange-700',
      hired: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      open: 'bg-green-100 text-green-700',
      on_hold: 'bg-yellow-100 text-yellow-700',
      filled: 'bg-blue-100 text-blue-700',
      closed: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar
          title="Dashboard"
          subtitle={`Live overview · Updated ${lastUpdated.toLocaleTimeString('en-ZA')}`}
        />

        <div className="p-8 space-y-8">
          {/* Live Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Clients', value: stats.activeClients, sub: `${stats.totalClients} total`, icon: Building2, color: 'bg-blue-50 text-blue-600' },
              { label: 'Open Jobs', value: stats.openJobs, sub: `${stats.pastedJobs} pasted`, icon: Briefcase, color: 'bg-green-50 text-green-600' },
              { label: 'Applicants', value: stats.totalApplicants, sub: `${stats.shortlisted} shortlisted`, icon: Users, color: 'bg-purple-50 text-purple-600' },
              { label: 'Hired', value: stats.hired, sub: `${stats.offers} offers`, icon: UserCheck, color: 'bg-red-50 text-red-600' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                      <p className="text-xs text-gray-400">{stat.sub}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Second row – Revenue + Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-600" /> Client Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">Tracked across {stats.totalClients} clients</p>
              </CardContent>
            </Card>

            {/* Live Pipeline */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Live Applicant Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                  {[
                    { key: 'shortlisted', label: 'Shortlisted', color: 'text-teal-600' },
                    { key: 'applied', label: 'Applied', color: 'text-blue-600' },
                    { key: 'screening', label: 'Screening', color: 'text-purple-600' },
                    { key: 'interview', label: 'Interview', color: 'text-yellow-600' },
                    { key: 'offer', label: 'Offer', color: 'text-orange-600' },
                    { key: 'hired', label: 'Hired', color: 'text-green-600' },
                    { key: 'rejected', label: 'Rejected', color: 'text-red-600' },
                  ].map((s) => (
                    <div key={s.key} className="text-center bg-gray-50 rounded-lg p-3">
                      <p className={`text-xl font-bold ${s.color}`}>{pipeline[s.key]}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs + Recent Applicants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Recent Jobs</CardTitle>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => navigate('/dashboard/jobs')}>
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentJobs.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No jobs yet. Add or paste a job post.</p>
                )}
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => navigate('/dashboard/jobs')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${job.isPasted ? 'bg-red-100' : 'bg-red-50'}`}>
                        {job.isPasted ? <ClipboardPaste className="w-5 h-5 text-red-600" /> : <Briefcase className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{job.title}</p>
                        <p className="text-xs text-gray-500 truncate">{job.clientName} · {job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {job.isPasted && <Badge className="bg-red-600 text-white text-xs font-bold">PASTED</Badge>}
                      <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      <span className="text-xs text-gray-400">{(job.applications || []).length} apps</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Applicants */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Recent Applicants</CardTitle>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => navigate('/dashboard/jobs')}>
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentApplicants.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No applicants yet. Add candidates from Job Listings.</p>
                )}
                {recentApplicants.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{app.name}</p>
                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                        {app.profileText && <Badge variant="outline" className="text-teal-700 border-teal-300 text-xs">Profile</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{app.jobTitle}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatRelative(app.appliedAt)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  className="h-auto py-4 flex-col gap-2 bg-red-600 hover:bg-red-700"
                  onClick={() => navigate('/dashboard/jobs')}
                >
                  <ClipboardPaste className="w-5 h-5" />
                  <span className="text-sm">Paste Job Post</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => navigate('/dashboard/jobs')}
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="text-sm">Add Applicant</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/dashboard/clients')}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm">Clients CRM</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/dashboard/aiclientfinder')}
                >
                  <Star className="w-5 h-5" />
                  <span className="text-sm">AI Lead Finder</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live data · refreshes every 3 seconds · last update {lastUpdated.toLocaleTimeString('en-ZA')}
          </div>
        </div>
      </main>
    </div>
  );
}
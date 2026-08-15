// src/pages/Dashboard/JobTracker.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Briefcase, Building2, MapPin, Users,
  MoreVertical, ChevronRight, Edit2, Trash2, ArrowLeft,
  Clock, Circle, DollarSign, UserCheck, UserPlus, Mail, Phone,
  FileText, Upload, ClipboardPaste, Link2, File, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';

const APPLICATION_STATUSES = [
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-teal-100 text-teal-700' },
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  { value: 'screening', label: 'Screening', color: 'bg-purple-100 text-purple-700' },
  { value: 'interview', label: 'Interview', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'offer', label: 'Offer', color: 'bg-orange-100 text-orange-700' },
  { value: 'hired', label: 'Hired', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

const JOB_STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-green-100 text-green-700' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'filled', label: 'Filled', color: 'bg-blue-100 text-blue-700' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-700' },
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];
const LOCATIONS = ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Remote', 'Other'];
const SOURCES = ['LinkedIn', 'Website', 'Referral', 'Job Board', 'Agency', 'Pasted Job', 'Other'];

const SEED_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    clientName: 'TechCorp SA',
    location: 'Cape Town',
    type: 'Full-time',
    workMode: 'Hybrid',
    status: 'open',
    salary: 'R65,000 - R85,000',
    postedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    description: 'We are looking for an experienced Frontend Developer to join our growing engineering team.',
    requirements: '5+ years React\nStrong TypeScript\nTailwind CSS',
    isPasted: false,
    applications: [
      {
        id: 101,
        name: 'Thabo Molefe',
        email: 'thabo.molefe@email.com',
        phone: '+27 82 111 2233',
        status: 'shortlisted',
        source: 'LinkedIn',
        appliedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        notes: 'Strong portfolio.',
        profileText: 'Thabo Molefe\nSenior Frontend Developer\n\n8 years experience\n- React, TypeScript, Next.js\n- Led UI team of 5\n- Built fintech dashboards',
        cvFileName: null,
        cvData: null,
        linkedToPastedJob: false,
      },
    ],
  },
  {
    id: 2,
    title: 'Financial Analyst',
    clientName: 'FinanceHub',
    location: 'Johannesburg',
    type: 'Full-time',
    workMode: 'On-site',
    status: 'open',
    salary: 'R45,000 - R60,000',
    postedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    description: 'Join our finance team.',
    requirements: '3+ years financial analysis\nExcel & Power BI',
    isPasted: false,
    applications: [],
  },
];

const formatRelative = (iso) => {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(iso).toLocaleDateString('en-ZA');
};

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

const getStatusBadge = (status, list = JOB_STATUSES) => {
  const found = list.find((s) => s.value === status);
  return found || { label: status, color: 'bg-gray-100 text-gray-700' };
};

function parseJobPost(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let title = lines[0] || 'Untitled Job';
  let description = text;
  let requirements = '';
  let location = 'Johannesburg';
  let clientName = '';

  const titleMatch = text.match(/(?:job title|position|role)\s*[:\-–]\s*(.+)/i);
  if (titleMatch) title = titleMatch[1].trim();

  const locMatch = text.match(/(?:location|based in|city)\s*[:\-–]\s*(.+)/i);
  if (locMatch) location = locMatch[1].trim().split(/[,\n]/)[0];

  const clientMatch = text.match(/(?:company|employer|client)\s*[:\-–]\s*(.+)/i);
  if (clientMatch) clientName = clientMatch[1].trim().split(/[,\n]/)[0];

  const reqMatch = text.match(/(?:requirements|qualifications|must have|skills)[:\s]*([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i);
  if (reqMatch) requirements = reqMatch[1].trim();

  return {
    title: title.slice(0, 120),
    clientName: clientName || 'Pasted Company',
    location,
    type: 'Full-time',
    workMode: 'Hybrid',
    status: 'open',
    salary: '',
    description,
    requirements,
    isPasted: true,
  };
}

export default function JobTracker() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_jobs');
      return saved ? JSON.parse(saved) : SEED_JOBS;
    } catch {
      return SEED_JOBS;
    }
  });

  useEffect(() => {
    localStorage.setItem('crm_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const emptyJobForm = {
    title: '', clientName: '', location: 'Cape Town', type: 'Full-time',
    workMode: 'Hybrid', status: 'open', salary: '', description: '', requirements: '', isPasted: false,
  };
  const [jobForm, setJobForm] = useState(emptyJobForm);

  const [isAppOpen, setIsAppOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const emptyAppForm = {
    name: '', email: '', phone: '', status: 'shortlisted', source: 'LinkedIn',
    notes: '', profileText: '', cvFileName: null, cvData: null, linkedToPastedJob: false,
  };
  const [appForm, setAppForm] = useState(emptyAppForm);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || j.title.toLowerCase().includes(q) || j.clientName.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
      const matchesType = typeFilter === 'all' || j.type === typeFilter;
      const matchesLocation = locationFilter === 'all' || j.location === locationFilter;
      return matchesSearch && matchesStatus && matchesType && matchesLocation;
    });
  }, [jobs, search, statusFilter, typeFilter, locationFilter]);

  const stats = useMemo(() => ({
    total: jobs.length,
    open: jobs.filter((j) => j.status === 'open').length,
    applicants: jobs.reduce((s, j) => s + (j.applications?.length || 0), 0),
    hired: jobs.reduce((s, j) => s + (j.applications?.filter((a) => a.status === 'hired').length || 0), 0),
    pasted: jobs.filter((j) => j.isPasted).length,
  }), [jobs]);

  const getAppCounts = (job) => {
    const apps = job.applications || [];
    return {
      total: apps.length,
      shortlisted: apps.filter((a) => a.status === 'shortlisted').length,
      interview: apps.filter((a) => a.status === 'interview').length,
      offer: apps.filter((a) => a.status === 'offer').length,
      hired: apps.filter((a) => a.status === 'hired').length,
      matched: apps.filter((a) => a.linkedToPastedJob).length,
    };
  };

  const openAddJob = () => { setJobForm(emptyJobForm); setIsAddOpen(true); };
  const openEditJob = (job) => {
    setEditingJob(job);
    setJobForm({ ...job, salary: job.salary || '', description: job.description || '', requirements: job.requirements || '' });
    setIsEditOpen(true);
  };

  const saveJob = () => {
    if (!jobForm.title.trim() || !jobForm.clientName.trim()) return;
    if (isEditOpen && editingJob) {
      setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? { ...j, ...jobForm } : j)));
      if (selectedJob?.id === editingJob.id) setSelectedJob((prev) => ({ ...prev, ...jobForm }));
      setIsEditOpen(false);
    } else {
      setJobs((prev) => [{ id: generateId(), ...jobForm, applications: [], postedAt: new Date().toISOString() }, ...prev]);
      setIsAddOpen(false);
    }
    setJobForm(emptyJobForm);
  };

  const handlePasteJob = () => {
    if (!pasteText.trim()) return;
    const parsed = parseJobPost(pasteText);
    const newJob = { id: generateId(), ...parsed, applications: [], postedAt: new Date().toISOString() };
    setJobs((prev) => [newJob, ...prev]);
    setPasteText('');
    setIsPasteOpen(false);
    setSelectedJob(newJob);
    setDetailTab('applications');
  };

  const confirmDeleteJob = (job) => { setJobToDelete(job); setIsDeleteOpen(true); };
  const deleteJob = () => {
    if (!jobToDelete) return;
    setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
    if (selectedJob?.id === jobToDelete.id) setSelectedJob(null);
    setIsDeleteOpen(false);
    setJobToDelete(null);
  };

  const updateJobStatus = (jobId, newStatus) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    if (selectedJob?.id === jobId) setSelectedJob((prev) => ({ ...prev, status: newStatus }));
  };

  const openAddApp = (linkToPasted = false) => {
    setEditingApp(null);
    setAppForm({
      ...emptyAppForm,
      linkedToPastedJob: linkToPasted || Boolean(selectedJob?.isPasted),
      source: selectedJob?.isPasted ? 'Pasted Job' : 'LinkedIn',
    });
    setIsAppOpen(true);
  };

  const openEditApp = (app) => {
    setEditingApp(app);
    setAppForm({
      ...app,
      phone: app.phone || '',
      notes: app.notes || '',
      profileText: app.profileText || '',
      cvFileName: app.cvFileName || null,
      cvData: app.cvData || null,
      linkedToPastedJob: app.linkedToPastedJob || false,
    });
    setIsAppOpen(true);
  };

  const handleCvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('CV must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setAppForm((prev) => ({ ...prev, cvFileName: file.name, cvData: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveApplication = () => {
    if (!appForm.name.trim() || !selectedJob) return;
    setJobs((prev) => prev.map((j) => {
      if (j.id !== selectedJob.id) return j;
      let applications;
      if (editingApp) {
        applications = (j.applications || []).map((a) => a.id === editingApp.id ? { ...a, ...appForm } : a);
      } else {
        applications = [{ id: generateId(), ...appForm, appliedAt: new Date().toISOString() }, ...(j.applications || [])];
      }
      const updated = { ...j, applications };
      setSelectedJob(updated);
      return updated;
    }));
    setIsAppOpen(false);
    setEditingApp(null);
    setAppForm(emptyAppForm);
  };

  const updateAppStatus = (appId, newStatus) => {
    setJobs((prev) => prev.map((j) => {
      if (j.id !== selectedJob.id) return j;
      const applications = (j.applications || []).map((a) => a.id === appId ? { ...a, status: newStatus } : a);
      const updated = { ...j, applications };
      setSelectedJob(updated);
      return updated;
    }));
  };

  const deleteApplication = (appId) => {
    setJobs((prev) => prev.map((j) => {
      if (j.id !== selectedJob.id) return j;
      const applications = (j.applications || []).filter((a) => a.id !== appId);
      const updated = { ...j, applications };
      setSelectedJob(updated);
      if (selectedApplicant?.id === appId) setSelectedApplicant(null);
      return updated;
    }));
  };

  const toggleLinkToPasted = (appId) => {
    setJobs((prev) => prev.map((j) => {
      if (j.id !== selectedJob.id) return j;
      const applications = (j.applications || []).map((a) => a.id === appId ? { ...a, linkedToPastedJob: !a.linkedToPastedJob } : a);
      const updated = { ...j, applications };
      setSelectedJob(updated);
      return updated;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar title="Job Listings" subtitle="Manage open roles, pasted jobs and matching applicants" />
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Jobs', value: stats.total, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
              { label: 'Open Positions', value: stats.open, icon: Circle, color: 'bg-green-50 text-green-600' },
              { label: 'Pasted Jobs', value: stats.pasted, icon: ClipboardPaste, color: 'bg-red-50 text-red-600' },
              { label: 'Total Applicants', value: stats.applicants, icon: Users, color: 'bg-purple-50 text-purple-600' },
              { label: 'Hired', value: stats.hired, icon: UserCheck, color: 'bg-orange-50 text-orange-600' },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedJob(null); setSelectedApplicant(null); }}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                        <Badge className={getStatusBadge(selectedJob.status).color}>{getStatusBadge(selectedJob.status).label}</Badge>
                        {selectedJob.isPasted && (
                          <Badge className="bg-red-600 text-white font-bold px-3 py-1 text-sm">PASTED JOB</Badge>
                        )}
                      </div>
                      <p className="text-gray-500">{selectedJob.clientName} · {selectedJob.location} · {selectedJob.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openEditJob(selectedJob)}><Edit2 className="w-4 h-4 mr-1" /> Edit</Button>
                    <Button variant="outline" className="text-red-600" onClick={() => confirmDeleteJob(selectedJob)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                  </div>
                </div>

                <Tabs value={detailTab} onValueChange={setDetailTab}>
                  <TabsList className="bg-white border">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Overview</TabsTrigger>
                    <TabsTrigger value="applications" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                      {selectedJob.isPasted ? 'Matching Applicants' : 'Applicants'} ({selectedJob.applications?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="description" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Description</TabsTrigger>
                    <TabsTrigger value="status" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Status</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-0 shadow-sm md:col-span-2">
                        <CardHeader><CardTitle className="text-lg">Job Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                          <div><p className="text-gray-500">Client</p><p className="font-medium flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {selectedJob.clientName}</p></div>
                          <div><p className="text-gray-500">Location</p><p className="font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedJob.location}</p></div>
                          <div><p className="text-gray-500">Type</p><p className="font-medium">{selectedJob.type}</p></div>
                          <div><p className="text-gray-500">Work Mode</p><p className="font-medium">{selectedJob.workMode}</p></div>
                          <div><p className="text-gray-500">Salary</p><p className="font-medium">{selectedJob.salary || '—'}</p></div>
                          <div><p className="text-gray-500">Posted</p><p className="font-medium">{formatRelative(selectedJob.postedAt)}</p></div>
                          {selectedJob.isPasted && (
                            <div className="col-span-2"><p className="text-gray-500">Source</p><p className="font-bold text-red-600">Pasted Job Post</p></div>
                          )}
                        </CardContent>
                      </Card>
                      <Card className="border-0 shadow-sm">
                        <CardHeader><CardTitle className="text-lg">Pipeline</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          {(() => {
                            const c = getAppCounts(selectedJob);
                            return (
                              <>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Total</span><span className="font-bold">{c.total}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-teal-600 font-medium">Shortlisted</span><span className="font-bold text-teal-600">{c.shortlisted}</span></div>
                                {selectedJob.isPasted && <div className="flex justify-between text-sm"><span className="text-red-600 font-medium">Matched</span><span className="font-bold text-red-600">{c.matched}</span></div>}
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Interview</span><span className="font-medium text-yellow-600">{c.interview}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Offer</span><span className="font-medium text-orange-600">{c.offer}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Hired</span><span className="font-medium text-green-600">{c.hired}</span></div>
                              </>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="applications" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedJob.isPasted ? 'Matching Applicants' : 'Applicants'}</h3>
                        {selectedJob.isPasted && <p className="text-sm text-red-600 font-medium mt-0.5">Linked to this pasted job post</p>}
                      </div>
                      <Button className="bg-red-600 hover:bg-red-700 gap-2" onClick={() => openAddApp(true)}>
                        <UserPlus className="w-4 h-4" /> {selectedJob.isPasted ? 'Add Matching Applicant' : 'Add Applicant'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                      {APPLICATION_STATUSES.map((s) => {
                        const count = (selectedJob.applications || []).filter((a) => a.status === s.value).length;
                        return (
                          <div key={s.value} className="bg-white rounded-lg border p-3 text-center">
                            <p className="text-xl font-bold">{count}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-3">
                        {(selectedJob.applications || []).length === 0 && (
                          <Card className="border-0 shadow-sm">
                            <CardContent className="p-10 text-center text-gray-400">
                              No applicants yet. Click “Add Matching Applicant” and paste their full work profile.
                            </CardContent>
                          </Card>
                        )}
                        {(selectedJob.applications || []).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).map((app) => (
                          <Card
                            key={app.id}
                            className={`border-0 shadow-sm cursor-pointer transition-all ${selectedApplicant?.id === app.id ? 'ring-2 ring-red-500' : 'hover:shadow-md'} ${app.linkedToPastedJob ? 'border-l-4 border-l-red-600' : ''}`}
                            onClick={() => setSelectedApplicant(app)}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <h4 className="font-semibold text-lg">{app.name}</h4>
                                    <Badge className={getStatusBadge(app.status, APPLICATION_STATUSES).color}>
                                      {getStatusBadge(app.status, APPLICATION_STATUSES).label}
                                    </Badge>
                                    {app.linkedToPastedJob && (
                                      <Badge className="bg-red-100 text-red-700 font-bold flex items-center gap-1">
                                        <Link2 className="w-3 h-3" /> Matched
                                      </Badge>
                                    )}
                                    {app.profileText && <Badge variant="outline" className="text-teal-700 border-teal-300">Profile</Badge>}
                                    {app.cvFileName && <Badge variant="outline" className="flex items-center gap-1"><File className="w-3 h-3" /> CV</Badge>}
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {app.email || '—'}</span>
                                    {app.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {app.phone}</span>}
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatRelative(app.appliedAt)}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Select value={app.status} onValueChange={(v) => updateAppStatus(app.id, v)}>
                                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {APPLICATION_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="outline" onClick={() => openEditApp(app)}><Edit2 className="w-3.5 h-3.5" /></Button>
                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteApplication(app.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Full Applicant Profile Panel */}
                      <div>
                        {selectedApplicant ? (
                          <Card className="border-0 shadow-sm sticky top-6">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">Applicant Profile</CardTitle>
                                <Button size="sm" variant="ghost" onClick={() => setSelectedApplicant(null)}><X className="w-4 h-4" /></Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                              <div>
                                <p className="text-2xl font-bold">{selectedApplicant.name}</p>
                                <Badge className={getStatusBadge(selectedApplicant.status, APPLICATION_STATUSES).color + ' mt-1'}>
                                  {getStatusBadge(selectedApplicant.status, APPLICATION_STATUSES).label}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span>{selectedApplicant.email || '—'}</span></div>
                                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span>{selectedApplicant.phone || '—'}</span></div>
                                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span>Added {formatRelative(selectedApplicant.appliedAt)}</span></div>
                                <div><p className="text-gray-500 text-xs">Source</p><p className="font-medium">{selectedApplicant.source}</p></div>
                              </div>

                              {selectedApplicant.linkedToPastedJob && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <p className="font-bold text-red-700 flex items-center gap-1"><Link2 className="w-4 h-4" /> Clearly linked to pasted job</p>
                                  <p className="text-xs text-red-600 mt-1">{selectedJob.title}</p>
                                </div>
                              )}

                              {/* Pasted Work Profile */}
                              {selectedApplicant.profileText && (
                                <div>
                                  <p className="text-xs mb-1 font-semibold text-red-700">Work Profile (Pasted)</p>
                                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 max-h-64 overflow-y-auto">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                                      {selectedApplicant.profileText}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {selectedApplicant.notes && (
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Internal Notes</p>
                                  <p className="bg-gray-50 rounded-lg p-3">{selectedApplicant.notes}</p>
                                </div>
                              )}

                              <div>
                                <p className="text-gray-500 text-xs mb-2">Curriculum Vitae</p>
                                {selectedApplicant.cvFileName ? (
                                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-5 h-5 text-red-600" />
                                      <span className="font-medium truncate max-w-[140px]">{selectedApplicant.cvFileName}</span>
                                    </div>
                                    {selectedApplicant.cvData && (
                                      <a href={selectedApplicant.cvData} download={selectedApplicant.cvFileName} className="text-red-600 text-xs font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                                        Download
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-400 text-sm">No CV uploaded — profile used instead</p>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={() => openEditApp(selectedApplicant)}>
                                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Profile
                                </Button>
                                {selectedJob.isPasted && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={selectedApplicant.linkedToPastedJob ? 'text-red-600' : ''}
                                    onClick={() => toggleLinkToPasted(selectedApplicant.id)}
                                  >
                                    <Link2 className="w-3.5 h-3.5 mr-1" />
                                    {selectedApplicant.linkedToPastedJob ? 'Unlink from Pasted Job' : 'Link to Pasted Job'}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="border-0 shadow-sm">
                            <CardContent className="p-8 text-center text-gray-400">
                              <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                              <p>Select an applicant to view full profile & pasted work history</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="description" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {selectedJob.isPasted ? <span className="text-red-600 font-bold">Pasted Job Description</span> : 'Job Description'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJob.description || 'No description provided.'}</p>
                        </CardContent>
                      </Card>
                      <Card className="border-0 shadow-sm">
                        <CardHeader><CardTitle className="text-lg">Requirements</CardTitle></CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJob.requirements || 'No requirements listed.'}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="status" className="mt-6">
                    <Card className="border-0 shadow-sm">
                      <CardHeader><CardTitle className="text-lg">Update Job Status</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          {JOB_STATUSES.map((s) => (
                            <Button
                              key={s.value}
                              variant={selectedJob.status === s.value ? 'default' : 'outline'}
                              className={selectedJob.status === s.value ? 'bg-red-600 hover:bg-red-700' : ''}
                              onClick={() => updateJobStatus(selectedJob.id, s.value)}
                            >
                              {s.label}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-64 bg-white border-gray-200" />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-36 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {JOB_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-36 bg-white"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-36 bg-white"><SelectValue placeholder="Location" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 border-red-300 text-red-700 hover:bg-red-50" onClick={() => setIsPasteOpen(true)}>
                      <ClipboardPaste className="w-4 h-4" /> Paste Job Post
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={openAddJob}>
                      <Plus className="w-4 h-4" /> Add Job
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredJobs.length === 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-12 text-center text-gray-400">No jobs found. Try adjusting filters, add a job, or paste a job post.</CardContent>
                    </Card>
                  )}
                  {filteredJobs.map((job, i) => {
                    const appCount = job.applications?.length || 0;
                    const hiredCount = job.applications?.filter((a) => a.status === 'hired').length || 0;
                    const matchedCount = job.applications?.filter((a) => a.linkedToPastedJob).length || 0;
                    return (
                      <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Card className={`border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer ${job.isPasted ? 'border-l-4 border-l-red-600' : ''}`}>
                          <CardContent className="p-6" onClick={() => setSelectedJob(job)}>
                            <div className="flex items-start gap-6">
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${job.isPasted ? 'bg-red-100' : 'bg-red-50'}`}>
                                {job.isPasted ? <ClipboardPaste className="w-7 h-7 text-red-600" /> : <Briefcase className="w-7 h-7 text-red-600" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className={`text-xl font-bold ${job.isPasted ? 'text-red-700' : ''}`}>{job.title}</h3>
                                  <Badge className={getStatusBadge(job.status).color}>{getStatusBadge(job.status).label}</Badge>
                                  {job.isPasted && <Badge className="bg-red-600 text-white font-bold">PASTED JOB</Badge>}
                                </div>
                                <p className="text-gray-500 mt-1 flex items-center gap-2"><Building2 className="w-4 h-4" />{job.clientName}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                                  <span>{job.type}</span>
                                  <span>{job.workMode}</span>
                                  {job.salary && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary}</span>}
                                </div>
                                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-purple-600">{appCount}</p>
                                    <p className="text-xs text-gray-500">Applicants</p>
                                  </div>
                                  {job.isPasted ? (
                                    <div className="bg-red-50 rounded-lg p-3 text-center">
                                      <p className="text-2xl font-bold text-red-600">{matchedCount}</p>
                                      <p className="text-xs text-red-600 font-medium">Matched</p>
                                    </div>
                                  ) : (
                                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                                      <p className="text-2xl font-bold text-green-600">{hiredCount}</p>
                                      <p className="text-xs text-gray-500">Hired</p>
                                    </div>
                                  )}
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-sm font-medium text-gray-600">{formatRelative(job.postedAt)}</p>
                                    <p className="text-xs text-gray-500">Posted</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-sm font-medium text-gray-600">{job.workMode}</p>
                                    <p className="text-xs text-gray-500">Work Mode</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1" onClick={() => setSelectedJob(job)}>
                                  View <ChevronRight className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline"><MoreVertical className="w-4 h-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedJob(job)}>View Details</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEditJob(job)}>Edit Job</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => confirmDeleteJob(job)}>Delete Job</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Paste Job Post Dialog */}
      <Dialog open={isPasteOpen} onOpenChange={setIsPasteOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <ClipboardPaste className="w-5 h-5" /> Paste Job Post
            </DialogTitle>
            <DialogDescription>
              Paste the full job advert. It will be marked with a <strong className="text-red-600">bold red PASTED JOB</strong> label.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste the full job post here..."
              className="min-h-[280px] font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsPasteOpen(false); setPasteText(''); }}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 font-bold" onClick={handlePasteJob} disabled={!pasteText.trim()}>
              Create Pasted Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Job Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Job' : 'Add New Job'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Job Title *</Label>
              <Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Senior Frontend Developer" />
            </div>
            <div className="grid gap-2">
              <Label>Client / Company *</Label>
              <Input value={jobForm.clientName} onChange={(e) => setJobForm({ ...jobForm, clientName: e.target.value })} placeholder="Company name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Location</Label>
                <Select value={jobForm.location} onValueChange={(v) => setJobForm({ ...jobForm, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Employment Type</Label>
                <Select value={jobForm.type} onValueChange={(v) => setJobForm({ ...jobForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Work Mode</Label>
                <Select value={jobForm.workMode} onValueChange={(v) => setJobForm({ ...jobForm, workMode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{WORK_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={jobForm.status} onValueChange={(v) => setJobForm({ ...jobForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{JOB_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Salary Range</Label>
              <Input value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} placeholder="e.g. R45,000 - R60,000" />
            </div>
            <div className="grid gap-2">
              <Label>Job Description</Label>
              <Textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} className="min-h-[80px]" />
            </div>
            <div className="grid gap-2">
              <Label>Requirements</Label>
              <Textarea value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} className="min-h-[80px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={saveJob}>{isEditOpen ? 'Save Changes' : 'Add Job'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Applicant – with Paste Work Profile */}
      <Dialog open={isAppOpen} onOpenChange={setIsAppOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingApp ? 'Edit Applicant' : selectedJob?.isPasted ? 'Add Matching Applicant' : 'Add Applicant'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Full Name *</Label>
              <Input value={appForm.name} onChange={(e) => setAppForm({ ...appForm, name: e.target.value })} placeholder="Candidate name" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={appForm.email} onChange={(e) => setAppForm({ ...appForm, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input value={appForm.phone} onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={appForm.status} onValueChange={(v) => setAppForm({ ...appForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Source</Label>
                <Select value={appForm.source} onValueChange={(v) => setAppForm({ ...appForm, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* MAIN FEATURE: Paste Full Work Profile */}
            <div className="grid gap-2">
              <Label className="font-semibold text-red-700">Paste Full Work Profile</Label>
              <p className="text-xs text-gray-500 -mt-1">
                This is the main way to add candidates. Paste the entire profile / experience here.
              </p>
              <Textarea
                value={appForm.profileText || ''}
                onChange={(e) => setAppForm({ ...appForm, profileText: e.target.value })}
                placeholder={`Paste the full work profile here...\n\nExample:\nThabo Molefe\nSenior Credit Controller\n\nExperience:\n- 8 years at ABC Properties\n- Managed 450+ tenant portfolio\n- Reduced arrears by 32%\n\nSkills: Pastel, Sage, Excel, Debt Collection`}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            {/* Optional CV */}
            <div className="grid gap-2">
              <Label>CV / Resume (optional)</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                {appForm.cvFileName ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-5 h-5 text-red-600" />
                      <span className="font-medium truncate max-w-[180px]">{appForm.cvFileName}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setAppForm({ ...appForm, cvFileName: null, cvData: null })}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Optional – upload CV if available</p>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={appForm.notes}
                onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })}
                placeholder="Admin notes, match reasons, interview feedback..."
                className="min-h-[70px]"
              />
            </div>

            {selectedJob?.isPasted && (
              <div className="flex items-center gap-2 bg-red-50 rounded-lg p-3">
                <input
                  type="checkbox"
                  id="linkPasted"
                  checked={appForm.linkedToPastedJob}
                  onChange={(e) => setAppForm({ ...appForm, linkedToPastedJob: e.target.checked })}
                  className="rounded border-red-300"
                />
                <Label htmlFor="linkPasted" className="text-red-700 font-medium cursor-pointer">
                  Clearly link this applicant to the pasted job
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAppOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={saveApplication}>
              {editingApp ? 'Save Changes' : 'Add Applicant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete <strong>{jobToDelete?.title}</strong>? All associated applications will also be removed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={deleteJob}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
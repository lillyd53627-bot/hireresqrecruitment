// src/pages/Dashboard/LeadFinder.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Building2, Target, Zap, MapPin, Star,
  Mail, Phone, Globe, Users, ChevronRight, ArrowLeft,
  Copy, Check, MessageSquare, UserPlus, AlertTriangle,
  Briefcase, TrendingUp, Sparkles, Linkedin, ExternalLink,
  Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';
import { searchHiringCompanies, enrichCompany } from "@/services/enrichment";

const INDUSTRIES = ['All', 'Technology', 'Finance', 'Healthcare', 'Retail', 'Logistics', 'Manufacturing'];
const LOCATIONS = ['All', 'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Remote'];

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

export default function LeadFinder() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Existing clients (for duplicate detection)
  const [existingClients, setExistingClients] = useState([]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('crm_clients');
      if (saved) setExistingClients(JSON.parse(saved));
    } catch {
      setExistingClients([]);
    }
  }, []);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);

  // Message generation
  const [emailOpen, setEmailOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatedWhatsapp, setGeneratedWhatsapp] = useState('');
  const [copied, setCopied] = useState(false);
  const [addedToast, setAddedToast] = useState(null);

  // Initial load
  useEffect(() => {
    runSearch();
  }, []);

  // ── Search / Scan ──────────────────────────
  const runSearch = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const results = await searchHiringCompanies({
        query: search,
        location: locationFilter === 'All' ? '' : locationFilter,
        industry: industryFilter === 'All' ? '' : industryFilter,
      });
      setLeads(results);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch leads. Showing fallback data.');
    } finally {
      setIsScanning(false);
    }
  };

  // ── Enrich a single lead ───────────────────
  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);

    // If already enriched, no need to call API again
    if (lead.enriched) return;

    setIsEnriching(true);
    try {
      const enriched = await enrichCompany(lead);
      setSelectedLead(enriched);

      // Also update in the list
      setLeads((prev) =>
        prev.map((l) => (l.id === enriched.id ? enriched : l))
      );
    } catch (err) {
      console.error('Enrichment error:', err);
    } finally {
      setIsEnriching(false);
    }
  };

  // ── Duplicate check ────────────────────────
  const isDuplicate = (lead) => {
    if (!lead) return false;
    return existingClients.some(
      (c) =>
        c.name.toLowerCase() === lead.name.toLowerCase() ||
        (c.website &&
          lead.website &&
          c.website.toLowerCase().includes(lead.website.toLowerCase()))
    );
  };

  // ── Stats ──────────────────────────────────
  const stats = useMemo(() => {
    const total = leads.length;
    const highIntent = leads.filter((l) => (l.score || 0) >= 85).length;
    const newThisScan = leads.filter((l) => !isDuplicate(l)).length;
    const avgScore = leads.length
      ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length)
      : 0;
    return { total, highIntent, newThisScan, avgScore };
  }, [leads, existingClients]);

  // ── Filtered list ──────────────────────────
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.name?.toLowerCase().includes(q) ||
        l.industry?.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q);

      const matchesIndustry =
        industryFilter === 'All' || l.industry === industryFilter;
      const matchesLocation =
        locationFilter === 'All' || (l.location || '').includes(locationFilter);

      return matchesSearch && matchesIndustry && matchesLocation;
    });
  }, [leads, search, industryFilter, locationFilter]);

  // ── Add to CRM ─────────────────────────────
  const addToCRM = (lead) => {
    if (isDuplicate(lead)) return;

    const primaryManager = lead.hiringManagers?.[0];

    const newClient = {
      id: generateId(),
      name: lead.name,
      industry: lead.industry || 'Unknown',
      location: lead.location || '',
      contact: primaryManager?.name || '',
      email: primaryManager?.email || lead.companyEmails?.[0] || '',
      phone: '',
      website: lead.website || '',
      status: 'pending',
      activeJobs: lead.openRoles || 0,
      totalHires: 0,
      revenue: 0,
      lastContact: new Date().toISOString(),
      notes: [
        {
          id: generateId(),
          text: `Added from AI Lead Finder. Score: ${lead.score}%. Hiring signal: ${lead.hiringSignal || 'N/A'}. Open roles: ${lead.openRoles || 0}. Source: ${lead.source || 'AI'}`,
          createdAt: new Date().toISOString(),
          author: 'AI Lead Finder',
        },
      ],
      timeline: [
        {
          id: generateId(),
          type: 'status_change',
          description: `Lead converted from AI Lead Finder (Score ${lead.score}%)`,
          date: new Date().toISOString(),
        },
      ],
      reminders: [],
      contacts: (lead.hiringManagers || []).map((m) => ({
        id: generateId(),
        name: m.name,
        email: m.email || '',
        phone: '',
        role: m.title || '',
      })),
    };

    const updated = [newClient, ...existingClients];
    localStorage.setItem('crm_clients', JSON.stringify(updated));
    setExistingClients(updated);

    setAddedToast(lead.name);
    setTimeout(() => setAddedToast(null), 3000);
  };

  // ── Message generators ─────────────────────
  const generateEmail = (lead) => {
    const manager = lead.hiringManagers?.[0];
    const role = lead.recentJobs?.[0] || 'key roles';

    const email = `Subject: Supporting ${lead.name}'s growth – ${role} talent

Hi ${manager?.name?.split(' ')[0] || 'there'},

I noticed ${lead.name} is currently hiring for ${lead.openRoles || 'several'} roles, including ${role}.

I specialise in connecting high-growth ${lead.industry?.toLowerCase() || ''} companies in ${lead.location || 'South Africa'} with pre-vetted talent. We've recently helped similar companies fill senior positions in under 3 weeks.

Would you be open to a quick 15-minute call this week to explore how we could support your current hiring goals?

Looking forward to hearing from you.

Best regards,
[Your Name]
HireResQ
[Your Phone] | [Your Email]`;

    setGeneratedEmail(email);
    setEmailOpen(true);
  };

  const generateWhatsApp = (lead) => {
    const manager = lead.hiringManagers?.[0];
    const firstName = manager?.name?.split(' ')[0] || 'there';

    const message = `Hi ${firstName} 👋

I came across ${lead.name} and saw you're hiring for several roles right now (including ${lead.recentJobs?.[0] || 'key positions'}).

I help ${lead.industry?.toLowerCase() || ''} companies in ${lead.location || 'South Africa'} find strong talent quickly.

Would you be open to a short chat this week?

Happy to share how we've helped similar teams.

Thanks!
[Your Name] – HireResQ`;

    setGeneratedWhatsapp(message);
    setWhatsappOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar
          title="AI Lead Finder"
          subtitle="Discover companies currently hiring and push them straight into your pipeline"
        />

        <div className="p-8">
          {/* Toast */}
          <AnimatePresence>
            {addedToast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span><strong>{addedToast}</strong> added to CRM</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Leads Found', value: stats.total, icon: Target, color: 'bg-purple-50 text-purple-600' },
              { label: 'High Intent (85+)', value: stats.highIntent, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
              { label: 'New to CRM', value: stats.newThisScan, icon: UserPlus, color: 'bg-blue-50 text-blue-600' },
              { label: 'Avg Lead Score', value: `${stats.avgScore}%`, icon: Star, color: 'bg-red-50 text-red-600' },
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
            {selectedLead ? (
              /* ── DETAIL VIEW ── */
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">{selectedLead.name}</h2>
                        <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" /> {selectedLead.score || '—'}%
                        </Badge>
                        {isDuplicate(selectedLead) && (
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Already in CRM
                          </Badge>
                        )}
                        {isEnriching && (
                          <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enriching...
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-500">
                        {selectedLead.industry} · {selectedLead.location} · {selectedLead.employees} employees
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" className="gap-2" onClick={() => generateEmail(selectedLead)}>
                      <Mail className="w-4 h-4" /> Generate Email
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => generateWhatsApp(selectedLead)}>
                      <MessageSquare className="w-4 h-4" /> WhatsApp
                    </Button>
                    {!isDuplicate(selectedLead) ? (
                      <Button className="bg-red-600 hover:bg-red-700 gap-2" onClick={() => addToCRM(selectedLead)}>
                        <UserPlus className="w-4 h-4" /> Add to CRM
                      </Button>
                    ) : (
                      <Button disabled variant="outline">Already in CRM</Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Company Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700">{selectedLead.description || 'No description available.'}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Website</p>
                            {selectedLead.website ? (
                              <a
                                href={`https://${selectedLead.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-red-600 flex items-center gap-1 hover:underline"
                              >
                                {selectedLead.website} <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <p className="font-medium">—</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500">Hiring Signal</p>
                            <p className="font-medium">{selectedLead.hiringSignal || '—'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Open Roles Detected</p>
                            <p className="font-medium">{selectedLead.openRoles || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Source</p>
                            <p className="font-medium">{selectedLead.source || 'AI'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedLead.recentJobs?.length > 0 && (
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">Recent Open Roles</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedLead.recentJobs.map((job) => (
                              <Badge key={job} variant="outline" className="text-sm py-1 px-3">
                                <Briefcase className="w-3.5 h-3.5 mr-1" /> {job}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-6">
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          Hiring Managers
                          {isEnriching && <Loader2 className="w-4 h-4 animate-spin text-red-600" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(selectedLead.hiringManagers || []).length === 0 && !isEnriching && (
                          <p className="text-sm text-gray-400">No hiring managers found yet.</p>
                        )}
                        {(selectedLead.hiringManagers || []).map((m, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-medium">{m.name}</p>
                            <p className="text-sm text-gray-500">{m.title}</p>
                            {m.email && (
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-red-600">{m.email}</span>
                              </div>
                            )}
                            {m.linkedin && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                                <Linkedin className="w-3.5 h-3.5" /> LinkedIn found
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Company Emails</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(selectedLead.companyEmails || []).length === 0 && !isEnriching && (
                          <p className="text-sm text-gray-400">No emails found yet.</p>
                        )}
                        {(selectedLead.companyEmails || []).map((email) => (
                          <div
                            key={email}
                            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                          >
                            <span>{email}</span>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(email)}>
                              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ── LIST VIEW ── */
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* AI Scan Banner */}
                <Card className="border-0 shadow-sm bg-gradient-to-r from-red-600 to-red-700 text-white mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Sparkles className="w-6 h-6" /> AI Company Discovery
                        </h3>
                        <p className="text-white/80 mt-1">
                          Powered by real enrichment APIs (Apollo + Hunter) with smart fallback
                        </p>
                      </div>
                      <Button
                        className="bg-white text-red-600 hover:bg-gray-100 gap-2"
                        onClick={runSearch}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" /> Run AI Scan
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Filters */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search companies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                        className="pl-10 w-64 bg-white border-gray-200"
                      />
                    </div>

                    <Select value={industryFilter} onValueChange={setIndustryFilter}>
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue placeholder="Industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((i) => (
                          <SelectItem key={i} value={i}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={runSearch} disabled={isScanning}>
                      <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  {isScanning && leads.length === 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
                        <p className="text-gray-500">Scanning for companies currently hiring...</p>
                      </CardContent>
                    </Card>
                  )}

                  {!isScanning && filteredLeads.length === 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-12 text-center text-gray-400">
                        No leads found. Try adjusting filters or run a new AI Scan.
                      </CardContent>
                    </Card>
                  )}

                  {filteredLeads.map((lead, i) => {
                    const duplicate = isDuplicate(lead);
                    return (
                      <motion.div
                        key={lead.id || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-6">
                              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Target className="w-7 h-7 text-red-600" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="text-xl font-bold">{lead.name}</h3>
                                      <Badge className="bg-green-100 text-green-700">
                                        {lead.hiringSignal || 'Medium'} Intent
                                      </Badge>
                                      {duplicate && (
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                          Already in CRM
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-gray-500 mt-1 line-clamp-2">
                                      {lead.description || 'No description available.'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                                      <span>{lead.industry}</span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" /> {lead.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" /> {lead.openRoles || 0} open roles
                                      </span>
                                      {lead.employees && (
                                        <span className="flex items-center gap-1">
                                          <Users className="w-4 h-4" /> {lead.employees}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right flex-shrink-0">
                                    <div className="flex items-center gap-1 text-2xl font-bold text-red-600">
                                      <Star className="w-6 h-6" />
                                      {lead.score || '—'}%
                                    </div>
                                    <p className="text-xs text-gray-500">Lead Score</p>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {(lead.hiringManagers || []).length} hiring manager
                                    {(lead.hiringManagers || []).length !== 1 ? 's' : ''} found
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {(lead.companyEmails || []).length} email
                                    {(lead.companyEmails || []).length !== 1 ? 's' : ''} found
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white gap-1"
                                  onClick={() => handleSelectLead(lead)}
                                >
                                  View <ChevronRight className="w-4 h-4" />
                                </Button>
                                {!duplicate && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1"
                                    onClick={() => addToCRM(lead)}
                                  >
                                    <UserPlus className="w-4 h-4" /> Add
                                  </Button>
                                )}
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

      {/* Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-red-600" /> Personalized Outreach Email
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={generatedEmail}
            onChange={(e) => setGeneratedEmail(e.target.value)}
            className="min-h-[320px] font-mono text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Close</Button>
            <Button className="bg-red-600 hover:bg-red-700 gap-2" onClick={() => copyToClipboard(generatedEmail)}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Dialog */}
      <Dialog open={whatsappOpen} onOpenChange={setWhatsappOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" /> WhatsApp Message
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={generatedWhatsapp}
            onChange={(e) => setGeneratedWhatsapp(e.target.value)}
            className="min-h-[200px] text-sm"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappOpen(false)}>Close</Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => copyToClipboard(generatedWhatsapp)}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
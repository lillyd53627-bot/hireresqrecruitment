// src/pages/Dashboard/Clients.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Building2, Briefcase,
  Mail, Phone, Globe, MoreVertical, Star,
  TrendingUp, DollarSign, ChevronRight,
  Target, Zap, MapPin, Edit2, Trash2,
  StickyNote, Bell, UserPlus, CheckCircle2, Circle,
  ArrowLeft, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

const SEED_CLIENTS = [
  {
    id: 1,
    name: 'TechCorp SA',
    industry: 'Technology',
    location: 'Cape Town',
    contact: 'John Smith',
    email: 'john@techcorp.co.za',
    phone: '+27 21 123 4567',
    website: 'techcorp.co.za',
    status: 'active',
    activeJobs: 5,
    totalHires: 12,
    revenue: 450000,
    lastContact: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: [
      { id: 1, text: 'Interested in expanding the engineering team in Q3.', createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), author: 'You' },
    ],
    timeline: [
      { id: 1, type: 'status_change', description: 'Client marked as Active', date: new Date(Date.now() - 30 * 86400000).toISOString() },
      { id: 2, type: 'call', description: 'Discovery call with John Smith', date: new Date(Date.now() - 10 * 86400000).toISOString() },
      { id: 3, type: 'note', description: 'Interested in expanding the engineering team in Q3.', date: new Date(Date.now() - 5 * 86400000).toISOString() },
    ],
    reminders: [
      { id: 1, title: 'Send proposal for 3 senior roles', dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), completed: false, priority: 'high' },
    ],
    contacts: [
      { id: 1, name: 'John Smith', email: 'john@techcorp.co.za', phone: '+27 21 123 4567', role: 'CTO' },
      { id: 2, name: 'Lisa Naidoo', email: 'lisa@techcorp.co.za', phone: '+27 21 123 4568', role: 'HR Manager' },
    ],
  },
  {
    id: 2,
    name: 'FinanceHub',
    industry: 'Finance',
    location: 'Johannesburg',
    contact: 'Sarah Johnson',
    email: 'sarah@financehub.co.za',
    phone: '+27 11 234 5678',
    website: 'financehub.co.za',
    status: 'active',
    activeJobs: 3,
    totalHires: 8,
    revenue: 280000,
    lastContact: new Date(Date.now() - 7 * 86400000).toISOString(),
    notes: [],
    timeline: [
      { id: 1, type: 'status_change', description: 'Client marked as Active', date: new Date(Date.now() - 45 * 86400000).toISOString() },
    ],
    reminders: [],
    contacts: [
      { id: 1, name: 'Sarah Johnson', email: 'sarah@financehub.co.za', phone: '+27 11 234 5678', role: 'Head of Talent' },
    ],
  },
  {
    id: 3,
    name: 'RetailMax',
    industry: 'Retail',
    location: 'Durban',
    contact: 'Michael Chen',
    email: 'michael@retailmax.co.za',
    phone: '+27 31 345 6789',
    website: 'retailmax.co.za',
    status: 'pending',
    activeJobs: 0,
    totalHires: 0,
    revenue: 0,
    lastContact: new Date(Date.now() - 3 * 86400000).toISOString(),
    notes: [],
    timeline: [
      { id: 1, type: 'status_change', description: 'Lead converted to Pending Client', date: new Date(Date.now() - 3 * 86400000).toISOString() },
    ],
    reminders: [
      { id: 1, title: 'Follow up on contract', dueDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10), completed: false, priority: 'medium' },
    ],
    contacts: [
      { id: 1, name: 'Michael Chen', email: 'michael@retailmax.co.za', phone: '+27 31 345 6789', role: 'Operations Director' },
    ],
  },
];

const SEED_LEADS = [
  {
    id: 1,
    name: 'InnovateCo',
    industry: 'Technology',
    location: 'Pretoria',
    website: 'innovateco.co.za',
    hiringSignal: 'High',
    openRoles: 8,
    source: 'LinkedIn',
    score: 92,
  },
  {
    id: 2,
    name: 'GrowthStart',
    industry: 'Startup',
    location: 'Cape Town',
    website: 'growthstart.io',
    hiringSignal: 'High',
    openRoles: 5,
    source: 'Job Board',
    score: 88,
  },
  {
    id: 3,
    name: 'Enterprise SA',
    industry: 'Enterprise',
    location: 'Johannesburg',
    website: 'enterprise.co.za',
    hiringSignal: 'Medium',
    openRoles: 12,
    source: 'AI Discovery',
    score: 85,
  },
];

const INDUSTRIES = ['Technology', 'Finance', 'Retail', 'Healthcare', 'Manufacturing', 'Startup', 'Enterprise', 'Other'];
const LOCATIONS = ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Other'];
const STATUSES = ['active', 'pending', 'inactive'];

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n || 0);

const formatRelative = (iso) => {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(iso).toLocaleDateString('en-ZA');
};

const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

export default function Clients() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');

  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_clients');
      return saved ? JSON.parse(saved) : SEED_CLIENTS;
    } catch {
      return SEED_CLIENTS;
    }
  });

  const [leads, setLeads] = useState(SEED_LEADS);

  useEffect(() => {
    localStorage.setItem('crm_clients', JSON.stringify(clients));
  }, [clients]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const [selectedClient, setSelectedClient] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const emptyForm = {
    name: '', industry: 'Technology', location: 'Cape Town',
    contact: '', email: '', phone: '', website: '',
    status: 'pending', activeJobs: 0, totalHires: 0, revenue: 0,
  };
  const [form, setForm] = useState(emptyForm);

  const [newNote, setNewNote] = useState('');
  const [newReminder, setNewReminder] = useState({ title: '', dueDate: '', priority: 'medium' });
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', role: '' });

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.contact || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.website || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;
      const matchesLocation = locationFilter === 'all' || c.location === locationFilter;

      return matchesSearch && matchesStatus && matchesIndustry && matchesLocation;
    });
  }, [clients, search, statusFilter, industryFilter, locationFilter]);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeJobs = clients.reduce((s, c) => s + (c.activeJobs || 0), 0);
    const revenueYTD = clients.reduce((s, c) => s + (c.revenue || 0), 0);
    return { totalClients, activeJobs, revenueYTD, newLeads: leads.length };
  }, [clients, leads]);

  const openAdd = () => {
    setForm(emptyForm);
    setIsAddOpen(true);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      industry: client.industry,
      location: client.location,
      contact: client.contact || '',
      email: client.email || '',
      phone: client.phone || '',
      website: client.website || '',
      status: client.status,
      activeJobs: client.activeJobs || 0,
      totalHires: client.totalHires || 0,
      revenue: client.revenue || 0,
    });
    setIsEditOpen(true);
  };

  const saveClient = () => {
    if (!form.name.trim()) return;

    if (isEditOpen && editingClient) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== editingClient.id) return c;
          const updated = {
            ...c,
            ...form,
            revenue: Number(form.revenue) || 0,
            activeJobs: Number(form.activeJobs) || 0,
            totalHires: Number(form.totalHires) || 0,
            lastContact: new Date().toISOString(),
          };
          if (c.status !== form.status) {
            updated.timeline = [
              ...(c.timeline || []),
              {
                id: generateId(),
                type: 'status_change',
                description: `Status changed from ${c.status} to ${form.status}`,
                date: new Date().toISOString(),
              },
            ];
          }
          return updated;
        })
      );
      if (selectedClient?.id === editingClient.id) {
        setSelectedClient((prev) => ({ ...prev, ...form }));
      }
      setIsEditOpen(false);
    } else {
      const newClient = {
        id: generateId(),
        ...form,
        revenue: Number(form.revenue) || 0,
        activeJobs: Number(form.activeJobs) || 0,
        totalHires: Number(form.totalHires) || 0,
        lastContact: new Date().toISOString(),
        notes: [],
        timeline: [
          {
            id: generateId(),
            type: 'status_change',
            description: `Client created with status "${form.status}"`,
            date: new Date().toISOString(),
          },
        ],
        reminders: [],
        contacts: form.contact
          ? [{ id: generateId(), name: form.contact, email: form.email, phone: form.phone, role: 'Primary' }]
          : [],
      };
      setClients((prev) => [newClient, ...prev]);
      setIsAddOpen(false);
    }
    setForm(emptyForm);
  };

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setIsDeleteOpen(true);
  };

  const deleteClient = () => {
    if (!clientToDelete) return;
    setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
    if (selectedClient?.id === clientToDelete.id) setSelectedClient(null);
    setIsDeleteOpen(false);
    setClientToDelete(null);
  };

  const updateSelected = (updater) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== selectedClient.id) return c;
        const updated = typeof updater === 'function' ? updater(c) : { ...c, ...updater };
        setSelectedClient(updated);
        return updated;
      })
    );
  };

  const addNote = () => {
    if (!newNote.trim() || !selectedClient) return;
    const note = {
      id: generateId(),
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
      author: 'You',
    };
    updateSelected((c) => ({
      ...c,
      notes: [note, ...(c.notes || [])],
      timeline: [
        { id: generateId(), type: 'note', description: newNote.trim(), date: new Date().toISOString() },
        ...(c.timeline || []),
      ],
      lastContact: new Date().toISOString(),
    }));
    setNewNote('');
  };

  const deleteNote = (noteId) => {
    updateSelected((c) => ({
      ...c,
      notes: (c.notes || []).filter((n) => n.id !== noteId),
    }));
  };

  const addReminder = () => {
    if (!newReminder.title.trim() || !newReminder.dueDate || !selectedClient) return;
    const reminder = { id: generateId(), ...newReminder, completed: false };
    updateSelected((c) => ({
      ...c,
      reminders: [reminder, ...(c.reminders || [])],
      timeline: [
        {
          id: generateId(),
          type: 'reminder',
          description: `Reminder set: ${newReminder.title}`,
          date: new Date().toISOString(),
        },
        ...(c.timeline || []),
      ],
    }));
    setNewReminder({ title: '', dueDate: '', priority: 'medium' });
  };

  const toggleReminder = (id) => {
    updateSelected((c) => ({
      ...c,
      reminders: (c.reminders || []).map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      ),
    }));
  };

  const deleteReminder = (id) => {
    updateSelected((c) => ({
      ...c,
      reminders: (c.reminders || []).filter((r) => r.id !== id),
    }));
  };

  const addContact = () => {
    if (!newContact.name.trim() || !selectedClient) return;
    const contact = { id: generateId(), ...newContact };
    updateSelected((c) => ({
      ...c,
      contacts: [...(c.contacts || []), contact],
    }));
    setNewContact({ name: '', email: '', phone: '', role: '' });
  };

  const deleteContact = (id) => {
    updateSelected((c) => ({
      ...c,
      contacts: (c.contacts || []).filter((ct) => ct.id !== id),
    }));
  };

  const convertLead = (lead) => {
    const newClient = {
      id: generateId(),
      name: lead.name,
      industry: lead.industry,
      location: lead.location,
      contact: '',
      email: '',
      phone: '',
      website: lead.website,
      status: 'pending',
      activeJobs: lead.openRoles || 0,
      totalHires: 0,
      revenue: 0,
      lastContact: new Date().toISOString(),
      notes: [],
      timeline: [
        {
          id: generateId(),
          type: 'status_change',
          description: `Converted from AI Lead (score ${lead.score}%)`,
          date: new Date().toISOString(),
        },
      ],
      reminders: [],
      contacts: [],
    };
    setClients((prev) => [newClient, ...prev]);
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setActiveTab('clients');
    setSelectedClient(newClient);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar title="Client Management" subtitle="Manage clients and discover new leads" />

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Clients', value: stats.totalClients, icon: Building2, color: 'bg-blue-50 text-blue-600' },
              { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'bg-green-50 text-green-600' },
              { label: 'New Leads', value: stats.newLeads, icon: Target, color: 'bg-purple-50 text-purple-600' },
              { label: 'Revenue YTD', value: formatCurrency(stats.revenueYTD), icon: DollarSign, color: 'bg-red-50 text-red-600' },
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
            {selectedClient ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedClient(null)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
                        <Badge
                          className={
                            selectedClient.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : selectedClient.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {selectedClient.status}
                        </Badge>
                      </div>
                      <p className="text-gray-500">{selectedClient.industry} · {selectedClient.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openEdit(selectedClient)}>
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => confirmDelete(selectedClient)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>

                <Tabs value={detailTab} onValueChange={setDetailTab}>
                  <TabsList className="bg-white border">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Overview</TabsTrigger>
                    <TabsTrigger value="notes" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                      Notes ({selectedClient.notes?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Timeline</TabsTrigger>
                    <TabsTrigger value="reminders" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                      Reminders ({selectedClient.reminders?.filter((r) => !r.completed).length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="contacts" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Contacts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-0 shadow-sm md:col-span-2">
                        <CardHeader><CardTitle className="text-lg">Company Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Primary Contact</p>
                            <p className="font-medium">{selectedClient.contact || '—'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedClient.email || '—'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Phone</p>
                            <p className="font-medium flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedClient.phone || '—'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Website</p>
                            <p className="font-medium flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {selectedClient.website || '—'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Contact</p>
                            <p className="font-medium">{formatRelative(selectedClient.lastContact)}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm">
                        <CardHeader><CardTitle className="text-lg">Key Metrics</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{selectedClient.activeJobs}</p>
                            <p className="text-xs text-gray-500">Active Jobs</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">{selectedClient.totalHires}</p>
                            <p className="text-xs text-gray-500">Total Hires</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedClient.revenue)}</p>
                            <p className="text-xs text-gray-500">Revenue</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-6">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex gap-3">
                          <Textarea
                            placeholder="Add a note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <Button onClick={addNote} className="bg-red-600 hover:bg-red-700 self-end">
                            <StickyNote className="w-4 h-4 mr-1" /> Add
                          </Button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {(selectedClient.notes || []).length === 0 && (
                            <p className="text-center text-gray-400 py-8">No notes yet</p>
                          )}
                          {(selectedClient.notes || []).map((note) => (
                            <div key={note.id} className="bg-gray-50 rounded-lg p-4 flex justify-between gap-4">
                              <div>
                                <p className="text-sm">{note.text}</p>
                                <p className="text-xs text-gray-400 mt-1">{note.author} · {formatRelative(note.createdAt)}</p>
                              </div>
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteNote(note.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-6">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                          {(selectedClient.timeline || [])
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((item) => (
                              <div key={item.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                                  {item.type === 'note' && <StickyNote className="w-4 h-4 text-red-600" />}
                                  {item.type === 'call' && <Phone className="w-4 h-4 text-red-600" />}
                                  {item.type === 'email' && <Mail className="w-4 h-4 text-red-600" />}
                                  {item.type === 'reminder' && <Bell className="w-4 h-4 text-red-600" />}
                                  {item.type === 'status_change' && <TrendingUp className="w-4 h-4 text-red-600" />}
                                  {!['note', 'call', 'email', 'reminder', 'status_change'].includes(item.type) && (
                                    <Clock className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{item.description}</p>
                                  <p className="text-xs text-gray-400">{formatRelative(item.date)}</p>
                                </div>
                              </div>
                            ))}
                          {(selectedClient.timeline || []).length === 0 && (
                            <p className="text-center text-gray-400 py-8">No activity yet</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reminders" className="mt-6">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <Input
                            placeholder="Reminder title"
                            value={newReminder.title}
                            onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                            className="md:col-span-2"
                          />
                          <Input
                            type="date"
                            value={newReminder.dueDate}
                            onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <Select value={newReminder.priority} onValueChange={(v) => setNewReminder({ ...newReminder, priority: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button onClick={addReminder} className="bg-red-600 hover:bg-red-700">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {(selectedClient.reminders || []).length === 0 && (
                            <p className="text-center text-gray-400 py-8">No reminders</p>
                          )}
                          {(selectedClient.reminders || []).map((r) => (
                            <div
                              key={r.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${r.completed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
                            >
                              <div className="flex items-center gap-3">
                                <button onClick={() => toggleReminder(r.id)}>
                                  {r.completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-400" />}
                                </button>
                                <div>
                                  <p className={`font-medium ${r.completed ? 'line-through' : ''}`}>{r.title}</p>
                                  <p className="text-xs text-gray-500">
                                    Due {r.dueDate} ·{' '}
                                    <span className={r.priority === 'high' ? 'text-red-600' : r.priority === 'medium' ? 'text-yellow-600' : 'text-gray-500'}>
                                      {r.priority}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => deleteReminder(r.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="contacts" className="mt-6">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <Input placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
                          <Input placeholder="Email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
                          <Input placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                          <Input placeholder="Role" value={newContact.role} onChange={(e) => setNewContact({ ...newContact, role: e.target.value })} />
                          <Button onClick={addContact} className="bg-red-600 hover:bg-red-700">
                            <UserPlus className="w-4 h-4 mr-1" /> Add
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {(selectedClient.contacts || []).map((ct) => (
                            <div key={ct.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{ct.name}</p>
                                <p className="text-sm text-gray-500">{ct.role} · {ct.email} · {ct.phone}</p>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => deleteContact(ct.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          {(selectedClient.contacts || []).length === 0 && (
                            <p className="text-center text-gray-400 py-8">No contacts added</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <TabsList className="bg-white border">
                      <TabsTrigger value="clients" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                        <Building2 className="w-4 h-4 mr-2" /> Clients
                      </TabsTrigger>
                      <TabsTrigger value="leads" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                        <Target className="w-4 h-4 mr-2" /> AI Leads
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search clients..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10 w-64 bg-white border-gray-200"
                        />
                      </div>

                      {activeTab === 'clients' && (
                        <>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-32 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={industryFilter} onValueChange={setIndustryFilter}>
                            <SelectTrigger className="w-36 bg-white"><SelectValue placeholder="Industry" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Industries</SelectItem>
                              {INDUSTRIES.map((i) => (
                                <SelectItem key={i} value={i}>{i}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-36 bg-white"><SelectValue placeholder="Location" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Locations</SelectItem>
                              {LOCATIONS.map((l) => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      {activeTab === 'clients' ? (
                        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={openAdd}>
                          <Plus className="w-4 h-4" /> Add Client
                        </Button>
                      ) : (
                        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                          <Zap className="w-4 h-4" /> Find More Leads
                        </Button>
                      )}
                    </div>
                  </div>

                  <TabsContent value="clients" className="space-y-4">
                    {filteredClients.length === 0 && (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-12 text-center text-gray-400">
                          No clients found. Try adjusting filters or add a new client.
                        </CardContent>
                      </Card>
                    )}

                    {filteredClients.map((client, i) => (
                      <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                          <CardContent className="p-6" onClick={() => setSelectedClient(client)}>
                            <div className="flex items-start gap-6">
                              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-7 h-7 text-gray-400" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-xl font-bold">{client.name}</h3>
                                      <Badge
                                        className={
                                          client.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : client.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-700'
                                        }
                                      >
                                        {client.status}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-500">{client.industry}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {client.location}</span>
                                      <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {client.email}</span>
                                      {client.website && (
                                        <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {client.website}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-blue-600">{client.activeJobs}</p>
                                    <p className="text-xs text-gray-500">Active Jobs</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-green-600">{client.totalHires}</p>
                                    <p className="text-xs text-gray-500">Total Hires</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(client.revenue)}</p>
                                    <p className="text-xs text-gray-500">Revenue</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-sm font-medium text-gray-600">{formatRelative(client.lastContact)}</p>
                                    <p className="text-xs text-gray-500">Last Contact</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white gap-1"
                                  onClick={() => setSelectedClient(client)}
                                >
                                  View <ChevronRight className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedClient(client)}>View Details</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEdit(client)}>Edit Client</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(client)}>
                                      Delete Client
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </TabsContent>

                  <TabsContent value="leads" className="space-y-4">
                    <Card className="border-0 shadow-sm bg-gradient-to-r from-red-600 to-red-700 text-white mb-6">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold">AI Client Discovery</h3>
                            <p className="text-white/80 mt-1">AI found {leads.length} companies actively hiring this week</p>
                          </div>
                          <Button className="bg-white text-red-600 hover:bg-gray-100 gap-2">
                            <Zap className="w-4 h-4" /> Run AI Scan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {leads.map((lead, i) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Target className="w-7 h-7 text-red-600" />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-bold">{lead.name}</h3>
                                  <Badge className="bg-green-100 text-green-700">{lead.hiringSignal} Intent</Badge>
                                  <Badge variant="outline">{lead.source}</Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span>{lead.industry}</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {lead.location}</span>
                                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {lead.openRoles} open roles</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="flex items-center gap-1 text-lg font-bold text-red-600">
                                  <Star className="w-5 h-5" />
                                  {lead.score}%
                                </div>
                                <p className="text-xs text-gray-500">Lead Score</p>
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="gap-1">
                                  <Mail className="w-4 h-4" /> Outreach
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => convertLead(lead)}
                                >
                                  Convert
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add / Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Company Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Primary Contact</Label>
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Active Jobs</Label>
                <Input type="number" value={form.activeJobs} onChange={(e) => setForm({ ...form, activeJobs: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Revenue (R)</Label>
                <Input type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={saveClient}>
              {isEditOpen ? 'Save Changes' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete <strong>{clientToDelete?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={deleteClient}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
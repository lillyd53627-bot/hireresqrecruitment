import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Building2,
  Briefcase,
  Mail,
  Globe,
  MoreVertical,
  Star,
  DollarSign,
  ChevronRight,
  Target,
  Zap,
  MapPin,
  Users,
  Pencil,
  Trash2,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';


export default function Clients() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState('clients');

  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');

  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    contact: '',
    email: '',
    phone: '',
    website: '',
    status: 'active',
    notes: '',
  });


  /* =========================================================
     LOAD REAL CRM DATA
  ========================================================= */

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [
        clientsResponse,
        jobsResponse,
        leadsResponse,
      ] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (clientsResponse.error) {
        console.error('Clients error:', clientsResponse.error);
        toast.error('Unable to load clients');
      }

      if (jobsResponse.error) {
        console.warn('Jobs table error:', jobsResponse.error);
      }

      if (leadsResponse.error) {
        console.warn('Leads table error:', leadsResponse.error);
      }

      setClients(clientsResponse.data || []);
      setJobs(jobsResponse.data || []);
      setLeads(leadsResponse.data || []);

    } catch (error) {
      console.error('CRM loading error:', error);
      toast.error('Unable to load CRM data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  /* =========================================================
     CALCULATED CLIENT DATA
  ========================================================= */

  const getClientJobs = (client) => {
    if (!client?.id) return [];

    return jobs.filter((job) => {
      return (
        job.client_id === client.id ||
        job.clientId === client.id ||
        job.company_id === client.id
      );
    });
  };


  const getActiveJobs = (client) => {
    return getClientJobs(client).filter((job) => {
      const status = String(job.status || '').toLowerCase();

      return ![
        'closed',
        'filled',
        'cancelled',
        'cancelled',
        'completed',
      ].includes(status);
    }).length;
  };


  const getTotalHires = (client) => {
    return getClientJobs(client).filter((job) => {
      const status = String(job.status || '').toLowerCase();

      return [
        'hired',
        'filled',
        'closed',
        'completed',
      ].includes(status);
    }).length;
  };


  const getClientRevenue = (client) => {
    const clientJobs = getClientJobs(client);

    return clientJobs.reduce((total, job) => {
      const value =
        job.revenue ||
        job.placement_fee ||
        job.fee ||
        job.value ||
        0;

      const numericValue = Number(
        String(value).replace(/[^0-9.-]/g, '')
      );

      return total + (Number.isFinite(numericValue) ? numericValue : 0);
    }, 0);
  };


  const formatCurrency = (value) => {
    return `R ${Number(value || 0).toLocaleString('en-ZA')}`;
  };


  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return clients;

    return clients.filter((client) => {
      const searchable = [
        client.name,
        client.company_name,
        client.industry,
        client.location,
        client.city,
        client.province,
        client.contact,
        client.contact_name,
        client.email,
        client.phone,
        client.website,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [clients, search]);


  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return leads;

    return leads.filter((lead) => {
      const searchable = [
        lead.name,
        lead.company_name,
        lead.industry,
        lead.location,
        lead.city,
        lead.website,
        lead.source,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [leads, search]);


  /* =========================================================
     DASHBOARD STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const activeJobs = jobs.filter((job) => {
      const status = String(job.status || '').toLowerCase();

      return ![
        'closed',
        'filled',
        'cancelled',
        'completed',
      ].includes(status);
    }).length;

    const revenue = jobs.reduce((total, job) => {
      const value =
        job.revenue ||
        job.placement_fee ||
        job.fee ||
        job.value ||
        0;

      const numericValue = Number(
        String(value).replace(/[^0-9.-]/g, '')
      );

      return total + (Number.isFinite(numericValue) ? numericValue : 0);
    }, 0);

    return {
      totalClients: clients.length,
      activeJobs,
      newLeads: leads.length,
      revenue,
    };
  }, [clients, jobs, leads]);


  /* =========================================================
     CLIENT FORM
  ========================================================= */

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      location: '',
      contact: '',
      email: '',
      phone: '',
      website: '',
      status: 'active',
      notes: '',
    });

    setEditingClient(null);
  };


  const openAddClient = () => {
    resetForm();
    setClientDialogOpen(true);
  };


  const openEditClient = (client) => {
    setEditingClient(client);

    setFormData({
      name: client.name || client.company_name || '',
      industry: client.industry || '',
      location: client.location || client.city || '',
      contact: client.contact || client.contact_name || '',
      email: client.email || '',
      phone: client.phone || '',
      website: client.website || '',
      status: client.status || 'active',
      notes: client.notes || '',
    });

    setClientDialogOpen(true);
  };


  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  /* =========================================================
     SAVE CLIENT
  ========================================================= */

  const saveClient = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter the client/company name');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        industry: formData.industry.trim(),
        location: formData.location.trim(),
        contact: formData.contact.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        status: formData.status,
        notes: formData.notes.trim(),
      };

      let response;

      if (editingClient?.id) {
        response = await supabase
          .from('clients')
          .update(payload)
          .eq('id', editingClient.id)
          .select()
          .single();
      } else {
        response = await supabase
          .from('clients')
          .insert([payload])
          .select()
          .single();
      }

      if (response.error) {
        console.error('Save client error:', response.error);

        toast.error(
          response.error.message || 'Unable to save client'
        );

        return;
      }

      /*
       * IMPORTANT:
       * Update local state immediately AND reload from Supabase.
       * This prevents the UI from falling back to old/demo data.
       */

      if (editingClient?.id) {
        setClients((prev) =>
          prev.map((client) =>
            client.id === editingClient.id
              ? response.data
              : client
          )
        );

        toast.success('Client updated successfully');
      } else {
        setClients((prev) => [
          response.data,
          ...prev,
        ]);

        toast.success('Client added successfully');
      }

      setClientDialogOpen(false);
      resetForm();

    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while saving the client');
    } finally {
      setSaving(false);
    }
  };


  /* =========================================================
     DELETE CLIENT
  ========================================================= */

  const deleteClient = async (client) => {
    if (!client?.id) return;

    const confirmed = window.confirm(
      `Delete ${client.name || client.company_name}?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) {
        console.error('Delete client error:', error);
        toast.error('Unable to delete client');
        return;
      }

      setClients((prev) =>
        prev.filter((item) => item.id !== client.id)
      );

      toast.success('Client deleted');

    } catch (error) {
      console.error(error);
      toast.error('Unable to delete client');
    }
  };


  /* =========================================================
     CLIENT CARD
  ========================================================= */

  const ClientCard = ({ client, index }) => {
    const name =
      client.name ||
      client.company_name ||
      'Unnamed Client';

    const industry =
      client.industry ||
      'Industry not specified';

    const location =
      client.location ||
      client.city ||
      'Location not specified';

    const contact =
      client.contact ||
      client.contact_name ||
      '';

    const activeJobs = getActiveJobs(client);
    const totalHires = getTotalHires(client);
    const revenue = getClientRevenue(client);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">

              {/* COMPANY ICON */}

              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>


              {/* MAIN CLIENT INFORMATION */}

              <div className="flex-1 min-w-0">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold truncate">
                        {name}
                      </h3>

                      <Badge
                        className={
                          client.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }
                      >
                        {client.status || 'active'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500 mt-0.5">
                      {industry}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">

                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {location}
                      </span>

                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {client.email}
                        </span>
                      )}

                      {client.website && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {client.website}
                        </span>
                      )}

                    </div>

                    {contact && (
                      <p className="text-xs text-gray-400 mt-1">
                        Contact: {contact}
                      </p>
                    )}

                  </div>


                  {/* ACTIONS */}

                  <div className="flex items-center gap-2 flex-shrink-0">

                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white gap-1"
                      onClick={() => openEditClient(client)}
                    >
                      View
                      <ChevronRight className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">

                        <DropdownMenuItem
                          onClick={() => openEditClient(client)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Client
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Briefcase className="w-4 h-4 mr-2" />
                          Add Job
                        </DropdownMenuItem>

                        {client.email && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.location.href =
                                `mailto:${client.email}`
                            }
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteClient(client)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>

                  </div>

                </div>


                {/* CLIENT METRICS */}

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">

                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {activeJobs}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Active Jobs
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-green-600">
                      {totalHires}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Total Hires
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(revenue)}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Revenue
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-medium text-gray-600">
                      {client.last_contact || '—'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Last Contact
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };


  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed(!sidebarCollapsed)
        }
      />


      {/* IMPORTANT:
          Keep the main content aligned with the shared Sidebar.
          Do not add another margin/padding wrapper.
      */}

      <main
        className={`
          min-h-screen
          transition-all
          duration-300
          ${sidebarCollapsed ? 'ml-20' : 'ml-64'}
        `}
      >

        <TopBar
          title="Client Management"
          subtitle="Manage clients and discover new leads"
        />


        {/* COMPACT CONTENT AREA */}

        <div className="px-6 py-5">

          {/* =================================================
              STATS
          ================================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-xl font-bold">
                    {statistics.totalClients}
                  </p>

                  <p className="text-xs text-gray-500">
                    Total Clients
                  </p>
                </div>
              </CardContent>
            </Card>


            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-xl font-bold">
                    {statistics.activeJobs}
                  </p>

                  <p className="text-xs text-gray-500">
                    Active Jobs
                  </p>
                </div>
              </CardContent>
            </Card>


            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-xl font-bold">
                    {statistics.newLeads}
                  </p>

                  <p className="text-xs text-gray-500">
                    New Leads
                  </p>
                </div>
              </CardContent>
            </Card>


            <Card className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-xl font-bold">
                    {formatCurrency(statistics.revenue)}
                  </p>

                  <p className="text-xs text-gray-500">
                    Revenue
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>


          {/* =================================================
              TABS + SEARCH
          ================================================= */}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
          >

            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">

              <TabsList className="bg-white border">

                <TabsTrigger
                  value="clients"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Clients
                </TabsTrigger>

                <TabsTrigger
                  value="leads"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                >
                  <Target className="w-4 h-4 mr-2" />
                  AI Leads
                </TabsTrigger>

              </TabsList>


              <div className="flex items-center gap-2">

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <Input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search clients..."
                    className="pl-9 w-64 bg-white"
                  />
                </div>


                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      refreshing
                        ? 'animate-spin'
                        : ''
                    }`}
                  />
                </Button>


                {activeTab === 'clients' && (
                  <Button
                    onClick={openAddClient}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                )}

              </div>

            </div>


            {/* =================================================
                CLIENTS
            ================================================= */}

            <TabsContent
              value="clients"
              className="mt-0 space-y-3"
            >

              {loading ? (

                <div className="text-center py-12 text-gray-500">
                  Loading clients...
                </div>

              ) : filteredClients.length === 0 ? (

                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">

                    <Building2 className="w-10 h-10 mx-auto text-gray-300 mb-3" />

                    <h3 className="font-semibold text-gray-700">
                      No clients found
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      Your CRM clients will appear here.
                    </p>

                    <Button
                      onClick={openAddClient}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Client
                    </Button>

                  </CardContent>
                </Card>

              ) : (

                filteredClients.map((client, index) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    index={index}
                  />
                ))

              )}

            </TabsContent>


            {/* =================================================
                REAL LEADS
            ================================================= */}

            <TabsContent
              value="leads"
              className="mt-0 space-y-3"
            >

              {filteredLeads.length === 0 ? (

                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">

                    <Target className="w-10 h-10 mx-auto text-gray-300 mb-3" />

                    <h3 className="font-semibold">
                      No leads found
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      AI-discovered leads will appear here.
                    </p>

                  </CardContent>
                </Card>

              ) : (

                filteredLeads.map((lead, index) => (

                  <motion.div
                    key={lead.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >

                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4">

                        <div className="flex items-center gap-4">

                          <div className="w-11 h-11 bg-red-50 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-red-600" />
                          </div>

                          <div className="flex-1">

                            <div className="flex items-center gap-2 flex-wrap">

                              <h3 className="font-bold">
                                {lead.name ||
                                  lead.company_name ||
                                  'Unnamed Lead'}
                              </h3>

                              {lead.hiring_signal && (
                                <Badge className="bg-green-100 text-green-700">
                                  {lead.hiring_signal} Intent
                                </Badge>
                              )}

                            </div>

                            <div className="flex gap-4 text-xs text-gray-500 mt-1 flex-wrap">

                              {lead.industry && (
                                <span>
                                  {lead.industry}
                                </span>
                              )}

                              {(lead.location ||
                                lead.city) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {lead.location ||
                                    lead.city}
                                </span>
                              )}

                              {lead.open_roles && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5" />
                                  {lead.open_roles} open roles
                                </span>
                              )}

                            </div>

                          </div>


                          {lead.score && (
                            <div className="text-right">

                              <div className="flex items-center gap-1 font-bold text-red-600">
                                <Star className="w-4 h-4" />
                                {lead.score}%
                              </div>

                              <p className="text-[10px] text-gray-500">
                                Lead Score
                              </p>

                            </div>
                          )}

                        </div>

                      </CardContent>
                    </Card>

                  </motion.div>

                ))

              )}

            </TabsContent>

          </Tabs>

        </div>

      </main>


      {/* =====================================================
          ADD / EDIT CLIENT DIALOG
      ===================================================== */}

      <Dialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
      >

        <DialogContent className="sm:max-w-lg">

          <DialogHeader>
            <DialogTitle>
              {editingClient
                ? 'Edit Client'
                : 'Add Client'}
            </DialogTitle>
          </DialogHeader>


          <form
            onSubmit={saveClient}
            className="space-y-4"
          >

            <div>
              <Label>Company Name *</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Company name"
                required
              />
            </div>


            <div className="grid grid-cols-2 gap-3">

              <div>
                <Label>Industry</Label>
                <Input
                  name="industry"
                  value={formData.industry}
                  onChange={handleFormChange}
                  placeholder="Technology"
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="Johannesburg"
                />
              </div>

            </div>


            <div>
              <Label>Contact Person</Label>
              <Input
                name="contact"
                value={formData.contact}
                onChange={handleFormChange}
                placeholder="Contact name"
              />
            </div>


            <div className="grid grid-cols-2 gap-3">

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="contact@company.co.za"
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="+27..."
                />
              </div>

            </div>


            <div>
              <Label>Website</Label>
              <Input
                name="website"
                value={formData.website}
                onChange={handleFormChange}
                placeholder="company.co.za"
              />
            </div>


            <div>
              <Label>Notes</Label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Client notes..."
                rows={3}
              />
            </div>


            <div className="flex justify-end gap-2 pt-2">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setClientDialogOpen(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving
                  ? 'Saving...'
                  : editingClient
                    ? 'Update Client'
                    : 'Save Client'}
              </Button>

            </div>

          </form>

        </DialogContent>

      </Dialog>

    </div>
  );
}
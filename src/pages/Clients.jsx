import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  MoreVertical,
  Edit2,
  Trash2,
  MapPin,
  ArrowLeft,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
];

const EMPTY_FORM = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  status: 'active',
  notes: '',
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 hover:bg-green-100';

    case 'pending':
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';

    case 'inactive':
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100';

    default:
      return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
  }
};

const formatDate = (date) => {
  if (!date) return '—';

  try {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export default function Clients() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedClient, setSelectedClient] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  /*
   * ---------------------------------------------------------
   * GET CURRENT USER
   * ---------------------------------------------------------
   */

  const getCurrentUser = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    if (!user) {
      throw new Error(
        'You are not logged in. Please sign in before accessing clients.'
      );
    }

    return user;
  };

  /*
   * ---------------------------------------------------------
   * LOAD CLIENTS
   * ---------------------------------------------------------
   */

  const loadClients = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await getCurrentUser();

      const { data, error: clientsError } = await supabase
        .from('clients')
        .select(
          `
            id,
            user_id,
            company_name,
            contact_name,
            email,
            phone,
            status,
            notes,
            created_at,
            updated_at
          `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) {
        throw clientsError;
      }

      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);

      setError(
        err?.message ||
          'Unable to load clients. Please check your connection and try again.'
      );

      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    loadClients();
  }, []);

  /*
   * ---------------------------------------------------------
   * AUTH STATE
   *
   * If the user signs in/out while this page is open,
   * reload the clients.
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === 'SIGNED_IN' ||
        event === 'SIGNED_OUT' ||
        event === 'TOKEN_REFRESHED'
      ) {
        loadClients();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * FILTERED CLIENTS
   * ---------------------------------------------------------
   */

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !query ||
        (client.company_name || '').toLowerCase().includes(query) ||
        (client.contact_name || '').toLowerCase().includes(query) ||
        (client.email || '').toLowerCase().includes(query) ||
        (client.phone || '').toLowerCase().includes(query) ||
        (client.notes || '').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  /*
   * ---------------------------------------------------------
   * STATS
   * ---------------------------------------------------------
   */

  const stats = useMemo(() => {
    return {
      total: clients.length,

      active: clients.filter((client) => client.status === 'active').length,

      pending: clients.filter((client) => client.status === 'pending').length,

      inactive: clients.filter((client) => client.status === 'inactive')
        .length,
    };
  }, [clients]);

  /*
   * ---------------------------------------------------------
   * FORM HANDLING
   * ---------------------------------------------------------
   */

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAdd = () => {
    setError('');
    setForm(EMPTY_FORM);
    setIsAddOpen(true);
  };

  const openEdit = (client) => {
    setError('');

    setForm({
      company_name: client.company_name || '',
      contact_name: client.contact_name || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'active',
      notes: client.notes || '',
    });

    setSelectedClient(client);
    setIsEditOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setIsAddOpen(false);
    setIsEditOpen(false);
    setForm(EMPTY_FORM);
  };

  /*
   * ---------------------------------------------------------
   * ADD CLIENT
   * ---------------------------------------------------------
   */

  const addClient = async () => {
    if (!form.company_name.trim()) {
      setError('Company name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const user = await getCurrentUser();

      const payload = {
        user_id: user.id,
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        status: form.status || 'active',
        notes: form.notes.trim() || null,
      };

      const { data, error: insertError } = await supabase
        .from('clients')
        .insert(payload)
        .select(
          `
            id,
            user_id,
            company_name,
            contact_name,
            email,
            phone,
            status,
            notes,
            created_at,
            updated_at
          `
        )
        .single();

      if (insertError) {
        throw insertError;
      }

      setClients((previous) => [data, ...previous]);

      setIsAddOpen(false);
      setForm(EMPTY_FORM);

      setSelectedClient(data);
    } catch (err) {
      console.error('Error adding client:', err);

      setError(
        err?.message ||
          'Unable to add client. Please check your Supabase permissions.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * UPDATE CLIENT
   * ---------------------------------------------------------
   */

  const updateClient = async () => {
    if (!selectedClient?.id) {
      setError('No client selected.');
      return;
    }

    if (!form.company_name.trim()) {
      setError('Company name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const user = await getCurrentUser();

      const payload = {
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        status: form.status || 'active',
        notes: form.notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', selectedClient.id)
        .eq('user_id', user.id)
        .select(
          `
            id,
            user_id,
            company_name,
            contact_name,
            email,
            phone,
            status,
            notes,
            created_at,
            updated_at
          `
        )
        .single();

      if (updateError) {
        throw updateError;
      }

      setClients((previous) =>
        previous.map((client) =>
          client.id === data.id ? data : client
        )
      );

      setSelectedClient(data);

      setIsEditOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('Error updating client:', err);

      setError(
        err?.message ||
          'Unable to update client. Please check your Supabase permissions.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE CLIENT
   * ---------------------------------------------------------
   */

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setIsDeleteOpen(true);
  };

  const deleteClient = async () => {
    if (!clientToDelete?.id) return;

    setDeleting(true);
    setError('');

    try {
      const user = await getCurrentUser();

      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientToDelete.id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setClients((previous) =>
        previous.filter((client) => client.id !== clientToDelete.id)
      );

      if (selectedClient?.id === clientToDelete.id) {
        setSelectedClient(null);
      }

      setClientToDelete(null);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error('Error deleting client:', err);

      setError(
        err?.message ||
          'Unable to delete client. Please check your Supabase permissions.'
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CLIENT DETAIL
   * ---------------------------------------------------------
   */

  const openClient = (client) => {
    setError('');
    setSelectedClient(client);
  };

  const closeClient = () => {
    setSelectedClient(null);
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <TopBar
          title="Client Management"
          subtitle="Manage your recruitment clients"
        />

        <div className="p-8">
          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start justify-between gap-4">
              <div>
                <strong className="font-semibold">Error: </strong>
                {error}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError('')}
                className="text-red-700"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* =====================================================
              DETAIL VIEW
          ====================================================== */}

          {selectedClient ? (
            <div className="space-y-6">
              {/* HEADER */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeClient}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Clients
                  </Button>

                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedClient.company_name}
                      </h2>

                      <Badge
                        className={getStatusBadgeClass(
                          selectedClient.status
                        )}
                      >
                        {selectedClient.status || 'active'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      Client since {formatDate(selectedClient.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openEdit(selectedClient)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => confirmDelete(selectedClient)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* COMPANY DETAILS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">
                          Company Name
                        </p>

                        <p className="font-medium text-gray-900 mt-1 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {selectedClient.company_name || '—'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Contact Person
                        </p>

                        <p className="font-medium text-gray-900 mt-1">
                          {selectedClient.contact_name || '—'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Email
                        </p>

                        {selectedClient.email ? (
                          <a
                            href={`mailto:${selectedClient.email}`}
                            className="font-medium text-red-600 hover:underline mt-1 flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            {selectedClient.email}
                          </a>
                        ) : (
                          <p className="font-medium mt-1">—</p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Phone
                        </p>

                        {selectedClient.phone ? (
                          <a
                            href={`tel:${selectedClient.phone}`}
                            className="font-medium text-red-600 hover:underline mt-1 flex items-center gap-2"
                          >
                            <Phone className="w-4 h-4" />
                            {selectedClient.phone}
                          </a>
                        ) : (
                          <p className="font-medium mt-1">—</p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Status
                        </p>

                        <div className="mt-2">
                          <Badge
                            className={getStatusBadgeClass(
                              selectedClient.status
                            )}
                          >
                            {selectedClient.status || 'active'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Last Updated
                        </p>

                        <p className="font-medium text-gray-900 mt-1">
                          {formatDate(selectedClient.updated_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* STATUS CARD */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Client Status</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-6">
                      {selectedClient.status === 'active' && (
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                      )}

                      {selectedClient.status === 'pending' && (
                        <Clock className="w-16 h-16 text-yellow-500 mb-4" />
                      )}

                      {selectedClient.status === 'inactive' && (
                        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
                      )}

                      <p className="text-xl font-bold capitalize">
                        {selectedClient.status || 'active'}
                      </p>

                      <p className="text-sm text-gray-500 text-center mt-2">
                        Current client status
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* NOTES */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>

                <CardContent>
                  {selectedClient.notes ? (
                    <div className="bg-gray-50 rounded-lg p-5 whitespace-pre-wrap text-sm text-gray-700">
                      {selectedClient.notes}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No notes have been added for this client.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* RECORD INFORMATION */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Record Information</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Client ID</p>
                      <p className="font-mono text-xs mt-1 break-all">
                        {selectedClient.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium mt-1">
                        {formatDate(selectedClient.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Updated</p>
                      <p className="font-medium mt-1">
                        {formatDate(selectedClient.updated_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* =================================================
                  PAGE HEADER
              ================================================== */}

              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Clients
                  </h1>

                  <p className="text-gray-500 mt-1">
                    Your clients stored in Supabase
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={loadClients}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        loading ? 'animate-spin' : ''
                      }`}
                    />
                    Refresh
                  </Button>

                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={openAdd}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </div>
              </div>

              {/* =================================================
                  STATS
              ================================================== */}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-2xl font-bold">
                        {stats.total}
                      </p>

                      <p className="text-sm text-gray-500">
                        Total Clients
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-2xl font-bold">
                        {stats.active}
                      </p>

                      <p className="text-sm text-gray-500">
                        Active
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-2xl font-bold">
                        {stats.pending}
                      </p>

                      <p className="text-sm text-gray-500">
                        Pending
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-2xl font-bold">
                        {stats.inactive}
                      </p>

                      <p className="text-sm text-gray-500">
                        Inactive
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* =================================================
                  SEARCH / FILTER
              ================================================== */}

              <Card className="border-0 shadow-sm mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[250px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                      <Input
                        placeholder="Search company, contact, email or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-white"
                      />
                    </div>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">
                          All Statuses
                        </SelectItem>

                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* =================================================
                  LOADING
              ================================================== */}

              {loading && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />

                    <p className="font-medium text-gray-700">
                      Loading clients...
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Fetching your clients from Supabase
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* =================================================
                  EMPTY STATE
              ================================================== */}

              {!loading && filteredClients.length === 0 && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>

                    {clients.length === 0 ? (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900">
                          No clients yet
                        </h3>

                        <p className="text-sm text-gray-500 mt-2 mb-6">
                          Your real Supabase client records will appear
                          here once you add them.
                        </p>

                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          onClick={openAdd}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Client
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900">
                          No matching clients
                        </h3>

                        <p className="text-sm text-gray-500 mt-2">
                          Try changing your search or status filter.
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* =================================================
                  CLIENT LIST
              ================================================== */}

              {!loading && filteredClients.length > 0 && (
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <Card
                      key={client.id}
                      className="border-0 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-5">
                          {/* ICON */}
                          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-7 h-7 text-red-600" />
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {client.company_name}
                                  </h3>

                                  <Badge
                                    className={getStatusBadgeClass(
                                      client.status
                                    )}
                                  >
                                    {client.status || 'active'}
                                  </Badge>
                                </div>

                                {client.contact_name && (
                                  <p className="text-gray-500 mt-1">
                                    {client.contact_name}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* CONTACT DETAILS */}
                            <div className="flex items-center gap-5 mt-4 flex-wrap text-sm text-gray-500">
                              {client.email && (
                                <a
                                  href={`mailto:${client.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 hover:text-red-600"
                                >
                                  <Mail className="w-4 h-4" />
                                  {client.email}
                                </a>
                              )}

                              {client.phone && (
                                <a
                                  href={`tel:${client.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 hover:text-red-600"
                                >
                                  <Phone className="w-4 h-4" />
                                  {client.phone}
                                </a>
                              )}

                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                Client record
                              </span>
                            </div>

                            {/* NOTES */}
                            {client.notes && (
                              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {client.notes}
                                </p>
                              </div>
                            )}

                            {/* FOOTER */}
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-400">
                                Created{' '}
                                {formatDate(client.created_at)}
                              </p>

                              <div
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => openClient(client)}
                                >
                                  View Client
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
                                      onClick={() =>
                                        openClient(client)
                                      }
                                    >
                                      View Details
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        openEdit(client)
                                      }
                                    >
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      Edit Client
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() =>
                                        confirmDelete(client)
                                      }
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Client
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* =========================================================
          ADD / EDIT CLIENT DIALOG
      ========================================================== */}

      <Dialog
        open={isAddOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeForm();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditOpen ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* COMPANY */}
            <div className="grid gap-2">
              <Label htmlFor="company_name">
                Company Name *
              </Label>

              <Input
                id="company_name"
                placeholder="e.g. ABC Holdings"
                value={form.company_name}
                onChange={(e) =>
                  updateForm('company_name', e.target.value)
                }
                disabled={saving}
              />
            </div>

            {/* CONTACT */}
            <div className="grid gap-2">
              <Label htmlFor="contact_name">
                Contact Name
              </Label>

              <Input
                id="contact_name"
                placeholder="e.g. John Smith"
                value={form.contact_name}
                onChange={(e) =>
                  updateForm('contact_name', e.target.value)
                }
                disabled={saving}
              />
            </div>

            {/* EMAIL / PHONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="contact@company.co.za"
                  value={form.email}
                  onChange={(e) =>
                    updateForm('email', e.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>

                <Input
                  id="phone"
                  placeholder="+27 82 123 4567"
                  value={form.phone}
                  onChange={(e) =>
                    updateForm('phone', e.target.value)
                  }
                  disabled={saving}
                />
              </div>
            </div>

            {/* STATUS */}
            <div className="grid gap-2">
              <Label>Status</Label>

              <Select
                value={form.status}
                onValueChange={(value) =>
                  updateForm('status', value)
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* NOTES */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>

              <Textarea
                id="notes"
                placeholder="Add notes about this client..."
                value={form.notes}
                onChange={(e) =>
                  updateForm('notes', e.target.value)
                }
                className="min-h-[110px]"
                disabled={saving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={isEditOpen ? updateClient : addClient}
              disabled={saving}
            >
              {saving && (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              )}

              {isEditOpen ? 'Save Changes' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          DELETE CONFIRMATION
      ========================================================== */}

      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setIsDeleteOpen(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <strong className="text-gray-900">
                {clientToDelete?.company_name}
              </strong>
              ?
            </p>

            <p className="text-sm text-red-600 mt-2">
              This will permanently remove the client record from
              Supabase.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={deleteClient}
              disabled={deleting}
            >
              {deleting && (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              )}

              <Trash2 className="w-4 h-4 mr-2" />

              {deleting ? 'Deleting...' : 'Delete Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
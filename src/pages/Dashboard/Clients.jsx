// src/pages/Dashboard/Clients.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  MoreVertical,
  Edit2,
  Trash2,
  StickyNote,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react';

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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  'https://uoovbueakhhswpmythsb.supabase.co';

const supabaseAnonKey =
  'YOUR_EXISTING_ANON_KEY';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);


// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
];

const emptyForm = {
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  status: 'active',
  notes: '',
};


const formatDate = (date) => {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};


const formatDateTime = (date) => {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


const getStatusClasses = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200';

    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';

    case 'inactive':
      return 'bg-gray-100 text-gray-700 border-gray-200';

    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};


const getInitials = (companyName) => {
  if (!companyName) return 'C';

  const words = companyName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};


// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function Clients() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedClient, setSelectedClient] = useState(null);

  const [activeTab, setActiveTab] = useState('clients');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editingClient, setEditingClient] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [notesForm, setNotesForm] = useState('');

  // ---------------------------------------------------------------------------
  // Clear notifications
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);


  // ---------------------------------------------------------------------------
  // Load clients from Supabase
  // ---------------------------------------------------------------------------

  const loadClients = async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        setClients([]);
        setError('You must be logged in to view your clients.');
        return;
      }

      const {
        data,
        error: fetchError,
      } = await supabase
        .from('clients')
        .select(`
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
        `)
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);

      setClients([]);

      setError(
        err?.message ||
          'Unable to load clients. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadClients();
  }, []);


  // ---------------------------------------------------------------------------
  // Filter clients
  // ---------------------------------------------------------------------------

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !query ||
        (client.company_name || '')
          .toLowerCase()
          .includes(query) ||
        (client.contact_name || '')
          .toLowerCase()
          .includes(query) ||
        (client.email || '')
          .toLowerCase()
          .includes(query) ||
        (client.phone || '')
          .toLowerCase()
          .includes(query) ||
        (client.notes || '')
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);


  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    return {
      total: clients.length,

      active: clients.filter(
        (client) => client.status === 'active'
      ).length,

      pending: clients.filter(
        (client) => client.status === 'pending'
      ).length,

      inactive: clients.filter(
        (client) => client.status === 'inactive'
      ).length,
    };
  }, [clients]);


  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  const resetForm = () => {
    setForm(emptyForm);
    setEditingClient(null);
  };


  // ---------------------------------------------------------------------------
  // Add client
  // ---------------------------------------------------------------------------

  const openAdd = () => {
    resetForm();
    setError('');
    setIsAddOpen(true);
  };


  const addClient = async () => {
    if (!form.company_name.trim()) {
      setError('Company name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          'You must be logged in to add a client.'
        );
      }

      const payload = {
        user_id: user.id,
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        status: form.status || 'active',
        notes: form.notes.trim() || null,
      };

      const {
        data,
        error: insertError,
      } = await supabase
        .from('clients')
        .insert(payload)
        .select(`
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
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      setClients((previous) => [
        data,
        ...previous,
      ]);

      setIsAddOpen(false);

      resetForm();

      setSuccessMessage(
        `${data.company_name} was added successfully.`
      );
    } catch (err) {
      console.error('Error adding client:', err);

      setError(
        err?.message ||
          'Unable to add client.'
      );
    } finally {
      setSaving(false);
    }
  };


  // ---------------------------------------------------------------------------
  // Edit client
  // ---------------------------------------------------------------------------

  const openEdit = (client) => {
    setEditingClient(client);

    setForm({
      company_name: client.company_name || '',
      contact_name: client.contact_name || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'active',
      notes: client.notes || '',
    });

    setError('');
    setIsEditOpen(true);
  };


  const updateClient = async () => {
    if (!editingClient) return;

    if (!form.company_name.trim()) {
      setError('Company name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          'You must be logged in to edit a client.'
        );
      }

      const payload = {
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        status: form.status || 'active',
        notes: form.notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const {
        data,
        error: updateError,
      } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', editingClient.id)
        .eq('user_id', user.id)
        .select(`
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
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      setClients((previous) =>
        previous.map((client) =>
          client.id === data.id
            ? data
            : client
        )
      );

      if (
        selectedClient &&
        selectedClient.id === data.id
      ) {
        setSelectedClient(data);
      }

      setIsEditOpen(false);

      resetForm();

      setSuccessMessage(
        `${data.company_name} was updated successfully.`
      );
    } catch (err) {
      console.error('Error updating client:', err);

      setError(
        err?.message ||
          'Unable to update client.'
      );
    } finally {
      setSaving(false);
    }
  };


  // ---------------------------------------------------------------------------
  // Delete client
  // ---------------------------------------------------------------------------

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setError('');
    setIsDeleteOpen(true);
  };


  const deleteClient = async () => {
    if (!clientToDelete) return;

    setDeleting(true);
    setError('');

    try {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          'You must be logged in to delete a client.'
        );
      }

      const {
        error: deleteError,
      } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientToDelete.id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setClients((previous) =>
        previous.filter(
          (client) =>
            client.id !== clientToDelete.id
        )
      );

      if (
        selectedClient &&
        selectedClient.id === clientToDelete.id
      ) {
        setSelectedClient(null);
      }

      setSuccessMessage(
        `${clientToDelete.company_name} was deleted.`
      );

      setClientToDelete(null);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error('Error deleting client:', err);

      setError(
        err?.message ||
          'Unable to delete client.'
      );
    } finally {
      setDeleting(false);
    }
  };


  // ---------------------------------------------------------------------------
  // Update notes
  // ---------------------------------------------------------------------------

  const saveNotes = async () => {
    if (!selectedClient) return;

    setSaving(true);
    setError('');

    try {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          'You must be logged in to update notes.'
        );
      }

      const {
        data,
        error: updateError,
      } = await supabase
        .from('clients')
        .update({
          notes: notesForm.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedClient.id)
        .eq('user_id', user.id)
        .select(`
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
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      setClients((previous) =>
        previous.map((client) =>
          client.id === data.id
            ? data
            : client
        )
      );

      setSelectedClient(data);

      setSuccessMessage('Notes saved successfully.');
    } catch (err) {
      console.error('Error saving notes:', err);

      setError(
        err?.message ||
          'Unable to save notes.'
      );
    } finally {
      setSaving(false);
    }
  };


  // ---------------------------------------------------------------------------
  // Open client details
  // ---------------------------------------------------------------------------

  const openClient = (client) => {
    setSelectedClient(client);
    setNotesForm(client.notes || '');
    setError('');
  };


  const closeClient = () => {
    setSelectedClient(null);
    setNotesForm('');
  };


  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() =>
            setSidebarCollapsed(
              !sidebarCollapsed
            )
          }
        />

        <main
          className={`transition-all duration-300 ${
            sidebarCollapsed
              ? 'ml-20'
              : 'ml-64'
          }`}
        >
          <TopBar
            title="Client Management"
            subtitle="Manage your clients"
          />

          <div className="p-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />

                  <p className="text-gray-500">
                    Loading clients...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }


  // ---------------------------------------------------------------------------
  // Detail view
  // ---------------------------------------------------------------------------

  if (selectedClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() =>
            setSidebarCollapsed(
              !sidebarCollapsed
            )
          }
        />

        <main
          className={`transition-all duration-300 ${
            sidebarCollapsed
              ? 'ml-20'
              : 'ml-64'
          }`}
        >
          <TopBar
            title="Client Management"
            subtitle="Client details"
          />

          <div className="p-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />

                <p className="text-sm">
                  {error}
                </p>

                <button
                  className="ml-auto"
                  onClick={() => setError('')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                <CheckCircle2 className="w-5 h-5" />

                <p className="text-sm">
                  {successMessage}
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedClient.id}
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={closeClient}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-red-600" />
                      </div>

                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-2xl font-bold">
                            {selectedClient.company_name}
                          </h2>

                          <Badge
                            className={getStatusClasses(
                              selectedClient.status
                            )}
                          >
                            {selectedClient.status}
                          </Badge>
                        </div>

                        <p className="text-gray-500 mt-1">
                          Client since{' '}
                          {formatDate(
                            selectedClient.created_at
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        openEdit(selectedClient)
                      }
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() =>
                        confirmDelete(selectedClient)
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>


                {/* Detail Tabs */}
                <Tabs
                  defaultValue="overview"
                  className="w-full"
                >
                  <TabsList className="bg-white border">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                    >
                      Overview
                    </TabsTrigger>

                    <TabsTrigger
                      value="notes"
                      className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                    >
                      <StickyNote className="w-4 h-4 mr-1" />
                      Notes
                    </TabsTrigger>
                  </TabsList>


                  {/* Overview */}
                  <TabsContent
                    value="overview"
                    className="mt-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                      {/* Company information */}
                      <Card className="border-0 shadow-sm lg:col-span-2">
                        <CardHeader>
                          <CardTitle>
                            Company Information
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          <div>
                            <p className="text-sm text-gray-500">
                              Company Name
                            </p>

                            <p className="font-semibold mt-1">
                              {selectedClient.company_name}
                            </p>
                          </div>


                          <div>
                            <p className="text-sm text-gray-500">
                              Status
                            </p>

                            <div className="mt-1">
                              <Badge
                                className={getStatusClasses(
                                  selectedClient.status
                                )}
                              >
                                {selectedClient.status}
                              </Badge>
                            </div>
                          </div>


                          <div>
                            <p className="text-sm text-gray-500">
                              Primary Contact
                            </p>

                            <p className="font-medium mt-1">
                              {selectedClient.contact_name ||
                                '—'}
                            </p>
                          </div>


                          <div>
                            <p className="text-sm text-gray-500">
                              Email
                            </p>

                            {selectedClient.email ? (
                              <a
                                href={`mailto:${selectedClient.email}`}
                                className="font-medium mt-1 flex items-center gap-2 text-red-600 hover:underline"
                              >
                                <Mail className="w-4 h-4" />
                                {selectedClient.email}
                              </a>
                            ) : (
                              <p className="font-medium mt-1">
                                —
                              </p>
                            )}
                          </div>


                          <div>
                            <p className="text-sm text-gray-500">
                              Phone
                            </p>

                            {selectedClient.phone ? (
                              <a
                                href={`tel:${selectedClient.phone}`}
                                className="font-medium mt-1 flex items-center gap-2 text-red-600 hover:underline"
                              >
                                <Phone className="w-4 h-4" />
                                {selectedClient.phone}
                              </a>
                            ) : (
                              <p className="font-medium mt-1">
                                —
                              </p>
                            )}
                          </div>


                          <div>
                            <p className="text-sm text-gray-500">
                              Created
                            </p>

                            <p className="font-medium mt-1">
                              {formatDateTime(
                                selectedClient.created_at
                              )}
                            </p>
                          </div>


                          <div>
                            <p className="text-sm text-gray-500">
                              Last Updated
                            </p>

                            <p className="font-medium mt-1">
                              {formatDateTime(
                                selectedClient.updated_at
                              )}
                            </p>
                          </div>

                        </CardContent>
                      </Card>


                      {/* Client summary */}
                      <Card className="border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle>
                            Client Summary
                          </CardTitle>
                        </CardHeader>

                        <CardContent>
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                            <span className="text-2xl font-bold text-red-600">
                              {getInitials(
                                selectedClient.company_name
                              )}
                            </span>
                          </div>

                          <h3 className="text-center text-lg font-bold">
                            {selectedClient.company_name}
                          </h3>

                          <p className="text-center text-sm text-gray-500 mt-1">
                            {selectedClient.contact_name ||
                              'No contact assigned'}
                          </p>

                          <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                              <span className="text-sm text-gray-500">
                                Status
                              </span>

                              <Badge
                                className={getStatusClasses(
                                  selectedClient.status
                                )}
                              >
                                {selectedClient.status}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                              <span className="text-sm text-gray-500">
                                Created
                              </span>

                              <span className="text-sm font-medium">
                                {formatDate(
                                  selectedClient.created_at
                                )}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                    </div>
                  </TabsContent>


                  {/* Notes */}
                  <TabsContent
                    value="notes"
                    className="mt-6"
                  >
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>
                          Client Notes
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <Textarea
                          placeholder="Add notes about this client..."
                          value={notesForm}
                          onChange={(e) =>
                            setNotesForm(
                              e.target.value
                            )
                          }
                          className="min-h-[180px]"
                        />

                        <div className="flex justify-end">
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={saveNotes}
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Notes
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                </Tabs>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Edit Dialog */}
        <ClientFormDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          title="Edit Client"
          form={form}
          updateForm={updateForm}
          onSubmit={updateClient}
          saving={saving}
          submitLabel="Save Changes"
        />

        {/* Delete Dialog */}
        <DeleteDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          client={clientToDelete}
          onDelete={deleteClient}
          deleting={deleting}
        />
      </div>
    );
  }


  // ---------------------------------------------------------------------------
  // Main client list
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed(
            !sidebarCollapsed
          )
        }
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed
            ? 'ml-20'
            : 'ml-64'
        }`}
      >
        <TopBar
          title="Client Management"
          subtitle="Manage your clients"
        />

        <div className="p-8">

          {/* Notifications */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />

              <div className="flex-1">
                <p className="text-sm font-medium">
                  {error}
                </p>
              </div>

              <button
                onClick={() => setError('')}
                className="hover:opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}


          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              <CheckCircle2 className="w-5 h-5" />

              <p className="text-sm font-medium">
                {successMessage}
              </p>
            </div>
          )}


          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

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
                  <AlertCircle className="w-6 h-6" />
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
                  <Building2 className="w-6 h-6" />
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


          {/* Header */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Clients
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {clients.length === 0
                  ? 'No clients in your database yet.'
                  : `${clients.length} client${clients.length === 1 ? '' : 's'} in your database`}
              </p>
            </div>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
              onClick={openAdd}
            >
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </div>


          {/* Search/filter */}
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 flex-wrap">

                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <Input
                    placeholder="Search company, contact, email, phone..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
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
                      All Status
                    </SelectItem>

                    {STATUS_OPTIONS.map(
                      (status) => (
                        <SelectItem
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>


                <Button
                  variant="outline"
                  onClick={loadClients}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loading
                        ? 'animate-spin'
                        : ''
                    }`}
                  />
                </Button>

              </div>
            </CardContent>
          </Card>


          {/* Client list */}
          <AnimatePresence mode="wait">

            {filteredClients.length === 0 ? (
              <motion.div
                key="empty"
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">

                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                      {clients.length === 0
                        ? 'No clients yet'
                        : 'No clients found'}
                    </h3>

                    <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                      {clients.length === 0
                        ? 'Your client records will appear here once you add them. This page is connected directly to your Supabase clients table.'
                        : 'Try changing your search or status filter.'}
                    </p>

                    {clients.length === 0 && (
                      <Button
                        className="mt-6 bg-red-600 hover:bg-red-700"
                        onClick={openAdd}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Client
                      </Button>
                    )}

                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="clients"
                className="space-y-4"
              >
                {filteredClients.map(
                  (client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.03,
                      }}
                    >
                      <ClientCard
                        client={client}
                        onView={() =>
                          openClient(client)
                        }
                        onEdit={() =>
                          openEdit(client)
                        }
                        onDelete={() =>
                          confirmDelete(client)
                        }
                      />
                    </motion.div>
                  )
                )}
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>


      {/* Add Dialog */}
      <ClientFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add New Client"
        form={form}
        updateForm={updateForm}
        onSubmit={addClient}
        saving={saving}
        submitLabel="Add Client"
      />


      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        client={clientToDelete}
        onDelete={deleteClient}
        deleting={deleting}
      />

    </div>
  );
}


// =============================================================================
// Client Card
// =============================================================================

function ClientCard({
  client,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">

        <div className="flex items-start gap-5">

          {/* Logo */}
          <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-red-600">
              {getInitials(client.company_name)}
            </span>
          </div>


          {/* Main */}
          <div className="flex-1 min-w-0">

            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900">
                {client.company_name}
              </h3>

              <Badge
                className={getStatusClasses(
                  client.status
                )}
              >
                {client.status}
              </Badge>
            </div>


            <div className="mt-2 space-y-1">

              {client.contact_name && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    Contact:
                  </span>{' '}
                  {client.contact_name}
                </p>
              )}


              <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500">

                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-1 hover:text-red-600"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </a>
                )}


                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-1 hover:text-red-600"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </a>
                )}

              </div>

            </div>


            {client.notes && (
              <p className="mt-4 text-sm text-gray-500 line-clamp-2">
                <span className="font-medium">
                  Notes:
                </span>{' '}
                {client.notes}
              </p>
            )}


            <div className="mt-5 text-xs text-gray-400">
              Created{' '}
              {formatDate(
                client.created_at
              )}
              {' · '}
              Updated{' '}
              {formatDate(
                client.updated_at
              )}
            </div>

          </div>


          {/* Actions */}
          <div
            className="flex flex-col gap-2"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onView}
            >
              View
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
                  onClick={onView}
                >
                  View Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={onEdit}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Client
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Client
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>

          </div>

        </div>

      </CardContent>
    </Card>
  );
}


// =============================================================================
// Client Form Dialog
// =============================================================================

function ClientFormDialog({
  open,
  onOpenChange,
  title,
  form,
  updateForm,
  onSubmit,
  saving,
  submitLabel,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-lg">

        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
        </DialogHeader>


        <div className="grid gap-5 py-4">

          <div className="grid gap-2">
            <Label>
              Company Name *
            </Label>

            <Input
              value={form.company_name}
              onChange={(e) =>
                updateForm(
                  'company_name',
                  e.target.value
                )
              }
              placeholder="e.g. Acme Corporation"
              autoFocus
            />
          </div>


          <div className="grid gap-2">
            <Label>
              Primary Contact
            </Label>

            <Input
              value={form.contact_name}
              onChange={(e) =>
                updateForm(
                  'contact_name',
                  e.target.value
                )
              }
              placeholder="Contact person's name"
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="grid gap-2">
              <Label>
                Email
              </Label>

              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateForm(
                    'email',
                    e.target.value
                  )
                }
                placeholder="name@company.co.za"
              />
            </div>


            <div className="grid gap-2">
              <Label>
                Phone
              </Label>

              <Input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  updateForm(
                    'phone',
                    e.target.value
                  )
                }
                placeholder="+27..."
              />
            </div>

          </div>


          <div className="grid gap-2">
            <Label>
              Status
            </Label>

            <Select
              value={form.status}
              onValueChange={(value) =>
                updateForm(
                  'status',
                  value
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {STATUS_OPTIONS.map(
                  (status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                    >
                      {status.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>


          <div className="grid gap-2">
            <Label>
              Notes
            </Label>

            <Textarea
              value={form.notes}
              onChange={(e) =>
                updateForm(
                  'notes',
                  e.target.value
                )
              }
              placeholder="Add any notes about this client..."
              className="min-h-[120px]"
            />
          </div>

        </div>


        <DialogFooter>

          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}


// =============================================================================
// Delete Dialog
// =============================================================================

function DeleteDialog({
  open,
  onOpenChange,
  client,
  onDelete,
  deleting,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            Delete Client
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">

          <p className="text-gray-600">
            Are you sure you want to delete{' '}
            <strong className="text-gray-900">
              {client?.company_name}
            </strong>
            ?
          </p>

          <p className="text-sm text-gray-500 mt-2">
            This will permanently remove the
            client from your database.
          </p>

        </div>


        <DialogFooter>

          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Client
              </>
            )}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
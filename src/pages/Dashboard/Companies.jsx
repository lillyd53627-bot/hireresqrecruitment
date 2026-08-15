// src/pages/Dashboard/Companies.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Briefcase,
  Users,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

import Sidebar from "@/components/Dashboard/Sidebar";
import TopBar from "@/components/Dashboard/TopBar";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEFAULT_CLIENTS = [
  {
    id: 1,
    name: "TechCorp SA",
    industry: "Technology",
    location: "Cape Town",
    contact: "John Smith",
    email: "john@techcorp.co.za",
    phone: "+27 21 123 4567",
    website: "techcorp.co.za",
    status: "active",
    activeJobs: 5,
    totalHires: 12,
    revenue: "R450,000",
    lastContact: "2 days ago",
  },
  {
    id: 2,
    name: "FinanceHub",
    industry: "Finance",
    location: "Johannesburg",
    contact: "Sarah Johnson",
    email: "sarah@financehub.co.za",
    phone: "+27 11 234 5678",
    website: "financehub.co.za",
    status: "active",
    activeJobs: 3,
    totalHires: 8,
    revenue: "R280,000",
    lastContact: "1 week ago",
  },
  {
    id: 3,
    name: "RetailMax",
    industry: "Retail",
    location: "Durban",
    contact: "Michael Chen",
    email: "michael@retailmax.co.za",
    phone: "+27 31 345 6789",
    website: "retailmax.co.za",
    status: "pending",
    activeJobs: 0,
    totalHires: 0,
    revenue: "R0",
    lastContact: "3 days ago",
  },
];

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "R0";
  }

  const number =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/[^\d.-]/g, ""));

  if (Number.isNaN(number)) {
    return "R0";
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(number);
};

const getStatusClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700";

    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "inactive":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function Companies() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newClient, setNewClient] = useState({
    name: "",
    industry: "",
    location: "",
    contact: "",
    email: "",
    phone: "",
    website: "",
    status: "active",
    activeJobs: 0,
    totalHires: 0,
    revenue: "R0",
    lastContact: "Just now",
  });

  // =========================================================
  // LOAD CLIENTS
  // =========================================================

  useEffect(() => {
    const loadClients = () => {
      try {
        const saved = localStorage.getItem("crm_clients");

        if (saved) {
          const parsed = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            setClients(parsed);
            return;
          }
        }

        setClients(DEFAULT_CLIENTS);
        localStorage.setItem(
          "crm_clients",
          JSON.stringify(DEFAULT_CLIENTS)
        );
      } catch (error) {
        console.error("Could not load clients:", error);
        setClients(DEFAULT_CLIENTS);
      }
    };

    loadClients();

    const handleStorage = (event) => {
      if (event.key === "crm_clients") {
        loadClients();
      }
    };

    const handleCrmUpdate = () => {
      loadClients();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("crm-data-updated", handleCrmUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "crm-data-updated",
        handleCrmUpdate
      );
    };
  }, []);

  // =========================================================
  // SAVE CLIENTS
  // =========================================================

  const saveClients = (updatedClients) => {
    setClients(updatedClients);

    try {
      localStorage.setItem(
        "crm_clients",
        JSON.stringify(updatedClients)
      );

      window.dispatchEvent(new Event("crm-data-updated"));
    } catch (error) {
      console.error("Could not save clients:", error);
    }
  };

  // =========================================================
  // FILTER CLIENTS
  // =========================================================

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !query ||
        String(client.name || "")
          .toLowerCase()
          .includes(query) ||
        String(client.industry || "")
          .toLowerCase()
          .includes(query) ||
        String(client.location || "")
          .toLowerCase()
          .includes(query) ||
        String(client.contact || "")
          .toLowerCase()
          .includes(query) ||
        String(client.email || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        String(client.status || "").toLowerCase() ===
          statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const active = clients.filter(
      (client) =>
        String(client.status || "").toLowerCase() === "active"
    ).length;

    const pending = clients.filter(
      (client) =>
        String(client.status || "").toLowerCase() === "pending"
    ).length;

    const activeJobs = clients.reduce(
      (total, client) =>
        total + Number(client.activeJobs || 0),
      0
    );

    const totalHires = clients.reduce(
      (total, client) =>
        total + Number(client.totalHires || 0),
      0
    );

    const totalRevenue = clients.reduce((total, client) => {
      const value = parseFloat(
        String(client.revenue || "").replace(/[^\d.-]/g, "")
      );

      return total + (Number.isNaN(value) ? 0 : value);
    }, 0);

    return {
      total: clients.length,
      active,
      pending,
      activeJobs,
      totalHires,
      totalRevenue,
    };
  }, [clients]);

  // =========================================================
  // ADD CLIENT
  // =========================================================

  const handleAddClient = (event) => {
    event.preventDefault();

    if (!newClient.name.trim()) {
      return;
    }

    const client = {
      ...newClient,
      id: Date.now(),
      name: newClient.name.trim(),
      industry: newClient.industry.trim(),
      location: newClient.location.trim(),
      contact: newClient.contact.trim(),
      email: newClient.email.trim(),
      phone: newClient.phone.trim(),
      website: newClient.website.trim(),
    };

    saveClients([client, ...clients]);

    setNewClient({
      name: "",
      industry: "",
      location: "",
      contact: "",
      email: "",
      phone: "",
      website: "",
      status: "active",
      activeJobs: 0,
      totalHires: 0,
      revenue: "R0",
      lastContact: "Just now",
    });

    setShowAddForm(false);
  };

  // =========================================================
  // DELETE CLIENT
  // =========================================================

  const handleDeleteClient = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmed) {
      return;
    }

    const updated = clients.filter(
      (client) => client.id !== id
    );

    saveClients(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed(!sidebarCollapsed)
        }
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-56"
        }`}
      >
        <TopBar
          title="Companies"
          subtitle="Manage your recruitment clients"
        />

        <div className="p-8 space-y-6">
          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Client CRM
              </h1>

              <p className="text-gray-500 mt-1">
                Manage companies, contacts and recruitment
                activity.
              </p>
            </div>

            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </div>

          {/* =================================================
              STAT CARDS
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      {statistics.total}
                    </p>

                    <p className="text-sm text-gray-500">
                      Total Companies
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      {statistics.active}
                    </p>

                    <p className="text-sm text-gray-500">
                      Active Clients
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      {statistics.activeJobs}
                    </p>

                    <p className="text-sm text-gray-500">
                      Active Jobs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="text-xl font-bold">
                      {formatCurrency(
                        statistics.totalRevenue
                      )}
                    </p>

                    <p className="text-sm text-gray-500">
                      Client Revenue
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* =================================================
              ADD COMPANY FORM
          ================================================== */}

          {showAddForm && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Add New Company</CardTitle>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={handleAddClient}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <input
                    type="text"
                    placeholder="Company name *"
                    value={newClient.name}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        name: event.target.value,
                      })
                    }
                    className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Industry"
                    value={newClient.industry}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        industry: event.target.value,
                      })
                    }
                    className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-red-500"
                  />

                  <input
                    type="text"
                    placeholder="Location"
                    value={newClient.location}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        location: event.target.value,
                      })
                    }
                    className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-red-500"
                  />

                  <input
                    type="text"
                    placeholder="Contact person"
                    value={newClient.contact}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        contact: event.target.value,
                      })
                    }
                    className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-red-500"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={newClient.email}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        email: event.target.value,
                      })
                    }
                    className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-red-500"
                  />

                  <input
                    type="text"
                    placeholder="Phone"
                    value={newClient.phone}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        phone: event.target.value,
                      })
                    }
                    className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-red-500"
                  />

                  <input
                    type="text"
                    placeholder="Website"
                    value={newClient.website}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        website: event.target.value,
                      })
                    }
                    className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-red-500"
                  />

                  <select
                    value={newClient.status}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        status: event.target.value,
                      })
                    }
                    className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Save Company
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setShowAddForm(false)
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* =================================================
              SEARCH / FILTER
          ================================================== */}

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="text"
                    placeholder="Search companies, contacts, industries..."
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    className="w-full h-10 rounded-lg border pl-10 pr-3 outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-10 rounded-lg border px-3 outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">
                    All Statuses
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* =================================================
              COMPANY LIST
          ================================================== */}

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>
                Companies ({filteredClients.length})
              </CardTitle>
            </CardHeader>

            <CardContent>
              {filteredClients.length === 0 ? (
                <div className="py-12 text-center">
                  <Building2 className="w-10 h-10 mx-auto text-gray-300" />

                  <p className="mt-3 text-gray-500">
                    No companies found.
                  </p>

                  <Button
                    className="mt-4 bg-red-600 hover:bg-red-700"
                    onClick={() =>
                      setShowAddForm(true)
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="border rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Company */}
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">
                                {client.name}
                              </h3>

                              <Badge
                                className={getStatusClass(
                                  client.status
                                )}
                              >
                                {client.status ||
                                  "active"}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                              {client.industry ||
                                "Industry not specified"}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                              {client.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {client.location}
                                </span>
                              )}

                              {client.contact && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {client.contact}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-5 text-center">
                          <div>
                            <p className="text-lg font-bold">
                              {client.activeJobs || 0}
                            </p>

                            <p className="text-xs text-gray-500">
                              Jobs
                            </p>
                          </div>

                          <div>
                            <p className="text-lg font-bold">
                              {client.totalHires || 0}
                            </p>

                            <p className="text-xs text-gray-500">
                              Hires
                            </p>
                          </div>

                          <div>
                            <p className="text-lg font-bold">
                              {formatCurrency(
                                client.revenue
                              )}
                            </p>

                            <p className="text-xs text-gray-500">
                              Revenue
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {client.email && (
                            <Button
                              variant="outline"
                              size="icon"
                              title="Email"
                              onClick={() =>
                                (window.location.href = `mailto:${client.email}`)
                              }
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}

                          {client.phone && (
                            <Button
                              variant="outline"
                              size="icon"
                              title="Call"
                              onClick={() =>
                                (window.location.href = `tel:${client.phone}`)
                              }
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="icon"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            title="Delete"
                            onClick={() =>
                              handleDeleteClient(
                                client.id
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            title="More"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="text-center text-xs text-gray-400">
            {statistics.total} companies ·{" "}
            {statistics.active} active ·{" "}
            {statistics.pending} pending
          </div>
        </div>
      </main>
    </div>
  );
}
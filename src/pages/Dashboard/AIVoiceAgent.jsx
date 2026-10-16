// src/pages/Dashboard/AIVoiceAgent.jsx

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  PhoneCall,
  Play,
  Pause,
  Plus,
  Users,
  Calendar,
  Loader2,
  X,
  UserPlus,
  Rocket,
} from "lucide-react";

export default function AIVoiceAgent() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    connected: 0,
    qualified: 0,
    appointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Modals
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showAddLeads, setShowAddLeads] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [saving, setSaving] = useState(false);

  // Forms
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    industry: "",
    location: "",
    vacancy_keywords: "",
  });

  const [leadForm, setLeadForm] = useState({
    company_name: "",
    contact_name: "",
    phone: "",
    email: "",
    vacancy_title: "",
    location: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data: agentData } = await supabase
        .from("ai_agent_settings")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();
      setAgent(agentData);

      const { data: campaignData } = await supabase
        .from("ai_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      setCampaigns(campaignData || []);

      const { count: totalCalls } = await supabase
        .from("ai_calls")
        .select("*", { count: "exact", head: true });

      const { count: connected } = await supabase
        .from("ai_calls")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      const { count: qualified } = await supabase
        .from("ai_calls")
        .select("*", { count: "exact", head: true })
        .eq("outcome", "qualified");

      const { count: appointments } = await supabase
        .from("ai_calls")
        .select("*", { count: "exact", head: true })
        .eq("appointment_booked", true);

      setStats({
        totalCalls: totalCalls || 0,
        connected: connected || 0,
        qualified: qualified || 0,
        appointments: appointments || 0,
      });
    } catch (err) {
      console.error("Failed to load Voice Agent data:", err);
    }
    setLoading(false);
  }

  // --------------------------------------------------
  // Dial Next Lead (calls the Edge Function)
  // --------------------------------------------------
  async function processNextCall() {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("voice-dial-next");

      if (error) throw error;

      if (data?.call) {
        alert(
          `Call prepared for ${data.lead?.contact_name || data.lead?.phone}\n\n${data.message || ""}`
        );
      } else {
        alert(data?.message || "No leads ready to call");
      }

      loadData();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to process next call");
    } finally {
      setProcessing(false);
    }
  }

  // --------------------------------------------------
  // Create Campaign
  // --------------------------------------------------
  async function createCampaign(e) {
    e.preventDefault();
    if (!campaignForm.name.trim()) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("ai_campaigns")
        .insert({
          name: campaignForm.name.trim(),
          description: campaignForm.description || null,
          industry: campaignForm.industry || null,
          location: campaignForm.location || null,
          vacancy_keywords: campaignForm.vacancy_keywords
            ? campaignForm.vacancy_keywords.split(",").map((s) => s.trim())
            : [],
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      setCampaigns((prev) => [data, ...prev]);
      setShowNewCampaign(false);
      setCampaignForm({
        name: "",
        description: "",
        industry: "",
        location: "",
        vacancy_keywords: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Add Lead to Campaign
  // --------------------------------------------------
  async function addLead(e) {
    e.preventDefault();
    if (!selectedCampaign || !leadForm.phone.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("ai_campaign_leads").insert({
        campaign_id: selectedCampaign.id,
        company_name: leadForm.company_name || null,
        contact_name: leadForm.contact_name || null,
        phone: leadForm.phone.trim(),
        email: leadForm.email || null,
        vacancy_title: leadForm.vacancy_title || null,
        location: leadForm.location || null,
        status: "pending",
      });

      if (error) throw error;

      // Update total_leads count
      await supabase
        .from("ai_campaigns")
        .update({
          total_leads: (selectedCampaign.total_leads || 0) + 1,
        })
        .eq("id", selectedCampaign.id);

      setLeadForm({
        company_name: "",
        contact_name: "",
        phone: "",
        email: "",
        vacancy_title: "",
        location: "",
      });

      await loadData();
      alert("Lead added successfully");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add lead");
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Launch / Pause Campaign
  // --------------------------------------------------
  async function toggleCampaignStatus(campaign) {
    const newStatus = campaign.status === "active" ? "paused" : "active";

    const updates = { status: newStatus };
    if (newStatus === "active" && !campaign.started_at) {
      updates.started_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("ai_campaigns")
      .update(updates)
      .eq("id", campaign.id);

    if (error) {
      alert(error.message);
      return;
    }

    // When launching, move pending leads to queued
    if (newStatus === "active") {
      await supabase
        .from("ai_campaign_leads")
        .update({ status: "queued" })
        .eq("campaign_id", campaign.id)
        .eq("status", "pending");
    }

    loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <PhoneCall className="w-7 h-7 text-red-600" />
            HireResQ Voice AI
          </h1>
          <p className="text-gray-500 mt-1">
            Outbound prospecting agent • {agent?.name || "Sarah"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Agent Online
          </div>

          <button
            onClick={processNextCall}
            disabled={processing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dialling...
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4" />
                Dial Next Lead
              </>
            )}
          </button>

          <button
            onClick={() => setShowNewCampaign(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Calls"
          value={stats.totalCalls}
          icon={<PhoneCall className="w-5 h-5" />}
        />
        <StatCard
          label="Connected"
          value={stats.connected}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Qualified"
          value={stats.qualified}
          icon={<Play className="w-5 h-5" />}
        />
        <StatCard
          label="Appointments"
          value={stats.appointments}
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      {/* How it works */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-8 text-sm text-red-900">
        <p className="font-semibold mb-1">How to start making calls:</p>
        <ol className="list-decimal list-inside space-y-1 text-red-800">
          <li>Create a new campaign</li>
          <li>Add leads (phone numbers) to the campaign</li>
          <li>Click <strong>Launch</strong> on the campaign</li>
          <li>Click <strong>Dial Next Lead</strong> to process the queue</li>
        </ol>
      </div>

      {/* Campaigns */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Campaigns</h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <PhoneCall className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No campaigns yet</p>
            <p className="text-sm mt-1 mb-4">
              Create your first outbound campaign to start calling leads.
            </p>
            <button
              onClick={() => setShowNewCampaign(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {campaign.total_leads || 0} leads • {campaign.calls_made || 0} calls •{" "}
                    {campaign.qualified || 0} qualified
                    {campaign.location && ` • ${campaign.location}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setShowAddLeads(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Leads
                  </button>

                  <button
                    onClick={() => toggleCampaignStatus(campaign)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-white ${
                      campaign.status === "active"
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {campaign.status === "active" ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Launch
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== NEW CAMPAIGN MODAL ========== */}
      {showNewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">New Campaign</h3>
              <button onClick={() => setShowNewCampaign(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={createCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name *</label>
                <input
                  required
                  value={campaignForm.name}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="e.g. Cape Town Accountants"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) =>
                    setCampaignForm({ ...campaignForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <input
                    value={campaignForm.industry}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, industry: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Accounting / Finance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    value={campaignForm.location}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Cape Town"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Vacancy Keywords (comma separated)
                </label>
                <input
                  value={campaignForm.vacancy_keywords}
                  onChange={(e) =>
                    setCampaignForm({
                      ...campaignForm,
                      vacancy_keywords: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Accountant, Financial Manager"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCampaign(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== ADD LEADS MODAL ========== */}
      {showAddLeads && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="font-semibold text-lg">Add Lead</h3>
                <p className="text-sm text-gray-500">{selectedCampaign.name}</p>
              </div>
              <button onClick={() => setShowAddLeads(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={addLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  required
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="082 123 4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Name</label>
                  <input
                    value={leadForm.contact_name}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, contact_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    value={leadForm.company_name}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, company_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vacancy Title</label>
                <input
                  value={leadForm.vacancy_title}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, vacancy_title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Senior Accountant"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    value={leadForm.location}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeads(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  {saving ? "Adding..." : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-2 bg-red-50 text-red-600 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}
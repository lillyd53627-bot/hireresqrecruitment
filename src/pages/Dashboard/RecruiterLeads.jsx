import React, { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/lib/supabase";

const STATUS_COLORS = {
  new: "bg-gray-100 text-gray-700",
  contacted: "bg-blue-100 text-blue-700",
  interested: "bg-indigo-100 text-indigo-700",
  qualified: "bg-purple-100 text-purple-700",
  "vacancy opened": "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const LEAD_STATUSES = [
  "new",
  "contacted",
  "interested",
  "qualified",
  "vacancy opened",
  "converted",
  "lost",
];

export default function RecruiterLeads() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadOpen, setLeadOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [leadForm, setLeadForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    industry: "",
    location: "",
    notes: "",
    status: "new",
  });

  useEffect(() => {
    let mounted = true;
    const initialise = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!mounted) return;
        if (!currentUser) { navigate("/login"); return; }

        const { data: p, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", currentUser.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (p?.role !== "recruiter" && p?.role !== "admin") {
          navigate("/dashboard");
          return;
        }

        setUser(currentUser);
        await loadLeads(currentUser.id);
        if (mounted) setLoading(false);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err.message || "Unable to load leads.");
          setLoading(false);
        }
      }
    };
    initialise();
    return () => { mounted = false; };
  }, [navigate]);

  const loadLeads = useCallback(async (recruiterId) => {
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("recruiter_leads")
        .select("*")
        .eq("recruiter_id", recruiterId)
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setLeads(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load leads.");
    }
  }, []);

  const saveLead = async () => {
    if (!user || !leadForm.company_name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("recruiter_leads")
        .insert({
          recruiter_id: user.id,
          company_name: leadForm.company_name.trim(),
          contact_name: leadForm.contact_name || null,
          email: leadForm.email || null,
          phone: leadForm.phone || null,
          industry: leadForm.industry || null,
          location: leadForm.location || null,
          notes: leadForm.notes || null,
          status: leadForm.status || "new",
        })
        .select()
        .single();
      if (insertError) throw insertError;
      setLeads((prev) => [data, ...prev]);
      setLeadOpen(false);
      setLeadForm({
        company_name: "", contact_name: "", email: "", phone: "",
        industry: "", location: "", notes: "", status: "new",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    if (!user) return;
    try {
      const { error: updateError } = await supabase
        .from("recruiter_leads")
        .update({ status: newStatus })
        .eq("id", leadId)
        .eq("recruiter_id", user.id);
      if (updateError) throw updateError;
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            Companies and hiring opportunities you have introduced to HireResQ.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => user && loadLeads(user.id)}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 gap-2" onClick={() => setLeadOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError(null)} className="text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {leads.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-lg">No leads yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Register companies and hiring contacts you introduce to HireResQ.
            </p>
            <Button className="mt-6 bg-red-600 hover:bg-red-700" onClick={() => setLeadOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Lead
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {leads.map((lead) => (
          <Card key={lead.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-lg text-gray-900">{lead.company_name}</p>
                    <Badge className={STATUS_COLORS[lead.status] || STATUS_COLORS.new}>
                      {lead.status || "new"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    {lead.contact_name && <span>{lead.contact_name}</span>}
                    {lead.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />{lead.email}
                      </span>
                    )}
                    {lead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />{lead.phone}
                      </span>
                    )}
                    {lead.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />{lead.location}
                      </span>
                    )}
                    {lead.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(lead.created_at).toLocaleDateString("en-ZA")}
                      </span>
                    )}
                  </div>
                  {lead.notes && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{lead.notes}</p>
                  )}
                </div>
                <div className="shrink-0">
                  <Select
                    value={lead.status || "new"}
                    onValueChange={(value) => updateLeadStatus(lead.id, value)}
                  >
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" />
              Add Client Lead
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Company name *</Label>
              <Input
                value={leadForm.company_name}
                onChange={(e) => setLeadForm((f) => ({ ...f, company_name: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label>Contact name</Label>
              <Input
                value={leadForm.contact_name}
                onChange={(e) => setLeadForm((f) => ({ ...f, contact_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Industry</Label>
                <Input
                  value={leadForm.industry}
                  onChange={(e) => setLeadForm((f) => ({ ...f, industry: e.target.value }))}
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={leadForm.location}
                  onChange={(e) => setLeadForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Notes / Next action</Label>
              <Textarea
                value={leadForm.notes}
                onChange={(e) => setLeadForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeadOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={saving || !leadForm.company_name.trim()}
              onClick={saveLead}
            >
              {saving ? "Saving..." : "Save Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Briefcase, Plus, Loader2, AlertCircle, X, Users, ChevronDown, ChevronUp, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

export default function RecruiterVacancies() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // Quick Add Candidate state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddVacancy, setQuickAddVacancy] = useState(null);
  const [qaName, setQaName] = useState("");
  const [qaEmail, setQaEmail] = useState("");
  const [qaPhone, setQaPhone] = useState("");
  const [qaTitle, setQaTitle] = useState("");
  const [qaPaste, setQaPaste] = useState("");
  const [qaSaving, setQaSaving] = useState(false);
  const [qaParsing, setQaParsing] = useState(false);
  const [qaError, setQaError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!mounted) return;
        if (!u) { navigate("/login"); return; }

        const { data: p } = await supabase
          .from("profiles").select("role").eq("id", u.id).maybeSingle();
        if (p?.role !== "recruiter" && p?.role !== "admin") {
          navigate("/dashboard");
          return;
        }
        setUser(u);

        const { data: vacData, error: vacErr } = await supabase
          .from("recruiter_vacancies")
          .select("*")
          .eq("recruiter_id", u.id)
          .order("created_at", { ascending: false });
        if (vacErr) throw vacErr;

        const { data: candData, error: candErr } = await supabase
          .from("candidates")
          .select("*");
        if (candErr) throw candErr;

        if (mounted) {
          setVacancies(vacData || []);
          setCandidates(candData || []);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load");
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const linkedByVacancy = useMemo(() => {
    const map = {};
    vacancies.forEach(v => {
      map[v.id] = candidates.filter(c => c.vacancy_id === v.id);
    });
    return map;
  }, [vacancies, candidates]);

  const save = async () => {
    if (!user || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error: e } = await supabase
        .from("recruiter_vacancies")
        .insert({
          recruiter_id: user.id,
          title: title.trim(),
          location: location || null,
          status: "open",
          fee_amount: 0,
        })
        .select()
        .single();
      if (e) throw e;
      setVacancies(prev => [data, ...prev]);
      setOpen(false);
      setTitle("");
      setLocation("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openQuickAdd = (vacancy) => {
    setQuickAddVacancy(vacancy);
    setQaName("");
    setQaEmail("");
    setQaPhone("");
    setQaTitle(vacancy.title || "");
    setQaPaste("");
    setQaError(null);
    setQuickAddOpen(true);
  };

  // Parse pasted text and fill the form fields
  const parsePastedProfile = async () => {
    if (!qaPaste.trim()) {
      setQaError("Paste some profile text first");
      return;
    }
    setQaParsing(true);
    setQaError(null);
    try {
      const response = await fetch(
        "https://tlzipklqaxiupbhggbnm.functions.supabase.co/parse-cv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: qaPaste }),
        }
      );
      const parsed = await response.json();
      if (!parsed || parsed.error) {
        throw new Error(parsed?.error || "Could not parse the pasted text");
      }

      // Fill form with parsed data (keep what user already typed if parser returns empty)
      if (parsed.name) setQaName(parsed.name);
      if (parsed.email) setQaEmail(parsed.email);
      if (parsed.phone) setQaPhone(parsed.phone);
      if (parsed.title) setQaTitle(parsed.title);

      setQaError(null);
    } catch (err) {
      console.error(err);
      setQaError(err.message || "Failed to parse pasted profile");
    } finally {
      setQaParsing(false);
    }
  };

  const handleQuickAdd = async (parseCv = false, file = null) => {
    if (!quickAddVacancy || !qaName.trim()) {
      setQaError("Name is required");
      return;
    }
    setQaSaving(true);
    setQaError(null);

    try {
      let parsed = {};

      // Option A: user uploaded a file
      if (parseCv && file) {
        const text = await file.text();
        const response = await fetch(
          "https://tlzipklqaxiupbhggbnm.functions.supabase.co/parse-cv",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          }
        );
        parsed = await response.json();
        if (parsed?.error) throw new Error("CV parsing failed");
      }

      // Option B: user pasted text and we already parsed it into the form,
      // or we can re-parse the paste if they didn't click "Parse" yet
      if (!parseCv && qaPaste.trim() && !parsed.name) {
        const response = await fetch(
          "https://tlzipklqaxiupbhggbnm.functions.supabase.co/parse-cv",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: qaPaste }),
          }
        );
        const pasteParsed = await response.json();
        if (pasteParsed && !pasteParsed.error) {
          parsed = pasteParsed;
        }
      }

      const payload = {
        name: qaName.trim() || parsed.name || "Unknown",
        email: qaEmail.trim() || parsed.email || null,
        phone: qaPhone.trim() || parsed.phone || null,
        title: qaTitle.trim() || parsed.title || quickAddVacancy.title || "",
        job_title: qaTitle.trim() || parsed.title || quickAddVacancy.title || null,
        applied_for: quickAddVacancy.title || null,
        location: parsed.location || quickAddVacancy.location || null,
        city: parsed.city || null,
        province: parsed.province || null,
        skills: Array.isArray(parsed.skills) ? parsed.skills.join(", ") : (parsed.skills || null),
        education: parsed.education || null,
        gender: parsed.gender || null,
        ethnicity: parsed.ethnicity || null,
        age: parsed.age || null,
        salary: parsed.salary || null,
        status: "new",
        assigned_user_id: user?.id || null,
        created_by: user?.id || null,
        vacancy_id: quickAddVacancy.id,
      };

      const { data, error: insertErr } = await supabase
        .from("candidates")
        .insert([payload])
        .select()
        .single();

      if (insertErr) throw insertErr;

      setCandidates(prev => [data, ...prev]);
      setQuickAddOpen(false);
      setExpandedId(quickAddVacancy.id);
    } catch (err) {
      console.error(err);
      setQaError(err.message || "Failed to add candidate");
    } finally {
      setQaSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Vacancies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Vacancies with candidates linked directly to them.
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Vacancy
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {vacancies.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-lg">No vacancies yet</p>
            <Button className="mt-6 bg-red-600 hover:bg-red-700" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vacancy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vacancies.map((v) => {
            const linked = linkedByVacancy[v.id] || [];
            const isExpanded = expandedId === v.id;

            return (
              <Card key={v.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-lg">{v.title}</p>
                      <p className="text-sm text-gray-500">{v.location || "No location"}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-green-100 text-green-700">{v.status || "open"}</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {linked.length} linked
                      </Badge>

                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 gap-1"
                        onClick={() => openQuickAdd(v)}
                      >
                        <UserPlus className="w-4 h-4" />
                        Quick Add
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : v.id)}
                      >
                        {isExpanded ? (
                          <><ChevronUp className="w-4 h-4 mr-1" /> Hide</>
                        ) : (
                          <><ChevronDown className="w-4 h-4 mr-1" /> View linked</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 border-t pt-4 space-y-2">
                      {linked.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No candidates linked yet. Use <strong>Quick Add</strong> or upload a CV on the Candidates page.
                        </p>
                      ) : (
                        linked.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                          >
                            <div className="min-w-0">
                              <p className="font-medium truncate">{c.name || "Unnamed"}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {c.title || c.job_title || "No title"}
                                {(c.city || c.location) && ` · ${c.city || c.location}`}
                                {c.email && ` · ${c.email}`}
                              </p>
                            </div>
                            <Badge variant="outline">{c.status || "new"}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Vacancy Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vacancy</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Job title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={saving || !title.trim()}
              onClick={save}
            >
              {saving ? "Saving..." : "Save Vacancy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Candidate Dialog – with Paste Profile */}
      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Quick Add Candidate
              {quickAddVacancy && (
                <span className="block text-sm font-normal text-gray-500 mt-1">
                  Linked to: {quickAddVacancy.title}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* PASTE PROFILE SECTION */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border">
              <Label className="font-medium">Paste candidate profile / CV text</Label>
              <Textarea
                value={qaPaste}
                onChange={(e) => setQaPaste(e.target.value)}
                placeholder="Paste LinkedIn profile, email, WhatsApp bio, CV text, etc. here..."
                rows={5}
                className="resize-y"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={qaParsing || !qaPaste.trim()}
                onClick={parsePastedProfile}
              >
                {qaParsing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Parsing...</>
                ) : (
                  "Parse pasted profile"
                )}
              </Button>
              <p className="text-xs text-gray-500">
                This fills the fields below so you can review before saving.
              </p>
            </div>

            {/* MANUAL / PARSED FIELDS */}
            <div>
              <Label>Full name *</Label>
              <Input
                value={qaName}
                onChange={(e) => setQaName(e.target.value)}
                placeholder="e.g. Thabo Molefe"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={qaEmail}
                onChange={(e) => setQaEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={qaPhone}
                onChange={(e) => setQaPhone(e.target.value)}
                placeholder="082 123 4567"
              />
            </div>
            <div>
              <Label>Job title / role</Label>
              <Input
                value={qaTitle}
                onChange={(e) => setQaTitle(e.target.value)}
                placeholder="Pre-filled from vacancy"
              />
            </div>

            {/* Optional file upload still available */}
            <div>
              <Label className="text-xs text-gray-500">Or upload a CV file instead</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="mt-1 block w-full text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleQuickAdd(true, file);
                }}
              />
            </div>

            {qaError && (
              <p className="text-sm text-red-600">{qaError}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={qaSaving || !qaName.trim()}
              onClick={() => handleQuickAdd(false)}
            >
              {qaSaving ? "Saving..." : "Add Candidate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
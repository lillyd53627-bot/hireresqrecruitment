// src/pages/Candidate/Profile.jsx

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  User,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Phone,
  MapPin,
  Briefcase,
} from "lucide-react";

export default function CandidateProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    current_title: "",
    years_experience: "",
    summary: "",
    skills: "",
  });

  const [cv, setCv] = useState({
    url: null,
    filename: null,
    uploaded_at: null,
  });

  const fileInputRef = useRef(null);

  // --------------------------------------------------
  // Load user + profile
  // --------------------------------------------------
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/candidate/login";
        return;
      }

      setUser(user);

      // Try to load existing candidate profile
      const { data: profile, error } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        setForm({
          full_name: profile.full_name || "",
          email: profile.email || user.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          current_title: profile.current_title || "",
          years_experience: profile.years_experience?.toString() || "",
          summary: profile.summary || "",
          skills: (profile.skills || []).join(", "),
        });

        setCv({
          url: profile.cv_url,
          filename: profile.cv_filename,
          uploaded_at: profile.cv_uploaded_at,
        });
      } else {
        // Pre-fill email from auth
        setForm((prev) => ({
          ...prev,
          email: user.email || "",
        }));
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Save profile details
  // --------------------------------------------------
  async function saveProfile(e) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        user_id: user.id,
        full_name: form.full_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        location: form.location.trim() || null,
        current_title: form.current_title.trim() || null,
        years_experience: form.years_experience
          ? parseInt(form.years_experience, 10)
          : null,
        summary: form.summary.trim() || null,
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("candidate_profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;

      setMessage({ type: "success", text: "Profile saved successfully" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Upload CV
  // --------------------------------------------------
  async function handleCvUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Basic validation
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Please upload a PDF or Word document (.pdf, .doc, .docx)",
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: "error", text: "File is too large. Maximum size is 8MB." });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `cvs/${fileName}`; // Change "cvs" if your bucket uses a different folder

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("cvs") // ← change this if your bucket has a different name
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL (or signed URL depending on your bucket settings)
      const {
        data: { publicUrl },
      } = supabase.storage.from("cvs").getPublicUrl(filePath);

      // Save reference in candidate_profiles
      const { error: dbError } = await supabase
        .from("candidate_profiles")
        .upsert(
          {
            user_id: user.id,
            cv_url: publicUrl,
            cv_filename: file.name,
            cv_uploaded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (dbError) throw dbError;

      setCv({
        url: publicUrl,
        filename: file.name,
        uploaded_at: new Date().toISOString(),
      });

      setMessage({ type: "success", text: "CV uploaded successfully" });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Failed to upload CV",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple top bar */}
      <header className="bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-xl">HireResQ</div>
          <div className="text-sm text-gray-300">Candidate Portal</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <User className="w-7 h-7 text-red-600" />
            My Profile & CV
          </h1>
          <p className="text-gray-500 mt-1">
            Keep your profile and CV up to date so HireResQ can match you with the right opportunities.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-100"
                : "bg-red-50 text-red-800 border border-red-100"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT – CV Upload */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                Your CV
              </h2>

              {cv.url ? (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {cv.filename || "Current CV"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded{" "}
                    {cv.uploaded_at
                      ? new Date(cv.uploaded_at).toLocaleDateString("en-ZA")
                      : ""}
                  </p>
                  <a
                    href={cv.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-red-600 hover:underline"
                  >
                    View current CV
                  </a>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                  No CV uploaded yet
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCvUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {cv.url ? "Replace CV" : "Upload CV"}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                PDF or Word • Max 8MB
              </p>
            </div>
          </div>

          {/* RIGHT – Profile form */}
          <div className="lg:col-span-2">
            <form onSubmit={saveProfile} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="font-semibold text-gray-900 mb-2">Profile Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, full_name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g. 082 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="City, Province"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> Current / Latest Title
                  </label>
                  <input
                    type="text"
                    value={form.current_title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, current_title: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g. Senior Accountant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={form.years_experience}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        years_experience: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, skills: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. Financial Reporting, IFRS, SAP, Excel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Summary
                </label>
                <textarea
                  rows={4}
                  value={form.summary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, summary: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Brief overview of your experience and what you're looking for..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
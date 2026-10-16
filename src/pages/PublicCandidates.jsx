import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Phone, Mail, MapPin, Briefcase, GraduationCap, FileText, RefreshCw } from "lucide-react";

export default function PublicCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchCandidates = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("source", "public_form")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filtered = candidates.filter((c) => {
    const term = search.toLowerCase();
    return (
      !term ||
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.job_title?.toLowerCase().includes(term) ||
      c.industry?.toLowerCase().includes(term) ||
      c.location?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Public Candidates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Candidates who submitted their profile via the public registration form
          </p>
        </div>

        <button
          onClick={fetchCandidates}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, job title, industry, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
        />
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500">
        Showing <strong>{filtered.length}</strong> of {candidates.length} public candidates
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
          No public candidates found yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white border rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      {c.name || "Unnamed Candidate"}
                    </h2>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Public Form
                    </span>
                  </div>

                  <p className="text-red-600 font-medium mt-1">
                    {c.job_title || c.title || "No job title"}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    {c.industry && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {c.industry}
                      </span>
                    )}
                    {c.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {c.location}
                      </span>
                    )}
                    {c.education && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {c.education}
                      </span>
                    )}
                    {c.age && <span>{c.age} years</span>}
                  </div>

                  {c.education_details && (
                    <p className="text-sm text-gray-500 mt-2">{c.education_details}</p>
                  )}

                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Mail className="w-4 h-4" />
                        {c.email}
                      </a>
                    )}
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        {c.phone}
                      </a>
                    )}
                    {c.id_number && (
                      <span className="text-gray-500">ID: {c.id_number}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[120px]">
                  {c.cv_file_path && (
                    <a
                      href={c.cv_file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      View CV
                    </a>
                  )}
                  <span className="text-xs text-center text-gray-400">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
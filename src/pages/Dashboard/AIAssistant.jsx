import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Eye, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AIAssistant() {
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [keyword, setKeyword] = useState('');
  const [uploading, setUploading] = useState(false);

  // LOAD
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    setCandidates(data || []);
    setFiltered(data || []);
  };

  // ============================
  // 🔍 KEYWORD FILTER
  // ============================
  useEffect(() => {
    if (!keyword.trim()) {
      setFiltered(candidates);
      return;
    }

    const term = keyword.toLowerCase();

    const result = candidates.filter(c =>
      (c.name || '').toLowerCase().includes(term) ||
      (c.title || '').toLowerCase().includes(term) ||
      (c.location || '').toLowerCase().includes(term) ||
      (c.skills || '').toLowerCase().includes(term)
    );

    setFiltered(result);
  }, [keyword, candidates]);

  // ============================
  // 📤 UPLOAD
  // ============================
  const handleCVUpload = async (file) => {
    if (!file) return;

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;

      await supabase.storage
        .from('cvs')
        .upload(fileName, file);

      const { data } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName);

      const cvUrl = data.publicUrl;

      // ✅ FIXED
      await supabase.functions.invoke('parse-cv', {
        body: { cv_url: cvUrl }
      });

      toast.success("CV uploaded & parsed");

      await fetchCandidates();

    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ============================
  // 🧠 AI MATCHING
  // ============================
  const runAIScoring = async () => {
    if (!jobDescription) {
      toast.error("Enter job description");
      return;
    }

    const { data } = await supabase.functions.invoke('score-candidates', {
      body: { job_description: jobDescription, candidates }
    });

    setCandidates(data.scoredCandidates);
    setFiltered(data.scoredCandidates);

    toast.success("AI matching complete");
  };

  // ============================
  // ⭐ SHORTLIST
  // ============================
  const toggleShortlist = async (c) => {
    const updated = !c.shortlisted;

    await supabase
      .from('candidates')
      .update({ shortlisted: updated })
      .eq('id', c.id);

    setCandidates(prev =>
      prev.map(x =>
        x.id === c.id ? { ...x, shortlisted: updated } : x
      )
    );
  };

  return (
    <div className="p-6 space-y-6">

      {/* 📤 UPLOAD */}
      <input
        type="file"
        onChange={(e) => handleCVUpload(e.target.files[0])}
      />

      {/* 🔍 KEYWORD SEARCH */}
      <Input
        placeholder="Search candidates (name, skills, location...)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* 🧠 AI SEARCH */}
      <Textarea
        placeholder="Paste job description for AI matching..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <Button onClick={runAIScoring}>
        Run AI Matching
      </Button>

      {/* RESULTS */}
      {filtered.map((c, i) => (
        <Card key={c.id} className="p-4">

          {i < 3 && (
            <div className="text-green-600 text-xs font-bold">
              ⭐ Top Candidate
            </div>
          )}

          <CardContent className="flex justify-between">

            <div>
              <p className="font-bold">{c.name}</p>
              <p>{c.title}</p>
              <p className="text-xs text-gray-500">{c.location}</p>

              {c.reason && (
                <p className="text-xs text-blue-500 mt-1">
                  {c.reason}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-green-600 font-bold">
                {c.match_score || 0}% match
              </p>

              <div className="flex gap-2 mt-2">

                {/* ✅ FIXED PREVIEW (fallback support) */}
                {(c.cv_file_path || c.cv_url) && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedCV(c.cv_file_path || c.cv_url)}
                  >
                    <Eye size={16} />
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={() => toggleShortlist(c)}
                >
                  <Star size={16} />
                </Button>

              </div>
            </div>

          </CardContent>
        </Card>
      ))}

      {/* 📄 PREVIEW MODAL */}
      {selectedCV && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
          <div className="bg-white w-4/5 h-4/5">
            <iframe src={selectedCV} className="w-full h-full" />
            <Button onClick={() => setSelectedCV(null)}>Close</Button>
          </div>
        </div>
      )}

    </div>
  );
}
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
  const [jobDescription, setJobDescription] = useState('');
  const [keyword, setKeyword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    const sorted = (data || []).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    setCandidates(sorted);
  };

  // ============================
  // IMPROVED BULK CV UPLOAD (Version 2)
  // ============================
  const handleCVUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    try {
      for (const file of files) {
        if (file.type !== "application/pdf") {
          console.warn("Skipping non-PDF file:", file.name);
          continue;
        }

        // Clean file name
        const fileExt = file.name.split('.').pop();
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload CV to Storage
        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(cleanFileName, file, { upsert: true });

        if (uploadError) {
          console.error("Upload failed for", file.name, uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('cvs')
          .getPublicUrl(cleanFileName);

        const cvUrl = urlData.publicUrl;

        console.log("CV uploaded successfully:", cleanFileName);

        // Call parse-cv Edge Function with user_id
        const currentUser = await supabase.auth.getUser();
        const userId = currentUser.data.user?.id;

        const response = await fetch(
          'https://tlzipklqaxiupbhggbnm.supabase.co/functions/v1/parse-cv',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ 
              cv_url: cvUrl, 
              user_id: userId 
            })
          }
        );

        const result = await response.json();

        if (result.success) {
          successCount++;
        } else {
          console.error("Parse failed for", file.name, result.error);
        }
      }

      toast.success(`✅ Successfully processed ${successCount} CV(s)`);
      await loadCandidates();   // Refresh the list

    } catch (err) {
      console.error("Bulk upload error:", err);
      toast.error("Bulk CV upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ============================
  // SEARCH (Unchanged)
  // ============================
  const runKeywordSearch = () => {
    if (!keyword.trim()) {
      loadCandidates();
      return;
    }

    const terms = keyword
      .toLowerCase()
      .split(/,|and|or/)
      .map(t => t.trim())
      .filter(Boolean);

    const filtered = candidates.filter(c => {
      const searchText = `${c.name || ''} ${c.title || ''} ${c.location || ''} ${c.skills || ''}`.toLowerCase();
      return terms.every(term => searchText.includes(term));
    });

    setCandidates(filtered);
    toast.success(`Found ${filtered.length} matching candidates`);
  };

  // ============================
  // SHORTLIST (Unchanged)
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

  // ============================
  // AI MATCHING (Unchanged)
  // ============================
  const runAIScoring = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter job description");
      return;
    }

    setMatching(true);

    try {
      const response = await fetch(
        'https://tlzipklqaxiupbhggbnm.supabase.co/functions/v1/semantic-match',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ job_description: jobDescription })
        }
      );

      const result = await response.json();

      if (result.success && result.scoredCandidates) {
        setCandidates(result.scoredCandidates);
        toast.success(`Semantic AI Match complete - ${result.count} candidates ranked`);
      } else {
        throw new Error(result.error || "Matching failed");
      }
    } catch (err) {
      console.error("Semantic matching error:", err);
      toast.error("Semantic matching unavailable. Using basic ranking.");

      const sorted = [...candidates].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      setCandidates(sorted);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* CV Upload */}
      <div>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => handleCVUpload(e.target.files)}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-blue-600 mt-1">Processing CVs... Please wait</p>}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search (sales AND johannesburg OR marketing)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button onClick={runKeywordSearch}>Search</Button>
      </div>

      {/* Job Description */}
      <Textarea
        placeholder="Paste job description..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <Button onClick={runAIScoring} disabled={matching}>
        {matching ? "Running Semantic Match..." : "Run AI Matching"}
      </Button>

      {/* Candidates */}
      {candidates.map((c, i) => (
        <Card key={c.id} className="p-4">
          {i < 3 && (
            <div className="text-xs text-green-600 font-bold mb-2">
              ⭐ Top Candidate
            </div>
          )}

          <CardContent className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg">{c.name || "Unnamed Candidate"}</p>
              <p className="text-gray-700">{c.title}</p>
              <p className="text-xs text-gray-500">{c.location}</p>

              {c.cv_file_path && (
                <p className="text-xs text-green-600 mt-1">📄 CV Uploaded</p>
              )}
            </div>

            <div className="text-right">
              <p className="text-green-600 font-bold">
                {c.match_score || 0}% match
              </p>

              <div className="flex gap-2 mt-3">
                {c.cv_file_path && (
                  <Button
                    size="sm"
                    onClick={() => window.open(c.cv_file_path, '_blank')}
                  >
                    <Eye size={16} />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant={c.shortlisted ? "default" : "outline"}
                  onClick={() => toggleShortlist(c)}
                >
                  <Star size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

    </div>
  );
}
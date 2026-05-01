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

    const sorted = (data || []).sort(
      (a, b) => (b.match_score || 0) - (a.match_score || 0)
    );

    setCandidates(sorted);
  };

  // ============================
  // BULK CV UPLOAD
  // ============================
  const handleCVUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
          .from('cvs')
          .upload(fileName, file, { upsert: true });

        if (error) continue;

        const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(fileName);
          const cvUrl = urlData.publicUrl;

        await fetch(
          'https://uoovbueakhhswpmythsb.supabase.co/functions/v1/parse-cv',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              cv_url: data.publicUrl,
              user_id: userId
            })
          }
        );

        successCount++;
      }

      toast.success(`Processed ${successCount} CV(s)`);
      loadCandidates();

    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ============================
  // KEYWORD SEARCH
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
  // SHORTLIST TOGGLE
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
  // AI MATCHING
  // ============================
  const runAIScoring = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter job description");
      return;
    }

    setMatching(true);

    try {
      const res = await fetch(
        'https://uoovbueakhhswpmythsb.supabase.co/functions/v1/semantic-match',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ job_description: jobDescription })
        }
      );

      const result = await res.json();

      if (result.success) {
        setCandidates(result.scoredCandidates || []);
        toast.success("AI matching complete");
      }

    } catch (err) {
      console.error(err);
      toast.error("Matching failed - using fallback");

      const sorted = [...candidates].sort(
        (a, b) => (b.match_score || 0) - (a.match_score || 0)
      );
      setCandidates(sorted);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">

      <div className="space-y-6">

        {/* Upload */}
        <div>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleCVUpload(e.target.files)}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 
                       file:mr-4 file:py-3 file:px-6 file:rounded-xl 
                       file:border-0 file:text-sm file:font-medium 
                       file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          />
          {uploading && (
            <p className="text-sm text-blue-600 mt-2">
              Processing CVs... Please wait
            </p>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search (sales AND johannesburg OR marketing)"
            className="flex-1"
          />
          <Button onClick={runKeywordSearch}>Search</Button>
        </div>

        {/* Job Description */}
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Enter job description..."
          rows={4}
        />

        {/* AI Match */}
        <Button onClick={runAIScoring} disabled={matching} size="lg">
          {matching ? "Matching..." : "Run AI Matching"}
        </Button>

        {/* Results */}
        <div className="space-y-4">
          {candidates.map((c) => (
            <Card key={c.id} className="p-5">
              <CardContent className="flex justify-between items-start p-0">

                <div>
                  <p className="font-bold text-lg">{c.name}</p>
                  <p className="text-gray-700">{c.title}</p>
                  {c.location && (
                    <p className="text-sm text-gray-500">{c.location}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xl font-semibold text-green-600">
                    {c.match_score || 0}%
                  </p>

                  <div className="flex gap-3 mt-4">
                    {c.cv_file_path && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(c.cv_file_path, '_blank')}
                      >
                        <Eye size={18} />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant={c.shortlisted ? "default" : "outline"}
                      onClick={() => toggleShortlist(c)}
                    >
                      <Star size={18} />
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Eye, Star, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AIAssistant() {
  const [candidates, setCandidates] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [keyword, setKeyword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [parsingAll, setParsingAll] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Failed to load candidates');
      return;
    }

    const sorted = (data || []).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    setCandidates(sorted);
  };

  // ====================== CV UPLOAD ======================
  const handleCVUpload = async (e) => { /* your existing upload code */ };

  // ====================== PARSE ALL ======================
  const parseAllCVs = async () => { /* your existing parse all code */ };

  // ====================== IMPROVED AI MATCHING ======================
  const runAIScoring = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setMatching(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/semantic-match`,
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Match Error:", errorText);
        toast.error(`Server error: ${response.status}`);
        return;
      }

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "AI matching failed");
        return;
      }

      toast.success(`✅ AI Matching completed! ${result.count || 0} candidates scored`);

      // Refresh the list with latest scores
      await loadCandidates();

    } catch (err) {
      console.error(err);
      toast.error("Failed to run AI matching");
    } finally {
      setMatching(false);
    }
  };

  // ====================== OTHER FUNCTIONS ======================
  const toggleShortlist = async (candidate) => { /* your existing code */ };

  const updateStage = async (candidateId, stage) => { /* your existing code */ };

  const sendEmail = (candidate) => { /* your existing code */ };

  const sendWhatsApp = (candidate) => { /* your existing code */ };

  const runKeywordSearch = () => { /* your existing code */ };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>AI Recruitment Assistant</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Upload & Paste Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Upload CVs (PDF)</label>
              <Input type="file" multiple accept=".pdf" onChange={handleCVUpload} disabled={uploading} />
            </div>

            <Button onClick={parseAllCVs} disabled={parsingAll} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {parsingAll ? 'Parsing All...' : 'Parse All Existing CVs'}
            </Button>
          </div>

          {/* Job Description + AI Matching */}
          <div>
            <label className="block text-sm font-medium mb-2">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={6}
            />
            <Button 
              onClick={runAIScoring} 
              disabled={matching || !jobDescription.trim()}
              className="mt-4 w-full bg-red-600 hover:bg-red-700"
            >
              {matching ? "Running AI Match..." : "Run AI Matching"}
            </Button>
          </div>

          {/* Candidates List */}
          <div className="space-y-4">
            {candidates.map((c, i) => (
              <Card key={c.id} className="p-4">
                <CardContent className="flex justify-between items-start">
                  <div>
                    {i < 3 && <div className="text-xs text-green-600 font-bold mb-2">⭐ Top Candidate</div>}
                    <p className="font-bold text-lg">{c.name || 'Unnamed Candidate'}</p>
                    <p>{c.title}</p>
                    <p className="text-sm text-gray-500">{c.location}</p>
                    {c.skills && (
                      <p className="text-xs mt-2">
                        <strong>Skills:</strong> {Array.isArray(c.skills) ? c.skills.join(', ') : c.skills}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-green-600 font-bold">{c.match_score || 0}% Match</p>
                    <div className="flex gap-2 mt-4 justify-end">
                      {c.cv_file_path && (
                        <Button size="sm" onClick={() => window.open(c.cv_file_path, '_blank')}>
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
        </CardContent>
      </Card>
    </div>
  );
}
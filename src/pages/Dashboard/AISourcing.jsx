import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AISourcing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setCandidates([]);

    try {
      console.log("🔄 Calling AI-Sourcing with query:", searchQuery);

      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsemlwa2xxYXhpdXBiaGdnYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NjYwMjMsImV4cCI6MjA5MDE0MjAyM30.N-9NaDds_ZZ2sfL8Tp-WX_NRH2UOjzNrIbRbBpUcGPo";

      const response = await fetch('https://tlzipklqaxiupbhggbnm.supabase.co/functions/v1/AI-Sourcing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({ query: searchQuery })
      });

      console.log("📡 AI-Sourcing fetch status:", response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error body');
        console.error("❌ Fetch failed:", response.status, errorText);
        toast.error(`Server error: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log("✅ FULL Response received from AI-Sourcing:", data);

      // Handle different possible response formats safely
      const candidatesList = data?.candidates || data || [];

      setCandidates(candidatesList);

      if (candidatesList.length === 0) {
        toast.info("No candidates found for this search term. Try different keywords.");
      } else {
        toast.success(`Found ${candidatesList.length} candidates`);
      }
    } catch (err) {
      console.error("🚨 Catch error:", err);
      toast.error("Failed to connect to AI Sourcing. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">AI Talent Sourcing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="sales manager johannesburg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 px-8"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div>
            {candidates.length > 0 ? (
              <div className="space-y-4">
                {candidates.map((c, index) => (
                  <Card key={c.id || index} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{c.name}</h3>
                          <p className="text-gray-600">{c.title} • {c.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-600 font-medium">
                            Match Score: {c.match_score || 'N/A'}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                {loading 
                  ? 'Searching for candidates...' 
                  : 'Enter a search term above to find candidates'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
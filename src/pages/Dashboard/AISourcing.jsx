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

      console.log("📡 Status:", response.status);

      const data = await response.json();
      console.log("✅ RAW RESPONSE:", JSON.stringify(data, null, 2));

      const candidatesList = Array.isArray(data) ? data : (data?.candidates || []);

      setCandidates(candidatesList);

      if (candidatesList.length === 0) {
        toast.info("No candidates found for this search.");
      } else {
        toast.success(`Found ${candidatesList.length} candidates`);
      }
    } catch (err) {
      console.error("🚨 Error:", err);
      toast.error("Failed to reach AI Sourcing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>AI Talent Sourcing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="sales manager johannesburg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
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
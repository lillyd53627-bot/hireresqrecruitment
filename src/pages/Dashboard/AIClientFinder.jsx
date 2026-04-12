import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AIClientFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setClients([]);

    try {
      console.log("Direct fetch to AIClientFinder with query:", searchQuery);

      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsemlwa2xxYXhpdXBiaGdnYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NjYwMjMsImV4cCI6MjA5MDE0MjAyM30.N-9NaDds_ZZ2sfL8Tp-WX_NRH2UOjzNrIbRbBpUcGPo";

      const response = await fetch('https://tlzipklqaxiupbhggbnm.supabase.co/functions/v1/AIClientFinder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({ query: searchQuery })
      });

      console.log("Fetch status:", response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error text');
        console.error("Fetch error:", errorText);
        toast.error(`Server returned ${response.status}: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log("Full response from Supabase:", data);

      setClients(data?.clients || data || []);
    } catch (err) {
      console.error("Catch error:", err);
      toast.error("Failed to fetch clients. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>AI Client Finder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. companies hiring accountants in Johannesburg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Find Clients'}
            </Button>
          </div>

          <div className="grid gap-4">
            {clients.length > 0 ? (
              clients.map(c => (
                <Card key={c.id}>
                  <CardContent className="p-6">
                    <h3 className="font-bold">{c.name}</h3>
                    <p>{c.industry} • {c.location}</p>
                    <p className="text-green-600">Lead Score: {c.lead_score}%</p>
                    {c.website && <a href={c.website} target="_blank" className="text-blue-600">Visit Website</a>}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center py-12 text-gray-500">
                {loading ? 'Searching for hiring companies...' : 'No clients found. Try searching above.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
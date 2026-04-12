import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import CandidateDetailsDialog from '@/components/candidates/CandidateDetailsDialog';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    title: '',
    location: '',
    email: '',
    phone: ''
  });

  // Fetch real candidates from Supabase
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCandidates(data || []);
      setFilteredCandidates(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Filter by search and tab
  useEffect(() => {
    let result = candidates;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q)
      );
    }

    if (activeTab !== 'all') {
      result = result.filter(c => (c.status || 'new') === activeTab);
    }

    setFilteredCandidates(result);
  }, [searchQuery, activeTab, candidates]);

  // Add new candidate
  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.title) {
      toast.error("Name and title are required");
      return;
    }

    try {
      const { error } = await supabase
        .from('candidates')
        .insert([{
          name: newCandidate.name,
          title: newCandidate.title,
          location: newCandidate.location,
          email: newCandidate.email,
          phone: newCandidate.phone,
          status: 'new'
        }]);

      if (error) throw error;

      toast.success("Candidate added successfully");
      setShowAddModal(false);
      setNewCandidate({ name: '', title: '', location: '', email: '', phone: '' });
      fetchCandidates();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add candidate");
    }
  };

  const statusTabs = [
    { value: 'all', label: 'All', count: candidates.length },
    { value: 'new', label: 'New', count: candidates.filter(c => c.status === 'new').length },
    { value: 'screening', label: 'Screening', count: candidates.filter(c => c.status === 'screening').length },
    { value: 'shortlisted', label: 'Shortlisted', count: candidates.filter(c => c.status === 'shortlisted').length },
    { value: 'interview', label: 'Interview', count: candidates.filter(c => c.status === 'interview').length },
    { value: 'offered', label: 'Offered', count: candidates.filter(c => c.status === 'offered').length },
    { value: 'hired', label: 'Hired', count: candidates.filter(c => c.status === 'hired').length },
  ];

  const getFilteredByStatus = (status) => {
    if (status === 'all') return filteredCandidates;
    return filteredCandidates.filter(c => (c.status || 'new') === status);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-gray-600">Manage your talent pipeline</p>
        </div>

        <Button onClick={() => setShowAddModal(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, title or location..."
            className="pl-11"
          />
        </div>
      </div>

      {/* Pipeline Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full mb-6">
          {statusTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} <Badge variant="secondary" className="ml-2">{tab.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {statusTabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="grid gap-4">
              {getFilteredByStatus(tab.value).length > 0 ? (
                getFilteredByStatus(tab.value).map(c => (
                  <Card key={c.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                          {c.name?.split(' ').map(n => n[0]).join('') || '??'}
                        </div>
                        <div>
                          <h3 className="font-semibold">{c.name}</h3>
                          <p className="text-gray-600">{c.title}</p>
                          <p className="text-sm text-gray-500">{c.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-bold text-green-600">{c.match_score || 75}%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                        <Badge variant="outline" className="capitalize">{c.status || 'new'}</Badge>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedCandidate(c)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 text-gray-500">
                  No candidates in this stage yet.
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Candidate Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Full Name *</Label>
              <Input 
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>Job Title *</Label>
              <Input 
                value={newCandidate.title}
                onChange={(e) => setNewCandidate({...newCandidate, title: e.target.value})}
                placeholder="Senior Software Engineer"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input 
                value={newCandidate.location}
                onChange={(e) => setNewCandidate({...newCandidate, location: e.target.value})}
                placeholder="Cape Town, South Africa"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={newCandidate.email}
                onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input 
                value={newCandidate.phone}
                onChange={(e) => setNewCandidate({...newCandidate, phone: e.target.value})}
                placeholder="+27 82 123 4567"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddCandidate} className="bg-red-600 hover:bg-red-700">Add Candidate</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Candidate Details Dialog */}
      {selectedCandidate && (
        <CandidateDetailsDialog
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
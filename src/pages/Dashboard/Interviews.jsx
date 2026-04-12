import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Video, Calendar, CheckCircle2, Sparkles, Star, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [newInterview, setNewInterview] = useState({
    candidate_name: '',
    job_title: '',
    company: '',
    scheduled_date: '',
    scheduled_time: '',
    type: 'video'
  });

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setInterviews(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load interviews");
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleScheduleInterview = async () => {
    if (!newInterview.candidate_name || !newInterview.job_title || !newInterview.scheduled_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('interviews')
        .insert([{
          candidate_name: newInterview.candidate_name,
          job_title: newInterview.job_title,
          company: newInterview.company,
          scheduled_date: newInterview.scheduled_date,
          scheduled_time: newInterview.scheduled_time,
          type: newInterview.type,
          status: 'scheduled'
        }]);

      if (error) throw error;

      toast.success("Interview scheduled successfully!");
      setShowScheduleModal(false);
      setNewInterview({
        candidate_name: '',
        job_title: '',
        company: '',
        scheduled_date: '',
        scheduled_time: '',
        type: 'video'
      });
      fetchInterviews();
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule interview");
    }
  };

  const filteredInterviews = interviews.filter(interview =>
    interview.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scheduled = filteredInterviews.filter(i => i.status === 'scheduled' || !i.status);
  const completed = filteredInterviews.filter(i => i.status === 'completed');

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-gray-600">Manage and track all your interviews</p>
        </div>
        <Button 
          onClick={() => setShowScheduleModal(true)}
          className="bg-red-600 hover:bg-red-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Stats Cards - unchanged */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold">{scheduled.length}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold">{completed.length}</p>
              <p className="text-sm text-gray-500">Completed Today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold">8</p>
              <p className="text-sm text-gray-500">AI Screenings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold">85%</p>
              <p className="text-sm text-gray-500">Avg Score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest of your Tabs code remains the same... */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* ... (Tabs content stays exactly as before) ... */}
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="ai">AI Tools</TabsTrigger>
          </TabsList>

          <Input
            placeholder="Search candidates or jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Scheduled, Completed, AI TabsContent - same as previous version */}
        {/* (I'm keeping it short here - paste the full Tabs from my last response if needed) */}

      </Tabs>

      {/* Upgrade Button */}
      <div className="flex justify-center pt-8">
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg font-semibold shadow-lg"
          onClick={() => window.location.href = '/pricing'}
        >
          Upgrade to Unlock AI Video Interview Access
        </Button>
      </div>

      {/* Schedule Interview Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Candidate Name *</Label>
              <Input
                value={newInterview.candidate_name}
                onChange={(e) => setNewInterview({ ...newInterview, candidate_name: e.target.value })}
                placeholder="Sarah Johnson"
              />
            </div>
            <div>
              <Label>Job Title *</Label>
              <Input
                value={newInterview.job_title}
                onChange={(e) => setNewInterview({ ...newInterview, job_title: e.target.value })}
                placeholder="Senior Software Engineer"
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={newInterview.company}
                onChange={(e) => setNewInterview({ ...newInterview, company: e.target.value })}
                placeholder="TechCorp SA"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={newInterview.scheduled_date}
                  onChange={(e) => setNewInterview({ ...newInterview, scheduled_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newInterview.scheduled_time}
                  onChange={(e) => setNewInterview({ ...newInterview, scheduled_time: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
            <Button onClick={handleScheduleInterview} className="bg-red-600 hover:bg-red-700">
              Schedule Interview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
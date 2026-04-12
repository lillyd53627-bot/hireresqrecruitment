import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';     // ← This was missing!
import { Plus, MapPin, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: ''
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async () => {
    if (!newJob.title.trim() || !newJob.company.trim()) {
      toast.error("Job title and company are required");
      return;
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .insert([{
          title: newJob.title.trim(),
          company: newJob.company.trim(),
          location: newJob.location.trim(),
          type: newJob.type,
          salary: newJob.salary.trim(),
          description: newJob.description.trim(),
          status: 'active',
          candidates: 0,
          shortlisted: 0,
          interviews: 0,
          progress: 0
        }]);

      if (error) throw error;

      toast.success("Job posted successfully!");
      setShowNewJobModal(false);
      setNewJob({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '' });
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post job");
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Tracker</h1>
          <p className="text-gray-600">Manage your active hiring pipeline</p>
        </div>
        <Button onClick={() => setShowNewJobModal(true)} className="bg-red-600 hover:bg-red-700 gap-2">
          <Plus className="w-4 h-4" />
          Post New Job
        </Button>
      </div>

      <Input
        placeholder="Search jobs or companies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-6">
        {loading ? (
          <p className="text-center py-12">Loading jobs...</p>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-all border-0 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4" /> {job.company}
                      <span className="mx-2">•</span>
                      <MapPin className="w-4 h-4" /> {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">{job.type}</Badge>
                    {job.status === 'active' && <Badge className="bg-green-100 text-green-700">Active</Badge>}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-semibold">{job.salary || 'Not specified'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Time Left</p>
                    <p className="font-medium text-amber-600">7 days left</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 text-center mb-6">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{job.candidates || 0}</p>
                    <p className="text-sm text-gray-500">Candidates</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-600">{job.shortlisted || 0}</p>
                    <p className="text-sm text-gray-500">Shortlisted</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{job.interviews || 0}</p>
                    <p className="text-sm text-gray-500">Interviews</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <Progress value={job.progress || 45} className="flex-1" />
                  <span className="text-sm font-medium text-gray-600">{job.progress || 45}%</span>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700">View Pipeline</Button>
                  <Button variant="outline" className="flex-1">Share to LinkedIn</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-20 text-center">
              <p className="text-gray-500">No jobs posted yet.</p>
              <Button onClick={() => setShowNewJobModal(true)} className="mt-4 bg-red-600 hover:bg-red-700">
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Job Modal */}
      <Dialog open={showNewJobModal} onOpenChange={setShowNewJobModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Job Title *</Label>
              <Input 
                value={newJob.title}
                onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                placeholder="Senior Software Engineer"
              />
            </div>
            <div>
              <Label>Company *</Label>
              <Input 
                value={newJob.company}
                onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                placeholder="TechCorp SA"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input 
                value={newJob.location}
                onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                placeholder="Cape Town, South Africa"
              />
            </div>
            <div>
              <Label>Job Type</Label>
              <div className="flex gap-3 mt-2">
                {['Full-time', 'Contract', 'Remote'].map(t => (
                  <Button 
                    key={t}
                    variant={newJob.type === t ? 'default' : 'outline'}
                    onClick={() => setNewJob({...newJob, type: t})}
                    size="sm"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Salary Range</Label>
              <Input 
                value={newJob.salary}
                onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                placeholder="R70k - R100k"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                placeholder="Brief job description..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewJobModal(false)}>Cancel</Button>
            <Button onClick={handleCreateJob} className="bg-red-600 hover:bg-red-700">Post Job</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
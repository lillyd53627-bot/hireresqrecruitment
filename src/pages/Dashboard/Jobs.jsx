import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Briefcase, MapPin, Clock, Users,
  MoreVertical, Sparkles, Building2, DollarSign,
  Calendar, Eye, Edit, Trash2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';
import JobDescriptionBiasAnalyzer from '@/components/ai/JobDescriptionBiasAnalyzer';
import AICandidateMatcher from '@/components/jobs/AICandidateMatcher';
import LinkedInShareButton from '@/components/linkedin/LinkedInShareButton';

const jobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'TechCorp SA',
    location: 'Cape Town',
    type: 'Full-time',
    salary: 'R80k - R100k',
    posted: '2 days ago',
    deadline: '14 days left',
    candidates: 45,
    shortlisted: 8,
    interviews: 3,
    status: 'active',
    progress: 65
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'StartupX',
    location: 'Johannesburg',
    type: 'Full-time',
    salary: 'R70k - R90k',
    posted: '5 days ago',
    deadline: '7 days left',
    candidates: 32,
    shortlisted: 5,
    interviews: 2,
    status: 'active',
    progress: 45
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    company: 'DesignCo',
    location: 'Remote',
    type: 'Contract',
    salary: 'R50k - R65k',
    posted: '1 week ago',
    deadline: '21 days left',
    candidates: 28,
    shortlisted: 4,
    interviews: 1,
    status: 'active',
    progress: 30
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'Analytics Inc',
    location: 'Pretoria',
    type: 'Full-time',
    salary: 'R90k - R120k',
    posted: '3 days ago',
    deadline: '10 days left',
    candidates: 18,
    shortlisted: 3,
    interviews: 0,
    status: 'active',
    progress: 20
  },
];

export default function Jobs() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBiasAnalyzer, setShowBiasAnalyzer] = useState(false);
  const [selectedJobForMatching, setSelectedJobForMatching] = useState(null);

  const handleGenerateWithAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="Job Management" 
          subtitle="Create and manage job postings"
        />
        
        <div className="p-8">
          {showBiasAnalyzer && (
            <div className="mb-8">
              <JobDescriptionBiasAnalyzer />
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Jobs', value: '24', icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
              { label: 'Total Candidates', value: '847', icon: Users, color: 'bg-green-50 text-green-600' },
              { label: 'Interviews Scheduled', value: '12', icon: Calendar, color: 'bg-purple-50 text-purple-600' },
              { label: 'Placements This Month', value: '6', icon: DollarSign, color: 'bg-red-50 text-red-600' },
            ].map((stat, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setShowBiasAnalyzer(!showBiasAnalyzer)}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Bias Analyzer
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Post New Job
                  </Button>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Create New Job Posting</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input placeholder="e.g. Senior Software Engineer" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input placeholder="Company name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input placeholder="City or Remote" />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Type</Label>
                      <Input placeholder="Full-time, Contract" />
                    </div>
                    <div className="space-y-2">
                      <Label>Salary Range</Label>
                      <Input placeholder="R60k - R80k" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Job Description</Label>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={handleGenerateWithAI}
                        disabled={isGenerating}
                      >
                        <Sparkles className="w-4 h-4" />
                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                      </Button>
                    </div>
                    <Textarea 
                      placeholder="Describe the role, responsibilities, and requirements..."
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Post Job
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* AI Candidate Matching */}
          {selectedJobForMatching && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">AI Candidate Matching</h2>
                  <p className="text-gray-600">
                    Finding best matches for: <span className="font-semibold">{selectedJobForMatching.title}</span>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedJobForMatching(null)}
                >
                  Close
                </Button>
              </div>
              <AICandidateMatcher job={selectedJobForMatching} />
            </div>
          )}

          {/* Jobs Grid */}
          <div className="grid gap-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Company Logo Placeholder */}
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-gray-400" />
                      </div>

                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{job.title}</h3>
                            <p className="text-gray-500">{job.company}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" /> {job.type}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" /> {job.salary}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {job.deadline}
                              </span>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>

                        {/* Progress Section */}
                        <div className="mt-6 grid grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold">{job.candidates}</p>
                            <p className="text-xs text-gray-500">Candidates</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-blue-600">{job.shortlisted}</p>
                            <p className="text-xs text-gray-500">Shortlisted</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-purple-600">{job.interviews}</p>
                            <p className="text-xs text-gray-500">Interviews</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <LinkedInShareButton job={job} size="sm" />
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1">
                          View <ChevronRight className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                           <DropdownMenuItem className="gap-2">
                             <Eye className="w-4 h-4" /> View Details
                           </DropdownMenuItem>
                           <DropdownMenuItem className="gap-2">
                             <Edit className="w-4 h-4" /> Edit Job
                           </DropdownMenuItem>
                           <DropdownMenuItem 
                             className="gap-2"
                             onClick={() => setSelectedJobForMatching(job)}
                           >
                             <Sparkles className="w-4 h-4" /> AI Match Candidates
                           </DropdownMenuItem>
                           <DropdownMenuItem className="gap-2">
                             <Users className="w-4 h-4" /> View Candidates
                           </DropdownMenuItem>
                           <DropdownMenuItem className="gap-2 text-red-600">
                             <Trash2 className="w-4 h-4" /> Close Job
                           </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
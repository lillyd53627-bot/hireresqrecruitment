import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Sparkles, Star, MapPin, Briefcase,
  GraduationCap, Clock, ChevronRight, Download, Mail,
  Users, Zap, RefreshCw, SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import AutomatedEngagementEngine from '@/components/outreach/AutomatedEngagementEngine';
import FollowUpReminders from '@/components/outreach/FollowUpReminders';
import AIResumeScreener from '@/components/ai/AIResumeScreener';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockCandidates = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Cape Town, SA',
    experience: '8 years',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    matchScore: 95,
    salary: 'R85k - R100k',
    availability: 'Immediately',
    source: 'LinkedIn'
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Full Stack Developer',
    company: 'Microsoft',
    location: 'Johannesburg, SA',
    experience: '6 years',
    skills: ['TypeScript', 'React', 'Azure', 'PostgreSQL'],
    matchScore: 92,
    salary: 'R70k - R85k',
    availability: '2 weeks',
    source: 'Indeed'
  },
  {
    id: 3,
    name: 'Emma Williams',
    title: 'Lead Developer',
    company: 'Amazon',
    location: 'Remote',
    experience: '10 years',
    skills: ['Java', 'Microservices', 'Kubernetes', 'AWS'],
    matchScore: 88,
    salary: 'R90k - R120k',
    availability: '1 month',
    source: 'LinkedIn'
  },
  {
    id: 4,
    name: 'David Nkosi',
    title: 'Backend Engineer',
    company: 'Standard Bank',
    location: 'Pretoria, SA',
    experience: '5 years',
    skills: ['C#', '.NET', 'SQL Server', 'Docker'],
    matchScore: 85,
    salary: 'R60k - R75k',
    availability: 'Immediately',
    source: 'CareerJunction'
  },
];

export default function AISourcing() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState(mockCandidates);
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
    }, 3000);
  };

  const toggleSelectCandidate = (id) => {
    setSelectedCandidates(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="AI Talent Sourcing" 
          subtitle="Find perfect candidates using AI-powered search"
        />
        
        <div className="p-8">
          {/* Tabs */}
          <Tabs defaultValue="search" className="mb-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="search">AI Search</TabsTrigger>
              <TabsTrigger value="screen">Screen Resumes</TabsTrigger>
              <TabsTrigger value="engage">Auto Engage</TabsTrigger>
              <TabsTrigger value="reminders">Follow-ups</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="mt-6">
              {/* Search Section */}
          <Card className="border-0 shadow-sm mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by job title, skills, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-6 rounded-xl border-gray-200 text-lg"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-xl gap-2"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      AI Search
                    </>
                  )}
                </Button>
                <Button variant="outline" className="rounded-xl gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                {['Senior', 'Remote', 'Immediately Available', 'R80k+', 'Cape Town', 'Tech'].map((filter) => (
                  <Badge 
                    key={filter}
                    variant="outline" 
                    className="px-4 py-2 cursor-pointer hover:bg-red-50 hover:border-red-600 hover:text-red-600 transition-colors"
                  >
                    {filter}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Sourcing Progress */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Card className="border-0 shadow-sm bg-black text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">AI Sourcing in Progress</h3>
                        <p className="text-gray-400 text-sm">Scanning multiple sources...</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {['LinkedIn', 'Indeed', 'PNet', 'CareerJunction'].map((source, i) => (
                        <div key={source} className="bg-white/10 rounded-lg p-3">
                          <div className="text-sm text-gray-400">{source}</div>
                          <div className="text-xl font-bold">{Math.floor(Math.random() * 200) + 50}</div>
                        </div>
                      ))}
                    </div>
                    <Progress value={65} className="h-2 bg-white/20" />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">
                <span className="text-red-600">847</span> Candidates Found
              </h2>
              {selectedCandidates.length > 0 && (
                <Badge className="bg-red-600 text-white">
                  {selectedCandidates.length} selected
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" disabled={selectedCandidates.length === 0}>
                <Mail className="w-4 h-4" />
                Send Outreach
              </Button>
              <Button variant="outline" className="gap-2" disabled={selectedCandidates.length === 0}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="grid gap-4">
            {candidates.map((candidate, i) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                  selectedCandidates.includes(candidate.id) ? 'ring-2 ring-red-600' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={() => toggleSelectCandidate(candidate.id)}
                        className="mt-1"
                      />

                      {/* Avatar */}
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-gray-600">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{candidate.name}</h3>
                            <p className="text-gray-600">{candidate.title} at {candidate.company}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {candidate.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" /> {candidate.experience}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {candidate.availability}
                              </span>
                            </div>
                          </div>

                          {/* Match Score */}
                          <div className="text-right">
                           <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
                             candidate.matchScore >= 90 ? 'bg-green-100 text-green-700' :
                             candidate.matchScore >= 80 ? 'bg-yellow-100 text-yellow-700' :
                             'bg-gray-100 text-gray-700'
                           }`}>
                             <Star className="w-4 h-4" />
                             {candidate.matchScore}% Match
                           </div>
                           <p className="text-sm text-gray-500 mt-2">{candidate.salary}</p>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {candidate.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-gray-100">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 text-white gap-1"
                        >
                          View Profile <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Mail className="w-4 h-4" /> Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

              {/* Load More */}
              <div className="flex justify-center mt-8">
                <Button variant="outline" className="px-8">
                  Load More Candidates
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="screen" className="mt-6">
              <AIResumeScreener jobs={[]} />
            </TabsContent>

            <TabsContent value="engage" className="mt-6">
              <AutomatedEngagementEngine 
                candidates={candidates.map(c => ({
                  ...c,
                  match_score: c.matchScore,
                  cultural_fit_score: c.matchScore - 5,
                  status: 'new'
                }))} 
              />
            </TabsContent>

            <TabsContent value="reminders" className="mt-6">
              <FollowUpReminders />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
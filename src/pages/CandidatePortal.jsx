import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, 
  Star, Download, Edit, Share, MoreVertical,
  Calendar, DollarSign, Clock, ExternalLink,
  FileText, Globe, User, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';
import CulturalFitAnalyzer from '@/components/ai/CulturalFitAnalyzer';
import HiringSuccessPredictor from '@/components/ai/HiringSuccessPredictor';
import LinkedInProfileViewer from '@/components/candidates/LinkedInProfileViewer';

export default function CandidateProfile() {
  // Parse URL parameters manually
  const urlParams = new URLSearchParams(window.location.search);
  const candidateId = urlParams.get('id') || '1';
  const jobId = urlParams.get('jobId') || '1';
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [candidateId, jobId]);

  const loadData = async () => {
    try {
      // In real implementation, fetch candidate by ID
      // For demo, using mock data
      const mockCandidate = {
        id: candidateId || '1',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+27 82 123 4567',
        title: 'Senior Software Engineer',
        company: 'Google',
        location: 'Cape Town, SA',
        experience_years: 8,
        skills: ['React', 'Node.js', 'Python', 'AWS', 'TypeScript', 'PostgreSQL'],
        cv_url: '#',
        linkedin_url: 'https://linkedin.com/in/sarahjohnson',
        salary_expectation: 'R85k - R100k',
        availability: 'immediately',
        status: 'shortlisted',
        match_score: 95,
        cultural_fit_score: 88,
        source: 'linkedin',
        notes: `Sarah is a highly skilled engineer with strong experience in full-stack development. 
She's passionate about clean code and mentoring junior developers. 
In our initial conversation, she mentioned valuing work-life balance and continuous learning opportunities.
She prefers collaborative environments but is also comfortable working independently.
Motivated by challenging technical problems and making an impact on user experience.
Previous colleagues describe her as detail-oriented, communicative, and a natural team player.`,
        ai_insights: {
          personality_traits: ['Detail-oriented', 'Collaborative', 'Analytical', 'Communicative'],
          work_style: 'Balanced - enjoys both independent deep work and collaborative team projects',
          motivations: ['Technical challenges', 'Mentorship opportunities', 'Impact on users', 'Continuous learning'],
          cultural_indicators: ['Values work-life balance', 'Growth mindset', 'Team-oriented', 'Quality-focused'],
          summary: 'Strong technical leader with excellent communication skills and a passion for mentoring.'
        }
      };

      const mockJob = {
        id: jobId || '1',
        title: 'Senior Software Engineer',
        company: 'TechCorp SA',
        description: 'Looking for a senior engineer to lead frontend development.',
        company_culture: 'Fast-paced startup environment with focus on innovation and collaboration. We value work-life balance and invest heavily in employee growth.',
        team_description: 'Small, agile team of 5 engineers. Very collaborative, daily standups, pair programming sessions.',
        ideal_candidate_profile: 'Someone who is both technically strong and a great communicator. Should be comfortable mentoring juniors and contributing to architecture decisions. We value initiative and continuous learning.',
        notes: 'Team works hybrid - 3 days in office. Very collaborative culture with emphasis on code quality.'
      };

      setCandidate(mockCandidate);
      setJob(mockJob);
      setNotes(mockCandidate.notes || '');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    try {
      await base44.entities.Candidate.update(candidate.id, { notes });
      // Show success message
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  if (loading || !candidate) {
    return <div>Loading...</div>;
  }

  const statusColors = {
    new: 'bg-gray-100 text-gray-700',
    screening: 'bg-yellow-100 text-yellow-700',
    shortlisted: 'bg-blue-100 text-blue-700',
    interview: 'bg-purple-100 text-purple-700',
    offered: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="Candidate Profile" 
          subtitle="Detailed candidate information and AI analysis"
        />
        
        <div className="p-8">
          <Button variant="ghost" className="mb-6 gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <Badge className={statusColors[candidate.status]}>
                      {candidate.status}
                    </Badge>
                  </div>

                  <h2 className="text-2xl font-bold mb-1">{candidate.name}</h2>
                  <p className="text-gray-600 mb-4">{candidate.title}</p>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${candidate.email}`} className="hover:text-red-600">
                        {candidate.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {candidate.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      {candidate.experience_years} years experience
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      {candidate.salary_expectation}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      Available: {candidate.availability}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t space-y-2">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <FileText className="w-4 h-4" />
                      View CV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* LinkedIn Profile Integration */}
              {candidate.linkedin_url && (
                <LinkedInProfileViewer linkedinUrl={candidate.linkedin_url} />
              )}

              {/* Score Cards */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Match Scores</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Skills Match</span>
                        <span className="font-bold text-red-600">{candidate.match_score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${candidate.match_score}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Cultural Fit</span>
                        <span className="font-bold text-purple-600">{candidate.cultural_fit_score}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${candidate.cultural_fit_score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights Summary */}
              {candidate.ai_insights && (
                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Personality Traits</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.ai_insights.personality_traits?.map((trait, i) => (
                          <Badge key={i} variant="secondary" className="bg-purple-100 text-purple-700">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Work Style</h4>
                      <p className="text-sm text-gray-700">{candidate.ai_insights.work_style}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Details & AI Analysis */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="overview">
                <TabsList className="bg-white border">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ai-analysis">AI Cultural Fit</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills?.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {candidate.ai_insights && (
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Key Motivations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {candidate.ai_insights.motivations?.map((motivation, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{motivation}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Source & Background</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Source</span>
                        <Badge variant="outline" className="capitalize">{candidate.source}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Company</span>
                        <span className="font-medium">{candidate.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applied</span>
                        <span className="font-medium">3 days ago</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-analysis">
                  <div className="space-y-6">
                    {job ? (
                      <>
                        <CulturalFitAnalyzer 
                          candidate={candidate}
                          job={job}
                          onAnalysisComplete={(data) => {
                            setCandidate({
                              ...candidate,
                              cultural_fit_score: data.cultural_fit_score,
                              match_score: data.match_score,
                              ai_insights: data.ai_insights
                            });
                          }}
                        />
                        <HiringSuccessPredictor 
                          candidate={candidate} 
                          job={job}
                          interviewData={{ status: 'completed', ai_score: 85, skill_score: 88, behavior_score: 82 }}
                        />
                      </>
                    ) : (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-12 text-center">
                          <p className="text-gray-500">No job context available for analysis.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="notes">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Candidate Notes</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Add detailed notes about the candidate's background, preferences, communication style, etc.
                        These notes will be used by AI for deeper matching analysis.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[300px]"
                        placeholder="Add notes about the candidate's personality, work style preferences, career goals, communication during interviews, etc."
                      />
                      <Button 
                        onClick={saveNotes}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Save Notes
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Activity Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { action: 'AI Cultural Fit Analysis completed', score: '88%', time: '2 hours ago' },
                          { action: 'Moved to Shortlisted', time: '1 day ago' },
                          { action: 'Initial screening passed', time: '2 days ago' },
                          { action: 'Application received', time: '3 days ago' },
                        ].map((activity, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                            <div className="flex-1">
                              <p className="font-medium">{activity.action}</p>
                              {activity.score && (
                                <Badge className="bg-green-100 text-green-700 mt-1">
                                  {activity.score}
                                </Badge>
                              )}
                              <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
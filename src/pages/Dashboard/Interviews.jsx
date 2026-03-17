import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Calendar, Clock, User, Star, Play,
  CheckCircle2, AlertCircle, BarChart3, FileText,
  ChevronRight, Plus, Filter, Search, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';
import InterviewAssistant from '@/components/ai/InterviewAssistant';
import SmartInterviewScheduler from '@/components/ai/SmartInterviewScheduler';

const scheduledInterviews = [
  {
    id: 1,
    candidate: 'Sarah Johnson',
    role: 'Senior Software Engineer',
    company: 'TechCorp',
    date: 'Today',
    time: '2:00 PM',
    type: 'Video',
    status: 'upcoming'
  },
  {
    id: 2,
    candidate: 'Michael Chen',
    role: 'Product Manager',
    company: 'StartupX',
    date: 'Tomorrow',
    time: '10:00 AM',
    type: 'Video',
    status: 'upcoming'
  },
  {
    id: 3,
    candidate: 'Emma Williams',
    role: 'UX Designer',
    company: 'DesignCo',
    date: 'Dec 20',
    time: '3:30 PM',
    type: 'AI Screening',
    status: 'pending'
  },
];

const completedInterviews = [
  {
    id: 1,
    candidate: 'James Brown',
    role: 'Data Analyst',
    company: 'Analytics Inc',
    date: 'Dec 15',
    aiScore: 92,
    skillScore: 88,
    behaviorScore: 95,
    recommendation: 'Strongly Recommend',
    status: 'completed'
  },
  {
    id: 2,
    candidate: 'Linda Dlamini',
    role: 'Marketing Manager',
    company: 'BrandCo',
    date: 'Dec 14',
    aiScore: 85,
    skillScore: 82,
    behaviorScore: 88,
    recommendation: 'Recommend',
    status: 'completed'
  },
  {
    id: 3,
    candidate: 'Peter Smith',
    role: 'DevOps Engineer',
    company: 'CloudTech',
    date: 'Dec 13',
    aiScore: 78,
    skillScore: 80,
    behaviorScore: 75,
    recommendation: 'Consider',
    status: 'completed'
  },
];

export default function Interviews() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedInterviewForAssistant, setSelectedInterviewForAssistant] = useState(null);
  const [activeTab, setActiveTab] = useState('scheduled');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="AI Video Interviews" 
          subtitle="Automated screening and analysis"
        />
        
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Scheduled', value: '12', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
              { label: 'Completed Today', value: '5', icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
              { label: 'AI Screening', value: '8', icon: Sparkles, color: 'bg-purple-50 text-purple-600' },
              { label: 'Avg. Score', value: '85%', icon: Star, color: 'bg-red-50 text-red-600' },
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-white border">
                <TabsTrigger value="scheduled" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  Scheduled
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="ai-assistant" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="ai-screening" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  AI Screening
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search interviews..."
                    className="pl-10 w-64 bg-white border-gray-200"
                  />
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Schedule Interview
                </Button>
              </div>
            </div>

            <TabsContent value="scheduled" className="space-y-4">
              {scheduledInterviews.map((interview, i) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">
                            {interview.candidate.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{interview.candidate}</h3>
                          <p className="text-gray-500">{interview.role} • {interview.company}</p>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {interview.date}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            {interview.time}
                          </div>
                          <Badge className={interview.type === 'AI Screening' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                            {interview.type}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1">
                            <Video className="w-4 h-4" /> Join
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="ai-assistant">
              <InterviewAssistant 
                candidate={{
                  name: "Sarah Johnson",
                  title: "Senior Software Engineer",
                  company: "Google",
                  experience_years: 8,
                  skills: ["React", "Node.js", "Python", "AWS"],
                  notes: "Strong technical background, excellent communication skills"
                }}
                job={{
                  title: "Lead Developer",
                  company: "Tech Corp",
                  skills_required: ["React", "TypeScript", "Leadership"],
                  description: "Leading a team of 5 developers building modern web applications",
                  company_culture: "Fast-paced, innovation-focused, collaborative",
                  ideal_candidate_profile: "Technical leader with strong mentoring abilities"
                }}
              />
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedInterviews.map((interview, i) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">
                            {interview.candidate.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold">{interview.candidate}</h3>
                            <Badge className={
                              interview.recommendation === 'Strongly Recommend' ? 'bg-green-100 text-green-700' :
                              interview.recommendation === 'Recommend' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {interview.recommendation}
                            </Badge>
                          </div>
                          <p className="text-gray-500">{interview.role} • {interview.company}</p>

                          {/* AI Scores */}
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">AI Score</span>
                                <span className="font-bold text-red-600">{interview.aiScore}%</span>
                              </div>
                              <Progress value={interview.aiScore} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Skills</span>
                                <span className="font-bold">{interview.skillScore}%</span>
                              </div>
                              <Progress value={interview.skillScore} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Behavior</span>
                                <span className="font-bold">{interview.behaviorScore}%</span>
                              </div>
                              <Progress value={interview.behaviorScore} className="h-2" />
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-3">{interview.date}</p>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline" className="gap-1">
                              <Play className="w-4 h-4" /> Watch
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <FileText className="w-4 h-4" /> Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="ai-screening">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">AI-Powered Screening</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Send candidates an AI-generated interview link. They complete it on their own time, and our AI analyzes their responses.
                    </p>
                    <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                      <Plus className="w-4 h-4" />
                      Create AI Screening
                    </Button>
                  </CardContent>
                </Card>
                
                <SmartInterviewScheduler 
                  candidate={{ name: 'Sample Candidate', email: 'candidate@example.com' }}
                  job={{ title: 'Sample Role', company: 'Sample Company' }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
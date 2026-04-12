import React, { useState } from 'react';
import { motion } from 'framer-motion';

import {
  Video,
  Calendar,
  Clock,
  User,
  Star,
  Play,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  FileText,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// ... keep the rest of your code (mock data, component logic, return JSX) ...

// Mock data (cleaned from original)
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
];

export default function AIVideoScreeningDemo() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScheduled = scheduledInterviews.filter(interview =>
    interview.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompleted = completedInterviews.filter(interview =>
    interview.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <header className="py-16 md:py-24 text-center bg-gradient-to-r from-red-600 to-red-800 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">AI Video Screening</h1>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto px-6">
          Automated interviews with smart scoring — save hours of manual screening and hire smarter, faster.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              placeholder="Search interviews by candidate or role..."
              className="pl-12 py-7 text-lg rounded-full shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs: Scheduled vs Completed */}
        <Tabs defaultValue="scheduled" className="mb-12">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="scheduled">Upcoming Interviews</TabsTrigger>
            <TabsTrigger value="completed">Completed & Scored</TabsTrigger>
          </TabsList>

          {/* Upcoming Interviews */}
          <TabsContent value="scheduled">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredScheduled.map((interview) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <Video className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{interview.candidate}</CardTitle>
                            <p className="text-sm text-gray-500">{interview.role}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {interview.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <span>{interview.date} at {interview.time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>{interview.company}</span>
                        </div>
                        <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                          Join Interview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredScheduled.length === 0 && (
              <div className="text-center py-20 text-gray-500 text-xl">
                No upcoming interviews match your search.
              </div>
            )}
          </TabsContent>

          {/* Completed Interviews */}
          <TabsContent value="completed">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompleted.map((interview) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{interview.candidate}</CardTitle>
                            <p className="text-sm text-gray-500">{interview.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{interview.aiScore}%</div>
                          <p className="text-xs text-gray-500">AI Score</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Skill Score</span>
                          <span className="font-medium">{interview.skillScore}%</span>
                        </div>
                        <Progress value={interview.skillScore} className="h-2" />
                        <div className="flex justify-between">
                          <span className="text-gray-500">Behavior Score</span>
                          <span className="font-medium">{interview.behaviorScore}%</span>
                        </div>
                        <Progress value={interview.behaviorScore} className="h-2" />
                        <div className="mt-4 pt-4 border-t">
                          <p className="font-medium text-center text-green-600">{interview.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredCompleted.length === 0 && (
              <div className="text-center py-20 text-gray-500 text-xl">
                No completed interviews yet.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <a
            href="/pricing"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-xl text-2xl font-bold transition"
          >
            Unlock Full AI Video Screening
          </a>
          <p className="mt-6 text-gray-600 text-lg">
            Automate interviews, get smart scoring & hire top talent faster — start your free trial today.
          </p>
        </div>
      </main>
    </div>
  );
}
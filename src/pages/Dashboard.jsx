import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Briefcase, Target, TrendingUp, 
  ArrowRight, Sparkles, Clock, CheckCircle2,
  Mail, Video, Building2, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/Dashboard/StatCard';
import PlanUsageCard from '@/components/Dashboard/PlanUsageCard';


const recentCandidates = [
  { name: 'Sarah Johnson', role: 'Senior Developer', match: 95, status: 'shortlisted' },
  { name: 'Michael Chen', role: 'Product Manager', match: 88, status: 'screening' },
  { name: 'Emma Williams', role: 'UX Designer', match: 92, status: 'interview' },
  { name: 'James Brown', role: 'Data Analyst', match: 85, status: 'new' },
];

const activeJobs = [
  { title: 'Senior Software Engineer', company: 'TechCorp', candidates: 45, deadline: '5 days' },
  { title: 'Product Manager', company: 'StartupX', candidates: 32, deadline: '7 days' },
  { title: 'UX/UI Designer', company: 'DesignCo', candidates: 28, deadline: '10 days' },
];

const aiActivities = [
  { icon: Search, text: 'Sourcing 847 candidates from LinkedIn', status: 'active' },
  { icon: Mail, text: 'Sent 23 outreach messages today', status: 'complete' },
  { icon: Video, text: 'Analyzing 5 video interviews', status: 'active' },
  { icon: Target, text: 'Found 12 new hiring leads', status: 'complete' },
];

import { Search } from 'lucide-react';

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // User's current plan (in real app, fetch from user data)
  const currentPlan = {
    name: 'Growth',
    price: 'R2,499',
    limits: {
      users: 5,
      activeJobs: 30,
      currentUsers: 1,
      currentJobs: 24
    },
    features: {
      videoScreening: true,
      clientPortal: true,
      advancedReporting: true,
      whiteLabel: false
    }
  };

 return (
  <div className="min-h-screen bg-gray-50">

        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <TopBar title="Dashboard" subtitle="Welcome back! Here's your recruitment overview." />
        
        <div className="p-8">
          {/* Plan Status Banner */}
          <Card className="border-0 shadow-sm mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">⚡ {currentPlan.name} Plan</h3>
                      <Badge className="bg-purple-600 text-white">{currentPlan.price}/month</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {currentPlan.currentJobs}/{currentPlan.limits.activeJobs} active jobs • {currentPlan.currentUsers}/{currentPlan.limits.users} users
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentPlan.currentJobs >= currentPlan.limits.activeJobs * 0.8 && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Near Limit
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Candidates"
              value="1,847"
              change="+12% this week"
              changeType="positive"
              icon={Users}
              iconBg="bg-blue-50"
            />
            <StatCard
              title="Active Jobs"
              value={`${currentPlan.currentJobs}/${currentPlan.limits.activeJobs}`}
              change="+3 new"
              changeType="positive"
              icon={Briefcase}
              iconBg="bg-green-50"
            />
            <StatCard
              title="Client Leads"
              value="156"
              change="+28 this month"
              changeType="positive"
              icon={Building2}
              iconBg="bg-purple-50"
            />
            <StatCard
              title="Placements"
              value="18"
              change="R450k revenue"
              changeType="positive"
              icon={Target}
              iconBg="bg-red-50"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* AI Features Available */}
            {!currentPlan.features.videoScreening && (
              <Card className="lg:col-span-3 border-2 border-blue-200 bg-blue-50 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Unlock AI Video Screening</h3>
                        <p className="text-sm text-gray-600">
                          Upgrade to Growth or Advance plan to automate candidate interviews with AI scoring
                        </p>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Activity Feed */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">AI Activity</CardTitle>
                  <p className="text-gray-500 text-sm mt-1">Your AI is working 24/7</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 text-sm font-medium">Active</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiActivities.map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.status === 'active' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        <activity.icon className={`w-5 h-5 ${
                          activity.status === 'active' ? 'text-red-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.text}</p>
                      </div>
                      {activity.status === 'active' ? (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                          Running
                        </div>
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </motion.div>
                  ))}
                </div>

                <Button className="w-full mt-6 bg-black hover:bg-gray-900 text-white rounded-xl py-6">
                  <Sparkles className="w-4 h-4 mr-2" />
                  View All AI Activities
                </Button>
              </CardContent>
            </Card>

            {/* Plan Usage & Quick Actions */}
            <div className="space-y-6">
              <PlanUsageCard plan={currentPlan} />
              
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 py-6 rounded-xl border-gray-200 hover:border-red-600 hover:bg-red-50">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">AI Source Candidates</p>
                    <p className="text-xs text-gray-500">Find perfect matches instantly</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 py-6 rounded-xl border-gray-200 hover:border-red-600 hover:bg-red-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Post New Job</p>
                    <p className="text-xs text-gray-500">AI-powered job builder</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 py-6 rounded-xl border-gray-200 hover:border-red-600 hover:bg-red-50">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Find Clients</p>
                    <p className="text-xs text-gray-500">AI discovers hiring companies</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 py-6 rounded-xl border-gray-200 hover:border-red-600 hover:bg-red-50"
                  disabled={!currentPlan.features.videoScreening}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Launch Outreach</p>
                    <p className="text-xs text-gray-500">
                      {currentPlan.features.videoScreening ? 'Automated email sequences' : '⚡ Growth plan required'}
                    </p>
                  </div>
                </Button>
              </CardContent>
            </Card>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Candidates */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Recent Candidates</CardTitle>
                <Button variant="ghost" className="text-red-600 hover:text-red-700">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCandidates.map((candidate, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-600">{candidate.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-gray-500">{candidate.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">{candidate.match}%</p>
                          <p className="text-xs text-gray-500">Match</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          candidate.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                          candidate.status === 'interview' ? 'bg-blue-100 text-blue-700' :
                          candidate.status === 'screening' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {candidate.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Jobs */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Active Jobs</CardTitle>
                <Button variant="ghost" className="text-red-600 hover:text-red-700">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeJobs.map((job, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          {job.deadline}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{job.candidates} candidates</span>
                        </div>
                        <Progress value={Math.random() * 100} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
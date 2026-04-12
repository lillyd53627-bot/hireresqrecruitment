// src/pages/Dashboard/AISmartReporting.jsx
import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Briefcase, DollarSign, Calendar, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AISmartReporting() {
  const { currentPlan } = useOutletContext();
  const navigate = useNavigate();   // ← This was missing or out of scope

  const hasAdvancedReporting = ['growth', 'advance'].includes(currentPlan?.plan || '');

  // Upgrade gate
  if (!hasAdvancedReporting) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
            <TrendingUp className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Smart Reporting & Analytics</h2>
          <p className="text-xl text-gray-600 mb-10">
            Real-time insights, performance dashboards, and AI-powered recruitment analytics.
          </p>
          <Button 
            onClick={() => navigate('/pricing')} 
            className="bg-red-600 hover:bg-red-700 text-lg px-10 py-6"
          >
            Upgrade to Unlock Smart Reporting
          </Button>
        </div>
      </div>
    );
  }

  const [timeRange, setTimeRange] = useState('6months');

  const stats = [
    { label: 'Total Candidates', value: '1,847', change: '+12.5%', trend: 'up', icon: Users, color: 'text-blue-600' },
    { label: 'Placements', value: '103', change: '+8.2%', trend: 'up', icon: Briefcase, color: 'text-green-600' },
    { label: 'Revenue', value: 'R2.4M', change: '+15.3%', trend: 'up', icon: DollarSign, color: 'text-red-600' },
    { label: 'Avg. Time to Hire', value: '18 days', change: '-3 days', trend: 'down', icon: Calendar, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Smart Reporting</h1>
          <p className="text-gray-600">Real-time analytics and recruitment insights</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 mt-4 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border border-dashed border-gray-300 rounded-xl">
            <div className="text-center">
              <p className="text-gray-500">Interactive Charts Coming Soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { source: "LinkedIn", value: "45%", color: "bg-blue-600" },
                { source: "Indeed", value: "25%", color: "bg-indigo-600" },
                { source: "Referrals", value: "15%", color: "bg-green-600" },
                { source: "Job Boards", value: "10%", color: "bg-purple-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.source}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded mt-2 overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Recent AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "AI detected 23% faster time-to-hire for React roles this quarter",
            "Candidate sourcing from Cape Town yielded 42% higher match scores",
            "Outreach campaigns showed 18% reply rate improvement after AI personalization",
          ].map((insight, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl border-l-4 border-red-500">
              {insight}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Briefcase, DollarSign,
  Calendar, ArrowUp, ArrowDown, Download, Filter
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Mock data (cleaned from original)
const monthlyData = [
  { name: 'Jul', candidates: 120, placements: 8, revenue: 180000 },
  { name: 'Aug', candidates: 150, placements: 12, revenue: 280000 },
  { name: 'Sep', candidates: 180, placements: 15, revenue: 350000 },
  { name: 'Oct', candidates: 220, placements: 18, revenue: 420000 },
  { name: 'Nov', candidates: 280, placements: 22, revenue: 520000 },
  { name: 'Dec', candidates: 350, placements: 28, revenue: 680000 },
];

const sourceData = [
  { name: 'LinkedIn', value: 45, color: '#0077B5' },
  { name: 'Indeed', value: 25, color: '#003A9B' },
  { name: 'Referrals', value: 15, color: '#10B981' },
  { name: 'Job Boards', value: 10, color: '#8B5CF6' },
  { name: 'Other', value: 5, color: '#6B7280' },
];

const jobMetrics = [
  { job: 'Senior Developer', applications: 85, interviews: 12, offers: 3 },
  { job: 'Product Manager', applications: 65, interviews: 8, offers: 2 },
  { job: 'UX Designer', applications: 45, interviews: 6, offers: 1 },
  { job: 'Data Analyst', applications: 38, interviews: 5, offers: 2 },
];

export default function AISmartReportingDemo() {
  const [timeRange, setTimeRange] = useState('6months');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <header className="py-16 md:py-24 text-center bg-gradient-to-r from-red-600 to-red-800 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Smart Reporting</h1>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto px-6">
          Real-time analytics and insights — see your pipeline, placements, and revenue at a glance.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Time Range Filter */}
        <div className="mb-12 flex justify-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[220px] py-7 text-lg rounded-full shadow-lg">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { label: 'Total Candidates', value: '1,847', change: '+12.5%', trend: 'up', icon: Users, color: 'bg-blue-50 text-blue-600' },
            { label: 'Placements', value: '103', change: '+8.2%', trend: 'up', icon: Briefcase, color: 'bg-green-50 text-green-600' },
            { label: 'Revenue', value: 'R2.4M', change: '+15.3%', trend: 'up', icon: DollarSign, color: 'bg-red-50 text-red-600' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <p className="text-4xl font-bold mt-6">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-2">{stat.label}</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-green-600 font-medium">{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Monthly Trends */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="candidates" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="placements" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Source Breakdown */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Candidate Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <a
            href="/pricing"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-xl text-2xl font-bold transition"
          >
            Unlock Full Smart Reporting
          </a>
          <p className="mt-6 text-gray-600 text-lg">
            Real-time dashboards, revenue tracking & pipeline insights — start your free trial today.
          </p>
        </div>
      </main>
    </div>
  );
}
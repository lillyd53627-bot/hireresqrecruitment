import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, Briefcase, DollarSign,
  Calendar, ArrowUp, ArrowDown, Download, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';

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

export default function Analytics() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState('6months');

  const stats = [
    { 
      label: 'Total Candidates', 
      value: '1,847', 
      change: '+12.5%', 
      trend: 'up',
      icon: Users,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      label: 'Placements', 
      value: '103', 
      change: '+8.2%', 
      trend: 'up',
      icon: Briefcase,
      color: 'bg-green-50 text-green-600'
    },
    { 
      label: 'Revenue', 
      value: 'R2.4M', 
      change: '+15.3%', 
      trend: 'up',
      icon: DollarSign,
      color: 'bg-red-50 text-red-600'
    },
    { 
      label: 'Time to Hire', 
      value: '18 days', 
      change: '-3 days', 
      trend: 'down',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="Analytics" 
          subtitle="Track your recruitment performance"
        />
        
        <div className="p-8">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-8">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <Badge className={stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {stat.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {stat.change}
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Revenue & Placements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: 'none', 
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#DC2626" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Source Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Candidate Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${value}%`}
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {sourceData.map((source, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                        <span>{source.name}</span>
                      </div>
                      <span className="font-medium">{source.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Performance */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Job Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobMetrics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#6B7280" fontSize={12} />
                    <YAxis dataKey="job" type="category" stroke="#6B7280" fontSize={12} width={120} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="applications" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Applications" />
                    <Bar dataKey="interviews" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Interviews" />
                    <Bar dataKey="offers" fill="#DC2626" radius={[0, 4, 4, 0]} name="Offers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
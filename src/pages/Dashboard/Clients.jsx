import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Building2, Users, Briefcase,
  Mail, Phone, Globe, MoreVertical, Star,
  TrendingUp, DollarSign, Calendar, ChevronRight,
  Target, Zap, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';

const clients = [
  {
    id: 1,
    name: 'TechCorp SA',
    industry: 'Technology',
    location: 'Cape Town',
    contact: 'John Smith',
    email: 'john@techcorp.co.za',
    phone: '+27 21 123 4567',
    website: 'techcorp.co.za',
    status: 'active',
    activeJobs: 5,
    totalHires: 12,
    revenue: 'R450,000',
    lastContact: '2 days ago'
  },
  {
    id: 2,
    name: 'FinanceHub',
    industry: 'Finance',
    location: 'Johannesburg',
    contact: 'Sarah Johnson',
    email: 'sarah@financehub.co.za',
    phone: '+27 11 234 5678',
    website: 'financehub.co.za',
    status: 'active',
    activeJobs: 3,
    totalHires: 8,
    revenue: 'R280,000',
    lastContact: '1 week ago'
  },
  {
    id: 3,
    name: 'RetailMax',
    industry: 'Retail',
    location: 'Durban',
    contact: 'Michael Chen',
    email: 'michael@retailmax.co.za',
    phone: '+27 31 345 6789',
    website: 'retailmax.co.za',
    status: 'pending',
    activeJobs: 0,
    totalHires: 0,
    revenue: 'R0',
    lastContact: '3 days ago'
  },
];

const leads = [
  {
    id: 1,
    name: 'InnovateCo',
    industry: 'Technology',
    location: 'Pretoria',
    website: 'innovateco.co.za',
    hiringSignal: 'High',
    openRoles: 8,
    source: 'LinkedIn',
    score: 92
  },
  {
    id: 2,
    name: 'GrowthStart',
    industry: 'Startup',
    location: 'Cape Town',
    website: 'growthstart.io',
    hiringSignal: 'High',
    openRoles: 5,
    source: 'Job Board',
    score: 88
  },
  {
    id: 3,
    name: 'Enterprise SA',
    industry: 'Enterprise',
    location: 'Johannesburg',
    website: 'enterprise.co.za',
    hiringSignal: 'Medium',
    openRoles: 12,
    source: 'AI Discovery',
    score: 85
  },
];

export default function Clients() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="Client Management" 
          subtitle="Manage clients and discover new leads"
        />
        
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Clients', value: '48', icon: Building2, color: 'bg-blue-50 text-blue-600' },
              { label: 'Active Jobs', value: '24', icon: Briefcase, color: 'bg-green-50 text-green-600' },
              { label: 'New Leads', value: '156', icon: Target, color: 'bg-purple-50 text-purple-600' },
              { label: 'Revenue YTD', value: 'R2.4M', icon: DollarSign, color: 'bg-red-50 text-red-600' },
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
                <TabsTrigger value="clients" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  <Building2 className="w-4 h-4 mr-2" />
                  Clients
                </TabsTrigger>
                <TabsTrigger value="leads" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  <Target className="w-4 h-4 mr-2" />
                  AI Leads
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-64 bg-white border-gray-200"
                  />
                </div>
                {activeTab === 'clients' ? (
                  <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Add Client
                  </Button>
                ) : (
                  <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Zap className="w-4 h-4" />
                    Find More Leads
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="clients" className="space-y-4">
              {clients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-7 h-7 text-gray-400" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">{client.name}</h3>
                                <Badge className={client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                  {client.status}
                                </Badge>
                              </div>
                              <p className="text-gray-500">{client.industry}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" /> {client.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" /> {client.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Globe className="w-4 h-4" /> {client.website}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-blue-600">{client.activeJobs}</p>
                              <p className="text-xs text-gray-500">Active Jobs</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-green-600">{client.totalHires}</p>
                              <p className="text-xs text-gray-500">Total Hires</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-red-600">{client.revenue}</p>
                              <p className="text-xs text-gray-500">Revenue</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-sm font-medium text-gray-600">{client.lastContact}</p>
                              <p className="text-xs text-gray-500">Last Contact</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Add Job</DropdownMenuItem>
                              <DropdownMenuItem>Send Email</DropdownMenuItem>
                              <DropdownMenuItem>Schedule Call</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="leads" className="space-y-4">
              <Card className="border-0 shadow-sm bg-gradient-to-r from-red-600 to-red-700 text-white mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">AI Client Discovery</h3>
                      <p className="text-white/80 mt-1">AI found 156 companies actively hiring this week</p>
                    </div>
                    <Button className="bg-white text-red-600 hover:bg-gray-100 gap-2">
                      <Zap className="w-4 h-4" />
                      Run AI Scan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {leads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Target className="w-7 h-7 text-red-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold">{lead.name}</h3>
                            <Badge className="bg-green-100 text-green-700">
                              {lead.hiringSignal} Intent
                            </Badge>
                            <Badge variant="outline">{lead.source}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{lead.industry}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" /> {lead.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" /> {lead.openRoles} open roles
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 text-lg font-bold text-red-600">
                            <Star className="w-5 h-5" />
                            {lead.score}%
                          </div>
                          <p className="text-xs text-gray-500">Lead Score</p>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Mail className="w-4 h-4" /> Outreach
                          </Button>
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            Convert
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
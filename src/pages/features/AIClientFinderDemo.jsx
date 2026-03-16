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

// Mock data (same as original, cleaned up)
const mockClients = [
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

export default function AIClientFinderDemo() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <header className="py-16 md:py-24 text-center bg-gradient-to-r from-red-600 to-red-800 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">AI Client Finder</h1>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto px-6">
          Automatically discover companies actively hiring — before your competitors do.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              placeholder="Search companies by name, industry or location..."
              className="pl-12 py-7 text-lg rounded-full shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{client.name}</CardTitle>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" /> {client.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className={client.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                      {client.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Industry</p>
                      <p className="font-medium">{client.industry}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Active Jobs</p>
                      <p className="font-medium">{client.activeJobs}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Hires</p>
                      <p className="font-medium">{client.totalHires}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-medium text-green-600">{client.revenue}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Last contact: {client.lastContact}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-xl">
            No companies match your search — try broadening your criteria!
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <a
            href="/pricing"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-xl text-2xl font-bold transition"
          >
            Unlock Full AI Client Finder
          </a>
          <p className="mt-6 text-gray-600 text-lg">
            Get real-time hiring signals, company insights & lead generation — start your free trial today.
          </p>
        </div>
      </main>
    </div>
  );
}
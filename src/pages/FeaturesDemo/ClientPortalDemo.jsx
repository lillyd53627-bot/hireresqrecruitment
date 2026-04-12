import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Mail, Phone, Globe, DollarSign, Briefcase, Users, FileText } from 'lucide-react';

// Mock data based on your original schema (expanded)
const mockClients = [
  {
    id: 1,
    name: 'TechCorp SA',
    industry: 'Technology',
    location: 'Cape Town, SA',
    contact_name: 'Sarah Johnson',
    contact_email: 'sarah@techcorp.co.za',
    contact_phone: '+27 21 555 1234',
    website: 'https://techcorp.co.za',
    status: 'active',
    source: 'ai_discovery',
    lead_score: 92,
    total_revenue: 450000,
    active_jobs: 8,
    total_hires: 14,
    notes: 'High-priority client. Looking for senior AI engineers.',
  },
  {
    id: 2,
    name: 'RetailMax',
    industry: 'Retail',
    location: 'Johannesburg, SA',
    contact_name: 'Michael Chen',
    contact_email: 'michael@retailmax.co.za',
    contact_phone: '+27 11 777 5678',
    website: 'https://retailmax.co.za',
    status: 'prospect',
    source: 'linkedin',
    lead_score: 78,
    total_revenue: 0,
    active_jobs: 3,
    total_hires: 0,
    notes: 'Interested in candidate portal demo.',
  },
  {
    id: 3,
    name: 'FinanceHub',
    industry: 'Finance',
    location: 'Durban, SA',
    contact_name: 'Emma Williams',
    contact_email: 'emma@financehub.co.za',
    contact_phone: '+27 31 222 9012',
    website: 'https://financehub.co.za',
    status: 'lead',
    source: 'cold_outreach',
    lead_score: 65,
    total_revenue: 0,
    active_jobs: 0,
    total_hires: 0,
    notes: 'Initial contact made last week.',
  },
];

export default function ClientPortalDemo() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Client Portal Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            This is the public mock version. Real version is in dashboard for paid users.
          </p>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search clients by name, industry or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-red-600">{mockClients.length}</p>
              <p className="text-gray-600">Total Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {mockClients.filter(c => c.status === 'active').length}
              </p>
              <p className="text-gray-600">Active Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">
                R{mockClients.reduce((sum, c) => sum + c.total_revenue, 0).toLocaleString()}
              </p>
              <p className="text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Client Table */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-2xl">Your Clients Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry / Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status / Source</TableHead>
                  <TableHead>Lead Score</TableHead>
                  <TableHead>Revenue / Jobs / Hires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                      No clients match your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p>{client.name}</p>
                            <p className="text-sm text-gray-500">{client.website}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.industry}<br />
                        <span className="text-sm text-gray-500">{client.location}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{client.contact_name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-4 h-4" /> {client.contact_email}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-4 h-4" /> {client.contact_phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">{client.source}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">{client.lead_score}</span>
                          <span className="text-sm text-gray-500">/100</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            R{client.total_revenue.toLocaleString()}
                          </p>
                          <p className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            {client.active_jobs} active / {client.total_hires} hires
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center text-gray-500 mt-12 text-lg">
          Full features (real-time updates, document sharing, payment tracking, etc.) available in paid dashboard.
        </p>
      </div>
    </div>
  );
}
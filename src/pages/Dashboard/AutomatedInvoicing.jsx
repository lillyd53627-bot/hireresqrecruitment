// src/pages/Dashboard/AutomatedInvoicing.jsx
import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FileText, Plus, Download, Send, Check, Clock, DollarSign, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function AutomatedInvoicing() {
  const { currentPlan } = useOutletContext();
  const navigate = useNavigate();

  const hasInvoicing = ['growth', 'advance'].includes(currentPlan?.plan || '');

  // Upgrade gate
  if (!hasInvoicing) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-8">
          <DollarSign className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-4xl font-bold mb-4">Automated Invoicing</h2>
        <p className="text-xl text-gray-600 max-w-md mx-auto mb-10">
          Get paid faster with auto-billing, smart reminders, and professional invoices.
        </p>
        <Button 
          onClick={() => navigate('/pricing')} 
          className="bg-red-600 hover:bg-red-700 text-lg px-10 py-6"
        >
          Upgrade to Growth or Advance
        </Button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const invoices = [
    {
      id: 'INV-001',
      client: 'TechCorp Solutions',
      amount: 45000,
      status: 'paid',
      date: '2026-03-10',
      dueDate: '2026-03-25',
      description: '3 placements - Senior Developer roles'
    },
    {
      id: 'INV-002',
      client: 'Innovation Labs',
      amount: 32000,
      status: 'pending',
      date: '2026-03-15',
      dueDate: '2026-03-30',
      description: '2 placements - Product Manager & Designer'
    },
    {
      id: 'INV-003',
      client: 'Digital Dynamics',
      amount: 28500,
      status: 'overdue',
      date: '2026-03-05',
      dueDate: '2026-03-20',
      description: 'Marketing Manager placement'
    },
    {
      id: 'INV-004',
      client: 'StartUp Hub',
      amount: 52000,
      status: 'paid',
      date: '2026-03-12',
      dueDate: '2026-03-27',
      description: '4 placements - Various roles'
    },
  ];

  const filteredInvoices = invoices
    .filter(inv => activeTab === 'all' || inv.status === activeTab)
    .filter(inv => 
      inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const statusColors = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Automated Invoicing</h1>
          <p className="text-gray-600">Get paid faster with smart auto-billing</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create New Invoice
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue (Paid)</p>
                <p className="text-3xl font-bold mt-2">R{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending / Overdue</p>
                <p className="text-3xl font-bold mt-2 text-amber-600">R{pendingAmount.toLocaleString()}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Invoices This Month</p>
                <p className="text-3xl font-bold mt-2">{invoices.length}</p>
              </div>
              <FileText className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3 text-gray-400" />
          <Input
            placeholder="Search invoices or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{invoice.client}</div>
                    <div className="text-sm text-gray-600">{invoice.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Issued {invoice.date} • Due {invoice.dueDate}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-6 md:gap-12">
                  <div className="text-right md:text-left">
                    <div className="text-2xl font-bold">R{(invoice.amount / 1000).toFixed(0)}k</div>
                    <Badge className={statusColors[invoice.status]}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="w-4 h-4" /> PDF
                    </Button>
                    {invoice.status !== 'paid' && (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send Reminder
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              No invoices found matching your filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
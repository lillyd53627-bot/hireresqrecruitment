import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Plus, Download, Send, Check, Clock, 
  DollarSign, Calendar, Search, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';

const invoices = [
  {
    id: 'INV-001',
    client: 'TechCorp Solutions',
    amount: 45000,
    status: 'paid',
    date: '2024-01-15',
    dueDate: '2024-01-30',
    description: '3 placements - Senior Developer roles'
  },
  {
    id: 'INV-002',
    client: 'Innovation Labs',
    amount: 32000,
    status: 'pending',
    date: '2024-01-20',
    dueDate: '2024-02-05',
    description: '2 placements - Product Manager, Designer'
  },
  {
    id: 'INV-003',
    client: 'Digital Dynamics',
    amount: 28500,
    status: 'overdue',
    date: '2024-01-10',
    dueDate: '2024-01-25',
    description: '2 placements - Marketing Manager'
  },
  {
    id: 'INV-004',
    client: 'StartUp Hub',
    amount: 52000,
    status: 'paid',
    date: '2024-01-18',
    dueDate: '2024-02-02',
    description: '4 placements - Various roles'
  },
];

const statusColors = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
};

export default function Invoicing() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredInvoices = activeTab === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === activeTab);

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="Automated Invoicing" 
          subtitle="Get paid faster with smart billing"
        />
        
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-700">+12%</Badge>
                </div>
                <h3 className="text-2xl font-bold">R{totalRevenue.toLocaleString()}</h3>
                <p className="text-gray-500 text-sm mt-1">Total Revenue</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">R{pendingAmount.toLocaleString()}</h3>
                <p className="text-gray-500 text-sm mt-1">Pending Payment</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold">{invoices.length}</h3>
                <p className="text-gray-500 text-sm mt-1">Total Invoices</p>
              </CardContent>
            </Card>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Invoice
            </Button>
          </div>

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="all" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                All ({invoices.length})
              </TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Invoices List */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredInvoices.map((invoice, i) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold">{invoice.id}</h3>
                            <Badge className={statusColors[invoice.status]}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{invoice.client}</p>
                          <p className="text-xs text-gray-400 mt-1">{invoice.description}</p>
                        </div>
                      </div>

                      <div className="text-right mr-6">
                        <div className="text-2xl font-bold">R{invoice.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        {invoice.status === 'pending' && (
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 gap-2">
                            <Send className="w-4 h-4" />
                            Send Reminder
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold mb-2">Create Invoice</h3>
                <p className="text-sm text-gray-600">Generate a new invoice in seconds</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">Schedule Auto-Invoice</h3>
                <p className="text-sm text-gray-600">Set up recurring invoices</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Payment Settings</h3>
                <p className="text-sm text-gray-600">Manage payment methods</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
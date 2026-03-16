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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Mock invoice data (same as original, cleaned up)
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

export default function AutomatedInvoicingDemo() {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <header className="py-16 md:py-24 text-center bg-gradient-to-r from-red-600 to-red-800 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Automated Invoicing</h1>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto px-6">
          Get paid faster with auto-billing, smart reminders & one-click invoicing — never chase payments again.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="border-0 shadow-xl text-center">
            <CardContent className="pt-8">
              <DollarSign className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <p className="text-4xl font-bold">R{totalRevenue.toLocaleString()}</p>
              <p className="text-lg text-gray-600 mt-2">Total Paid Revenue</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl text-center">
            <CardContent className="pt-8">
              <Clock className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
              <p className="text-4xl font-bold">R{pendingAmount.toLocaleString()}</p>
              <p className="text-lg text-gray-600 mt-2">Pending Payments</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl text-center">
            <CardContent className="pt-8">
              <Check className="w-12 h-12 mx-auto text-red-600 mb-4" />
              <p className="text-4xl font-bold">{invoices.filter(i => i.status === 'paid').length}</p>
              <p className="text-lg text-gray-600 mt-2">Invoices Paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Tabs & List */}
        <Tabs defaultValue="all" className="mb-12">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInvoices.map((invoice) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{invoice.client}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{invoice.description}</p>
                        </div>
                        <Badge className={statusColors[invoice.status]}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount</span>
                          <span className="font-bold text-lg">R{invoice.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Issued</span>
                          <span>{invoice.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Due</span>
                          <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                            {invoice.dueDate}
                          </span>
                        </div>
                        <div className="pt-4 flex gap-3">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Send className="w-4 h-4 mr-2" />
                            Resend
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-20 text-gray-500 text-xl">
                No invoices match the selected filter.
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
            Unlock Full Automated Invoicing
          </a>
          <p className="mt-6 text-gray-600 text-lg">
            Auto-generate invoices, send reminders & get paid faster — start your free trial today.
          </p>
        </div>
      </main>
    </div>
  );
}
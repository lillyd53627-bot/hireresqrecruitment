import React, { useState } from 'react';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Download, RefreshCw, ExternalLink } from 'lucide-react';

export default function AdminPayments() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock payment data - in production, fetch from Paystack API or transaction logs
  const mockPayments = [
    { id: 1, date: '2026-02-08', user: 'john@company.com', amount: 3999, status: 'success', reference: 'PAY_xyz123' },
    { id: 2, date: '2026-02-07', user: 'jane@agency.com', amount: 1549, status: 'success', reference: 'PAY_abc456' },
    { id: 3, date: '2026-02-06', user: 'bob@recruit.co.za', amount: 7999, status: 'failed', reference: 'PAY_def789' },
    { id: 4, date: '2026-02-05', user: 'alice@talent.com', amount: 14999, status: 'success', reference: 'PAY_ghi012' },
    { id: 5, date: '2026-02-04', user: 'mike@hr.co.za', amount: 3999, status: 'refunded', reference: 'PAY_jkl345' }
  ];

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <AdminTopBar 
            title="Payment History" 
            subtitle="View all transactions and payment activity"
          />
          
          <main className="p-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm">
                          {new Date(payment.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payment.user}</TableCell>
                        <TableCell className="font-medium">
                          R{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              payment.status === 'success' ? 'bg-green-100 text-green-700' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                              payment.status === 'refunded' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {payment.reference}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {payment.status === 'failed' && (
                              <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Retry
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Loader2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminAuditLogs() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: () => base44.entities.AdminAuditLog.list('-created_date', 100)
  });

  const getActionColor = (actionType) => {
    if (actionType.includes('suspended') || actionType.includes('banned') || actionType.includes('deleted')) {
      return 'bg-red-100 text-red-700';
    }
    if (actionType.includes('activated') || actionType.includes('login')) {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-blue-100 text-blue-700';
  };

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <AdminTopBar 
            title="Audit Logs" 
            subtitle="Complete history of admin actions for compliance"
          />
          
          <main className="p-6">
            <div className="mb-4 flex justify-end">
              <Button variant="outline">
                <FileDown className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target User</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.created_date).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{log.admin_email}</TableCell>
                        <TableCell>
                          <Badge className={getActionColor(log.action_type)}>
                            {log.action_type.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.target_user_email || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {log.reason || '-'}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {log.ip_address || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {logs?.length === 0 && (
                  <div className="py-12 text-center text-gray-500">
                    No audit logs found
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
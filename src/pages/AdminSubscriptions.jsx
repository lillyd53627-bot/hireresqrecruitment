import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowUpDown, AlertTriangle } from 'lucide-react';

export default function AdminSubscriptions() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: () => base44.entities.UserSubscription.list('-created_date')
  });

  const getPlanLimits = (planId) => {
    const limits = {
      starter: { jobs: 5, matches: 25 },
      growth: { jobs: 15, matches: 100 },
      advance: { jobs: 50, matches: 999999 },
      pro: { jobs: 999999, matches: 999999 }
    };
    return limits[planId] || { jobs: 0, matches: 0 };
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === 999999) return 0;
    return Math.min((used / limit) * 100, 100);
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
            title="Subscriptions & Plans" 
            subtitle="Manage user subscriptions and monitor usage"
          />
          
          <main className="p-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage (Jobs)</TableHead>
                      <TableHead>Usage (Matches)</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions?.map((sub) => {
                      const limits = getPlanLimits(sub.plan_id);
                      const jobsUsage = getUsagePercentage(sub.usage_jobs || 0, limits.jobs);
                      const matchesUsage = getUsagePercentage(sub.usage_matches || 0, limits.matches);
                      const isOverLimit = jobsUsage > 100 || matchesUsage > 100;

                      return (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sub.user_name}</p>
                              <p className="text-xs text-gray-500">{sub.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="capitalize">{sub.plan_id}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            R{sub.plan_price?.toLocaleString()}/mo
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                sub.status === 'active' ? 'bg-green-100 text-green-700' :
                                sub.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                sub.status === 'past_due' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }
                            >
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Progress value={jobsUsage} className="h-2 flex-1" />
                                <span className="text-xs text-gray-600 min-w-[60px]">
                                  {sub.usage_jobs || 0}/{limits.jobs === 999999 ? '∞' : limits.jobs}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Progress value={matchesUsage} className="h-2 flex-1" />
                                <span className="text-xs text-gray-600 min-w-[60px]">
                                  {sub.usage_matches || 0}/{limits.matches === 999999 ? '∞' : limits.matches}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {sub.next_billing_date 
                              ? new Date(sub.next_billing_date).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isOverLimit && (
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                              )}
                              <Button variant="outline" size="sm">
                                <ArrowUpDown className="w-4 h-4 mr-1" />
                                Change Plan
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {subscriptions?.length === 0 && (
                  <div className="py-12 text-center text-gray-500">
                    No subscriptions found
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

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import MetricsCard from '@/components/admin/MetricsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: () => base44.entities.UserSubscription.list()
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['adminRecentActivity'],
    queryFn: async () => {
      const logs = await base44.entities.AdminAuditLog.list('-created_date', 10);
      return logs;
    }
  });

  const calculateMetrics = () => {
    if (!users || !subscriptions) return null;

    const totalUsers = users.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    
    const mrr = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.plan_price || 0), 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newSignups = users.filter(u => 
      new Date(u.created_date) >= thirtyDaysAgo
    ).length;

    const planDistribution = subscriptions.reduce((acc, s) => {
      acc[s.plan_id] = (acc[s.plan_id] || 0) + 1;
      return acc;
    }, {});

    const alerts = subscriptions.filter(s => 
      s.status === 'past_due' || s.usage_jobs > 100 || s.usage_matches > 1000
    ).length;

    return { totalUsers, activeSubscriptions, mrr, newSignups, planDistribution, alerts };
  };

  const metrics = calculateMetrics();

  if (usersLoading || subsLoading) {
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
            title="Admin Dashboard" 
            subtitle="Platform overview and key metrics"
          />
          
          <main className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricsCard
                title="Total Users"
                value={metrics?.totalUsers || 0}
                change="+12%"
                trend="up"
                icon={Users}
              />
              <MetricsCard
                title="Active Subscriptions"
                value={metrics?.activeSubscriptions || 0}
                change="+8%"
                trend="up"
                icon={Activity}
              />
              <MetricsCard
                title="Monthly Recurring Revenue"
                value={`R${(metrics?.mrr || 0).toLocaleString()}`}
                change="+15%"
                trend="up"
                icon={DollarSign}
              />
              <MetricsCard
                title="New Signups (30d)"
                value={metrics?.newSignups || 0}
                change="-3%"
                trend="down"
                icon={TrendingUp}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plan Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics?.planDistribution && Object.entries(metrics.planDistribution).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        <span className="font-medium capitalize">{plan}</span>
                      </div>
                      <Badge>{count} users</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : recentActivity?.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.action_type.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-600">{log.admin_email}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.created_date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm py-8 text-center">No recent activity</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {metrics?.alerts > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-900">
                      {metrics.alerts} Account{metrics.alerts > 1 ? 's' : ''} Need Attention
                    </p>
                    <p className="text-sm text-orange-700">
                      Overdue payments, usage overages, or suspended accounts detected
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
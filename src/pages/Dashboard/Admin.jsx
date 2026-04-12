// src/pages/Dashboard/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function Admin() {
  const { currentPlan } = useOutletContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    avgUsage: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Only allow Growth/Advance + Admin check (you can enhance this later)
  const isAdmin = currentPlan?.plan === 'advance'; // or add role check

  useEffect(() => {
    if (!isAdmin) return;

    const fetchAdminData = async () => {
      setLoading(true);

      // Get all profiles for admin overview
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profiles) {
        const totalRevenue = profiles.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
        const activeSubs = profiles.filter(p => p.status === 'active').length;

        setUsers(profiles);
        setStats({
          totalUsers: profiles.length,
          totalRevenue,
          activeSubscriptions: activeSubs,
          avgUsage: profiles.length > 0 
            ? Math.round(profiles.reduce((sum, p) => sum + (p.current_jobs || 0), 0) / profiles.length) 
            : 0
        });
      }

      setLoading(false);
    };

    fetchAdminData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">This page is restricted to administrators only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <Users className="w-8 h-8 text-blue-600 mb-4" />
            <p className="text-4xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <DollarSign className="w-8 h-8 text-green-600 mb-4" />
            <p className="text-4xl font-bold">R{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <TrendingUp className="w-8 h-8 text-purple-600 mb-4" />
            <p className="text-4xl font-bold">{stats.activeSubscriptions}</p>
            <p className="text-sm text-gray-500">Active Subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Shield className="w-8 h-8 text-amber-600 mb-4" />
            <p className="text-4xl font-bold">{stats.avgUsage}</p>
            <p className="text-sm text-gray-500">Avg Jobs Used</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users & Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4">User</th>
                  <th className="text-left py-4">Plan</th>
                  <th className="text-center py-4">Revenue</th>
                  <th className="text-center py-4">Jobs Used</th>
                  <th className="text-center py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline">{user.plan_name || user.plan}</Badge>
                    </td>
                    <td className="py-4 text-center font-medium">
                      R{user.total_revenue?.toLocaleString() || 0}
                    </td>
                    <td className="py-4 text-center">
                      {user.current_jobs || 0} / {user.max_jobs || 5}
                    </td>
                    <td className="py-4 text-center">
                      <Badge className={user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {user.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
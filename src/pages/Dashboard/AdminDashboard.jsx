import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, LogOut, Shield, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [impersonating, setImpersonating] = useState(null);

  // Load paid users
  useEffect(() => {
    const fetchPaidUsers = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          user_id,
          plan,
          amount,
          currency,
          status,
          created_at,
          profiles:users!user_id (id, email, full_name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Failed to load users");
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchPaidUsers();
  }, []);

  const getRenewalDate = (createdAt) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const impersonateUser = async (userId, userEmail) => {
    try {
      localStorage.setItem('impersonating_user_id', userId);
      localStorage.setItem('is_admin_impersonating', 'true');
      
      setImpersonating(userId);
      toast.success(`Now viewing as ${userEmail}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error("Failed to impersonate user");
    }
  };

  const exitImpersonation = () => {
    localStorage.removeItem('impersonating_user_id');
    localStorage.removeItem('is_admin_impersonating');
    setImpersonating(null);
    toast.success("Returned to admin mode");
    navigate('/dashboard/admin');
  };

  const exportToCSV = () => {
    const csvRows = [
      ['Name', 'Email', 'Plan', 'Amount', 'Currency', 'Renewal Date', 'Joined']
    ];

    filteredUsers.forEach(user => {
      const profile = user.profiles || {};
      csvRows.push([
        profile.full_name || 'N/A',
        profile.email || 'N/A',
        user.plan || 'N/A',
        user.amount || '0',
        user.currency || 'ZAR',
        getRenewalDate(user.created_at),
        new Date(user.created_at).toLocaleDateString('en-ZA')
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paid_users_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  const filteredUsers = users.filter(u => 
    (u.profiles?.email?.toLowerCase().includes(search.toLowerCase()) || 
     u.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return <div className="p-8 text-center">Loading paid users...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage paid users • View dashboards • Export data</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={exportToCSV} className="gap-2 bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4" /> Export to CSV
          </Button>
          
          {impersonating && (
            <Button onClick={exitImpersonation} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" /> Exit Impersonation
            </Button>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              Paid Users ({filteredUsers.length})
            </CardTitle>
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-6 font-medium">User</th>
                  <th className="text-left py-4 px-6 font-medium">Plan</th>
                  <th className="text-left py-4 px-6 font-medium">Amount</th>
                  <th className="text-left py-4 px-6 font-medium">Renewal Date</th>
                  <th className="text-left py-4 px-6 font-medium">Joined</th>
                  <th className="text-right py-4 px-6 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((sub) => {
                  const profile = sub.profiles || {};
                  return (
                    <tr key={sub.user_id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold">
                            {profile.full_name ? profile.full_name[0].toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="font-medium">{profile.full_name || 'Unnamed User'}</div>
                            <div className="text-sm text-gray-500">{profile.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className="bg-green-100 text-green-700 capitalize">
                          {sub.plan}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 font-medium">
                        {sub.currency || 'R'} {sub.amount || '0'}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {getRenewalDate(sub.created_at)}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(sub.created_at).toLocaleDateString('en-ZA')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button 
                          onClick={() => impersonateUser(sub.user_id, profile.email)}
                          className="bg-red-600 hover:bg-red-700 gap-2"
                        >
                          <Eye className="w-4 h-4" /> View Dashboard
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500">
                      No paid users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
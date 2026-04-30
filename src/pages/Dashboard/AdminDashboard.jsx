import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, LogOut, Shield, Download, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [impersonating, setImpersonating] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ============================
  // LOAD PAID USERS
  // ============================
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

  // ============================
  // BULK PDF CV UPLOAD (NEW)
  // ============================
  const handleBulkUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    try {
      for (const file of files) {

        if (file.type !== "application/pdf") {
          console.warn("Skipping non-PDF:", file.name);
          continue;
        }

        const fileName = `${Date.now()}-${file.name}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(fileName, file);

        if (uploadError) {
          console.error(uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('cvs')
          .getPublicUrl(fileName);

        const cvUrl = urlData?.publicUrl;

        if (!cvUrl) {
          console.error("No CV URL");
          continue;
        }

        console.log("Uploaded CV:", cvUrl);

        // Call parse function
        const response = await fetch(
          'https://tlzipklqaxiupbhggbnm.supabase.co/functions/v1/parse-cv',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ cv_url: cvUrl })
          }
        );

        const result = await response.json();

        if (!result.success) {
          console.error("Parse failed:", result);
          continue;
        }

        successCount++;
      }

      toast.success(`✅ ${successCount} CV(s) uploaded & parsed`);

    } catch (err) {
      console.error(err);
      toast.error("Bulk upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ============================
  // HELPERS
  // ============================
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
    localStorage.setItem('impersonating_user_id', userId);
    localStorage.setItem('is_admin_impersonating', 'true');

    setImpersonating(userId);
    toast.success(`Now viewing as ${userEmail}`);
    navigate('/dashboard');
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

    const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paid_users.csv';
    a.click();

    toast.success("CSV exported");
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

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users • Bulk CV upload • Data export</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>

          {impersonating && (
            <Button onClick={exitImpersonation} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" /> Exit
            </Button>
          )}
        </div>
      </div>

      {/* BULK CV UPLOAD */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk CV Upload (PDF)
          </CardTitle>
        </CardHeader>

        <CardContent>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleBulkUpload(e.target.files)}
          />

          {uploading && (
            <p className="text-sm text-blue-600 mt-2">
              Uploading & parsing CVs...
            </p>
          )}
        </CardContent>
      </Card>

      {/* USERS TABLE */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Paid Users ({filteredUsers.length})</CardTitle>
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>

        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Plan</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Renewal</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map(sub => {
                const profile = sub.profiles || {};

                return (
                  <tr key={sub.user_id} className="border-b">
                    <td className="p-4">
                      {profile.full_name || 'User'} <br />
                      <span className="text-sm text-gray-500">{profile.email}</span>
                    </td>

                    <td className="p-4">
                      <Badge>{sub.plan}</Badge>
                    </td>

                    <td className="p-4">
                      {sub.currency} {sub.amount}
                    </td>

                    <td className="p-4">
                      {getRenewalDate(sub.created_at)}
                    </td>

                    <td className="p-4 text-right">
                      <Button onClick={() => impersonateUser(sub.user_id, profile.email)}>
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
}
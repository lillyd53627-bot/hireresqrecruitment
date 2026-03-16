import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Loader2, MoreVertical, Ban, CheckCircle, Trash2, Key, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.User.list('-created_date')
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: () => base44.entities.UserSubscription.list()
  });

  const logAction = async (actionType, targetUserEmail, details, reason) => {
    try {
      const admin = await base44.auth.me();
      await base44.entities.AdminAuditLog.create({
        admin_email: admin.email,
        action_type: actionType,
        target_user_email: targetUserEmail,
        details: details || {},
        reason: reason || null
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  const suspendMutation = useMutation({
    mutationFn: async ({ userId, email }) => {
      const userSub = subscriptions?.find(s => s.user_email === email);
      if (userSub) {
        await base44.entities.UserSubscription.update(userSub.id, { status: 'suspended' });
      }
      await logAction('user_suspended', email, { userId }, 'Manual suspension by admin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers', 'adminSubscriptions']);
      toast.success('User suspended successfully');
    }
  });

  const activateMutation = useMutation({
    mutationFn: async ({ userId, email }) => {
      const userSub = subscriptions?.find(s => s.user_email === email);
      if (userSub) {
        await base44.entities.UserSubscription.update(userSub.id, { status: 'active' });
      }
      await logAction('user_activated', email, { userId }, 'Manual activation by admin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers', 'adminSubscriptions']);
      toast.success('User activated successfully');
    }
  });

  const filteredUsers = users?.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query)
    );
  });

  const getUserSubscription = (email) => {
    return subscriptions?.find(s => s.user_email === email);
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
            title="User Management" 
            subtitle="View and manage all user accounts"
            onSearch={setSearchQuery}
          />
          
          <main className="p-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user) => {
                      const sub = getUserSubscription(user.email);
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sub ? (
                              <Badge className="capitalize">{sub.plan_id}</Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">No plan</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={sub?.status === 'active' ? 'default' : 'secondary'}
                              className={
                                sub?.status === 'active' ? 'bg-green-100 text-green-700' :
                                sub?.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }
                            >
                              {sub?.status || 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(user.created_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {sub?.status === 'active' ? (
                                  <DropdownMenuItem 
                                    onClick={() => suspendMutation.mutate({ userId: user.id, email: user.email })}
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => activateMutation.mutate({ userId: user.id, email: user.email })}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Key className="w-4 h-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Account
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredUsers?.length === 0 && (
                  <div className="py-12 text-center text-gray-500">
                    No users found
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
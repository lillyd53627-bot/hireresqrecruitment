import React, { useState } from 'react';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Shield, DollarSign, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <AdminTopBar 
            title="Admin Settings" 
            subtitle="Configure platform settings and security"
          />
          
          <main className="p-6">
            <Tabs defaultValue="plans" className="space-y-6">
              <TabsList>
                <TabsTrigger value="plans">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Plans & Pricing
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="plans">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Configuration</CardTitle>
                    <CardDescription>Manage pricing and limits for subscription plans</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {['Starter', 'Growth', 'Advance', 'Pro'].map((plan) => (
                      <div key={plan} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-4">{plan} Plan</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Price (ZAR/month)</Label>
                            <Input type="number" defaultValue={plan === 'Starter' ? 1549 : plan === 'Growth' ? 3999 : plan === 'Advance' ? 7999 : 14999} />
                          </div>
                          <div>
                            <Label>Active Jobs Limit</Label>
                            <Input type="number" defaultValue={plan === 'Starter' ? 5 : plan === 'Growth' ? 15 : plan === 'Advance' ? 50 : 999999} />
                          </div>
                          <div>
                            <Label>AI Matches/Month</Label>
                            <Input type="number" defaultValue={plan === 'Starter' ? 25 : plan === 'Growth' ? 100 : 999999} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Plan Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Configure security and access controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Session Timeout (minutes)</Label>
                      <Input type="number" defaultValue={60} />
                    </div>
                    <div>
                      <Label>Blocked Email Domains (comma-separated)</Label>
                      <Input defaultValue="gmail.com, yahoo.com, hotmail.com" />
                    </div>
                    <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Security Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>Customize automated email templates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Welcome Email Subject</Label>
                      <Input defaultValue="Welcome to HireResQ AI!" />
                    </div>
                    <div>
                      <Label>Subscription Confirmation Subject</Label>
                      <Input defaultValue="Your subscription is active" />
                    </div>
                    <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Email Templates
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
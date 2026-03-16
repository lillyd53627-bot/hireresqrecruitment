import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Shield, CreditCard, Building2,
  Globe, Mail, Key, Smartphone, Save, 
  ChevronRight, Check, AlertCircle, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Settings() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="Settings" 
          subtitle="Manage your account and preferences"
        />
        
        <div className="p-8">
          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="bg-white border p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-red-600 data-[state=active]:text-white gap-2">
                <User className="w-4 h-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-red-600 data-[state=active]:text-white gap-2">
                <Bell className="w-4 h-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-red-600 data-[state=active]:text-white gap-2">
                <Shield className="w-4 h-4" /> Security
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-red-600 data-[state=active]:text-white gap-2">
                <CreditCard className="w-4 h-4" /> Billing
              </TabsTrigger>
              <TabsTrigger value="company" className="data-[state=active]:bg-red-600 data-[state=active]:text-white gap-2">
                <Building2 className="w-4 h-4" /> Company
              </TabsTrigger>
              <TabsTrigger value="branding" className="data-[state=active]:bg-red-600 data-[state=active]:text-white gap-2">
                <Palette className="w-4 h-4" /> Branding
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid gap-8">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-600">JR</span>
                      </div>
                      <div>
                        <Button variant="outline">Change Photo</Button>
                        <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input defaultValue="Recruiter" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input defaultValue="john@company.com" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input defaultValue="+27 82 123 4567" />
                      </div>
                    </div>

                    <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                      <Save className="w-4 h-4" /> Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what you want to be notified about</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'New candidate matches', desc: 'Get notified when AI finds matching candidates', enabled: true },
                    { label: 'Interview reminders', desc: 'Remind me before scheduled interviews', enabled: true },
                    { label: 'Client responses', desc: 'Notify when clients respond to outreach', enabled: true },
                    { label: 'Weekly reports', desc: 'Receive weekly performance summaries', enabled: false },
                    { label: 'AI activity updates', desc: 'Updates on AI sourcing and screening', enabled: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <div className="grid gap-8">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" />
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Update Password
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">2FA is enabled</p>
                          <p className="text-sm text-gray-500">Using authenticator app</p>
                        </div>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="billing">
              <div className="grid gap-8">
                <Card className="border-0 shadow-sm bg-gradient-to-r from-red-600 to-red-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="bg-white/20 text-white mb-2">Professional Plan</Badge>
                        <h3 className="text-2xl font-bold">R2,999/month</h3>
                        <p className="text-white/80 mt-1">Next billing date: January 15, 2024</p>
                      </div>
                      <Button className="bg-white text-red-600 hover:bg-gray-100">
                        Upgrade Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-blue-900 rounded flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { date: 'Dec 15, 2023', amount: 'R2,999', status: 'Paid' },
                        { date: 'Nov 15, 2023', amount: 'R2,999', status: 'Paid' },
                        { date: 'Oct 15, 2023', amount: 'R2,999', status: 'Paid' },
                      ].map((invoice, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div>
                            <p className="font-medium">{invoice.date}</p>
                            <p className="text-sm text-gray-500">{invoice.amount}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-green-100 text-green-700">{invoice.status}</Badge>
                            <Button variant="ghost" size="sm">Download</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="company">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>Update your company information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input defaultValue="Recruitment Pro" />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input defaultValue="Recruitment" />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input defaultValue="www.recruitmentpro.co.za" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Size</Label>
                      <Input defaultValue="10-50 employees" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Address</Label>
                      <Input defaultValue="123 Business Park, Cape Town, 8001" />
                    </div>
                  </div>

                  <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>White-Label Branding</CardTitle>
                  <CardDescription>Customize the platform with your brand (Pro plan feature)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                        <Palette className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">Company Branding</h4>
                        <p className="text-sm text-gray-600">Customize logo, colors, and favicon for white-label experience</p>
                      </div>
                    </div>
                    <Link to={createPageUrl('CompanyBranding')}>
                      <Button className="bg-red-600 hover:bg-red-700 gap-2">
                        Manage Branding <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
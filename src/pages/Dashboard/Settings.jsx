import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

import { 
  User, Bell, Shield, CreditCard, Building2, Globe,
  Mail, Key, Smartphone, Save, ChevronRight, Check, AlertCircle, Palette
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Settings() {
  const { currentPlan } = useOutletContext();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  // Upgrade gate - only paid users can access full settings
  if (!currentPlan?.plan) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
          <Shield className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-4xl font-bold mb-4">Account Settings</h2>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Manage your profile, notifications, security and billing.
        </p>
        <Button 
          onClick={() => navigate('/pricing')} 
          className="mt-8 bg-red-600 hover:bg-red-700"
        >
          Upgrade to Access Settings
        </Button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: "Updated Name" } // You can expand this later
      });
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
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

        {/* Profile Tab */}
        <TabsContent value="profile">
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

              <Button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              Notification preferences coming soon
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              Security settings coming soon
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              Billing & subscription management coming soon
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              Company details coming soon
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              White-label branding coming soon (Advance plan)
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
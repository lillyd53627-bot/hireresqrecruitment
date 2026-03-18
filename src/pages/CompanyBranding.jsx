import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Image, Palette, Crown, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';

export default function CompanyBranding() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#dc2626',
    secondary_color: '#000000',
    accent_color: '#ef4444'
  });

  const queryClient = useQueryClient();

  const { data: branding, isLoading } = useQuery({
    queryKey: ['companyBranding'],
    queryFn: async () => {
      const results = await base44.entities.CompanyBranding.list();
      return results[0] || null;
    }
  });

  useEffect(() => {
    if (branding) {
      setFormData({
        company_name: branding.company_name || '',
        logo_url: branding.logo_url || '',
        favicon_url: branding.favicon_url || '',
        primary_color: branding.primary_color || '#dc2626',
        secondary_color: branding.secondary_color || '#000000',
        accent_color: branding.accent_color || '#ef4444'
      });
    }
  }, [branding]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (branding) {
        return await base44.entities.CompanyBranding.update(branding.id, data);
      } else {
        return await base44.entities.CompanyBranding.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companyBranding']);
      toast.success('Branding settings saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save branding settings');
      console.error(error);
    }
  });

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === 'logo') {
        setFormData({ ...formData, logo_url: file_url });
      } else if (type === 'favicon') {
        setFormData({ ...formData, favicon_url: file_url });
      }
      
      toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`);
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="Company Branding" 
          subtitle="Customize your white-label platform"
        />
        
        <main className="p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6" />
                <h2 className="text-2xl font-bold">White-Label Branding</h2>
              </div>
              <p className="text-red-100">
                Customize the platform with your company's branding. Available on Pro plan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="logos">Logos & Icons</TabsTrigger>
                <TabsTrigger value="colors">Brand Colors</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Basic information about your company</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Company Name *</Label>
                      <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="Your Company Name"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">This will appear across the platform</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logos" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Logo</CardTitle>
                    <CardDescription>Upload your company logo (PNG, SVG recommended)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Logo</Label>
                      <div className="flex items-center gap-4">
                        {formData.logo_url && (
                          <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-white p-2">
                            <img src={formData.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                            disabled={uploading}
                          />
                          <p className="text-xs text-gray-500 mt-1">Recommended: 500x200px, transparent background</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Favicon</CardTitle>
                    <CardDescription>Upload your favicon (appears in browser tabs)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Favicon</Label>
                      <div className="flex items-center gap-4">
                        {formData.favicon_url && (
                          <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-white p-2">
                            <img src={formData.favicon_url} alt="Favicon" className="max-w-full max-h-full object-contain" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files[0], 'favicon')}
                            disabled={uploading}
                          />
                          <p className="text-xs text-gray-500 mt-1">Recommended: 32x32px or 64x64px, ICO or PNG format</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="colors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Colors</CardTitle>
                    <CardDescription>Customize the color scheme to match your brand</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={formData.primary_color}
                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={formData.primary_color}
                            onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                            placeholder="#dc2626"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Main brand color for buttons and highlights</p>
                      </div>

                      <div>
                        <Label>Secondary Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={formData.secondary_color}
                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={formData.secondary_color}
                            onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                            placeholder="#000000"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used for text and secondary elements</p>
                      </div>

                      <div>
                        <Label>Accent Color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="color"
                            value={formData.accent_color}
                            onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={formData.accent_color}
                            onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                            placeholder="#ef4444"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hover states and accents</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold mb-4">Preview</h4>
                      <div className="space-y-3">
                        <Button style={{ backgroundColor: formData.primary_color }} className="text-white">
                          Primary Button
                        </Button>
                        <div className="flex gap-2">
                          <div className="w-16 h-16 rounded-lg border" style={{ backgroundColor: formData.primary_color }} />
                          <div className="w-16 h-16 rounded-lg border" style={{ backgroundColor: formData.secondary_color }} />
                          <div className="w-16 h-16 rounded-lg border" style={{ backgroundColor: formData.accent_color }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="submit"
                disabled={saveMutation.isPending || uploading}
                className="bg-red-600 hover:bg-red-700"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save Branding
                  </>
                )}
              </Button>
            </div>
          </form>

          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Pro Plan Feature</h4>
                  <p className="text-sm text-blue-800">
                    White-label branding is available on the Pro plan. These settings will be applied across 
                    client portals, candidate portals, and login pages once activated.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/lib/mockBase44';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Building2, Globe, Users, MapPin, Edit, Trash2, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';
import { toast } from 'sonner';

export default function Companies() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    location: '',
    website: '',
    linkedin_url: '',
    logo_url: '',
    description: '',
    culture_description: '',
    benefits: []
  });

  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Company.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      setShowDialog(false);
      resetForm();
      toast.success('Company created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Company.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      setShowDialog(false);
      resetForm();
      toast.success('Company updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Company.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      toast.success('Company deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      size: '',
      location: '',
      website: '',
      linkedin_url: '',
      logo_url: '',
      description: '',
      culture_description: '',
      benefits: []
    });
    setEditingCompany(null);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      industry: company.industry || '',
      size: company.size || '',
      location: company.location || '',
      website: company.website || '',
      linkedin_url: company.linkedin_url || '',
      logo_url: company.logo_url || '',
      description: company.description || '',
      culture_description: company.culture_description || '',
      benefits: company.benefits || []
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('Company name is required');
      return;
    }

    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="Company Profiles" 
          subtitle="Manage your company profiles and branding"
        />
        
        <div className="p-8">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search companies..."
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <Dialog open={showDialog} onOpenChange={(open) => {
              setShowDialog(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. TechCorp SA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="e.g. Technology"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Size</Label>
                      <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Cape Town, SA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn URL</Label>
                      <Input
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief company description..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Culture & Values</Label>
                    <Textarea
                      value={formData.culture_description}
                      onChange={(e) => setFormData({ ...formData, culture_description: e.target.value })}
                      placeholder="Describe company culture, values, work environment..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingCompany ? 'Update' : 'Create'} Company
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Companies Grid */}
          {isLoading ? (
            <div className="text-center py-12">Loading companies...</div>
          ) : companies.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
                <p className="text-gray-500 mb-4">Create your first company profile to get started</p>
                <Button onClick={() => setShowDialog(true)} className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company, i) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="w-12 h-12 object-contain" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            {company.industry && (
                              <p className="text-sm text-gray-500">{company.industry}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {company.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{company.description}</p>
                      )}

                      <div className="space-y-2 text-sm text-gray-600">
                        {company.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {company.location}
                          </div>
                        )}
                        {company.size && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {company.size} employees
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t">
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Globe className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {company.linkedin_url && (
                          <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 ml-auto"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Delete this company?')) {
                              deleteMutation.mutate(company.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
// src/pages/Dashboard/ClientPortal.jsx   // or Companies.jsx - use whichever name you prefer
import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Building2, Globe, Users, MapPin, Edit, Trash2, Plus, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function ClientPortal() {
  const { currentPlan } = useOutletContext();
  const navigate = useNavigate();

  const hasClientPortal = ['growth', 'advance'].includes(currentPlan?.plan || '');

  // Upgrade gate
  if (!hasClientPortal) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-8">
          <Building2 className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-4xl font-bold mb-4">Client Portal</h2>
        <p className="text-xl text-gray-600 max-w-md mx-auto mb-10">
          White-label client portal for your clients to track jobs, candidates, and progress in real time.
        </p>
        <Button 
          onClick={() => navigate('/pricing')} 
          className="bg-red-600 hover:bg-red-700 text-lg px-10 py-6"
        >
          Upgrade to Growth or Advance
        </Button>
      </div>
    );
  }

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
  });

  useEffect(() => {
  const loadData = async () => {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) return;

    setUser(authData.user);

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setCompanies(data);
    }
  };

  loadData();
}, []);

  // TODO: Replace with real Supabase query when ready
  const [companies, setCompanies] = useState([]);
const [user, setUser] = useState(null);
    {
      id: 1,
      name: "TechCorp SA",
      industry: "Technology",
      location: "Cape Town",
      website: "https://techcorp.co.za",
      status: "active",
      activeJobs: 5,
      totalHires: 12
    },
    {
      id: 2,
      name: "FinanceHub",
      industry: "Finance",
      location: "Johannesburg",
      website: "https://financehub.co.za",
      status: "active",
      activeJobs: 3,
      totalHires: 8
    },
  ]);

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
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
  if (!formData.name) {
    toast.error("Company name is required");
    return;
  }

  try {
    if (editingCompany) {
      // UPDATE
      const { error } = await supabase
        .from('companies')
        .update(formData)
        .eq('id', editingCompany.id);

      if (error) throw error;

      toast.success("Company updated");
    } else {
      // INSERT
      const { error } = await supabase
        .from('companies')
        .insert([
          {
            ...formData,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      toast.success("Company created");
    }

    // 🔁 REFRESH LIST
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setCompanies(data);

    setShowDialog(false);
    resetForm();

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }

    // TODO: Replace with real Supabase insert/update when backend is ready
    if (editingCompany) {
      // Update existing

const handleDelete = async (id) => {
  if (!confirm("Delete this company?")) return;

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (!error) {
    setCompanies(companies.filter(c => c.id !== id));
    toast.success("Company deleted");
  }
};
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Portal</h1>
          <p className="text-gray-600">Manage your company profiles and branding</p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Companies Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="w-12 h-12 object-contain rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    {company.industry && <p className="text-sm text-gray-500">{company.industry}</p>}
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
                    <MapPin className="w-4 h-4" /> {company.location}
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> {company.size} employees
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Globe className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(company)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(company.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
          </DialogHeader>
          {/* Form fields - same as your original but simplified */}
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="TechCorp SA"
                />
              </div>
              <div>
                <Label>Industry</Label>
                <Input
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Technology"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Cape Town, SA"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief company description..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
                {editingCompany ? 'Update' : 'Create'} Company
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
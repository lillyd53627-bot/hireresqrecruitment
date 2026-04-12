// src/pages/Dashboard/OnboardingWorkflows.jsx
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, FileText, CheckCircle2, Clock, Send, TrendingUp, AlertCircle, Plus 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function OnboardingWorkflows() {
  const { currentPlan } = useOutletContext();
  const navigate = useNavigate();

  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Paid user gate
  if (!['growth', 'advance'].includes(currentPlan?.plan || '')) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-8">
          <Users className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-4xl font-bold mb-4">Onboarding Workflows</h2>
        <p className="text-xl text-gray-600 max-w-md mx-auto mb-10">
          Automate offer letters, document collection, background checks and new hire onboarding.
        </p>
        <Button onClick={() => navigate('/pricing')} className="bg-red-600 hover:bg-red-700">
          Upgrade to Unlock Onboarding Automation
        </Button>
      </div>
    );
  }

  // Load onboardings from Supabase
  const loadOnboardings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('onboardings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOnboardings(data || []);
    } catch (error) {
      console.error('Failed to load onboardings:', error);
      toast.error('Failed to load onboarding workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardings();
  }, []);

  const filteredOnboardings = activeTab === 'all' 
    ? onboardings 
    : onboardings.filter(o => o.status === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'offer_accepted': return 'bg-green-100 text-green-700';
      case 'onboarding_complete': return 'bg-emerald-100 text-emerald-700';
      case 'declined': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Onboarding Workflows</h1>
          <p className="text-gray-600">Automate new hire onboarding from offer to first day</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 gap-2">
          <Plus className="w-4 h-4" />
          New Onboarding
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="offer_pending">Offer Pending</TabsTrigger>
          <TabsTrigger value="offer_accepted">Offer Accepted</TabsTrigger>
          <TabsTrigger value="docs_collection">Docs Collection</TabsTrigger>
          <TabsTrigger value="onboarding_complete">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">Loading onboarding workflows...</div>
          ) : filteredOnboardings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No onboarding workflows found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredOnboardings.map((onboarding) => (
                <Card key={onboarding.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6 flex flex-col md:flex-row gap-6 justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{onboarding.candidate_name}</h3>
                        <p className="text-gray-600">{onboarding.job_title} • {onboarding.company}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Start: {onboarding.start_date || 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 flex-wrap">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Progress</p>
                        <div className="font-bold text-xl text-blue-600">
                          {onboarding.onboarding_progress || 0}%
                        </div>
                        <Progress value={onboarding.onboarding_progress || 0} className="w-24 mt-1" />
                      </div>

                      <Badge className={getStatusColor(onboarding.status)}>
                        {onboarding.status.replace('_', ' ')}
                      </Badge>

                      {onboarding.next_action && (
                        <div className="text-sm max-w-[180px]">
                          <span className="font-medium">Next:</span> {onboarding.next_action}
                        </div>
                      )}

                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
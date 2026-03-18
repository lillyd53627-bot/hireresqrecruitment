import React, { useState } from 'react';
// import { base44 } from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../../components/Dashboard/Sidebar';
import TopBar from '../../components/Dashboard/TopBar';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, FileText, CheckCircle2, Clock, Send, Mail,
  TrendingUp, AlertCircle, Sparkles, UserCheck, Plus
} from 'lucide-react';
import CreateOnboardingDialog from '../../components/onboarding/CreateOnboardingDialog';
import OnboardingDetailsDialog from '../../components/onboarding/OnboardingDetailsDialog';
import AIOnboardingAssistant from '../../components/onboarding/AIOnboardingAssistant';

export default function OnboardingWorkflows() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: onboardings = [], isLoading } = useQuery({
    queryKey: ['onboardings'],
    queryFn: () => base44.entities.Onboarding.list('-created_date'),
  });

  const statusConfig = {
    offer_pending: { label: 'Offer Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    offer_sent: { label: 'Offer Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
    offer_accepted: { label: 'Offer Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    docs_collection: { label: 'Collecting Docs', color: 'bg-purple-100 text-purple-700', icon: FileText },
    background_check: { label: 'Background Check', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    onboarding_complete: { label: 'Complete', color: 'bg-emerald-100 text-emerald-700', icon: UserCheck },
    declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: AlertCircle }
  };

  const filteredOnboardings = activeTab === 'all' 
    ? onboardings 
    : onboardings.filter(o => o.status === activeTab);

  const stats = {
    total: onboardings.length,
    active: onboardings.filter(o => !['onboarding_complete', 'declined'].includes(o.status)).length,
    pending_docs: onboardings.filter(o => o.status === 'docs_collection').length,
    completed: onboardings.filter(o => o.status === 'onboarding_complete').length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar
          title="Onboarding Workflows"
          subtitle="AI-powered candidate onboarding automation"
        />

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Onboarding</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.active}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Docs</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.pending_docs}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Onboarding Pipeline</h2>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Start Onboarding
            </Button>
          </div>

          {/* AI Assistant */}
          <AIOnboardingAssistant />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({onboardings.length})</TabsTrigger>
              <TabsTrigger value="offer_sent">Offer Sent</TabsTrigger>
              <TabsTrigger value="docs_collection">Docs Collection</TabsTrigger>
              <TabsTrigger value="background_check">Background Check</TabsTrigger>
              <TabsTrigger value="onboarding_complete">Complete</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {isLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">Loading onboarding records...</p>
                  </CardContent>
                </Card>
              ) : filteredOnboardings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No onboarding records found</p>
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      variant="outline"
                      className="mt-4"
                    >
                      Start First Onboarding
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredOnboardings.map((onboarding) => {
                    const StatusIcon = statusConfig[onboarding.status]?.icon || Clock;
                    const pendingDocs = onboarding.documents_required?.filter(d => d.status === 'pending').length || 0;
                    
                    return (
                      <Card 
                        key={onboarding.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedOnboarding(onboarding)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{onboarding.candidate_name}</h3>
                                <Badge className={statusConfig[onboarding.status]?.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig[onboarding.status]?.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{onboarding.job_title} at {onboarding.company}</p>
                              <p className="text-xs text-gray-500">{onboarding.candidate_email}</p>
                              
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Onboarding Progress</span>
                                  <span className="font-medium">{onboarding.onboarding_progress || 0}%</span>
                                </div>
                                <Progress value={onboarding.onboarding_progress || 0} className="h-2" />
                              </div>

                              <div className="mt-4 flex gap-4 text-sm">
                                {onboarding.start_date && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    Start: {new Date(onboarding.start_date).toLocaleDateString()}
                                  </div>
                                )}
                                {pendingDocs > 0 && (
                                  <div className="flex items-center gap-1 text-orange-600">
                                    <FileText className="w-4 h-4" />
                                    {pendingDocs} docs pending
                                  </div>
                                )}
                              </div>

                              {onboarding.next_action && (
                                <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                                  <strong>Next:</strong> {onboarding.next_action}
                                </div>
                              )}
                            </div>

                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {showCreateDialog && (
        <CreateOnboardingDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {selectedOnboarding && (
        <OnboardingDetailsDialog
          open={!!selectedOnboarding}
          onClose={() => setSelectedOnboarding(null)}
          onboarding={selectedOnboarding}
        />
      )}
    </div>
  );
}
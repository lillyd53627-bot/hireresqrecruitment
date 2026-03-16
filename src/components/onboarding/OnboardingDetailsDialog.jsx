import React, { useState } from 'react';
import { base44 } from '@/lib/mockBase44';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, Upload, CheckCircle2, Clock, Send, Mail,
  Sparkles, Download, Eye, X, Loader2, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import OfferLetterGenerator from './OfferLetterGenerator';
import PersonalizedCommunication from './PersonalizedCommunication';

export default function OnboardingDetailsDialog({ open, onClose, onboarding }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.Onboarding.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
      toast.success('Onboarding updated successfully!');
    }
  });

  const updateDocumentStatus = (docIndex, newStatus, url = '') => {
    const updatedDocs = [...(onboarding.documents_required || [])];
    updatedDocs[docIndex] = {
      ...updatedDocs[docIndex],
      status: newStatus,
      ...(url && { url, uploaded_date: new Date().toISOString() })
    };

    const completedDocs = updatedDocs.filter(d => d.status === 'verified').length;
    const progress = Math.round((completedDocs / updatedDocs.length) * 100);

    updateMutation.mutate({
      id: onboarding.id,
      data: {
        documents_required: updatedDocs,
        onboarding_progress: progress
      }
    });
  };

  const updateStatus = (newStatus) => {
    let progress = onboarding.onboarding_progress || 0;
    let nextAction = '';

    switch(newStatus) {
      case 'offer_sent':
        progress = 20;
        nextAction = 'Wait for candidate to accept offer';
        break;
      case 'offer_accepted':
        progress = 40;
        nextAction = 'Send document collection requests';
        break;
      case 'docs_collection':
        progress = 60;
        nextAction = 'Review and verify submitted documents';
        break;
      case 'background_check':
        progress = 80;
        nextAction = 'Complete background verification';
        break;
      case 'onboarding_complete':
        progress = 100;
        nextAction = 'Onboarding complete!';
        break;
    }

    updateMutation.mutate({
      id: onboarding.id,
      data: {
        status: newStatus,
        onboarding_progress: progress,
        next_action: nextAction,
        ...(newStatus === 'offer_sent' && { offer_sent_date: new Date().toISOString() }),
        ...(newStatus === 'offer_accepted' && { offer_accepted_date: new Date().toISOString() })
      }
    });
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    uploaded: 'bg-blue-100 text-blue-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{onboarding.candidate_name}</h2>
              <p className="text-sm text-gray-600">{onboarding.job_title} at {onboarding.company}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              {onboarding.status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="offer">Offer Letter</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Onboarding Progress</span>
                    <span className="text-sm font-semibold">{onboarding.onboarding_progress || 0}%</span>
                  </div>
                  <Progress value={onboarding.onboarding_progress || 0} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p className="font-medium">{onboarding.start_date || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Salary</p>
                    <p className="font-medium">R {onboarding.salary?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>

                {onboarding.next_action && (
                  <div className="p-3 bg-blue-50 rounded-lg mt-4">
                    <p className="text-xs text-blue-600 font-medium mb-1">Next Action</p>
                    <p className="text-sm text-blue-900">{onboarding.next_action}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus('offer_sent')}
                    disabled={updateMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Mark Offer Sent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus('offer_accepted')}
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Offer Accepted
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus('docs_collection')}
                    disabled={updateMutation.isPending}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Collecting Docs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus('onboarding_complete')}
                    disabled={updateMutation.isPending}
                    className="bg-green-50 hover:bg-green-100"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offer">
            <OfferLetterGenerator onboarding={onboarding} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Required Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {onboarding.documents_required?.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-sm">{doc.name}</span>
                          <Badge className={statusColors[doc.status]}>
                            {doc.status}
                          </Badge>
                        </div>
                        {doc.uploaded_date && (
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(doc.uploaded_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {doc.status === 'uploaded' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDocumentStatus(index, 'verified')}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDocumentStatus(index, 'rejected')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {doc.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication">
            <PersonalizedCommunication onboarding={onboarding} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
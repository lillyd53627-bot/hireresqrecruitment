import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';           // ← ADD THIS LINE
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Mail, Eye, MessageSquare, Users, Sparkles, RefreshCw, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Outreach() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [messageType, setMessageType] = useState('email');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('Professional');
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email',
    target: ''
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async () => {
    if (!newCampaign.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .insert([{
          name: newCampaign.name.trim(),
          type: newCampaign.type,
          target: newCampaign.target.trim() || null,
          status: 'active',
          sent: 0,
          opened: 0,
          replied: 0,
          meetings: 0,
          progress: 0
        }]);

      if (error) throw error;

      toast.success("Campaign created successfully!");
      setShowNewCampaignModal(false);
      setNewCampaign({ name: '', type: 'email', target: '' });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create campaign");
    }
  };

  const handleGenerateMessage = () => {
    if (!context.trim()) {
      toast.error("Please enter context for the message");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedMessage(`Hi [Name],

I came across your profile and was impressed by your experience as a ${context}. We're currently supporting a leading company in South Africa looking for someone with your background.

Would you be open to a quick 15-minute call this week?

Best regards,
[Your Name]
HireResQ AI`);
      toast.success("AI message generated successfully");
      setIsGenerating(false);
    }, 800);
  };

  // Stats
  const totalSent = campaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.opened || 0), 0);
  const totalReplied = campaigns.reduce((sum, c) => sum + (c.replied || 0), 0);
  const totalMeetings = campaigns.reduce((sum, c) => sum + (c.meetings || 0), 0);

  const avgOpenRate = totalSent > 0 
    ? Math.round((totalOpened / totalSent) * 100) 
    : 42;

  const avgReplyRate = totalSent > 0 
    ? Math.round((totalReplied / totalSent) * 100) 
    : 18;

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Outreach</h1>
          <p className="text-gray-600">Automated email and WhatsApp campaigns that book meetings</p>
        </div>
        <Button onClick={() => setShowNewCampaignModal(true)} className="bg-red-600 hover:bg-red-700 gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalSent}</p>
                <p className="text-sm text-gray-500">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{avgOpenRate}%</p>
                <p className="text-sm text-gray-500">Avg Open Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{avgReplyRate}%</p>
                <p className="text-sm text-gray-500">Avg Reply Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalMeetings}</p>
                <p className="text-sm text-gray-500">Meetings Booked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="personalizer">AI Personalizer</TabsTrigger>
          <TabsTrigger value="sequences">Smart Sequences</TabsTrigger>
          <TabsTrigger value="replies">Reply Analyzer</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-12">Loading campaigns...</p>
              ) : campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-6 border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-gray-500">{campaign.type || 'Email'} Campaign</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">{campaign.status || 'active'}</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div><p className="text-2xl font-bold">{campaign.sent || 0}</p><p className="text-xs text-gray-500">Sent</p></div>
                      <div><p className="text-2xl font-bold text-blue-600">{campaign.opened || 0}</p><p className="text-xs text-gray-500">Opened</p></div>
                      <div><p className="text-2xl font-bold text-green-600">{campaign.replied || 0}</p><p className="text-xs text-gray-500">Replied</p></div>
                      <div><p className="text-2xl font-bold text-red-600">{campaign.meetings || 0}</p><p className="text-xs text-gray-500">Meetings</p></div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <Progress value={campaign.progress || 65} className="flex-1" />
                      <span className="text-sm text-gray-500 font-medium">{campaign.progress || 65}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-12 text-gray-500">No campaigns yet. Create your first one above.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalizer" className="mt-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                AI Message Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Message Type</Label>
                <div className="flex gap-3 mt-2">
                  <Button variant={messageType === 'email' ? 'default' : 'outline'} onClick={() => setMessageType('email')}>Email</Button>
                  <Button variant={messageType === 'whatsapp' ? 'default' : 'outline'} onClick={() => setMessageType('whatsapp')}>WhatsApp</Button>
                </div>
              </div>

              <div>
                <Label>Context</Label>
                <Textarea 
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. Senior Developer role at TechCorp in Cape Town"
                  rows={3}
                />
              </div>

              <div>
                <Label>Tone</Label>
                <div className="flex gap-3 mt-2">
                  {['Professional', 'Friendly', 'Direct'].map(t => (
                    <Button key={t} variant={tone === t ? 'default' : 'outline'} onClick={() => setTone(t)} size="sm">{t}</Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerateMessage}
                disabled={isGenerating || !context.trim()}
                className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg"
              >
                {isGenerating ? (
                  <> <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Generating... </>
                ) : (
                  <> <Sparkles className="w-5 h-5 mr-2" /> Generate AI Message </>
                )}
              </Button>

              {generatedMessage && (
                <div className="space-y-3">
                  <Label>Generated Message</Label>
                  <Textarea value={generatedMessage} onChange={(e) => setGeneratedMessage(e.target.value)} rows={8} className="font-mono text-sm" />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleGenerateMessage}>
                      <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                    </Button>
                    <Button className="flex-1 bg-black hover:bg-gray-900">
                      <Send className="w-4 h-4 mr-2" /> Use This Message
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequences" className="mt-6">
          <div className="text-center py-20 text-gray-500">Smart Sequences coming soon</div>
        </TabsContent>

        <TabsContent value="replies" className="mt-6">
          <div className="text-center py-20 text-gray-500">Reply Analyzer coming soon</div>
        </TabsContent>
      </Tabs>

      {/* New Campaign Modal */}
      <Dialog open={showNewCampaignModal} onOpenChange={setShowNewCampaignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Campaign Name *</Label>
              <Input 
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                placeholder="Tech Talent Outreach Q2"
              />
            </div>
            <div>
              <Label>Campaign Type</Label>
              <div className="flex gap-3 mt-2">
                <Button variant={newCampaign.type === 'email' ? 'default' : 'outline'} onClick={() => setNewCampaign({...newCampaign, type: 'email'})}>Email</Button>
                <Button variant={newCampaign.type === 'whatsapp' ? 'default' : 'outline'} onClick={() => setNewCampaign({...newCampaign, type: 'whatsapp'})}>WhatsApp</Button>
              </div>
            </div>
            <div>
              <Label>Target Audience</Label>
              <Input 
                value={newCampaign.target}
                onChange={(e) => setNewCampaign({...newCampaign, target: e.target.value})}
                placeholder="Senior Developers in Cape Town"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowNewCampaignModal(false)}>Cancel</Button>
            <Button onClick={handleCreateCampaign} className="bg-red-600 hover:bg-red-700">Create Campaign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
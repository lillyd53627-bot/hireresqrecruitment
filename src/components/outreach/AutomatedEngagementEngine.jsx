import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from "@/lib/mockBase44";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Sparkles, Loader2, Send, Clock, Mail, CheckCircle2, 
  AlertCircle, TrendingUp, Calendar, Bell, Zap, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AutomatedEngagementEngine({ candidates = [] }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [activating, setActivating] = useState(false);
  const [engagementPlan, setEngagementPlan] = useState(null);
  const [settings, setSettings] = useState({
    minMatchScore: 75,
    autoSend: false,
    followUpDays: 3,
    maxSequenceSteps: 5
  });

  const analyzeAndCreateSequences = async () => {
    setAnalyzing(true);
    try {
      // Filter high-potential candidates
      const highPotentialCandidates = candidates.filter(c => 
        (c.match_score >= settings.minMatchScore || c.cultural_fit_score >= settings.minMatchScore) 
        && c.status === 'new'
      );

      if (highPotentialCandidates.length === 0) {
        setEngagementPlan({ error: 'No high-potential candidates found matching criteria' });
        return;
      }

      // Get jobs for context
      const jobs = await base44.entities.Job.list();

      const prompt = `You are an expert recruitment AI creating personalized, automated outreach sequences.

CANDIDATE POOL (${highPotentialCandidates.length} high-potential candidates who haven't applied):
${highPotentialCandidates.map(c => `
- ${c.name}: ${c.title || 'N/A'} at ${c.company || 'N/A'}
  Skills: ${c.skills?.join(', ') || 'N/A'}
  Match Score: ${c.match_score || 'N/A'}
  Cultural Fit: ${c.cultural_fit_score || 'N/A'}
  Location: ${c.location || 'N/A'}
  Notes: ${c.notes || 'N/A'}
`).join('\n')}

AVAILABLE JOBS:
${jobs.slice(0, 5).map(j => `
- ${j.title} at ${j.company}
  Location: ${j.location}
  Skills: ${j.skills_required?.join(', ') || 'N/A'}
`).join('\n')}

Create personalized automated outreach sequences for each candidate. For each:

1. Identify best-fit job opportunities from our openings
2. Create a multi-touch outreach sequence (3-5 steps over 2 weeks)
3. Personalize each message based on their background
4. Set optimal timing for each touchpoint
5. Define success metrics and follow-up triggers

For each sequence step, include:
- Day number (when to send)
- Channel (email/linkedin/phone)
- Subject line (if email)
- Message content (personalized, conversational, value-focused)
- Call-to-action
- Follow-up trigger (response, no response, opened, etc)

Also provide:
- Engagement priority (High/Medium/Low)
- Recommended first touchpoint timing
- Personalization notes for recruiter
- Expected response rate
- Follow-up reminders for recruiter`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            total_candidates: { type: "number" },
            expected_response_rate: { type: "string" },
            sequences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  candidate_name: { type: "string" },
                  candidate_id: { type: "string" },
                  priority: { type: "string" },
                  matched_jobs: { type: "array", items: { type: "string" } },
                  personalization_notes: { type: "string" },
                  expected_response_rate: { type: "number" },
                  sequence_steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step: { type: "number" },
                        day: { type: "number" },
                        channel: { type: "string" },
                        subject: { type: "string" },
                        message: { type: "string" },
                        cta: { type: "string" },
                        follow_up_trigger: { type: "string" }
                      }
                    }
                  },
                  recruiter_reminders: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "number" },
                        action: { type: "string" },
                        condition: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      setEngagementPlan(response);
    } catch (error) {
      console.error('Error creating engagement plan:', error);
      setEngagementPlan({ error: 'Failed to create engagement plan' });
    } finally {
      setAnalyzing(false);
    }
  };

  const activateSequences = async () => {
    setActivating(true);
    try {
      // Create outreach campaigns for each sequence
      for (const seq of engagementPlan.sequences) {
        await base44.entities.OutreachCampaign.create({
          name: `Auto-Engage: ${seq.candidate_name}`,
          type: 'email',
          target_audience: 'candidates',
          status: settings.autoSend ? 'active' : 'draft',
          message_template: seq.sequence_steps[0].message,
          subject: seq.sequence_steps[0].subject,
          sent_count: 0,
          metadata: {
            candidate_id: seq.candidate_id,
            sequence_steps: seq.sequence_steps,
            reminders: seq.recruiter_reminders,
            priority: seq.priority
          }
        });
      }

      // Show success message
      alert(`${engagementPlan.sequences.length} outreach sequences ${settings.autoSend ? 'activated' : 'created as drafts'}!`);
    } catch (error) {
      console.error('Error activating sequences:', error);
      alert('Failed to activate sequences');
    } finally {
      setActivating(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-700';
    const lower = priority.toLowerCase();
    if (lower.includes('high')) return 'bg-red-100 text-red-700';
    if (lower.includes('medium')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getChannelIcon = (channel) => {
    const lower = channel?.toLowerCase() || '';
    if (lower.includes('email')) return Mail;
    if (lower.includes('linkedin')) return TrendingUp;
    if (lower.includes('phone')) return Bell;
    return Send;
  };

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-600" />
            Automated Engagement Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Match Score</Label>
              <Input 
                type="number" 
                value={settings.minMatchScore}
                onChange={(e) => setSettings({...settings, minMatchScore: parseInt(e.target.value)})}
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500">Only engage candidates above this score</p>
            </div>
            <div className="space-y-2">
              <Label>Follow-up Interval (days)</Label>
              <Input 
                type="number" 
                value={settings.followUpDays}
                onChange={(e) => setSettings({...settings, followUpDays: parseInt(e.target.value)})}
                min="1"
                max="14"
              />
              <p className="text-xs text-gray-500">Days between touchpoints</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>Auto-send sequences immediately</Label>
              <p className="text-xs text-gray-500">If off, sequences are saved as drafts</p>
            </div>
            <Switch 
              checked={settings.autoSend}
              onCheckedChange={(checked) => setSettings({...settings, autoSend: checked})}
            />
          </div>

          <Button 
            onClick={analyzeAndCreateSequences}
            disabled={analyzing || candidates.length === 0}
            className="w-full bg-red-600 hover:bg-red-700 gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing {candidates.length} candidates...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create AI Outreach Sequences
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Engagement Plan Results */}
      <AnimatePresence>
        {engagementPlan && !engagementPlan.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Engagement Plan Ready</h3>
                    <p className="text-gray-700 mb-4">{engagementPlan.summary}</p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{engagementPlan.total_candidates} candidates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <span>{engagementPlan.expected_response_rate} expected response</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={activateSequences}
                    disabled={activating}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    {activating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {settings.autoSend ? 'Activate All' : 'Save as Drafts'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Individual Sequences */}
            <div className="space-y-4">
              {engagementPlan.sequences?.map((seq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{seq.candidate_name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{seq.personalization_notes}</p>
                          <div className="flex gap-2 mt-3">
                            <Badge className={getPriorityColor(seq.priority)}>
                              {seq.priority} Priority
                            </Badge>
                            <Badge variant="outline">
                              {seq.expected_response_rate}% response rate
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {seq.matched_jobs?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Matched Jobs:</p>
                          <div className="flex flex-wrap gap-1">
                            {seq.matched_jobs.map((job, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {job}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Sequence Steps */}
                      <div>
                        <h4 className="font-semibold text-sm mb-3">Outreach Sequence:</h4>
                        <div className="space-y-3">
                          {seq.sequence_steps?.map((step, i) => {
                            const ChannelIcon = getChannelIcon(step.channel);
                            return (
                              <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-red-200">
                                    <span className="text-xs font-bold">{step.step}</span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      <ChannelIcon className="w-3 h-3 mr-1" />
                                      Day {step.day}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{step.channel}</span>
                                  </div>
                                  {step.subject && (
                                    <p className="text-sm font-semibold mb-1">📧 {step.subject}</p>
                                  )}
                                  <p className="text-sm text-gray-700 mb-2">{step.message}</p>
                                  <div className="flex items-center justify-between">
                                    <Badge className="bg-blue-50 text-blue-700 text-xs">
                                      {step.cta}
                                    </Badge>
                                    <span className="text-xs text-gray-500">→ {step.follow_up_trigger}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recruiter Reminders */}
                      {seq.recruiter_reminders?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-orange-600" />
                            Follow-up Reminders:
                          </h4>
                          <div className="space-y-2">
                            {seq.recruiter_reminders.map((reminder, i) => (
                              <div key={i} className="flex items-center gap-3 p-2 bg-orange-50 rounded text-sm">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <span className="font-medium">Day {reminder.day}:</span>
                                <span className="text-gray-700">{reminder.action}</span>
                                <span className="text-xs text-gray-500 ml-auto">
                                  if {reminder.condition}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {engagementPlan?.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{engagementPlan.error}</p>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
}
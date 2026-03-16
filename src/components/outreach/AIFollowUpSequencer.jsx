import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, Clock, CheckCircle2, Loader2, Plus, Trash2,
  Calendar, Zap, TrendingUp
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AIFollowUpSequencer() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sequenceData, setSequenceData] = useState({
    campaignGoal: 'job_application',
    targetAudience: 'tech_candidates',
    numberOfSteps: 3,
    totalDuration: '2_weeks'
  });
  const [generatedSequence, setGeneratedSequence] = useState(null);

  const generateSequence = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Create an intelligent follow-up email sequence for recruitment outreach.

CAMPAIGN PARAMETERS:
- Goal: ${sequenceData.campaignGoal}
- Target Audience: ${sequenceData.targetAudience}
- Number of Steps: ${sequenceData.numberOfSteps}
- Total Duration: ${sequenceData.totalDuration}

Generate a complete follow-up sequence with:

1. Each follow-up step should include:
   - Subject line
   - Email body
   - Optimal timing (days after previous message)
   - Best time of day to send
   - Trigger conditions (e.g., "if no reply", "if opened but not replied")
   - Personalization suggestions

2. Apply behavioral psychology principles:
   - Varying angles (value, urgency, social proof, curiosity)
   - Progressive engagement (softer -> more direct)
   - Smart persistence without being pushy

3. Use A/B testing suggestions for subject lines

4. Include exit conditions (when to stop the sequence)

Make each message feel fresh and provide genuine value, not just "following up".`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sequence_name: { type: "string" },
            sequence_description: { type: "string" },
            estimated_response_rate: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: { type: "number" },
                  days_after_previous: { type: "number" },
                  best_time: { type: "string" },
                  trigger_condition: { type: "string" },
                  subject_line_a: { type: "string" },
                  subject_line_b: { type: "string" },
                  message_body: { type: "string" },
                  message_angle: { type: "string" },
                  personalization_tokens: {
                    type: "array",
                    items: { type: "string" }
                  },
                  expected_open_rate: { type: "string" },
                  expected_reply_rate: { type: "string" }
                }
              }
            },
            exit_conditions: {
              type: "array",
              items: { type: "string" }
            },
            optimization_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedSequence(response);
    } catch (error) {
      console.error('Error generating sequence:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            AI Follow-Up Sequence Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign Goal</Label>
              <Select value={sequenceData.campaignGoal} onValueChange={(value) => setSequenceData({...sequenceData, campaignGoal: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_application">Get Job Applications</SelectItem>
                  <SelectItem value="meeting_booking">Book Meetings</SelectItem>
                  <SelectItem value="client_acquisition">Client Acquisition</SelectItem>
                  <SelectItem value="candidate_engagement">Candidate Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={sequenceData.targetAudience} onValueChange={(value) => setSequenceData({...sequenceData, targetAudience: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech_candidates">Tech Candidates</SelectItem>
                  <SelectItem value="passive_candidates">Passive Candidates</SelectItem>
                  <SelectItem value="active_job_seekers">Active Job Seekers</SelectItem>
                  <SelectItem value="hiring_managers">Hiring Managers</SelectItem>
                  <SelectItem value="hr_directors">HR Directors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Follow-ups</Label>
              <Select value={sequenceData.numberOfSteps.toString()} onValueChange={(value) => setSequenceData({...sequenceData, numberOfSteps: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Follow-ups</SelectItem>
                  <SelectItem value="3">3 Follow-ups</SelectItem>
                  <SelectItem value="4">4 Follow-ups</SelectItem>
                  <SelectItem value="5">5 Follow-ups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Total Duration</Label>
              <Select value={sequenceData.totalDuration} onValueChange={(value) => setSequenceData({...sequenceData, totalDuration: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_week">1 Week</SelectItem>
                  <SelectItem value="2_weeks">2 Weeks</SelectItem>
                  <SelectItem value="3_weeks">3 Weeks</SelectItem>
                  <SelectItem value="1_month">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateSequence}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building AI Sequence...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Smart Sequence
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedSequence && (
        <div className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">{generatedSequence.sequence_name}</h3>
              <p className="text-gray-600 mb-4">{generatedSequence.sequence_description}</p>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-100 text-green-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Est. Response Rate: {generatedSequence.estimated_response_rate}
                </Badge>
                <Badge variant="outline">
                  {generatedSequence.steps.length} Steps
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {generatedSequence.steps.map((step, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-purple-700">{step.step_number}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Step {step.step_number}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Day {step.days_after_previous} • {step.best_time}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {step.message_angle}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                      {step.expected_reply_rate} reply rate
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700 font-medium mb-1">Trigger Condition</p>
                    <p className="text-sm text-amber-900">{step.trigger_condition}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Subject Lines (A/B Test)</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Badge variant="outline" className="mb-2 text-xs">Version A</Badge>
                        <p className="text-sm font-medium">{step.subject_line_a}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Badge variant="outline" className="mb-2 text-xs">Version B</Badge>
                        <p className="text-sm font-medium">{step.subject_line_b}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Message Body</Label>
                    <Textarea 
                      value={step.message_body}
                      readOnly
                      className="min-h-[150px] bg-white"
                    />
                  </div>

                  {step.personalization_tokens?.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Personalization Tokens</Label>
                      <div className="flex flex-wrap gap-2">
                        {step.personalization_tokens.map((token, i) => (
                          <Badge key={i} variant="secondary" className="bg-green-100 text-green-700">
                            {token}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <p className="text-xs text-blue-600 font-medium">Open Rate</p>
                      <p className="text-sm font-bold text-blue-700">{step.expected_open_rate}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-center">
                      <p className="text-xs text-green-600 font-medium">Reply Rate</p>
                      <p className="text-sm font-bold text-green-700">{step.expected_reply_rate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {generatedSequence.exit_conditions && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-sm">Exit Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {generatedSequence.exit_conditions.map((condition, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {condition}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {generatedSequence.optimization_tips && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {generatedSequence.optimization_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                      <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              Save as Template
            </Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Activate Sequence
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
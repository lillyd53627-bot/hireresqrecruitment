import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, RefreshCw, Send, Loader2, User, Briefcase } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AIMessagePersonalizer({ onMessageGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: 'candidate',
    recipientName: '',
    recipientTitle: '',
    recipientCompany: '',
    jobTitle: '',
    companyName: '',
    messageType: 'email',
    tone: 'professional',
    goal: 'initial_outreach',
    additionalContext: ''
  });
  const [generatedMessage, setGeneratedMessage] = useState(null);

  const generatePersonalizedMessage = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a highly personalized ${formData.messageType} message for recruitment outreach.

RECIPIENT PROFILE:
- Type: ${formData.recipientType}
- Name: ${formData.recipientName}
- Current Title: ${formData.recipientTitle}
- Current Company: ${formData.recipientCompany}

JOB DETAILS:
- Position: ${formData.jobTitle}
- Company: ${formData.companyName}

MESSAGE PARAMETERS:
- Tone: ${formData.tone}
- Goal: ${formData.goal}
- Additional Context: ${formData.additionalContext || 'None'}

Create a compelling, personalized message that:
1. Opens with a specific reference to their current role or company
2. Clearly articulates why they're a great fit
3. Highlights unique aspects of the opportunity
4. Includes a clear, low-friction call-to-action
5. Feels authentic and human, not templated

${formData.messageType === 'email' ? 'Include a subject line.' : 'Keep it concise for WhatsApp (under 150 words).'}

Make it feel like it was written specifically for this person, not a mass message.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            message_body: { type: "string" },
            personalization_elements: {
              type: "array",
              items: { type: "string" }
            },
            best_time_to_send: { type: "string" },
            follow_up_timing: { type: "string" }
          }
        }
      });

      setGeneratedMessage(response);
      if (onMessageGenerated) {
        onMessageGenerated(response);
      }
    } catch (error) {
      console.error('Error generating message:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-red-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            AI Message Personalizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recipient Type</Label>
              <Select value={formData.recipientType} onValueChange={(value) => setFormData({...formData, recipientType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={formData.messageType} onValueChange={(value) => setFormData({...formData, messageType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Recipient Name</Label>
              <Input 
                placeholder="e.g., Sarah Johnson"
                value={formData.recipientName}
                onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Current Title</Label>
              <Input 
                placeholder="e.g., Senior Developer"
                value={formData.recipientTitle}
                onChange={(e) => setFormData({...formData, recipientTitle: e.target.value})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Company</Label>
              <Input 
                placeholder="e.g., Google"
                value={formData.recipientCompany}
                onChange={(e) => setFormData({...formData, recipientCompany: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input 
                placeholder="e.g., Lead Engineer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hiring Company</Label>
            <Input 
              placeholder="e.g., TechCorp"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData({...formData, tone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Goal</Label>
              <Select value={formData.goal} onValueChange={(value) => setFormData({...formData, goal: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial_outreach">Initial Outreach</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="meeting_request">Meeting Request</SelectItem>
                  <SelectItem value="job_opportunity">Job Opportunity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Context (Optional)</Label>
            <Textarea 
              placeholder="Any specific details to include..."
              value={formData.additionalContext}
              onChange={(e) => setFormData({...formData, additionalContext: e.target.value})}
              rows={3}
            />
          </div>

          <Button 
            onClick={generatePersonalizedMessage}
            disabled={isGenerating || !formData.recipientName || !formData.jobTitle}
            className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Personalized Message...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Personalized Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedMessage && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-purple-50">
            <CardTitle className="text-lg">Generated Message</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {formData.messageType === 'email' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Subject Line</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{generatedMessage.subject}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Message Body</Label>
              <Textarea 
                value={generatedMessage.message_body}
                onChange={(e) => setGeneratedMessage({...generatedMessage, message_body: e.target.value})}
                className="min-h-[250px]"
              />
            </div>

            {generatedMessage.personalization_elements?.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Personalization Elements</Label>
                <div className="flex flex-wrap gap-2">
                  {generatedMessage.personalization_elements.map((element, i) => (
                    <Badge key={i} variant="secondary" className="bg-purple-100 text-purple-700">
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-medium mb-1">Best Time to Send</p>
                <p className="text-sm text-blue-900">{generatedMessage.best_time_to_send}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium mb-1">Follow-up Timing</p>
                <p className="text-sm text-green-900">{generatedMessage.follow_up_timing}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={generatePersonalizedMessage}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
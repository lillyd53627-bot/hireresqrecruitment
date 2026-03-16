import React, { useState } from 'react';
import { base44 } from "@/lib/mockBase44";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Sparkles, Loader2, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

const messageTemplates = {
  welcome: 'Welcome message after offer acceptance',
  document_reminder: 'Reminder to submit required documents',
  document_received: 'Confirmation of document receipt',
  background_check: 'Background check update',
  start_date_reminder: 'Upcoming start date reminder',
  first_day_prep: 'First day preparation instructions',
  custom: 'Custom personalized message'
};

export default function PersonalizedCommunication({ onboarding }) {
  const [messageType, setMessageType] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  const generateMessage = async () => {
    if (!messageType) {
      toast.error('Please select a message type');
      return;
    }

    setIsGenerating(true);
    try {
      let prompt = `Generate a personalized ${messageTemplates[messageType]} for candidate onboarding:

Candidate Name: ${onboarding.candidate_name}
Position: ${onboarding.job_title}
Company: ${onboarding.company}
Current Status: ${onboarding.status}
Start Date: ${onboarding.start_date || 'TBD'}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

The message should be:
1. Warm and welcoming
2. Professional yet friendly
3. Clear and actionable
4. Personalized to the candidate and their situation
5. Concise but comprehensive

Write the message ready to be sent via email.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            message: { type: "string" }
          }
        }
      });

      setGeneratedMessage(response.message);
      toast.success('Message generated successfully!');
    } catch (error) {
      toast.error('Failed to generate message');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessage = async () => {
    if (!generatedMessage) {
      toast.error('Please generate a message first');
      return;
    }

    setIsSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: onboarding.candidate_email,
        subject: `${onboarding.company} - Onboarding Update`,
        body: generatedMessage
      });

      await base44.entities.Onboarding.update(onboarding.id, {
        communication_log: [
          ...(onboarding.communication_log || []),
          {
            date: new Date().toISOString(),
            type: messageType,
            message: generatedMessage.substring(0, 100) + '...',
            status: 'sent'
          }
        ]
      });

      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
      toast.success('Message sent successfully!');
      setGeneratedMessage('');
      setMessageType('');
      setCustomInstructions('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            AI-Powered Personalized Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Message Type</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select message type..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(messageTemplates).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Instructions (Optional)</Label>
            <Textarea
              placeholder="Add any specific details you want to include in the message..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={generateMessage}
            disabled={isGenerating || !messageType}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Message...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Message
              </>
            )}
          </Button>

          {generatedMessage && (
            <div className="space-y-3 pt-4">
              <Label>Generated Message</Label>
              <Textarea
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="min-h-[200px]"
              />
              <Button
                onClick={sendMessage}
                disabled={isSending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to Candidate
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication History */}
      {onboarding.communication_log?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Communication History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {onboarding.communication_log.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">
                        {log.type?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
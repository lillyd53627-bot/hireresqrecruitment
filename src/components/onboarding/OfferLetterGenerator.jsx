import React, { useState } from 'react';
import { base44 } from "@/lib/mockBase44";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Send, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OfferLetterGenerator({ onboarding }) {
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  const generateOfferLetter = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a professional offer letter for the following candidate:

Candidate Name: ${onboarding.candidate_name}
Position: ${onboarding.job_title}
Company: ${onboarding.company}
Start Date: ${onboarding.start_date || 'To be determined'}
Salary: R ${onboarding.salary?.toLocaleString() || 'To be discussed'}

The offer letter should include:
1. A warm welcome and congratulations
2. Position details and reporting structure
3. Compensation and benefits overview
4. Start date and working hours
5. Required documents for onboarding
6. Instructions on how to accept the offer
7. Professional closing

Make it warm, professional, and exciting. The tone should reflect South African business culture.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            letter_body: { type: "string" }
          }
        }
      });

      setGeneratedLetter(response.letter_body);
      toast.success('Offer letter generated successfully!');
    } catch (error) {
      toast.error('Failed to generate offer letter');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendOfferLetter = async () => {
    if (!generatedLetter) {
      toast.error('Please generate the offer letter first');
      return;
    }

    setIsSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: onboarding.candidate_email,
        subject: `Offer Letter - ${onboarding.job_title} at ${onboarding.company}`,
        body: generatedLetter
      });

      await base44.entities.Onboarding.update(onboarding.id, {
        status: 'offer_sent',
        offer_sent_date: new Date().toISOString(),
        offer_letter_url: 'sent_via_email',
        onboarding_progress: 20,
        next_action: 'Wait for candidate to accept offer',
        communication_log: [
          ...(onboarding.communication_log || []),
          {
            date: new Date().toISOString(),
            type: 'offer_letter_sent',
            message: 'Offer letter sent via email',
            status: 'sent'
          }
        ]
      });

      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
      toast.success('Offer letter sent successfully!');
    } catch (error) {
      toast.error('Failed to send offer letter');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Offer Letter Generator
          </div>
          {!generatedLetter && (
            <Button
              onClick={generateOfferLetter}
              disabled={isGenerating}
              className="bg-red-600 hover:bg-red-700"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {generatedLetter ? (
          <>
            <Textarea
              value={generatedLetter}
              onChange={(e) => setGeneratedLetter(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={generateOfferLetter}
                disabled={isGenerating}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={sendOfferLetter}
                disabled={isSending}
                className="flex-1 bg-red-600 hover:bg-red-700"
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
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No offer letter generated yet</p>
            <Button
              onClick={generateOfferLetter}
              disabled={isGenerating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Offer Letter
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
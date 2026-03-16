import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Loader2, CheckCircle2, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AIOnboardingAssistant() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickActions = [
    'Generate a welcome email template',
    'Create a checklist for new hires',
    'Draft a document collection reminder',
    'Write first day instructions'
  ];

  const handleQuickAction = (action) => {
    setQuery(action);
  };

  const processQuery = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      const prompt = `You are an AI onboarding assistant for a recruitment platform. Help with the following request:

"${query}"

Provide a helpful, actionable response that assists with candidate onboarding tasks. If it's about generating content, provide ready-to-use templates. If it's about process, give clear step-by-step guidance.`;

      const result = InvokeLLM({
        prompt: prompt
      });

      setResponse(result);
    } catch (error) {
      toast.error('Failed to process request');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Onboarding Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              className="text-xs"
            >
              {action}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="Ask me anything about onboarding... (e.g., 'Create a personalized welcome message' or 'What documents should I collect?')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={processQuery}
            disabled={isProcessing || !query.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Get AI Help
              </>
            )}
          </Button>
        </div>

        {response && (
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-sm whitespace-pre-wrap">{response}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Send, Loader2, Sparkles, User, X 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function RecruitmentAssistantChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      // Simulate AI response (replace with real API call later)
      await new Promise(resolve => setTimeout(resolve, 1200));

      const simulatedReply = getSimulatedReply(input.trim());

      setMessages(prev => [...prev, { role: 'assistant', content: simulatedReply }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, something went wrong. Please try again." 
      }]);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  // Simple simulated replies based on common queries
  const getSimulatedReply = (userInput) => {
    const lower = userInput.toLowerCase();

    if (lower.includes('hire') && lower.includes('sales')) {
      return "Great! To hire a Sales Manager in Johannesburg:\n\n1. **Define requirements** – Target 5+ years B2B experience, strong closing skills.\n2. **Sourcing** – Post on LinkedIn, Indeed, PNet, and reach out to passive candidates.\n3. **Screening** – Use AI to filter CVs for keywords like 'hunter', 'quota', 'CRM'.\n4. **Interviews** – 3 rounds: phone screen → competency → final with director.\n\nWant me to draft a job ad or generate interview questions?";
    }

    if (lower.includes('source') || lower.includes('candidates')) {
      return "Sourcing candidates is one of my strengths! 😊\n\nTell me:\n- Role title\n- Location\n- Key skills\n- Salary range (optional)\n\nExample: \"Source developers in Cape Town with React and Node.js experience\"\n\nI'll give you search strategies, platforms, and outreach templates.";
    }

    if (lower.includes('interview') || lower.includes('questions')) {
      return "I'd be happy to help with interview questions!\n\nWhich role? (e.g. Marketing Manager, Software Developer)\nWhich stage? (screening, technical, behavioral)\n\nQuick example for Marketing Manager:\n1. Tell me about a campaign you led from start to finish.\n2. How do you measure ROI on digital marketing?\n3. Describe a time you handled a failed campaign.\n\nWant 10 tailored questions? Just give me more details!";
    }

    return "I'm here to help with anything recruitment-related! 😄\n\nYou can ask me to:\n- Source candidates\n- Write job descriptions\n- Generate interview questions\n- Screen CVs\n- Prepare outreach messages\n\nWhat would you like to do next?";
  };

  const quickActions = [
    'Help me hire a Sales Manager in Johannesburg',
    'Source candidates for a Software Developer role',
    'Screen 5 candidates for a Financial Advisor position',
    'Generate interview questions for a Marketing Manager'
  ];

  return (
    <Card className="h-[600px] flex flex-col shadow-xl border-0">
      <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Bot className="w-6 h-6 text-red-600" />
          HireResQ AI Assistant
          <Badge className="ml-2 bg-red-600 text-white">Live</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Your automated hiring department — sourcing, screening, interviews & shortlisting
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <Bot className="w-20 h-20 text-red-200 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Welcome to HireResQ AI</h3>
              <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                I'm your AI-powered recruitment partner. I can help you source candidates, write job ads, generate interview questions, screen CVs, and more.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {quickActions.map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto py-4 px-5 text-left justify-start border-2 hover:border-red-400 transition-colors"
                    onClick={() => setInput(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-6 h-6 text-red-600" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm",
                    message.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 rounded-bl-none border'
                  )}
                >
                  {message.role === 'user' ? (
                    <p className="text-base leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
                          li: ({ children }) => <li className="text-gray-800">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          code: ({ children }) => (
                            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">{children}</code>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-6 h-6 text-gray-700" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-white">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything about hiring... (Shift + Enter for new line)"
              className="flex-1 min-h-[56px] resize-none rounded-xl border-gray-300 focus-visible:ring-red-500"
              rows={2}
            />
            <Button
              onClick={sendMessage}
              disabled={isSending || !input.trim()}
              className="h-[56px] px-6 bg-red-600 hover:bg-red-700 rounded-xl"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
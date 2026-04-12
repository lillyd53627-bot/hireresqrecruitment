// src/pages/Dashboard/AIAssistant.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, Send, Loader2, Sparkles 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hi! I'm your AI Recruitment Assistant. Ask me anything about sourcing candidates, writing job posts, outreach, interview questions, or anything hiring-related." 
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('recruitment-assistant', {
        body: { 
          message: currentInput,
          conversation_history: messages 
        }
      });

      if (error) throw error;

      const assistantReply = data?.response || "I'm here to help with recruitment. Try asking me to find candidates or help with outreach.";

      setMessages(prev => [...prev, { role: 'assistant', content: assistantReply }]);
    } catch (err) {
      console.error(err);
      toast.error("Sorry, I couldn't process that right now. Please try again.");
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Try asking something like 'Find sales managers in Johannesburg'." 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="text-purple-600" /> AI Recruitment Assistant
        </h1>
        <p className="text-gray-600 mt-2">Ask in natural language — I can help source candidates, suggest outreach, screen profiles, and more.</p>
      </div>

      <Card className="border-0 shadow-sm min-h-[560px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            HireResQ AI Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white border shadow-sm'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-purple-600">
                    <Bot className="w-4 h-4" />
                    <span className="text-xs font-medium">AI Assistant</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-2xl px-5 py-3 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Example: Find me sales managers in Johannesburg with call centre experience"
              className="flex-1 min-h-[52px] resize-y max-h-40"
              rows={1}
            />
            <Button 
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              className="bg-red-600 hover:bg-red-700 px-10"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
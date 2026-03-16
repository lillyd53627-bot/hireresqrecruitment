import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MessageSquare, Send, Plus,
  Sparkles, RefreshCw, Users, Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

// Mock data
const campaigns = [
  {
    id: 1,
    name: 'Tech Talent Outreach',
    type: 'email',
    status: 'active',
    sent: 450,
    opened: 180,
    replied: 45,
    meetings: 12,
    progress: 75
  },
  {
    id: 2,
    name: 'Client Acquisition Q4',
    type: 'email',
    status: 'active',
    sent: 200,
    opened: 85,
    replied: 22,
    meetings: 8,
    progress: 60
  },
  {
    id: 3,
    name: 'WhatsApp Follow-ups',
    type: 'whatsapp',
    status: 'paused',
    sent: 150,
    opened: 120,
    replied: 35,
    meetings: 5,
    progress: 40
  },
];

const messages = [
  {
    id: 1,
    recipient: 'John Smith',
    company: 'TechCorp',
    subject: 'Senior Developer Role - Perfect Match',
    status: 'replied',
    sentAt: '2 hours ago',
    channel: 'email'
  },
  {
    id: 2,
    recipient: 'Sarah Johnson',
    company: 'StartupX',
    subject: 'Exciting PM Opportunity',
    status: 'opened',
    sentAt: '4 hours ago',
    channel: 'email'
  },
  {
    id: 3,
    recipient: 'Michael Chen',
    company: 'DesignCo',
    subject: 'Following up on our conversation',
    status: 'sent',
    sentAt: '1 day ago',
    channel: 'whatsapp'
  },
];

export default function OutreachDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');

  const handleGenerateMessage = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setGeneratedMessage(`Hi [Name],

I came across your profile and was impressed by your experience at [Company]. We're currently working with a leading tech company in Cape Town looking for someone with your exact skillset.

The role offers:
• Competitive salary (R80k - R100k)
• Remote work flexibility
• Cutting-edge tech stack

Would you be open to a quick 15-minute call this week to discuss?

Best regards,
[Your Name]`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <header className="py-16 md:py-24 text-center bg-gradient-to-r from-red-600 to-red-800 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">AI Outreach Engine</h1>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto px-6">
          Personalized sequences that book meetings automatically — no more cold outreach.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Messages Sent', value: '2,450', color: 'text-blue-600' },
            { label: 'Open Rate', value: '42%', color: 'text-green-600' },
            { label: 'Reply Rate', value: '18%', color: 'text-purple-600' },
            { label: 'Meetings Booked', value: '68', color: 'text-red-600' },
          ].map((stat, i) => (
            <Card key={i} className="text-center border-0 shadow-md">
              <CardContent className="pt-6">
                <p className={`text-4xl md:text-5xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm md:text-base text-gray-600 mt-2">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs: Campaigns & Messages */}
        <Tabs defaultValue="campaigns" className="mb-12">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
            <TabsTrigger value="messages">Recent Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign, i) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        {campaign.type === 'email' ? (
                          <Mail className="w-6 h-6 text-blue-600" />
                        ) : (
                          <MessageSquare className="w-6 h-6 text-green-600" />
                        )}
                        {campaign.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Sent</p>
                            <p className="font-medium">{campaign.sent}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Replied</p>
                            <p className="font-medium">{campaign.replied}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 bg-gray-50 rounded-lg flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {msg.channel === 'email' ? (
                          <Mail className="w-5 h-5 text-blue-600" />
                        ) : (
                          <MessageSquare className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{msg.recipient} • {msg.company}</p>
                        <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
                      </div>
                      <Badge
                        className={
                          msg.status === 'replied'
                            ? 'bg-green-100 text-green-700'
                            : msg.status === 'opened'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {msg.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Message Generator Preview */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-red-600" />
              AI Message Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleGenerateMessage}
              disabled={isGenerating}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-7 text-lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Sample Message
                </>
              )}
            </Button>

            {generatedMessage && (
              <div className="space-y-4">
                <Textarea
                  value={generatedMessage}
                  readOnly
                  className="min-h-[220px] text-base"
                />
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 py-6 text-lg">
                    Regenerate
                  </Button>
                  <Button className="flex-1 bg-black hover:bg-gray-900 text-white py-6 text-lg">
                    Use This Message
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <a
            href="/pricing"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-xl text-2xl font-bold transition"
          >
            Unlock Full AI Outreach Engine
          </a>
          <p className="mt-6 text-gray-600 text-lg">
            Personalized sequences, smart timing, auto-follow-ups & meeting booking — start your free trial today.
          </p>
        </div>
      </main>
    </div>
  );
}
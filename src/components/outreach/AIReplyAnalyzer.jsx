import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle2,
  MessageSquare, Clock, Zap, Send, Loader2, ThumbsUp,
  ThumbsDown, Calendar, Target
} from 'lucide-react';

export default function AIReplyAnalyzer() {
  const [replyText, setReplyText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [suggestedResponse, setSuggestedResponse] = useState(null);

  const analyzeReply = async () => {
    if (!replyText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this recruitment outreach reply and provide actionable intelligence:

REPLY TEXT:
"${replyText}"

Provide a comprehensive analysis including:

1. Sentiment & Intent:
   - Overall sentiment (positive, neutral, negative, mixed)
   - Primary intent (interested, not interested, needs more info, timing issue, etc.)
   - Engagement level (high, medium, low)

2. Key Signals:
   - Specific objections or concerns mentioned
   - Interest indicators
   - Timing/availability signals
   - Budget/salary signals
   - Decision-making authority signals

3. Next Best Action:
   - Recommended immediate action
   - Suggested timeline for response
   - Priority level (hot lead, warm, cold, dead)

4. Response Strategy:
   - Tone to use in response
   - Key points to address
   - Questions to ask
   - Value propositions to highlight

5. Red Flags & Green Flags:
   - Warning signs to watch for
   - Positive indicators

Be specific and actionable. This analysis will be used to inform the next steps in the recruitment process.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["positive", "neutral", "negative", "mixed"]
            },
            intent: { type: "string" },
            engagement_level: {
              type: "string",
              enum: ["high", "medium", "low"]
            },
            priority: {
              type: "string",
              enum: ["hot_lead", "warm_lead", "cold_lead", "not_interested"]
            },
            key_signals: {
              type: "object",
              properties: {
                objections: { type: "array", items: { type: "string" } },
                interest_indicators: { type: "array", items: { type: "string" } },
                timing_signals: { type: "string" },
                salary_signals: { type: "string" }
              }
            },
            next_action: {
              type: "object",
              properties: {
                action: { type: "string" },
                timeline: { type: "string" },
                urgency: { type: "string" }
              }
            },
            response_strategy: {
              type: "object",
              properties: {
                tone: { type: "string" },
                key_points: { type: "array", items: { type: "string" } },
                questions_to_ask: { type: "array", items: { type: "string" } },
                value_props: { type: "array", items: { type: "string" } }
              }
            },
            red_flags: { type: "array", items: { type: "string" } },
            green_flags: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });

      setAnalysis(response);
    } catch (error) {
      console.error('Error analyzing reply:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateResponse = async () => {
    if (!analysis) return;
    
    setIsGeneratingResponse(true);
    try {
      const prompt = `Based on the following reply analysis, generate a perfect response:

ORIGINAL REPLY: "${replyText}"

ANALYSIS SUMMARY:
- Sentiment: ${analysis.sentiment}
- Intent: ${analysis.intent}
- Priority: ${analysis.priority}

RESPONSE STRATEGY:
- Tone: ${analysis.response_strategy.tone}
- Key Points: ${analysis.response_strategy.key_points.join(', ')}
- Questions: ${analysis.response_strategy.questions_to_ask.join(', ')}

Generate a response that:
1. Matches the recommended tone
2. Addresses key concerns/signals from the original reply
3. Asks strategic questions from the strategy
4. Moves the conversation forward
5. Feels natural and human
6. Includes a clear call-to-action

Make it concise, warm, and actionable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject_line: { type: "string" },
            response_body: { type: "string" },
            alternative_response: { type: "string" },
            best_time_to_send: { type: "string" }
          }
        }
      });

      setSuggestedResponse(response);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-200';
      case 'negative': return 'bg-red-100 text-red-700 border-red-200';
      case 'mixed': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'hot_lead': return 'bg-red-100 text-red-700';
      case 'warm_lead': return 'bg-orange-100 text-orange-700';
      case 'cold_lead': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Reply Analyzer & Response Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Paste Recipient's Reply</Label>
            <Textarea 
              placeholder="Paste the email or message reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={analyzeReply}
            disabled={isAnalyzing || !replyText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Reply...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Analyze Reply with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-lg">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">{analysis.summary}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${getSentimentColor(analysis.sentiment)}`}>
                  <p className="text-xs font-medium mb-1">Sentiment</p>
                  <p className="text-lg font-bold capitalize">{analysis.sentiment}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs font-medium text-purple-700 mb-1">Engagement</p>
                  <p className="text-lg font-bold text-purple-900 capitalize">{analysis.engagement_level}</p>
                </div>
                <div className={`p-4 rounded-lg border ${getPriorityColor(analysis.priority)}`}>
                  <p className="text-xs font-medium mb-1">Priority</p>
                  <p className="text-lg font-bold capitalize">{analysis.priority?.replace('_', ' ') || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-600" />
                  Intent & Signals
                </h4>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Intent:</span> {analysis.intent}
                </p>
                {analysis.key_signals.objections?.length > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs font-medium text-orange-700 mb-2">Objections</p>
                    <ul className="space-y-1">
                      {analysis.key_signals.objections.map((obj, i) => (
                        <li key={i} className="text-sm text-orange-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.key_signals.interest_indicators?.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-medium text-green-700 mb-2">Interest Indicators</p>
                    <ul className="space-y-1">
                      {analysis.key_signals.interest_indicators.map((ind, i) => (
                        <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {ind}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Recommended Next Action
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-amber-900">{analysis.next_action.action}</p>
                    <div className="flex gap-3 text-sm">
                      <Badge variant="outline" className="bg-white">
                        <Clock className="w-3 h-3 mr-1" />
                        {analysis.next_action.timeline}
                      </Badge>
                      <Badge variant="outline" className="bg-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {analysis.next_action.urgency}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {analysis.green_flags?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      Green Flags
                    </h4>
                    <ul className="space-y-1">
                      {analysis.green_flags.map((flag, i) => (
                        <li key={i} className="text-xs text-green-700">• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.red_flags?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4" />
                      Red Flags
                    </h4>
                    <ul className="space-y-1">
                      {analysis.red_flags.map((flag, i) => (
                        <li key={i} className="text-xs text-red-700">• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-semibold text-purple-800 mb-3">Response Strategy</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-purple-600 font-medium mb-1">Recommended Tone</p>
                    <p className="text-sm text-purple-900">{analysis.response_strategy.tone}</p>
                  </div>
                  {analysis.response_strategy.key_points?.length > 0 && (
                    <div>
                      <p className="text-xs text-purple-600 font-medium mb-1">Key Points to Address</p>
                      <ul className="space-y-1">
                        {analysis.response_strategy.key_points.map((point, i) => (
                          <li key={i} className="text-sm text-purple-900">• {point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.response_strategy.questions_to_ask?.length > 0 && (
                    <div>
                      <p className="text-xs text-purple-600 font-medium mb-1">Questions to Ask</p>
                      <ul className="space-y-1">
                        {analysis.response_strategy.questions_to_ask.map((q, i) => (
                          <li key={i} className="text-sm text-purple-900">• {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={generateResponse}
                disabled={isGeneratingResponse}
                className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                {isGeneratingResponse ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Perfect Response...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Response
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {suggestedResponse && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                <CardTitle className="text-lg">AI-Generated Response</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Subject Line</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{suggestedResponse.subject_line}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Response (Primary)</Label>
                  <Textarea 
                    value={suggestedResponse.response_body}
                    onChange={(e) => setSuggestedResponse({...suggestedResponse, response_body: e.target.value})}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Alternative Response</Label>
                  <Textarea 
                    value={suggestedResponse.alternative_response}
                    readOnly
                    className="min-h-[150px] bg-gray-50"
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Best Time to Send
                  </p>
                  <p className="text-sm text-blue-900">{suggestedResponse.best_time_to_send}</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={generateResponse}>
                    Generate Alternative
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
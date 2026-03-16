import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Shield, Sparkles, Loader2, AlertTriangle, CheckCircle2,
  TrendingUp, Users, Edit3, Copy
} from 'lucide-react';
import { toast } from 'sonner';

export default function JobDescriptionBiasAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description first");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // This is where you'd normally call your AI API
      // For local/demo, we simulate a realistic response
      await new Promise(resolve => setTimeout(resolve, 2200)); // fake thinking time

      const simulatedAnalysis = {
        inclusivity_score: 78,
        overall_assessment: "The job description is mostly inclusive but contains several subtle masculine-coded words and credential-heavy requirements that may discourage diverse applicants.",
        bias_categories: {
          gender: 72,
          age: 85,
          disability: 90,
          cultural: 75,
          educational: 68
        },
        issues_found: [
          {
            phrase: "aggressive sales hunter",
            issue: "Gender-coded language (masculine aggression)",
            severity: "high",
            suggestion: "Replace with 'proactive sales professional' or 'results-driven salesperson'"
          },
          {
            phrase: "top-tier university degree",
            issue: "Educational elitism / class bias",
            severity: "medium",
            suggestion: "Change to 'relevant degree or equivalent experience'"
          },
          {
            phrase: "digital native",
            issue: "Potential age discrimination",
            severity: "low",
            suggestion: "Remove or rephrase to 'comfortable with digital tools'"
          }
        ],
        improved_description: `We are looking for a proactive and results-driven Sales Professional to join our growing team.

You will:
- Proactively identify and develop new business opportunities
- Build and maintain strong client relationships
- Achieve and exceed sales targets through consultative selling
- Collaborate with marketing and product teams

Requirements:
- Proven track record in B2B sales
- Strong communication and negotiation skills
- Experience using CRM systems
- Self-motivated with a passion for helping clients succeed
- Relevant experience or qualifications (degree not required)

What we offer:
- Competitive salary + commission
- Full training and ongoing development
- Flexible working environment
- Opportunity to grow with a dynamic company

We welcome applications from people of all backgrounds and are committed to building a diverse team.`,
        positive_elements: [
          "Clear role responsibilities",
          "Good emphasis on collaboration",
          "Offers training and development"
        ],
        recommendations: [
          "Use gender-neutral language throughout",
          "Focus on skills and outcomes rather than credentials",
          "Add explicit diversity & inclusion statement",
          "Highlight flexible work options to attract caregivers"
        ]
      };

      setAnalysis(simulatedAnalysis);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error('Error analyzing job description:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-gradient-to-b from-green-50 to-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            AI Job Description Bias Analyzer
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Paste your job ad → get instant bias check + inclusive rewrite suggestions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Job Description / Advert Text</Label>
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="resize-none text-base leading-relaxed"
            />
          </div>

          <Button
            onClick={analyzeJobDescription}
            disabled={isAnalyzing || !jobDescription.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-7 text-lg gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing for Bias & Inclusivity...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="text-xl">Inclusivity Analysis Results</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              <div className="text-center">
                <p className="text-base text-gray-600 mb-3">Inclusivity Score</p>
                <p className={`text-7xl font-extrabold ${getScoreColor(analysis.inclusivity_score)}`}>
                  {analysis.inclusivity_score}
                </p>
                <p className="text-lg text-gray-500 mt-2">out of 100</p>
              </div>

              <p className="text-center mt-6 text-gray-700 italic max-w-3xl mx-auto px-4">
                {analysis.overall_assessment}
              </p>
            </CardContent>
          </Card>

          {/* Bias Category Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bias Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {Object.entries(analysis.bias_categories || {}).map(([category, score]) => (
                  <div key={category} className="p-4 bg-gray-50 rounded-lg text-center border">
                    <p className="text-sm text-gray-600 capitalize mb-2">{category}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px] mx-auto">
                        <div
                          className={`h-full ${score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="font-bold text-lg">{score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issues Found */}
          {analysis.issues_found?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Issues Detected ({analysis.issues_found.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.issues_found.map((issue, i) => (
                  <div
                    key={i}
                    className={`p-5 rounded-lg border ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-mono text-base font-medium">"{issue.phrase}"</p>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {issue.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{issue.issue}</p>
                    <div className="bg-white/70 p-3 rounded text-gray-800">
                      <span className="font-medium">Suggested fix:</span> {issue.suggestion}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Positive Elements */}
          {analysis.positive_elements?.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-5 h-5" />
                  Positive Elements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.positive_elements.map((element, i) => (
                    <li key={i} className="text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      {element}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                  <TrendingUp className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-gray-800 flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Improved Description */}
          {analysis.improved_description && (
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <Edit3 className="w-6 h-6 text-blue-600" />
                    Inclusive Version (Ready to Use)
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(analysis.improved_description)}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="p-6 bg-white rounded-xl border border-gray-200 whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {analysis.improved_description}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
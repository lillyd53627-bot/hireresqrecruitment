import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Sparkles, Loader2, Target, AlertCircle,
  CheckCircle2, XCircle, Award, Brain, Zap, BarChart3
} from 'lucide-react';

export default function HiringSuccessPredictor({ candidate, job, interviewData }) {
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const predictSuccess = async () => {
    setIsPredicting(true);
    try {
      const prompt = `You are an AI hiring analyst. Predict the hiring success probability for this candidate:

CANDIDATE PROFILE:
- Name: ${candidate.name}
- Title: ${candidate.title}
- Experience: ${candidate.experience_years} years
- Skills: ${candidate.skills?.join(', ') || 'Not specified'}
- Current Company: ${candidate.company}
- Match Score: ${candidate.match_score || 'N/A'}
- Cultural Fit Score: ${candidate.cultural_fit_score || 'N/A'}

JOB REQUIREMENTS:
- Role: ${job?.title || 'Not specified'}
- Company: ${job?.company || 'Not specified'}
- Required Skills: ${job?.skills_required?.join(', ') || 'Not specified'}

INTERVIEW DATA:
- Interview Status: ${interviewData?.status || 'Pending'}
- AI Score: ${interviewData?.ai_score || 'Not available'}
- Skill Assessment: ${interviewData?.skill_score || 'Not available'}
- Behavior Score: ${interviewData?.behavior_score || 'Not available'}

Analyze and predict:

1. HIRING SUCCESS PROBABILITY (0-100%):
   - Overall success likelihood
   - Confidence level in prediction

2. KEY SUCCESS FACTORS:
   - What makes this candidate likely to succeed
   - Strengths alignment with role

3. RISK FACTORS:
   - Potential challenges
   - Areas of concern
   - Mitigation strategies

4. PERFORMANCE PREDICTIONS:
   - Expected ramp-up time
   - Long-term success potential
   - Team fit assessment
   - Retention likelihood (1-2 years)

5. COMPARATIVE ANALYSIS:
   - How candidate ranks vs typical hires
   - Similar candidate outcomes

6. RECOMMENDATIONS:
   - Hire, pass, or needs more evaluation
   - Additional steps to reduce risk
   - Onboarding focus areas

Be data-driven, realistic, and actionable.`;

        prompt: prompt,
        "response_json_schema": {
          type: "object",
          properties: {
            success_probability: { type: "number" },
            confidence_level: {
              type: "string",
              enum: ["very_high", "high", "moderate", "low"]
            },
            recommendation: {
              type: "string",
              enum: ["strong_hire", "hire", "maybe", "pass"]
            },
            success_factors: {
              type: "array",
              items: { type: "string" }
            },
            risk_factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  severity: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            performance_predictions: {
              type: "object",
              properties: {
                ramp_up_time: { type: "string" },
                long_term_success: { type: "string" },
                team_fit: { type: "string" },
                retention_likelihood: { type: "string" }
              }
            },
            comparative_analysis: { type: "string" },
            key_metrics: {
              type: "object",
              properties: {
                skill_alignment: { type: "number" },
                experience_fit: { type: "number" },
                cultural_match: { type: "number" },
                growth_potential: { type: "number" }
              }
            },
            action_items: {
              type: "array",
              items: { type: "string" }
            },
            onboarding_focus: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setPrediction(response);
    } catch (error) {
      console.error('Error predicting hiring success:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'strong_hire': return 'bg-green-100 text-green-800 border-green-300';
      case 'hire': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'maybe': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getRecommendationIcon = (rec) => {
    switch (rec) {
      case 'strong_hire': return <Award className="w-5 h-5" />;
      case 'hire': return <CheckCircle2 className="w-5 h-5" />;
      case 'maybe': return <AlertCircle className="w-5 h-5" />;
      default: return <XCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Hiring Success Predictor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4">
            Predict hiring success probability using AI analysis of candidate profile, job fit, and interview performance.
          </p>
          <Button
            onClick={predictSuccess}
            disabled={isPredicting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {isPredicting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Data...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Predict Success
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <div className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-lg">Success Prediction</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center p-8 bg-white rounded-xl border-2 border-gray-100">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${
                  prediction.success_probability >= 80 ? 'bg-green-100' :
                  prediction.success_probability >= 60 ? 'bg-blue-100' :
                  prediction.success_probability >= 40 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <p className={`text-5xl font-bold ${
                    prediction.success_probability >= 80 ? 'text-green-600' :
                    prediction.success_probability >= 60 ? 'text-blue-600' :
                    prediction.success_probability >= 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {prediction.success_probability}%
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-2">Success Probability</p>
                <Badge variant="outline" className="text-xs">
                  {prediction.confidence_level.replace('_', ' ')} confidence
                </Badge>
              </div>

              <div className={`p-4 rounded-xl border-2 ${getRecommendationColor(prediction.recommendation)}`}>
                <div className="flex items-center gap-3">
                  {getRecommendationIcon(prediction.recommendation)}
                  <div>
                    <p className="font-bold text-lg capitalize">
                      {prediction.recommendation.replace('_', ' ')}
                    </p>
                    <p className="text-sm opacity-90">Overall Recommendation</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Key Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(prediction.key_metrics || {}).map(([metric, score]) => (
                    <div key={metric} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 capitalize mb-2">
                        {metric.replace('_', ' ')}
                      </p>
                      <Progress value={score} className="h-2 mb-1" />
                      <p className="text-sm font-bold text-right">{score}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {prediction.success_factors?.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Success Factors
                  </h4>
                  <ul className="space-y-2">
                    {prediction.success_factors.map((factor, i) => (
                      <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                        <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.risk_factors?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    Risk Factors & Mitigation
                  </h4>
                  {prediction.risk_factors.map((risk, i) => (
                    <div key={i} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-orange-900">{risk.risk}</p>
                        <Badge variant="outline" className="text-xs bg-white">
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-800">
                        <span className="font-medium">Mitigation:</span> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Performance Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(prediction.performance_predictions || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-blue-800 capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="text-sm font-medium text-blue-900">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {prediction.comparative_analysis && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-800 mb-2">
                    Comparative Analysis
                  </h4>
                  <p className="text-sm text-purple-900">{prediction.comparative_analysis}</p>
                </div>
              )}

              {prediction.action_items?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Recommended Actions</h4>
                  <ul className="space-y-1">
                    {prediction.action_items.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.onboarding_focus?.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Onboarding Focus Areas
                  </h4>
                  <ul className="space-y-1">
                    {prediction.onboarding_focus.map((focus, i) => (
                      <li key={i} className="text-sm text-gray-700">• {focus}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
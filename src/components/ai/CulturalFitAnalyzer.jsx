import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Brain, Heart, Users, Zap, 
  TrendingUp, Target, Award, Loader2, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function CulturalFitAnalyzer({ candidate, job, onAnalysisComplete }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `You are an expert recruitment AI specializing in cultural fit and nuanced candidate matching.

CANDIDATE PROFILE:
Name: ${candidate.name}
Title: ${candidate.title}
Company: ${candidate.company || 'N/A'}
Skills: ${candidate.skills?.join(', ') || 'N/A'}
Experience: ${candidate.experience_years || 'N/A'} years
Notes: ${candidate.notes || 'No additional notes'}

JOB PROFILE:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description || 'N/A'}
Company Culture: ${job.company_culture || 'N/A'}
Team Description: ${job.team_description || 'N/A'}
Ideal Candidate Profile: ${job.ideal_candidate_profile || 'N/A'}
Job Notes: ${job.notes || 'N/A'}

Analyze this candidate-job pairing and provide:
1. Cultural fit score (0-100) with detailed reasoning
2. Personality traits identified from the candidate's background and notes
3. Work style assessment (collaborative, independent, hybrid, leadership-oriented, etc.)
4. Key motivations and drivers
5. Cultural indicators and values alignment
6. Potential strengths for this specific role beyond technical skills
7. Potential challenges or misalignments to watch for
8. Overall recommendation and confidence level

Be insightful, nuanced, and look beyond keywords. Focus on human factors like:
- Communication style preferences
- Work environment preferences (startup vs corporate, fast-paced vs structured)
- Team dynamics compatibility
- Leadership and autonomy preferences
- Growth aspirations and learning style
- Values alignment

Provide specific, actionable insights that a recruiter can use.`;

        prompt: prompt,
        "response_json_schema": {
          type: "object",
          properties: {
            cultural_fit_score: { type: "number" },
            overall_match_score: { type: "number" },
            confidence_level: { 
              type: "string",
              enum: ["high", "medium", "low"]
            },
            personality_traits: {
              type: "array",
              items: { type: "string" }
            },
            work_style: { type: "string" },
            motivations: {
              type: "array",
              items: { type: "string" }
            },
            cultural_indicators: {
              type: "array",
              items: { type: "string" }
            },
            strengths_for_role: {
              type: "array",
              items: { type: "string" }
            },
            potential_challenges: {
              type: "array",
              items: { type: "string" }
            },
            values_alignment: {
              type: "object",
              properties: {
                score: { type: "number" },
                details: { type: "string" }
              }
            },
            team_fit_assessment: {
              type: "object",
              properties: {
                score: { type: "number" },
                details: { type: "string" }
              }
            },
            growth_potential: {
              type: "object",
              properties: {
                score: { type: "number" },
                details: { type: "string" }
              }
            },
            recommendation: {
              type: "string",
              enum: ["strongly_recommend", "recommend", "consider_with_reservations", "not_recommended"]
            },
            recommendation_summary: { type: "string" },
            key_insights: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(response);
      
      // Call callback if provided
      if (onAnalysisComplete) {
        onAnalysisComplete({
          cultural_fit_score: response.cultural_fit_score,
          match_score: response.overall_match_score,
          ai_insights: {
            personality_traits: response.personality_traits,
            work_style: response.work_style,
            motivations: response.motivations,
            cultural_indicators: response.cultural_indicators,
            summary: response.recommendation_summary
          }
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze cultural fit. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRecommendationColor = (rec) => {
    if (rec === 'strongly_recommend') return 'bg-green-100 text-green-700 border-green-200';
    if (rec === 'recommend') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (rec === 'consider_with_reservations') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getRecommendationText = (rec) => {
    if (rec === 'strongly_recommend') return 'Strongly Recommend';
    if (rec === 'recommend') return 'Recommend';
    if (rec === 'consider_with_reservations') return 'Consider with Reservations';
    return 'Not Recommended';
  };

  return (
    <div>
      {!analysis ? (
        <Card className="border-2 border-dashed border-gray-200 hover:border-red-300 transition-colors">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Cultural Fit Analysis</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get deep insights beyond skills and keywords. Analyze personality traits, work style, 
              values alignment, and cultural fit using advanced AI.
            </p>
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white gap-2 px-8"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Run AI Analysis
                </>
              )}
            </Button>
            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Scores */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">AI Cultural Fit Analysis</h3>
                    <p className="text-sm text-gray-500">Deep matching insights</p>
                  </div>
                </div>
                <Badge className={cn('border px-3 py-1', getRecommendationColor(analysis.recommendation))}>
                  {getRecommendationText(analysis.recommendation)}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={cn('rounded-xl p-4', getScoreColor(analysis.cultural_fit_score))}>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">Cultural Fit</span>
                  </div>
                  <div className="text-3xl font-bold">{analysis.cultural_fit_score}%</div>
                </div>
                <div className={cn('rounded-xl p-4', getScoreColor(analysis.overall_match_score))}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">Overall Match</span>
                  </div>
                  <div className="text-3xl font-bold">{analysis.overall_match_score}%</div>
                </div>
                <div className={cn('rounded-xl p-4', 
                  analysis.confidence_level === 'high' ? 'bg-green-50 text-green-600' :
                  analysis.confidence_level === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-gray-50 text-gray-600'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5" />
                    <span className="text-sm font-medium">Confidence</span>
                  </div>
                  <div className="text-2xl font-bold capitalize">{analysis.confidence_level}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-900">{analysis.recommendation_summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.key_insights?.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis - Collapsible */}
          <Card className="border-0 shadow-md">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowDetails(!showDetails)}
            >
              <div className="flex items-center justify-between">
                <CardTitle>Detailed Analysis</CardTitle>
                {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </CardHeader>
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="space-y-6">
                    {/* Personality & Work Style */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          Personality Traits
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.personality_traits?.map((trait, i) => (
                            <Badge key={i} variant="secondary" className="bg-purple-100 text-purple-700">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          Work Style
                        </h4>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          {analysis.work_style}
                        </p>
                      </div>
                    </div>

                    {/* Motivations */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Key Motivations
                      </h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {analysis.motivations?.map((motivation, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                            <span className="text-sm text-gray-700">{motivation}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alignment Scores */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Values Alignment</span>
                          <span className="text-lg font-bold">{analysis.values_alignment?.score}%</span>
                        </div>
                        <Progress value={analysis.values_alignment?.score} className="h-2 mb-2" />
                        <p className="text-xs text-gray-500">{analysis.values_alignment?.details}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Team Fit</span>
                          <span className="text-lg font-bold">{analysis.team_fit_assessment?.score}%</span>
                        </div>
                        <Progress value={analysis.team_fit_assessment?.score} className="h-2 mb-2" />
                        <p className="text-xs text-gray-500">{analysis.team_fit_assessment?.details}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Growth Potential</span>
                          <span className="text-lg font-bold">{analysis.growth_potential?.score}%</span>
                        </div>
                        <Progress value={analysis.growth_potential?.score} className="h-2 mb-2" />
                        <p className="text-xs text-gray-500">{analysis.growth_potential?.details}</p>
                      </div>
                    </div>

                    {/* Strengths & Challenges */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-green-700">Strengths for This Role</h4>
                        <div className="space-y-2">
                          {analysis.strengths_for_role?.map((strength, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-orange-700">Potential Challenges</h4>
                        <div className="space-y-2">
                          {analysis.potential_challenges?.map((challenge, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{challenge}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cultural Indicators */}
                    <div>
                      <h4 className="font-semibold mb-3">Cultural Indicators</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.cultural_indicators?.map((indicator, i) => (
                          <Badge key={i} variant="outline" className="border-red-200 text-red-700">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAnalysis(null)}>
              Run New Analysis
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
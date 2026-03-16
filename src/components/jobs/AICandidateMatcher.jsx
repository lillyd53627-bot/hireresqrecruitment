import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, Award, AlertCircle, Mail, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AICandidateMatcher({ job }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);

  const matchCandidates = async () => {
    setLoading(true);
    try {
      // Fetch all candidates
      
      // Build detailed prompt for AI matching
      const prompt = `You are an expert recruitment AI. Analyze and rank candidates for a job opening.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Type: ${job.type}
- Salary Range: ${job.salary_min ? `$${job.salary_min.toLocaleString()} - $${job.salary_max?.toLocaleString() || 'N/A'}` : 'Not specified'}
- Description: ${job.description || 'N/A'}
- Requirements: ${job.requirements?.join(', ') || 'N/A'}
- Required Skills: ${job.skills_required?.join(', ') || 'N/A'}
- Company Culture: ${job.company_culture || 'N/A'}
- Team Description: ${job.team_description || 'N/A'}
- Ideal Candidate Profile: ${job.ideal_candidate_profile || 'N/A'}

CANDIDATES TO EVALUATE:
${candidates.map((c, idx) => `
Candidate ${idx + 1}:
- Name: ${c.name}
- Current Title: ${c.title || 'N/A'}
- Company: ${c.company || 'N/A'}
- Location: ${c.location || 'N/A'}
- Experience: ${c.experience_years || 'N/A'} years
- Skills: ${c.skills?.join(', ') || 'N/A'}
- Education: ${c.education || 'N/A'}
- Availability: ${c.availability || 'N/A'}
- Salary Expectation: ${c.salary_expectation || 'N/A'}
- Current Status: ${c.status}
- Notes: ${c.notes || 'N/A'}
- AI Insights: ${c.ai_insights?.summary || 'N/A'}
`).join('\n')}

Analyze each candidate and provide a ranked list of the top matches. For each candidate, provide:
1. Overall match score (0-100)
2. Skills match score (0-100)
3. Cultural fit score (0-100)
4. Experience match score (0-100)
5. Key strengths for this role (3-5 bullet points)
6. Potential concerns (2-3 bullet points)
7. Recommendation level (Excellent Match / Strong Match / Good Match / Consider / Not Recommended)
8. One-line summary of why they match

Return ONLY the top 10 best matches, ranked from best to worst.`;

      const response = InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            ranked_candidates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  candidate_name: { type: "string" },
                  overall_score: { type: "number" },
                  skills_match: { type: "number" },
                  cultural_fit: { type: "number" },
                  experience_match: { type: "number" },
                  strengths: { type: "array", items: { type: "string" } },
                  concerns: { type: "array", items: { type: "string" } },
                  recommendation: { type: "string" },
                  summary: { type: "string" }
                }
              }
            },
            matching_summary: { type: "string" }
          }
        }
      });

      // Enrich with candidate data
      const enrichedMatches = response.ranked_candidates.map(match => {
        const candidate = candidates.find(c => c.name === match.candidate_name);
        return { ...match, candidate };
      });

      setMatches({
        candidates: enrichedMatches,
        summary: response.matching_summary
      });
    } catch (error) {
      console.error('Error matching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec) => {
    const lower = rec.toLowerCase();
    if (lower.includes('excellent')) return 'bg-green-600';
    if (lower.includes('strong')) return 'bg-blue-600';
    if (lower.includes('good')) return 'bg-yellow-600';
    if (lower.includes('consider')) return 'bg-orange-600';
    return 'bg-gray-600';
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {!matches && !loading && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Candidate Matching</h3>
            <p className="text-gray-600 mb-6">
              Let AI analyze your candidate database and rank the best matches for this role
            </p>
            <Button onClick={matchCandidates} className="bg-red-600 hover:bg-red-700">
              <Sparkles className="mr-2 w-4 h-4" />
              Find Best Candidates
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-red-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">AI Analyzing Candidates...</h3>
            <p className="text-gray-600">
              Evaluating skills, experience, cultural fit, and compatibility
            </p>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {matches && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  AI Matching Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{matches.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {matches.candidates.length} best matches found
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={matchCandidates}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Re-analyze
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ranked Candidates */}
            <div className="space-y-4">
              {matches.candidates.map((match, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "hover:shadow-lg transition-all",
                    index === 0 && "border-2 border-green-500 bg-green-50/30"
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          {/* Rank Badge */}
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg",
                            index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                            index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                            index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                            "bg-gray-600"
                          )}>
                            #{index + 1}
                          </div>

                          {/* Candidate Info */}
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{match.candidate_name}</h3>
                              {index === 0 && (
                                <Badge className="bg-green-600 gap-1">
                                  <Award className="w-3 h-3" />
                                  Top Match
                                </Badge>
                              )}
                            </div>
                            {match.candidate && (
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span>{match.candidate.title || 'N/A'}</span>
                                <span>•</span>
                                <span>{match.candidate.location || 'N/A'}</span>
                                <span>•</span>
                                <span>{match.candidate.experience_years || 0} yrs exp</span>
                              </div>
                            )}
                            <Badge className={getRecommendationColor(match.recommendation)}>
                              {match.recommendation}
                            </Badge>
                          </div>
                        </div>

                        {/* Overall Score */}
                        <div className="text-right">
                          <div className={cn(
                            "text-4xl font-bold",
                            getScoreColor(match.overall_score)
                          )}>
                            {match.overall_score}
                          </div>
                          <div className="text-sm text-gray-500">Match Score</div>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-gray-700 mb-4 italic">"{match.summary}"</p>

                      {/* Score Breakdown */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className={cn("text-2xl font-bold", getScoreColor(match.skills_match))}>
                            {match.skills_match}
                          </div>
                          <div className="text-xs text-gray-600">Skills Match</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className={cn("text-2xl font-bold", getScoreColor(match.cultural_fit))}>
                            {match.cultural_fit}
                          </div>
                          <div className="text-xs text-gray-600">Cultural Fit</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className={cn("text-2xl font-bold", getScoreColor(match.experience_match))}>
                            {match.experience_match}
                          </div>
                          <div className="text-xs text-gray-600">Experience</div>
                        </div>
                      </div>

                      {/* Strengths & Concerns */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-sm">Key Strengths</span>
                          </div>
                          <ul className="space-y-1">
                            {match.strengths.map((strength, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span className="font-semibold text-sm">Considerations</span>
                          </div>
                          <ul className="space-y-1">
                            {match.concerns.map((concern, i) => (
                              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-orange-600 mt-0.5">•</span>
                                <span>{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Actions */}
                      {match.candidate && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700 gap-2"
                            onClick={() => window.location.href = `/candidate-profile?id=${match.candidate.id}`}
                          >
                            <User className="w-4 h-4" />
                            View Profile
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Mail className="w-4 h-4" />
                            Contact
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
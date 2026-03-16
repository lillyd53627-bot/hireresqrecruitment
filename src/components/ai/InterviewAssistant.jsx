import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, Loader2, MessageSquare, Mic, MicOff, Clock,
  CheckCircle2, AlertCircle, TrendingUp, User, Briefcase,
  Play, Pause, FileAudio, Upload, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function InterviewAssistant({ candidate, job }) {
  const [generating, setGenerating] = useState(false);
  const [interviewGuide, setInterviewGuide] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [analyzingSentiment, setAnalyzingSentiment] = useState(false);
  const [sentimentResults, setSentimentResults] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const generateInterviewGuide = async () => {
    setGenerating(true);
    try {
      const prompt = `You are an expert interview coach creating a comprehensive interview guide.

CANDIDATE PROFILE:
- Name: ${candidate?.name || 'N/A'}
- Current Role: ${candidate?.title || 'N/A'}
- Company: ${candidate?.company || 'N/A'}
- Experience: ${candidate?.experience_years || 0} years
- Skills: ${candidate?.skills?.join(', ') || 'N/A'}
- Notes: ${candidate?.notes || 'N/A'}

JOB REQUIREMENTS:
- Title: ${job?.title || 'N/A'}
- Company: ${job?.company || 'N/A'}
- Required Skills: ${job?.skills_required?.join(', ') || 'N/A'}
- Description: ${job?.description || 'N/A'}
- Culture: ${job?.company_culture || 'N/A'}
- Ideal Candidate: ${job?.ideal_candidate_profile || 'N/A'}

Create a comprehensive interview guide with:
1. Opening rapport-building questions
2. Technical/skills assessment questions (5-7)
3. Behavioral questions (4-6)
4. Cultural fit questions (3-4)
5. Role-specific situational questions (3-4)
6. Closing questions

For each question provide:
- The question itself
- What you're assessing (skills, behavior, culture fit, etc.)
- Good answer indicators
- Red flag indicators
- Suggested follow-up probes

Also include:
- Interview structure timeline (recommended duration per section)
- Key areas to evaluate
- Warning signs to watch for
- Closing notes`;

      // Simulated AI response (for local/demo - replace with real API call later)
      await new Promise(resolve => setTimeout(resolve, 1800)); // fake delay

      const simulatedGuide = {
        interview_duration: 60,
        key_evaluation_areas: ["Technical skills", "Problem solving", "Communication", "Cultural fit"],
        sections: [
          {
            section_name: "Opening & Rapport",
            duration_minutes: 10,
            questions: [
              {
                question: "Tell me a bit about yourself and your career journey so far.",
                assessing: "Communication & background",
                good_indicators: ["Clear structure", "Relevant experience", "Enthusiasm"],
                red_flags: ["Rambling", "Negative tone about past roles"],
                follow_ups: ["What motivated you to apply here?", "What excites you most about this role?"]
              }
            ]
          },
          {
            section_name: "Technical Assessment",
            duration_minutes: 25,
            questions: [
              {
                question: "Walk me through your experience with React and state management.",
                assessing: "Technical depth",
                good_indicators: ["Specific examples", "Modern patterns", "Performance considerations"],
                red_flags: ["Vague answers", "Outdated practices"],
                follow_ups: ["How do you handle side effects?", "Have you used Redux or Context?"]
              }
            ]
          }
          // ... more sections would be here in real response
        ],
        warning_signs: ["Lack of enthusiasm", "Poor communication", "Inconsistent experience"],
        closing_tips: ["Ask if they have questions", "Explain next steps", "Thank them for their time"]
      };

      setInterviewGuide(simulatedGuide);
    } catch (error) {
      console.error('Error generating interview guide:', error);
    } finally {
      setGenerating(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTranscribing(true);
    try {
      // Simulate transcription (replace with real audio processing later)
      await new Promise(resolve => setTimeout(resolve, 2500));

      const simulatedTranscript = "Interviewer: Tell me about your experience...\nCandidate: I've worked with React for 5 years...";

      await analyzeSentiment(simulatedTranscript);
    } catch (error) {
      console.error('Error transcribing:', error);
    } finally {
      setTranscribing(false);
    }
  };

  const saveResponse = () => {
    if (!currentResponse.trim()) return;
    
    const allQuestions = interviewGuide?.sections?.flatMap(s => s.questions) || [];
    setResponses({
      ...responses,
      [currentQuestion]: currentResponse
    });
    setCurrentResponse('');
    
    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const analyzeSentiment = async (text) => {
    setAnalyzingSentiment(true);
    try {
      // Simulate sentiment analysis
      await new Promise(resolve => setTimeout(resolve, 1500));

      const simulatedResults = {
        overall_sentiment: "Positive",
        engagement_score: 8.5,
        confidence_score: 9,
        communication_score: 8,
        enthusiasm_score: 9,
        red_flags: ["Slight hesitation on one technical question"],
        positive_signals: ["Strong eye contact", "Clear explanations", "Enthusiasm for team collaboration"],
        concerns: ["Limited experience with one required tool"],
        recommendation: "Strong Hire",
        key_insights: [
          "Excellent technical knowledge",
          "Strong communicator",
          "Cultural fit appears high"
        ]
      };

      setSentimentResults(simulatedResults);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    } finally {
      setAnalyzingSentiment(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (sentiment) => {
    const lower = sentiment?.toLowerCase() || '';
    if (lower.includes('positive')) return 'text-green-600';
    if (lower.includes('negative')) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!candidate || !job) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Please select a candidate and job to start the interview assistant</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-50 to-white border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">AI Interview Assistant</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {candidate.name}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {job.title}
                </span>
              </div>
            </div>
            {!interviewGuide && (
              <Button
                onClick={generateInterviewGuide}
                disabled={generating}
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Interview Guide
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interview Guide */}
      <AnimatePresence>
        {interviewGuide && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Interview Overview</span>
                  <Badge variant="outline">{interviewGuide.interview_duration} minutes</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Key Evaluation Areas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {interviewGuide.key_evaluation_areas?.map((area, i) => (
                      <Badge key={i} className="bg-blue-100 text-blue-700">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">Warning Signs to Watch:</h4>
                  <ul className="space-y-1">
                    {interviewGuide.warning_signs?.map((sign, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Recording Controls */}
            <Card className="border-2 border-dashed">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={cn(
                        "gap-2",
                        isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    
                    {isRecording && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                        <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload">
                      <Button variant="outline" className="gap-2" asChild>
                        <span>
                          <Upload className="w-4 h-4" />
                          Upload Recording
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {transcribing && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-700">Transcribing and analyzing audio...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Questions */}
            <div className="space-y-4">
              {interviewGuide.sections?.map((section, sIdx) => (
                <Card key={sIdx}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{section.section_name}</span>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {section.duration_minutes} min
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.questions?.map((q, qIdx) => {
                      const globalIdx = interviewGuide.sections
                        .slice(0, sIdx)
                        .reduce((acc, s) => acc + s.questions.length, 0) + qIdx;
                      const isActive = globalIdx === currentQuestion;
                      const isAnswered = responses[globalIdx];

                      return (
                        <div
                          key={qIdx}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all",
                            isActive && "border-red-500 bg-red-50",
                            isAnswered && !isActive && "border-green-200 bg-green-50",
                            !isActive && !isAnswered && "border-gray-200"
                          )}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                              isAnswered ? "bg-green-600" : isActive ? "bg-red-600" : "bg-gray-300"
                            )}>
                              {isAnswered ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <span className="text-white text-sm font-bold">{qIdx + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold mb-1">{q.question}</p>
                              <Badge variant="outline" className="text-xs">
                                {q.assessing}
                              </Badge>
                            </div>
                          </div>

                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-3 mt-4"
                            >
                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs font-semibold text-green-700 mb-1">✓ Good Indicators:</p>
                                  <ul className="text-xs space-y-0.5">
                                    {q.good_indicators?.map((ind, i) => (
                                      <li key={i} className="text-gray-600">• {ind}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-red-700 mb-1">⚠ Red Flags:</p>
                                  <ul className="text-xs space-y-0.5">
                                    {q.red_flags?.map((flag, i) => (
                                      <li key={i} className="text-gray-600">• {flag}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-semibold mb-1">Follow-up Probes:</p>
                                <ul className="text-xs space-y-0.5">
                                  {q.follow_ups?.map((follow, i) => (
                                    <li key={i} className="text-gray-600">• {follow}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-2">
                                <Label>Candidate Response / Notes:</Label>
                                <Textarea
                                  value={currentResponse}
                                  onChange={(e) => setCurrentResponse(e.target.value)}
                                  placeholder="Type the candidate's response or your notes..."
                                  className="h-24"
                                />
                                <Button
                                  onClick={saveResponse}
                                  disabled={!currentResponse.trim()}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  Save & Next Question
                                </Button>
                              </div>
                            </motion.div>
                          )}

                          {isAnswered && !isActive && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <p className="text-sm text-gray-700 italic">{responses[globalIdx]}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Analyze Button */}
            {Object.keys(responses).length > 0 && (
              <Button
                onClick={() => analyzeSentiment('')}
                disabled={analyzingSentiment}
                className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
              >
                {analyzingSentiment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Sentiment...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Analyze Interview Sentiment
                  </>
                )}
              </Button>
            )}

            {/* Sentiment Results */}
            {sentimentResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Sentiment Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center border">
                        <div className={cn("text-2xl font-bold", getScoreColor(sentimentResults.engagement_score))}>
                          {sentimentResults.engagement_score}/10
                        </div>
                        <div className="text-xs text-gray-600">Engagement</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border">
                        <div className={cn("text-2xl font-bold", getScoreColor(sentimentResults.confidence_score))}>
                          {sentimentResults.confidence_score}/10
                        </div>
                        <div className="text-xs text-gray-600">Confidence</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border">
                        <div className={cn("text-2xl font-bold", getScoreColor(sentimentResults.communication_score))}>
                          {sentimentResults.communication_score}/10
                        </div>
                        <div className="text-xs text-gray-600">Communication</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center border">
                        <div className={cn("text-2xl font-bold", getScoreColor(sentimentResults.enthusiasm_score))}>
                          {sentimentResults.enthusiasm_score}/10
                        </div>
                        <div className="text-xs text-gray-600">Enthusiasm</div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">Overall Sentiment:</span>
                        <Badge className={cn("text-white", getSentimentColor(sentimentResults.overall_sentiment))}>
                          {sentimentResults.overall_sentiment}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Recommendation:</span>
                        <Badge className="bg-purple-600 text-white">
                          {sentimentResults.recommendation}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-green-700">Positive Signals:</h4>
                        <ul className="space-y-1">
                          {sentimentResults.positive_signals?.map((signal, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {signal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-orange-700">Areas of Concern:</h4>
                        <ul className="space-y-1">
                          {sentimentResults.concerns?.map((concern, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {sentimentResults.red_flags?.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 text-red-700">Red Flags:</h4>
                        <ul className="space-y-1">
                          {sentimentResults.red_flags.map((flag, i) => (
                            <li key={i} className="text-sm text-red-700">⚠️ {flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Key Insights:</h4>
                      <ul className="space-y-1">
                        {sentimentResults.key_insights?.map((insight, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
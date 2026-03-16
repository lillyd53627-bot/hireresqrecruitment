import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mic, MicOff, Loader2, Sparkles, MessageSquare, TrendingUp,
  Smile, Meh, Frown, AlertCircle, CheckCircle2, Brain, Play, Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function AIInterviewAssistant({ candidate, job }) {
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentSentiment, setCurrentSentiment] = useState(null);
  const [overallAnalysis, setOverallAnalysis] = useState(null);
  const [simulatedText, setSimulatedText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (candidate && job) {
      generateQuestions();
    }
  }, [candidate, job]);

  const generateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const prompt = `You are an expert interviewer. Generate tailored interview questions.

CANDIDATE PROFILE:
- Name: ${candidate.name}
- Current Role: ${candidate.title || 'N/A'}
- Experience: ${candidate.experience_years || 0} years
- Skills: ${candidate.skills?.join(', ') || 'N/A'}
- Background: ${candidate.notes || 'N/A'}

JOB REQUIREMENTS:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description || 'N/A'}
- Required Skills: ${job.skills_required?.join(', ') || 'N/A'}
- Team: ${job.team_description || 'N/A'}
- Culture: ${job.company_culture || 'N/A'}

Generate 12-15 interview questions across these categories:
1. Technical/Skills Assessment (3-4 questions)
2. Experience & Past Projects (2-3 questions)
3. Behavioral/Situational (3-4 questions)
4. Cultural Fit (2-3 questions)
5. Candidate Questions to Ask (2-3 suggestions)

Make them specific to this candidate's background and the role requirements.`;

              prompt,
        "response_json_schema": {
          type: "object",
          properties: {
            technical_questions: { type: "array", items: { type: "string" } },
            experience_questions: { type: "array", items: { type: "string" } },
            behavioral_questions: { type: "array", items: { type: "string" } },
            cultural_fit_questions: { type: "array", items: { type: "string" } },
            candidate_questions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setQuestions(response);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            addTranscriptAndAnalyze(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        setSimulatedText(interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      // Fallback: Simulate transcription for demo
      alert('Speech recognition not supported. Using simulation mode.');
      simulateTranscription();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (transcript.length > 0) {
      generateOverallAnalysis();
    }
  };

  const simulateTranscription = () => {
    const sampleResponses = [
      "I've been working with React for about 5 years now, and I really enjoy building scalable applications.",
      "In my current role, I lead a team of 4 developers and we focus on frontend architecture.",
      "One challenge I faced was migrating our legacy codebase to TypeScript, which took 6 months.",
      "I'm looking for a role where I can mentor junior developers and work on innovative projects."
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleResponses.length && isRecording) {
        addTranscriptAndAnalyze(sampleResponses[index]);
        index++;
      } else {
        clearInterval(interval);
        if (isRecording) {
          setIsRecording(false);
          generateOverallAnalysis();
        }
      }
    }, 3000);
  };

  const addTranscriptAndAnalyze = async (text) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Add to transcript
    const entry = {
      text,
      timestamp,
      sentiment: null,
      analyzing: true
    };
    
    setTranscript(prev => [...prev, entry]);

    // Analyze sentiment
    try {
        prompt: `Analyze the sentiment and engagement level of this interview response:

"${text}"

Provide sentiment (positive/neutral/negative), engagement score (0-100), confidence level, and key insights.`,
        "response_json_schema": {
          type: "object",
          properties: {
            sentiment: { type: "string" },
            engagement_score: { type: "number" },
            confidence_level: { type: "string" },
            enthusiasm: { type: "number" },
            clarity: { type: "number" },
            key_points: { type: "array", items: { type: "string" } },
            concerns: { type: "array", items: { type: "string" } }
          }
        }
      });

      setTranscript(prev => prev.map((entry, idx) => 
        idx === prev.length - 1 ? { ...entry, sentiment: analysis, analyzing: false } : entry
      ));

      setCurrentSentiment(analysis);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      setTranscript(prev => prev.map((entry, idx) => 
        idx === prev.length - 1 ? { ...entry, analyzing: false } : entry
      ));
    }
  };

  const generateOverallAnalysis = async () => {
    try {
      const fullTranscript = transcript.map(t => t.text).join('\n');
      
              prompt: `Analyze this complete interview transcript and provide comprehensive insights:

TRANSCRIPT:
${fullTranscript}

CANDIDATE: ${candidate.name}
JOB: ${job.title}

Provide overall assessment including communication skills, technical knowledge demonstrated, cultural fit indicators, areas of strength, areas of concern, and hiring recommendation.`,
        "response_json_schema": {
          type: "object",
          properties: {
            overall_sentiment: { type: "string" },
            communication_score: { type: "number" },
            technical_competence: { type: "number" },
            cultural_fit: { type: "number" },
            enthusiasm_level: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            concerns: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" },
            summary: { type: "string" }
          }
        }
      });

      setOverallAnalysis(analysis);
    } catch (error) {
      console.error('Error generating overall analysis:', error);
    }
  };

  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return Meh;
    const s = sentiment.toLowerCase();
    if (s.includes('positive')) return Smile;
    if (s.includes('negative')) return Frown;
    return Meh;
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'text-gray-500';
    const s = sentiment.toLowerCase();
    if (s.includes('positive')) return 'text-green-600';
    if (s.includes('negative')) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Panel: Questions & Guidance */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-red-600" />
              AI Interview Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingQuestions ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Generating tailored questions...</p>
              </div>
            ) : questions.technical_questions ? (
              <div className="space-y-4">
                {/* Technical Questions */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-red-600">Technical Assessment</h4>
                  <ol className="space-y-2">
                    {questions.technical_questions?.map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="font-bold text-red-600">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Experience Questions */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-blue-600">Experience & Projects</h4>
                  <ol className="space-y-2" start={questions.technical_questions?.length + 1}>
                    {questions.experience_questions?.map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="font-bold text-blue-600">{questions.technical_questions?.length + i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Behavioral Questions */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-purple-600">Behavioral</h4>
                  <ol className="space-y-2" start={questions.technical_questions?.length + questions.experience_questions?.length + 1}>
                    {questions.behavioral_questions?.map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="font-bold text-purple-600">
                          {questions.technical_questions?.length + questions.experience_questions?.length + i + 1}.
                        </span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Cultural Fit */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-green-600">Cultural Fit</h4>
                  <ol className="space-y-2" start={questions.technical_questions?.length + questions.experience_questions?.length + questions.behavioral_questions?.length + 1}>
                    {questions.cultural_fit_questions?.map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="font-bold text-green-600">
                          {questions.technical_questions?.length + questions.experience_questions?.length + questions.behavioral_questions?.length + i + 1}.
                        </span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Candidate Questions */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Questions Candidate Might Ask:</h4>
                  <ul className="space-y-1">
                    {questions.candidate_questions?.map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span>•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Questions will appear here</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Transcription & Analysis */}
      <div className="space-y-6">
        {/* Recording Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-red-600" />
                Live Transcription & Analysis
              </span>
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
            </CardTitle>
          </CardHeader>
          {isRecording && (
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-700">Recording in progress...</span>
              </div>
              {simulatedText && (
                <p className="text-sm text-gray-500 italic mt-2">{simulatedText}</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Current Sentiment */}
        {currentSentiment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm">Current Sentiment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={cn("gap-1", getSentimentColor(currentSentiment.sentiment))}>
                    {React.createElement(getSentimentIcon(currentSentiment.sentiment), { className: "w-3 h-3" })}
                    {currentSentiment.sentiment}
                  </Badge>
                  <span className="text-sm text-gray-600">{currentSentiment.confidence_level} confidence</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Engagement</div>
                    <div className={cn("text-xl font-bold", getScoreColor(currentSentiment.engagement_score))}>
                      {currentSentiment.engagement_score}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Enthusiasm</div>
                    <div className={cn("text-xl font-bold", getScoreColor(currentSentiment.enthusiasm))}>
                      {currentSentiment.enthusiasm}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Transcript */}
        <Card className="max-h-96 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm">Transcript</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {transcript.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Transcript will appear here during the interview
              </p>
            ) : (
              <AnimatePresence>
                {transcript.map((entry, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs text-gray-500">{entry.timestamp}</span>
                      {entry.analyzing ? (
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                      ) : entry.sentiment && (
                        <Badge variant="outline" className={cn("text-xs", getSentimentColor(entry.sentiment.sentiment))}>
                          {entry.sentiment.sentiment}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{entry.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>

        {/* Overall Analysis */}
        {overallAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Interview Analysis Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 italic">"{overallAnalysis.summary}"</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Communication</div>
                    <div className={cn("text-2xl font-bold", getScoreColor(overallAnalysis.communication_score))}>
                      {overallAnalysis.communication_score}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Technical</div>
                    <div className={cn("text-2xl font-bold", getScoreColor(overallAnalysis.technical_competence))}>
                      {overallAnalysis.technical_competence}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Cultural Fit</div>
                    <div className={cn("text-2xl font-bold", getScoreColor(overallAnalysis.cultural_fit))}>
                      {overallAnalysis.cultural_fit}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Enthusiasm</div>
                    <div className={cn("text-2xl font-bold", getScoreColor(overallAnalysis.enthusiasm_level))}>
                      {overallAnalysis.enthusiasm_level}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Recommendation</h4>
                  <Badge className="bg-green-600">{overallAnalysis.recommendation}</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-600">Strengths</h4>
                    <ul className="space-y-1">
                      {overallAnalysis.strengths?.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-600">Concerns</h4>
                    <ul className="space-y-1">
                      {overallAnalysis.concerns?.map((c, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-orange-600 mt-0.5" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
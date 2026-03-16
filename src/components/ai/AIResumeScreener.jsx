import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Upload, Loader2, CheckCircle2, AlertTriangle, FileText,
  Sparkles, User, Briefcase, Award, AlertCircle, TrendingUp,
  X, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AIResumeScreener({ jobs = [] }) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [screeningResults, setScreeningResults] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newResults = [];

    try {
      for (const file of files) {
        // Simulate file upload delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Simulated extraction result (replace with real API when ready)
        const simulatedExtraction = {
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          phone: "+27 82 123 4567",
          title: "Senior Software Engineer",
          summary: "8+ years full-stack experience with React, Node.js, AWS",
          skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
          experience_years: 8,
          education: ["BSc Computer Science - University of Cape Town"],
          work_history: [
            {
              company: "Google",
              title: "Senior Software Engineer",
              duration: "2020 - Present",
              responsibilities: ["Led frontend team", "Built scalable React apps"]
            },
            {
              company: "Microsoft",
              title: "Full Stack Developer",
              duration: "2017 - 2020",
              responsibilities: ["Developed Azure-based solutions"]
            }
          ],
          certifications: ["AWS Certified Developer"],
          languages: ["English (Native)", "Afrikaans (Fluent)"]
        };

        newResults.push({
          fileName: file.name,
          fileUrl: URL.createObjectURL(file), // local preview URL
          extractedData: simulatedExtraction,
          status: 'extracted'
        });
      }

      setScreeningResults(prev => [...prev, ...newResults]);
    } catch (error) {
      console.error('Error processing resumes:', error);
    } finally {
      setUploading(false);
    }
  };

  const analyzeCandidate = async (result, index) => {
    setAnalyzing(true);
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1800));

      const simulatedAnalysis = {
        fit_score: 92,
        skills_match: 95,
        experience_match: 90,
        education_match: 85,
        career_progression_score: 88,
        strengths: [
          "Strong full-stack experience with modern JavaScript stack",
          "Proven leadership in frontend development",
          "AWS certification shows cloud proficiency"
        ],
        concerns: ["Limited exposure to Python in recent roles"],
        red_flags: [],
        bias_flags: [],
        recommendation: "Strong Hire",
        reasoning: "Excellent technical match with leadership experience. Minor gap in Python is not critical for this role.",
        interview_questions: [
          "Can you walk me through a complex React project you've led?",
          "How do you approach performance optimization in large-scale apps?",
          "Tell me about a time you mentored junior developers."
        ],
        summary: "Highly qualified candidate with strong technical skills and leadership experience."
      };

      setScreeningResults(prev => prev.map((r, i) => 
        i === index ? { ...r, analysis: simulatedAnalysis, status: 'analyzed' } : r
      ));
    } catch (error) {
      console.error('Error analyzing candidate:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const removeResult = (index) => {
    setScreeningResults(prev => prev.filter((_, i) => i !== index));
  };

  const getRecommendationColor = (rec) => {
    const lower = rec?.toLowerCase() || '';
    if (lower.includes('strong') || lower.includes('proceed')) return 'bg-green-600';
    if (lower.includes('interview')) return 'bg-blue-600';
    if (lower.includes('consider')) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-2 border-dashed border-red-200 bg-red-50/30">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Upload className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">AI-Powered Resume Screening</h3>
            <p className="text-gray-600 mb-4">
              Upload resumes → automatic extraction + intelligent matching against job requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <Label>Screen Against Specific Job (Optional)</Label>
              <Select 
                value={selectedJob?.id || "none"} 
                onValueChange={(id) => setSelectedJob(jobs.find(j => j.id === id))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job posting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Screening (No Job)</SelectItem>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} - {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
              disabled={uploading}
            />
            <label htmlFor="resume-upload">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 gap-2 py-7 text-lg" 
                disabled={uploading}
                asChild
              >
                <span>
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Resumes...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Resumes (PDF, DOC, DOCX)
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Screening Results */}
      <AnimatePresence>
        {screeningResults.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="overflow-hidden shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="w-10 h-10 text-red-600" />
                    <div>
                      <CardTitle className="text-xl">{result.fileName}</CardTitle>
                      {result.extractedData?.name && (
                        <p className="text-gray-600 mt-1">{result.extractedData.name}</p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeResult(index)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {result.status === 'error' && (
                  <div className="p-5 bg-red-50 rounded-lg flex items-center gap-4 border border-red-200">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <p className="text-red-700">Failed to process resume: {result.error}</p>
                  </div>
                )}

                {result.status === 'extracted' && result.extractedData && (
                  <>
                    {/* Extracted Info Preview */}
                    <div className="grid md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contact</p>
                        <p className="font-medium">{result.extractedData.email || '—'}</p>
                        <p className="text-sm mt-1">{result.extractedData.phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Role</p>
                        <p className="font-medium">{result.extractedData.title || '—'}</p>
                        <p className="text-sm mt-1">{result.extractedData.experience_years || 0} years exp.</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Top Skills ({result.extractedData.skills?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {result.extractedData.skills?.slice(0, 4).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="bg-white">
                              {skill}
                            </Badge>
                          ))}
                          {result.extractedData.skills?.length > 4 && (
                            <Badge variant="secondary" className="bg-white">
                              +{result.extractedData.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => analyzeCandidate(result, index)}
                      disabled={analyzing}
                      className="w-full bg-red-600 hover:bg-red-700 py-7 text-lg gap-2"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Running AI Analysis...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Run AI Screening
                        </>
                      )}
                    </Button>
                  </>
                )}

                {result.status === 'analyzed' && result.analysis && (
                  <div className="space-y-6">
                    {/* Scores Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center border">
                        <div className={cn("text-3xl font-bold", getScoreColor(result.analysis.fit_score))}>
                          {result.analysis.fit_score}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Overall Fit</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center border">
                        <div className={cn("text-3xl font-bold", getScoreColor(result.analysis.skills_match))}>
                          {result.analysis.skills_match}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Skills</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center border">
                        <div className={cn("text-3xl font-bold", getScoreColor(result.analysis.experience_match))}>
                          {result.analysis.experience_match}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Experience</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center border">
                        <div className={cn("text-3xl font-bold", getScoreColor(result.analysis.education_match))}>
                          {result.analysis.education_match}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Education</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center border">
                        <div className={cn("text-3xl font-bold", getScoreColor(result.analysis.career_progression_score))}>
                          {result.analysis.career_progression_score}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Career Path</div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-5 rounded-xl bg-gradient-to-r from-gray-50 to-white border">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={cn("text-white px-4 py-1.5 text-base", getRecommendationColor(result.analysis.recommendation))}>
                          {result.analysis.recommendation}
                        </Badge>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{result.analysis.reasoning}</p>
                    </div>

                    {/* Summary */}
                    <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-gray-700 italic text-base">"{result.analysis.summary}"</p>
                    </div>

                    {/* Strengths & Concerns */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Key Strengths
                        </h4>
                        <ul className="space-y-2 text-gray-700">
                          {result.analysis.strengths?.map((strength, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
                        <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Areas of Concern
                        </h4>
                        <ul className="space-y-2 text-gray-700">
                          {result.analysis.concerns?.map((concern, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-orange-600 mt-1">•</span>
                              {concern}
                            </li>
                          )) || <p className="text-gray-600">No major concerns identified</p>}
                        </ul>
                      </div>
                    </div>

                    {/* Red Flags */}
                    {result.analysis.red_flags?.length > 0 && (
                      <div className="p-5 bg-red-50 rounded-xl border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Red Flags Detected
                        </h4>
                        <ul className="space-y-2 text-red-700">
                          {result.analysis.red_flags.map((flag, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span>⚠️</span>
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interview Questions */}
                    {result.analysis.interview_questions?.length > 0 && (
                      <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                        <h4 className="font-semibold text-purple-800 mb-3">Suggested Interview Questions</h4>
                        <ol className="space-y-3 list-decimal list-inside text-gray-700">
                          {result.analysis.interview_questions.map((q, i) => (
                            <li key={i} className="pl-2">{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
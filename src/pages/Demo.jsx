import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Target,
  Search,
  Video,
  CheckCircle,
  Sparkles,
  Users,
  Building2,
  Mail,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const demoSteps = [
  {
    id: 1,
    title: 'AI Client Finder Discovers Opportunities',
    description: 'Our AI scans job boards, LinkedIn, and company databases to find businesses actively hiring.',
    icon: Target,
    color: 'red',
    animation: 'scanning',
    metrics: [
      { label: 'Companies Scanned', value: '1,247', speed: 50 },
      { label: 'Active Job Posts', value: '342', speed: 30 },
      { label: 'Hot Leads Found', value: '47', speed: 10 },
    ],
    details: [
      'Scanning LinkedIn company pages',
      'Analyzing job board postings',
      'Identifying hiring patterns',
      'Building qualified lead list',
    ],
  },
  {
    id: 2,
    title: 'AI Outreach Engine Books Meetings',
    description: 'Personalized email sequences automatically reach out to decision makers and book discovery calls.',
    icon: Mail,
    color: 'blue',
    animation: 'outreach',
    metrics: [
      { label: 'Emails Sent', value: '156', speed: 20 },
      { label: 'Responses', value: '42', speed: 15 },
      { label: 'Meetings Booked', value: '12', speed: 8 },
    ],
    details: [
      'Crafting personalized messages',
      'Sending multi-touch sequences',
      'Following up automatically',
      'Scheduling meetings',
    ],
  },
  {
    id: 3,
    title: 'AI Candidate Sourcing Finds Talent',
    description: 'AI searches millions of profiles across platforms to find candidates matching your job requirements.',
    icon: Search,
    color: 'purple',
    animation: 'sourcing',
    metrics: [
      { label: 'Profiles Analyzed', value: '8,439', speed: 100 },
      { label: 'Qualified Matches', value: '127', speed: 25 },
      { label: 'Top Candidates', value: '18', speed: 5 },
    ],
    details: [
      'Searching LinkedIn profiles',
      'Analyzing CVs and resumes',
      'Matching skills to requirements',
      'Scoring cultural fit',
    ],
  },
  {
    id: 4,
    title: 'AI Video Screening Evaluates Candidates',
    description: 'Automated video interviews assess technical skills, communication, and cultural fit.',
    icon: Video,
    color: 'green',
    animation: 'screening',
    metrics: [
      { label: 'Interviews Conducted', value: '18', speed: 3 },
      { label: 'Skill Score Avg', value: '87%', speed: 1 },
      { label: 'Top Performers', value: '5', speed: 1 },
    ],
    details: [
      'Conducting video interviews',
      'Analyzing responses',
      'Scoring technical skills',
      'Evaluating communication',
    ],
  },
  {
    id: 5,
    title: 'You Close Deals & Get Paid',
    description: 'Present the best candidates to clients, track placements, and automate invoicing.',
    icon: CheckCircle,
    color: 'yellow',
    animation: 'closing',
    metrics: [
      { label: 'Candidates Presented', value: '5', speed: 2 },
      { label: 'Placements Made', value: '3', speed: 1 },
      { label: 'Revenue Generated', value: 'R45,000', speed: 1 },
    ],
    details: [
      'Presenting shortlisted candidates',
      'Coordinating interviews',
      'Finalizing placements',
      'Generating invoices',
    ],
  },
];

export default function Demo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animatingMetrics, setAnimatingMetrics] = useState({});

  const step = demoSteps[currentStep];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(currentStep + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  useEffect(() => {
    // Animate metrics when step changes
    if (isPlaying) {
      const newMetrics = {};
      step.metrics.forEach((metric, idx) => {
        let count = 0;
        const target = parseInt(metric.value.replace(/[^0-9]/g, ''));
        const interval = setInterval(() => {
          count += Math.ceil(target / 50);
          if (count >= target) {
            count = target;
            clearInterval(interval);
          }
          newMetrics[idx] = count;
          setAnimatingMetrics({ ...newMetrics });
        }, metric.speed);
      });
    }
  }, [currentStep, isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
    setAnimatingMetrics({});
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(0);
      setAnimatingMetrics({});
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(0);
      setAnimatingMetrics({});
    }
  };

  const colorClasses = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">HireResQ AI in Action</h1>
              <p className="text-gray-600">Watch how your AI hiring department works for you</p>
            </div>
            <Button
              variant="outline"
              className="text-gray-900 border-gray-300 hover:bg-gray-100"
              onClick={() => window.history.back()}
            >
              Exit Demo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Demo Area */}
          <div className="lg:col-span-8">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-0">
                {/* Step Header */}
                <div className="p-8 border-b border-gray-200">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 ${colorClasses[step.color]} rounded-2xl flex items-center justify-center flex-shrink-0`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <Badge className="mb-3 bg-red-100 text-red-700 border-red-200">
                        Step {currentStep + 1} of {demoSteps.length}
                      </Badge>
                      <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </div>

                {/* Animation Area */}
                <div className="p-8 min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Metrics Display */}
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {step.metrics.map((metric, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white backdrop-blur rounded-xl p-4 border border-gray-200 shadow-sm"
                          >
                            <div className="text-3xl font-bold mb-1 text-gray-900">
                              {isPlaying && animatingMetrics[idx] !== undefined
                                ? metric.value.includes('%') || metric.value.includes('R')
                                  ? metric.value
                                  : animatingMetrics[idx].toLocaleString()
                                : metric.value}
                            </div>
                            <div className="text-xs text-gray-600">{metric.label}</div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Activity Log */}
                      <div className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: isPlaying ? 1 : 0.5, x: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                          >
                            {isPlaying && progress > idx * 25 ? (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            )}
                            <span className="text-sm text-gray-700">{detail}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Visual Animation */}
                      <div className="mt-8 flex items-center justify-center">
                        <motion.div
                          animate={
                            isPlaying
                              ? { scale: [1, 1.1, 1], rotate: [0, 360] }
                              : {}
                          }
                          transition={{
                            duration: 2,
                            repeat: isPlaying ? Infinity : 0,
                            ease: 'linear',
                          }}
                          className={`w-24 h-24 ${colorClasses[step.color]} rounded-full flex items-center justify-center opacity-30`}
                        >
                          <Sparkles className="w-12 h-12 text-white" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Progress Bar & Controls */}
                <div className="px-8 py-4 border-t border-gray-200">
                  <Progress value={progress} className="h-2 mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-white border-gray-300 hover:bg-gray-100"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        className={`${colorClasses[step.color]} hover:opacity-80 text-white`}
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-white border-gray-300 hover:bg-gray-100"
                        onClick={handleNext}
                        disabled={currentStep === demoSteps.length - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="bg-white border-gray-300 hover:bg-gray-100"
                        onClick={handleReset}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Steps List */}
          <div className="lg:col-span-4">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6">Demo Steps</h3>
                <div className="space-y-4">
                  {demoSteps.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCurrentStep(idx);
                        setProgress(0);
                        setAnimatingMetrics({});
                        setIsPlaying(false);
                      }}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        currentStep === idx
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${colorClasses[s.color]} rounded-lg flex items-center justify-center text-white font-bold`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{s.title}</p>
                          <p className="text-sm text-gray-500">{s.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
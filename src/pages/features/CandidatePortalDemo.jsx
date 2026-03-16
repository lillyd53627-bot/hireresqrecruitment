import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase,
  Star, Download, Edit, Share, MoreVertical,
  Calendar, DollarSign, Clock, ExternalLink,
  FileText, Globe, User, Brain
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// Mock candidate data (same style as original)
const mockCandidate = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.j@email.com',
  phone: '+27 82 123 4567',
  title: 'Senior Software Engineer',
  company: 'Google',
  location: 'Cape Town, SA',
  experience_years: 8,
  skills: ['React', 'Node.js', 'Python', 'AWS', 'TypeScript', 'PostgreSQL'],
  cv_url: '#',
  linkedin_url: 'https://linkedin.com/in/sarahjohnson',
  salary_expectation: 'R85k - R100k',
  availability: 'Immediately',
  status: 'shortlisted',
  match_score: 95,
  cultural_fit_score: 88,
  source: 'LinkedIn',
  notes: `Sarah is a highly skilled engineer with strong experience in full-stack development. 
She's passionate about clean code and mentoring junior developers.
In our initial conversation, she mentioned valuing work-life balance and continuous learning opportunities.
She prefers collaborative environments but is also comfortable working independently.
Motivated by challenging technical problems and making an impact on user experience.
Previous colleagues describe her as detail-oriented, communicative, and a natural team player.`,
  ai_insights: {
    personality_traits: ['Detail-oriented', 'Collaborative', 'Analytical', 'Communicative'],
    work_style: 'Balanced - enjoys both independent deep work and collaborative team projects',
    motivations: ['Technical challenges', 'Mentorship opportunities', 'Impact on users', 'Continuous learning'],
    cultural_indicators: ['Values work-life balance', 'Growth mindset', 'Team-oriented', 'Quality-focused'],
    summary: 'Strong technical leader with excellent communication skills and a passion for mentoring.'
  }
};

export default function CandidatePortalDemo() {
  const [notes, setNotes] = useState(mockCandidate.notes || '');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <header className="py-16 md:py-24 text-center bg-gradient-to-r from-red-600 to-red-800 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Candidate Portal</h1>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto px-6">
          Seamless candidate experience — one branded portal for profiles, updates, and next steps.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Back Button */}
        <Button variant="ghost" className="mb-8 gap-2 text-lg" onClick={() => window.history.back()}>
          <ArrowLeft className="w-5 h-5" />
          Back to Candidates
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-8 lg:col-span-1">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-white">
                      {mockCandidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{mockCandidate.name}</h2>
                  <p className="text-xl text-gray-600 mb-4">{mockCandidate.title}</p>
                  <Badge className="bg-blue-100 text-blue-700 text-lg px-6 py-2">
                    {mockCandidate.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-6 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                    <Mail className="w-6 h-6 text-gray-600" />
                    <a href={`mailto:${mockCandidate.email}`} className="text-lg hover:text-red-600">
                      {mockCandidate.email}
                    </a>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                    <Phone className="w-6 h-6 text-gray-600" />
                    <span className="text-lg">{mockCandidate.phone}</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                    <MapPin className="w-6 h-6 text-gray-600" />
                    <span className="text-lg">{mockCandidate.location}</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                    <Briefcase className="w-6 h-6 text-gray-600" />
                    <span className="text-lg">{mockCandidate.experience_years} years experience</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                    <DollarSign className="w-6 h-6 text-gray-600" />
                    <span className="text-lg">{mockCandidate.salary_expectation}</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                    <Clock className="w-6 h-6 text-gray-600" />
                    <span className="text-lg">Available: {mockCandidate.availability}</span>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t">
                  <Button className="w-full justify-center gap-3 py-7 text-lg bg-red-600 hover:bg-red-700">
                    <FileText className="w-5 h-5" />
                    View Full CV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Match Scores */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Brain className="w-8 h-8 text-purple-600" />
                  Match Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <div className="flex justify-between text-lg mb-3">
                    <span className="text-gray-700 font-medium">Skills Match</span>
                    <span className="font-bold text-red-600">{mockCandidate.match_score}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full"
                      style={{ width: `${mockCandidate.match_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-lg mb-3">
                    <span className="text-gray-700 font-medium">Cultural Fit</span>
                    <span className="font-bold text-purple-600">{mockCandidate.cultural_fit_score}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${mockCandidate.cultural_fit_score}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details & Insights */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="overview" className="border rounded-xl overflow-hidden shadow-xl">
              <TabsList className="grid w-full grid-cols-4 bg-white">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-analysis">AI Insights</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-8 space-y-8">
                {/* Skills */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Key Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {mockCandidate.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-lg px-4 py-2 bg-gray-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Motivations */}
                {mockCandidate.ai_insights && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl">Key Motivations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {mockCandidate.ai_insights.motivations.map((motivation, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-lg">
                            <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                            <span>{motivation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="ai-analysis" className="p-8">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Brain className="w-8 h-8 text-purple-600" />
                      AI Insights Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Personality Traits</h3>
                      <div className="flex flex-wrap gap-3">
                        {mockCandidate.ai_insights.personality_traits.map((trait, idx) => (
                          <Badge key={idx} variant="secondary" className="text-lg px-4 py-2">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Work Style</h3>
                      <p className="text-lg text-gray-700">{mockCandidate.ai_insights.work_style}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Summary</h3>
                      <p className="text-lg text-gray-700">{mockCandidate.ai_insights.summary}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="p-8">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Candidate Notes</CardTitle>
                    <p className="text-gray-600 mt-2">
                      Private notes about the candidate's background, preferences, and interview performance.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[300px] text-lg"
                      placeholder="Add notes about personality, work style, career goals, communication, etc."
                    />
                    <Button className="mt-6 bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg">
                      Save Notes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="p-8">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[
                        { action: 'AI Cultural Fit Analysis completed', score: '88%', time: '2 hours ago' },
                        { action: 'Moved to Shortlisted', time: '1 day ago' },
                        { action: 'Initial screening passed', time: '2 days ago' },
                        { action: 'Application received', time: '3 days ago' },
                      ].map((activity, idx) => (
                        <div key={idx} className="flex gap-6">
                          <div className="w-3 h-3 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-lg">{activity.action}</p>
                            {activity.score && (
                              <Badge className="mt-2 bg-green-100 text-green-700 text-base">
                                Score: {activity.score}
                              </Badge>
                            )}
                            <p className="text-base text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <a
            href="/pricing"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-xl text-2xl font-bold transition"
          >
            Unlock Full Candidate Portal
          </a>
          <p className="mt-6 text-gray-600 text-lg">
            Seamless candidate experience, real-time updates & branded portals — start your free trial today.
          </p>
        </div>
      </main>
    </div>
  );
}
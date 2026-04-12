// src/pages/Dashboard/CandidatePortal.jsx
import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Star, 
  Download, Edit, Share, Calendar, DollarSign, Clock, Brain 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function CandidatePortal() {
  const { currentPlan } = useOutletContext();
  const navigate = useNavigate();

  const hasCandidatePortal = ['growth', 'advance'].includes(currentPlan?.plan || '');

  // Upgrade gate
  if (!hasCandidatePortal) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-8">
          <Brain className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-4xl font-bold mb-4">Candidate Portal</h2>
        <p className="text-xl text-gray-600 max-w-md mx-auto mb-10">
          Seamless candidate experience with detailed profiles, AI cultural fit analysis, and hiring success predictions.
        </p>
        <Button 
          onClick={() => navigate('/pricing')} 
          className="bg-red-600 hover:bg-red-700 text-lg px-10 py-6"
        >
          Upgrade to Growth or Advance
        </Button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState("Strong technical skills. Good cultural fit with our fast-paced team.");

  // Mock candidate data (you can expand this)
  const candidate = {
    id: 1,
    name: "Sarah Johnson",
    title: "Senior Software Engineer",
    company: "Google",
    location: "Cape Town, SA",
    email: "sarah.johnson@email.com",
    phone: "+27 82 123 4567",
    experience: "8 years",
    salary: "R85k - R100k",
    availability: "Immediately",
    matchScore: 95,
    culturalFit: 88,
    skills: ["React", "Node.js", "Python", "AWS", "TypeScript"],
    status: "shortlisted"
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{candidate.name}</h1>
          <p className="text-gray-600">{candidate.title} • {candidate.company}</p>
        </div>
        <Badge className="ml-auto bg-green-100 text-green-700">
          {candidate.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold text-red-600">{candidate.matchScore}%</div>
                <p className="text-sm text-gray-500">Overall Match Score</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold">{candidate.culturalFit}%</p>
                  <p className="text-xs text-gray-500">Cultural Fit</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{candidate.experience}</p>
                  <p className="text-xs text-gray-500">Experience</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Key Skills</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <a href={`mailto:${candidate.email}`} className="text-sm hover:underline">{candidate.email}</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <a href={`tel:${candidate.phone}`} className="text-sm hover:underline">{candidate.phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm">{candidate.location}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hiring Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Expected Salary</p>
                      <p className="text-2xl font-bold">{candidate.salary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="text-2xl font-bold text-green-600">{candidate.availability}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-3">Why this candidate is a strong fit</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">• Senior-level experience with modern tech stack</li>
                      <li className="flex gap-2">• Strong leadership potential</li>
                      <li className="flex gap-2">• Excellent communication skills</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px]"
                    placeholder="Add detailed notes about the candidate..."
                  />
                  <Button 
                    onClick={() => alert("Notes saved!")} 
                    className="mt-4 bg-red-600 hover:bg-red-700"
                  >
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { action: "AI Cultural Fit Analysis completed", score: "88%", time: "2 hours ago" },
                    { action: "Moved to Shortlisted", time: "1 day ago" },
                    { action: "Initial screening passed", time: "2 days ago" },
                    { action: "Application received", time: "3 days ago" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{item.action}</p>
                        {item.score && <Badge className="bg-green-100 text-green-700 mt-1">{item.score}</Badge>}
                        <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
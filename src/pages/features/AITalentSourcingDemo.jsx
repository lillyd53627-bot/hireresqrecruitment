// src/pages/features/AITalentSourcingDemo.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Sparkles, Star, MapPin, Briefcase,
  GraduationCap, Clock, ChevronRight, Download, Mail,
  Users, Zap, RefreshCw, SlidersHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

// Mock candidate data (same as original, cleaned up)
const mockCandidates = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Cape Town, SA',
    experience: '8 years',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    matchScore: 95,
    salary: 'R85k - R100k',
    availability: 'Immediately',
    source: 'LinkedIn'
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Full Stack Developer',
    company: 'Microsoft',
    location: 'Johannesburg, SA',
    experience: '6 years',
    skills: ['TypeScript', 'React', 'Azure', 'PostgreSQL'],
    matchScore: 92,
    salary: 'R70k - R85k',
    availability: '2 weeks',
    source: 'Indeed'
  },
  {
    id: 3,
    name: 'Emma Williams',
    title: 'Lead Developer',
    company: 'Amazon',
    location: 'Remote',
    experience: '10 years',
    skills: ['Java', 'Microservices', 'Kubernetes', 'AWS'],
    matchScore: 88,
    salary: 'R90k - R120k',
    availability: '1 month',
    source: 'LinkedIn'
  },
  {
    id: 4,
    name: 'David Nkosi',
    title: 'Backend Engineer',
    company: 'Standard Bank',
    location: 'Pretoria, SA',
    experience: '5 years',
    skills: ['C#', '.NET', 'SQL Server', 'Docker'],
    matchScore: 85,
    salary: 'R60k - R75k',
    availability: 'Immediately',
    source: 'CareerJunction'
  },
];

export default function AITalentSourcingDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchScoreFilter, setMatchScoreFilter] = useState([70, 100]);

  const filteredCandidates = mockCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (candidate.matchScore >= matchScoreFilter[0] && candidate.matchScore <= matchScoreFilter[1])
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <header className="py-16 md:py-24 text-center bg-gradient-to-r from-red-600 to-red-800 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">AI Candidate Sourcing</h1>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto px-6">
          Source from millions of profiles instantly — find perfect matches before anyone else.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Search & Filters */}
        <div className="mb-12 flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              placeholder="Search candidates by name, title, skill or location..."
              className="pl-12 py-7 text-lg rounded-full shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-14 px-8 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            More Filters
          </Button>
        </div>

        {/* Match Score Filter */}
        <div className="mb-12 max-w-md mx-auto">
          <p className="text-center font-medium mb-4">Match Score Range</p>
          <Slider
            value={matchScoreFilter}
            minStepsBetweenThumbs={5}
            min={0}
            max={100}
            step={5}
            onValueChange={setMatchScoreFilter}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{matchScoreFilter[0]}%</span>
            <span>{matchScoreFilter[1]}%</span>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCandidates.map((candidate) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{candidate.name}</CardTitle>
                        <p className="text-sm text-gray-500">{candidate.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">{candidate.matchScore}%</div>
                      <p className="text-xs text-gray-500">Match Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span>{candidate.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <span>{candidate.experience}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {candidate.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gray-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Salary Range</p>
                      <p className="font-medium">{candidate.salary}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
              
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-xl">
            No candidates match your filters — try adjusting the search or match score!
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <a
            href="/pricing"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-xl text-2xl font-bold transition"
          >
            Unlock Full AI Candidate Sourcing
          </a>
          <p className="mt-6 text-gray-600 text-lg">
            Access millions of profiles, smart matching & instant sourcing — start your free trial today.
          </p>
        </div>
      </main>
    </div>
  );
}
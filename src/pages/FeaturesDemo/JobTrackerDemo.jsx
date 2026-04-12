import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Briefcase, MapPin, Clock, Users,
  MoreVertical, Sparkles, Building2, DollarSign,
  Calendar, Eye, Edit, Trash2, ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock job data (cleaned from original)
const mockJobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'TechCorp SA',
    location: 'Cape Town',
    type: 'Full-time',
    salary: 'R80k - R100k',
    posted: '2 days ago',
    deadline: '14 days left',
    candidates: 45,
    shortlisted: 8,
    interviews: 3,
    status: 'active',
    progress: 65
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'StartupX',
    location: 'Johannesburg',
    type: 'Full-time',
    salary: 'R70k - R90k',
    posted: '5 days ago',
    deadline: '7 days left',
    candidates: 32,
    shortlisted: 5,
    interviews: 2,
    status: 'active',
    progress: 45
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    company: 'DesignCo',
    location: 'Remote',
    type: 'Contract',
    salary: 'R50k - R65k',
    posted: '1 week ago',
    deadline: '21 days left',
    candidates: 28,
    shortlisted: 4,
    interviews: 1,
    status: 'active',
    progress: 30
  },
];

export default function JobTrackerDemo() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = mockJobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <header className="py-16 md:py-24 text-center bg-gradient-to-r from-red-600 to-red-800 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">JobTrackerDemo</h1>
        <p className="text-xl md:text-2xl max-w-4xl mx-auto px-6">
          Manage your entire pipeline in one powerful place — track candidates, jobs, and progress effortlessly.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Search & Add Button */}
        <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              placeholder="Search jobs by title, company or location..."
              className="pl-12 py-7 text-lg rounded-full shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-red-600 hover:bg-red-700 px-8 py-7 text-lg rounded-full shadow-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Job
          </Button>
        </div>

        {/* Job Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Building2 className="w-4 h-4" /> {job.company}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{job.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Deadline: {job.deadline}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Pipeline Progress</span>
                        <span className="font-medium">{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-3" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 text-center text-sm">
                      <div>
                        <p className="font-bold text-blue-600">{job.candidates}</p>
                        <p className="text-gray-500">Candidates</p>
                      </div>
                      <div>
                        <p className="font-bold text-purple-600">{job.shortlisted}</p>
                        <p className="text-gray-500">Shortlisted</p>
                      </div>
                      <div>
                        <p className="font-bold text-green-600">{job.interviews}</p>
                        <p className="text-gray-500">Interviews</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-xl">
            No jobs match your search — try adding a new one!
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <a
            href="/pricing"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-xl text-2xl font-bold transition"
          >
            Unlock Full Job Tracker
          </a>
          <p className="mt-6 text-gray-600 text-lg">
            Track candidates, manage jobs & close placements faster — start your free trial today.
          </p>
        </div>
      </main>
    </div>
  );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Plus, Users, ChevronRight,
  Mail, Phone, MapPin, Star, MoreVertical,
  Grid, List, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';
import GoogleSheetsSync from '@/components/candidates/GoogleSheetsSync';
import { base44 } from '@/lib/mockBase44';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CandidateDetailsDialog from '@/components/candidates/CandidateDetailsDialog';

const statusColors = {
  new: 'bg-gray-100 text-gray-700',
  screening: 'bg-yellow-100 text-yellow-700',
  shortlisted: 'bg-blue-100 text-blue-700',
  interview: 'bg-purple-100 text-purple-700',
  offered: 'bg-green-100 text-green-700',
  hired: 'bg-green-600 text-white',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels = {
  new: 'New',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offered: 'Offered',
  hired: 'Hired',
  rejected: 'Rejected',
};

export default function Candidates() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('match_score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const queryClient = useQueryClient();

  // Fetch candidates
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => base44.entities.Candidate.list('-match_score'),
  });

  // Update candidate status mutation
 const updateNoteMutation = useMutation({
  mutationFn: (updatedNotes) => {
    // Your actual mutation logic here, e.g.:
    return base44.entities.Candidate.update(candidate.id, { notes: updatedNotes });
    // or if using Supabase:
    // return supabase.from('candidates').update({ notes: updatedNotes }).eq('id', candidate.id);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
    toast.success('Note saved');
    // Optional: close dialog or reset form
  },
  onError: (error) => {
    console.error('Error saving note:', error);
    toast.error('Failed to save note');
  },
});

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(c => activeTab === 'all' || c.status === activeTab)
    .filter(c => 
      searchQuery === '' || 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'match_score') return (b.match_score || 0) - (a.match_score || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'date') return new Date(b.created_date) - new Date(a.created_date);
      return 0;
    });

  const handleStatusChange = (candidateId, newStatus) => {
    updateStatusMutation.mutate({ id: candidateId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="Candidates" 
          subtitle="Manage your talent pipeline"
        />
        
        <div className="p-8">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-10 bg-white border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match_score">Sort by Match Score</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="date">Sort by Date Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
              <GoogleSheetsSync />
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Add Candidate
              </Button>
            </div>
          </div>

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="all" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                All ({candidates.length})
              </TabsTrigger>
              <TabsTrigger value="new">
                New ({candidates.filter(c => c.status === 'new').length})
              </TabsTrigger>
              <TabsTrigger value="screening">
                Screening ({candidates.filter(c => c.status === 'screening').length})
              </TabsTrigger>
              <TabsTrigger value="shortlisted">
                Shortlisted ({candidates.filter(c => c.status === 'shortlisted').length})
              </TabsTrigger>
              <TabsTrigger value="interview">
                Interview ({candidates.filter(c => c.status === 'interview').length})
              </TabsTrigger>
              <TabsTrigger value="offered">
                Offered ({candidates.filter(c => c.status === 'offered').length})
              </TabsTrigger>
              <TabsTrigger value="hired">
                Hired ({candidates.filter(c => c.status === 'hired').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading candidates...</div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredCandidates.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try adjusting your search' : 'Start by adding candidates or using AI sourcing'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Candidates List */}
          {!isLoading && filteredCandidates.length > 0 && viewMode === 'list' ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredCandidates.map((candidate, i) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4" onClick={() => setSelectedCandidate(candidate)}>
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-gray-600">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate cursor-pointer hover:text-red-600">{candidate.name}</h3>
                            <Badge className={statusColors[candidate.status || 'new']}>
                              {statusLabels[candidate.status || 'new']}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{candidate.title}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            {candidate.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {candidate.location}
                              </span>
                            )}
                            {candidate.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {candidate.email}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="hidden md:flex gap-1">
                          {candidate.skills?.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs bg-gray-100">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        {/* Match Score */}
                        {candidate.match_score && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-bold text-red-600">
                              <Star className="w-4 h-4" />
                              {candidate.match_score}%
                            </div>
                            <p className="text-xs text-gray-500">Match</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => candidate.email && window.open(`mailto:${candidate.email}`)}
                          >
                            <Mail className="w-4 h-4 text-gray-400" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => candidate.phone && window.open(`tel:${candidate.phone}`)}
                          >
                            <Phone className="w-4 h-4 text-gray-400" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'screening')}>
                                Move to Screening
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'shortlisted')}>
                                Move to Shortlisted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'interview')}>
                                Move to Interview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'offered')}>
                                Move to Offered
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(candidate.id, 'hired')}>
                                Move to Hired
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleStatusChange(candidate.id, 'rejected')}
                              >
                                Reject Candidate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((candidate, i) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">
                            {candidate.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </span>
                        </div>
                        <Badge className={statusColors[candidate.status || 'new']}>
                          {statusLabels[candidate.status || 'new']}
                        </Badge>
                      </div>
                      
                      <h3 className="font-bold text-lg">{candidate.name}</h3>
                      <p className="text-gray-500 text-sm">{candidate.title}</p>
                      
                      {candidate.location && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                          <MapPin className="w-3 h-3" /> {candidate.location}
                        </div>
                      )}

                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {candidate.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs bg-gray-100">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        {candidate.match_score && (
                          <div className="flex items-center gap-1 text-red-600 font-bold">
                            <Star className="w-4 h-4" />
                            {candidate.match_score}% Match
                          </div>
                        )}
                        <Button size="sm" variant="outline" className="gap-1 ml-auto">
                          View <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Candidate Details Dialog */}
      {selectedCandidate && (
        <CandidateDetailsDialog
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
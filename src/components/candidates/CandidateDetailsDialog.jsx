import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, Phone, MapPin, Star, Briefcase, Calendar,
  ExternalLink, X, Save, Plus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offered', label: 'Offered' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export default function CandidateDetailsDialog({ candidate, onClose, onStatusChange }) {
  const [notes, setNotes] = useState(candidate?.notes || '');
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  const updateNoteMutation = useMutation({
    mutationFn: (updatedNotes) => {
      // For local/demo: simulate success (no real backend call)
      console.log('[mock] Saving updated notes:', updatedNotes);
      return Promise.resolve({ success: true });
      
      // When ready to use real backend (uncomment):
      // return base44.entities.Candidate.update(candidate.id, { notes: updatedNotes });
      // or Supabase:
      // return supabase.from('candidates').update({ notes: updatedNotes }).eq('id', candidate.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Note saved successfully');
      setNewNote('');
    },
    onError: (error) => {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    },
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const timestamp = new Date().toLocaleString();
    const updatedNotes = notes 
      ? `${notes}\n\n[${timestamp}]\n${newNote}`
      : `[${timestamp}]\n${newNote}`;

    setNotes(updatedNotes);
    updateNoteMutation.mutate(updatedNotes);
  };

  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(candidate.id, newStatus);
    }
    toast.success(`Status updated to ${newStatus}`);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {candidate?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </span>
              </div>
              <div>
                <DialogTitle className="text-2xl">{candidate?.name || 'Candidate'}</DialogTitle>
                <p className="text-gray-500">{candidate?.title || 'No title'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Notes & Ratings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Status & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Current Status</label>
                <Select 
                  value={candidate?.status || 'new'} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {candidate?.match_score && (
                <div className="text-center">
                  <label className="text-sm font-medium mb-2 block">Match Score</label>
                  <div className="flex items-center gap-1 text-2xl font-bold text-red-600">
                    <Star className="w-6 h-6" />
                    {candidate.match_score}%
                  </div>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {candidate?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                        {candidate.email}
                      </a>
                    </div>
                  )}
                  {candidate?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${candidate.phone}`} className="hover:text-blue-600">
                        {candidate.phone}
                      </a>
                    </div>
                  )}
                  {candidate?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {candidate.location}
                    </div>
                  )}
                  {candidate?.linkedin_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Professional Details</h3>
                <div className="space-y-2">
                  {candidate?.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {candidate.company}
                    </div>
                  )}
                  {candidate?.experience_years && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {candidate.experience_years} years experience
                    </div>
                  )}
                  {candidate?.salary_expectation && (
                    <div className="text-sm">
                      <span className="text-gray-500">Salary:</span> {candidate.salary_expectation}
                    </div>
                  )}
                  {candidate?.availability && (
                    <div className="text-sm">
                      <span className="text-gray-500">Available:</span> {candidate.availability}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {candidate?.skills && candidate.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-red-50 text-red-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {candidate?.ai_insights && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-900">AI Insights</h3>
                {candidate.ai_insights.summary && (
                  <p className="text-sm text-blue-800 mb-3">{candidate.ai_insights.summary}</p>
                )}
                {candidate.ai_insights.personality_traits && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-blue-900">Personality:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.ai_insights.personality_traits.map((trait) => (
                        <Badge key={trait} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CV Link */}
            {candidate?.cv_url && (
              <div>
                <Button variant="outline" className="w-full" asChild>
                  <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View CV/Resume
                  </a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-6">
            <div>
              <h3 className="font-semibold mb-3">Add New Note</h3>
              <Textarea
                placeholder="Add notes about this candidate... (e.g. interview feedback, preferences, red flags)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                className="mt-3 bg-red-600 hover:bg-red-700"
                onClick={handleAddNote}
                disabled={!newNote.trim() || updateNoteMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateNoteMutation.isPending ? 'Saving...' : 'Save Note'}
              </Button>
            </div>

            {notes && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-3">Candidate Notes</h3>
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {notes}
                </div>
              </div>
            )}

            {candidate?.cultural_fit_score && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold mb-2">Cultural Fit Score</h3>
                <div className="text-4xl font-bold text-purple-600">
                  {candidate.cultural_fit_score}%
                </div>
                <p className="text-sm text-purple-700 mt-1">Based on AI analysis of notes and profile</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-6 space-y-4">
            <div className="p-4 border-l-4 border-gray-200 bg-gray-50 rounded-r-lg">
              <div className="text-sm font-medium text-gray-700">Candidate Added</div>
              <div className="text-xs text-gray-500 mt-1">
                {candidate?.created_date 
                  ? new Date(candidate.created_date).toLocaleString() 
                  : 'Not available'}
              </div>
            </div>

            {candidate?.updated_date && candidate.updated_date !== candidate.created_date && (
              <div className="p-4 border-l-4 border-blue-200 bg-blue-50 rounded-r-lg">
                <div className="text-sm font-medium text-gray-700">Last Updated</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(candidate.updated_date).toLocaleString()}
                </div>
              </div>
            )}

            {/* Add more activity items here later if you have them */}
            <div className="p-4 border-l-4 border-gray-200 bg-gray-50 rounded-r-lg opacity-70">
              <div className="text-sm font-medium text-gray-700">Status Changed</div>
              <div className="text-xs text-gray-500 mt-1">To Shortlisted - 2 days ago</div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
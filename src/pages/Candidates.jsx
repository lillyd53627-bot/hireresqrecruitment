// src/components/candidates/CandidateDetailsDialog.jsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, Phone, MapPin, Star, Briefcase, Calendar,
  ExternalLink, X, Save 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
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

export default function CandidateDetailsDialog({ 
  candidate, 
  onClose, 
  onStatusChange 
}) {
  const [notes, setNotes] = useState(candidate?.notes || '');
  const [newNote, setNewNote] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const timestamp = new Date().toLocaleString();
    const updatedNotes = notes 
      ? `${notes}\n\n[${timestamp}]\n${newNote}`
      : `[${timestamp}]\n${newNote}`;

    try {
      const { error } = await supabase
        .from('candidates')
        .update({ notes: updatedNotes })
        .eq('id', candidate.id);

      if (error) throw error;

      setNotes(updatedNotes);
      setNewNote('');
      toast.success('Note saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save note');
    }
  };

  const handleStatusChangeLocal = async (newStatus) => {
    try {
      // Fixed: removed duplicate 'data, error' declaration
      const { error } = await supabase
        .from('candidates')
        .update({ status: newStatus })
        .eq('id', candidate.id);

      if (error) throw error;

      toast.success('Status updated');
      if (onStatusChange) onStatusChange(candidate.id, newStatus);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Dialog open={!!candidate} onOpenChange={onClose}>
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
                <DialogTitle className="text-2xl">{candidate?.name}</DialogTitle>
                <p className="text-gray-500">{candidate?.title}</p>
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
            {/* Status */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Current Status</label>
                <Select 
                  value={candidate?.status || 'new'} 
                  onValueChange={handleStatusChangeLocal}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
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

            {/* Contact & Professional Info */}
            <div className="grid md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3 text-sm">
                  {candidate?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                        {candidate.email}
                      </a>
                    </div>
                  )}
                  {candidate?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${candidate.phone}`} className="hover:text-blue-600">
                        {candidate.phone}
                      </a>
                    </div>
                  )}
                  {candidate?.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {candidate.location}
                    </div>
                  )}
                  {candidate?.linkedin_url && (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Professional Details</h3>
                <div className="space-y-3 text-sm">
                  {candidate?.company && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {candidate.company}
                    </div>
                  )}
                  {candidate?.experience_years && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {candidate.experience_years} years experience
                    </div>
                  )}
                  {candidate?.salary_expectation && (
                    <div><span className="text-gray-500">Salary Expectation:</span> {candidate.salary_expectation}</div>
                  )}
                  {candidate?.availability && (
                    <div><span className="text-gray-500">Availability:</span> {candidate.availability.replace('_', ' ')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {candidate?.skills && candidate.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-red-50 text-red-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {candidate?.ai_insights && (
              <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="font-semibold mb-3 text-purple-900">AI Insights</h3>
                {candidate.ai_insights.summary && (
                  <p className="text-purple-800 mb-4">{candidate.ai_insights.summary}</p>
                )}
                {candidate.ai_insights.personality_traits && candidate.ai_insights.personality_traits.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-purple-900">Personality Traits:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {candidate.ai_insights.personality_traits.map((trait, i) => (
                        <Badge key={i} className="bg-white text-purple-700 border-purple-200">
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
              <Button variant="outline" className="w-full" asChild>
                <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View CV / Resume
                </a>
              </Button>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Add New Note</h3>
              <Textarea
                placeholder="Add detailed notes about the candidate..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="mt-3 bg-red-600 hover:bg-red-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            </div>

            {notes && (
              <div className="p-5 bg-gray-50 rounded-xl border">
                <h3 className="font-semibold mb-3">Previous Notes</h3>
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {notes}
                </div>
              </div>
            )}

            {candidate?.cultural_fit_score && (
              <div className="p-5 bg-purple-50 rounded-xl">
                <h3 className="font-semibold mb-2">Cultural Fit Score</h3>
                <div className="text-4xl font-bold text-purple-600">
                  {candidate.cultural_fit_score}%
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="space-y-6">
              <div className="p-5 border-l-4 border-gray-300 bg-gray-50 rounded-r-xl">
                <div className="font-medium">Candidate Added</div>
                <div className="text-sm text-gray-500 mt-1">
                  {candidate?.created_at ? new Date(candidate.created_at).toLocaleString() : 'Unknown'}
                </div>
              </div>

              {candidate?.updated_at && candidate.updated_at !== candidate.created_at && (
                <div className="p-5 border-l-4 border-blue-300 bg-blue-50 rounded-r-xl">
                  <div className="font-medium">Last Updated</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(candidate.updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
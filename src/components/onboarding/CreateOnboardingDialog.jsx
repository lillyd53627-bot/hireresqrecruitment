import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const documentTypes = [
  { id: 'id_document', label: 'ID Document / Passport' },
  { id: 'tax_form', label: 'Tax Forms (IRP5, etc.)' },
  { id: 'background_check', label: 'Background Check Consent' },
  { id: 'criminal_check', label: 'Criminal Record Check' },
  { id: 'salary_slip', label: 'Latest Salary Slips' },
  { id: 'qualification', label: 'Qualifications/Certificates' },
  { id: 'reference', label: 'Reference Letters' },
];

export default function CreateOnboardingDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    candidate_id: '',
    candidate_name: '',
    candidate_email: '',
    job_title: '',
    company: '',
    start_date: '',
    salary: '',
    documents: []
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => Candidate.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const documentsRequired = data.documents.map(docType => ({
        name: documentTypes.find(d => d.id === docType)?.label || docType,
        type: docType,
        status: 'pending',
        url: '',
        uploaded_date: '',
        notes: ''
      }));

      const onboardingData = {
        candidate_id: data.candidate_id,
        candidate_name: data.candidate_name,
        candidate_email: data.candidate_email,
        job_title: data.job_title,
        company: data.company,
        start_date: data.start_date,
        salary: parseFloat(data.salary),
        status: 'offer_pending',
        documents_required: documentsRequired,
        onboarding_progress: 0,
        communication_log: [],
        next_action: 'Generate and send offer letter'
      };

      return await base44.entities.Onboarding.create(onboardingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
      toast.success('Onboarding workflow created successfully!');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to create onboarding workflow');
      console.error(error);
    }
  });

  const handleCandidateSelect = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      setFormData({
        ...formData,
        candidate_id: candidateId,
        candidate_name: candidate.name,
        candidate_email: candidate.email,
      });
    }
  };

  const toggleDocument = (docId) => {
    setFormData({
      ...formData,
      documents: formData.documents.includes(docId)
        ? formData.documents.filter(d => d !== docId)
        : [...formData.documents, docId]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            Start New Onboarding Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Candidate</Label>
            <Select onValueChange={handleCandidateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose candidate..." />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Candidate Name *</Label>
              <Input
                value={formData.candidate_name}
                onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.candidate_email}
                onChange={(e) => setFormData({ ...formData, candidate_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="e.g. Senior Developer"
              />
            </div>
            <div className="space-y-2">
              <Label>Company *</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Salary</Label>
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="Annual salary"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label>Required Documents</Label>
            <div className="space-y-2">
              {documentTypes.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={doc.id}
                    checked={formData.documents.includes(doc.id)}
                    onCheckedChange={() => toggleDocument(doc.id)}
                  />
                  <label
                    htmlFor={doc.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {doc.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending || !formData.candidate_name || !formData.candidate_email || !formData.job_title}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Onboarding'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
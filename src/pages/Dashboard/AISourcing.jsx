import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Sparkles,
  UserPlus,
  UserCheck,
  Eye,
  RefreshCw,
  BriefcaseBusiness,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  SlidersHorizontal,
  X,
  ChevronDown,
  FileText,
  Target
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import CandidateDetailsDialog from '@/components/candidates/CandidateDetailsDialog';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' }
];

const getJobTitle = (candidate) =>
  candidate?.job_title ||
  candidate?.jobTitle ||
  candidate?.position ||
  candidate?.applied_for ||
  candidate?.target_role ||
  '';

const getOwnerId = (candidate) =>
  candidate?.assigned_user_id ||
  candidate?.user_id ||
  candidate?.owner_id ||
  candidate?.created_by ||
  null;

const normaliseStatus = (status) => {
  const value = String(status || 'new').toLowerCase();
  return STATUS_OPTIONS.some((item) => item.value === value) ? value : 'new';
};

const getMatchScore = (candidate) => {
  const raw =
    candidate?.match_score ??
    candidate?.matchScore ??
    candidate?.score ??
    candidate?.similarity_score;

  if (raw === null || raw === undefined || raw === '') return null;

  const number = Number(raw);
  if (Number.isNaN(number)) return null;

  // Supports either 0-1 similarity values or 0-100 percentage values.
  const percentage = number <= 1 ? number * 100 : number;
  return Math.max(0, Math.min(100, Math.round(percentage)));
};

export default function AISourcing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [jobFilter, setJobFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [minimumScore, setMinimumScore] = useState('0');
  const [showFilters, setShowFilters] = useState(false);

  const [savingCandidateIds, setSavingCandidateIds] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Get the authenticated user. Do NOT place a service-role key in browser code.
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Unable to get authenticated user:', error);
        return;
      }

      if (mounted) setCurrentUser(data?.user || null);
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const searchCandidates = useCallback(async (queryOverride) => {
    const query = String(queryOverride ?? searchQuery).trim();

    if (!query) {
      toast.info('Enter a job title, skill or location to search.');
      return;
    }

    setLoading(true);
    setCandidates([]);
    setSelectedIds([]);

    try {
      console.log('🔄 Calling AI Sourcing with query:', query);

      /*
       * IMPORTANT:
       * The previous version contained:
       *   uoovbueakhhswpmythsb.supabase.co.supabase.co
       * and exposed a service-role JWT in frontend code.
       *
       * The correct Supabase Edge Function URL is:
       *   https://uoovbueakhhswpmythsb.supabase.co/functions/v1/AI-Sourcing
       *
       * The user's authenticated Supabase session is sent automatically.
       */
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        throw new Error('You are not signed in. Please sign in before using AI Sourcing.');
      }

      const response = await fetch(
        'https://uoovbueakhhswpmythsb.supabase.co/functions/v1/AI-Sourcing',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            query,
            user_id: currentUser?.id || null
          })
        }
      );

      const rawText = await response.text();

      let data;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { raw: rawText };
      }

      console.log('📡 AI Sourcing status:', response.status);
      console.log('✅ AI Sourcing response:', data);

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          `AI Sourcing returned HTTP ${response.status}`
        );
      }

      const candidatesList = Array.isArray(data)
        ? data
        : Array.isArray(data?.candidates)
          ? data.candidates
          : Array.isArray(data?.results)
            ? data.results
            : [];

      setCandidates(candidatesList);

      if (candidatesList.length === 0) {
        toast.info('No candidates found for this search.');
      } else {
        toast.success(`Found ${candidatesList.length} candidate${candidatesList.length === 1 ? '' : 's'}.`);
      }
    } catch (error) {
      console.error('🚨 AI Sourcing error:', error);
      toast.error(error?.message || 'Failed to reach AI Sourcing.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentUser]);

  const jobs = useMemo(() => {
    return [...new Set(candidates.map(getJobTitle).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }, [candidates]);

  const locations = useMemo(() => {
    return [...new Set(
      candidates
        .map((candidate) => candidate.city || candidate.location || candidate.province)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const minimum = Number(minimumScore);

    return candidates.filter((candidate) => {
      const score = getMatchScore(candidate);

      return (
        (jobFilter === 'ALL' || getJobTitle(candidate) === jobFilter) &&
        (locationFilter === 'ALL' ||
          (candidate.city || candidate.location || candidate.province) === locationFilter) &&
        (minimum === 0 || (score !== null && score >= minimum))
      );
    });
  }, [candidates, jobFilter, locationFilter, minimumScore]);

  useEffect(() => {
    setSelectedIds((previous) =>
      previous.filter((id) => filteredCandidates.some((candidate) => candidate.id === id))
    );
  }, [filteredCandidates]);

  const selectedCandidates = useMemo(
    () => filteredCandidates.filter((candidate) => selectedIds.includes(candidate.id)),
    [filteredCandidates, selectedIds]
  );

  const allVisibleSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((candidate) => selectedIds.includes(candidate.id));

  const averageScore = useMemo(() => {
    const scores = filteredCandidates
      .map(getMatchScore)
      .filter((score) => score !== null);

    if (!scores.length) return null;

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }, [filteredCandidates]);

  const toggleCandidate = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = filteredCandidates.map((candidate) => candidate.id);

    if (allVisibleSelected) {
      setSelectedIds((previous) =>
        previous.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedIds((previous) => [...new Set([...previous, ...visibleIds])]);
    }
  };

  /*
   * Saves an AI-sourced candidate into the main candidates table.
   * This is what connects AI Sourcing to the Candidate Dashboard.
   */
  const saveCandidate = async (candidate) => {
    if (!currentUser?.id) {
      toast.error('Please sign in before saving candidates.');
      return;
    }

    if (savingCandidateIds.includes(candidate.id)) return;

    setSavingCandidateIds((previous) => [...previous, candidate.id]);

    try {
      const payload = {
        name: candidate.name || 'Unknown',
        title: candidate.title || candidate.current_title || '',
        location: candidate.location || '',
        city: candidate.city || '',
        province: candidate.province || '',
        skills: Array.isArray(candidate.skills)
          ? candidate.skills.join(', ')
          : (candidate.skills || ''),
        education: candidate.education || '',
        gender: candidate.gender || '',
        ethnicity: candidate.ethnicity || '',
        age: candidate.age || null,
        salary: candidate.salary || candidate.expected_salary || null,
        email: candidate.email || '',
        phone: candidate.phone || '',
        job_title: getJobTitle(candidate),
        status: 'new',
        assigned_user_id: currentUser.id,
        created_by: currentUser.id,

        // Preserve sourcing information where your schema supports it.
        source: candidate.source || 'AI Sourcing',
        match_score: getMatchScore(candidate),
        source_profile_url:
          candidate.source_profile_url ||
          candidate.profile_url ||
          candidate.linkedin_url ||
          null
      };

      const { data, error } = await supabase
        .from('candidates')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setCandidates((previous) =>
        previous.map((item) =>
          item.id === candidate.id
            ? { ...item, saved_to_candidates: true, saved_candidate_id: data?.id }
            : item
        )
      );

      toast.success(`${candidate.name || 'Candidate'} added to your Candidate Dashboard.`);
    } catch (error) {
      console.error('Save sourced candidate error:', error);

      // This makes the feature easier to diagnose if optional sourcing columns
      // have not yet been added to the database.
      if (
        String(error?.message || '').includes('match_score') ||
        String(error?.message || '').includes('source_profile_url')
      ) {
        toast.error(
          'Candidate could not be saved because the candidates table is missing an AI sourcing field. See the console for the exact column.'
        );
      } else {
        toast.error(error?.message || 'Could not save candidate.');
      }
    } finally {
      setSavingCandidateIds((previous) =>
        previous.filter((id) => id !== candidate.id)
      );
    }
  };

  const saveSelectedCandidates = async () => {
    if (!selectedCandidates.length) return;

    for (const candidate of selectedCandidates) {
      if (!candidate.saved_to_candidates) {
        // Sequential saves reduce the chance of hitting Supabase/RLS limits.
        // eslint-disable-next-line no-await-in-loop
        await saveCandidate(candidate);
      }
    }

    setSelectedIds([]);
  };

  const assignSelectedToCurrentUser = async () => {
    if (!currentUser?.id || !selectedCandidates.length) return;

    setAssigning(true);

    try {
      /*
       * If a sourced candidate already exists in candidates, update ownership.
       * New AI results are first saved, then assigned.
       */
      const unsaved = selectedCandidates.filter((candidate) => !candidate.saved_to_candidates);

      for (const candidate of unsaved) {
        // eslint-disable-next-line no-await-in-loop
        await saveCandidate(candidate);
      }

      toast.success('Selected candidates have been added to your dashboard.');
      setSelectedIds([]);
    } catch (error) {
      console.error('Assign sourced candidates error:', error);
      toast.error(error?.message || 'Could not assign selected candidates.');
    } finally {
      setAssigning(false);
    }
  };

  const updateSelectedStatus = async (newStatus) => {
    if (!selectedCandidates.length) return;

    setStatusUpdating(true);

    try {
      /*
       * Only candidates already persisted in the candidates table can have
       * their pipeline status changed. Unsaved AI results are saved first.
       */
      for (const candidate of selectedCandidates) {
        if (!candidate.saved_to_candidates) {
          // eslint-disable-next-line no-await-in-loop
          await saveCandidate(candidate);
        }
      }

      const savedIds = candidates
        .filter((candidate) =>
          selectedIds.includes(candidate.id) && candidate.saved_candidate_id
        )
        .map((candidate) => candidate.saved_candidate_id);

      if (savedIds.length) {
        const { error } = await supabase
          .from('candidates')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .in('id', savedIds);

        if (error) throw error;
      }

      setCandidates((previous) =>
        previous.map((candidate) =>
          selectedIds.includes(candidate.id)
            ? { ...candidate, status: newStatus }
            : candidate
        )
      );

      toast.success(`Selected candidates moved to ${newStatus}.`);
      setSelectedIds([]);
    } catch (error) {
      console.error('Update sourced candidate status error:', error);
      toast.error(error?.message || 'Could not update candidate status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const clearResults = () => {
    setCandidates([]);
    setSelectedIds([]);
    setJobFilter('ALL');
    setLocationFilter('ALL');
    setMinimumScore('0');
  };

  const activeFilterCount = [
    jobFilter !== 'ALL',
    locationFilter !== 'ALL',
    minimumScore !== '0'
  ].filter(Boolean).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pl-72">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Talent Sourcing</h1>
              <p className="text-sm text-gray-500">
                Find, evaluate and move AI-matched candidates into your recruitment pipeline.
              </p>
            </div>
          </div>
        </div>

        {currentUser && (
          <Badge variant="outline" className="w-fit">
            <UserCheck className="w-3 h-3 mr-1" />
            {currentUser.email || 'Recruiter'}
          </Badge>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-red-600" />
            Candidate Search
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') searchCandidates();
                }}
                placeholder="e.g. Sales Manager Johannesburg, Financial Accountant Cape Town"
                className="pl-10 h-11"
              />
            </div>

            <Button
              onClick={() => searchCandidates()}
              disabled={loading || !searchQuery.trim()}
              className="bg-red-600 hover:bg-red-700 h-11 min-w-[120px]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>

            {candidates.length > 0 && (
              <Button variant="outline" onClick={clearResults}>
                Clear
              </Button>
            )}
          </div>

          {candidates.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters((value) => !value)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters {activeFilterCount ? `(${activeFilterCount})` : ''}
              </Button>

              <span className="text-xs text-gray-500">
                {filteredCandidates.length} results
                {averageScore !== null ? ` · ${averageScore}% average match` : ''}
              </span>
            </div>
          )}

          {showFilters && candidates.length > 0 && (
            <div className="grid md:grid-cols-3 gap-3 border-t pt-4">
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Job / role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All roles</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job} value={job}>{job}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={minimumScore} onValueChange={setMinimumScore}>
                <SelectTrigger>
                  <SelectValue placeholder="Minimum match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any match score</SelectItem>
                  <SelectItem value="60">60%+ match</SelectItem>
                  <SelectItem value="70">70%+ match</SelectItem>
                  <SelectItem value="80">80%+ match</SelectItem>
                  <SelectItem value="90">90%+ match</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <Card className="border border-red-100 bg-red-50/50 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">
                  {selectedIds.length} candidate{selectedIds.length === 1 ? '' : 's'} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={saveSelectedCandidates}
                  disabled={assigning}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {assigning ? 'Adding...' : 'Add to My Candidates'}
                </Button>

                <Select disabled={statusUpdating} onValueChange={updateSelectedStatus}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Move to status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        Move to {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {candidates.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={toggleAllVisible}
                />
                <span className="text-sm font-medium">Select visible candidates</span>
              </div>

              <span className="text-xs text-gray-500">
                {filteredCandidates.length} matching AI results
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center text-gray-500">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3" />
              <p className="font-medium">AI is sourcing candidates...</p>
              <p className="text-xs mt-1">This may take a few moments.</p>
            </CardContent>
          </Card>
        ) : filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate, index) => {
            const score = getMatchScore(candidate);
            const selected = selectedIds.includes(candidate.id);
            const saved = Boolean(candidate.saved_to_candidates);

            return (
              <Card
                key={candidate.id || index}
                className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                  selected ? 'ring-2 ring-red-200' : ''
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleCandidate(candidate.id)}
                      className="mt-1"
                    />

                    <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5 text-red-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg truncate">
                              {candidate.name || 'Unnamed Candidate'}
                            </h3>

                            {saved && (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                In My Candidates
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-600">
                            {candidate.title || candidate.current_title || 'Title not provided'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {score !== null && (
                            <Badge className={
                              score >= 80
                                ? 'bg-green-100 text-green-700'
                                : score >= 60
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                            }>
                              {score}% Match
                            </Badge>
                          )}

                          <Badge variant="outline">AI Sourced</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2 min-w-0">
                          <BriefcaseBusiness className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{getJobTitle(candidate) || 'No job linked'}</span>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span className="truncate">
                            {candidate.city || candidate.location || candidate.province || 'Location not provided'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{candidate.email || 'Email not provided'}</span>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{candidate.phone || 'Phone not provided'}</span>
                        </div>
                      </div>

                      {(candidate.skills || candidate.education) && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {candidate.education && (
                            <Badge variant="outline">{candidate.education}</Badge>
                          )}

                          {Array.isArray(candidate.skills)
                            ? candidate.skills.slice(0, 8).map((skill) => (
                                <Badge key={skill} variant="outline">{skill}</Badge>
                              ))
                            : candidate.skills && (
                                <Badge variant="outline" className="max-w-[500px] truncate">
                                  {candidate.skills}
                                </Badge>
                              )}
                        </div>
                      )}

                      {candidate.summary && (
                        <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                          {candidate.summary}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>

                        {!saved && (
                          <Button
                            size="sm"
                            onClick={() => saveCandidate(candidate)}
                            disabled={savingCandidateIds.includes(candidate.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            {savingCandidateIds.includes(candidate.id)
                              ? 'Adding...'
                              : 'Add to My Candidates'}
                          </Button>
                        )}

                        {(candidate.cv_file_path || candidate.cv_url) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = candidate.cv_file_path || candidate.cv_url;
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            CV
                          </Button>
                        )}

                        {candidate.profile_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(candidate.profile_url, '_blank', 'noopener,noreferrer')
                            }
                          >
                            Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-16 text-gray-500">
              <Sparkles className="w-10 h-10 mx-auto mb-3 text-gray-300" />

              {candidates.length > 0 ? (
                <>
                  <p className="font-medium">No candidates match your filters.</p>
                  <p className="text-sm mt-1">
                    Adjust the role, location or minimum match score.
                  </p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => {
                      setJobFilter('ALL');
                      setLocationFilter('ALL');
                      setMinimumScore('0');
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <p className="font-medium">Search for your next candidate.</p>
                  <p className="text-sm mt-1">
                    Try “Sales Manager Johannesburg”, “Accountant Cape Town” or a skills-based search.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedCandidate && (
        <CandidateDetailsDialog
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}

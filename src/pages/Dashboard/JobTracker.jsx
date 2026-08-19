// src/pages/Dashboard/JobTracker.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Search,
  Plus,
  Briefcase,
  MapPin,
  Users,
  MoreVertical,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowLeft,
  Circle,
  ClipboardPaste,
  X,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw,
  UserCheck,
  UserPlus,
  CheckCircle2,
  MessageSquare,
  CalendarDays,
  UserX,
  Send,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';

import { supabase } from '@/lib/supabase';

/* ============================================================================
   CONSTANTS
============================================================================ */

const JOB_STATUSES = [
  {
    value: 'open',
    label: 'Open',
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'on_hold',
    label: 'On Hold',
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    value: 'filled',
    label: 'Filled',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'closed',
    label: 'Closed',
    color: 'bg-gray-100 text-gray-700',
  },
];

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
];

const WORK_MODES = [
  'On-site',
  'Hybrid',
  'Remote',
];

const LOCATIONS = [
  'Cape Town',
  'Johannesburg',
  'Durban',
  'Pretoria',
  'Remote',
  'Other',
];

const CANDIDATE_STAGES = [
  {
    value: 'sourced',
    label: 'Sourced',
    icon: UserPlus,
    color: 'bg-gray-100 text-gray-700',
  },
  {
    value: 'screening',
    label: 'Screening',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'shortlisted',
    label: 'Shortlisted',
    icon: CheckCircle2,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    value: 'interview',
    label: 'Interview',
    icon: CalendarDays,
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    value: 'offer',
    label: 'Offer',
    icon: Send,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    value: 'hired',
    label: 'Hired',
    icon: UserCheck,
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    icon: UserX,
    color: 'bg-red-100 text-red-700',
  },
];

/* ============================================================================
   HELPERS
============================================================================ */

const EMPTY_JOB_FORM = {
  title: '',
  description: '',
  location: 'Johannesburg',
  job_type: 'Full-time',
  work_mode: 'On-site',
};

const formatRelative = (value) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const difference = Date.now() - date.getTime();

  if (difference < 0) {
    return 'Today';
  }

  const days = Math.floor(difference / 86400000);

  if (days === 0) {
    return 'Today';
  }

  if (days === 1) {
    return 'Yesterday';
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  if (days < 30) {
    return `${Math.floor(days / 7)} weeks ago`;
  }

  return date.toLocaleDateString('en-ZA');
};

const getStatusBadge = (status) => {
  return (
    JOB_STATUSES.find((item) => item.value === status) || {
      value: 'open',
      label: 'Open',
      color: 'bg-green-100 text-green-700',
    }
  );
};

const getStage = (stage) => {
  return (
    CANDIDATE_STAGES.find((item) => item.value === stage) || {
      value: 'sourced',
      label: 'Sourced',
      icon: UserPlus,
      color: 'bg-gray-100 text-gray-700',
    }
  );
};

const parseJobPost = (text) => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let title = lines[0] || 'Untitled Job';
  let location = 'Johannesburg';

  const titleMatch = text.match(
    /(?:job title|position|role|job)\s*[:\-–]\s*(.+)/i
  );

  if (titleMatch?.[1]) {
    title = titleMatch[1].trim();
  }

  const locationMatch = text.match(
    /(?:location|based in|city)\s*[:\-–]\s*(.+)/i
  );

  if (locationMatch?.[1]) {
    location = locationMatch[1]
      .trim()
      .split(/[,\n]/)[0]
      .trim();
  }

  return {
    title: title.slice(0, 120),
    description: text.trim(),
    location: location || 'Johannesburg',
  };
};

/* ============================================================================
   COMPONENT
============================================================================ */

export default function JobTracker() {
  /* --------------------------------------------------------------------------
     UI
  -------------------------------------------------------------------------- */

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* --------------------------------------------------------------------------
     AUTH
  -------------------------------------------------------------------------- */

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* --------------------------------------------------------------------------
     JOBS
  -------------------------------------------------------------------------- */

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* --------------------------------------------------------------------------
     CANDIDATES
  -------------------------------------------------------------------------- */

  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  /* --------------------------------------------------------------------------
     ERRORS
  -------------------------------------------------------------------------- */

  const [error, setError] = useState('');

  /* --------------------------------------------------------------------------
     FILTERS
  -------------------------------------------------------------------------- */

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  /* --------------------------------------------------------------------------
     SELECTED JOB
  -------------------------------------------------------------------------- */

  const [selectedJob, setSelectedJob] = useState(null);
  const [showPipeline, setShowPipeline] = useState(false);

  /* --------------------------------------------------------------------------
     PIPELINE
  -------------------------------------------------------------------------- */

  const [pipelineSearch, setPipelineSearch] = useState('');
  const [pipelineCandidate, setPipelineCandidate] = useState(null);

  /* --------------------------------------------------------------------------
     DIALOGS
  -------------------------------------------------------------------------- */

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPasteOpen, setIsPasteOpen] = useState(false);

  /* --------------------------------------------------------------------------
     JOB FORM
  -------------------------------------------------------------------------- */

  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [editingJob, setEditingJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [pasteText, setPasteText] = useState('');

  /* ==========================================================================
     AUTH
  ========================================================================== */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setAuthLoading(true);

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (userError) {
        console.error('Supabase auth error:', userError);
        setError('Unable to verify your login session.');
        setUser(null);
      } else {
        setUser(currentUser || null);
      }

      setAuthLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ==========================================================================
     LOAD JOBS
  ========================================================================== */

  const loadJobs = async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error: jobsError,
      } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          location,
          created_at,
          user_id
        `)
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: false,
        });

      if (jobsError) {
        throw jobsError;
      }

      const loadedJobs = data || [];

      setJobs(loadedJobs);

      if (selectedJob?.id) {
        const refreshedJob = loadedJobs.find(
          (job) => job.id === selectedJob.id
        );

        if (refreshedJob) {
          setSelectedJob(refreshedJob);
        } else {
          setSelectedJob(null);
          setShowPipeline(false);
        }
      }
    } catch (err) {
      console.error('Load jobs error:', err);

      setError(
        err?.message || 'Unable to load jobs from Supabase.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     LOAD CANDIDATES
  ========================================================================== */

  const loadCandidates = async () => {
    if (!user?.id) {
      return;
    }

    setCandidatesLoading(true);

    try {
      const {
        data,
        error: candidatesError,
      } = await supabase
        .from('candidates')
        .select(`
          id,
          name,
          title,
          location,
          email,
          phone,
          stage,
          shortlisted,
          match_score,
          experience_years,
          experience,
          education,
          skills,
          notes,
          industry,
          salary,
          nationality,
          availability,
          linkedin_url,
          job_id,
          user_id,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: false,
        });

      if (candidatesError) {
        throw candidatesError;
      }

      setCandidates(data || []);
    } catch (err) {
      console.error('Load candidates error:', err);

      setError(
        err?.message || 'Unable to load candidates.'
      );
    } finally {
      setCandidatesLoading(false);
    }
  };

  /* ==========================================================================
     INITIAL DATA LOAD
  ========================================================================== */

  useEffect(() => {
    if (!user?.id) {
      setJobs([]);
      setCandidates([]);
      setLoading(false);
      return;
    }

    loadJobs();
    loadCandidates();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* ==========================================================================
     SELECTED JOB CANDIDATES
  ========================================================================== */

  const selectedJobCandidates = useMemo(() => {
    if (!selectedJob?.id) {
      return [];
    }

    return candidates.filter(
      (candidate) => candidate.job_id === selectedJob.id
    );
  }, [candidates, selectedJob]);

  /* ==========================================================================
     CANDIDATE COUNTS BY JOB
  ========================================================================== */

  const candidateCountsByJob = useMemo(() => {
    const counts = {};

    candidates.forEach((candidate) => {
      if (!candidate.job_id) {
        return;
      }

      if (!counts[candidate.job_id]) {
        counts[candidate.job_id] = {
          total: 0,
          shortlisted: 0,
          interview: 0,
          hired: 0,
        };
      }

      counts[candidate.job_id].total += 1;

      if (
        candidate.stage === 'shortlisted' ||
        candidate.shortlisted === true
      ) {
        counts[candidate.job_id].shortlisted += 1;
      }

      if (candidate.stage === 'interview') {
        counts[candidate.job_id].interview += 1;
      }

      if (candidate.stage === 'hired') {
        counts[candidate.job_id].hired += 1;
      }
    });

    return counts;
  }, [candidates]);

  /* ==========================================================================
     FILTERED JOBS
  ========================================================================== */

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const title = (job.title || '').toLowerCase();
      const description = (job.description || '').toLowerCase();
      const location = (job.location || '').toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        description.includes(query) ||
        location.includes(query);

      // Current jobs query intentionally does not use a status column.
      // Until jobs.status is confirmed to exist, all loaded jobs are treated
      // as Open.
      const matchesStatus =
        statusFilter === 'all' ||
        statusFilter === 'open';

      const matchesLocation =
        locationFilter === 'all' ||
        job.location === locationFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLocation
      );
    });
  }, [
    jobs,
    search,
    statusFilter,
    locationFilter,
  ]);

  /* ==========================================================================
     STATS
  ========================================================================== */

  const stats = useMemo(() => {
    const totalCandidates = candidates.length;

    const activeJobs = jobs.length;

    return {
      total: jobs.length,
      open: activeJobs,
      candidates: totalCandidates,
    };
  }, [jobs, candidates]);

  /* ==========================================================================
     PIPELINE COUNTS
  ========================================================================== */

  const pipelineCounts = useMemo(() => {
    const counts = {};

    CANDIDATE_STAGES.forEach((stage) => {
      counts[stage.value] = 0;
    });

    selectedJobCandidates.forEach((candidate) => {
      const stage = candidate.stage || 'sourced';

      if (
        Object.prototype.hasOwnProperty.call(
          counts,
          stage
        )
      ) {
        counts[stage] += 1;
      } else {
        counts.sourced += 1;
      }
    });

    return counts;
  }, [selectedJobCandidates]);

  /* ==========================================================================
     PIPELINE SEARCH
  ========================================================================== */

  const pipelineFilteredCandidates = useMemo(() => {
    const query = pipelineSearch.trim().toLowerCase();

    if (!query) {
      return selectedJobCandidates;
    }

    return selectedJobCandidates.filter((candidate) => {
      return (
        (candidate.name || '')
          .toLowerCase()
          .includes(query) ||
        (candidate.title || '')
          .toLowerCase()
          .includes(query) ||
        (candidate.email || '')
          .toLowerCase()
          .includes(query) ||
        (candidate.location || '')
          .toLowerCase()
          .includes(query)
      );
    });
  }, [
    selectedJobCandidates,
    pipelineSearch,
  ]);

  /* ==========================================================================
     OPEN ADD JOB
  ========================================================================== */

  const openAddJob = () => {
    setError('');
    setJobForm(EMPTY_JOB_FORM);
    setEditingJob(null);
    setIsAddOpen(true);
  };

  /* ==========================================================================
     OPEN EDIT JOB
  ========================================================================== */

  const openEditJob = (job) => {
    setError('');

    setEditingJob(job);

    setJobForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location || 'Johannesburg',
      job_type: 'Full-time',
      work_mode: 'On-site',
    });

    setIsEditOpen(true);
  };

  /* ==========================================================================
     CLOSE JOB FORM
  ========================================================================== */

  const closeJobForm = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setEditingJob(null);
    setJobForm(EMPTY_JOB_FORM);
  };

  /* ==========================================================================
     SAVE JOB
  ========================================================================== */

  const saveJob = async () => {
    if (!user?.id) {
      setError('You must be logged in to create a job.');
      return;
    }

    const title = jobForm.title.trim();

    if (!title) {
      setError('Please enter a job title.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEditOpen && editingJob) {
        const {
          data,
          error: updateError,
        } = await supabase
          .from('jobs')
          .update({
            title,
            description:
              jobForm.description?.trim() || null,
            location:
              jobForm.location?.trim() || null,
          })
          .eq('id', editingJob.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setJobs((previous) =>
          previous.map((job) =>
            job.id === editingJob.id
              ? data
              : job
          )
        );

        setSelectedJob((previous) =>
          previous?.id === editingJob.id
            ? data
            : previous
        );

        closeJobForm();
        return;
      }

      /* ----------------------------------------------------------------------
         POST JOB
      ---------------------------------------------------------------------- */

      const {
        data,
        error: insertError,
      } = await supabase
        .from('jobs')
        .insert({
          title,
          description:
            jobForm.description?.trim() || null,
          location:
            jobForm.location?.trim() || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setJobs((previous) => [
        data,
        ...previous,
      ]);

      setSelectedJob(data);
      setShowPipeline(true);
      setPipelineSearch('');

      closeJobForm();

      /*
       * The newly posted job has no candidates yet.
       * Candidates will appear once their candidates.job_id points to
       * this job.
       */
    } catch (err) {
      console.error('Save job error:', err);

      setError(
        err?.message || 'Unable to save this job.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================================
     PASTE JOB
  ========================================================================== */

  const handlePasteJob = async () => {
    if (!user?.id) {
      setError('You must be logged in to create a job.');
      return;
    }

    if (!pasteText.trim()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const parsed = parseJobPost(pasteText);

      const {
        data,
        error: insertError,
      } = await supabase
        .from('jobs')
        .insert({
          title: parsed.title,
          description: parsed.description,
          location: parsed.location,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setJobs((previous) => [
        data,
        ...previous,
      ]);

      setPasteText('');
      setIsPasteOpen(false);

      setSelectedJob(data);
      setShowPipeline(true);
      setPipelineSearch('');
    } catch (err) {
      console.error('Paste job error:', err);

      setError(
        err?.message || 'Unable to create pasted job.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================================
     DELETE JOB
  ========================================================================== */

  const confirmDeleteJob = (job) => {
    setJobToDelete(job);
    setIsDeleteOpen(true);
  };

  const deleteJob = async () => {
    if (!jobToDelete || !user?.id) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const {
        error: deleteError,
      } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete.id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setJobs((previous) =>
        previous.filter(
          (job) => job.id !== jobToDelete.id
        )
      );

      /*
       * Your candidates table has:
       *
       * candidates_job_id_fkey
       * ON DELETE SET NULL
       *
       * Therefore the database should automatically clear job_id.
       * We also update local state immediately.
       */
      setCandidates((previous) =>
        previous.map((candidate) =>
          candidate.job_id === jobToDelete.id
            ? {
                ...candidate,
                job_id: null,
              }
            : candidate
        )
      );

      if (selectedJob?.id === jobToDelete.id) {
        setSelectedJob(null);
        setShowPipeline(false);
      }

      setJobToDelete(null);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error('Delete job error:', err);

      setError(
        err?.message || 'Unable to delete this job.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================================
     OPEN PIPELINE
  ========================================================================== */

  const openPipeline = (job) => {
    setSelectedJob(job);
    setShowPipeline(true);
    setPipelineSearch('');
    setPipelineCandidate(null);
  };

  /* ==========================================================================
     CLOSE PIPELINE
  ========================================================================== */

  const closePipeline = () => {
    setShowPipeline(false);
    setPipelineCandidate(null);
    setPipelineSearch('');
  };

  /* ==========================================================================
     UPDATE CANDIDATE STAGE
  ========================================================================== */

  const updateCandidateStage = async (
    candidate,
    newStage
  ) => {
    if (!candidate?.id || !user?.id) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      /*
       * Keep shortlist and stage synchronized.
       *
       * If the candidate moves into Shortlisted, shortlisted = true.
       * If they move to another stage, shortlisted = false.
       */
      const nextShortlisted =
        newStage === 'shortlisted';

      const {
        data,
        error: updateError,
      } = await supabase
        .from('candidates')
        .update({
          stage: newStage,
          shortlisted: nextShortlisted,
        })
        .eq('id', candidate.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setCandidates((previous) =>
        previous.map((item) =>
          item.id === candidate.id
            ? data
            : item
        )
      );

      setPipelineCandidate(data);
    } catch (err) {
      console.error(
        'Update candidate stage error:',
        err
      );

      setError(
        err?.message ||
          'Unable to update candidate stage.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================================
     TOGGLE SHORTLIST
  ========================================================================== */

  const toggleShortlist = async (candidate) => {
    if (!candidate?.id || !user?.id) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const nextValue = !candidate.shortlisted;

      const nextStage = nextValue
        ? 'shortlisted'
        : candidate.stage === 'shortlisted'
        ? 'screening'
        : candidate.stage || 'sourced';

      const {
        data,
        error: updateError,
      } = await supabase
        .from('candidates')
        .update({
          shortlisted: nextValue,
          stage: nextStage,
        })
        .eq('id', candidate.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setCandidates((previous) =>
        previous.map((item) =>
          item.id === candidate.id
            ? data
            : item
        )
      );

      setPipelineCandidate(data);
    } catch (err) {
      console.error(
        'Toggle shortlist error:',
        err
      );

      setError(
        err?.message ||
          'Unable to update shortlist status.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================================
     AUTH LOADING
  ========================================================================== */

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-red-600 mx-auto mb-3" />

          <p className="text-gray-600">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     NOT LOGGED IN
  ========================================================================== */

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />

            <h2 className="text-xl font-bold mb-2">
              Login Required
            </h2>

            <p className="text-gray-500">
              Please log in to access your jobs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ==========================================================================
     MAIN UI
  ========================================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed((previous) => !previous)
        }
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed
            ? 'ml-20'
            : 'ml-64'
        }`}
      >
        <TopBar
          title="Jobs"
          subtitle="Manage your recruitment jobs, candidates and hiring pipeline"
        />

        <div className="p-8">
          {/* ------------------------------------------------------------------
             ERROR
          ------------------------------------------------------------------ */}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />

              <div className="flex-1">
                <p className="font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ------------------------------------------------------------------
             STATS
          ------------------------------------------------------------------ */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {stats.total}
                  </p>

                  <p className="text-sm text-gray-500">
                    Total Jobs
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <Circle className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {stats.open}
                  </p>

                  <p className="text-sm text-gray-500">
                    Active Jobs
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {stats.candidates}
                  </p>

                  <p className="text-sm text-gray-500">
                    Candidates
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ------------------------------------------------------------------
             CONTENT
          ------------------------------------------------------------------ */}

          <AnimatePresence mode="wait">
            {selectedJob ? (
              /* ================================================================
                 JOB DETAIL
              ================================================================= */
              <motion.div
                key="job-detail"
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -20,
                }}
                className="space-y-6"
              >
                {/* ------------------------------------------------------------
                   HEADER
                ------------------------------------------------------------ */}

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedJob(null);
                        setShowPipeline(false);
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold">
                          {selectedJob.title ||
                            'Untitled Job'}
                        </h2>

                        <Badge
                          className={
                            getStatusBadge('open').color
                          }
                        >
                          Open
                        </Badge>
                      </div>

                      <p className="text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />

                        {selectedJob.location ||
                          'Location not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={
                        showPipeline
                          ? 'default'
                          : 'outline'
                      }
                      className={
                        showPipeline
                          ? 'bg-red-600 hover:bg-red-700'
                          : ''
                      }
                      onClick={() =>
                        setShowPipeline((previous) => !previous)
                      }
                    >
                      <Users className="w-4 h-4 mr-2" />

                      {showPipeline
                        ? 'Hide Pipeline'
                        : 'View Pipeline'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        openEditJob(selectedJob)
                      }
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() =>
                        confirmDeleteJob(selectedJob)
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* ------------------------------------------------------------
                   JOB DETAILS + PIPELINE SUMMARY
                ------------------------------------------------------------ */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-sm lg:col-span-2">
                    <CardHeader>
                      <CardTitle>
                        Job Details
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Job Title
                          </p>

                          <p className="font-semibold">
                            {selectedJob.title || '—'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Location
                          </p>

                          <p className="font-semibold flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />

                            {selectedJob.location || '—'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Created
                          </p>

                          <p className="font-semibold flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />

                            {formatRelative(
                              selectedJob.created_at
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Job ID
                          </p>

                          <p className="font-mono text-xs text-gray-600 break-all">
                            {selectedJob.id}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>
                        Recruitment Pipeline
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Applicants
                        </span>

                        <span className="font-bold">
                          {selectedJobCandidates.length}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Shortlisted
                        </span>

                        <span className="font-bold">
                          {pipelineCounts.shortlisted}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Interviews
                        </span>

                        <span className="font-bold">
                          {pipelineCounts.interview}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Hired
                        </span>

                        <span className="font-bold text-green-600">
                          {pipelineCounts.hired}
                        </span>
                      </div>

                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() =>
                          openPipeline(selectedJob)
                        }
                      >
                        <Users className="w-4 h-4 mr-2" />
                        View Pipeline
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* ------------------------------------------------------------
                   DESCRIPTION
                ------------------------------------------------------------ */}

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>
                      Job Description
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {selectedJob.description ? (
                      <div className="flex gap-3">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />

                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selectedJob.description}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        No job description has been added yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* ------------------------------------------------------------
                   PIPELINE
                ------------------------------------------------------------ */}

                {showPipeline && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          Candidate Pipeline
                        </h3>

                        <p className="text-sm text-gray-500">
                          Candidates linked to this specific job.
                        </p>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                        <Input
                          placeholder="Search candidates..."
                          value={pipelineSearch}
                          onChange={(event) =>
                            setPipelineSearch(
                              event.target.value
                            )
                          }
                          className="pl-10 w-64 bg-white"
                        />
                      </div>
                    </div>

                    {candidatesLoading ? (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-10 text-center">
                          <RefreshCw className="w-7 h-7 animate-spin text-red-600 mx-auto mb-3" />

                          <p className="text-gray-500">
                            Loading candidates...
                          </p>
                        </CardContent>
                      </Card>
                    ) : selectedJobCandidates.length === 0 ? (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-10 text-center">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />

                          <h3 className="text-lg font-semibold text-gray-700">
                            No candidates linked to this job yet
                          </h3>

                          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
                            This job has been posted successfully.
                            Candidates will appear here when their{' '}
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded">
                              job_id
                            </code>{' '}
                            is set to this job's ID.
                          </p>

                          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-4 text-left max-w-2xl mx-auto">
                            <p className="text-sm font-semibold text-blue-800">
                              Job ID
                            </p>

                            <p className="text-xs font-mono text-blue-700 break-all mt-1">
                              {selectedJob.id}
                            </p>

                            <p className="text-xs text-blue-600 mt-2">
                              Your candidate upload/import flow should
                              save this value into candidates.job_id.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : pipelineFilteredCandidates.length === 0 ? (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-10 text-center">
                          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />

                          <h3 className="font-semibold text-gray-700">
                            No candidates found
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            Try a different candidate search.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {CANDIDATE_STAGES.map((stage) => {
                          const StageIcon = stage.icon;

                          const stageCandidates =
                            pipelineFilteredCandidates.filter(
                              (candidate) =>
                                (candidate.stage || 'sourced') ===
                                stage.value
                            );

                          return (
                            <Card
                              key={stage.value}
                              className="border-0 shadow-sm bg-white"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${stage.color}`}
                                    >
                                      <StageIcon className="w-4 h-4" />
                                    </div>

                                    <CardTitle className="text-sm">
                                      {stage.label}
                                    </CardTitle>
                                  </div>

                                  <Badge variant="secondary">
                                    {stageCandidates.length}
                                  </Badge>
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-3">
                                {stageCandidates.length === 0 ? (
                                  <div className="border border-dashed rounded-lg p-5 text-center">
                                    <p className="text-xs text-gray-400">
                                      No candidates
                                    </p>
                                  </div>
                                ) : (
                                  stageCandidates.map((candidate) => (
                                    <motion.div
                                      key={candidate.id}
                                      layout
                                      className="border rounded-xl p-4 hover:shadow-sm transition-shadow bg-white"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPipelineCandidate(candidate)
                                        }
                                        className="w-full text-left"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                                            <Users className="w-5 h-5" />
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <p className="font-semibold truncate">
                                              {candidate.name ||
                                                'Unnamed Candidate'}
                                            </p>

                                            <p className="text-xs text-gray-500 truncate mt-1">
                                              {candidate.title ||
                                                'Candidate'}
                                            </p>

                                            {candidate.location && (
                                              <p className="text-xs text-gray-400 truncate mt-1">
                                                {candidate.location}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                          <span className="text-xs text-gray-500">
                                            Match
                                          </span>

                                          <span className="text-xs font-semibold">
                                            {candidate.match_score ?? 0}%
                                          </span>
                                        </div>
                                      </button>

                                      <div className="mt-3">
                                        <Select
                                          value={
                                            candidate.stage ||
                                            'sourced'
                                          }
                                          onValueChange={(value) =>
                                            updateCandidateStage(
                                              candidate,
                                              value
                                            )
                                          }
                                          disabled={saving}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>

                                          <SelectContent>
                                            {CANDIDATE_STAGES.map(
                                              (option) => (
                                                <SelectItem
                                                  key={option.value}
                                                  value={option.value}
                                                >
                                                  {option.label}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </motion.div>
                                  ))
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* ================================================================
                 JOB LIST
              ================================================================= */
              <motion.div
                key="job-list"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
              >
                {/* ------------------------------------------------------------
                   SEARCH / FILTERS / ACTIONS
                ------------------------------------------------------------ */}

                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                      <Input
                        placeholder="Search jobs..."
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        className="pl-10 w-64 bg-white"
                      />
                    </div>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-36 bg-white">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">
                          All Status
                        </SelectItem>

                        <SelectItem value="open">
                          Open
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={locationFilter}
                      onValueChange={setLocationFilter}
                    >
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">
                          All Locations
                        </SelectItem>

                        {LOCATIONS.map((location) => (
                          <SelectItem
                            key={location}
                            value={location}
                          >
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        loadJobs();
                        loadCandidates();
                      }}
                      disabled={loading || candidatesLoading}
                    >
                      <RefreshCw
                        className={`w-4 h-4 mr-1 ${
                          loading || candidatesLoading
                            ? 'animate-spin'
                            : ''
                        }`}
                      />

                      Refresh
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setIsPasteOpen(true)
                      }
                      className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <ClipboardPaste className="w-4 h-4" />
                      Paste Job
                    </Button>

                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white gap-2"
                      onClick={openAddJob}
                    >
                      <Plus className="w-4 h-4" />
                      Post Job
                    </Button>
                  </div>
                </div>

                {/* ------------------------------------------------------------
                   LOADING
                ------------------------------------------------------------ */}

                {loading && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-red-600 mx-auto mb-3" />

                      <p className="text-gray-500">
                        Loading your jobs...
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* ------------------------------------------------------------
                   EMPTY
                ------------------------------------------------------------ */}

                {!loading &&
                  filteredJobs.length === 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-12 text-center">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />

                        <h3 className="font-semibold text-lg text-gray-700">
                          {jobs.length === 0
                            ? 'No jobs posted yet'
                            : 'No jobs found'}
                        </h3>

                        <p className="text-gray-400 mt-1 mb-5">
                          {jobs.length === 0
                            ? 'Post your first job to start building a candidate pipeline.'
                            : 'Try adjusting your search or filters.'}
                        </p>

                        {jobs.length === 0 && (
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={openAddJob}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Post Your First Job
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}

                {/* ------------------------------------------------------------
                   JOB CARDS
                ------------------------------------------------------------ */}

                {!loading &&
                  filteredJobs.length > 0 && (
                    <div className="space-y-4">
                      {filteredJobs.map((job, index) => {
                        const counts =
                          candidateCountsByJob[job.id] || {
                            total: 0,
                            shortlisted: 0,
                            interview: 0,
                            hired: 0,
                          };

                        return (
                          <motion.div
                            key={job.id}
                            initial={{
                              opacity: 0,
                              y: 15,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay: index * 0.03,
                            }}
                          >
                            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-5">
                                  <div className="w-14 h-14 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                                    <Briefcase className="w-7 h-7" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="text-xl font-bold">
                                        {job.title ||
                                          'Untitled Job'}
                                      </h3>

                                      <Badge
                                        className={
                                          getStatusBadge(
                                            'open'
                                          ).color
                                        }
                                      >
                                        Open
                                      </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />

                                        {job.location ||
                                          'Location not specified'}
                                      </span>

                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />

                                        {formatRelative(
                                          job.created_at
                                        )}
                                      </span>
                                    </div>

                                    {job.description && (
                                      <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                                        {job.description}
                                      </p>
                                    )}

                                    {/* Candidate statistics */}
                                    <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-lg font-bold">
                                          {counts.total}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                          Candidates
                                        </p>
                                      </div>

                                      <div className="bg-purple-50 rounded-lg p-3">
                                        <p className="text-lg font-bold">
                                          {counts.shortlisted}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                          Shortlisted
                                        </p>
                                      </div>

                                      <div className="bg-yellow-50 rounded-lg p-3">
                                        <p className="text-lg font-bold">
                                          {counts.interview}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                          Interviews
                                        </p>
                                      </div>

                                      <div className="bg-green-50 rounded-lg p-3">
                                        <p className="text-lg font-bold text-green-700">
                                          {counts.hired}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                          Hired
                                        </p>
                                      </div>
                                    </div>

                                    {/* No candidates warning */}
                                    {counts.total === 0 && (
                                      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                                        <p className="text-sm font-medium text-blue-800">
                                          Job posted — no candidates
                                          linked yet.
                                        </p>

                                        <p className="text-xs text-blue-600 mt-1">
                                          Link candidates to this job
                                          using the candidate's{' '}
                                          <code className="font-mono">
                                            job_id
                                          </code>
                                          .
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div
                                    className="flex flex-col gap-2"
                                    onClick={(event) =>
                                      event.stopPropagation()
                                    }
                                  >
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white gap-1"
                                      onClick={() =>
                                        setSelectedJob(job)
                                      }
                                    >
                                      View
                                      <ChevronRight className="w-4 h-4" />
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        openPipeline(job)
                                      }
                                    >
                                      <Users className="w-4 h-4 mr-1" />
                                      Pipeline
                                    </Button>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger
                                        asChild
                                      >
                                        <Button
                                          size="sm"
                                          variant="outline"
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>

                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setSelectedJob(job)
                                          }
                                        >
                                          View Details
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                          onClick={() =>
                                            openPipeline(job)
                                          }
                                        >
                                          View Pipeline
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                          onClick={() =>
                                            openEditJob(job)
                                          }
                                        >
                                          Edit Job
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onClick={() =>
                                            confirmDeleteJob(job)
                                          }
                                        >
                                          Delete Job
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* =========================================================================
         CANDIDATE DETAIL DIALOG
      ========================================================================= */}

      <Dialog
        open={!!pipelineCandidate}
        onOpenChange={(open) => {
          if (!open) {
            setPipelineCandidate(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          {pipelineCandidate && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {pipelineCandidate.name ||
                    'Candidate'}
                </DialogTitle>

                <DialogDescription>
                  {pipelineCandidate.title ||
                    'Candidate profile'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Current Stage
                  </p>

                  <Badge
                    className={
                      getStage(
                        pipelineCandidate.stage
                      ).color
                    }
                  >
                    {
                      getStage(
                        pipelineCandidate.stage
                      ).label
                    }
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Match Score
                  </p>

                  <p className="font-semibold">
                    {pipelineCandidate.match_score ?? 0}%
                  </p>
                </div>

                {pipelineCandidate.email && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Email
                    </p>

                    <p className="font-medium break-all">
                      {pipelineCandidate.email}
                    </p>
                  </div>
                )}

                {pipelineCandidate.phone && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Phone
                    </p>

                    <p className="font-medium">
                      {pipelineCandidate.phone}
                    </p>
                  </div>
                )}

                {pipelineCandidate.location && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Location
                    </p>

                    <p className="font-medium">
                      {pipelineCandidate.location}
                    </p>
                  </div>
                )}

                {pipelineCandidate.experience_years !==
                  null &&
                  pipelineCandidate.experience_years !==
                    undefined && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Experience
                      </p>

                      <p className="font-medium">
                        {pipelineCandidate.experience_years}{' '}
                        years
                      </p>
                    </div>
                  )}

                {pipelineCandidate.education && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Education
                    </p>

                    <p className="font-medium whitespace-pre-wrap">
                      {pipelineCandidate.education}
                    </p>
                  </div>
                )}

                {Array.isArray(
                  pipelineCandidate.skills
                ) &&
                  pipelineCandidate.skills.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-2">
                        Skills
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {pipelineCandidate.skills.map(
                          (skill, index) => (
                            <Badge
                              key={`${skill}-${index}`}
                              variant="secondary"
                            >
                              {skill}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              <div className="border-t pt-5">
                <Label className="mb-2 block">
                  Move Candidate
                </Label>

                <Select
                  value={
                    pipelineCandidate.stage ||
                    'sourced'
                  }
                  onValueChange={(value) =>
                    updateCandidateStage(
                      pipelineCandidate,
                      value
                    )
                  }
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {CANDIDATE_STAGES.map((stage) => (
                      <SelectItem
                        key={stage.value}
                        value={stage.value}
                      >
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    toggleShortlist(
                      pipelineCandidate
                    )
                  }
                  disabled={saving}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />

                  {pipelineCandidate.shortlisted
                    ? 'Remove Shortlist'
                    : 'Shortlist Candidate'}
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() =>
                    setPipelineCandidate(null)
                  }
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* =========================================================================
         PASTE JOB DIALOG
      ========================================================================= */}

      <Dialog
        open={isPasteOpen}
        onOpenChange={setIsPasteOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <ClipboardPaste className="w-5 h-5" />
              Paste Job Post
            </DialogTitle>

            <DialogDescription>
              Paste the full job advertisement and HireResQ
              will create a job record from it.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={pasteText}
              onChange={(event) =>
                setPasteText(event.target.value)
              }
              placeholder={`Paste the full job advert here...

Example:

Job Title: Senior Software Developer
Location: Johannesburg

Company: Example Company

We are looking for...

Requirements:
React
TypeScript
5+ years experience`}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasteText('');
                setIsPasteOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handlePasteJob}
              disabled={
                saving ||
                !pasteText.trim()
              }
            >
              {saving ? 'Posting...' : 'Post Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
         ADD / EDIT JOB DIALOG
      ========================================================================= */}

      <Dialog
        open={isAddOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeJobForm();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditOpen
                ? 'Edit Job'
                : 'Post New Job'}
            </DialogTitle>

            <DialogDescription>
              {isEditOpen
                ? 'Update this recruitment job.'
                : 'Post a job first, then link candidates to it through the recruitment pipeline.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Job title */}
            <div className="grid gap-2">
              <Label>
                Job Title *
              </Label>

              <Input
                value={jobForm.title}
                onChange={(event) =>
                  setJobForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label>
                Location
              </Label>

              <Select
                value={jobForm.location}
                onValueChange={(value) =>
                  setJobForm((previous) => ({
                    ...previous,
                    location: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {LOCATIONS.map((location) => (
                    <SelectItem
                      key={location}
                      value={location}
                    >
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job type */}
            <div className="grid gap-2">
              <Label>
                Job Type
              </Label>

              <Select
                value={jobForm.job_type}
                onValueChange={(value) =>
                  setJobForm((previous) => ({
                    ...previous,
                    job_type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Work mode */}
            <div className="grid gap-2">
              <Label>
                Work Mode
              </Label>

              <Select
                value={jobForm.work_mode}
                onValueChange={(value) =>
                  setJobForm((previous) => ({
                    ...previous,
                    work_mode: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {WORK_MODES.map((mode) => (
                    <SelectItem
                      key={mode}
                      value={mode}
                    >
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label>
                Job Description
              </Label>

              <Textarea
                value={jobForm.description}
                onChange={(event) =>
                  setJobForm((previous) => ({
                    ...previous,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Enter the complete job description, requirements and responsibilities..."
                className="min-h-[180px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeJobForm}
            >
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={saveJob}
              disabled={
                saving ||
                !jobForm.title.trim()
              }
            >
              {saving
                ? 'Saving...'
                : isEditOpen
                ? 'Save Changes'
                : 'Post Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
         DELETE DIALOG
      ========================================================================= */}

      <Dialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete Job
            </DialogTitle>

            <DialogDescription>
              This action cannot be undone. Candidates
              linked to this job will remain in your
              candidate database but become unassigned.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete{' '}
              <strong>
                {jobToDelete?.title ||
                  'this job'}
              </strong>
              ?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setIsDeleteOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={deleteJob}
              disabled={saving}
            >
              {saving
                ? 'Deleting...'
                : 'Delete Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
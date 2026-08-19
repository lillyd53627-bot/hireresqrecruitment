// src/pages/Dashboard/Dashboard.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { motion } from 'framer-motion';

import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  DollarSign,
  Loader2,
  RefreshCw,
  Star,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';

import { useNavigate } from 'react-router-dom';

import { supabase } from '@/lib/supabase';

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value) => {
  const number = Number(value || 0);

  if (Number.isNaN(number)) {
    return 'R 0';
  }

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(number);
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
    return 'Just now';
  }

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

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

const normalizeStatus = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
};

const getStatusColor = (status) => {
  const normalized = normalizeStatus(status);

  const colors = {
    active: 'bg-green-100 text-green-700',
    open: 'bg-green-100 text-green-700',
    shortlisted: 'bg-teal-100 text-teal-700',
    sourced: 'bg-gray-100 text-gray-700',
    applied: 'bg-blue-100 text-blue-700',
    screening: 'bg-purple-100 text-purple-700',
    interview: 'bg-yellow-100 text-yellow-700',
    interviewed: 'bg-yellow-100 text-yellow-700',
    offer: 'bg-orange-100 text-orange-700',
    hired: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-700',
    inactive: 'bg-gray-100 text-gray-700',
  };

  return colors[normalized] || 'bg-gray-100 text-gray-700';
};

const getCandidateStage = (candidate) => {
  if (candidate?.shortlisted === true) {
    return 'shortlisted';
  }

  return normalizeStatus(candidate?.stage || 'sourced');
};

const getCandidateName = (candidate) => {
  return candidate?.name || 'Unnamed Candidate';
};

const getJobTitle = (job) => {
  return job?.title || 'Untitled Job';
};

const getClientName = (client) => {
  return client?.company_name || 'Unnamed Client';
};

// ============================================================
// DASHBOARD
// ============================================================

export default function Dashboard() {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const realtimeChannelRef = useRef(null);

  const [queryStatus, setQueryStatus] = useState({
    profile: 'waiting',
    clients: 'waiting',
    jobs: 'waiting',
    candidates: 'waiting',
    subscriptions: 'waiting',
  });

  const [queryErrors, setQueryErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  // ==========================================================
  // CURRENT USER
  // ==========================================================

  const loadCurrentUser = useCallback(async () => {
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!data?.user) {
      throw new Error('No authenticated user found. Please sign in again.');
    }

    setCurrentUser(data.user);
    return data.user;
  }, []);

  // ==========================================================
  // PROFILE
  // ==========================================================

  const loadProfile = useCallback(async (userId) => {
    if (!userId) return null;

    setQueryStatus((previous) => ({ ...previous, profile: 'loading' }));

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('[Dashboard] Profile error:', profileError);
      setQueryStatus((previous) => ({ ...previous, profile: 'error' }));
      setQueryErrors((previous) => ({
        ...previous,
        profile: profileError.message,
      }));
      setProfile(null);
      return null;
    }

    setQueryStatus((previous) => ({
      ...previous,
      profile: data ? 'success' : 'empty',
    }));
    setProfile(data || null);
    return data || null;
  }, []);

  // ==========================================================
  // CLIENTS
  // ==========================================================

  const loadClients = useCallback(async (userId) => {
    setQueryStatus((previous) => ({ ...previous, clients: 'loading' }));

    const { data, error: clientsError } = await supabase
      .from('clients')
      .select(
        `
          id,
          user_id,
          company_name,
          contact_name,
          email,
          phone,
          status,
          notes,
          created_at,
          updated_at
        `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (clientsError) {
      console.error('[Dashboard] Clients error:', clientsError);
      setQueryStatus((previous) => ({ ...previous, clients: 'error' }));
      setQueryErrors((previous) => ({
        ...previous,
        clients: clientsError.message,
      }));
      setClients([]);
      return clientsError;
    }

    setQueryStatus((previous) => ({
      ...previous,
      clients: data?.length > 0 ? 'success' : 'empty',
    }));
    setClients(data || []);
    return null;
  }, []);

  // ==========================================================
  // JOBS
  // ==========================================================

  const loadJobs = useCallback(async (userId) => {
    setQueryStatus((previous) => ({ ...previous, jobs: 'loading' }));

    const { data, error: jobsError } = await supabase
      .from('jobs')
      .select(
        `
          id,
          title,
          description,
          location,
          created_at,
          user_id,
          client_id,
          employment_type,
          work_mode,
          status,
          salary,
          requirements,
          is_pasted,
          source
        `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('[Dashboard] Jobs error:', jobsError);
      setQueryStatus((previous) => ({ ...previous, jobs: 'error' }));
      setQueryErrors((previous) => ({
        ...previous,
        jobs: jobsError.message,
      }));
      setJobs([]);
      return jobsError;
    }

    setQueryStatus((previous) => ({
      ...previous,
      jobs: data?.length > 0 ? 'success' : 'empty',
    }));
    setJobs(data || []);
    return null;
  }, []);

  // ==========================================================
  // CANDIDATES
  // ==========================================================

  const loadCandidates = useCallback(async (userId) => {
    setQueryStatus((previous) => ({ ...previous, candidates: 'loading' }));

    const { data, error: candidatesError } = await supabase
      .from('candidates')
      .select(
        `
          id,
          name,
          title,
          location,
          cv_file_path,
          shortlisted,
          stage,
          match_score,
          created_at,
          updated_at,
          user_id,
          email,
          phone,
          experience,
          education,
          skills,
          notes,
          industry,
          salary,
          nationality,
          availability,
          job_id
        `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (candidatesError) {
      console.error('[Dashboard] Candidates error:', candidatesError);
      setQueryStatus((previous) => ({ ...previous, candidates: 'error' }));
      setQueryErrors((previous) => ({
        ...previous,
        candidates: candidatesError.message,
      }));
      setCandidates([]);
      return candidatesError;
    }

    setQueryStatus((previous) => ({
      ...previous,
      candidates: data?.length > 0 ? 'success' : 'empty',
    }));
    setCandidates(data || []);
    return null;
  }, []);

  // ==========================================================
  // SUBSCRIPTIONS
  // ==========================================================

  const loadSubscriptions = useCallback(async (userId) => {
    setQueryStatus((previous) => ({ ...previous, subscriptions: 'loading' }));

    const { data, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select(
        `
          id,
          user_id,
          plan_id,
          plan_name,
          amount,
          active_jobs_limit,
          candidate_matches_limit,
          status,
          starts_at,
          expires_at,
          paystack_reference,
          created_at,
          updated_at
        `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (subscriptionsError) {
      console.error('[Dashboard] Subscriptions error:', subscriptionsError);
      setQueryStatus((previous) => ({ ...previous, subscriptions: 'error' }));
      setQueryErrors((previous) => ({
        ...previous,
        subscriptions: subscriptionsError.message,
      }));
      setSubscriptions([]);
      return subscriptionsError;
    }

    setQueryStatus((previous) => ({
      ...previous,
      subscriptions: data?.length > 0 ? 'success' : 'empty',
    }));
    setSubscriptions(data || []);
    return null;
  }, []);

  // ==========================================================
  // LOAD EVERYTHING
  // ==========================================================

  const loadDashboardData = useCallback(
    async ({ initial = false } = {}) => {
      try {
        if (initial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);
        setQueryErrors({});

        const user = await loadCurrentUser();
        await loadProfile(user.id);

        const results = await Promise.all([
          loadClients(user.id),
          loadJobs(user.id),
          loadCandidates(user.id),
          loadSubscriptions(user.id),
        ]);

        const errors = results.filter(Boolean);

        if (errors.length > 0) {
          setError(errors.map((item) => item.message).join(' | '));
        }

        setLastUpdated(new Date());
      } catch (loadError) {
        console.error('[Dashboard] Fatal load error:', loadError);
        setError(loadError?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      loadCurrentUser,
      loadProfile,
      loadClients,
      loadJobs,
      loadCandidates,
      loadSubscriptions,
    ]
  );

  // ==========================================================
  // INITIALISE
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      if (!mounted) return;
      await loadDashboardData({ initial: true });
    };

    initialise();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setProfile(null);
          setClients([]);
          setJobs([]);
          setCandidates([]);
          setSubscriptions([]);
          setRealtimeConnected(false);
          return;
        }

        if (session?.user) {
          setCurrentUser(session.user);

          if (
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED' ||
            event === 'USER_UPDATED'
          ) {
            await loadDashboardData({ initial: false });
          }
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [loadDashboardData]);

  // ==========================================================
  // REALTIME
  // ==========================================================

  useEffect(() => {
    if (!currentUser?.id) {
      return undefined;
    }

    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    setRealtimeConnected(false);

    const channel = supabase.channel(
      `hire-resq-dashboard-${currentUser.id}`
    );

    realtimeChannelRef.current = channel;

    const handleChange = (payload, setter) => {
      if (!payload) return;

      const newRecord = payload.new;
      const oldRecord = payload.old;

      if (newRecord?.user_id && newRecord.user_id !== currentUser.id) {
        return;
      }

      if (payload.eventType === 'INSERT') {
        setter((previous) => {
          const exists = previous.some((item) => item.id === newRecord?.id);
          if (exists) return previous;
          return [newRecord, ...previous];
        });
      }

      if (payload.eventType === 'UPDATE') {
        setter((previous) =>
          previous.map((item) =>
            item.id === newRecord?.id ? { ...item, ...newRecord } : item
          )
        );
      }

      if (payload.eventType === 'DELETE') {
        setter((previous) =>
          previous.filter((item) => item.id !== oldRecord?.id)
        );
      }

      setLastUpdated(new Date());
    };

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `user_id=eq.${currentUser.id}`,
      },
      (payload) => handleChange(payload, setClients)
    );

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: `user_id=eq.${currentUser.id}`,
      },
      (payload) => handleChange(payload, setJobs)
    );

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'candidates',
        filter: `user_id=eq.${currentUser.id}`,
      },
      (payload) => handleChange(payload, setCandidates)
    );

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${currentUser.id}`,
      },
      (payload) => handleChange(payload, setSubscriptions)
    );

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${currentUser.id}`,
      },
      (payload) => {
        if (
          payload.eventType === 'INSERT' ||
          payload.eventType === 'UPDATE'
        ) {
          setProfile(payload.new);
        }

        if (payload.eventType === 'DELETE') {
          setProfile(null);
        }

        setLastUpdated(new Date());
      }
    );

    channel.subscribe((status, subscribeError) => {
      if (status === 'SUBSCRIBED') {
        setRealtimeConnected(true);
      }

      if (
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT' ||
        status === 'CLOSED'
      ) {
        setRealtimeConnected(false);
        console.error('[Dashboard Realtime]', status, subscribeError);
      }
    });

    return () => {
      setRealtimeConnected(false);
      supabase.removeChannel(channel);

      if (realtimeChannelRef.current === channel) {
        realtimeChannelRef.current = null;
      }
    };
  }, [currentUser?.id]);

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {
    const activeClients = clients.filter(
      (client) => normalizeStatus(client?.status) === 'active'
    ).length;

    const openJobs = jobs.filter(
      (job) => normalizeStatus(job?.status) === 'open'
    ).length;

    const totalCandidates = candidates.length;

    const shortlisted = candidates.filter(
      (candidate) =>
        candidate?.shortlisted === true ||
        normalizeStatus(candidate?.stage) === 'shortlisted'
    ).length;

    const sourced = candidates.filter(
      (candidate) => normalizeStatus(candidate?.stage) === 'sourced'
    ).length;

    const applied = candidates.filter(
      (candidate) => normalizeStatus(candidate?.stage) === 'applied'
    ).length;

    const screening = candidates.filter(
      (candidate) => normalizeStatus(candidate?.stage) === 'screening'
    ).length;

    const interview = candidates.filter((candidate) =>
      ['interview', 'interviewed'].includes(
        normalizeStatus(candidate?.stage)
      )
    ).length;

    const offer = candidates.filter(
      (candidate) => normalizeStatus(candidate?.stage) === 'offer'
    ).length;

    const hired = candidates.filter(
      (candidate) => normalizeStatus(candidate?.stage) === 'hired'
    ).length;

    const rejected = candidates.filter(
      (candidate) => normalizeStatus(candidate?.stage) === 'rejected'
    ).length;

    const activeSubscriptionsList = subscriptions.filter(
      (subscription) => normalizeStatus(subscription?.status) === 'active'
    );

    const totalRevenue = activeSubscriptionsList.reduce(
      (total, subscription) => {
        const amount = Number(subscription?.amount || 0);
        return total + (Number.isNaN(amount) ? 0 : amount);
      },
      0
    );

    return {
      totalClients: clients.length,
      activeClients,
      totalJobs: jobs.length,
      openJobs,
      totalCandidates,
      sourced,
      applied,
      screening,
      shortlisted,
      interview,
      offer,
      hired,
      rejected,
      totalRevenue,
      activeSubscriptions: activeSubscriptionsList.length,
    };
  }, [clients, jobs, candidates, subscriptions]);

  // ==========================================================
  // RECENT LISTS
  // ==========================================================

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort(
        (a, b) =>
          new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
      )
      .slice(0, 5);
  }, [jobs]);

  const recentCandidates = useMemo(() => {
    return [...candidates]
      .sort(
        (a, b) =>
          new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
      )
      .slice(0, 6);
  }, [candidates]);

  const recentClients = useMemo(() => {
    return [...clients]
      .sort(
        (a, b) =>
          new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
      )
      .slice(0, 4);
  }, [clients]);

  // ==========================================================
  // RENDER
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main
          className={`transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <TopBar title="Dashboard" subtitle="Loading live data..." />
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500">
                Loading your dashboard...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <TopBar
          title="Dashboard"
          subtitle={
            lastUpdated
              ? `Live overview · Updated ${lastUpdated.toLocaleTimeString('en-ZA')}`
              : 'Live overview'
          }
        />

        <div className="p-8 space-y-8">
          {/* HEADER ACTIONS */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome back
                {profile?.full_name ? `, ${profile.full_name}` : ''}
              </h2>
              <p className="text-sm text-gray-500">
                Live CRM overview powered by Supabase
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => loadDashboardData({ initial: false })}
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* ERROR */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">
                      Database warning
                    </p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* LIVE STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Active Clients',
                value: stats.activeClients,
                sub: `${stats.totalClients} total clients`,
                icon: Building2,
                color: 'bg-blue-50 text-blue-600',
              },
              {
                label: 'Open Jobs',
                value: stats.openJobs,
                sub: `${stats.totalJobs} total jobs`,
                icon: Briefcase,
                color: 'bg-green-50 text-green-600',
              },
              {
                label: 'Candidates',
                value: stats.totalCandidates,
                sub: `${stats.shortlisted} shortlisted`,
                icon: Users,
                color: 'bg-purple-50 text-purple-600',
              },
              {
                label: 'Hired',
                value: stats.hired,
                sub: `${stats.offer} offers`,
                icon: UserCheck,
                color: 'bg-red-50 text-red-600',
              },
            ].map((statistic, index) => (
              <motion.div
                key={statistic.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${statistic.color}`}
                    >
                      <statistic.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{statistic.value}</p>
                      <p className="text-sm font-medium text-gray-700">
                        {statistic.label}
                      </p>
                      <p className="text-xs text-gray-400">{statistic.sub}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* SUBSCRIPTION / ACCOUNT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  Subscription Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Active subscription amount
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Active Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.filter(
                  (subscription) =>
                    normalizeStatus(subscription?.status) === 'active'
                ).length > 0 ? (
                  (() => {
                    const activeSubscription = subscriptions.find(
                      (subscription) =>
                        normalizeStatus(subscription?.status) === 'active'
                    );

                    return (
                      <>
                        <p className="text-xl font-bold">
                          {activeSubscription?.plan_name ||
                            activeSubscription?.plan_id ||
                            'Active Plan'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatCurrency(activeSubscription?.amount)} / month
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {activeSubscription?.active_jobs_limit || 0} active
                          jobs ·{' '}
                          {activeSubscription?.candidate_matches_limit || 0}{' '}
                          candidate matches
                        </p>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <p className="text-xl font-bold">No Active Plan</p>
                    <p className="text-sm text-gray-500 mt-2">
                      No active subscription was found for this account.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Current Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">
                  {profile?.full_name ||
                    currentUser?.email ||
                    'Authenticated User'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Role:{' '}
                  <span className="font-semibold text-gray-700">
                    {profile?.role || 'User'}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CANDIDATE PIPELINE */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Candidate Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  ['sourced', 'Sourced', 'text-gray-600'],
                  ['applied', 'Applied', 'text-blue-600'],
                  ['screening', 'Screening', 'text-purple-600'],
                  ['shortlisted', 'Shortlisted', 'text-teal-600'],
                  ['interview', 'Interview', 'text-yellow-600'],
                  ['offer', 'Offer', 'text-orange-600'],
                  ['hired', 'Hired', 'text-green-600'],
                  ['rejected', 'Rejected', 'text-red-600'],
                ].map(([key, label, color]) => (
                  <div
                    key={key}
                    className="text-center bg-gray-50 rounded-lg p-3"
                  >
                    <p className={`text-xl font-bold ${color}`}>
                      {stats[key] || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RECENT JOBS / CANDIDATES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Jobs</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => navigate('/dashboard/jobs')}
                >
                  View all
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentJobs.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">
                    No jobs found for this account.
                  </p>
                ) : (
                  recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate('/dashboard/jobs')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {getJobTitle(job)}
                            </p>
                            <Badge className={getStatusColor(job?.status)}>
                              {job?.status || 'open'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {job?.location || 'Location not specified'}
                            {job?.work_mode ? ` · ${job.work_mode}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatRelative(job?.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Candidates</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => navigate('/dashboard/candidates')}
                >
                  View all
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentCandidates.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">
                    No candidates found for this account.
                  </p>
                ) : (
                  recentCandidates.map((candidate) => {
                    const stage = getCandidateStage(candidate);

                    return (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">
                                {getCandidateName(candidate)}
                              </p>
                              <Badge className={getStatusColor(stage)}>
                                {stage}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {candidate?.title ||
                                candidate?.industry ||
                                'Candidate'}
                              {candidate?.match_score
                                ? ` · ${candidate.match_score}% match`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatRelative(candidate?.created_at)}
                        </span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* RECENT CLIENTS */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Clients</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => navigate('/dashboard/clients')}
              >
                Open CRM
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentClients.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No clients found for this account.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {recentClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate('/dashboard/clients')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {getClientName(client)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(client?.status)}>
                              {client?.status || 'active'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {client?.contact_name && (
                        <p className="text-xs text-gray-500 mt-3 truncate">
                          Contact: {client.contact_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* QUICK ACTIONS */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  className="h-auto py-4 flex-col gap-2 bg-red-600 hover:bg-red-700"
                  onClick={() => navigate('/dashboard/jobs')}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-sm">Post Job</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/dashboard/candidates/add')}
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="text-sm">Add Applicant</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/dashboard/clients')}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm">Clients CRM</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/dashboard/aiclientfinder')}
                >
                  <Star className="w-5 h-5" />
                  <span className="text-sm">AI Client Finder</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* DATABASE STATUS */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Live Data Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  ['Profile', queryStatus.profile],
                  ['Clients', queryStatus.clients],
                  ['Jobs', queryStatus.jobs],
                  ['Candidates', queryStatus.candidates],
                  ['Subscriptions', queryStatus.subscriptions],
                ].map(([label, status]) => {
                  const key = label.toLowerCase();
                  const success = status === 'success';
                  const empty = status === 'empty';
                  const failed = status === 'error';

                  return (
                    <div
                      key={label}
                      className="rounded-lg border bg-gray-50 p-3"
                    >
                      <p className="text-xs text-gray-500">{label}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {success && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {empty && (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        )}
                        {failed && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        {status === 'loading' && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                        <span className="text-sm font-medium capitalize">
                          {status}
                        </span>
                      </div>
                      {queryErrors[key] && (
                        <p className="text-[11px] text-red-600 mt-2 break-words">
                          {queryErrors[key]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* FOOTER */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400 pb-4">
            <span
              className={`w-2 h-2 rounded-full ${
                realtimeConnected
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-yellow-500'
              }`}
            />
            <span>
              {realtimeConnected
                ? 'LIVE — Supabase Realtime'
                : 'Supabase Realtime connecting'}
            </span>
            {lastUpdated && (
              <span>
                · Updated {lastUpdated.toLocaleTimeString('en-ZA')}
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
# Dashboard.jsx
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

import { supabase } from '@/lib/supabaseClient';


// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'R 0';
  }

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(number);
};


const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days === 1) {
    return 'Yesterday';
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  if (days < 30) {
    return `${Math.floor(days / 7)} weeks ago`;
  }

  return formatDate(value);
};


const getStatusColor = (status) => {
  const normalized = String(
    status || ''
  )
    .toLowerCase()
    .replace(/\s+/g, '_');

  const colors = {
    active:
      'bg-green-100 text-green-700',

    open:
      'bg-green-100 text-green-700',

    shortlisted:
      'bg-teal-100 text-teal-700',

    applied:
      'bg-blue-100 text-blue-700',

    screening:
      'bg-purple-100 text-purple-700',

    interview:
      'bg-yellow-100 text-yellow-700',

    interviewed:
      'bg-yellow-100 text-yellow-700',

    offer:
      'bg-orange-100 text-orange-700',

    hired:
      'bg-green-100 text-green-700',

    rejected:
      'bg-red-100 text-red-700',

    cancelled:
      'bg-red-100 text-red-700',

    expired:
      'bg-gray-100 text-gray-700',

    inactive:
      'bg-gray-100 text-gray-700',
  };

  return (
    colors[normalized] ||
    'bg-gray-100 text-gray-700'
  );
};


const getCandidateStage = (candidate) => {
  if (candidate?.shortlisted === true) {
    return 'shortlisted';
  }

  return String(
    candidate?.stage || ''
  ).toLowerCase();
};


const getJobTitle = (job) => {
  return (
    job?.title ||
    'Untitled Job'
  );
};


const getCandidateName = (candidate) => {
  return (
    candidate?.name ||
    'Unnamed Candidate'
  );
};


const getClientName = (client) => {
  return (
    client?.company_name ||
    'Unnamed Client'
  );
};


const getRowDate = (row) => {
  return (
    row?.updated_at ||
    row?.created_at ||
    null
  );
};


// ============================================================
// COMPONENT
// ============================================================

export default function Dashboard() {
  const navigate = useNavigate();


  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);


  // ----------------------------------------------------------
  // AUTH
  // ----------------------------------------------------------

  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    profile,
    setProfile,
  ] = useState(null);


  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [
    clients,
    setClients,
  ] = useState([]);

  const [
    jobs,
    setJobs,
  ] = useState([]);

  const [
    candidates,
    setCandidates,
  ] = useState([]);

  const [
    subscriptions,
    setSubscriptions,
  ] = useState([]);


  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);


  // ----------------------------------------------------------
  // REALTIME
  // ----------------------------------------------------------

  const [
    realtimeConnected,
    setRealtimeConnected,
  ] = useState(false);

  const realtimeChannelRef =
    useRef(null);


  // ----------------------------------------------------------
  // DIAGNOSTICS
  // ----------------------------------------------------------

  const [
    queryStatus,
    setQueryStatus,
  ] = useState({
    clients: 'waiting',
    jobs: 'waiting',
    candidates: 'waiting',
    subscriptions: 'waiting',
    profile: 'waiting',
  });

  const [
    queryErrors,
    setQueryErrors,
  ] = useState({});

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);


  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  const loadCurrentUser =
    useCallback(async () => {
      const {
        data,
        error: authError,
      } =
        await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          `Authentication error: ${authError.message}`
        );
      }

      if (!data?.user) {
        throw new Error(
          'No authenticated user found. Please sign in again.'
        );
      }

      setCurrentUser(data.user);

      return data.user;
    }, []);


  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  const loadProfile =
    useCallback(async (userId) => {
      if (!userId) {
        return null;
      }

      setQueryStatus((previous) => ({
        ...previous,
        profile: 'loading',
      }));

      const {
        data,
        error: profileError,
      } =
        await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

      if (profileError) {
        console.error(
          '[Dashboard] Profile error:',
          profileError
        );

        setQueryStatus((previous) => ({
          ...previous,
          profile: 'error',
        }));

        setQueryErrors((previous) => ({
          ...previous,
          profile:
            profileError.message,
        }));

        setProfile(null);

        return null;
      }

      setQueryStatus((previous) => ({
        ...previous,
        profile: data
          ? 'success'
          : 'empty',
      }));

      setProfile(data || null);

      return data || null;
    }, []);


  // ==========================================================
  // LOAD USER-SCOPED TABLE
  // ==========================================================

  const loadTable =
    useCallback(
      async (
        tableName,
        setter,
        userId,
        options = {}
      ) => {
        const {
          orderColumn = 'created_at',
        } = options;

        if (!userId) {
          setter([]);

          setQueryStatus((previous) => ({
            ...previous,
            [tableName]: 'empty',
          }));

          return {
            data: [],
            error: null,
          };
        }

        setQueryStatus((previous) => ({
          ...previous,
          [tableName]: 'loading',
        }));

        const {
          data,
          error: tableError,
        } =
          await supabase
            .from(tableName)
            .select('*')
            .eq('user_id', userId)
            .order(orderColumn, {
              ascending: false,
            });

        if (tableError) {
          console.error(
            `[Dashboard] ${tableName} error:`,
            tableError
          );

          setQueryStatus((previous) => ({
            ...previous,
            [tableName]: 'error',
          }));

          setQueryErrors((previous) => ({
            ...previous,
            [tableName]:
              tableError.message,
          }));

          setter([]);

          return {
            data: [],
            error: tableError,
          };
        }

        setQueryStatus((previous) => ({
          ...previous,
          [tableName]:
            data?.length > 0
              ? 'success'
              : 'empty',
        }));

        setter(data || []);

        return {
          data: data || [],
          error: null,
        };
      },
      []
    );


  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  const loadDashboardData =
    useCallback(
      async ({
        initial = false,
      } = {}) => {
        try {
          if (initial) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError(null);
          setQueryErrors({});

          const user =
            await loadCurrentUser();

          await loadProfile(
            user.id
          );

          const results =
            await Promise.all([
              loadTable(
                'clients',
                setClients,
                user.id
              ),

              loadTable(
                'jobs',
                setJobs,
                user.id
              ),

              loadTable(
                'candidates',
                setCandidates,
                user.id
              ),

              loadTable(
                'subscriptions',
                setSubscriptions,
                user.id
              ),
            ]);

          const errors =
            results
              .map(
                (result) =>
                  result.error
              )
              .filter(Boolean);

          if (errors.length > 0) {
            setError(
              errors
                .map(
                  (item) =>
                    item.message
                )
                .join(' | ')
            );
          }

          setLastUpdated(
            new Date()
          );
        } catch (loadError) {
          console.error(
            '[Dashboard] Load error:',
            loadError
          );

          setError(
            loadError?.message ||
              'Unable to load dashboard data.'
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        loadCurrentUser,
        loadProfile,
        loadTable,
      ]
    );


  // ==========================================================
  // INITIALISE
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const initialise =
      async () => {
        if (!mounted) {
          return;
        }

        await loadDashboardData({
          initial: true,
        });
      };

    initialise();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {
          if (!mounted) {
            return;
          }

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
            setCurrentUser(
              session.user
            );

            if (
              event === 'SIGNED_IN' ||
              event === 'TOKEN_REFRESHED' ||
              event === 'USER_UPDATED'
            ) {
              await loadDashboardData({
                initial: false,
              });
            }
          }
        }
      );

    return () => {
      mounted = false;

      authListener?.subscription?.unsubscribe();
    };
  }, [
    loadDashboardData,
  ]);


  // ==========================================================
  // REALTIME
  // ==========================================================

  useEffect(() => {
    if (!currentUser?.id) {
      return undefined;
    }

    if (realtimeChannelRef.current) {
      supabase.removeChannel(
        realtimeChannelRef.current
      );

      realtimeChannelRef.current =
        null;
    }

    setRealtimeConnected(false);

    const channel =
      supabase.channel(
        `hire-resq-dashboard-${currentUser.id}`
      );

    realtimeChannelRef.current =
      channel;


    // --------------------------------------------------------
    // GENERIC REALTIME HANDLER
    // --------------------------------------------------------

    const handleChange =
      (
        payload,
        setter
      ) => {
        if (!payload) {
          return;
        }

        if (
          payload.eventType ===
          'INSERT'
        ) {
          setter((previous) => {
            const exists =
              previous.some(
                (item) =>
                  item.id ===
                  payload.new?.id
              );

            if (exists) {
              return previous;
            }

            return [
              payload.new,
              ...previous,
            ];
          });
        }

        if (
          payload.eventType ===
          'UPDATE'
        ) {
          setter((previous) =>
            previous.map(
              (item) =>
                item.id ===
                payload.new?.id
                  ? {
                      ...item,
                      ...payload.new,
                    }
                  : item
            )
          );
        }

        if (
          payload.eventType ===
          'DELETE'
        ) {
          setter((previous) =>
            previous.filter(
              (item) =>
                item.id !==
                payload.old?.id
            )
          );
        }

        setLastUpdated(
          new Date()
        );
      };


    // --------------------------------------------------------
    // JOBS
    // --------------------------------------------------------

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: `user_id=eq.${currentUser.id}`,
      },
      (payload) => {
        handleChange(
          payload,
          setJobs
        );
      }
    );


    // --------------------------------------------------------
    // CANDIDATES
    // --------------------------------------------------------

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'candidates',
        filter: `user_id=eq.${currentUser.id}`,
      },
      (payload) => {
        handleChange(
          payload,
          setCandidates
        );
      }
    );


    // --------------------------------------------------------
    // CLIENTS
    // --------------------------------------------------------

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `user_id=eq.${currentUser.id}`,
      },
      (payload) => {
        handleChange(
          payload,
          setClients
        );
      }
    );


    // --------------------------------------------------------
    // SUBSCRIPTIONS
    // --------------------------------------------------------

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${currentUser.id}`,
      },
      (payload) => {
        handleChange(
          payload,
          setSubscriptions
        );
      }
    );


    // --------------------------------------------------------
    // PROFILE
    // --------------------------------------------------------

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
          payload.eventType ===
            'INSERT' ||
          payload.eventType ===
            'UPDATE'
        ) {
          setProfile(
            payload.new
          );
        }

        if (
          payload.eventType ===
          'DELETE'
        ) {
          setProfile(null);
        }

        setLastUpdated(
          new Date()
        );
      }
    );


    // --------------------------------------------------------
    // SUBSCRIBE
    // --------------------------------------------------------

    channel.subscribe(
      (status, subscribeError) => {
        if (
          status ===
          'SUBSCRIBED'
        ) {
          setRealtimeConnected(true);
        }

        if (
          status ===
            'CHANNEL_ERROR' ||
          status ===
            'TIMED_OUT' ||
          status ===
            'CLOSED'
        ) {
          setRealtimeConnected(false);

          console.error(
            '[Dashboard Realtime]',
            status,
            subscribeError
          );
        }
      }
    );


    return () => {
      setRealtimeConnected(false);

      supabase.removeChannel(
        channel
      );

      if (
        realtimeChannelRef.current ===
        channel
      ) {
        realtimeChannelRef.current =
          null;
      }
    };
  }, [
    currentUser?.id,
  ]);


  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {

    const activeClients =
      clients.filter(
        (client) =>
          String(
            client?.status || ''
          ).toLowerCase() ===
          'active'
      ).length;


    const openJobs =
      jobs.filter(
        (job) =>
          String(
            job?.status || ''
          ).toLowerCase() ===
          'open'
      ).length;


    const shortlisted =
      candidates.filter(
        (candidate) =>
          candidate?.shortlisted ===
            true ||
          String(
            candidate?.stage || ''
          ).toLowerCase() ===
            'shortlisted'
      ).length;


    const applied =
      candidates.filter(
        (candidate) =>
          String(
            candidate?.stage || ''
          ).toLowerCase() ===
          'applied'
      ).length;


    const screening =
      candidates.filter(
        (candidate) =>
          String(
            candidate?.stage || ''
          ).toLowerCase() ===
          'screening'
      ).length;


    const interview =
      candidates.filter(
        (candidate) =>
          [
            'interview',
            'interviewed',
          ].includes(
            String(
              candidate?.stage || ''
            ).toLowerCase()
          )
      ).length;


    const offer =
      candidates.filter(
        (candidate) =>
          String(
            candidate?.stage || ''
          ).toLowerCase() ===
          'offer'
      ).length;


    const hired =
      candidates.filter(
        (candidate) =>
          String(
            candidate?.stage || ''
          ).toLowerCase() ===
          'hired'
      ).length;


    const rejected =
      candidates.filter(
        (candidate) =>
          String(
            candidate?.stage || ''
          ).toLowerCase() ===
          'rejected'
      ).length;


    const totalRevenue =
      subscriptions.reduce(
        (
          total,
          subscription
        ) => {
          const amount =
            Number(
              subscription?.amount
            );

          return (
            total +
            (
              Number.isFinite(
                amount
              )
                ? amount
                : 0
            )
          );
        },
        0
      );


    const activeSubscriptions =
      subscriptions.filter(
        (subscription) =>
          String(
            subscription?.status ||
              ''
          ).toLowerCase() ===
          'active'
      ).length;


    const currentSubscription =
      [...subscriptions]
        .filter(
          (subscription) =>
            String(
              subscription?.status ||
                ''
            ).toLowerCase() ===
            'active'
        )
        .sort(
          (a, b) =>
            new Date(
              b?.created_at || 0
            ) -
            new Date(
              a?.created_at || 0
            )
        )[0] || null;


    return {
      totalClients:
        clients.length,

      activeClients,

      totalJobs:
        jobs.length,

      openJobs,

      totalCandidates:
        candidates.length,

      shortlisted,

      applied,

      screening,

      interview,

      offer,

      hired,

      rejected,

      totalRevenue,

      activeSubscriptions,

      currentSubscription,
    };

  }, [
    clients,
    jobs,
    candidates,
    subscriptions,
  ]);


  // ==========================================================
  // RECENT JOBS
  // ==========================================================

  const recentJobs =
    useMemo(() => {
      return [...jobs]
        .sort(
          (a, b) =>
            new Date(
              getRowDate(b) || 0
            ) -
            new Date(
              getRowDate(a) || 0
            )
        )
        .slice(0, 5);
    }, [jobs]);


  // ==========================================================
  // RECENT CANDIDATES
  // ==========================================================

  const recentCandidates =
    useMemo(() => {
      return [...candidates]
        .sort(
          (a, b) =>
            new Date(
              getRowDate(b) || 0
            ) -
            new Date(
              getRowDate(a) || 0
            )
        )
        .slice(0, 6);
    }, [candidates]);


  // ==========================================================
  // RECENT CLIENTS
  // ==========================================================

  const recentClients =
    useMemo(() => {
      return [...clients]
        .sort(
          (a, b) =>
            new Date(
              getRowDate(b) || 0
            ) -
            new Date(
              getRowDate(a) || 0
            )
        )
        .slice(0, 8);
    }, [clients]);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <Sidebar
          isCollapsed={
            sidebarCollapsed
          }
          onToggle={() =>
            setSidebarCollapsed(
              (value) => !value
            )
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
            title="Dashboard"
            subtitle="Loading your live HireResQ data..."
          />

          <div className="min-h-[70vh] flex items-center justify-center">

            <div className="text-center">

              <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />

              <h2 className="text-xl font-semibold">
                Loading Dashboard
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Authenticating and loading your account data...
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }


  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar
        isCollapsed={
          sidebarCollapsed
        }
        onToggle={() =>
          setSidebarCollapsed(
            (value) => !value
          )
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
          title="Dashboard"
          subtitle={
            profile?.role
              ? `${profile.role} · Live overview`
              : 'Live overview'
          }
        />


        <div className="p-8 space-y-8">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <h1 className="text-2xl font-bold">
                Welcome back
                {profile?.full_name
                  ? `, ${profile.full_name}`
                  : ''}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {currentUser?.email}
              </p>

            </div>


            <div className="flex items-center gap-4">

              <div className="flex items-center gap-2">

                {realtimeConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />

                    <span className="text-sm font-semibold text-green-700">
                      LIVE
                    </span>

                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-600" />

                    <span className="text-sm font-semibold text-yellow-700">
                      Connecting
                    </span>
                  </>
                )}

              </div>


              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  loadDashboardData({
                    initial: false,
                  })
                }
                disabled={refreshing}
              >

                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }`}
                />

                {refreshing
                  ? 'Refreshing...'
                  : 'Refresh'}

              </Button>

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <Card className="border-red-200 bg-red-50">

              <CardContent className="p-5">

                <div className="flex items-start gap-3">

                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />

                  <div>

                    <p className="font-semibold text-red-800">
                      Unable to load some dashboard data
                    </p>

                    <p className="text-sm text-red-700 mt-1">
                      {error}
                    </p>

                    <p className="text-xs text-red-600 mt-2">
                      Please refresh the dashboard or check your Supabase policies.
                    </p>

                  </div>

                </div>

              </CardContent>

            </Card>
          )}


          {/* =================================================
              PRIMARY STATS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {[
              {
                label:
                  'Active Clients',

                value:
                  stats.activeClients,

                sub:
                  `${stats.totalClients} total`,

                icon:
                  Building2,

                color:
                  'bg-blue-50 text-blue-600',
              },

              {
                label:
                  'Open Jobs',

                value:
                  stats.openJobs,

                sub:
                  `${stats.totalJobs} total`,

                icon:
                  Briefcase,

                color:
                  'bg-green-50 text-green-600',
              },

              {
                label:
                  'Candidates',

                value:
                  stats.totalCandidates,

                sub:
                  `${stats.shortlisted} shortlisted`,

                icon:
                  Users,

                color:
                  'bg-purple-50 text-purple-600',
              },

              {
                label:
                  'Hired',

                value:
                  stats.hired,

                sub:
                  `${stats.offer} offers`,

                icon:
                  UserCheck,

                color:
                  'bg-red-50 text-red-600',
              },
            ].map(
              (
                statistic,
                index
              ) => (
                <motion.div
                  key={
                    statistic.label
                  }
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.05,
                  }}
                >

                  <Card className="border-0 shadow-sm">

                    <CardContent className="p-5 flex items-center gap-4">

                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${statistic.color}`}
                      >

                        <statistic.icon className="w-6 h-6" />

                      </div>

                      <div>

                        <p className="text-2xl font-bold">
                          {statistic.value}
                        </p>

                        <p className="text-sm font-medium text-gray-700">
                          {statistic.label}
                        </p>

                        <p className="text-xs text-gray-400">
                          {statistic.sub}
                        </p>

                      </div>

                    </CardContent>

                  </Card>

                </motion.div>
              )
            )}

          </div>


          {/* =================================================
              ACCOUNT / SUBSCRIPTION
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


            {/* REVENUE */}

            <Card className="border-0 shadow-sm">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <DollarSign className="w-5 h-5 text-red-600" />

                  Subscription Revenue

                </CardTitle>

              </CardHeader>

              <CardContent>

                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(
                    stats.totalRevenue
                  )}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Subscription records for this account
                </p>

              </CardContent>

            </Card>


            {/* ACTIVE SUBSCRIPTION */}

            <Card className="border-0 shadow-sm">

              <CardHeader>

                <CardTitle className="flex items-center gap-2">

                  <CreditCard className="w-5 h-5 text-blue-600" />

                  Current Plan

                </CardTitle>

              </CardHeader>

              <CardContent>

                {stats.currentSubscription ? (
                  <>
                    <p className="text-2xl font-bold">
                      {
                        stats
                          .currentSubscription
                          .plan_name
                      }
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {
                        formatCurrency(
                          stats
                            .currentSubscription
                            .amount
                        )
                      }
                      {' / 30 days'}
                    </p>

                    <Badge
                      className="mt-3 bg-green-100 text-green-700"
                    >
                      Active
                    </Badge>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      No active plan
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      No active subscription found.
                    </p>
                  </>
                )}

              </CardContent>

            </Card>


            {/* ACCOUNT */}

            <Card className="border-0 shadow-sm">

              <CardHeader>

                <CardTitle>
                  Current Account
                </CardTitle>

              </CardHeader>

              <CardContent>

                <p className="font-semibold">
                  {
                    profile?.full_name ||
                    currentUser?.email ||
                    'Authenticated User'
                  }
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Role:{' '}
                  <span className="font-semibold text-gray-700">
                    {
                      profile?.role ||
                      'User'
                    }
                  </span>
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Account ID:{' '}
                  {currentUser?.id}
                </p>

              </CardContent>

            </Card>

          </div>


          {/* =================================================
              CANDIDATE PIPELINE
          ================================================= */}

          <Card className="border-0 shadow-sm">

            <CardHeader>

              <CardTitle>
                Candidate Pipeline
              </CardTitle>

            </CardHeader>

            <CardContent>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">

                {[
                  [
                    'applied',
                    'Applied',
                    'text-blue-600',
                  ],

                  [
                    'screening',
                    'Screening',
                    'text-purple-600',
                  ],

                  [
                    'shortlisted',
                    'Shortlisted',
                    'text-teal-600',
                  ],

                  [
                    'interview',
                    'Interview',
                    'text-yellow-600',
                  ],

                  [
                    'offer',
                    'Offer',
                    'text-orange-600',
                  ],

                  [
                    'hired',
                    'Hired',
                    'text-green-600',
                  ],

                  [
                    'rejected',
                    'Rejected',
                    'text-red-600',
                  ],
                ].map(
                  ([
                    key,
                    label,
                    color,
                  ]) => (
                    <div
                      key={key}
                      className="text-center bg-gray-50 rounded-lg p-3"
                    >

                      <p
                        className={`text-xl font-bold ${color}`}
                      >
                        {stats[key] || 0}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {label}
                      </p>

                    </div>
                  )
                )}

              </div>

            </CardContent>

          </Card>


          {/* =================================================
              RECENT JOBS / CANDIDATES
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


            {/* JOBS */}

            <Card className="border-0 shadow-sm">

              <CardHeader className="flex flex-row items-center justify-between">

                <CardTitle>
                  Recent Jobs
                </CardTitle>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() =>
                    navigate(
                      '/dashboard/jobs'
                    )
                  }
                >

                  View all

                  <ChevronRight className="w-4 h-4 ml-1" />

                </Button>

              </CardHeader>


              <CardContent className="space-y-3">

                {recentJobs.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-6">
                    No jobs found for this account.
                  </p>
                )}


                {recentJobs.map(
                  (job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        navigate(
                          '/dashboard/jobs'
                        )
                      }
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">

                          <Briefcase className="w-5 h-5 text-red-600" />

                        </div>


                        <div className="min-w-0">

                          <p className="font-medium truncate">
                            {
                              getJobTitle(
                                job
                              )
                            }
                          </p>

                          <p className="text-xs text-gray-500 truncate">
                            {
                              job?.location ||
                              'Location not specified'
                            }
                          </p>

                        </div>

                      </div>


                      <div className="text-right flex-shrink-0">

                        <Badge
                          className={getStatusColor(
                            job?.status
                          )}
                        >
                          {
                            job?.status ||
                            'unknown'
                          }
                        </Badge>

                        <p className="text-xs text-gray-400 mt-1">
                          {
                            formatRelative(
                              getRowDate(job)
                            )
                          }
                        </p>

                      </div>

                    </div>
                  )
                )}

              </CardContent>

            </Card>


            {/* CANDIDATES */}

            <Card className="border-0 shadow-sm">

              <CardHeader className="flex flex-row items-center justify-between">

                <CardTitle>
                  Recent Candidates
                </CardTitle>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() =>
                    navigate(
                      '/dashboard/candidates'
                    )
                  }
                >

                  View all

                  <ChevronRight className="w-4 h-4 ml-1" />

                </Button>

              </CardHeader>


              <CardContent className="space-y-3">

                {recentCandidates.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-6">
                    No candidates found for this account.
                  </p>
                )}


                {recentCandidates.map(
                  (candidate) => {

                    const stage =
                      getCandidateStage(
                        candidate
                      );

                    return (
                      <div
                        key={
                          candidate.id
                        }
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50"
                      >

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">

                            <Users className="w-5 h-5 text-purple-600" />

                          </div>


                          <div className="min-w-0">

                            <div className="flex items-center gap-2">

                              <p className="font-medium truncate">
                                {
                                  getCandidateName(
                                    candidate
                                  )
                                }
                              </p>

                              {stage && (
                                <Badge
                                  className={getStatusColor(
                                    stage
                                  )}
                                >
                                  {stage}
                                </Badge>
                              )}

                            </div>


                            <p className="text-xs text-gray-500 truncate">
                              {
                                candidate?.title ||
                                candidate?.industry ||
                                'Candidate'
                              }
                            </p>

                          </div>

                        </div>


                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {
                            formatRelative(
                              getRowDate(
                                candidate
                              )
                            )
                          }
                        </span>

                      </div>
                    );
                  }
                )}

              </CardContent>

            </Card>

          </div>


          {/* =================================================
              CLIENTS
          ================================================= */}

          <Card className="border-0 shadow-sm">

            <CardHeader className="flex flex-row items-center justify-between">

              <CardTitle>
                Clients
              </CardTitle>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() =>
                  navigate(
                    '/dashboard/clients'
                  )
                }
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

                  {recentClients.map(
                    (client) => (
                      <div
                        key={
                          client.id
                        }
                        className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        onClick={() =>
                          navigate(
                            '/dashboard/clients'
                          )
                        }
                      >

                        <div className="flex items-center gap-3">

                          <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />

                          <div className="min-w-0">

                            <p className="font-medium truncate">
                              {
                                getClientName(
                                  client
                                )
                              }
                            </p>

                            <p className="text-xs text-gray-500 truncate">
                              {
                                client?.contact_name ||
                                'No contact assigned'
                              }
                            </p>

                            <Badge
                              className={`mt-2 ${getStatusColor(
                                client?.status
                              )}`}
                            >
                              {
                                client?.status ||
                                'unknown'
                              }
                            </Badge>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>

              )}

            </CardContent>

          </Card>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <Card className="border-0 shadow-sm">

            <CardHeader>

              <CardTitle>
                Quick Actions
              </CardTitle>

            </CardHeader>


            <CardContent>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">


                {/* POST JOB */}

                <Button
                  className="h-auto py-4 flex-col gap-2 bg-red-600 hover:bg-red-700"
                  onClick={() =>
                    navigate(
                      '/dashboard/jobs'
                    )
                  }
                >

                  <Briefcase className="w-5 h-5" />

                  <span className="text-sm">
                    Post Job
                  </span>

                </Button>


                {/* ADD APPLICANT */}

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() =>
                    navigate(
                      '/dashboard/candidates'
                    )
                  }
                >

                  <UserPlus className="w-5 h-5" />

                  <span className="text-sm">
                    Add Applicant
                  </span>

                </Button>


                {/* CLIENT CRM */}

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() =>
                    navigate(
                      '/dashboard/clients'
                    )
                  }
                >

                  <Building2 className="w-5 h-5" />

                  <span className="text-sm">
                    Clients CRM
                  </span>

                </Button>


                {/* AI CLIENT FINDER */}

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() =>
                    navigate(
                      '/dashboard/aiclientfinder'
                    )
                  }
                >

                  <Star className="w-5 h-5" />

                  <span className="text-sm">
                    AI Client Finder
                  </span>

                </Button>

              </div>

            </CardContent>

          </Card>


          {/* =================================================
              LIVE CONNECTION
          ================================================= */}

          <Card className="border-0 shadow-sm">

            <CardContent className="p-4">

              <div className="flex flex-wrap items-center justify-between gap-3">

                <div className="flex items-center gap-2">

                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      realtimeConnected
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-yellow-500'
                    }`}
                  />

                  <span className="text-sm font-medium">

                    {realtimeConnected
                      ? 'Live data connected'
                      : 'Connecting to live data'}

                  </span>

                </div>


                <div className="flex items-center gap-3 text-xs text-gray-400">

                  <span>
                    Clients: {clients.length}
                  </span>

                  <span>
                    Jobs: {jobs.length}
                  </span>

                  <span>
                    Candidates: {candidates.length}
                  </span>

                  {lastUpdated && (
                    <span>
                      Updated{' '}
                      {lastUpdated.toLocaleTimeString(
                        'en-ZA'
                      )}
                    </span>
                  )}

                </div>

              </div>

            </CardContent>

          </Card>


          {/* =================================================
              FOOTER
          ================================================= */}

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
                · Updated{' '}
                {lastUpdated.toLocaleTimeString(
                  'en-ZA'
                )}
              </span>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}
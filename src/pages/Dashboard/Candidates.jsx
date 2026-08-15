import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';

import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

import { Checkbox } from '@/components/ui/checkbox';

import {
  Search,
  Users,
  UserCheck,
  Clock,
  BriefcaseBusiness,
  UserPlus,
  X,
  RefreshCw,
  Filter,
  FileText,
  Eye,
  ChevronDown,
  ClipboardList,
  UserRound,
} from 'lucide-react';

import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

import { Slider } from '@/components/ui/slider';

import { supabase } from '@/lib/supabase';

import CandidateDetailsDialog from '@/components/candidates/CandidateDetailsDialog';


// ============================================================
// STATUS OPTIONS
// ============================================================

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];


// ============================================================
// HELPERS
// ============================================================

const getOwnerId = (candidate) =>
  candidate?.assigned_user_id ||
  candidate?.user_id ||
  candidate?.owner_id ||
  candidate?.created_by ||
  null;


const getJobTitle = (candidate) =>
  candidate?.job_title ||
  candidate?.jobTitle ||
  candidate?.position ||
  candidate?.applied_for ||
  candidate?.target_role ||
  '';


const normaliseStatus = (status) => {
  const value = String(status || 'new')
    .toLowerCase()
    .trim();

  return STATUS_OPTIONS.some(
    (item) => item.value === value
  )
    ? value
    : 'new';
};


const statusLabel = (status) =>
  STATUS_OPTIONS.find(
    (item) => item.value === normaliseStatus(status)
  )?.label || 'New';


// ============================================================
// COMPONENT
// ============================================================

export default function Candidates() {
  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [previewCv, setPreviewCv] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // USER / VIEW
  // ----------------------------------------------------------

  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState('mine');

  // ----------------------------------------------------------
  // FILTERS
  // ----------------------------------------------------------

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [jobFilter, setJobFilter] = useState('ALL');

  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [education, setEducation] = useState('ALL');

  const [gender, setGender] = useState([]);
  const [ethnicity, setEthnicity] = useState([]);

  const [age, setAge] = useState([18, 64]);
  const [salary, setSalary] = useState([0, 3000000]);

  const [showFilters, setShowFilters] = useState(true);

  // ----------------------------------------------------------
  // SELECTION / ACTIONS
  // ----------------------------------------------------------

  const [selectedIds, setSelectedIds] = useState([]);

  const [savingAssignment, setSavingAssignment] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [assignmentMessage, setAssignmentMessage] =
    useState('');

  const [statusMessage, setStatusMessage] =
    useState('');

  const fileInputRef = useRef(null);


  // ==========================================================
  // SOUTH AFRICAN LOCATIONS
  // ==========================================================

  const locations = {
    'Eastern Cape': [
      'ALL',
      'Gqeberha (Port Elizabeth)',
      'East London (eMonti)',
      'Makhanda (Grahamstown)',
      'Mthatha (Umtata)',
      'Queenstown (Komani)',
      'Graaff-Reinet',
      'Port Alfred',
      'Jeffreys Bay',
      'Kariega (Uitenhage)',
      'Butterworth (Gcuwa)',
      'Bhisho',
    ],

    'Free State': [
      'ALL',
      'Bloemfontein',
      'Botshabelo',
      'Welkom',
      'Virginia',
      'Odendaalsrus',
      'Bethlehem',
      'Kroonstad',
      'Sasolburg',
      'Parys',
      'Phuthaditjhaba',
      'Harrismith',
    ],

    Gauteng: [
      'ALL',
      'Johannesburg',
      'Pretoria (Tshwane)',
      'Soweto',
      'Germiston',
      'Boksburg',
      'Benoni',
      'Brakpan',
      'Randburg',
      'Roodepoort',
      'Vereeniging',
      'Vanderbijlpark',
      'Krugersdorp',
      'Springs',
      'Carletonville',
    ],

    'KwaZulu-Natal': [
      'ALL',
      'Durban',
      'Pietermaritzburg',
      'Newcastle',
      'Richards Bay',
      'Ladysmith',
      'Port Shepstone',
      'Ballito',
      'Umhlanga',
      'Pinetown',
      'Vryheid',
    ],

    Limpopo: [
      'ALL',
      'Polokwane',
      'Tzaneen',
      'Lephalale (Ellisras)',
      'Mokopane (Potgietersrus)',
      'Musina (Messina)',
      'Thohoyandou',
      'Phalaborwa',
      'Bela-Bela (Warmbaths)',
    ],

    Mpumalanga: [
      'ALL',
      'Mbombela (Nelspruit)',
      'Witbank (eMalahleni)',
      'Middelburg',
      'Secunda',
      'Ermelo',
      'Barberton',
      'Lydenburg',
      'Hazyview',
      'White River',
    ],

    'North West': [
      'ALL',
      'Mahikeng',
      'Rustenburg',
      'Potchefstroom',
      'Klerksdorp',
      'Brits',
      'Lichtenburg',
      'Hartbeespoort',
      'Mmabatho',
    ],

    'Northern Cape': [
      'ALL',
      'Kimberley',
      'Upington',
      'Springbok',
      'Kathu',
      'Kuruman',
      'De Aar',
      'Calvinia',
      'Prieska',
    ],

    'Western Cape': [
      'ALL',
      'Cape Town',
      'Stellenbosch',
      'Paarl',
      'George',
      'Worcester',
      'Mossel Bay',
      'Knysna',
      'Hermanus',
      'Somerset West',
      'Bellville',
      'Strand',
      'Saldanha',
    ],
  };


  // ==========================================================
  // FETCH CANDIDATES
  // ==========================================================

  const fetchCandidates = useCallback(async () => {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error(
        'Supabase candidates error:',
        error
      );

      setAssignmentMessage(
        `Could not load candidates: ${error.message}`
      );

      setCandidates([]);
    } else {
      setCandidates(data || []);
    }

    setLoading(false);
  }, []);


  // ==========================================================
  // INITIALISE
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          'Auth error:',
          authError
        );
      }

      if (mounted) {
        setCurrentUser(
          authData?.user || null
        );
      }

      await fetchCandidates();
    };

    initialise();


    // Realtime candidate updates
    const channel = supabase
      .channel('candidates-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
        },
        () => {
          fetchCandidates();
        }
      )
      .subscribe();


    return () => {
      mounted = false;

      supabase.removeChannel(channel);
    };
  }, [fetchCandidates]);


  // ==========================================================
  // JOB LIST
  // ==========================================================

  const jobs = useMemo(() => {
    return [
      ...new Set(
        candidates
          .map(getJobTitle)
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [candidates]);


  // ==========================================================
  // MY CANDIDATES
  // ==========================================================

  const myCandidates = useMemo(() => {
    if (!currentUser?.id) {
      return candidates;
    }

    const mine = candidates.filter(
      (candidate) =>
        getOwnerId(candidate) ===
        currentUser.id
    );

    const unassigned = candidates.filter(
      (candidate) =>
        !getOwnerId(candidate)
    );

    return [
      ...mine,
      ...unassigned,
    ];
  }, [
    candidates,
    currentUser,
  ]);


  const baseCandidates =
    viewMode === 'mine'
      ? myCandidates
      : candidates;


  // ==========================================================
  // FILTERED CANDIDATES
  // ==========================================================

  const filtered = useMemo(() => {
    const term =
      search
        .toLowerCase()
        .trim();

    return baseCandidates.filter(
      (candidate) => {
        const haystack = [
          candidate.title,
          candidate.name,
          candidate.location,
          candidate.city,
          candidate.province,
          candidate.skills,
          candidate.education,
          candidate.email,
          candidate.phone,
          getJobTitle(candidate),
          candidate.notes,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();


        const candidateAge =
          Number(candidate.age);


        const candidateSalary =
          Number(
            String(
              candidate.salary ?? ''
            ).replace(
              /[^0-9.]/g,
              ''
            )
          );


        return (
          (!term ||
            haystack.includes(term)) &&

          (
            province === 'ALL' ||
            candidate.province === province
          ) &&

          (
            city === 'ALL' ||
            candidate.city === city ||
            candidate.location === city
          ) &&

          (
            education === 'ALL' ||
            String(
              candidate.education || ''
            )
              .toLowerCase()
              .includes(
                education.toLowerCase()
              )
          ) &&

          (
            gender.length === 0 ||
            gender.includes(
              candidate.gender
            )
          ) &&

          (
            ethnicity.length === 0 ||
            ethnicity.includes(
              candidate.ethnicity
            )
          ) &&

          (
            !candidateAge ||
            (
              candidateAge >= age[0] &&
              candidateAge <= age[1]
            )
          ) &&

          (
            !candidateSalary ||
            (
              candidateSalary >= salary[0] &&
              candidateSalary <= salary[1]
            )
          ) &&

          (
            statusFilter === 'ALL' ||
            normaliseStatus(
              candidate.status
            ) === statusFilter
          ) &&

          (
            jobFilter === 'ALL' ||
            getJobTitle(candidate) ===
              jobFilter
          )
        );
      }
    );
  }, [
    baseCandidates,
    search,
    province,
    city,
    education,
    gender,
    ethnicity,
    age,
    salary,
    statusFilter,
    jobFilter,
  ]);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats = useMemo(() => ({
    total: baseCandidates.length,

    new: baseCandidates.filter(
      (candidate) =>
        normaliseStatus(
          candidate.status
        ) === 'new'
    ).length,

    screening: baseCandidates.filter(
      (candidate) =>
        normaliseStatus(
          candidate.status
        ) === 'screening'
    ).length,

    shortlisted: baseCandidates.filter(
      (candidate) =>
        normaliseStatus(
          candidate.status
        ) === 'shortlisted'
    ).length,

    interview: baseCandidates.filter(
      (candidate) =>
        normaliseStatus(
          candidate.status
        ) === 'interview'
    ).length,

    hired: baseCandidates.filter(
      (candidate) =>
        normaliseStatus(
          candidate.status
        ) === 'hired'
    ).length,
  }), [baseCandidates]);


  // ==========================================================
  // KEEP SELECTION VALID
  // ==========================================================

  useEffect(() => {
    setSelectedIds((previous) =>
      previous.filter((id) =>
        filtered.some(
          (candidate) =>
            candidate.id === id
        )
      )
    );
  }, [filtered]);


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch('');
    setProvince('ALL');
    setCity('ALL');
    setEducation('ALL');

    setGender([]);
    setEthnicity([]);

    setAge([18, 64]);
    setSalary([0, 3000000]);

    setStatusFilter('ALL');
    setJobFilter('ALL');
  };


  // ==========================================================
  // SELECT CANDIDATE
  // ==========================================================

  const toggleCandidate = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter(
            (candidateId) =>
              candidateId !== id
          )
        : [
            ...previous,
            id,
          ]
    );
  };


  // ==========================================================
  // SELECT ALL
  // ==========================================================

  const toggleAllVisible = () => {
    const ids =
      filtered.map(
        (candidate) =>
          candidate.id
      );

    const allSelected =
      ids.length > 0 &&
      ids.every(
        (id) =>
          selectedIds.includes(id)
      );


    setSelectedIds((previous) =>
      allSelected
        ? previous.filter(
            (id) =>
              !ids.includes(id)
          )
        : [
            ...new Set([
              ...previous,
              ...ids,
            ]),
          ]
    );
  };


  // ==========================================================
  // ASSIGN SELECTED TO CURRENT USER
  // ==========================================================

  const assignSelectedToCurrentUser =
    async () => {
      if (
        !currentUser?.id ||
        selectedIds.length === 0
      ) {
        return;
      }

      setSavingAssignment(true);
      setAssignmentMessage('');


      const { error } =
        await supabase
          .from('candidates')
          .update({
            assigned_user_id:
              currentUser.id,
          })
          .in(
            'id',
            selectedIds
          );


      if (error) {
        console.error(
          'Assignment error:',
          error
        );

        setAssignmentMessage(
          `Could not assign candidates: ${error.message}. Confirm that candidates.assigned_user_id exists and your RLS policy allows updates.`
        );
      } else {
        setCandidates(
          (previous) =>
            previous.map(
              (candidate) =>
                selectedIds.includes(
                  candidate.id
                )
                  ? {
                      ...candidate,
                      assigned_user_id:
                        currentUser.id,
                    }
                  : candidate
            )
        );

        setAssignmentMessage(
          `${selectedIds.length} candidate${
            selectedIds.length === 1
              ? ''
              : 's'
          } assigned to you.`
        );

        setSelectedIds([]);
        setViewMode('mine');
      }


      setSavingAssignment(false);
    };


  // ==========================================================
  // UPDATE SELECTED STATUS
  // ==========================================================

  const updateSelectedStatus =
    async (newStatus) => {
      if (
        selectedIds.length === 0
      ) {
        return;
      }

      setUpdatingStatus(true);
      setStatusMessage('');


      const { error } =
        await supabase
          .from('candidates')
          .update({
            status: newStatus,
            updated_at:
              new Date().toISOString(),
          })
          .in(
            'id',
            selectedIds
          );


      if (error) {
        console.error(
          'Status update error:',
          error
        );

        setStatusMessage(
          `Could not update status: ${error.message}`
        );
      } else {
        setCandidates(
          (previous) =>
            previous.map(
              (candidate) =>
                selectedIds.includes(
                  candidate.id
                )
                  ? {
                      ...candidate,
                      status: newStatus,
                    }
                  : candidate
            )
        );

        setStatusMessage(
          `${selectedIds.length} candidate${
            selectedIds.length === 1
              ? ''
              : 's'
          } moved to ${statusLabel(
            newStatus
          )}.`
        );

        setSelectedIds([]);
      }


      setUpdatingStatus(false);
    };


  // ==========================================================
  // UPDATE SINGLE STATUS
  // ==========================================================

  const updateSingleCandidateStatus =
    async (
      candidate,
      newStatus
    ) => {
      const { error } =
        await supabase
          .from('candidates')
          .update({
            status: newStatus,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            candidate.id
          );


      if (error) {
        console.error(
          'Candidate status update error:',
          error
        );

        setStatusMessage(
          `Could not update ${
            candidate.name ||
            'candidate'
          }: ${error.message}`
        );

        return;
      }


      setCandidates(
        (previous) =>
          previous.map(
            (item) =>
              item.id === candidate.id
                ? {
                    ...item,
                    status: newStatus,
                  }
                : item
          )
      );


      setStatusMessage(
        `${
          candidate.name ||
          'Candidate'
        } moved to ${statusLabel(
          newStatus
        )}.`
      );
    };


  // ==========================================================
  // SAVE SEARCH
  // ==========================================================

  const saveSearch = () => {
    const saved =
      JSON.parse(
        localStorage.getItem(
          'savedSearches'
        ) || '[]'
      );


    saved.push({
      search,
      province,
      city,
      education,
      status: statusFilter,
      job: jobFilter,
      savedAt:
        new Date().toISOString(),
    });


    localStorage.setItem(
      'savedSearches',
      JSON.stringify(saved)
    );


    setStatusMessage(
      'Search saved.'
    );
  };


  // ==========================================================
  // CV UPLOAD
  // ==========================================================

  const handleCVUpload =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }


      if (!currentUser?.id) {
        alert(
          'Please sign in before uploading a CV.'
        );

        return;
      }


      try {
        setUploading(true);

        event.target.value = '';


        const text =
          await file.text();


        const response =
          await fetch(
            'https://tlzipklqaxiupbhggbnm.functions.supabase.co/parse-cv',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                text,
              }),
            }
          );


        if (!response.ok) {
          throw new Error(
            `CV parser returned ${response.status}`
          );
        }


        const parsed =
          await response.json();


        if (
          !parsed ||
          parsed.error
        ) {
          throw new Error(
            parsed?.error ||
              'Failed to parse CV'
          );
        }


        const {
          data: inserted,
          error,
        } = await supabase
          .from('candidates')
          .insert([
            {
              name:
                parsed.name ||
                'Unknown',

              title:
                parsed.title ||
                '',

              location:
                parsed.location ||
                '',

              city:
                parsed.city ||
                '',

              province:
                parsed.province ||
                '',

              skills:
                Array.isArray(
                  parsed.skills
                )
                  ? parsed.skills.join(
                      ', '
                    )
                  : (
                      parsed.skills ||
                      ''
                    ),

              education:
                parsed.education ||
                '',

              gender:
                parsed.gender ||
                '',

              ethnicity:
                parsed.ethnicity ||
                '',

              age:
                parsed.age ||
                null,

              salary:
                parsed.salary ||
                null,

              status:
                'new',

              assigned_user_id:
                currentUser.id,

              created_by:
                currentUser.id,

              cv_file_name:
                file.name,
            },
          ])
          .select()
          .single();


        if (error) {
          throw error;
        }


        if (inserted) {
          setCandidates(
            (previous) => [
              inserted,
              ...previous,
            ]
          );
        }


        setStatusMessage(
          `CV parsed and ${
            parsed.name ||
            'candidate'
          } added to your dashboard.`
        );
      } catch (error) {
        console.error(
          'CV upload error:',
          error
        );

        alert(
          `Error uploading CV: ${
            error.message ||
            'Unknown error'
          }`
        );
      } finally {
        setUploading(false);
      }
    };


  // ==========================================================
  // FILTER COUNT
  // ==========================================================

  const activeFilterCount = [
    province !== 'ALL',
    city !== 'ALL',
    education !== 'ALL',
    gender.length > 0,
    ethnicity.length > 0,
    age[0] !== 18 ||
      age[1] !== 64,
    salary[0] !== 0 ||
      salary[1] !== 3000000,
    statusFilter !== 'ALL',
    jobFilter !== 'ALL',
  ].filter(Boolean).length;


  // ==========================================================
  // SELECTION STATE
  // ==========================================================

  const visibleIds =
    filtered.map(
      (candidate) =>
        candidate.id
    );


  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every(
      (id) =>
        selectedIds.includes(id)
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="w-full px-6 py-5">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Candidate Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Track, filter, assign and manage
              candidates across your recruitment
              pipeline.
            </p>
          </div>


          <Button
            variant="outline"
            onClick={fetchCandidates}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />

            Refresh
          </Button>

        </div>


        {/* ==================================================
            TABS
        ================================================== */}

        <Tabs
          value={viewMode}
          onValueChange={setViewMode}
        >

          <TabsList className="bg-gray-100">

            <TabsTrigger value="mine">
              <UserCheck className="w-4 h-4 mr-2" />
              My Candidates
            </TabsTrigger>


            <TabsTrigger value="all">
              <Users className="w-4 h-4 mr-2" />
              All Candidates
            </TabsTrigger>

          </TabsList>


          <TabsContent
            value={viewMode}
            className="mt-5 space-y-6"
          >

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

              {[
                [
                  'total',
                  'Total',
                  Users,
                  'bg-blue-50 text-blue-600',
                ],
                [
                  'new',
                  'New',
                  Clock,
                  'bg-gray-100 text-gray-600',
                ],
                [
                  'screening',
                  'Screening',
                  Search,
                  'bg-purple-50 text-purple-600',
                ],
                [
                  'shortlisted',
                  'Shortlisted',
                  UserCheck,
                  'bg-teal-50 text-teal-600',
                ],
                [
                  'interview',
                  'Interview',
                  BriefcaseBusiness,
                  'bg-yellow-50 text-yellow-600',
                ],
                [
                  'hired',
                  'Hired',
                  UserCheck,
                  'bg-green-50 text-green-600',
                ],
              ].map(
                ([
                  key,
                  label,
                  Icon,
                  cls,
                ]) => (

                  <Card
                    key={key}
                    className="border-0 shadow-sm"
                  >

                    <CardContent className="p-4">

                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${cls}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>


                      <p className="text-2xl font-bold mt-2">
                        {stats[key]}
                      </p>


                      <p className="text-xs text-gray-500">
                        {label}
                      </p>

                    </CardContent>

                  </Card>

                )
              )}

            </div>


            {/* ==================================================
                SEARCH + FILTER PANEL
            ================================================== */}

            <Card className="border-0 shadow-sm">

              <CardContent className="p-4 space-y-4">

                <div className="flex gap-3 flex-wrap items-center">

                  <div className="relative flex-1 min-w-[240px]">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <Input
                      placeholder="Search name, title, skills, email, location or job..."
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      className="pl-10"
                    />

                  </div>


                  <Button
                    variant={
                      showFilters
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setShowFilters(
                        (value) =>
                          !value
                      )
                    }
                  >

                    <Filter className="w-4 h-4 mr-2" />

                    Filters
                    {activeFilterCount
                      ? ` (${activeFilterCount})`
                      : ''}

                    <ChevronDown
                      className={`w-4 h-4 ml-2 transition-transform ${
                        showFilters
                          ? 'rotate-180'
                          : ''
                      }`}
                    />

                  </Button>


                  <Button
                    onClick={saveSearch}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Save Search
                  </Button>


                  <Button
                    onClick={clearFilters}
                    variant="outline"
                  >
                    Clear
                  </Button>


                  <Button
                    disabled={uploading}
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >

                    <FileText className="w-4 h-4 mr-2" />

                    {uploading
                      ? 'Parsing...'
                      : 'Upload CV'}

                  </Button>


                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCVUpload}
                    className="hidden"
                  />

                </div>


                {/* FILTERS */}

                {showFilters && (
                  <div className="border-t pt-4 space-y-5">

                    <div className="grid md:grid-cols-4 gap-3">

                      {/* Province */}

                      <Select
                        value={province}
                        onValueChange={(value) => {
                          setProvince(value);
                          setCity('ALL');
                        }}
                      >

                        <SelectTrigger>
                          <SelectValue placeholder="Province" />
                        </SelectTrigger>

                        <SelectContent>

                          <SelectItem value="ALL">
                            All provinces
                          </SelectItem>

                          {Object.keys(
                            locations
                          ).map(
                            (provinceName) => (
                              <SelectItem
                                key={provinceName}
                                value={provinceName}
                              >
                                {provinceName}
                              </SelectItem>
                            )
                          )}

                        </SelectContent>

                      </Select>


                      {/* City */}

                      <Select
                        value={city}
                        onValueChange={setCity}
                      >

                        <SelectTrigger>
                          <SelectValue placeholder="City" />
                        </SelectTrigger>

                        <SelectContent>

                          {(locations[
                            province
                          ] || ['ALL']).map(
                            (cityName) => (

                              <SelectItem
                                key={cityName}
                                value={cityName}
                              >
                                {cityName ===
                                'ALL'
                                  ? 'All cities'
                                  : cityName}
                              </SelectItem>

                            )
                          )}

                        </SelectContent>

                      </Select>


                      {/* Education */}

                      <Select
                        value={education}
                        onValueChange={
                          setEducation
                        }
                      >

                        <SelectTrigger>
                          <SelectValue placeholder="Education" />
                        </SelectTrigger>

                        <SelectContent>

                          {[
                            'ALL',
                            'Matric',
                            'Diploma',
                            'Bachelors',
                            'Masters',
                          ].map(
                            (value) => (

                              <SelectItem
                                key={value}
                                value={value}
                              >
                                {value ===
                                'ALL'
                                  ? 'All education'
                                  : value}
                              </SelectItem>

                            )
                          )}

                        </SelectContent>

                      </Select>


                      {/* Job */}

                      <Select
                        value={jobFilter}
                        onValueChange={
                          setJobFilter
                        }
                      >

                        <SelectTrigger>
                          <SelectValue placeholder="Job" />
                        </SelectTrigger>

                        <SelectContent>

                          <SelectItem value="ALL">
                            All jobs
                          </SelectItem>

                          {jobs.map(
                            (job) => (
                              <SelectItem
                                key={job}
                                value={job}
                              >
                                {job}
                              </SelectItem>
                            )
                          )}

                        </SelectContent>

                      </Select>

                    </div>


                    {/* Gender / Ethnicity */}

                    <div className="flex gap-2 flex-wrap">

                      {[
                        'Male',
                        'Female',
                      ].map(
                        (value) => (

                          <Button
                            key={value}
                            size="sm"
                            variant={
                              gender.includes(
                                value
                              )
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              setGender(
                                (previous) =>
                                  previous.includes(
                                    value
                                  )
                                    ? previous.filter(
                                        (item) =>
                                          item !==
                                          value
                                      )
                                    : [
                                        ...previous,
                                        value,
                                      ]
                              )
                            }
                          >
                            {value}
                          </Button>

                        )
                      )}


                      {[
                        'Black',
                        'White',
                        'Coloured',
                        'Indian',
                        'Chinese',
                        'Other',
                      ].map(
                        (value) => (

                          <Button
                            key={value}
                            size="sm"
                            variant={
                              ethnicity.includes(
                                value
                              )
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              setEthnicity(
                                (previous) =>
                                  previous.includes(
                                    value
                                  )
                                    ? previous.filter(
                                        (item) =>
                                          item !==
                                          value
                                      )
                                    : [
                                        ...previous,
                                        value,
                                      ]
                              )
                            }
                          >
                            {value}
                          </Button>

                        )
                      )}

                    </div>


                    {/* AGE / SALARY */}

                    <div className="grid md:grid-cols-2 gap-6">

                      <div>

                        <p className="text-sm font-medium mb-2">
                          Age: {age[0]} - {age[1]}
                        </p>

                        <Slider
                          value={age}
                          min={18}
                          max={64}
                          step={1}
                          onValueChange={
                            setAge
                          }
                        />

                      </div>


                      <div>

                        <p className="text-sm font-medium mb-2">
                          Salary: R
                          {salary[0].toLocaleString()}
                          {' - '}
                          R
                          {salary[1].toLocaleString()}
                        </p>

                        <Slider
                          value={salary}
                          min={0}
                          max={3000000}
                          step={50000}
                          onValueChange={
                            setSalary
                          }
                        />

                      </div>

                    </div>

                  </div>
                )}

              </CardContent>

            </Card>


            {/* ==================================================
                MESSAGES
            ================================================== */}

            {(assignmentMessage ||
              statusMessage) && (

              <div className="space-y-2">

                {[
                  assignmentMessage,
                  statusMessage,
                ]
                  .filter(Boolean)
                  .map(
                    (
                      message,
                      index
                    ) => (

                      <div
                        key={`${message}-${index}`}
                        className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"
                      >

                        <span>
                          {message}
                        </span>


                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              index === 0 &&
                              assignmentMessage
                            ) {
                              setAssignmentMessage(
                                ''
                              );
                            } else {
                              setStatusMessage(
                                ''
                              );
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>

                      </div>

                    )
                  )}

              </div>

            )}


            {/* ==================================================
                BULK ACTION BAR
            ================================================== */}

            <Card className="border-0 shadow-sm">

              <CardContent className="p-3">

                <div className="flex items-center justify-between gap-3 flex-wrap">

                  <div className="flex items-center gap-3">

                    <Checkbox
                      checked={
                        allVisibleSelected
                      }
                      onCheckedChange={
                        toggleAllVisible
                      }
                    />

                    <span className="text-sm font-medium">
                      {selectedIds.length
                        ? `${selectedIds.length} selected`
                        : 'Select candidates'}
                    </span>

                    <span className="text-xs text-gray-500">
                      Showing {filtered.length} of{' '}
                      {baseCandidates.length}
                    </span>

                  </div>


                  {selectedIds.length >
                    0 && (

                    <div className="flex items-center gap-2 flex-wrap">

                      {currentUser && (

                        <Button
                          size="sm"
                          disabled={
                            savingAssignment
                          }
                          onClick={
                            assignSelectedToCurrentUser
                          }
                          className="bg-red-600 hover:bg-red-700"
                        >

                          <UserPlus className="w-4 h-4 mr-2" />

                          {savingAssignment
                            ? 'Assigning...'
                            : 'Assign to me'}

                        </Button>

                      )}


                      <Select
                        disabled={
                          updatingStatus
                        }
                        onValueChange={
                          updateSelectedStatus
                        }
                      >

                        <SelectTrigger className="w-[170px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>

                        <SelectContent>

                          {STATUS_OPTIONS.map(
                            (option) => (

                              <SelectItem
                                key={
                                  option.value
                                }
                                value={
                                  option.value
                                }
                              >
                                Move to{' '}
                                {
                                  option.label
                                }
                              </SelectItem>

                            )
                          )}

                        </SelectContent>

                      </Select>


                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSelectedIds([])
                        }
                      >
                        Clear selection
                      </Button>

                    </div>

                  )}

                </div>

              </CardContent>

            </Card>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="flex items-center justify-between text-sm text-gray-500">

              <span>
                {viewMode === 'mine'
                  ? 'My dashboard'
                  : 'Team candidate pool'}
                {' · '}
                <strong>
                  {filtered.length}
                </strong>{' '}
                candidates
              </span>


              {currentUser && (
                <span>
                  Signed in as{' '}
                  <strong>
                    {currentUser.email ||
                      currentUser.id}
                  </strong>
                </span>
              )}

            </div>


            {/* ==================================================
                CANDIDATE LIST
            ================================================== */}

            <div className="grid gap-3">

              {loading ? (

                <Card className="border-0 shadow-sm">

                  <CardContent className="py-16 text-center text-gray-500">

                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />

                    Loading candidates...

                  </CardContent>

                </Card>

              ) : filtered.length > 0 ? (

                filtered.map(
                  (candidate) => {

                    const owner =
                      getOwnerId(
                        candidate
                      );

                    const isMine =
                      Boolean(
                        currentUser?.id &&
                        owner ===
                          currentUser.id
                      );

                    const selected =
                      selectedIds.includes(
                        candidate.id
                      );

                    const jobTitle =
                      getJobTitle(
                        candidate
                      );


                    return (

                      <Card
                        key={
                          candidate.id
                        }
                        className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                          selected
                            ? 'ring-2 ring-red-200'
                            : ''
                        }`}
                      >

                        <CardContent className="p-4">

                          <div className="flex items-start gap-3">

                            {/* CHECKBOX */}

                            <Checkbox
                              checked={
                                selected
                              }
                              onCheckedChange={() =>
                                toggleCandidate(
                                  candidate.id
                                )
                              }
                              className="mt-1"
                            />


                            {/* AVATAR */}

                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">

                              <UserRound className="w-5 h-5 text-red-600" />

                            </div>


                            {/* DETAILS */}

                            <div className="flex-1 min-w-0">

                              <div className="flex items-start justify-between gap-4">

                                <div className="min-w-0">

                                  <h3 className="font-bold truncate">
                                    {candidate.name ||
                                      'Unnamed Candidate'}
                                  </h3>

                                  <p className="text-sm text-gray-600 truncate">
                                    {candidate.title ||
                                      'No title'}
                                  </p>

                                </div>


                                {/* STATUS */}

                                <Select
                                  value={normaliseStatus(
                                    candidate.status
                                  )}
                                  onValueChange={(
                                    value
                                  ) =>
                                    updateSingleCandidateStatus(
                                      candidate,
                                      value
                                    )
                                  }
                                >

                                  <SelectTrigger className="w-[135px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>

                                  <SelectContent>

                                    {STATUS_OPTIONS.map(
                                      (
                                        option
                                      ) => (

                                        <SelectItem
                                          key={
                                            option.value
                                          }
                                          value={
                                            option.value
                                          }
                                        >
                                          {
                                            option.label
                                          }
                                        </SelectItem>

                                      )
                                    )}

                                  </SelectContent>

                                </Select>

                              </div>


                              {/* META */}

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3 text-xs text-gray-500">

                                <span>
                                  {candidate.city ||
                                    candidate.location ||
                                    'No location'}

                                  {candidate.province
                                    ? `, ${candidate.province}`
                                    : ''}
                                </span>


                                <span className="truncate">
                                  {candidate.email ||
                                    'No email'}
                                </span>


                                <span className="truncate">
                                  {jobTitle ||
                                    'No job linked'}
                                </span>


                                <span
                                  className={
                                    isMine
                                      ? 'text-green-600 font-medium'
                                      : ''
                                  }
                                >
                                  {isMine
                                    ? 'Assigned to me'
                                    : owner
                                      ? 'Assigned to another user'
                                      : 'Unassigned'}
                                </span>

                              </div>


                              {/* BADGES */}

                              <div className="flex items-center gap-2 mt-3 flex-wrap">

                                {candidate.skills && (

                                  <Badge
                                    variant="outline"
                                    className="max-w-[260px] truncate"
                                  >
                                    {candidate.skills}
                                  </Badge>

                                )}


                                {candidate.education && (

                                  <Badge variant="outline">
                                    {candidate.education}
                                  </Badge>

                                )}


                                {candidate.cv_file_path && (

                                  <Badge className="bg-green-100 text-green-700">

                                    <FileText className="w-3 h-3 mr-1" />

                                    CV

                                  </Badge>

                                )}

                              </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="flex items-center gap-2 flex-shrink-0">

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedCandidate(
                                    candidate
                                  )
                                }
                              >

                                <Eye className="w-4 h-4 mr-1" />

                                View

                              </Button>


                              {candidate.cv_file_path && (

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setPreviewCv(
                                      candidate.cv_file_path
                                    )
                                  }
                                >
                                  CV
                                </Button>

                              )}

                            </div>

                          </div>

                        </CardContent>

                      </Card>

                    );
                  }
                )

              ) : (

                <Card className="border-0 shadow-sm">

                  <CardContent className="text-center text-gray-500 py-16">

                    <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />

                    <p className="font-medium">
                      No candidates match your filters.
                    </p>

                    <p className="text-sm mt-1">
                      Try clearing filters or
                      switching between My Candidates
                      and All Candidates.
                    </p>

                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>

                  </CardContent>

                </Card>

              )}

            </div>

          </TabsContent>

        </Tabs>


        {/* ======================================================
            CV PREVIEW
        ====================================================== */}

        {previewCv && (

          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">

            <div className="bg-white w-full max-w-5xl h-[95vh] flex flex-col rounded-xl overflow-hidden">

              <div className="p-4 border-b flex justify-between items-center bg-gray-50">

                <h2 className="font-semibold">
                  CV Preview
                </h2>

                <Button
                  variant="outline"
                  onClick={() =>
                    setPreviewCv(null)
                  }
                >
                  Close
                </Button>

              </div>


              <iframe
                src={previewCv}
                className="flex-1 w-full border-0"
                title="CV Preview"
              />

            </div>

          </div>

        )}


        {/* ======================================================
            CANDIDATE DETAILS
        ====================================================== */}

        {selectedCandidate && (

          <CandidateDetailsDialog
            candidate={
              selectedCandidate
            }
            onClose={() =>
              setSelectedCandidate(
                null
              )
            }
          />

        )}

      </div>
    </div>
  );
}
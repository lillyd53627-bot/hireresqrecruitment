import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Users, UserCheck, Clock, BriefcaseBusiness, MoreHorizontal, UserPlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/supabase';
import CandidateDetailsDialog from '@/components/candidates/CandidateDetailsDialog';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewCv, setPreviewCv] = useState(null);

  // Per-user dashboard ownership / tracking
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState('mine');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [jobFilter, setJobFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState('');

  // Vacancy linking
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancyId, setSelectedVacancyId] = useState('');

  const fileInputRef = useRef(null);

  // FILTER STATES
  const [province, setProvince] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [education, setEducation] = useState('ALL');
  const [gender, setGender] = useState([]);
  const [ethnicity, setEthnicity] = useState([]);
  const [age, setAge] = useState([18, 64]);
  const [salary, setSalary] = useState([0, 3000000]);

  const locations = {
    'Eastern Cape': ['ALL', 'Gqeberha (Port Elizabeth)', 'East London (eMonti)', 'Makhanda (Grahamstown)', 'Mthatha (Umtata)', 'Queenstown (Komani)', 'Graaff-Reinet', 'Port Alfred', 'Jeffreys Bay', 'Kariega (Uitenhage)', 'Butterworth (Gcuwa)', 'Bhisho'],
    'Free State': ['ALL', 'Bloemfontein', 'Botshabelo', 'Welkom', 'Virginia', 'Odendaalsrus', 'Bethlehem', 'Kroonstad', 'Sasolburg', 'Parys', 'Phuthaditjhaba', 'Harrismith'],
    'Gauteng': ['ALL', 'Johannesburg', 'Pretoria (Tshwane)', 'Soweto', 'Germiston', 'Boksburg', 'Benoni', 'Brakpan', 'Randburg', 'Roodepoort', 'Vereeniging', 'Vanderbijlpark', 'Krugersdorp', 'Springs', 'Carletonville'],
    'KwaZulu-Natal': ['ALL', 'Durban', 'Pietermaritzburg', 'Newcastle', 'Richards Bay', 'Ladysmith', 'Port Shepstone', 'Ballito', 'Umhlanga', 'Pinetown', 'Vryheid'],
    'Limpopo': ['ALL', 'Polokwane', 'Tzaneen', 'Lephalale (Ellisras)', 'Mokopane (Potgietersrus)', 'Musina (Messina)', 'Thohoyandou', 'Phalaborwa', 'Bela-Bela (Warmbaths)'],
    'Mpumalanga': ['ALL', 'Mbombela (Nelspruit)', 'Witbank (eMalahleni)', 'Middelburg', 'Secunda', 'Ermelo', 'Barberton', 'Lydenburg', 'Hazyview', 'White River'],
    'North West': ['ALL', 'Mahikeng', 'Rustenburg', 'Potchefstroom', 'Klerksdorp', 'Brits', 'Lichtenburg', 'Hartbeespoort', 'Mmabatho'],
    'Northern Cape': ['ALL', 'Kimberley', 'Upington', 'Springbok', 'Kathu', 'Kuruman', 'De Aar', 'Calvinia', 'Prieska'],
    'Western Cape': ['ALL', 'Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Worcester', 'Mossel Bay', 'Knysna', 'Hermanus', 'Somerset West', 'Bellville', 'Strand', 'Saldanha']
  };

  // FETCH candidates + vacancies + current user
  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user || null;
      setCurrentUser(user);

      const { data, error } = await supabase.from('candidates').select('*');
      if (error) {
        console.error("Supabase error:", error);
        setCandidates([]);
        setFiltered([]);
      } else {
        console.log(`Fetched ${data?.length || 0} candidates`);
        setCandidates(data || []);
      }

      // Load open vacancies for the current recruiter
      if (user) {
        const { data: vacData } = await supabase
          .from('recruiter_vacancies')
          .select('id, title, location, status')
          .eq('recruiter_id', user.id)
          .order('created_at', { ascending: false });
        setVacancies(vacData || []);
      }
    };
    fetchData();
  }, []);

  const getOwnerId = (candidate) =>
    candidate.user_id ||
    candidate.assigned_user_id ||
    candidate.owner_id ||
    candidate.created_by ||
    null;

  const jobs = useMemo(() => {
    const values = candidates
      .map(c => c.job_title || c.jobTitle || c.position || c.applied_for)
      .filter(Boolean);
    return [...new Set(values)].sort();
  }, [candidates]);

  const myCandidates = useMemo(() => {
    if (!currentUser?.id) return candidates;
    const owned = candidates.filter(c => getOwnerId(c) === currentUser.id);
    const unassigned = candidates.filter(c => !getOwnerId(c));
    return [...owned, ...unassigned];
  }, [candidates, currentUser]);

  const baseCandidates = viewMode === 'mine' ? myCandidates : candidates;

  useEffect(() => {
    const term = search.toLowerCase().trim();
    const result = baseCandidates.filter(c => {
      const haystack = [
        c.title, c.name, c.location, c.city, c.province, c.skills,
        c.education, c.email, c.phone, c.job_title, c.jobTitle, c.position,
        c.applied_for
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = !term || haystack.includes(term);
      const matchesProvince = province === 'ALL' || c.province === province;
      const matchesCity = city === 'ALL' || c.city === city || c.location === city;
      const matchesEducation = education === 'ALL' || (c.education || '').toLowerCase().includes(education.toLowerCase());
      const matchesGender = gender.length === 0 || gender.includes(c.gender);
      const matchesEthnicity = ethnicity.length === 0 || ethnicity.includes(c.ethnicity);
      const candidateAge = Number(c.age);
      const matchesAge = !candidateAge || (candidateAge >= age[0] && candidateAge <= age[1]);
      const candidateSalary = Number(String(c.salary || '').replace(/[^0-9.]/g, ''));
      const matchesSalary = !candidateSalary || (candidateSalary >= salary[0] && candidateSalary <= salary[1]);
      const matchesStatus = statusFilter === 'ALL' || (c.status || 'new') === statusFilter;
      const candidateJob = c.job_title || c.jobTitle || c.position || c.applied_for;
      const matchesJob = jobFilter === 'ALL' || candidateJob === jobFilter;

      return matchesSearch && matchesProvince && matchesCity && matchesEducation &&
        matchesGender && matchesEthnicity && matchesAge && matchesSalary &&
        matchesStatus && matchesJob;
    });

    setFiltered(result);
    setSelectedIds(prev => prev.filter(id => result.some(c => c.id === id)));
  }, [search, baseCandidates, province, city, education, gender, ethnicity, age, salary, statusFilter, jobFilter]);

  const stats = useMemo(() => ({
    total: baseCandidates.length,
    new: baseCandidates.filter(c => (c.status || 'new') === 'new').length,
    screening: baseCandidates.filter(c => c.status === 'screening').length,
    shortlisted: baseCandidates.filter(c => c.status === 'shortlisted').length,
    interview: baseCandidates.filter(c => c.status === 'interview').length,
    hired: baseCandidates.filter(c => c.status === 'hired').length,
  }), [baseCandidates]);

  const toggleCandidate = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const assignSelectedToCurrentUser = async () => {
    if (!currentUser?.id || selectedIds.length === 0) return;
    setSavingAssignment(true);
    setAssignmentMessage('');
    const { error } = await supabase
      .from('candidates')
      .update({ assigned_user_id: currentUser.id })
      .in('id', selectedIds);

    if (error) {
      console.error('Assignment error:', error);
      setAssignmentMessage('Could not assign candidates. Add an assigned_user_id column to candidates if it does not exist.');
    } else {
      setCandidates(prev => prev.map(c =>
        selectedIds.includes(c.id) ? { ...c, assigned_user_id: currentUser.id } : c
      ));
      setAssignmentMessage(`${selectedIds.length} candidate${selectedIds.length === 1 ? '' : 's'} assigned to you.`);
      setSelectedIds([]);
      setViewMode('mine');
    }
    setSavingAssignment(false);
  };

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

  // CV UPLOAD – now links to selected vacancy
  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const text = await file.text();

      const response = await fetch(
        "https://tlzipklqaxiupbhggbnm.functions.supabase.co/parse-cv",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        }
      );

      const parsed = await response.json();

      if (!parsed || parsed.error) {
        alert("Failed to parse CV");
        return;
      }

      const chosenVacancy = vacancies.find(v => v.id === selectedVacancyId);

      const { error } = await supabase.from('candidates').insert([{
        name: parsed.name || "Unknown",
        title: parsed.title || "",
        location: parsed.location || "",
        city: parsed.city || "",
        province: parsed.province || "",
        skills: parsed.skills?.join(', ') || "",
        education: parsed.education || "",
        gender: parsed.gender || "",
        ethnicity: parsed.ethnicity || "",
        age: parsed.age || null,
        salary: parsed.salary || null,
        status: 'new',
        assigned_user_id: currentUser?.id || null,
        created_by: currentUser?.id || null,
        vacancy_id: selectedVacancyId || null,
        job_title: chosenVacancy?.title || parsed.title || null,
        applied_for: chosenVacancy?.title || null
      }]);

      if (error) {
        console.error(error);
        alert("Failed to save candidate");
        return;
      }

      alert("✅ CV parsed & candidate added" + (chosenVacancy ? ` → linked to “${chosenVacancy.title}”` : ""));
      // Refresh list without full page reload
      const { data } = await supabase.from('candidates').select('*');
      setCandidates(data || []);
      setSelectedVacancyId('');

    } catch (err) {
      console.error(err);
      alert("Error uploading CV");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCvPreview = (candidate) => {
    if (candidate.cv_file_path) {
      setPreviewCv(candidate.cv_file_path);
    } else {
      alert('No CV available for this candidate.');
    }
  };

  const saveSearch = () => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    saved.push({ search, province, city, education });
    localStorage.setItem('savedSearches', JSON.stringify(saved));
    alert("Search saved!");
  };

  const getVacancyTitle = (vacancyId) => {
    const v = vacancies.find(x => x.id === vacancyId);
    return v ? v.title : null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pl-72">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h1>
          <p className="text-sm text-gray-500">
            Track, filter and manage candidates. New candidates can be linked directly to a vacancy.
          </p>
        </div>
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="mine">My Candidates</TabsTrigger>
            <TabsTrigger value="all">All Candidates</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          ['total', 'Total', Users, 'bg-blue-50 text-blue-600'],
          ['new', 'New', Clock, 'bg-gray-100 text-gray-600'],
          ['screening', 'Screening', Search, 'bg-purple-50 text-purple-600'],
          ['shortlisted', 'Shortlisted', UserCheck, 'bg-teal-50 text-teal-600'],
          ['interview', 'Interview', BriefcaseBusiness, 'bg-yellow-50 text-yellow-600'],
          ['hired', 'Hired', UserCheck, 'bg-green-50 text-green-600'],
        ].map(([key, label, Icon, cls]) => (
          <Card key={key} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cls}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold mt-2">{stats[key]}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <Input
          placeholder="Search by title or name (e.g. sales manager, john)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <Button className="bg-blue-600 hover:bg-blue-700">Search</Button>
        <Button onClick={saveSearch} className="bg-red-600 hover:bg-red-700">Save Search</Button>
        <Button onClick={clearFilters} variant="outline">Clear Filters</Button>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {['ALL', 'new', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'].map(s =>
              <SelectItem key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</SelectItem>
            )}
          </SelectContent>
        </Select>

        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-[210px]"><SelectValue placeholder="Job" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All jobs</SelectItem>
            {jobs.map(job => <SelectItem key={job} value={job}>{job}</SelectItem>)}
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && currentUser && (
          <Button
            disabled={savingAssignment}
            onClick={assignSelectedToCurrentUser}
            className="bg-red-600 hover:bg-red-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {savingAssignment ? 'Assigning...' : `Assign ${selectedIds.length} to me`}
          </Button>
        )}
      </div>

      {/* Vacancy linker + CV Upload */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border">
        <div className="text-sm font-medium text-gray-700">Link new candidate to vacancy:</div>
        <Select value={selectedVacancyId} onValueChange={setSelectedVacancyId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select vacancy (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No vacancy yet</SelectItem>
            {vacancies.map(v => (
              <SelectItem key={v.id} value={v.id}>
                {v.title}{v.location ? ` · ${v.location}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          disabled={uploading}
          className="bg-green-600 hover:bg-green-700"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? 'Uploading...' : 'Upload CV & Add Candidate'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleCVUpload}
          className="hidden"
        />
        {selectedVacancyId && (
          <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
            Will be linked to selected vacancy
          </span>
        )}
      </div>

      {/* Location / education filters */}
      <div className="grid md:grid-cols-4 gap-4">
        <Select value={province} onValueChange={(value) => { setProvince(value); setCity('ALL'); }}>
          <SelectTrigger><SelectValue placeholder="Province" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ALL</SelectItem>
            {Object.keys(locations).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            {(locations[province] || ['ALL']).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={education} onValueChange={setEducation}>
          <SelectTrigger><SelectValue placeholder="Education" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ALL</SelectItem>
            <SelectItem value="Matric">Matric</SelectItem>
            <SelectItem value="Diploma">Diploma</SelectItem>
            <SelectItem value="Bachelors">Bachelors</SelectItem>
            <SelectItem value="Masters">Masters</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6 flex-wrap">
        {['Male', 'Female'].map(g => (
          <Button key={g} variant={gender.includes(g) ? 'default' : 'outline'}
            onClick={() => setGender(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}>
            {g}
          </Button>
        ))}
        {['Black','White','Coloured','Indian','Chinese','Other'].map(e => (
          <Button key={e} variant={ethnicity.includes(e) ? 'default' : 'outline'}
            onClick={() => setEthnicity(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])}>
            {e}
          </Button>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium">Age: {age[0]} - {age[1]}</p>
          <Slider value={age} min={18} max={64} step={1} onValueChange={setAge} />
        </div>
        <div>
          <p className="text-sm font-medium">Salary: R{salary[0].toLocaleString()} - R{salary[1].toLocaleString()}</p>
          <Slider value={salary} min={0} max={3000000} step={50000} onValueChange={setSalary} />
        </div>
      </div>

      {assignmentMessage && (
        <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <span>{assignmentMessage}</span>
          <Button variant="ghost" size="sm" onClick={() => setAssignmentMessage('')}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Showing <strong>{filtered.length}</strong> of {baseCandidates.length} candidates</span>
        {currentUser && <span>Dashboard: <strong>{currentUser.email || currentUser.id}</strong></span>}
      </div>

      {/* RESULTS */}
      <div className="grid gap-4">
        {Array.isArray(filtered) && filtered.length > 0 ? (
          filtered.map((c) => {
            const owner = getOwnerId(c);
            const isMine = currentUser?.id && owner === currentUser.id;
            const jobTitle = c.job_title || c.jobTitle || c.position || c.applied_for;
            const linkedVacancyTitle = c.vacancy_id ? getVacancyTitle(c.vacancy_id) : null;

            return (
              <Card key={c.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedIds.includes(c.id)}
                      onCheckedChange={() => toggleCandidate(c.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-bold truncate">{c.name || 'Unnamed Candidate'}</h3>
                          <p className="text-sm text-gray-600 truncate">{c.title || 'No title'}</p>
                        </div>
                        <Badge>{c.status || 'new'}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3 text-xs text-gray-500">
                        <span>{c.city || c.location || 'No location'}{c.province ? `, ${c.province}` : ''}</span>
                        <span>{c.email || 'No email'}</span>
                        <span>{jobTitle || 'No job linked'}</span>
                        <span className={isMine ? 'text-green-600 font-medium' : ''}>
                          {isMine ? 'Assigned to me' : owner ? 'Assigned to another user' : 'Unassigned'}
                        </span>
                      </div>
                      {linkedVacancyTitle && (
                        <div className="mt-2">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            Linked vacancy: {linkedVacancyTitle}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" onClick={() => setSelectedCandidate(c)}>
                        View
                      </Button>
                      {c.cv_file_path && (
                        <Button variant="outline" onClick={() => setPreviewCv(c.cv_file_path)}>
                          CV
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-12">
            No matches found.<br />
            Try searching for <strong>"sales"</strong> or <strong>"john"</strong>
          </p>
        )}
      </div>

      {/* CV Preview Modal */}
      {previewCv && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl h-[95vh] flex flex-col rounded-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold">CV Preview</h2>
              <Button variant="outline" onClick={() => setPreviewCv(null)}>Close</Button>
            </div>
            <iframe
              src={previewCv}
              className="flex-1 w-full border-0"
              title="CV Preview"
            />
          </div>
        </div>
      )}

      {selectedCandidate && (
        <CandidateDetailsDialog
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
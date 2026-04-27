import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
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

  const fileInputRef = useRef(null);

  // FILTER STATES (unchanged)
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

  // FETCH (unchanged)
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('candidates').select('*');
      if (error) console.error("Supabase error:", error);
      console.log(`✅ Fetched ${data?.length || 0} candidates`);
      if (data && data.length > 0) {
        console.log("Sample title:", data[0].title);
      }
      setCandidates(data || []);
      setFiltered(data || []);
    };
    fetchData();
  }, []);

  // SEARCH LOGIC (unchanged)
  useEffect(() => {
    if (!search.trim()) {
      setFiltered([...candidates]);
      return;
    }
    const term = search.toLowerCase().trim();
    console.log(`🔍 Searching for "${term}"`);
    const result = candidates.filter(c => {
      const title = (c.title || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      const location = (c.location || '').toLowerCase();
      const cityField = (c.city || '').toLowerCase();
      return title.includes(term) ||
             name.includes(term) ||
             location.includes(term) ||
             cityField.includes(term);
    });
    console.log(`Search returned ${result.length} results`);
    setFiltered(result);
  }, [search, candidates]);

  // CV UPLOAD - Your logic
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
        status: 'new'
      }]);

      if (error) {
        console.error(error);
        alert("Failed to save candidate");
        return;
      }

      alert("✅ CV parsed & candidate added");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Error uploading CV");
    } finally {
      setUploading(false);
    }
  };

  // CV PREVIEW
  const handleCvPreview = (candidate) => {
    if (candidate.cv_file_path) {
      setPreviewCv(candidate.cv_file_path);
    } else {
      alert('No CV available for this candidate.');
    }
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
  };

  const saveSearch = () => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    saved.push({ search, province, city, education });
    localStorage.setItem('savedSearches', JSON.stringify(saved));
    alert("Search saved!");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pl-72">
      <div className="flex gap-3">
        <Input
          placeholder="Search by title or name (e.g. sales manager, john)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button className="bg-blue-600 hover:bg-blue-700">Search</Button>
        <Button onClick={saveSearch} className="bg-red-600 hover:bg-red-700">Save Search</Button>
        <Button onClick={clearFilters} variant="outline">Clear Filters</Button>

        {/* CV Upload Button - Fixed with ref */}
        <Button 
          disabled={uploading} 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? 'Uploading...' : 'Upload CV'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleCVUpload}
          className="hidden"
        />
      </div>

      {/* Rest of your file remains unchanged - filters, gender buttons, sliders, results, etc. */}
      <div className="grid md:grid-cols-4 gap-4">
        <Select value={province} onValueChange={setProvince}>
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

      {/* RESULTS */}
      <div className="grid gap-4">
        {Array.isArray(filtered) && filtered.length > 0 ? (
          filtered.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex justify-between p-6">
                <div>
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="text-lg">{c.title}</p>
                  <p className="text-sm text-gray-500">
                    {c.city || c.location || 'No location'}, {c.province || ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{c.status || 'new'}</Badge>
                  <Button variant="outline" onClick={() => setSelectedCandidate(c)}>
                    View Details
                  </Button>
                  {c.cv_file_path && (
                    <Button 
                      variant="outline" 
                      onClick={() => setPreviewCv(c.cv_file_path)}
                    >
                      Preview CV
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
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
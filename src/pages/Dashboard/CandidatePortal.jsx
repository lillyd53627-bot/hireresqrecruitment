import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/supabase';
import CandidateDetailsDialog from '@/components/candidates/CandidateDetailsDialog';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // FILTER STATES
  const [province, setProvince] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [education, setEducation] = useState('ALL');
  const [gender, setGender] = useState([]);
  const [ethnicity, setEthnicity] = useState([]);
  const [age, setAge] = useState([18, 64]);
  const [salary, setSalary] = useState([0, 3000000]);

  // LOCATION MAP
  const locations = {
    Gauteng: ['ALL','Johannesburg','Pretoria','Midrand','Soweto'],
    'Western Cape': ['ALL','Cape Town','Stellenbosch'],
    'KwaZulu-Natal': ['ALL','Durban','Pietermaritzburg'],
    'Eastern Cape': ['ALL','Port Elizabeth','East London'],
    Other: ['ALL','Bloemfontein','Polokwane']
  };

  // FETCH DATA (UNCHANGED)
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('candidates').select('*');
      setCandidates(data || []);
      setFiltered(data || []);
    };
    fetchData();
  }, []);

  // SMART FILTER + SEARCH
  useEffect(() => {
    let result = [...candidates];

    // 🔍 SMART SEARCH (search ALL fields)
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        Object.values(c).some(val =>
          String(val).toLowerCase().includes(q)
        )
      );
    }

    // LOCATION
    if (province !== 'ALL') {
      result = result.filter(c => c.province === province);
    }

    if (city !== 'ALL') {
      result = result.filter(c => c.city === city);
    }

    // EDUCATION
    if (education !== 'ALL') {
      result = result.filter(c => c.education === education);
    }

    // MULTI SELECT
    if (gender.length) {
      result = result.filter(c => gender.includes(c.gender));
    }

    if (ethnicity.length) {
      result = result.filter(c => ethnicity.includes(c.ethnicity));
    }

    // AGE
    result = result.filter(c => {
      const a = c.age || 0;
      return a >= age[0] && a <= age[1];
    });

    // SALARY
    result = result.filter(c => {
      const s = c.salary || 0;
      return s >= salary[0] && s <= salary[1];
    });

    setFiltered(result);
  }, [search, province, city, education, gender, ethnicity, age, salary, candidates]);

  // SAVE SEARCH
  const saveSearch = () => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    saved.push({ search, province, city, education });
    localStorage.setItem('savedSearches', JSON.stringify(saved));
    alert("Search saved!");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* SEARCH */}
      <Input
        placeholder="Search skills, keywords, CV data..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* FILTERS */}
      <div className="grid md:grid-cols-4 gap-4">

        {/* PROVINCE */}
        <Select onValueChange={setProvince}>
          <SelectTrigger>Province: {province}</SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ALL</SelectItem>
            {Object.keys(locations).map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* CITY */}
        <Select onValueChange={setCity}>
          <SelectTrigger>City: {city}</SelectTrigger>
          <SelectContent>
            {(locations[province] || ['ALL']).map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* EDUCATION */}
        <Select onValueChange={setEducation}>
          <SelectTrigger>Education</SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ALL</SelectItem>
            <SelectItem value="Matric">Matric</SelectItem>
            <SelectItem value="Diploma">Diploma</SelectItem>
            <SelectItem value="Bachelors">Bachelors</SelectItem>
            <SelectItem value="Masters">Masters</SelectItem>
          </SelectContent>
        </Select>

      </div>

      {/* MULTI SELECT FILTERS */}
      <div className="flex gap-6 flex-wrap">

        {/* GENDER */}
        {['Male','Female'].map(g => (
          <Button
            key={g}
            variant={gender.includes(g) ? 'default' : 'outline'}
            onClick={() =>
              setGender(prev =>
                prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
              )
            }
          >
            {g}
          </Button>
        ))}

        {/* ETHNICITY */}
        {['Black','White','Coloured','Indian','Chinese','Other'].map(e => (
          <Button
            key={e}
            variant={ethnicity.includes(e) ? 'default' : 'outline'}
            onClick={() =>
              setEthnicity(prev =>
                prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]
              )
            }
          >
            {e}
          </Button>
        ))}

      </div>

      {/* SLIDERS */}
      <div className="space-y-6">

        {/* AGE */}
        <div>
          <p className="text-sm font-medium">Age: {age[0]} - {age[1]}</p>
          <Slider
            value={age}
            min={18}
            max={64}
            step={1}
            onValueChange={setAge}
          />
        </div>

        {/* SALARY */}
        <div>
          <p className="text-sm font-medium">
            Salary: R{salary[0].toLocaleString()} - R{salary[1].toLocaleString()}
          </p>
          <Slider
            value={salary}
            min={0}
            max={3000000}
            step={50000}
            onValueChange={setSalary}
          />
        </div>

      </div>

      {/* SAVE SEARCH */}
      <Button onClick={saveSearch} className="bg-red-600">
        Save Search
      </Button>

      {/* RESULTS */}
      <div className="grid gap-4">
        {filtered.map(c => (
          <Card key={c.id}>
            <CardContent className="flex justify-between p-6">

              <div>
                <h3 className="font-bold">{c.name}</h3>
                <p>{c.title}</p>
                <p className="text-sm text-gray-500">{c.city}, {c.province}</p>
              </div>

              <div className="flex items-center gap-4">
                <Badge>{c.status || 'new'}</Badge>

                <Button
                  variant="outline"
                  onClick={() => setSelectedCandidate(c)}
                >
                  View Details
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* DETAILS MODAL */}
      {selectedCandidate && (
        <CandidateDetailsDialog
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

    </div>
  );
}
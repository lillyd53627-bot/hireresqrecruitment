import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import CandidateDetailsDialog from '@/components/candidates/CandidateDetailsDialog';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Filters
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [education, setEducation] = useState('');
  const [availability, setAvailability] = useState('');
  const [ageRange, setAgeRange] = useState([18, 64]);
  const [salaryRange, setSalaryRange] = useState([0, 3000000]);

  const locations = {
    Gauteng: ["Johannesburg", "Pretoria", "Midrand"],
    "Western Cape": ["Cape Town", "Stellenbosch"],
    "KwaZulu-Natal": ["Durban"],
    "Eastern Cape": ["Port Elizabeth"],
    "Free State / Other": ["Bloemfontein"]
  };

  // Fetch
  const fetchCandidates = async () => {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load candidates");
    } else {
      setCandidates(data || []);
      setFilteredCandidates(data || []);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Filtering
  useEffect(() => {
    let result = candidates;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q)
      );
    }

    if (province) result = result.filter(c => c.location?.includes(province));
    if (city) result = result.filter(c => c.location?.includes(city));
    if (education) result = result.filter(c => c.education === education);
    if (availability) result = result.filter(c => c.availability === availability);

    result = result.filter(c =>
      !c.age || (c.age >= ageRange[0] && c.age <= ageRange[1])
    );

    result = result.filter(c =>
      !c.salary || (c.salary >= salaryRange[0] && c.salary <= salaryRange[1])
    );

    setFilteredCandidates(result);
  }, [searchQuery, province, city, education, availability, ageRange, salaryRange, candidates]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Candidates</h1>
        <p className="text-gray-600">AI-powered candidate search</p>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search candidates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="grid md:grid-cols-3 gap-6 p-6">

          {/* PROVINCE */}
          <Select onValueChange={(v) => { setProvince(v === "ALL" ? "" : v); setCity(""); }}>
            <SelectTrigger><SelectValue placeholder="All Provinces" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Provinces</SelectItem>
              {Object.keys(locations).map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* CITY */}
          <Select onValueChange={(v) => setCity(v === "ALL" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="All Cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Cities</SelectItem>
              {(locations[province] || []).map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* EDUCATION */}
          <Select onValueChange={setEducation}>
            <SelectTrigger><SelectValue placeholder="Education" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Bachelors">Bachelors</SelectItem>
              <SelectItem value="Masters">Masters</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
            </SelectContent>
          </Select>

          {/* AVAILABILITY */}
          <Select onValueChange={setAvailability}>
            <SelectTrigger><SelectValue placeholder="Availability" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Immediate">Immediate</SelectItem>
              <SelectItem value="1 Month">1 Month</SelectItem>
              <SelectItem value="2 Months">2 Months</SelectItem>
            </SelectContent>
          </Select>

          {/* AGE SLIDER FIX */}
          <div>
            <Label className="flex justify-between">
              Age Range
              <span className="text-red-600 font-medium">
                {ageRange[0]} - {ageRange[1]}
              </span>
            </Label>
            <Slider
              min={18}
              max={64}
              step={1}
              value={ageRange}
              onValueChange={setAgeRange}
            />
          </div>

          {/* SALARY SLIDER FIX */}
          <div>
            <Label className="flex justify-between">
              Salary (ZAR)
              <span className="text-red-600 font-medium">
                R{salaryRange[0].toLocaleString()} - R{salaryRange[1].toLocaleString()}
              </span>
            </Label>
            <Slider
              min={0}
              max={3000000}
              step={50000}
              value={salaryRange}
              onValueChange={setSalaryRange}
            />
          </div>

        </CardContent>
      </Card>

      {/* RESULTS */}
      <div className="grid gap-4">
        {filteredCandidates.map(c => (
          <Card key={c.id}>
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-gray-600">{c.title}</p>
                <p className="text-sm text-gray-500">{c.location}</p>
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
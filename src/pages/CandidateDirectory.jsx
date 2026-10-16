import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Briefcase, GraduationCap, Filter } from "lucide-react";

// Temporary mock data – replace later with Supabase data
const mockCandidates = [
  {
    id: 1,
    fullName: "Thabo Molefe",
    jobTitles: "Business Administrator, Office Manager",
    industry: "Administration",
    location: "Johannesburg, Gauteng",
    highestEducation: "Diploma",
    educationDetails: "Business Administrator NQF Level 4",
    age: 29,
    phone: "082 111 2233",
    email: "thabo@email.com",
  },
  {
    id: 2,
    fullName: "Naledi Khumalo",
    jobTitles: "HR Officer, Recruitment Consultant",
    industry: "Human Resources",
    location: "Pretoria, Gauteng",
    highestEducation: "Degree",
    educationDetails: "BCom Human Resource Management",
    age: 32,
    phone: "083 444 5566",
    email: "naledi@email.com",
  },
  {
    id: 3,
    fullName: "Johan van der Berg",
    jobTitles: "Sales Manager, Key Account Manager",
    industry: "Sales",
    location: "Cape Town, Western Cape",
    highestEducation: "Diploma",
    educationDetails: "Sales & Marketing Diploma",
    age: 35,
    phone: "084 777 8899",
    email: "johan@email.com",
  },
  {
    id: 4,
    fullName: "Fatima Patel",
    jobTitles: "Financial Administrator, Bookkeeper",
    industry: "Finance",
    location: "Durban, KwaZulu-Natal",
    highestEducation: "Certificate",
    educationDetails: "Bookkeeping NQF Level 4",
    age: 27,
    phone: "081 222 3344",
    email: "fatima@email.com",
  },
];

export default function CandidateDirectory() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const industries = ["All", ...new Set(mockCandidates.map((c) => c.industry))];
  const locations = ["All", ...new Set(mockCandidates.map((c) => c.location.split(",")[1]?.trim() || c.location))];

  const filtered = useMemo(() => {
    return mockCandidates.filter((c) => {
      const matchesSearch =
        !search ||
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.jobTitles.toLowerCase().includes(search.toLowerCase()) ||
        c.industry.toLowerCase().includes(search.toLowerCase());

      const matchesIndustry = industryFilter === "All" || c.industry === industryFilter;
      const matchesLocation =
        locationFilter === "All" || c.location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesIndustry && matchesLocation;
    });
  }, [search, industryFilter, locationFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Hire<span className="text-red-600">ResQ</span>
          </Link>
          <div className="flex gap-3">
            <Link
              to="/candidate-register"
              className="text-sm bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-lg font-medium"
            >
              Register as Candidate
            </Link>
            <Link
              to="/post-job"
              className="text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium"
            >
              Post a Job
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Candidates</h1>
          <p className="text-gray-600">
            Browse candidates by job title or industry
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, job title or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind === "All" ? "All Industries" : ind}
              </option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "All" ? "All Locations" : loc}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing <strong>{filtered.length}</strong> candidate{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Candidate Cards */}
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
              No candidates found. Try different filters.
            </div>
          ) : (
            filtered.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white rounded-xl border p-5 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{candidate.fullName}</h2>
                    <p className="text-red-600 font-medium mt-1">{candidate.jobTitles}</p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {candidate.industry}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {candidate.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {candidate.highestEducation}
                      </span>
                      <span>{candidate.age} years old</span>
                    </div>

                    {candidate.educationDetails && (
                      <p className="text-sm text-gray-500 mt-2">
                        {candidate.educationDetails}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <a
                      href={`mailto:${candidate.email}`}
                      className="text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Contact
                    </a>
                    <span className="text-xs text-center text-gray-400">
                      {candidate.phone}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
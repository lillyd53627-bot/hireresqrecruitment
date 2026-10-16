import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Upload, FileText, User, MapPin, Briefcase, GraduationCap } from "lucide-react";

export default function CandidateRegister() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    age: "",
    location: "",
    nationality: "",
    ethnicity: "",
    jobTitles: "",
    industry: "",
    highestEducation: "",
    educationDetails: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // TODO: Connect to Supabase or your backend
    console.log("Candidate Data:", form);
    console.log("CV File:", cvFile);

    // Simulate success
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1200);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold mb-2">Profile Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you. Your profile is now visible to recruiters and companies on HireResQ.
          </p>
          <Link
            to="/jobs"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            Browse Open Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Hire<span className="text-red-600">ResQ</span>
          </Link>
          <Link
            to="/post-job"
            className="text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium"
          >
            Are you hiring? Post a Job
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Candidate Profile
          </h1>
          <p className="text-gray-600">
            Upload your CV and complete your details so recruiters can find you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6">
          {/* CV Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Upload CV (PDF or Word)
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition"
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {cvFile ? cvFile.name : "Click to upload your CV"}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setCvFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number *</label>
              <input
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 082 123 4567"
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ID Number *</label>
              <input
                name="idNumber"
                required
                value={form.idNumber}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age *</label>
              <input
                name="age"
                type="number"
                required
                value={form.age}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                placeholder="City / Province"
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nationality *</label>
              <input
                name="nationality"
                required
                value={form.nationality}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ethnicity</label>
              <select
                name="ethnicity"
                value={form.ethnicity}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Select</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Coloured">Coloured</option>
                <option value="Indian">Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Professional Details */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-red-600" /> Professional Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Job Titles you are looking for *</label>
                <input
                  name="jobTitles"
                  required
                  value={form.jobTitles}
                  onChange={handleChange}
                  placeholder="e.g. Sales Manager, Business Administrator, HR Officer"
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industry *</label>
                <input
                  name="industry"
                  required
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g. Finance, IT, Healthcare, Retail"
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Highest Education Level *</label>
                <select
                  name="highestEducation"
                  required
                  value={form.highestEducation}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Select</option>
                  <option value="Matric">Matric</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Degree">Degree</option>
                  <option value="Honours">Honours</option>
                  <option value="Masters">Masters</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Education Details (e.g. Business Administrator NQF Level 4)
                </label>
                <textarea
                  name="educationDetails"
                  value={form.educationDetails}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List your qualifications..."
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-xl transition"
          >
            {submitting ? "Submitting..." : "Submit Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
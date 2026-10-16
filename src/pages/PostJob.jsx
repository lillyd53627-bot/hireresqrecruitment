import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Briefcase } from "lucide-react";

export default function PostJob() {
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    jobTitle: "",
    industry: "",
    location: "",
    jobType: "Full-time",
    description: "",
    requirements: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // TODO: Connect to Supabase later
    console.log("Job Posted:", form);

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
          <h2 className="text-2xl font-bold mb-2">Job Posted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your job is now live and visible to candidates on HireResQ.
          </p>
          <Link
            to="/candidate-register"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            View Candidate Registration
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
            to="/candidate-register"
            className="text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium"
          >
            Looking for a job? Register as Candidate
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Job</h1>
          <p className="text-gray-600">
            Reach qualified candidates quickly. Fill in the job details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6">
          {/* Company Details */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-600" /> Company Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input
                  name="companyName"
                  required
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person *</label>
                <input
                  name="contactPerson"
                  required
                  value={form.contactPerson}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
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
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-red-600" /> Job Specification
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Job Title *</label>
                <input
                  name="jobTitle"
                  required
                  value={form.jobTitle}
                  onChange={handleChange}
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
                <label className="block text-sm font-medium mb-1">Job Type</label>
                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Temporary</option>
                  <option>Internship</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Job Description *</label>
                <textarea
                  name="description"
                  required
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Requirements</label>
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Qualifications, experience, skills..."
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
            {submitting ? "Posting Job..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}
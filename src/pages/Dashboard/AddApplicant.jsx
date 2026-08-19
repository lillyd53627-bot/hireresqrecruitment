// src/pages/Dashboard/AddApplicant.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  UserPlus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';

import { supabase } from '@/lib/supabase';

export default function AddApplicant() {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cvFile, setCvFile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    title: '',
    age: '',
    id_number: '',
    ethnicity: '',
    gender: '',
    nationality: '',
    industry: '',
    education: '',
    location: '',
    email: '',
    phone: '',
    experience_years: '',
    skills: '',
    experience: '',
    qualifications: '',
    notes: '',
  });

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCvChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCvFile(null);
      return;
    }
    setCvFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.name.trim()) {
      setError('Please enter the applicant name.');
      return;
    }

    if (!form.title.trim()) {
      setError('Please enter the job title.');
      return;
    }

    setSaving(true);

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData?.user;
      if (!user) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      let cvFilePath = null;

      if (cvFile) {
        const safeFileName = cvFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${user.id}/${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('candidate-cvs')
          .upload(filePath, cvFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`CV upload failed: ${uploadError.message}`);
        }

        cvFilePath = filePath;
      }

      const combinedProfile = [
        form.experience ? `WORK PROFILE\n${form.experience}` : '',
        form.qualifications ? `QUALIFICATIONS\n${form.qualifications}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const skillsArray = form.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      const candidatePayload = {
        user_id: user.id,
        name: form.name.trim(),
        title: form.title.trim(),
        location: form.location.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        age: form.age ? Number(form.age) : null,
        id_number: form.id_number.trim() || null,
        ethnicity: form.ethnicity.trim() || null,
        gender: form.gender.trim() || null,
        nationality: form.nationality.trim() || null,
        industry: form.industry.trim() || null,
        education: form.education.trim() || null,
        experience_years: form.experience_years
          ? Number(form.experience_years)
          : null,
        experience: form.experience.trim() || null,
        skills: skillsArray.length ? skillsArray : null,
        notes: form.notes.trim() || null,
        cv_file_path: cvFilePath,
        cv_text: combinedProfile || null,
        raw_cv_text: combinedProfile || null,
        parsed_text: combinedProfile || null,
        stage: 'sourced',
        shortlisted: false,
        match_score: 0,
      };

      const { error: insertError } = await supabase
        .from('candidates')
        .insert(candidatePayload);

      if (insertError) throw insertError;

      setSuccess(true);

      setForm({
        name: '',
        title: '',
        age: '',
        id_number: '',
        ethnicity: '',
        gender: '',
        nationality: '',
        industry: '',
        education: '',
        location: '',
        email: '',
        phone: '',
        experience_years: '',
        skills: '',
        experience: '',
        qualifications: '',
        notes: '',
      });

      setCvFile(null);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitError) {
      console.error('[Add Applicant]', submitError);
      setError(submitError?.message || 'Unable to save the applicant.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />

      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <TopBar
          title="Add Applicant"
          subtitle="Create a candidate profile"
        />

        <div className="p-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Add Applicant
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Capture the applicant's professional profile, qualifications
                  and CV information.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/candidates')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </Button>
          </div>

          {success && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">
                      Applicant added successfully
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      The applicant has been added to your candidate database.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-5">
                <p className="font-semibold text-red-800">
                  Unable to add applicant
                </p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Applicant full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g. Financial Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    placeholder="Age"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ID Number</Label>
                  <Input
                    value={form.id_number}
                    onChange={(e) => updateField('id_number', e.target.value)}
                    placeholder="ID number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ethnicity</Label>
                  <Input
                    value={form.ethnicity}
                    onChange={(e) => updateField('ethnicity', e.target.value)}
                    placeholder="Ethnicity"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input
                    value={form.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    placeholder="Gender"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input
                    value={form.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder="Nationality"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    value={form.industry}
                    onChange={(e) => updateField('industry', e.target.value)}
                    placeholder="e.g. Finance, IT, Engineering"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Highest Education</Label>
                  <Input
                    value={form.education}
                    onChange={(e) => updateField('education', e.target.value)}
                    placeholder="e.g. BCom Finance"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g. Johannesburg, Gauteng"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Contact & Experience</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="Phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.experience_years}
                    onChange={(e) =>
                      updateField('experience_years', e.target.value)
                    }
                    placeholder="e.g. 8"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  <Input
                    value={form.skills}
                    onChange={(e) => updateField('skills', e.target.value)}
                    placeholder="Excel, Payroll, Sage, HR"
                  />
                  <p className="text-xs text-gray-400">
                    Separate skills with commas.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-red-600" />
                  Work Profile
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Paste the applicant's work history, responsibilities and
                  professional profile.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                  placeholder="Paste the applicant's work profile here..."
                  className="min-h-[280px]"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
                <p className="text-sm text-gray-500">
                  Paste qualifications, certifications and education
                  information.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.qualifications}
                  onChange={(e) =>
                    updateField('qualifications', e.target.value)
                  }
                  placeholder="Paste qualifications here..."
                  className="min-h-[240px]"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  CV Upload
                  <span className="text-sm font-normal text-gray-400">
                    Optional
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Upload the applicant's CV if available.
                </p>
              </CardHeader>
              <CardContent>
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition">
                  <Upload className="w-8 h-8 text-gray-400 mb-3" />
                  <span className="font-medium text-gray-700">
                    {cvFile ? cvFile.name : 'Choose CV file'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PDF, DOC or DOCX
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleCvChange}
                  />
                </label>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recruiter Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Add any additional recruiter notes..."
                  className="min-h-[140px]"
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/candidates')}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 min-w-[160px]"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Applicant
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
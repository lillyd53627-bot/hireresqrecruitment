import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardPaste, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminDashboard() {

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pasting, setPasting] = useState(false);
  const [pastedCV, setPastedCV] = useState('');
  const [previewCandidate, setPreviewCandidate] = useState(null);
  
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCandidates();
    fetchUsers();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error('❌ Fetch candidates error:', err);
      setError('Failed to load candidates. Check Supabase connection.');
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('❌ Fetch users error:', err);
    }
  };

  // =========================================
  // EXTRACTORS
  // =========================================

  const extractName = (text) => {
    if (!text) return 'Unknown Candidate';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    for (let i = 0; i < Math.min(8, lines.length); i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('email') || 
          line.toLowerCase().includes('phone') || 
          line.toLowerCase().includes('location') ||
          line.includes('@')) continue;

      if (line.split(' ').length >= 2 && line.length < 50) {
        return line;
      }
    }

    const explicitName = extractField(text, 'Name');
    if (explicitName && explicitName.length > 3) return explicitName;

    return 'Unknown Candidate';
  };

  const extractProfessionalTitle = (text) => {
    const titlePatterns = [
      /branch manager/i, /national sales manager/i, /sales manager/i,
      /operations manager/i, /finance manager/i, /credit manager/i,
      /office manager/i, /project manager/i, /team leader/i,
      /administrator/i, /sales executive/i, /executive assistant/i,
      /account manager/i, /consultant/i, /coordinator/i, /director/i,
      /supervisor/i, /receptionist/i, /officer/i, /clerk/i,
    ];

    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    for (const line of lines) {
      const found = titlePatterns.find(pattern => pattern.test(line));
      if (found && line.length < 80) return line;
    }
    return 'Candidate';
  };

  const extractPhone = (text) => {
    if (!text) return '';
    const phoneMatches = text.match(/(?:\+27|27|0)\s?[6-8][0-9](?:[\s-]?[0-9]{3})(?:[\s-]?[0-9]{4})/g);
    if (!phoneMatches) return '';

    for (let phone of phoneMatches) {
      phone = phone.replace(/[^\d+]/g, '');
      if (phone.startsWith('+27')) phone = '0' + phone.substring(3);
      else if (phone.startsWith('27')) phone = '0' + phone.substring(2);
      if (/^0[6-8][0-9]{8}$/.test(phone)) return phone;
    }
    return '';
  };

  const extractField = (text, label) => {
    if (!text) return '';
    const regex = new RegExp(`${label}\\s*:?\\s*(.+)`, 'i');
    const match = text.match(regex);
    return match?.[1]?.split('\n')[0]?.trim() || '';
  };

  const extractEmail = (text) => {
    const match = text.match(/[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/i);
    return match?.[0] || '';
  };

  const formatCVText = (text) => {
    if (!text) return '';
    return text
      .replace(/\r/g, '')
      .replace(/(PERSONAL DETAILS|PROFILE|SUMMARY|EDUCATION|EXPERIENCE|EMPLOYMENT HISTORY|WORK EXPERIENCE|SKILLS|REFERENCES|CERTIFICATIONS|QUALIFICATIONS|PROJECTS|PROFESSIONAL EXPERIENCE)/gi, '\n\n====================\n$1\n====================\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const extractHighestEducation = (text) => {
    const keywords = ['Honours','Degree','Diploma','Certificate','Matric','Bachelor','Masters','NQF','National Diploma','Postgraduate','Doctorate','N1','N2','N3','N4','N5','N6'];
    const lines = text.split('\n');
    for (const line of lines) {
      if (keywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) return line.trim();
    }
    return '';
  };

  // =========================================
  // IMPROVED EXPERIENCE PARSER
  // =========================================

  function parseExperienceSections(cvText) {
    if (!cvText || typeof cvText !== 'string') return [];

    const experiences = [];
    const lines = cvText.split('\n');
    let currentExp = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const dateMatch = line.match(/\b(\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{4})\s*[-–—]\s*(\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|present|current|till date|ongoing)/i);
      
      if (dateMatch || /experience|position|company|role/i.test(line)) {
        if (currentExp) experiences.push(currentExp);

        currentExp = {
          company: 'N/A',
          title: 'N/A',
          dates: dateMatch ? dateMatch[0] : 'N/A',
          responsibilities: []
        };

        const parts = line.split(/at|@|–|—|-/i);
        if (parts.length > 1) {
          currentExp.title = parts[0].trim();
          currentExp.company = parts[parts.length - 1].trim();
        } else if (line.length < 100) {
          currentExp.title = line;
        }
      }

      if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 40)) {
        const cleaned = line.replace(/^[\s•\-*•·➢►]+/, '').trim();
        if (cleaned.length > 10) {
          currentExp.responsibilities.push(cleaned);
        }
      }
    }

    if (currentExp) experiences.push(currentExp);
    return experiences;
  }

  const parseQualifications = (cvText) => {
    if (!cvText) return [];
    const match = cvText.match(/(EDUCATION|QUALIFICATIONS|CERTIFICATIONS)([\s\S]*?)(REFERENCES|SKILLS|EMPLOYMENT|EXPERIENCE|$)/i);
    if (!match) return [];
    return match[2].split('\n').map(item => item.trim()).filter(item => item.length > 3);
  };

  const parseReferences = (cvText) => {
    if (!cvText) return [];
    const match = cvText.match(/(REFERENCES)([\s\S]*?)$/i);
    if (!match) return [];
    return match[2].split('\n').map(item => item.trim()).filter(item => item.length > 3);
  };

  // =========================================
  // CANDIDATE HELPERS
  // =========================================

  const candidateExists = async (name, email) => {
    try {
      if (email) {
        const { data } = await supabase.from('candidates').select('id').eq('email', email).limit(1);
        return !!data?.length;
      }
      if (name && name !== 'Unknown Candidate') {
        const { data } = await supabase.from('candidates').select('id').eq('name', name).limit(1);
        return !!data?.length;
      }
      return false;
    } catch (err) {
      console.error('Duplicate check failed:', err);
      return false;
    }
  };

  const deleteCandidate = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else {
      toast.success('Candidate deleted');
      fetchCandidates();
    }
  };

  const handlePasteCV = async () => {
    if (!pastedCV?.trim()) {
      toast.error('Please paste CV text first');
      return;
    }

    setPasting(true);
    try {
      const formattedCV = formatCVText(pastedCV);
      const extractedName = extractName(formattedCV);
      const extractedTitle = extractProfessionalTitle(formattedCV);
      const extractedEmail = extractEmail(formattedCV);
      const extractedPhone = extractPhone(formattedCV);
      const extractedLocation = extractField(formattedCV, 'Location');
      const extractedIndustry = extractField(formattedCV, 'Industry');
      const extractedSalary = extractField(formattedCV, 'Salary');
      const extractedEducation = extractHighestEducation(formattedCV);

      const exists = await candidateExists(extractedName, extractedEmail);
      if (exists) {
        toast.error('Duplicate candidate detected');
        return;
      }

      const { error } = await supabase.from('candidates').insert([{
        name: extractedName,
        email: extractedEmail || null,
        phone: extractedPhone || null,
        title: extractedTitle,
        location: extractedLocation || '',
        skills: [],
        experience: '',
        education: extractedEducation || '',
        industry: extractedIndustry || '',
        salary: extractedSalary || '',
        cv_text: formattedCV,
        notes: '',
        user_id: selectedUserId || null,
      }]);

      if (error) throw error;

      toast.success('✅ CV Parsed & Saved Successfully!');
      setPastedCV('');
      setSelectedUserId('');
      fetchCandidates();

    } catch (err) {
      console.error('❌ Process CV Error:', err);
      toast.error(err.message || 'Failed to process CV');
    } finally {
      setPasting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading candidates...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Add & Manage Candidates</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Paste Candidate CV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            value={pastedCV}
            onChange={(e) => setPastedCV(e.target.value)}
            placeholder="Paste full CV text here..."
            rows={12}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Assign to Paid User</label>
            <select 
              value={selectedUserId} 
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Assign to All / Current Admin</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handlePasteCV} disabled={pasting || !pastedCV.trim()} className="w-full">
            <ClipboardPaste className="mr-2" />
            {pasting ? 'Processing...' : 'Process CV'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Candidates ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {candidates.map((c) => (
              <div key={c.id} className="border rounded-2xl p-6 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{c.name}</h2>
                    <p className="text-gray-500 mt-1">{c.title}</p>
                    <p className="text-gray-500">{c.email || 'No Email'}</p>
                    <p className="text-gray-500">{c.phone || 'No Phone'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPreviewCandidate(c)}>
                      <Eye size={16} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteCandidate(c.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PREVIEW MODAL */}
      {previewCandidate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button 
              className="absolute top-4 right-4 text-4xl font-light text-gray-500 hover:text-gray-900"
              onClick={() => setPreviewCandidate(null)}
            >
              ×
            </button>

            <div className="border-b pb-8 mb-8">
              <h2 className="text-4xl font-bold text-gray-900">{previewCandidate.name}</h2>
              <p className="text-2xl text-purple-700 font-semibold mt-2">
                {previewCandidate.title || 'Candidate'}
              </p>

              <div className="grid grid-cols-2 gap-6 mt-8 bg-gray-50 rounded-2xl p-6">
                <div><p className="text-sm text-gray-500">Email</p><p>{previewCandidate.email || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Phone</p><p>{previewCandidate.phone || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Location</p><p>{previewCandidate.location || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Industry</p><p>{previewCandidate.industry || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Age</p><p>{extractField(previewCandidate.cv_text, 'Age') || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">ID No</p><p>{extractField(previewCandidate.cv_text, 'ID No') || extractField(previewCandidate.cv_text, 'ID') || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Ethnicity</p><p>{extractField(previewCandidate.cv_text, 'Ethnicity') || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Gender</p><p>{extractField(previewCandidate.cv_text, 'Gender') || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Nationality</p><p>{extractField(previewCandidate.cv_text, 'Nationality') || 'N/A'}</p></div>
                <div><p className="text-sm text-gray-500">Salary</p><p>{extractField(previewCandidate.cv_text, 'Salary') || previewCandidate.salary || 'N/A'}</p></div>
              </div>
            </div>

            {/* WORK EXPERIENCE */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-6 border-b pb-2">Work Experience</h3>
              {parseExperienceSections(previewCandidate.cv_text).length > 0 ? (
                parseExperienceSections(previewCandidate.cv_text).map((exp, index) => (
                  <div key={index} className="mb-8 pb-6 border-b border-gray-200 last:border-none">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-bold text-xl">{exp.company}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Position</p>
                      <p className="font-semibold">{exp.title}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Employment Period</p>
                      <p>{exp.dates}</p>
                    </div>
                    {exp.responsibilities?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Responsibilities</p>
                        <ul className="list-disc pl-6 space-y-2">
                          {exp.responsibilities.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No experience data found.</p>
              )}
            </div>

            {/* QUALIFICATIONS */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-6 border-b pb-2">Qualifications</h3>
              {parseQualifications(previewCandidate.cv_text).length > 0 ? (
                <ul className="list-disc pl-6 space-y-2">
                  {parseQualifications(previewCandidate.cv_text).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No qualifications found.</p>
              )}
            </div>

            {/* REFERENCES */}
            <div>
              <h3 className="text-2xl font-bold mb-6 border-b pb-2">References</h3>
              {parseReferences(previewCandidate.cv_text).length > 0 ? (
                <ul className="list-disc pl-6 space-y-2">
                  {parseReferences(previewCandidate.cv_text).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No references supplied.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
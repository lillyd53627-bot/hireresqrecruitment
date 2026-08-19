import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserCog,
  Code2,
  ShieldCheck,
  FileText,
  CreditCard,
  DollarSign,
  Search,
  Eye,
  Trash2,
  ClipboardPaste,
  RefreshCw,
  X,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
|
| Authorization:
|   public.user_roles.role = "admin"
|   OR
|   public.user_roles.role = "developer"
|
| IMPORTANT:
|   Subscription plan does NOT grant admin access.
|
| Supported roles:
|   admin
|   developer
|   recruiter
|
|--------------------------------------------------------------------------
*/

const ADMIN_ROLES = ['admin', 'developer'];

export default function AdminDashboard() {
  // -----------------------------------------------------------------------
  // AUTH / AUTHORIZATION
  // -----------------------------------------------------------------------

  const [authLoading, setAuthLoading] = useState(true);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [authorizationError, setAuthorizationError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // -----------------------------------------------------------------------
  // DATA
  // -----------------------------------------------------------------------

  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState(null);

  // -----------------------------------------------------------------------
  // CV PROCESSING
  // -----------------------------------------------------------------------

  const [pasting, setPasting] = useState(false);
  const [pastedCV, setPastedCV] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // -----------------------------------------------------------------------
  // UI
  // -----------------------------------------------------------------------

  const [previewCandidate, setPreviewCandidate] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');

  // -----------------------------------------------------------------------
  // INITIALIZATION
  // -----------------------------------------------------------------------

  useEffect(() => {
    initializeAdminDashboard();
  }, []);

  const initializeAdminDashboard = async () => {
    setAuthLoading(true);
    setAuthorizationError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          `Unable to verify authentication: ${authError.message}`
        );
      }

      if (!user) {
        setAuthenticatedUser(null);
        setCurrentRole(null);
        setIsAuthorized(false);

        setAuthorizationError(
          'You are not currently authenticated with Supabase.'
        );

        return;
      }

      setAuthenticatedUser(user);

      // ---------------------------------------------------------------
      // AUTHORITATIVE ADMIN/DEVELOPER ROLE CHECK
      // ---------------------------------------------------------------
      //
      // We deliberately query ONLY the current user's role.
      //
      // This works with the RLS policy:
      //
      // auth.uid() = user_id
      //
      // and avoids recursive user_roles policies.
      // ---------------------------------------------------------------

      const {
        data: roleRows,
        error: roleError,
      } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .eq('user_id', user.id);

      if (roleError) {
        console.error('Admin role lookup failed:', roleError);

        setCurrentRole(null);
        setIsAuthorized(false);

        setAuthorizationError(
          `Unable to verify administrator access: ${roleError.message}`
        );

        return;
      }

      // Prefer admin/developer if multiple rows exist.
      const matchingRole = (roleRows || []).find((row) =>
        ADMIN_ROLES.includes(String(row.role || '').toLowerCase())
      );

      const detectedRole = matchingRole
        ? String(matchingRole.role).toLowerCase()
        : null;

      setCurrentRole(detectedRole);

      if (!detectedRole) {
        setIsAuthorized(false);

        setAuthorizationError(
          'Your account does not have an admin or developer role in public.user_roles.'
        );

        return;
      }

      setIsAuthorized(true);

      await loadDashboardData(user);

    } catch (error) {
      console.error('Admin dashboard authorization error:', error);

      setIsAuthorized(false);
      setAuthorizationError(
        error?.message || 'Unable to initialize administrator access.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  // LOAD DASHBOARD DATA
  // -----------------------------------------------------------------------

  const loadDashboardData = async (user) => {
    setLoadingData(true);
    setDataError(null);

    try {
      await Promise.all([
        fetchCandidates(),
        fetchUsers(user),
        fetchSubscriptions(),
      ]);
    } catch (error) {
      console.error('Dashboard data error:', error);

      setDataError(
        error?.message || 'Some dashboard information could not be loaded.'
      );
    } finally {
      setLoadingData(false);
    }
  };

  // -----------------------------------------------------------------------
  // USERS
  // -----------------------------------------------------------------------

  const fetchUsers = async (currentUser) => {
    try {
      /*
       * We intentionally use select('*') because your existing profiles
       * table may contain additional fields such as:
       *
       * full_name
       * email
       * role
       * plan
       * subscription_status
       *
       * This prevents the dashboard from depending on one exact schema.
       */

      const {
        data: profileRows,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) {
        throw profileError;
      }

      /*
       * IMPORTANT:
       *
       * The signed-in user's role MUST come from user_roles.
       *
       * This fixes your screenshot where:
       *
       * Authorization Status = admin
       *
       * but Users table showed:
       *
       * Role = recruiter
       *
       * We override the current user's profile role with the
       * authoritative user_roles value.
       */

      let roleMap = {};

      if (currentUser?.id) {
        const {
          data: currentRoleRows,
          error: currentRoleError,
        } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .eq('user_id', currentUser.id);

        if (!currentRoleError && currentRoleRows) {
          currentRoleRows.forEach((row) => {
            roleMap[row.user_id] = String(row.role || '').toLowerCase();
          });
        }
      }

      const normalizedUsers = (profileRows || []).map((profile) => {
        const id = profile.id || profile.user_id;

        const isCurrentUser =
          currentUser?.id &&
          id &&
          String(id) === String(currentUser.id);

        const roleFromUserRoles = roleMap[id];

        /*
         * Current authenticated user's role from user_roles wins.
         *
         * For other users we use profile.role if available.
         *
         * Full visibility of every user's user_roles row requires
         * an appropriate admin-only RLS policy or RPC in Supabase.
         */
        let resolvedRole =
          roleFromUserRoles ||
          profile.role ||
          profile.user_role ||
          'recruiter';

        if (isCurrentUser && currentRole) {
          resolvedRole = currentRole;
        }

        return {
          ...profile,
          id,
          email:
            profile.email ||
            (isCurrentUser ? currentUser.email : '') ||
            '',
          full_name:
            profile.full_name ||
            profile.name ||
            profile.display_name ||
            'Unnamed User',
          role: String(resolvedRole).toLowerCase(),
          plan:
            profile.plan ||
            profile.subscription_plan ||
            profile.current_plan ||
            'Unknown',
        };
      });

      /*
       * If the current user doesn't appear in profiles for some reason,
       * add them so the admin dashboard still identifies the account.
       */

      const currentUserExists = normalizedUsers.some(
        (user) => String(user.id) === String(currentUser?.id)
      );

      if (currentUser && !currentUserExists) {
        normalizedUsers.unshift({
          id: currentUser.id,
          email: currentUser.email || '',
          full_name:
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            'Unnamed User',
          role: currentRole || 'recruiter',
          plan: 'Unknown',
          _authOnly: true,
        });
      }

      setUsers(normalizedUsers);

    } catch (error) {
      console.error('Fetch users error:', error);

      /*
       * Don't make the entire dashboard unusable if profiles has
       * an RLS/schema problem.
       */
      setUsers([]);

      throw new Error(
        `Unable to load users: ${error?.message || 'Unknown error'}`
      );
    }
  };

  // -----------------------------------------------------------------------
  // CANDIDATES
  // -----------------------------------------------------------------------

  const fetchCandidates = async () => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCandidates(data || []);
    } catch (error) {
      console.error('Fetch candidates error:', error);
      setCandidates([]);

      throw new Error(
        `Unable to load candidates: ${
          error?.message || 'Unknown error'
        }`
      );
    }
  };

  // -----------------------------------------------------------------------
  // SUBSCRIPTIONS
  // -----------------------------------------------------------------------

  const fetchSubscriptions = async () => {
    try {
      /*
       * select('*') intentionally makes this compatible with your existing
       * subscriptions table without assuming one specific set of columns.
       */

      const {
        data,
        error,
      } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        /*
         * A missing/empty subscriptions table should not destroy the
         * entire Admin Dashboard.
         */
        console.warn(
          'Subscriptions could not be loaded:',
          error.message
        );

        setSubscriptions([]);
        return;
      }

      setSubscriptions(data || []);

    } catch (error) {
      console.warn('Subscriptions fetch failed:', error);
      setSubscriptions([]);
    }
  };

  // -----------------------------------------------------------------------
  // EXTRACTORS
  // -----------------------------------------------------------------------

  const extractField = (text, label) => {
    if (!text || !label) return '';

    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(
      `${escapedLabel}\\s*:?\\s*(.+)`,
      'i'
    );

    const match = text.match(regex);

    return (
      match?.[1]
        ?.split('\n')[0]
        ?.trim() || ''
    );
  };

  const extractName = (text) => {
    if (!text) return 'Unknown Candidate';

    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];

      const lower = line.toLowerCase();

      if (
        lower.includes('email') ||
        lower.includes('phone') ||
        lower.includes('mobile') ||
        lower.includes('location') ||
        lower.includes('address') ||
        line.includes('@')
      ) {
        continue;
      }

      /*
       * Avoid taking section headings as candidate names.
       */
      if (
        /^(personal details|profile|summary|curriculum vitae|cv|resume|experience|education|skills)$/i.test(
          line
        )
      ) {
        continue;
      }

      if (
        line.split(/\s+/).length >= 2 &&
        line.length < 60 &&
        !/[|:]/.test(line)
      ) {
        return line;
      }
    }

    const explicitName = extractField(text, 'Name');

    if (explicitName && explicitName.length > 2) {
      return explicitName;
    }

    return 'Unknown Candidate';
  };

  const extractProfessionalTitle = (text) => {
    if (!text) return 'Candidate';

    const titlePatterns = [
      /chief executive officer/i,
      /chief operating officer/i,
      /chief financial officer/i,
      /chief technology officer/i,
      /general manager/i,
      /branch manager/i,
      /national sales manager/i,
      /regional sales manager/i,
      /sales manager/i,
      /operations manager/i,
      /finance manager/i,
      /credit manager/i,
      /office manager/i,
      /project manager/i,
      /human resources manager/i,
      /hr manager/i,
      /team leader/i,
      /administrator/i,
      /sales executive/i,
      /executive assistant/i,
      /account manager/i,
      /account executive/i,
      /business development manager/i,
      /business development executive/i,
      /recruitment consultant/i,
      /recruiter/i,
      /consultant/i,
      /coordinator/i,
      /director/i,
      /supervisor/i,
      /receptionist/i,
      /officer/i,
      /clerk/i,
      /analyst/i,
      /developer/i,
      /engineer/i,
    ];

    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      if (line.length > 100) continue;

      const found = titlePatterns.find((pattern) =>
        pattern.test(line)
      );

      if (found) {
        return line;
      }
    }

    return 'Candidate';
  };

  const extractPhone = (text) => {
    if (!text) return '';

    /*
     * South African mobile numbers:
     *
     * 082 123 4567
     * 082-123-4567
     * 0821234567
     * +27 82 123 4567
     * +27821234567
     * 27821234567
     */

    const phoneRegex =
      /(?:\+?27[\s-]?|0)[6-8][0-9](?:[\s-]?[0-9]{3})(?:[\s-]?[0-9]{4})/g;

    const matches = text.match(phoneRegex);

    if (!matches) return '';

    for (let phone of matches) {
      phone = phone.replace(/[^\d+]/g, '');

      if (phone.startsWith('+27')) {
        phone = '0' + phone.substring(3);
      } else if (phone.startsWith('27')) {
        phone = '0' + phone.substring(2);
      }

      if (/^0[6-8][0-9]{8}$/.test(phone)) {
        return phone;
      }
    }

    return '';
  };

  const extractEmail = (text) => {
    if (!text) return '';

    const match = text.match(
      /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/i
    );

    return match?.[0]?.trim() || '';
  };

  const formatCVText = (text) => {
    if (!text) return '';

    return text
      .replace(/\r/g, '')
      .replace(
        /(PERSONAL DETAILS|PROFILE|SUMMARY|EDUCATION|EXPERIENCE|EMPLOYMENT HISTORY|WORK EXPERIENCE|SKILLS|REFERENCES|CERTIFICATIONS|QUALIFICATIONS|PROJECTS|PROFESSIONAL EXPERIENCE)/gi,
        '\n\n====================\n$1\n====================\n'
      )
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const extractHighestEducation = (text) => {
    if (!text) return '';

    const keywords = [
      'Honours',
      'Degree',
      'Diploma',
      'Certificate',
      'Matric',
      'Bachelor',
      'Masters',
      'Master',
      'NQF',
      'National Diploma',
      'Postgraduate',
      'Doctorate',
      'N1',
      'N2',
      'N3',
      'N4',
      'N5',
      'N6',
    ];

    const lines = text.split('\n');

    for (const line of lines) {
      if (
        keywords.some((keyword) =>
          line.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        return line.trim();
      }
    }

    return '';
  };

  // -----------------------------------------------------------------------
  // EXPERIENCE PARSER
  // -----------------------------------------------------------------------

  const parseExperienceSections = (cvText) => {
    if (!cvText || typeof cvText !== 'string') {
      return [];
    }

    const lines = cvText
      .split('\n')
      .map((line) => line.trim());

    const experiences = [];

    let currentExp = null;
    let insideExperienceSection = false;

    const dateRegex =
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–—]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i;

    const yearRangeRegex =
      /\b(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|present|current|ongoing|till date)\b/i;

    const numericDateRegex =
      /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\s*[-–—]\s*(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|present|current)\b/i;

    const isDateLine = (line) =>
      dateRegex.test(line) ||
      yearRangeRegex.test(line) ||
      numericDateRegex.test(line);

    const isExperienceHeading = (line) =>
      /^(experience|employment history|work experience|professional experience|career history)$/i.test(
        line.replace(/[:=]/g, '').trim()
      );

    const isSectionHeading = (line) =>
      /^(education|qualifications|skills|references|certifications|personal details|profile|summary|projects)$/i.test(
        line.replace(/[:=]/g, '').trim()
      );

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!line) continue;

      if (isExperienceHeading(line)) {
        insideExperienceSection = true;
        continue;
      }

      if (insideExperienceSection && isSectionHeading(line)) {
        if (currentExp) {
          experiences.push(currentExp);
          currentExp = null;
        }

        insideExperienceSection = false;
        continue;
      }

      /*
       * If we encounter a date range, start a new experience.
       */
      if (isDateLine(line)) {
        if (currentExp) {
          experiences.push(currentExp);
        }

        currentExp = {
          company: 'N/A',
          title: 'N/A',
          dates: line,
          responsibilities: [],
        };

        /*
         * Sometimes the date line is:
         *
         * Sales Manager | ABC Company | 2020 - 2024
         */
        const beforeDate = line
          .replace(
            dateRegex,
            ''
          )
          .replace(
            yearRangeRegex,
            ''
          )
          .replace(
            numericDateRegex,
            ''
          )
          .replace(/[|,:-]+$/g, '')
          .trim();

        if (beforeDate) {
          const parts = beforeDate
            .split(/\s+\|\s+|\s+at\s+|\s+@\s+/i)
            .map((part) => part.trim())
            .filter(Boolean);

          if (parts.length >= 2) {
            currentExp.title = parts[0];
            currentExp.company = parts[1];
          } else if (parts.length === 1) {
            currentExp.title = parts[0];
          }
        }

        continue;
      }

      if (!currentExp) {
        continue;
      }

      /*
       * Bullet/responsibility.
       */
      if (
        line.startsWith('•') ||
        line.startsWith('-') ||
        line.startsWith('*') ||
        line.startsWith('➢') ||
        line.startsWith('►') ||
        line.startsWith('·')
      ) {
        const cleaned = line
          .replace(/^[\s•\-*·➢►]+/, '')
          .trim();

        if (cleaned.length > 5) {
          currentExp.responsibilities.push(cleaned);
        }

        continue;
      }

      /*
       * Try to identify title/company from short lines immediately
       * following a date.
       */
      if (
        currentExp.title === 'N/A' &&
        line.length < 100
      ) {
        const parts = line
          .split(/\s+\|\s+|\s+at\s+|\s+@\s+/i)
          .map((part) => part.trim())
          .filter(Boolean);

        if (parts.length >= 2) {
          currentExp.title = parts[0];
          currentExp.company = parts[1];
        } else {
          currentExp.title = line;
        }

        continue;
      }

      /*
       * Short company-looking line.
       */
      if (
        currentExp.company === 'N/A' &&
        line.length < 100
      ) {
        currentExp.company = line;
        continue;
      }

      /*
       * Long unbulleted lines are often responsibilities.
       */
      if (line.length > 40) {
        currentExp.responsibilities.push(line);
      }
    }

    if (currentExp) {
      experiences.push(currentExp);
    }

    return experiences;
  };

  // -----------------------------------------------------------------------
  // QUALIFICATIONS
  // -----------------------------------------------------------------------

  const parseQualifications = (cvText) => {
    if (!cvText) return [];

    const match = cvText.match(
      /(EDUCATION|QUALIFICATIONS|CERTIFICATIONS)([\s\S]*?)(REFERENCES|SKILLS|EMPLOYMENT|EXPERIENCE|WORK EXPERIENCE|$)/i
    );

    if (!match) return [];

    return match[2]
      .split('\n')
      .map((item) =>
        item
          .replace(/^[\s•\-*·➢►]+/, '')
          .trim()
      )
      .filter((item) => item.length > 3);
  };

  // -----------------------------------------------------------------------
  // REFERENCES
  // -----------------------------------------------------------------------

  const parseReferences = (cvText) => {
    if (!cvText) return [];

    const match = cvText.match(
      /(REFERENCES)([\s\S]*?)$/i
    );

    if (!match) return [];

    return match[2]
      .split('\n')
      .map((item) =>
        item
          .replace(/^[\s•\-*·➢►]+/, '')
          .trim()
      )
      .filter((item) => item.length > 3);
  };

  // -----------------------------------------------------------------------
  // DUPLICATE CHECK
  // -----------------------------------------------------------------------

  const candidateExists = async (name, email) => {
    try {
      if (email) {
        const {
          data,
          error,
        } = await supabase
          .from('candidates')
          .select('id')
          .eq('email', email)
          .limit(1);

        if (error) throw error;

        return Boolean(data?.length);
      }

      if (
        name &&
        name !== 'Unknown Candidate'
      ) {
        const {
          data,
          error,
        } = await supabase
          .from('candidates')
          .select('id')
          .eq('name', name)
          .limit(1);

        if (error) throw error;

        return Boolean(data?.length);
      }

      return false;

    } catch (error) {
      console.error(
        'Duplicate check failed:',
        error
      );

      /*
       * Don't block CV importing if duplicate lookup itself fails.
       */
      return false;
    }
  };

  // -----------------------------------------------------------------------
  // PROCESS CV
  // -----------------------------------------------------------------------

  const handlePasteCV = async () => {
    if (!pastedCV?.trim()) {
      toast.error('Please paste CV text first.');
      return;
    }

    setPasting(true);

    try {
      const formattedCV = formatCVText(pastedCV);

      const extractedName =
        extractName(formattedCV);

      const extractedTitle =
        extractProfessionalTitle(formattedCV);

      const extractedEmail =
        extractEmail(formattedCV);

      const extractedPhone =
        extractPhone(formattedCV);

      const extractedLocation =
        extractField(
          formattedCV,
          'Location'
        );

      const extractedIndustry =
        extractField(
          formattedCV,
          'Industry'
        );

      const extractedSalary =
        extractField(
          formattedCV,
          'Salary'
        );

      const extractedEducation =
        extractHighestEducation(
          formattedCV
        );

      const exists =
        await candidateExists(
          extractedName,
          extractedEmail
        );

      if (exists) {
        toast.error(
          'Duplicate candidate detected.'
        );

        return;
      }

      const candidatePayload = {
        name: extractedName,
        email:
          extractedEmail || null,
        phone:
          extractedPhone || null,
        title:
          extractedTitle || 'Candidate',
        location:
          extractedLocation || '',
        skills: [],
        experience: '',
        education:
          extractedEducation || '',
        industry:
          extractedIndustry || '',
        salary:
          extractedSalary || '',
        cv_text:
          formattedCV,
        notes: '',
        user_id:
          selectedUserId || null,
      };

      const {
        error,
      } = await supabase
        .from('candidates')
        .insert([candidatePayload]);

      if (error) {
        throw error;
      }

      toast.success(
        'CV Parsed & Saved Successfully!'
      );

      setPastedCV('');
      setSelectedUserId('');

      await fetchCandidates();

    } catch (error) {
      console.error(
        'Process CV Error:',
        error
      );

      toast.error(
        error?.message ||
          'Failed to process CV.'
      );
    } finally {
      setPasting(false);
    }
  };

  // -----------------------------------------------------------------------
  // DELETE CANDIDATE
  // -----------------------------------------------------------------------

  const deleteCandidate = async (id) => {
    if (!id) return;

    const confirmed =
      window.confirm(
        'Delete this candidate? This cannot be undone.'
      );

    if (!confirmed) return;

    try {
      const {
        error,
      } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success(
        'Candidate deleted.'
      );

      if (
        previewCandidate?.id === id
      ) {
        setPreviewCandidate(null);
      }

      await fetchCandidates();

    } catch (error) {
      console.error(
        'Delete candidate error:',
        error
      );

      toast.error(
        error?.message ||
          'Delete failed.'
      );
    }
  };

  // -----------------------------------------------------------------------
  // REFRESH
  // -----------------------------------------------------------------------

  const refreshDashboard = async () => {
    if (!authenticatedUser) return;

    setLoadingData(true);

    try {
      await loadDashboardData(
        authenticatedUser
      );

      toast.success(
        'Dashboard refreshed.'
      );

    } catch (error) {
      toast.error(
        error?.message ||
          'Unable to refresh dashboard.'
      );
    } finally {
      setLoadingData(false);
    }
  };

  // -----------------------------------------------------------------------
  // SEARCH
  // -----------------------------------------------------------------------

  const filteredUsers = useMemo(() => {
    const search =
      userSearch
        .trim()
        .toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter(
      (user) =>
        String(
          user.full_name || ''
        )
          .toLowerCase()
          .includes(search) ||
        String(
          user.email || ''
        )
          .toLowerCase()
          .includes(search) ||
        String(
          user.role || ''
        )
          .toLowerCase()
          .includes(search) ||
        String(
          user.plan || ''
        )
          .toLowerCase()
          .includes(search)
    );
  }, [users, userSearch]);

  const filteredCandidates = useMemo(() => {
    const search =
      candidateSearch
        .trim()
        .toLowerCase();

    if (!search) {
      return candidates;
    }

    return candidates.filter(
      (candidate) =>
        String(
          candidate.name || ''
        )
          .toLowerCase()
          .includes(search) ||
        String(
          candidate.email || ''
        )
          .toLowerCase()
          .includes(search) ||
        String(
          candidate.phone || ''
        )
          .toLowerCase()
          .includes(search) ||
        String(
          candidate.title || ''
        )
          .toLowerCase()
          .includes(search) ||
        String(
          candidate.location || ''
        )
          .toLowerCase()
          .includes(search) ||
        String(
          candidate.industry || ''
        )
          .toLowerCase()
          .includes(search)
    );
  }, [
    candidates,
    candidateSearch,
  ]);

  // -----------------------------------------------------------------------
  // SUBSCRIPTION / REVENUE CALCULATIONS
  // -----------------------------------------------------------------------

  const activeSubscriptions =
    useMemo(() => {
      return subscriptions.filter(
        (subscription) => {
          const status =
            String(
              subscription.status ||
                subscription.subscription_status ||
                ''
            ).toLowerCase();

          return [
            'active',
            'paid',
            'current',
            'trialing',
          ].includes(status);
        }
      );
    }, [subscriptions]);

  const revenue = useMemo(() => {
    return subscriptions.reduce(
      (total, subscription) => {
        const possibleAmount =
          subscription.amount ??
          subscription.price ??
          subscription.monthly_amount ??
          subscription.total ??
          subscription.value ??
          0;

        const numeric =
          Number(
            String(
              possibleAmount
            ).replace(
              /[^0-9.-]/g,
              ''
            )
          ) || 0;

        return total + numeric;
      },
      0
    );
  }, [subscriptions]);

  const adminCount = useMemo(() => {
    return users.filter(
      (user) =>
        String(user.role)
          .toLowerCase() ===
        'admin'
    ).length;
  }, [users]);

  const developerCount = useMemo(() => {
    return users.filter(
      (user) =>
        String(user.role)
          .toLowerCase() ===
        'developer'
    ).length;
  }, [users]);

  // -----------------------------------------------------------------------
  // AUTH LOADING
  // -----------------------------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw
            className="mx-auto mb-4 animate-spin text-red-500"
            size={40}
          />

          <h2 className="text-xl font-bold">
            Verifying administrator access...
          </h2>

          <p className="text-gray-500 mt-2">
            Checking your Supabase authentication
            and user role.
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // ACCESS DENIED
  // -----------------------------------------------------------------------

  if (!authenticatedUser || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border max-w-2xl w-full p-10 text-center">

          <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-6">
            <Lock
              size={40}
              className="text-red-500"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {!authenticatedUser
              ? 'Authentication Required'
              : 'Access Denied'}
          </h1>

          <p className="text-gray-600 mt-3">
            {!authenticatedUser
              ? 'Your HireResQ dashboard does not currently have a valid Supabase authentication session.'
              : 'This page is restricted to administrators and developers.'}
          </p>

          <div className="mt-8 bg-gray-50 border rounded-xl p-6 text-left space-y-5">

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Signed-in account
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {authenticatedUser?.email ||
                  'Not authenticated'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Current role
              </p>

              <p className="font-semibold text-gray-900 mt-1">
                {currentRole ||
                  'No admin/developer role found'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Account ID
              </p>

              <p className="font-mono text-sm text-gray-700 mt-1 break-all">
                {authenticatedUser?.id ||
                  'Not authenticated'}
              </p>
            </div>

          </div>

          {authorizationError && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-left flex gap-3">
              <AlertCircle
                className="shrink-0"
                size={20}
              />

              <div>
                <p className="font-semibold">
                  Authorization error
                </p>

                <p className="text-sm mt-1">
                  {authorizationError}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">

            <Button
              onClick={
                initializeAdminDashboard
              }
            >
              <RefreshCw
                size={16}
                className="mr-2"
              />
              Check Again
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();

                window.location.href =
                  '/login';
              }}
            >
              Sign Out
            </Button>

          </div>

          <p className="text-xs text-gray-400 mt-8">
            Admin access is controlled by
            public.user_roles. Subscription plans
            do not grant administrator access.
          </p>

        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // MAIN DASHBOARD
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* --------------------------------------------------------------- */}
        {/* HEADER */}
        {/* --------------------------------------------------------------- */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                <CheckCircle2
                  size={14}
                />
                {currentRole}
              </span>

            </div>

            <p className="text-gray-500 mt-1">
              Users, candidates, subscriptions,
              revenue and CV management
            </p>
          </div>

          <Button
            variant="outline"
            onClick={refreshDashboard}
            disabled={loadingData}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${
                loadingData
                  ? 'animate-spin'
                  : ''
              }`}
            />
            Refresh
          </Button>

        </div>

        {/* --------------------------------------------------------------- */}
        {/* ERROR */}
        {/* --------------------------------------------------------------- */}

        {dataError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 flex gap-3">

            <AlertCircle
              size={20}
              className="shrink-0"
            />

            <div>
              <p className="font-semibold">
                Some dashboard data could not be loaded
              </p>

              <p className="text-sm mt-1">
                {dataError}
              </p>
            </div>

          </div>
        )}

        {/* --------------------------------------------------------------- */}
        {/* TOP STAT CARDS */}
        {/* --------------------------------------------------------------- */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          <StatCard
            label="Users"
            value={users.length}
            description="Registered profiles"
            icon={<Users size={24} />}
          />

          <StatCard
            label="Candidates"
            value={candidates.length}
            description="Candidate records"
            icon={<FileText size={24} />}
          />

          <StatCard
            label="Subscriptions"
            value={activeSubscriptions.length}
            description={`${subscriptions.length} total records`}
            icon={<CreditCard size={24} />}
          />

          <StatCard
            label="Revenue"
            value={`R ${revenue.toLocaleString(
              'en-ZA',
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
            description="From available subscription data"
            icon={<DollarSign size={24} />}
          />

        </div>

        {/* --------------------------------------------------------------- */}
        {/* AUTHORIZATION STATUS */}
        {/* --------------------------------------------------------------- */}

        <Card className="mb-8">

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck
                size={20}
                className="text-green-600"
              />
              Authorization Status
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <StatusBox
                label="Supabase Authentication"
                value="Authenticated"
              />

              <StatusBox
                label="Authorization Source"
                value="public.user_roles"
              />

              <StatusBox
                label="Current Role"
                value={currentRole}
              />

            </div>

          </CardContent>

        </Card>

        {/* --------------------------------------------------------------- */}
        {/* USERS */}
        {/* --------------------------------------------------------------- */}

        <Card className="mb-8">

          <CardHeader>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Users
              </CardTitle>

              <div className="relative w-full md:w-80">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={userSearch}
                  onChange={(e) =>
                    setUserSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />

              </div>

            </div>

          </CardHeader>

          <CardContent>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

              <MiniStat
                icon={<Users size={18} />}
                label="Total Users"
                value={users.length}
              />

              <MiniStat
                icon={<UserCog size={18} />}
                label="Admin Records"
                value={adminCount}
              />

              <MiniStat
                icon={<Code2 size={18} />}
                label="Developer Records"
                value={developerCount}
              />

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3 px-3">
                      Name
                    </th>

                    <th className="py-3 px-3">
                      Email
                    </th>

                    <th className="py-3 px-3">
                      Role
                    </th>

                    <th className="py-3 px-3">
                      Plan
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredUsers.length === 0 ? (

                    <tr>
                      <td
                        colSpan="4"
                        className="py-8 text-center text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>

                  ) : (

                    filteredUsers.map(
                      (user) => (
                        <tr
                          key={user.id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >

                          <td className="py-4 px-3 font-medium">
                            {user.full_name ||
                              'Unnamed User'}
                          </td>

                          <td className="py-4 px-3 text-gray-600">
                            {user.email ||
                              'No email'}
                          </td>

                          <td className="py-4 px-3">

                            <RoleBadge
                              role={
                                user.role
                              }
                            />

                          </td>

                          <td className="py-4 px-3 text-gray-600">
                            {user.plan ||
                              'Unknown'}
                          </td>

                        </tr>
                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </CardContent>

        </Card>

        {/* --------------------------------------------------------------- */}
        {/* PASTE CV */}
        {/* --------------------------------------------------------------- */}

        <Card className="mb-8">

          <CardHeader>

            <CardTitle className="flex items-center gap-2">
              <ClipboardPaste size={20} />
              Paste Candidate CV
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-6">

            <Textarea
              value={pastedCV}
              onChange={(e) =>
                setPastedCV(
                  e.target.value
                )
              }
              placeholder="Paste the full CV text here..."
              rows={14}
            />

            <div>

              <label className="block text-sm font-medium mb-2">
                Assign to User
              </label>

              <select
                value={selectedUserId}
                onChange={(e) =>
                  setSelectedUserId(
                    e.target.value
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >

                <option value="">
                  Assign to All / Current Admin
                </option>

                {users.map(
                  (user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.full_name ||
                        user.email}
                      {' — '}
                      {user.email}
                    </option>
                  )
                )}

              </select>

            </div>

            <Button
              onClick={handlePasteCV}
              disabled={
                pasting ||
                !pastedCV.trim()
              }
              className="w-full"
            >

              <ClipboardPaste
                size={18}
                className="mr-2"
              />

              {pasting
                ? 'Processing...'
                : 'Process CV'}

            </Button>

          </CardContent>

        </Card>

        {/* --------------------------------------------------------------- */}
        {/* CANDIDATES */}
        {/* --------------------------------------------------------------- */}

        <Card className="mb-8">

          <CardHeader>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Candidates
                <span className="text-gray-400">
                  ({filteredCandidates.length})
                </span>
              </CardTitle>

              <div className="relative w-full md:w-96">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={
                    candidateSearch
                  }
                  onChange={(e) =>
                    setCandidateSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search candidates..."
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />

              </div>

            </div>

          </CardHeader>

          <CardContent>

            {filteredCandidates.length ===
            0 ? (

              <div className="py-12 text-center text-gray-500">
                <FileText
                  size={40}
                  className="mx-auto mb-3 text-gray-300"
                />

                <p>
                  No candidates found.
                </p>
              </div>

            ) : (

              <div className="space-y-4">

                {filteredCandidates.map(
                  (candidate) => (

                    <div
                      key={
                        candidate.id
                      }
                      className="border rounded-xl p-5 bg-white hover:shadow-sm transition"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div className="min-w-0">

                          <h2 className="text-xl font-bold text-gray-900">
                            {candidate.name ||
                              'Unknown Candidate'}
                          </h2>

                          <p className="text-red-600 font-medium mt-1">
                            {candidate.title ||
                              'Candidate'}
                          </p>

                          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-gray-500">

                            {candidate.email && (
                              <span className="flex items-center gap-1">
                                <Mail
                                  size={15}
                                />
                                {candidate.email}
                              </span>
                            )}

                            {candidate.phone && (
                              <span className="flex items-center gap-1">
                                <Phone
                                  size={15}
                                />
                                {candidate.phone}
                              </span>
                            )}

                            {candidate.location && (
                              <span className="flex items-center gap-1">
                                <MapPin
                                  size={15}
                                />
                                {candidate.location}
                              </span>
                            )}

                          </div>

                        </div>

                        <div className="flex gap-2 shrink-0">

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setPreviewCandidate(
                                candidate
                              )
                            }
                          >
                            <Eye
                              size={16}
                              className="mr-2"
                            />
                            Preview
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              deleteCandidate(
                                candidate.id
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
                          </Button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </CardContent>

        </Card>

        {/* --------------------------------------------------------------- */}
        {/* SUBSCRIPTIONS */}
        {/* --------------------------------------------------------------- */}

        <Card className="mb-8">

          <CardHeader>

            <CardTitle className="flex items-center gap-2">
              <CreditCard size={20} />
              Subscriptions
            </CardTitle>

          </CardHeader>

          <CardContent>

            {subscriptions.length ===
            0 ? (

              <div className="py-10 text-center text-gray-500">

                <CreditCard
                  size={38}
                  className="mx-auto mb-3 text-gray-300"
                />

                <p className="font-medium">
                  No subscription records found.
                </p>

                <p className="text-sm mt-1">
                  Revenue will remain R 0,00 until
                  subscription/payment data is available.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b text-left text-gray-500">

                      <th className="py-3 px-3">
                        User
                      </th>

                      <th className="py-3 px-3">
                        Plan
                      </th>

                      <th className="py-3 px-3">
                        Status
                      </th>

                      <th className="py-3 px-3">
                        Amount
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {subscriptions.map(
                      (subscription, index) => {

                        const amount =
                          subscription.amount ??
                          subscription.price ??
                          subscription.monthly_amount ??
                          subscription.total ??
                          0;

                        const status =
                          subscription.status ??
                          subscription.subscription_status ??
                          'Unknown';

                        const plan =
                          subscription.plan ??
                          subscription.plan_name ??
                          subscription.product ??
                          'Unknown';

                        return (
                          <tr
                            key={
                              subscription.id ||
                              index
                            }
                            className="border-b last:border-0"
                          >

                            <td className="py-4 px-3">
                              {subscription.email ||
                                subscription.user_email ||
                                subscription.user_id ||
                                'Unknown'}
                            </td>

                            <td className="py-4 px-3">
                              {plan}
                            </td>

                            <td className="py-4 px-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100">
                                {String(
                                  status
                                )}
                              </span>
                            </td>

                            <td className="py-4 px-3 font-semibold">
                              R{' '}
                              {Number(
                                String(
                                  amount
                                ).replace(
                                  /[^0-9.-]/g,
                                  ''
                                )
                              ).toLocaleString(
                                'en-ZA',
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </CardContent>

        </Card>

      </div>

      {/* ---------------------------------------------------------------- */}
      {/* CANDIDATE PREVIEW MODAL */}
      {/* ---------------------------------------------------------------- */}

      {previewCandidate && (
        <CandidatePreviewModal
          candidate={
            previewCandidate
          }
          onClose={() =>
            setPreviewCandidate(
              null
            )
          }
          parseExperienceSections={
            parseExperienceSections
          }
          parseQualifications={
            parseQualifications
          }
          parseReferences={
            parseReferences
          }
          extractField={
            extractField
          }
        />
      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  label,
  value,
  description,
  icon,
}) {
  return (
    <Card>

      <CardContent className="p-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-sm text-gray-500">
              {label}
            </p>

            <p className="text-3xl font-bold mt-2 text-gray-900">
              {value}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              {description}
            </p>

          </div>

          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            {icon}
          </div>

        </div>

      </CardContent>

    </Card>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS BOX
|--------------------------------------------------------------------------
*/

function StatusBox({
  label,
  value,
}) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">

      <div className="flex items-center gap-2 text-green-600">

        <CheckCircle2
          size={18}
        />

        <span className="text-xs text-gray-500">
          {label}
        </span>

      </div>

      <p className="font-semibold text-gray-900 mt-2">
        {value}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MINI STAT
|--------------------------------------------------------------------------
*/

function MiniStat({
  icon,
  label,
  value,
}) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">

      <div className="flex items-center gap-2 text-gray-600">

        {icon}

        <span className="text-sm">
          {label}
        </span>

      </div>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ROLE BADGE
|--------------------------------------------------------------------------
*/

function RoleBadge({
  role,
}) {
  const normalized =
    String(
      role || 'recruiter'
    ).toLowerCase();

  if (normalized === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
        <ShieldCheck
          size={13}
        />
        admin
      </span>
    );
  }

  if (
    normalized ===
    'developer'
  ) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
        <Code2
          size={13}
        />
        developer
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      recruiter
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| CANDIDATE PREVIEW MODAL
|--------------------------------------------------------------------------
*/

function CandidatePreviewModal({
  candidate,
  onClose,
  parseExperienceSections,
  parseQualifications,
  parseReferences,
  extractField,
}) {
  const experiences =
    parseExperienceSections(
      candidate.cv_text
    );

  const qualifications =
    parseQualifications(
      candidate.cv_text
    );

  const references =
    parseReferences(
      candidate.cv_text
    );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[92vh] overflow-y-auto relative shadow-2xl">

        {/* CLOSE */}

        <button
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-gray-900"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X size={22} />
        </button>

        <div className="p-6 md:p-10">

          {/* ----------------------------------------------------------- */}
          {/* HEADER */}
          {/* ----------------------------------------------------------- */}

          <div className="border-b pb-8 mb-8">

            <h2 className="text-4xl font-bold text-gray-900 pr-12">
              {candidate.name ||
                'Unknown Candidate'}
            </h2>

            <p className="text-2xl text-red-600 font-semibold mt-2">
              {candidate.title ||
                'Candidate'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8 bg-gray-50 rounded-2xl p-6">

              <InfoItem
                icon={<Mail size={16} />}
                label="Email"
                value={
                  candidate.email
                }
              />

              <InfoItem
                icon={<Phone size={16} />}
                label="Phone"
                value={
                  candidate.phone
                }
              />

              <InfoItem
                icon={<MapPin size={16} />}
                label="Location"
                value={
                  candidate.location
                }
              />

              <InfoItem
                icon={<Building2 size={16} />}
                label="Industry"
                value={
                  candidate.industry
                }
              />

              <InfoItem
                icon={<Briefcase size={16} />}
                label="Salary"
                value={
                  extractField(
                    candidate.cv_text,
                    'Salary'
                  ) ||
                  candidate.salary
                }
              />

              <InfoItem
                icon={<Calendar size={16} />}
                label="Age"
                value={extractField(
                  candidate.cv_text,
                  'Age'
                )}
              />

              <InfoItem
                label="ID Number"
                value={
                  extractField(
                    candidate.cv_text,
                    'ID No'
                  ) ||
                  extractField(
                    candidate.cv_text,
                    'ID'
                  )
                }
              />

              <InfoItem
                label="Gender"
                value={extractField(
                  candidate.cv_text,
                  'Gender'
                )}
              />

              <InfoItem
                label="Nationality"
                value={extractField(
                  candidate.cv_text,
                  'Nationality'
                )}
              />

              <InfoItem
                label="Ethnicity"
                value={extractField(
                  candidate.cv_text,
                  'Ethnicity'
                )}
              />

            </div>

          </div>

          {/* ----------------------------------------------------------- */}
          {/* WORK EXPERIENCE */}
          {/* ----------------------------------------------------------- */}

          <section className="mb-10">

            <SectionTitle>
              Work Experience
            </SectionTitle>

            {experiences.length ===
            0 ? (

              <p className="text-gray-500 italic">
                No experience data found.
              </p>

            ) : (

              <div className="space-y-8">

                {experiences.map(
                  (experience, index) => (

                    <div
                      key={index}
                      className="border-b pb-7 last:border-0"
                    >

                      <div className="grid md:grid-cols-3 gap-6">

                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Company
                          </p>

                          <p className="font-bold text-lg mt-1">
                            {experience.company ||
                              'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Position
                          </p>

                          <p className="font-semibold mt-1">
                            {experience.title ||
                              'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            Employment Period
                          </p>

                          <p className="mt-1">
                            {experience.dates ||
                              'N/A'}
                          </p>
                        </div>

                      </div>

                      {experience.responsibilities
                        ?.length > 0 && (

                        <div className="mt-5">

                          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                            Responsibilities
                          </p>

                          <ul className="list-disc pl-6 space-y-2 text-gray-700">

                            {experience.responsibilities.map(
                              (
                                responsibility,
                                responsibilityIndex
                              ) => (
                                <li
                                  key={
                                    responsibilityIndex
                                  }
                                >
                                  {
                                    responsibility
                                  }
                                </li>
                              )
                            )}

                          </ul>

                        </div>

                      )}

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          {/* ----------------------------------------------------------- */}
          {/* QUALIFICATIONS */}
          {/* ----------------------------------------------------------- */}

          <section className="mb-10">

            <SectionTitle>
              <span className="flex items-center gap-2">
                <GraduationCap
                  size={22}
                />
                Qualifications
              </span>
            </SectionTitle>

            {qualifications.length ===
            0 ? (

              <p className="text-gray-500 italic">
                No qualifications found.
              </p>

            ) : (

              <ul className="list-disc pl-6 space-y-2 text-gray-700">

                {qualifications.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}

              </ul>

            )}

          </section>

          {/* ----------------------------------------------------------- */}
          {/* REFERENCES */}
          {/* ----------------------------------------------------------- */}

          <section className="mb-10">

            <SectionTitle>
              References
            </SectionTitle>

            {references.length ===
            0 ? (

              <p className="text-gray-500 italic">
                No references supplied.
              </p>

            ) : (

              <ul className="list-disc pl-6 space-y-2 text-gray-700">

                {references.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}

              </ul>

            )}

          </section>

          {/* ----------------------------------------------------------- */}
          {/* RAW CV */}
          {/* ----------------------------------------------------------- */}

          {candidate.cv_text && (
            <section>

              <SectionTitle>
                Original CV Text
              </SectionTitle>

              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 border rounded-xl p-5 max-h-96 overflow-y-auto">
                {candidate.cv_text}
              </pre>

            </section>
          )}

        </div>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs text-gray-500 flex items-center gap-1">
        {icon}
        {label}
      </p>

      <p className="font-medium mt-1 break-words">
        {value || 'N/A'}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SECTION TITLE
|--------------------------------------------------------------------------
*/

function SectionTitle({
  children,
}) {
  return (
    <h3 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-900">
      {children}
    </h3>
  );
}
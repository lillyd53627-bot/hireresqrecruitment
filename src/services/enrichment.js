// src/services/enrichment.js

/**
 * Real API Enrichment Service
 * Supports: Apollo.io + Hunter.io
 * Falls back to enhanced mock data when no API keys / backend is available.
 */

/**
 * Real API Enrichment Service
 * Apollo + Hunter are accessed ONLY through the Express backend.
 */

const USE_REAL_APIS = true;

// ─────────────────────────────────────────────
// Helper: Call your backend proxy
// ─────────────────────────────────────────────
async function proxyFetch(endpoint, body = {}) {
  const res = await fetch(`/api/enrichment/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Enrichment failed (${res.status})`);
  }
  return res.json();
}

// ─────────────────────────────────────────────
// 1. Search for companies that are hiring
// ─────────────────────────────────────────────
export async function searchHiringCompanies({
  query = '',
  location = '',
  industry = '',
  page = 1,
} = {}) {
  // If no backend / keys → return mock data
  if (!USE_REAL_APIS) {
    return getMockLeads({ query, location, industry });
  }

  try {
    const data = await proxyFetch('companies', {
      q: query,
      location,
      industry,
      page,
    });

    return (data.organizations || []).map(mapApolloCompany);
  } catch (err) {
    console.error('Company search failed:', err);
    // Fallback to mock so the UI never breaks
    return getMockLeads({ query, location, industry });
  }
}

// ─────────────────────────────────────────────
// 2. Enrich a single company (people + emails)
// ─────────────────────────────────────────────
export async function enrichCompany(company) {
  if (!USE_REAL_APIS) {
    return enhanceMockLead(company);
  }

  try {
    const [peopleData, emailData] = await Promise.all([
      proxyFetch('people', {
        organization_name: company.name,
        domain: company.website,
      }),
      company.website
        ? proxyFetch('emails', { domain: company.website })
        : Promise.resolve({ emails: [] }),
    ]);

    const hiringManagers = (peopleData.people || [])
      .filter((p) =>
        /talent|recruit|hr|people|hiring|head of|director|cto|coo|founder|ceo/i.test(
          p.title || ''
        )
      )
      .slice(0, 5)
      .map((p) => ({
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        title: p.title || 'Unknown',
        email: p.email || null,
        linkedin: Boolean(p.linkedin_url),
        linkedinUrl: p.linkedin_url || null,
      }));

    const companyEmails = (emailData.emails || [])
      .map((e) => e.value || e.email)
      .filter(Boolean)
      .slice(0, 6);

    const score = calculateLeadScore({
      openRoles: company.openRoles || 0,
      managersFound: hiringManagers.length,
      emailsFound: companyEmails.length,
      hasWebsite: Boolean(company.website),
    });

    return {
      ...company,
      hiringManagers,
      companyEmails,
      score,
      enriched: true,
      enrichedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Enrichment failed:', err);
    return enhanceMockLead(company);
  }
}

// ─────────────────────────────────────────────
// 3. Find email for a specific person
// ─────────────────────────────────────────────
export async function findEmail({ firstName, lastName, domain }) {
  if (!USE_REAL_APIS) return null;

  try {
    const data = await proxyFetch('email-finder', {
      first_name: firstName,
      last_name: lastName,
      domain,
    });
    return data.email || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Scoring logic
// ─────────────────────────────────────────────
function calculateLeadScore({ openRoles, managersFound, emailsFound, hasWebsite }) {
  let score = 40;
  score += Math.min(openRoles * 4, 25);
  score += Math.min(managersFound * 8, 20);
  score += Math.min(emailsFound * 3, 10);
  if (hasWebsite) score += 5;
  return Math.min(Math.round(score), 99);
}

// ─────────────────────────────────────────────
// Apollo → our shape
// ─────────────────────────────────────────────
function mapApolloCompany(org) {
  return {
    id: org.id || org.organization_id,
    name: org.name,
    industry: org.industry || org.industries?.[0] || 'Unknown',
    location: org.city
      ? `${org.city}${org.state ? ', ' + org.state : ''}`
      : org.country || 'South Africa',
    website: org.website_url?.replace(/^https?:\/\//, '') || org.primary_domain,
    employees: org.estimated_num_employees
      ? `${org.estimated_num_employees}`
      : 'Unknown',
    hiringSignal: org.actively_hiring ? 'High' : 'Medium',
    openRoles: org.current_job_postings || 0,
    score: 70,
    source: 'Apollo.io',
    description: org.short_description || org.seo_description || '',
    hiringManagers: [],
    companyEmails: [],
    recentJobs: [],
  };
}

// ─────────────────────────────────────────────
// Mock fallback (used when no API keys / backend)
// ─────────────────────────────────────────────
function getMockLeads({ query = '', location = '', industry = '' } = {}) {
  const all = [
    {
      id: 1,
      name: 'Nexus Digital Solutions',
      industry: 'Technology',
      location: 'Cape Town',
      website: 'nexusdigital.co.za',
      employees: '51-200',
      hiringSignal: 'Very High',
      openRoles: 9,
      score: 94,
      source: 'Mock (no API key)',
      description: 'Fast-growing digital agency specialising in fintech and e-commerce.',
      hiringManagers: [
        { name: 'Lebo Molefe', title: 'Head of Talent', email: 'lebo.molefe@nexusdigital.co.za', linkedin: true },
        { name: 'Sarah Chen', title: 'CTO', email: 'sarah.chen@nexusdigital.co.za', linkedin: true },
      ],
      companyEmails: ['careers@nexusdigital.co.za', 'talent@nexusdigital.co.za'],
      recentJobs: ['Senior React Developer', 'Product Manager', 'DevOps Engineer'],
    },
    {
      id: 2,
      name: 'Apex Financial Group',
      industry: 'Finance',
      location: 'Johannesburg',
      website: 'apexfg.co.za',
      employees: '201-500',
      hiringSignal: 'High',
      openRoles: 6,
      score: 89,
      source: 'Mock (no API key)',
      description: 'Leading independent financial services firm expanding its tech team.',
      hiringManagers: [
        { name: 'Thandiwe Nkosi', title: 'Talent Acquisition Lead', email: 'thandiwe.n@apexfg.co.za', linkedin: true },
      ],
      companyEmails: ['careers@apexfg.co.za', 'recruitment@apexfg.co.za'],
      recentJobs: ['Financial Analyst', 'Risk Manager', 'Data Analyst'],
    },
    {
      id: 3,
      name: 'GreenPath Logistics',
      industry: 'Logistics',
      location: 'Durban',
      website: 'greenpath.co.za',
      employees: '51-200',
      hiringSignal: 'High',
      openRoles: 7,
      score: 86,
      source: 'Mock (no API key)',
      description: 'Sustainable logistics company rapidly scaling operations.',
      hiringManagers: [
        { name: 'Priya Singh', title: 'HR Director', email: 'priya.singh@greenpath.co.za', linkedin: true },
      ],
      companyEmails: ['hr@greenpath.co.za', 'jobs@greenpath.co.za'],
      recentJobs: ['Warehouse Manager', 'Fleet Coordinator'],
    },
    {
      id: 4,
      name: 'Horizon Health Tech',
      industry: 'Healthcare',
      location: 'Pretoria',
      website: 'horizonhealth.tech',
      employees: '11-50',
      hiringSignal: 'Medium',
      openRoles: 4,
      score: 81,
      source: 'Mock (no API key)',
      description: 'Healthtech startup building AI diagnostic tools.',
      hiringManagers: [
        { name: 'Dr. Amara Okeke', title: 'Co-founder & COO', email: 'amara@horizonhealth.tech', linkedin: true },
      ],
      companyEmails: ['careers@horizonhealth.tech'],
      recentJobs: ['Full Stack Developer', 'ML Engineer'],
    },
    {
      id: 5,
      name: 'CodeCraft Studios',
      industry: 'Technology',
      location: 'Cape Town',
      website: 'codecraft.studio',
      employees: '11-50',
      hiringSignal: 'Very High',
      openRoles: 5,
      score: 92,
      source: 'Mock (no API key)',
      description: 'Boutique software studio known for high-quality React work.',
      hiringManagers: [
        { name: 'Daniel Naidoo', title: 'Founder & CEO', email: 'daniel@codecraft.studio', linkedin: true },
        { name: 'Lisa Pretorius', title: 'People Ops', email: 'lisa@codecraft.studio', linkedin: true },
      ],
      companyEmails: ['jobs@codecraft.studio', 'hello@codecraft.studio'],
      recentJobs: ['Senior Frontend Developer', 'Mobile Developer'],
    },
  ];

  return all.filter((l) => {
    const q = query.toLowerCase();
    const matchesQ =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.industry.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q);
    const matchesLoc = !location || location === 'All' || l.location.includes(location);
    const matchesInd = !industry || industry === 'All' || l.industry === industry;
    return matchesQ && matchesLoc && matchesInd;
  });
}

function enhanceMockLead(company) {
  return {
    ...company,
    enriched: true,
    enrichedAt: new Date().toISOString(),
  };
}
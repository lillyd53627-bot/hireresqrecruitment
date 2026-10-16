// src/services/enrichment.js
/**
 * HireResQ – Real API Enrichment Service
 *
 * Apollo + Hunter are accessed ONLY through the Express backend.
 * There is NO mock / fake company fallback.
 *
 * Success → real data
 * Failure → throw Error (UI must show the error)
 */

const API_BASE = '/api/enrichment';

// ─────────────────────────────────────────────
// Helper: call backend proxy
// ─────────────────────────────────────────────
async function proxyFetch(endpoint, body = {}) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Enrichment request failed (${res.status})`
    );
  }

  return data;
}

// ─────────────────────────────────────────────
// 1. Search companies currently hiring
// ─────────────────────────────────────────────
export async function searchHiringCompanies({
  query = '',
  location = '',
  industry = '',
  page = 1,
  perPage = 25,
} = {}) {
  const data = await proxyFetch('companies', {
    q: query,
    location,
    industry,
    page,
    per_page: perPage,
  });

  const orgs = data.organizations || data.companies || [];

  if (!Array.isArray(orgs) || orgs.length === 0) {
    return [];
  }

  return orgs.map(mapApolloCompany);
}

// ─────────────────────────────────────────────
// 2. Enrich one company (people + emails)
// ─────────────────────────────────────────────
export async function enrichCompany(company) {
  if (!company?.name && !company?.website) {
    throw new Error('Company name or website is required for enrichment.');
  }

  const [peopleData, emailData] = await Promise.all([
    proxyFetch('people', {
      organization_name: company.name,
      domain: company.website || company.domain || null,
    }),
    company.website || company.domain
      ? proxyFetch('emails', {
          domain: (company.website || company.domain || '')
            .replace(/^https?:\/\//, '')
            .replace(/\/$/, ''),
        })
      : Promise.resolve({ emails: [] }),
  ]);

  const people = peopleData.people || peopleData.contacts || [];

  const hiringManagers = people
    .filter((p) =>
      /talent|recruit|hr|people|hiring|head of|director|cto|coo|founder|ceo|vp/i.test(
        p.title || ''
      )
    )
    .slice(0, 8)
    .map((p) => ({
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
      title: p.title || 'Unknown',
      email: p.email || null,
      linkedin: Boolean(p.linkedin_url),
      linkedinUrl: p.linkedin_url || null,
    }));

  const companyEmails = (emailData.emails || [])
    .map((e) => e.value || e.email)
    .filter(Boolean)
    .slice(0, 8);

  const score = calculateLeadScore({
    openRoles: company.openRoles || company.open_roles || 0,
    managersFound: hiringManagers.length,
    emailsFound: companyEmails.length,
    hasWebsite: Boolean(company.website || company.domain),
  });

  return {
    ...company,
    hiringManagers,
    companyEmails,
    score,
    enriched: true,
    enrichedAt: new Date().toISOString(),
    source: company.source || 'Apollo.io',
  };
}

// ─────────────────────────────────────────────
// 3. Find email for a specific person (Hunter)
// ─────────────────────────────────────────────
export async function findEmail({ firstName, lastName, domain }) {
  if (!firstName || !lastName || !domain) {
    throw new Error('firstName, lastName and domain are required.');
  }

  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  const data = await proxyFetch('email-finder', {
    first_name: firstName,
    last_name: lastName,
    domain: cleanDomain,
  });

  return data.email || data.value || null;
}

// ─────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────
function calculateLeadScore({
  openRoles = 0,
  managersFound = 0,
  emailsFound = 0,
  hasWebsite = false,
}) {
  let score = 40;
  score += Math.min(Number(openRoles) * 4, 25);
  score += Math.min(Number(managersFound) * 8, 20);
  score += Math.min(Number(emailsFound) * 3, 10);
  if (hasWebsite) score += 5;
  return Math.min(Math.round(score), 99);
}

// ─────────────────────────────────────────────
// Apollo organisation → HireResQ lead shape
// ─────────────────────────────────────────────
function mapApolloCompany(org) {
  const website =
    org.website_url?.replace(/^https?:\/\//, '') ||
    org.primary_domain ||
    org.domain ||
    null;

  return {
    id: org.id || org.organization_id || website || org.name,
    name: org.name || 'Unknown company',
    industry: org.industry || org.industries?.[0] || 'Unknown',
    location: org.city
      ? `${org.city}${org.state ? `, ${org.state}` : ''}`
      : org.country || 'South Africa',
    website,
    domain: website,
    employees: org.estimated_num_employees
      ? String(org.estimated_num_employees)
      : 'Unknown',
    hiringSignal: org.actively_hiring ? 'High' : 'Medium',
    openRoles: org.current_job_postings || org.num_job_postings || 0,
    score: 70,
    source: 'Apollo.io',
    description:
      org.short_description || org.seo_description || org.description || '',
    hiringManagers: [],
    companyEmails: [],
    recentJobs: [],
    enriched: false,
  };
}

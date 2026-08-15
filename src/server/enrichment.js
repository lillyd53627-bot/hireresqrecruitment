import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

// ============================================================
// LOAD ENVIRONMENT VARIABLES
// IMPORTANT:
// This must happen BEFORE reading process.env API keys.
// ============================================================

dotenv.config();

const router = express.Router();

// ============================================================
// API KEYS
// These come ONLY from the server .env file
// ============================================================

const APOLLO_KEY = process.env.APOLLO_API_KEY;
const HUNTER_KEY = process.env.HUNTER_API_KEY;

// ============================================================
// DEBUG - DO NOT PRINT THE ACTUAL KEYS
// ============================================================

console.log("Enrichment configuration:");
console.log("Apollo configured:", Boolean(APOLLO_KEY));
console.log("Hunter configured:", Boolean(HUNTER_KEY));

// ============================================================
// HELPER
// Safely parse API responses
// ============================================================

async function parseResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      message: text || "Invalid response from external API",
    };
  }
}

// ============================================================
// CLEAN DOMAIN
// ============================================================

function cleanDomain(domain = "") {
  return domain
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .trim();
}

// ============================================================
// SEARCH COMPANIES - APOLLO
// POST /api/enrichment/companies
// ============================================================

router.post("/companies", async (req, res) => {
  try {
    if (!APOLLO_KEY) {
      console.error("Apollo API key is missing");

      return res.status(500).json({
        message: "Apollo API key not configured",
      });
    }

    const {
      q = "",
      location = "",
      industry = "",
      page = 1,
    } = req.body || {};

    console.log("Apollo company search:", {
      q,
      location,
      industry,
      page,
    });

    const body = {
      q_organization_name: q || undefined,
      organization_locations: location
        ? [location]
        : undefined,
      page,
      per_page: 20,
    };

    /*
     * NOTE:
     * We intentionally do not send the frontend's display
     * industry name directly as an Apollo industry tag ID.
     *
     * Values such as "Technology" or "Finance" are not
     * necessarily valid Apollo industry tag IDs.
     */

    const response = await fetch(
      "https://api.apollo.io/v1/mixed_companies/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": APOLLO_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await parseResponse(response);

    console.log(
      "Apollo company response status:",
      response.status
    );

    if (!response.ok) {
      console.error("Apollo company error:", data);

      return res.status(response.status).json({
        message:
          data?.message ||
          data?.error ||
          "Apollo company search failed",
        details: data,
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("Apollo companies error:", error);

    return res.status(500).json({
      message: "Apollo company search failed",
      error: error.message,
    });
  }
});

// ============================================================
// SEARCH PEOPLE / HIRING MANAGERS - APOLLO
// POST /api/enrichment/people
// ============================================================

router.post("/people", async (req, res) => {
  try {
    if (!APOLLO_KEY) {
      console.error("Apollo API key is missing");

      return res.status(500).json({
        message: "Apollo API key not configured",
      });
    }

    const {
      organization_name,
      domain,
    } = req.body || {};

    if (!organization_name && !domain) {
      return res.status(400).json({
        message:
          "organization_name or domain is required",
      });
    }

    console.log("Apollo people search:", {
      organization_name,
      domain,
    });

    const body = {
      page: 1,
      per_page: 20,
    };

    if (organization_name) {
      body.q_organization_name = organization_name;
    }

    if (domain) {
      body.q_organization_domains = [
        cleanDomain(domain),
      ];
    }

    const response = await fetch(
      "https://api.apollo.io/v1/mixed_people/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": APOLLO_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await parseResponse(response);

    console.log(
      "Apollo people response status:",
      response.status
    );

    if (!response.ok) {
      console.error("Apollo people error:", data);

      return res.status(response.status).json({
        message:
          data?.message ||
          data?.error ||
          "Apollo people search failed",
        details: data,
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("Apollo people error:", error);

    return res.status(500).json({
      message: "Apollo people search failed",
      error: error.message,
    });
  }
});

// ============================================================
// DOMAIN EMAILS - HUNTER
// POST /api/enrichment/emails
// ============================================================

router.post("/emails", async (req, res) => {
  try {
    const { domain } = req.body || {};

    if (!domain) {
      return res.json({
        emails: [],
      });
    }

    if (!HUNTER_KEY) {
      console.error("Hunter API key is missing");

      return res.json({
        emails: [],
      });
    }

    const clean = cleanDomain(domain);

    console.log("Hunter domain search:", clean);

    const url =
      "https://api.hunter.io/v2/domain-search" +
      `?domain=${encodeURIComponent(clean)}` +
      `&api_key=${encodeURIComponent(HUNTER_KEY)}`;

    const response = await fetch(url);

    const data = await parseResponse(response);

    console.log(
      "Hunter domain response status:",
      response.status
    );

    if (!response.ok) {
      console.error("Hunter domain error:", data);

      return res.status(response.status).json({
        message:
          data?.message ||
          data?.error ||
          "Hunter domain search failed",
        details: data,
      });
    }

    return res.json(
      data.data || {
        emails: [],
      }
    );
  } catch (error) {
    console.error("Hunter domain error:", error);

    return res.status(500).json({
      message: "Hunter domain search failed",
      error: error.message,
    });
  }
});

// ============================================================
// EMAIL FINDER - HUNTER
// POST /api/enrichment/email-finder
// ============================================================

router.post("/email-finder", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      domain,
    } = req.body || {};

    if (!first_name || !last_name || !domain) {
      return res.status(400).json({
        message:
          "first_name, last_name and domain are required",
      });
    }

    if (!HUNTER_KEY) {
      console.error("Hunter API key is missing");

      return res.json({});
    }

    const clean = cleanDomain(domain);

    console.log("Hunter email finder:", {
      first_name,
      last_name,
      domain: clean,
    });

    const url =
      "https://api.hunter.io/v2/email-finder" +
      `?domain=${encodeURIComponent(clean)}` +
      `&first_name=${encodeURIComponent(first_name)}` +
      `&last_name=${encodeURIComponent(last_name)}` +
      `&api_key=${encodeURIComponent(HUNTER_KEY)}`;

    const response = await fetch(url);

    const data = await parseResponse(response);

    console.log(
      "Hunter email finder response status:",
      response.status
    );

    if (!response.ok) {
      console.error(
        "Hunter email finder error:",
        data
      );

      return res.status(response.status).json({
        message:
          data?.message ||
          data?.error ||
          "Hunter email finder failed",
        details: data,
      });
    }

    return res.json(
      data.data || {}
    );
  } catch (error) {
    console.error(
      "Hunter email finder error:",
      error
    );

    return res.status(500).json({
      message: "Hunter email finder failed",
      error: error.message,
    });
  }
});

// ============================================================
// HEALTH CHECK
// GET /api/enrichment
// ============================================================

router.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "HireResQ Enrichment API",
    apollo: Boolean(APOLLO_KEY),
    hunter: Boolean(HUNTER_KEY),
  });
});

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default router;
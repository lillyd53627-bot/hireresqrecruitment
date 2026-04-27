import OpenAI from "https://esm.sh/openai";

// ✅ INIT
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

// ✅ FIXED CORS (IMPORTANT)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {

  // ✅ HANDLE PREFLIGHT (THIS FIXES BROWSER ERRORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { job_description, candidates } = await req.json();

    // ✅ SAFETY CHECKS
    if (!job_description || !candidates || !Array.isArray(candidates)) {
      return new Response(JSON.stringify({
        error: "Missing job_description or candidates"
      }), { headers: corsHeaders, status: 400 });
    }

    // =============================
    // 1. JOB EMBEDDING
    // =============================
    const jobEmb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: job_description
    });

    const jobVector = jobEmb.data[0].embedding;

    // =============================
    // 2. SCORE EACH CANDIDATE
    // =============================
    const scored = await Promise.all(
      candidates.map(async (c) => {

        // ✅ SAFE TEXT BUILD (prevents crashes)
        const text = `
          ${c.title || ""}
          ${c.skills || ""}
          ${c.location || ""}
        `.trim();

        if (!text) {
          return {
            ...c,
            match_score: 0,
            reason: "Insufficient data"
          };
        }

        const emb = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: text
        });

        const vector = emb.data[0].embedding;

        const score = cosine(jobVector, vector);

        return {
          ...c,
          match_score: Math.round(score * 100),
          reason: "Matched via AI semantic similarity"
        };
      })
    );

    // =============================
    // 3. SORT RESULTS
    // =============================
    scored.sort((a, b) => b.match_score - a.match_score);

    // =============================
    // 4. RESPONSE
    // =============================
    return new Response(JSON.stringify({
      scoredCandidates: scored
    }), {
      headers: corsHeaders,
      status: 200
    });

  } catch (err) {
    console.error("Score error:", err);

    return new Response(JSON.stringify({
      error: err.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
});

// =============================
// COSINE SIMILARITY
// =============================
function cosine(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (magA * magB);
}
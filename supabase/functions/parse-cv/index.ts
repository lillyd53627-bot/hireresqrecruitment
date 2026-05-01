// =============================================
// parse-cv (WORKING VERSION - SIMPLE + RELIABLE)
// =============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cv_url, user_id, job_id = null } = await req.json();

    if (!cv_url) {
      throw new Error("Missing CV URL");
    }

    // ============================
    // SUPABASE CLIENT
    // ============================
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ============================
    // 1. DOWNLOAD CV FILE
    // ============================
    const fileRes = await fetch(cv_url);

    if (!fileRes.ok) {
      throw new Error("Failed to download CV");
    }

    const arrayBuffer = await fileRes.arrayBuffer();

    // ============================
    // 2. EXTRACT TEXT (basic)
    // ============================
    // NOTE: This is a fallback text extraction
    const text = new TextDecoder().decode(arrayBuffer);

    const cleanText = text
      .replace(/\s+/g, ' ')
      .slice(0, 5000); // prevent huge inserts

    // ============================
    // 3. BASIC AI EXTRACTION (simple regex)
    // ============================

    // Name (first line assumption)
    const nameMatch = cleanText.match(/^[A-Z][a-z]+ [A-Z][a-z]+/);
    const name = nameMatch ? nameMatch[0] : "Unknown Candidate";

    // Title (basic guess)
    const titleMatch = cleanText.match(/(developer|engineer|manager|sales|recruiter)/i);
    const title = titleMatch ? titleMatch[0] : "Professional";

    // Skills (keyword extraction)
    const skillKeywords = [
      "javascript", "react", "node", "python",
      "sales", "marketing", "recruitment",
      "sql", "excel", "communication"
    ];

    const skills = skillKeywords.filter(skill =>
      cleanText.toLowerCase().includes(skill)
    );

    // ============================
    // 4. INSERT INTO DATABASE
    // ============================
    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          name,
          title,
          skills,
          raw_cv_text: cleanText,
          cv_file_path: cv_url,
          user_id,
          job_id, // optional linking to job
          stage: 'sourced',
          match_score: 0,
        }
      ])
      .select();

    if (error) {
      console.error("DB Insert Error:", error);
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      candidate: data?.[0] || null,
      message: "CV parsed and stored successfully"
    }), {
      headers: corsHeaders
    });

  } catch (err) {
    console.error("Parse CV Error:", err);

    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
});
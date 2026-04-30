import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://esm.sh/openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { job_description } = await req.json();
    if (!job_description) throw new Error("Missing job description");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // =============================
    // SAFE JOB EMBEDDING
    // =============================
    let jobEmbedding = null;

    try {
      const emb = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: job_description
      });

      jobEmbedding = emb?.data?.[0]?.embedding;
    } catch (e) {
      console.log("Embedding failed");
      throw new Error("Embedding generation failed");
    }

    if (!jobEmbedding) throw new Error("No embedding generated");

    // =============================
    // GET CANDIDATES
    // =============================
    const { data: candidates } = await supabase
      .from('candidates')
      .select('*');

    // =============================
    // COSINE SIMILARITY
    // =============================
    const cosine = (a, b) => {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dot / (magA * magB);
    };

    const scored = (candidates || [])
      .filter(c => c.embedding)
      .map(c => {
        const sim = cosine(jobEmbedding, c.embedding);
        return {
          ...c,
          match_score: Math.round(sim * 100),
          reason: "AI semantic match"
        };
      })
      .sort((a, b) => b.match_score - a.match_score);

    return new Response(JSON.stringify({
      success: true,
      scoredCandidates: scored,
      count: scored.length
    }), {
      headers: corsHeaders
    });

  } catch (err) {
    console.error("semantic-match ERROR:", err);

    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
});
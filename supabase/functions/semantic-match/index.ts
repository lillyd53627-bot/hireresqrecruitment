import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://esm.sh/openai@4.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { job_description } = await req.json();

    if (!job_description) {
      throw new Error("Job description is required");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get ALL candidates
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('*');

    if (error) throw error;
    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0, scoredCandidates: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate job embedding
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: job_description
    });

    const jobEmbedding = embeddingResponse.data[0].embedding;

    // Score all candidates
    const scoredCandidates = candidates.map(candidate => {
      let similarity = 0;

      if (candidate.embedding && Array.isArray(candidate.embedding)) {
        const dot = jobEmbedding.reduce((sum, val, i) => sum + val * candidate.embedding[i], 0);
        const magA = Math.sqrt(jobEmbedding.reduce((sum, val) => sum + val * val, 0));
        const magB = Math.sqrt(candidate.embedding.reduce((sum, val) => sum + val * val, 0));
        similarity = dot / (magA * magB);
      }

      const match_score = Math.round(similarity * 100);

      return {
        ...candidate,
        match_score: Math.max(0, Math.min(99, match_score)),
        shortlisted: match_score >= 75
      };
    });

    // Sort by score
    scoredCandidates.sort((a, b) => b.match_score - a.match_score);

    // Update database
    for (const c of scoredCandidates) {
      await supabase
        .from('candidates')
        .update({
          match_score: c.match_score,
          shortlisted: c.shortlisted
        })
        .eq('id', c.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: scoredCandidates.length,
        scoredCandidates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error("Semantic Match Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
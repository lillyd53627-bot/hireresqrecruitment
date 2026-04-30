// =============================================
// semantic-match - For new project uoovbueakhhswpmythsb
// =============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      job_description,
      match_threshold = 0.75,
      match_count = 15
    } = await req.json();

    if (!job_description || job_description.trim() === '') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Job description is required'
      }), { headers: corsHeaders, status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Generate embedding using Supabase's built-in model
    const session = new Supabase.ai.Session('gte-small');
   
    const embeddingResult = await session.run(job_description.trim(), {
      mean_pool: true,
      normalize: true,
    });

    const queryEmbedding = embeddingResult.embedding;

    // Call the SQL similarity search function
    const { data: scoredCandidates, error } = await supabase
      .rpc('match_candidates', {
        query_embedding: queryEmbedding,
        match_threshold: match_threshold,
        match_count: match_count
      });

    if (error) {
      console.error("RPC Error:", error);
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      count: scoredCandidates?.length || 0,
      scoredCandidates: scoredCandidates || [],
      message: `Found ${scoredCandidates?.length || 0} matching candidates`
    }), {
      headers: corsHeaders
    });

  } catch (err) {
    console.error("Semantic Match Error:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Failed to perform semantic matching'
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
});
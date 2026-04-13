// supabase/functions/AI-Sourcing/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ candidates: [] }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const searchTerm = `%${query.toLowerCase().trim()}%`;

    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .or(`name.ilike.${searchTerm},title.ilike.${searchTerm},location.ilike.${searchTerm}`)
      .order('match_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ candidates: [], error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Add match score if missing
    const candidatesWithScore = (data || []).map((c, index) => ({
      ...c,
      match_score: c.match_score || Math.max(70, 95 - index * 3)
    }));

    return new Response(
      JSON.stringify({ candidates: candidatesWithScore }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(
      JSON.stringify({ candidates: [], error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
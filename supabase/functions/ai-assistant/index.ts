import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const keywords = message.toLowerCase().split(' ');

    const { data } = await supabase
      .from('candidates')
      .select('*')
      .limit(50);

    const scored = data.map(c => {
      let score = 50;

      if (keywords.some(k => c.title?.toLowerCase().includes(k))) score += 30;
      if (keywords.some(k => c.skills?.toLowerCase().includes(k))) score += 20;
      if (keywords.some(k => c.location?.toLowerCase().includes(k))) score += 25;

      return { ...c, match_score: score };
    });

    scored.sort((a, b) => b.match_score - a.match_score);

    return new Response(JSON.stringify({
      summary: `Found ${scored.length} candidates`,
      candidates: scored
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
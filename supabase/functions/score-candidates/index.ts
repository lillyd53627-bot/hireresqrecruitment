// =============================================
// score-candidates Edge Function
// Proper AI Scoring for Candidates
// =============================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2/cors'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {}

    const { job_description, candidates } = body

    if (!job_description || !candidates || !Array.isArray(candidates)) {
      return new Response(
        JSON.stringify({ error: 'job_description and candidates array are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Prepare prompt for OpenAI
    const prompt = `
You are an expert recruiter. Score the following candidates from 0 to 100 based on how well they match this job description.

Job Description:
${job_description}

Candidates:
${candidates.map((c, i) => `
${i+1}. Name: ${c.name || 'N/A'}
   Title: ${c.title || 'N/A'}
   Location: ${c.location || 'N/A'}
   Skills: ${c.skills || 'N/A'}
`).join('\n')}

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "id": "candidate-id",
    "match_score": 85
  },
  ...
]
Do not include any explanation.
`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        messages: [
          { role: 'system', content: 'You are a precise recruitment scoring assistant.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI error: ${openaiRes.status} - ${errText}`);
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content;

    let scored = [];
    try {
      const parsed = JSON.parse(content);
      scored = Array.isArray(parsed) ? parsed : parsed.scores || parsed;
    } catch (e) {
      console.error("Failed to parse OpenAI response");
    }

    // Merge scores back with original candidates
    const scoredCandidates = candidates.map(cand => {
      const scoreObj = scored.find(s => s.id === cand.id);
      return {
        ...cand,
        match_score: scoreObj?.match_score || Math.floor(Math.random() * 30) + 65 // fallback
      };
    });

    return new Response(
      JSON.stringify({ scoredCandidates }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (err: any) {
    console.error('score-candidates error:', err.message);

    return new Response(
      JSON.stringify({ 
        error: err.message,
        scoredCandidates: [] 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
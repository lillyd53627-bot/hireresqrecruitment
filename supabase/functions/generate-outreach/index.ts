import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { candidate, job_description } = await req.json();

    const ai = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a recruiter writing short outreach messages."
        },
        {
          role: "user",
          content: `
Candidate: ${candidate.name}
Role: ${candidate.title}
Skills: ${candidate.skills}

Job:
${job_description}

Write:
1. WhatsApp message
2. Email message
          `
        }
      ]
    });

    const text = ai.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({
      success: true,
      message: text
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
});
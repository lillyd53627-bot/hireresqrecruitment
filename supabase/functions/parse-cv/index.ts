import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://esm.sh/openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {

  const { cvUrl } = await req.json();

  if (!cvUrl) {
    return new Response(JSON.stringify({ error: "No CV URL" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  try {

    // 🔥 Send URL to AI (simple parsing)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Extract candidate info as JSON: name, title, location, skills"
        },
        {
          role: "user",
          content: `Parse this CV: ${cvUrl}`
        }
      ]
    });

    let parsed;

    try {
      parsed = JSON.parse(completion.choices[0].message.content);
    } catch {
      parsed = {};
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ✅ SAVE CANDIDATE (IMPORTANT FIX)
    const candidate = {
      name: parsed.name || "Parsed Candidate",
      title: parsed.title || "Unknown",
      location: parsed.location || "South Africa",
      skills: parsed.skills || "",
      cv_file_path: cvUrl,
      status: 'new'
    };

    await supabase.from('candidates').insert([candidate]);

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
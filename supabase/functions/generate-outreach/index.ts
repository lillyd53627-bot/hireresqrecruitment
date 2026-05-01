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
    const { candidate, job_description } = await req.json();

    if (!candidate) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing candidate'
      }), { headers: corsHeaders, status: 400 });
    }

    const message = `Hi ${candidate.name || 'there'},

We found a strong opportunity for you based on your experience as ${candidate.title || 'a professional'}.

Top matching skills:
${(candidate.skills || []).join(', ')}

This role aligns closely with your background.

👉 View opportunity:
https://yourapp.com/dashboard

Let’s get you placed 🚀`;

    const whatsappLink = `https://wa.me/${candidate.phone || ''}?text=${encodeURIComponent(message)}`;

    return new Response(JSON.stringify({
      success: true,
      message,
      whatsapp_link: whatsappLink,
      email_subject: "New Opportunity Based On Your Profile",
      email_body: message
    }), {
      headers: corsHeaders
    });

  } catch (err) {
    console.error("Outreach error:", err);

    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      headers: corsHeaders,
      status: 500
    });
  }
});
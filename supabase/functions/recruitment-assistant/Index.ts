import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ response: "Please ask me a question about recruitment." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log("AI Assistant received message:", message);

    // Simple intelligent response for now (we can make it call OpenAI later)
    let reply = "I'm here to help with recruitment! ";

    if (message.toLowerCase().includes("sales manager") || message.toLowerCase().includes("sales")) {
      reply += "I can help you find sales managers in Johannesburg or any city. Would you like me to search candidates or draft an outreach message?";
    } else if (message.toLowerCase().includes("find") || message.toLowerCase().includes("source")) {
      reply += "Tell me the job title and location, and I'll help source matching candidates.";
    } else if (message.toLowerCase().includes("outreach") || message.toLowerCase().includes("email")) {
      reply += "I can draft personalized outreach emails for candidates or clients. What role are you hiring for?";
    } else {
      reply += "How can I assist you today? Try asking for candidate sourcing, outreach messages, or interview questions.";
    }

    return new Response(JSON.stringify({ response: reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (err) {
    console.error("AI Assistant error:", err);
    return new Response(JSON.stringify({ response: "Sorry, I'm having trouble connecting right now. Please try again." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
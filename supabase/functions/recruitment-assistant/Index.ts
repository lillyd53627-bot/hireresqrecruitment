// supabase/functions/recruitment-assistant/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { message, conversation_history = [], mode = 'chat' } = await req.json()

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ response: "How can I help you today? Ask me to find candidates, companies, draft outreach, or generate job descriptions." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch real data from your database
    const [{ data: candidates }, { data: jobs }, { data: activeCompanies }] = await Promise.all([
      supabase.from('candidates').select('*').order('match_score', { ascending: false }).limit(20),
      supabase.from('jobs').select('*').eq('status', 'active').limit(10),
      supabase.from('clients').select('*').eq('status', 'active').limit(15)
    ])

    // LinkedIn ProxyCurl integration (add your ProxyCurl key in Supabase secrets)
    const PROXYCURL_API_KEY = Deno.env.get('PROXYCURL_API_KEY')

    let linkedinData = ''
    if (PROXYCURL_API_KEY && (message.toLowerCase().includes('linkedin') || message.toLowerCase().includes('profile'))) {
      try {
        // Example: Extract LinkedIn URL if mentioned, or search for company
        const linkedinUrlMatch = message.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/i)
        if (linkedinUrlMatch) {
          const url = linkedinUrlMatch[0]
          const res = await fetch(`https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent('https://' + url)}&skills=include`, {
            headers: { 'Authorization': `Bearer ${PROXYCURL_API_KEY}` }
          })
          const profile = await res.json()
          linkedinData = `\nLinkedIn Profile Data:\nName: ${profile.name || 'N/A'}\nTitle: ${profile.title || 'N/A'}\nLocation: ${profile.location || 'N/A'}\nSkills: ${profile.skills?.join(', ') || 'N/A'}`
        }
      } catch (e) {
        console.error('LinkedIn ProxyCurl error:', e)
      }
    }

    const context = `
You are HireResQ AI — an advanced AI Recruitment Engine that helps recruiters:

1. Source & score candidates
2. Find companies actively hiring (Client Finder / Lead Generation)
3. Draft personalized outreach emails
4. Generate professional job descriptions
5. Provide hiring strategy advice

Current Candidates in Database:
${candidates?.map(c => `- ${c.name} | ${c.title} | ${c.location} | Score: ${c.match_score || 'N/A'} | Skills: ${Array.isArray(c.skills) ? c.skills.join(', ') : 'N/A'}`).join('\n') || 'No candidates yet.'}

Current Active Jobs:
${jobs?.map(j => `- ${j.title} at ${j.company} | ${j.location} | Salary: ${j.salary || 'N/A'}`).join('\n') || 'No active jobs.'}

Active Companies / Leads (great for winning new business):
${activeCompanies?.map(c => `- ${c.name} | ${c.industry} | ${c.location} | Active jobs: ${c.active_jobs || 0}`).join('\n') || 'No active leads yet.'}

${linkedinData}

User Query: "${message}"
Mode: ${mode}

Response Style:
- Be professional, concise, and actionable.
- If user asks for candidates → suggest best matches with reasons.
- If user asks for companies/clients → recommend active hiring companies they can approach to win recruitment mandates.
- If user wants outreach → draft a personalized email.
- If user wants job description → generate a clean, professional JD.
- Use bullet points for lists.
- Always base answers on real data when possible.
`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1100,
      }),
    })

    const openaiData = await openaiResponse.json()
    const aiReply = openaiData.choices?.[0]?.message?.content || 
      "I couldn't generate a response right now. Please try rephrasing."

    return new Response(
      JSON.stringify({ response: aiReply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('recruitment-assistant error:', error)
    return new Response(
      JSON.stringify({ response: "I'm having trouble connecting. Please try again shortly." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
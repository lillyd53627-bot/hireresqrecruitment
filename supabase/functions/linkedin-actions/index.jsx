// supabase/functions/linkedin-actions/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    // Optional: verify user if needed
    const { message, action = 'post', jobId, keywords, location } = await req.json();

    if (action === 'post') {
      if (!message) {
        return Response.json({ error: 'message is required' }, { status: 400 });
      }

      // Get user's LinkedIn token (from your connector or stored in DB)
      // Replace with your actual token retrieval logic
      const { data: tokenData } = await supabase
        .from('user_integrations')
        .select('linkedin_access_token')
        .eq('user_id', userId) // get from auth
        .single();

      if (!tokenData?.linkedin_access_token) {
        return Response.json({ error: 'LinkedIn not connected' }, { status: 400 });
      }

      const accessToken = tokenData.linkedin_access_token;

      const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!profileRes.ok) throw new Error('Failed to fetch LinkedIn profile');

      const profile = await profileRes.json();
      const authorUrn = `urn:li:person:${profile.sub}`;

      // Modern Posts API (recommended in 2026)
      const postPayload = {
        author: authorUrn,
        commentary: message,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: []
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false
      };

      const postRes = await fetch('https://api.linkedin.com/rest/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postPayload)
      });

      if (!postRes.ok) {
        const err = await postRes.text();
        throw new Error(`LinkedIn post failed: ${err}`);
      }

      return Response.json({ success: true, message: 'Posted to LinkedIn' });
    }

    // Example: Candidate sourcing via Proxycurl
    if (action === 'source-candidates') {
      if (!keywords) return Response.json({ error: 'keywords required' }, { status: 400 });

      const proxycurlApiKey = Deno.env.get('PROXYCURL_API_KEY');
      if (!proxycurlApiKey) throw new Error('Proxycurl key not configured');

      // Example Proxycurl people search (adjust endpoint as per their docs)
      const searchUrl = `https://nubela.co/proxycurl/api/v2/linkedin/people/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location || '')}`;

      const searchRes = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${proxycurlApiKey}` }
      });

      const results = await searchRes.json();

      // Save results to Supabase or return them
      return Response.json({ success: true, candidates: results.results || results });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
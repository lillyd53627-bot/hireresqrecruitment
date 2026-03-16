import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileUrl } = await req.json();

    // Extract LinkedIn username/ID from URL
    const match = profileUrl.match(/linkedin\.com\/in\/([^\/]+)/);
    if (!match) {
      return Response.json({ error: 'Invalid LinkedIn profile URL' }, { status: 400 });
    }

    const username = match[1];

    // Get LinkedIn access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('linkedin');

    // Get authenticated user's profile (basic info available through OAuth)
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      return Response.json({ error: 'Failed to fetch LinkedIn profile', details: error }, { status: 500 });
    }

    const profileData = await profileResponse.json();

    // Note: LinkedIn API has restrictions. With basic auth, you can only get:
    // - Your own profile details
    // - Limited public profile info
    // For full profile access of other users, you need additional permissions

    return Response.json({ 
      success: true,
      profile: {
        name: profileData.name,
        email: profileData.email,
        picture: profileData.picture,
        locale: profileData.locale,
        sub: profileData.sub
      },
      note: 'LinkedIn API restrictions apply - only limited profile data available without additional permissions'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
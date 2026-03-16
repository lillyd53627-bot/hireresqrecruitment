import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, message } = await req.json();

    // Get job details
    const jobs = await base44.entities.Job.filter({ id: jobId });
    if (jobs.length === 0) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobs[0];

    // Get company details if company_id is set
    let company = null;
    if (job.company_id) {
      const companies = await base44.asServiceRole.entities.Company.filter({ id: job.company_id });
      if (companies.length > 0) {
        company = companies[0];
      }
    }

    // Get LinkedIn access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('linkedin');

    // Get user's LinkedIn profile ID
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      return Response.json({ error: 'Failed to get LinkedIn profile' }, { status: 500 });
    }

    const profile = await profileResponse.json();
    const personUrn = `urn:li:person:${profile.sub}`;

    // Prepare post content using company profile if available
    const companyName = company?.name || job.company || 'Our Company';
    const companyInfo = company?.description ? `\n\n${company.description.substring(0, 150)}...` : '';
    const companyLinkedIn = company?.linkedin_url ? `\n\n🔗 ${company.linkedin_url}` : '';

    const postText = message || `We're hiring! 🎯\n\n${job.title} at ${companyName}\n📍 ${job.location}\n💰 ${job.salary_min && job.salary_max ? `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}` : 'Competitive salary'}\n\n${job.description ? job.description.substring(0, 200) + '...' : ''}${companyInfo}${companyLinkedIn}\n\nInterested? Apply now! #hiring #jobs #recruitment`;

    // Create LinkedIn post
    const postData = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: postText
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!postResponse.ok) {
      const error = await postResponse.text();
      return Response.json({ error: 'Failed to post to LinkedIn', details: error }, { status: 500 });
    }

    const result = await postResponse.json();

    return Response.json({ 
      success: true,
      postId: result.id,
      message: 'Job successfully shared to LinkedIn'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
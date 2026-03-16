import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, visibility = 'PUBLIC' } = await req.json();

        if (!message) {
            return Response.json({ error: 'message is required' }, { status: 400 });
        }

        // Get LinkedIn access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken("linkedin");

        // Get LinkedIn user ID
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to get LinkedIn profile');
        }

        const profile = await profileResponse.json();
        const authorUrn = `urn:li:person:${profile.sub}`;

        // Create LinkedIn post
        const postData = {
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: message
                    },
                    shareMediaCategory: 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': visibility
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
            throw new Error(`LinkedIn API error: ${error}`);
        }

        const result = await postResponse.json();

        return Response.json({
            success: true,
            message: 'Update posted to LinkedIn successfully',
            post_id: result.id
        });

    } catch (error) {
        console.error('Error sharing to LinkedIn:', error);
        return Response.json({ 
            error: error.message || 'Failed to share to LinkedIn'
        }, { status: 500 });
    }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get TikTok access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('tiktok');

    // Fetch user info and stats
    const userInfoUrl = 'https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,following_count,likes_count,video_count';
    const userInfoResponse = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.text();
      return Response.json({ error: 'Failed to fetch TikTok user info', details: error }, { status: 500 });
    }

    const userInfo = await userInfoResponse.json();

    // Fetch user's videos
    const videosUrl = 'https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,create_time,view_count,like_count,comment_count,share_count';
    const videosResponse = await fetch(videosUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ max_count: 20 })
    });

    if (!videosResponse.ok) {
      const error = await videosResponse.text();
      return Response.json({ error: 'Failed to fetch TikTok videos', details: error }, { status: 500 });
    }

    const videosData = await videosResponse.json();
    const videos = videosData.data?.videos || [];

    // Calculate engagement rates
    const videosWithEngagement = videos.map(video => {
      const totalEngagements = video.like_count + video.comment_count + video.share_count;
      const engagementRate = video.view_count > 0 
        ? ((totalEngagements / video.view_count) * 100).toFixed(2)
        : 0;
      
      return {
        ...video,
        engagementRate: parseFloat(engagementRate)
      };
    });

    // Sort by engagement rate
    const topVideos = videosWithEngagement
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 10);

    // Calculate overall stats
    const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.like_count || 0), 0);
    const totalComments = videos.reduce((sum, v) => sum + (v.comment_count || 0), 0);
    const totalShares = videos.reduce((sum, v) => sum + (v.share_count || 0), 0);
    const avgEngagementRate = videosWithEngagement.length > 0
      ? (videosWithEngagement.reduce((sum, v) => sum + v.engagementRate, 0) / videosWithEngagement.length).toFixed(2)
      : 0;

    return Response.json({
      success: true,
      userInfo: userInfo.data?.user,
      totalFollowers: userInfo.data?.user?.follower_count || 0,
      totalLikes: userInfo.data?.user?.likes_count || 0,
      totalViews,
      avgEngagementRate: parseFloat(avgEngagementRate),
      stats: {
        totalVideos: videos.length,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
      },
      topVideos,
      allVideos: videosWithEngagement
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
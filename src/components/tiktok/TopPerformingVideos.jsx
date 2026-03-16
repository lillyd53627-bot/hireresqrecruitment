import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';

export default function TopPerformingVideos({ isConnected }) {
  // Placeholder data
  const placeholderVideos = [
    {
      id: 1,
      title: 'Top 5 Recruitment Tips for 2026',
      thumbnail: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=300&h=400&fit=crop',
      views: 45600,
      likes: 3890,
      comments: 245,
      shares: 187,
      engagementRate: 9.3,
      postedDate: '3 days ago'
    },
    {
      id: 2,
      title: 'AI in Recruiting - Game Changer',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=400&fit=crop',
      views: 38200,
      likes: 3210,
      comments: 198,
      shares: 142,
      engagementRate: 9.1,
      postedDate: '5 days ago'
    },
    {
      id: 3,
      title: 'Interview Red Flags to Watch For',
      thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop',
      views: 32500,
      likes: 2780,
      comments: 165,
      shares: 124,
      engagementRate: 8.7,
      postedDate: '1 week ago'
    },
    {
      id: 4,
      title: 'How to Negotiate Salary Like a Pro',
      thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&h=400&fit=crop',
      views: 29800,
      likes: 2450,
      comments: 142,
      shares: 98,
      engagementRate: 8.2,
      postedDate: '1 week ago'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            Top Performing Videos
          </span>
          {!isConnected && (
            <Badge variant="outline" className="text-xs">Placeholder Data</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {placeholderVideos.map((video, index) => (
            <div key={video.id} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  #{index + 1}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-20 h-28 object-cover rounded-lg"
                />
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{video.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{video.postedDate}</p>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {(video.views / 1000).toFixed(1)}K
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-500" />
                    {(video.likes / 1000).toFixed(1)}K
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {video.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {video.shares}
                  </span>
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-500">Engagement</p>
                <p className="text-2xl font-bold text-red-600">{video.engagementRate}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music2, TrendingUp, Users, Heart, Eye, Share2, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/Dashboard/Sidebar';
import TopBar from '@/components/Dashboard/TopBar';
import TikTokEngagementChart from '@/components/tiktok/TikTokEngagementChart';
import TopPerformingVideos from '@/components/tiktok/TopPerformingVideos';
import FollowerGrowthChart from '@/components/tiktok/FollowerGrowthChart';

export default function TikTokAnalytics() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getTikTokAnalytics', {});
      setAnalytics(response.data);
      setIsConnected(true);
    } catch (error) {
      console.log('TikTok not connected yet - showing placeholder');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectTikTok = () => {
    window.open('https://app.base44.com/Dashboard/integrations', '_blank');
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Placeholder data for when TikTok is not connected
  const placeholderStats = {
    totalFollowers: 12450,
    totalLikes: 45678,
    totalViews: 234567,
    avgEngagementRate: 8.5,
  };

  const stats = analytics || placeholderStats;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar 
          title="TikTok Analytics" 
          subtitle="Track your content performance and engagement"
        />
        
        <div className="p-8">
          {/* Connection Banner */}
          {!isConnected && (
            <Card className="border-blue-200 bg-blue-50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">TikTok Not Connected</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Connect your TikTok account to track real engagement, follower growth, and video performance.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConnectTikTok}>
                      <Music2 className="w-4 h-4 mr-2" />
                      Connect TikTok Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Followers</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalFollowers?.toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12.5% this month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Likes</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalLikes?.toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +18.3% this month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Views</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalViews?.toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +25.7% this month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Avg Engagement</p>
                      <p className="text-2xl font-bold mt-1">{stats.avgEngagementRate}%</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +2.1% this month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TikTokEngagementChart isConnected={isConnected} />
            <FollowerGrowthChart isConnected={isConnected} />
          </div>

          {/* Top Performing Videos */}
          <TopPerformingVideos isConnected={isConnected} />
        </div>
      </main>
    </div>
  );
}
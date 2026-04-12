// src/pages/Dashboard/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Award, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const { currentPlan } = useOutletContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState(null);

  const [stats, setStats] = useState({
    candidates: 0,
    jobs: 0,
  });

  const [metrics, setMetrics] = useState({
    placements: 0,
    revenue: 0,
    aiMatches: 0,
  });

  // ✅ Fetch user + plan
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserPlan(data);
      } catch (err) {
        console.error("User fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Fetch basic stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: candidates } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true });

        const { count: jobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });

        setStats({
          candidates: candidates || 0,
          jobs: jobs || 0,
        });
      } catch (err) {
        console.error("Stats error:", err);
      }
    };

    fetchStats();
  }, []);

  // ✅ Fetch revenue + placements + AI matches
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const startOfMonth = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        );

        // 📈 Placements this month
        const { count: placements } = await supabase
          .from('placements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString());

        // 💰 Revenue
        const { data: revenueData } = await supabase
          .from('placements')
          .select('fee')
          .eq('user_id', user.id);

        const revenue = revenueData?.reduce(
          (sum, p) => sum + (p.fee || 0),
          0
        ) || 0;

        // 🤖 AI Matches
        const { count: aiMatches } = await supabase
          .from('ai_matches')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setMetrics({
          placements: placements || 0,
          revenue,
          aiMatches: aiMatches || 0,
        });

      } catch (err) {
        console.error("Metrics error:", err);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Welcome back</h1>
        <p className="text-gray-600 mt-2">
          Your recruitment performance at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Candidates</p>
              <p className="text-3xl font-bold">{stats.candidates}</p>
            </div>
            <Users className="text-blue-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Jobs</p>
              <p className="text-3xl font-bold">{stats.jobs}</p>
            </div>
            <Briefcase className="text-red-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Placements</p>
              <p className="text-3xl font-bold text-green-600">
                {metrics.placements}
              </p>
            </div>
            <Award className="text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                R{metrics.revenue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">AI Matches</p>
              <p className="text-3xl font-bold text-purple-600">
                {metrics.aiMatches}
              </p>
            </div>
            <Sparkles className="text-purple-600" />
          </CardContent>
        </Card>

      </div>

      {/* Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold">
              {userPlan?.subscription_tier || currentPlan?.plan || 'Free'}
            </p>
            <p className="text-sm text-gray-500">
              {userPlan?.plan_status || 'Inactive'}
            </p>
          </div>

          <Button 
            onClick={() => navigate('/pricing')} 
            className="bg-red-600 hover:bg-red-700"
          >
            Upgrade
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
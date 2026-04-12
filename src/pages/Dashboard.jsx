// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Briefcase, Target, Building2, Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import StatCard from "@/components/Dashboard/StatCard";
import PlanUsageCard from "@/components/Dashboard/PlanUsageCard";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const outletContext = useOutletContext(); // from DashboardLayout
  const navigate = useNavigate();

  const [user, setUser] = useState(outletContext?.user || null);
  const [currentPlan, setCurrentPlan] = useState(outletContext?.currentPlan || null);
  const [loading, setLoading] = useState(!outletContext?.currentPlan);

  // Fallback: Direct Supabase check if Layout didn't provide plan
  useEffect(() => {
    if (currentPlan) return; // Already have plan from Layout

    const checkPlan = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate("/register");
        return;
      }

      setUser(authUser);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error || !data?.plan) {
        navigate("/pricing");
        return;
      }

      setCurrentPlan(data);
      setLoading(false);
    };

    checkPlan();
  }, [currentPlan, navigate]);

  if (loading) {
    return <div className="p-10 text-center">Loading your dashboard...</div>;
  }

  if (!currentPlan) {
    return <div className="p-10 text-center">No active plan found. Redirecting...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.email?.split('@')[0] || "Recruiter"}
          </h1>
          <p className="text-gray-600 mt-1">Here's your recruitment overview</p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-1">
            {currentPlan.plan_name || currentPlan.plan?.toUpperCase()} Plan
          </Badge>
          <Button variant="outline" onClick={() => navigate("/pricing")}>
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Plan Usage */}
      <PlanUsageCard currentPlan={currentPlan} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Candidates" value="1,847" icon={Users} />
        <StatCard 
          title="Active Jobs" 
          value={`${currentPlan.current_jobs || 0}/${currentPlan.max_jobs || 5}`} 
          icon={Briefcase} 
        />
        <StatCard title="Clients" value="156" icon={Building2} />
        <StatCard title="Placements" value="18" icon={Target} />
      </div>

      {/* AI Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-purple-600" /> Recent AI Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "AI Client Finder discovered 47 new hiring companies in Johannesburg",
            "Outreach Engine sent 124 personalized messages with 18 replies",
            "Video Screening completed for 9 candidates with average score 87%",
          ].map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-gray-50 rounded-xl border-l-4 border-purple-500"
            >
              {activity}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Feature Lock Teaser */}
      {currentPlan.plan !== "advance" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Unlock More Power</h3>
            <p className="text-gray-600 mb-6">
              Upgrade to Growth or Advance to access unlimited AI matches, video screening, and more.
            </p>
            <Button onClick={() => navigate("/pricing")} className="bg-red-600 hover:bg-red-700">
              Upgrade Now →
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
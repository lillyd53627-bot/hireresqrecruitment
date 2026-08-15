// src/pages/Dashboard/AISmartReporting.jsx

import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AISmartReporting() {
  // ============================================================
  // ROUTER CONTEXT
  // ============================================================

  const outletContext = useOutletContext() || {};

  const currentPlan = outletContext.currentPlan || {
    plan: "starter",
  };

  const navigate = useNavigate();

  // ============================================================
  // IMPORTANT:
  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURN
  // ============================================================

  const [timeRange, setTimeRange] = useState("6months");

  // ============================================================
  // PLAN CHECK
  // ============================================================

  const planName = String(currentPlan?.plan || "starter").toLowerCase();

  const hasAdvancedReporting =
    planName === "growth" ||
    planName === "advance" ||
    planName === "advanced";

  // ============================================================
  // UPGRADE SCREEN
  // ============================================================

  if (!hasAdvancedReporting) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center max-w-lg mx-auto">

          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
            <Lock className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Reporting & Analytics
          </h1>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Get real-time recruitment insights, performance dashboards,
            AI-powered analytics and detailed reporting.
          </p>

          <div className="bg-gray-50 border rounded-xl p-5 mb-8 text-left">
            <p className="font-semibold text-gray-900 mb-3">
              Available with Growth & Advance plans:
            </p>

            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Recruitment performance analytics</li>
              <li>✓ Candidate source performance</li>
              <li>✓ Placement and revenue reporting</li>
              <li>✓ AI recruitment insights</li>
              <li>✓ Time-to-hire analysis</li>
              <li>✓ Report export</li>
            </ul>
          </div>

          <Button
            onClick={() => navigate("/pricing")}
            className="bg-red-600 hover:bg-red-700 text-lg px-10 py-6"
          >
            Upgrade to Unlock Smart Reporting
          </Button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="block mx-auto mt-5 text-sm text-gray-500 hover:text-gray-800"
          >
            Return to Dashboard
          </button>

        </div>
      </div>
    );
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  const stats = [
    {
      label: "Total Candidates",
      value: "1,847",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Placements",
      value: "103",
      change: "+8.2%",
      trend: "up",
      icon: Briefcase,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Revenue",
      value: "R2.4M",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Avg. Time to Hire",
      value: "18 days",
      change: "-3 days",
      trend: "down",
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  // ============================================================
  // SOURCES
  // ============================================================

  const sources = [
    {
      source: "LinkedIn",
      value: 45,
      color: "bg-blue-600",
    },
    {
      source: "Indeed",
      value: 25,
      color: "bg-indigo-600",
    },
    {
      source: "Referrals",
      value: 15,
      color: "bg-green-600",
    },
    {
      source: "Job Boards",
      value: 10,
      color: "bg-purple-600",
    },
  ];

  // ============================================================
  // AI INSIGHTS
  // ============================================================

  const insights = [
    "AI detected 23% faster time-to-hire for React roles this quarter.",
    "Candidate sourcing from Cape Town yielded 42% higher match scores.",
    "Outreach campaigns showed an 18% reply-rate improvement after AI personalization.",
  ];

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="space-y-8 p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Smart Reporting
          </h1>

          <p className="text-gray-600 mt-1">
            Real-time analytics and recruitment insights
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="30days">
                Last 30 days
              </SelectItem>

              <SelectItem value="3months">
                Last 3 months
              </SelectItem>

              <SelectItem value="6months">
                Last 6 months
              </SelectItem>

              <SelectItem value="12months">
                Last 12 months
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            type="button"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>

        </div>
      </div>

      {/* ======================================================
          KEY STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <Card key={stat.label}>

              <CardContent className="p-6">

                <div className="flex justify-between items-start">

                  <div>
                    <p className="text-sm text-gray-500">
                      {stat.label}
                    </p>

                    <p className="text-3xl font-bold mt-2 text-gray-900">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <Icon
                      className={`w-6 h-6 ${stat.color}`}
                    />
                  </div>

                </div>

                <div
                  className={`flex items-center gap-1 mt-4 text-sm ${
                    stat.trend === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >

                  {stat.trend === "up" ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}

                  {stat.change}

                  <span className="text-gray-400 ml-1">
                    vs previous period
                  </span>

                </div>

              </CardContent>

            </Card>
          );
        })}

      </div>

      {/* ======================================================
          ANALYTICS AREA
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* PIPELINE */}

        <Card>

          <CardHeader>
            <CardTitle>
              Recruitment Pipeline Overview
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="h-80 flex items-center justify-center border border-dashed border-gray-300 rounded-xl">

              <div className="text-center">

                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />

                <p className="font-medium text-gray-600">
                  Recruitment Pipeline
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Interactive charts will appear here.
                </p>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* SOURCES */}

        <Card>

          <CardHeader>
            <CardTitle>
              Top Performing Sources
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="space-y-6">

              {sources.map((item) => (

                <div
                  key={item.source}
                  className="flex items-center gap-4"
                >

                  <div
                    className={`w-3 h-3 rounded-full ${item.color}`}
                  />

                  <div className="flex-1">

                    <div className="flex justify-between text-sm">

                      <span className="text-gray-700">
                        {item.source}
                      </span>

                      <span className="font-medium">
                        {item.value}%
                      </span>

                    </div>

                    <div className="h-2 bg-gray-100 rounded mt-2 overflow-hidden">

                      <div
                        className={`h-full ${item.color} rounded`}
                        style={{
                          width: `${item.value}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </CardContent>

        </Card>

      </div>

      {/* ======================================================
          AI INSIGHTS
      ====================================================== */}

      <Card>

        <CardHeader>
          <CardTitle>
            Recent AI Insights
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {insights.map((insight, index) => (

            <div
              key={index}
              className="p-4 bg-gray-50 rounded-xl border-l-4 border-red-500"
            >
              <div className="flex items-start gap-3">

                <TrendingUp className="w-5 h-5 text-red-500 mt-0.5" />

                <p className="text-gray-700">
                  {insight}
                </p>

              </div>
            </div>

          ))}

        </CardContent>

      </Card>

    </div>
  );
}
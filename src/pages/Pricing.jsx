// src/pages/Pricing.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Solo recruiters & small teams getting started",
    price: "R1,549",
    period: "for 30 days",
    features: [
      "5 Active Jobs",
      "100 AI Candidate Matches",           // Updated
      "Candidate scoring and shortlisting", // Added as requested
      "Basic AI Screening",
      "AI Client Finder",
      "AI Outreach Engine",
      "CRM + Job Tracker",
      "Candidate Portal",
      "Smart Reporting",
      "Automated Invoicing",
    ],
    bestFor: "Solo recruiters & small teams",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    subtitle: "Growing agencies",
    price: "R2,999",                        // Updated
    period: "for 30 days",
    features: [
      "15 Active Jobs",
      "300 AI Candidate Matches",           // Updated
      "AI Video Screening",
      "Advanced Reporting",
      "Client Portal",
      "Everything in Starter +",
    ],
    bestFor: "Growing agencies",
    highlight: true,
  },
  {
    id: "advance",
    name: "Advance",
    subtitle: "High-volume recruiters",
    price: "R4,999",                        // Updated
    period: "for 30 days",
    features: [
      "30 Active Jobs",                     // Updated
      "600 AI Candidate Matches",           // Updated
      "Full Automation Suite",
      "Priority Support",
      "White-label Options",
      "Everything in Growth +",
    ],
    bestFor: "High-volume recruiters",
    highlight: false,
  },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState("starter");

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, powerful pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your recruitment needs. All plans include 30-day access with no auto-renewal.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.highlight ? 'border-red-600 shadow-2xl scale-105' : 'border-gray-200'}`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-semibold px-6 py-1 rounded-full">
                Most Popular
              </div>
            )}

            <CardHeader className="text-center pt-8">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="text-gray-500 mt-1">{plan.subtitle}</p>
            </CardHeader>

            <CardContent className="px-8 pb-10">
              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-lg"> {plan.period}</span>
              </div>

              <ul className="space-y-4 mb-10 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">✔</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={`/register?plan=${plan.id}`}>
                <Button 
                  className={`w-full py-6 text-lg font-semibold ${plan.highlight 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-900 hover:bg-black text-white'}`}
                >
                  Get Started
                </Button>
              </Link>

              <p className="text-center text-xs text-gray-500 mt-6">
                Cancel or pause anytime • No auto-renewal
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
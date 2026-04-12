// src/pages/Pricing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "R1,549",
    period: "for 30 days",
    description: "Solo recruiters & small teams getting started",
    features: [
      "5 Active Jobs",
      "25 AI Candidate Matches",
      "Basic AI Screening",
      "AI Client Finder",
      "AI Outreach Engine",
      "CRM + Job Tracker",
      "Candidate Portal",
      "Smart Reporting",
      "Automated Invoicing"
    ],
    highlight: false
  },
  {
    id: "growth",
    name: "Growth",
    price: "R3,999",
    period: "for 30 days",
    description: "Growing agencies",
    features: [
      "15 Active Jobs",
      "100 AI Candidate Matches",
      "AI Video Screening",
      "Advanced Reporting",
      "Client Portal",
      "Everything in Starter +"
    ],
    highlight: true
  },
  {
    id: "advance",
    name: "Advance",
    price: "R7,999",
    period: "for 30 days",
    description: "High-volume recruiters",
    features: [
      "50 Active Jobs",
      "Unlimited AI Matches",
      "Full Automation Suite",
      "Priority Support",
      "White-label Options",
      "Everything in Growth +"
    ],
    highlight: false
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 mb-12">Pay once for 30 days of full access. No automatic renewals.</p>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.highlight ? 'border-red-600 scale-105 shadow-xl' : ''}`}>
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-gray-500">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-8">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-500"> {plan.period}</span>
                </div>

                <ul className="space-y-3 text-left mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={`/register?plan=${plan.id}`}>
                  <Button 
                    className={`w-full py-6 text-lg ${plan.highlight ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-black'}`}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-12 text-gray-500">
          Pay once for 30 days • No auto-renewal • Cancel or pause anytime
        </p>
      </div>
    </div>
  );
}
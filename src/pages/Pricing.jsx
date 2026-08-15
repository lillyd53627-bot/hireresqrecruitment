// src/pages/Pricing.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const plans = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Solo recruiters & small teams getting started",
    price: "R1,549",
    period: "for 30 days",

    features: [
      "1 Active Job",
      "20 Candidate Matches",
      "Candidate scoring and shortlisting",
      "Basic AI Screening",
      "AI Outreach Engine",
      "CRM + Job Tracker",
      "Candidate Portal",
    ],

    bestFor: "Solo recruiters & small teams",
    highlight: false,
  },

  {
    id: "growth",
    name: "Growth",
    subtitle: "Growing recruitment agencies",
    price: "R3,549",
    period: "for 30 days",

    features: [
      "3 Active Jobs",
      "60 Candidate Matches",
      "Candidate scoring and shortlisting",
      "Advanced AI Screening",
      "AI Outreach Engine",
      "CRM + Job Tracker",
      "Candidate Portal",
      "AI Video Screening",
      "Advanced Reporting",
      "Client Portal",
      "AI Client Finder",
      "Smart Reporting",
      "Automated Invoicing",
    ],

    bestFor: "Growing agencies",
    highlight: true,
  },

  {
    id: "advance",
    name: "Advance",
    subtitle: "High-volume recruiters",
    price: "R6,349",
    period: "for 30 days",

    features: [
      "5 Active Jobs",
      "100 Candidate Matches",
      "Full AI Recruitment Suite",
      "Advanced Candidate Screening",
      "AI Video Screening",
      "AI Client Finder",
      "AI Outreach Engine",
      "Smart Reporting",
      "Advanced Reporting",
      "Automated Invoicing",
      "Client Portal",
      "Candidate Portal",
      "Priority Support",
      "White-label Options",
    ],

    bestFor: "High-volume recruiters",
    highlight: false,
  },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState("starter");

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">

      {/* =====================================================
          PAGE HEADER
         ===================================================== */}
      <div className="max-w-6xl mx-auto text-center mb-16">

        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, powerful pricing
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your recruitment needs.
          All plans include 30-day access with no auto-renewal.
        </p>

      </div>


      {/* =====================================================
          PRICING CARDS
         ===================================================== */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        {plans.map((plan) => (

          <Card
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative transition-all duration-300 ${
              selectedPlan === plan.id
                ? "ring-2 ring-red-600"
                : ""
            } ${
              plan.highlight
                ? "border-red-600 shadow-2xl md:scale-105"
                : "border-gray-200"
            }`}
          >

            {/* MOST POPULAR */}
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-semibold px-6 py-1 rounded-full">
                Most Popular
              </div>
            )}


            {/* PLAN HEADER */}
            <CardHeader className="text-center pt-8">

              <h2 className="text-2xl font-bold text-gray-900">
                {plan.name}
              </h2>

              <p className="text-gray-500 mt-1">
                {plan.subtitle}
              </p>

            </CardHeader>


            {/* PLAN CONTENT */}
            <CardContent className="px-8 pb-10">

              {/* PRICE */}
              <div className="text-center mb-8">

                <div>
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                </div>

                <span className="text-gray-500 text-lg">
                  {plan.period}
                </span>

              </div>


              {/* FEATURES */}
              <ul className="space-y-4 mb-10 text-left">

                {plan.features.map((feature, index) => (

                  <li
                    key={index}
                    className="flex items-start gap-3"
                  >

                    <span className="text-green-600 mt-1 font-bold">
                      ✔
                    </span>

                    <span className="text-gray-700">
                      {feature}
                    </span>

                  </li>

                ))}

              </ul>


              {/* GET STARTED */}
              <Link
                to={`/register?plan=${plan.id}`}
                className="block"
              >

                <Button
                  className={`w-full py-6 text-lg font-semibold ${
                    plan.highlight
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-900 hover:bg-black text-white"
                  }`}
                >
                  Get Started
                </Button>

              </Link>


              {/* PLAN FOOTER */}
              <p className="text-center text-xs text-gray-500 mt-6">
                Cancel or pause anytime • No auto-renewal
              </p>

            </CardContent>

          </Card>

        ))}

      </div>


      {/* =====================================================
          BOTTOM NOTE
         ===================================================== */}
      <div className="max-w-3xl mx-auto text-center mt-16">

        <p className="text-sm text-gray-500">
          All plans provide access for 30 days from the date of
          activation. Candidate matching limits apply per
          subscription period.
        </p>

      </div>

    </div>
  );
}

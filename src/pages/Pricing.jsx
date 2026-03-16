import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 'R1,549',
      description: 'Solo recruiters & small teams getting started',
      features: [
        '5 Active Jobs',
        '25 AI Candidate Matches/month',
        'Basic AI Screening',
        'AI Client Finder',
        'AI Outreach Engine',
        'CRM + Job Tracker',
        'Candidate Portal',
        'Smart Reporting',
        'Automated Invoicing',
      ],
      highlighted: false,
      buttonText: 'Get Started',
    },
    {
      name: 'Growth',
      price: 'R3,999',
      description: 'Growing agencies',
      features: [
        '15 Active Jobs',
        '100 AI Candidate Matches/month',
        'Advanced AI Features',
        'Everything in Starter, plus:',
        'AI Video Screening',
        'Advanced Analytics',
        'Priority AI Processing',
        'Dedicated Support',
      ],
      highlighted: true,
      buttonText: 'Most Popular – Get Started',
    },
    {
      name: 'Advance',
      price: 'R7,999',
      description: 'High-volume recruiters & talent partners',
      features: [
        '50 Active Jobs',
        'Unlimited AI Matches',
        'Full Automation Suite',
        'Everything in Growth, plus:',
        'Priority Support',
        'Full White-Label Platform',
        'Your Brand & Domain',
        'Unlimited Users',
      ],
      highlighted: false,
      buttonText: 'Get Started',
    },
  ];

  return (
    <div className="min-h-screen bg-white py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Supercharge your hiring with AI-powered tools
        </h1>
        <p className="text-xl text-gray-600 mb-16">
          Cancel anytime. No long-term contracts.
        </p>

        <div className="flex justify-center gap-6 mb-16">
          <Button variant="outline" className="text-lg px-8 py-6">Monthly</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6">Most Popular</Button>
          <Button variant="outline" className="text-lg px-8 py-6">Yearly</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`border ${
                plan.highlighted 
                  ? 'border-red-600 shadow-2xl scale-105' 
                  : 'border-gray-200 shadow-lg'
              } rounded-2xl overflow-hidden bg-white`}
            >
              {plan.highlighted && (
                <div className="bg-red-600 text-white py-3 text-center font-bold text-lg">
                  Most Popular
                </div>
              )}

              <CardHeader className="pt-10 pb-6">
                <CardTitle className="text-3xl font-bold text-gray-900">{plan.name}</CardTitle>
                <p className="text-gray-600 mt-3 text-lg">{plan.description}</p>
                <div className="mt-8">
                  <span className="text-5xl md:text-6xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-2xl text-gray-600">/month</span>
                </div>
              </CardHeader>

              <CardContent className="pb-12 px-8">
                <ul className="space-y-5 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-gray-700 text-lg">
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/register">
                  <Button
                    className={`w-full mt-12 py-7 text-xl font-medium ${
                      plan.highlighted
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-900 text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
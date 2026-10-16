import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Target,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Handshake,
  LayoutDashboard,
  Percent,
  Shield,
  Calculator,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EXAMPLES = [
  { ctc: "R300,000", fee: "R30,000", earn: "R7,500" },
  { ctc: "R500,000", fee: "R50,000", earn: "R12,500" },
  { ctc: "R800,000", fee: "R80,000", earn: "R20,000" },
  { ctc: "R1,000,000", fee: "R100,000", earn: "R25,000" },
];

export default function Partners() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-tight">
            Hire<span className="text-red-600">ResQ</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline"
            >
              Log in
            </Link>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link to="/partners/register/affiliate">Register as Lead Partner</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-gray-50" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-red-100 text-red-700 hover:bg-red-100">
              Partner programme · No subscription
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Refer hiring leads. Earn a{" "}
              <span className="text-red-600">flat 25%</span> of the placement fee.
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              Introduce companies that are hiring. HireResQ runs the recruitment.
              When the client pays the placement fee, you earn{" "}
              <strong>25% flat</strong> — or run your own desk as an Independent
              Recruiter and earn up to 50%.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                <Link to="/partners/register/affiliate">
                  Register as Lead Partner — 25%
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/partners/register/recruiter">
                  Independent Recruiter — up to 50%
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No monthly fee. You only earn when a placement is made and paid.
            </p>
          </div>
        </div>
      </section>

      {/* 25% fee structure — prominent */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-600 mb-4">
              <Calculator className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Lead Partner: 25% flat fee structure
            </h2>
            <p className="mt-3 text-gray-600">
              Simple, transparent, and the same rate for every Lead Partner.
            </p>
          </div>

          <Card className="border-0 shadow-sm max-w-3xl mx-auto mb-8">
            <CardContent className="p-6 md:p-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Formula
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                Your commission ={" "}
                <span className="text-red-600">Placement fee × 25%</span>
              </p>
              <p className="mt-3 text-sm text-gray-600">
                You earn only on the placement fee the client pays HireResQ — not
                on the candidate’s salary. Paid after a successful, paid placement.
              </p>
            </CardContent>
          </Card>

          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-gray-900 text-white text-left">
                  <th className="px-4 py-3 font-medium">Candidate CTC</th>
                  <th className="px-4 py-3 font-medium">
                    Placement fee (e.g. 10%)
                  </th>
                  <th className="px-4 py-3 font-medium text-red-300">
                    You earn @ 25%
                  </th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((row, i) => (
                  <tr
                    key={row.ctc}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.ctc}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.fee}</td>
                    <td className="px-4 py-3 font-bold text-red-600">
                      {row.earn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Placement fee % is agreed with the client (10% shown for illustration
              only). Your rate stays a flat 25% of whatever fee is collected.
            </p>
          </div>

          <div className="text-center mt-10">
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Link to="/partners/register/affiliate">
                Start earning 25% as a Lead Partner
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Choose your path</h2>
          <p className="mt-3 text-gray-600">
            Refer leads only, or run a full desk on HireResQ.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Lead Partner */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Handshake className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl">Lead Partner</CardTitle>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  25% flat
                </Badge>
              </div>
              <p className="text-sm text-gray-500 font-normal">
                Share leads. Earn when we place.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-gray-600">
                For operations directors, business owners, consultants, and
                professionals who hear about hiring needs and want to refer them
                without running full recruitment.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  "Introduce company, contact, and role context",
                  "HireResQ handles sourcing, screening & placement",
                  "Earn flat 25% of the placement fee when the client pays",
                  "No candidate work, no monthly subscription",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full bg-red-600 hover:bg-red-700 gap-2"
              >
                <Link to="/partners/register/affiliate">
                  Register as Lead Partner
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Independent Recruiter */}
          <Card className="border-2 border-red-600 shadow-md relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-red-600 text-white hover:bg-red-600">
                Up to 50%
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">Independent Recruiter</CardTitle>
              <p className="text-sm text-gray-500 font-normal">
                Run your own desk. Earn up to 50%.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-gray-600">
                For recruiters who want to own the client relationship, manage
                candidates, and track placements with HireResQ technology.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  "Your own Independent Recruiter dashboard",
                  "My Leads, My Vacancies, My Candidates, Placements",
                  "Commission tracking (pending / approved / paid)",
                  "Up to 50% of placement fee — no monthly subscription",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full bg-red-600 hover:bg-red-700 gap-2"
              >
                <Link to="/partners/register/recruiter">
                  Register as Independent Recruiter
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
            <p className="mt-3 text-gray-600">
              Three steps from intro to payout.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Users,
                title: "Register",
                body: "Create a free Lead Partner or Independent Recruiter account — no payment required.",
              },
              {
                step: "02",
                icon: Briefcase,
                title: "Introduce or run",
                body: "Share a hiring lead, or manage clients, vacancies, and candidates in your dashboard.",
              },
              {
                step: "03",
                icon: Target,
                title: "Earn",
                body: "On successful, paid placements you earn 25% (Lead Partner) or up to 50% (Independent Recruiter).",
              },
            ].map(({ step, icon: Icon, title, body }) => (
              <div key={step} className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-600 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-red-600 tracking-widest mb-1">
                  {step}
                </p>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-red-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Ready to earn with HireResQ?
            </h2>
            <p className="mt-2 text-white/80 max-w-xl">
              Lead Partners earn a flat 25% of placement fees. Independent
              Recruiters earn up to 50%. No subscription either way.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-red-600 hover:bg-gray-100 gap-2"
            >
              <Link to="/partners/register/affiliate">
                Lead Partner — 25%
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 gap-2"
            >
              <Link to="/partners/register/recruiter">
                Independent Recruiter — 50%
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600">
                Built for the South African market · Clear commission tracking ·
                Support from the HireResQ team
              </span>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <Link to="/terms" className="hover:text-gray-900">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-gray-900">
                Privacy
              </Link>
              <Link to="/contact" className="hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-gray-400">
            © {new Date().getFullYear()} HireResQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
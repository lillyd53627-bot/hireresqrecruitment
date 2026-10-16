import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Handshake,
  LayoutDashboard,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Clock,
  BadgeCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EARNINGS = [
  { role: "R300k CTC", fee: "R30k fee", you: "R7,500" },
  { role: "R500k CTC", fee: "R50k fee", you: "R12,500" },
  { role: "R800k CTC", fee: "R80k fee", you: "R20,000" },
  { role: "R1m CTC", fee: "R100k fee", you: "R25,000" },
];

export default function Partners() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
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
            <Button asChild className="bg-red-600 hover:bg-red-700 shadow-sm">
              <Link to="/partners/register/affiliate">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-50 via-white to-white" />
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-5 bg-red-100 text-red-700 hover:bg-red-100 border-0">
              No subscription · Earn on placements only
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Turn hiring introductions into{" "}
              <span className="text-red-600">real income</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Refer companies that are hiring and earn a{" "}
              <strong className="text-gray-900">flat 25%</strong> of the
              placement fee — or run your own desk and earn up to{" "}
              <strong className="text-gray-900">50%</strong>. Built for South
              Africa. Powered by HireResQ.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-base h-12 px-8 gap-2 shadow-md"
              >
                <Link to="/partners/register/affiliate">
                  Become a Lead Partner
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base h-12 px-8 gap-2"
              >
                <Link to="/partners/register/recruiter">
                  Independent Recruiter
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-gray-500">
              Free to join · No credit card · No monthly fees
            </p>
          </div>

          {/* Trust strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: PercentBadge, label: "25% flat", sub: "Lead Partners" },
              { icon: TrendingUp, label: "Up to 50%", sub: "Recruiters" },
              { icon: Clock, label: "Paid on placement", sub: "When client pays" },
              { icon: Shield, label: "SA-focused", sub: "Local support" },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="text-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
              >
                <Icon className="w-5 h-5 text-red-600 mx-auto mb-2" />
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem → solution */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              You already hear about hiring needs.
              <br />
              <span className="text-red-600">Now get paid for them.</span>
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Operations leaders, consultants, and networkers often know which
              companies are hiring — but have no simple way to earn from that
              knowledge. HireResQ turns those introductions into commission,
              without you running a recruitment agency.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "No need to source or interview candidates",
                "No software subscription to buy",
                "Clear 25% of every placement fee from your leads",
                "We handle recruitment end-to-end",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="p-8">
              <p className="text-sm text-white/70 font-medium uppercase tracking-wide">
                Lead Partner example
              </p>
              <p className="mt-3 text-4xl font-bold">R12,500</p>
              <p className="mt-2 text-white/80 text-sm">
                Your commission on a R50,000 placement fee (25% flat) — e.g. a
                R500k CTC role at 10% fee.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Placement fee</span>
                  <span>R50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Your rate</span>
                  <span>25% flat</span>
                </div>
                <div className="flex justify-between font-semibold text-red-300">
                  <span>You earn</span>
                  <span>R12,500</span>
                </div>
              </div>
              <Button
                asChild
                className="w-full mt-8 bg-red-600 hover:bg-red-700 gap-2"
              >
                <Link to="/partners/register/affiliate">
                  Claim this opportunity
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Earnings table */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              What you can earn as a Lead Partner
            </h2>
            <p className="mt-3 text-gray-600">
              Flat 25% of the placement fee — same rate on every successful,
              paid placement from your introductions.
            </p>
          </div>
          <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EARNINGS.map((row) => (
              <div
                key={row.role}
                className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm"
              >
                <p className="text-xs text-gray-500">{row.role}</p>
                <p className="text-xs text-gray-400 mt-0.5">{row.fee}</p>
                <p className="text-lg font-bold text-red-600 mt-2">{row.you}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Illustrative at 10% placement fee. Your 25% applies to the actual fee
            collected.
          </p>
          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 gap-2">
              <Link to="/partners/register/affiliate">
                Register free — start referring
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Two products */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Two ways to partner
          </h2>
          <p className="mt-3 text-gray-600">
            Pick the path that matches how you work.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8 space-y-5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Handshake className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold">Lead Partner</h3>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    25% flat
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Refer only · We recruit · You earn
                </p>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  "Share company + contact + role",
                  "HireResQ runs the full process",
                  "25% of placement fee when client pays",
                  "Ideal for busy professionals",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700 gap-2">
                <Link to="/partners/register/affiliate">
                  Join as Lead Partner
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-600 shadow-md">
            <CardContent className="p-8 space-y-5">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold">Independent Recruiter</h3>
                  <Badge className="bg-red-600 text-white hover:bg-red-600">
                    Up to 50%
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Full desk · Your clients · Your dashboard
                </p>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  "Own leads, vacancies, candidates, placements",
                  "Commission tracking built in",
                  "Up to 50% of placement fee",
                  "No monthly subscription",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full bg-red-600 hover:bg-red-700 gap-2">
                <Link to="/partners/register/recruiter">
                  Join as Independent Recruiter
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Live in three steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                n: "1",
                title: "Register free",
                body: "Create your Lead Partner or Independent Recruiter account in minutes.",
              },
              {
                n: "2",
                title: "Refer or recruit",
                body: "Send leads our way, or run placements from your own dashboard.",
              },
              {
                n: "3",
                title: "Get paid",
                body: "Earn when placements succeed and clients pay — tracked clearly.",
              },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
                  {s.n}
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-red-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-20 text-center">
          <BadgeCheck className="w-10 h-10 mx-auto mb-4 text-white/90" />
          <h2 className="text-3xl md:text-4xl font-bold">
            Start earning from the hiring conversations you already have
          </h2>
          <p className="mt-4 text-white/85 text-lg max-w-xl mx-auto">
            Join free today. No subscription. Lead Partners earn 25% flat.
            Independent Recruiters earn up to 50%.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 h-12 px-8 gap-2"
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
              className="border-white text-white hover:bg-white/10 h-12 px-8 gap-2"
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
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between gap-4 text-sm text-gray-500">
          <span>
            © {new Date().getFullYear()} HireResQ · Partner programme
          </span>
          <div className="flex gap-4">
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
      </footer>
    </div>
  );
}

function PercentBadge(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
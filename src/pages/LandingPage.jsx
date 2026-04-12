import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';   // ← ADD THIS LINE

<div className="text-center max-w-3xl mx-auto px-6 py-16">
  <h2 className="text-4xl font-bold mb-6">
    Stop chasing clients.<br />
    Let AI find them for you.
  </h2>
  <p className="text-xl text-gray-600 mb-10">
    Post jobs or run AI client-finding campaigns — same credits, double the results.<br />
    <span className="font-semibold text-red-600">Only 12 spots left at launch pricing.</span>
  </p>

  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <a
      href="/pricing"
      className="bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-12 py-5 rounded-2xl transition-all"
    >
      Claim My Launch Spot Now
    </a>
    <a
      href="https://wa.me/27123456789?text=Hi%20HireResQ%20team,%20I'm%20ready%20to%20claim%20my%20launch%20spot"
      target="_blank"
      className="border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg font-semibold px-10 py-5 rounded-2xl transition-all flex items-center gap-3"
    >
      <MessageCircle size={24} />
      Chat on WhatsApp
    </a>
  </div>

  <p className="text-xs text-gray-500 mt-6">No credit card required • Cancel anytime • 7-day free trial</p>
</div>
const fadeInUp = {
  inimate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6"
          >
            HireResQ AI
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10"
          >
            Your automated hiring department — sourcing, screening, interviews & shortlisting
          </motion.p>

          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-wrap justify-center gap-6"
          >
            import { useState, useEffect } from "react";

export default function LimitedOfferBanner() {
  const [spotsLeft, setSpotsLeft] = useState(12);

  // Fake countdown (decreases every 30 seconds for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsLeft((prev) => (prev > 3 ? prev - 1 : 3));
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 text-center shadow-xl">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm uppercase tracking-widest font-medium mb-1">Limited Launch Offer</p>
        <h3 className="text-2xl font-bold mb-2">
          We’re only onboarding <span className="text-yellow-300">50 clients</span> at this special rate
        </h3>
        <div className="flex items-center justify-center gap-3 text-xl">
          <span>Only</span>
          <span className="bg-white text-red-700 font-bold px-5 py-1 rounded-full text-3xl tabular-nums">
            {spotsLeft}
          </span>
          <span>spots remaining</span>
        </div>
        <p className="mt-3 text-sm opacity-90">
          Once these spots are filled, prices increase and we close the launch cohort.
        </p>
        <a
          href="/pricing"
          className="mt-6 inline-block bg-white text-red-700 hover:bg-yellow-300 hover:text-red-700 font-semibold px-10 py-3.5 rounded-xl text-lg transition-all"
        >
          Secure My Spot Before It’s Gone →
        </a>
      </div>
    </div>
  );
}
            <Link to="/pricing">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-10 py-7 text-xl">
                Get Started
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>

            <Link to="/demo">
  <Button size="lg" variant="outline" className="border-2 border-black text-black px-8 py-6 text-lg">
    <Play className="mr-2 w-5 h-5" />
    Watch Demo
  </Button>
</Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Powerful AI Tools for Modern Recruitment
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* AI Client Finder */}
            <Link to="/demo/ai-client-finder">
              <motion.div variants={fadeInUp} className="group cursor-pointer">
                <Card className="h-full transition-all hover:shadow-xl hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-red-600 transition-colors">
                      AI Client Finder
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Automatically discover companies actively hiring
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* AI Outreach Engine */}
            <Link to="/demo/outreach">
              <motion.div variants={fadeInUp} className="group cursor-pointer">
                <Card className="h-full transition-all hover:shadow-xl hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-red-600 transition-colors">
                      AI Outreach Engine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Personalized sequences that book meetings
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* AI Candidate Sourcing */}
            <Link to="/demo/ai-talent-sourcing">
              <motion.div variants={fadeInUp} className="group cursor-pointer">
                <Card className="h-full transition-all hover:shadow-xl hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-red-600 transition-colors">
                      AI Candidate Sourcing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Source from millions of profiles instantly
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* AI Video Screening */}
            <Link to="/demo/ai-video-screening">
              <motion.div variants={fadeInUp} className="group cursor-pointer">
                <Card className="h-full transition-all hover:shadow-xl hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-red-600 transition-colors">
                      AI Video Screening
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Automated interviews with smart scoring
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* Smart Reporting */}
            <Link to="/demo/smart-reporting">
              <motion.div variants={fadeInUp} className="group cursor-pointer">
                <Card className="h-full transition-all hover:shadow-xl hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-red-600 transition-colors">
                      Smart Reporting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Real-time analytics and insights
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* Automated Invoicing */}
            <Link to="/demo/automated-invoicing">
              <motion.div variants={fadeInUp} className="group cursor-pointer">
                <Card className="h-full transition-all hover:shadow-xl hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-red-600 transition-colors">
                      Automated Invoicing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Unlock full automated invoicing — get paid faster
                    </p>
                    <Button asChild className="mt-4 w-full bg-red-600 hover:bg-red-700">
                      <Link to="/pricing">Unlock Full Feature →</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* CRM + Job Tracker */}
            <Link to="/demo/crm-job-tracker">
              <motion.div variants={fadeInUp} className="group cursor-pointer">
                <Card className="h-full transition-all hover:shadow-xl hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-red-600 transition-colors">
                      CRM + Job Tracker
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Manage your entire pipeline
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* Client Portal */}
            <Link to="/demo/client-portal">
              <motion.div variants={fadeInUp} className="group cursor-pointer">
                <Card className="h-full transition-all hover:shadow-xl hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-red-600 transition-colors">
                      Client Portal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      White-label portal for your clients
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* Candidate Portal */}
            <Link to="/demo/candidate-portal">
              <motion.div variants={fadeInUp} className="group cursor-pointer">
                <Card className="h-full transition-all hover:shadow-xl hover:border-red-200">
                  <CardHeader>
                    <CardTitle className="text-2xl group-hover:text-red-600 transition-colors">
                      Candidate Portal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Seamless candidate experience
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-8"
          >
            Ready to Transform Your Hiring?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-xl text-gray-700 mb-10"
          >
            Join recruiters saving hours every week with AI-powered automation.
          </motion.p>
          <motion.div variants={fadeInUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <Link to="/pricing">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-12 py-8 text-xl">
                Get Started Now
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
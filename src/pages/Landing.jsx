import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

import { 
  Search, Users, Zap, Video, BarChart3, FileText, 
  Briefcase, UserCircle, Building2, Play, Check,
  ArrowRight, Sparkles, Bot, Target, Mail, MessageSquare,
  ChevronRight, Star, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PaystackPayment from '@/components/payment/PaystackPayment';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Target, title: 'AI Client Finder', desc: 'Automatically discover companies actively hiring', page: 'Clients' },
    { icon: Mail, title: 'AI Outreach Engine', desc: 'Personalized sequences that book meetings', page: 'Outreach' },
    { icon: Search, title: 'AI Candidate Sourcing', desc: 'Source from millions of profiles instantly', page: 'AISourcing' },
    { icon: Video, title: 'AI Video Screening', desc: 'Automated interviews with smart scoring', page: 'Interviews' },
    { icon: BarChart3, title: 'Smart Reporting', desc: 'Real-time analytics and insights', page: 'Analytics' },
    { icon: FileText, title: 'Automated Invoicing', desc: 'Get paid faster with auto-billing', page: 'Invoicing' },
    { icon: Briefcase, title: 'Job Tracker', desc: 'Manage your entire pipeline', page: 'Jobs' },
    { icon: Building2, title: 'Client Portal', desc: 'White-label portal for your clients', page: 'Clients' },
    { icon: UserCircle, title: 'Candidate Portal', desc: 'Seamless candidate experience', page: 'Candidates' },
  ];

  const testimonials = [
    { name: 'Sarah Mitchell', role: 'Recruitment Director', company: 'TalentFirst SA', text: 'HireRes cut our time-to-hire by 60%. The AI sourcing is incredible.', rating: 5 },
    { name: 'David Chen', role: 'Agency Owner', company: 'NextGen Recruiters', text: 'Went from 10 placements to 35 per month. Complete game changer.', rating: 5 },
    { name: 'Nomsa Dlamini', role: 'HR Manager', company: 'Innovate Corp', text: 'The automated screening saves us 20+ hours weekly. Exceptional ROI.', rating: 5 },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 1,549,
      displayPrice: 'R1,549',
      period: '/month',
      subtitle: 'Solo recruiters & small teams getting started',
      features: [
        '5 Active Jobs',
        '25 AI Candidate Matches/month',
        'Basic AI Screening',
        'AI Client Finder',
        'AI Outreach Engine',
        'CRM + Job Tracker',
        'Candidate Portal',
        'Smart Reporting',
        'Automated Invoicing'
      ],
      bestFor: 'Solo recruiters & small teams',
      limits: [],
      cta: 'Start Recruiting Smarter',
      popular: false
    },
    {
      name: 'Growth',
      price: 3,999,
      displayPrice: 'R3,999',
      period: '/month',
      subtitle: 'Growing agencies',
      features: [
        '15 Active Jobs',
        '100 AI Candidate Matches/month',
        'Advanced AI Features',
        'Everything in Starter, plus:',
        'AI Video Screening',
        'Advanced Reporting & Analytics',
        'Client Portal'
      ],
      bestFor: 'Growing agencies',
      limits: [],
      cta: 'Scale Your Agency',
      popular: true
    },
    {
      name: 'Advance',
      price: 7,999,
      displayPrice: 'R7,999',
      period: '/month',
      subtitle: 'High-volume recruiters & talent partners',
      features: [
        '50 Active Jobs',
        'Unlimited AI Matches',
        'Full Automation Suite',
        'Everything in Growth, plus:',
        'Priority AI Processing',
        'Dedicated Support',
        'HireResQ Talent Pool Access'
      ],
      bestFor: 'High-volume recruiters',
      limits: [],
      cta: 'Go Unlimited',
      popular: false
    },
    {
      name: 'Pro',
      price: 14,999,
      displayPrice: 'R14,999',
      period: '/month',
      subtitle: 'Agencies & recruitment brands',
      features: [
        'Unlimited Jobs',
        'White-label Option',
        'Priority Support',
        'Everything in Advance, plus:',
        'Full White-Label Platform',
        'Your Brand & Domain',
        'White-Label Portals',
        'Unlimited Users'
      ],
      bestFor: 'Agencies & franchise models',
      limits: [],
      cta: 'Launch Your Brand',
      popular: false
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693b35e7bd22762dbbbf62f1/3b46fae12_HireResQ.png" 
              alt="HireResQ Logo" 
              className="h-10 w-auto"
            />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-red-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-red-600 transition-colors">Pricing</a>
            <a href="#franchise" className="hover:text-red-600 transition-colors">Partner</a>
          </div>
          <div className="flex items-center gap-3">
           <Link to="/dashboard">

              <Button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 rounded-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-red-50/30" />
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="initial" 
            animate="animate" 
            variants={stagger}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                <Bot className="w-4 h-4" />
                AI-Powered Recruitment
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
            >
              <span className="text-red-600">HireResQ AI</span>
              <br />
              <span className="text-black">Your Automated Hiring Department</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-lg leading-relaxed"
            >
              Recruitment that runs itself. AI finds clients for you. AI finds candidates for you.
              <span className="text-black font-medium"> You focus on results, we automate the work.</span>
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6 rounded-full font-medium shadow-xl shadow-red-600/20 hover:shadow-red-600/30 transition-all">
                  Start
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">

                <Button size="lg" variant="outline" className="border-2 border-black text-black text-lg px-8 py-6 rounded-full font-medium hover:bg-black hover:text-white transition-all">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white" />
                ))}
              </div>
              <div className="text-sm">
                <span className="font-bold">2,000+</span>
                <span className="text-gray-600"> recruiters trust HireResQ</span>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-black rounded-3xl p-1 shadow-2xl shadow-black/30">
                <div className="bg-gray-900 rounded-[22px] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white font-medium">AI Sourcing Active</span>
                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">Live</span>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 bg-gray-700 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-white">847</div>
                          <div className="text-xs text-gray-400">Candidates Found</div>
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-red-500">23</div>
                          <div className="text-xs text-gray-400">Perfect Matches</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">AI Outreach</div>
                          <div className="text-gray-400 text-xs">12 responses today</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {['Screening', 'Matching', 'Scheduling'].map((task) => (
                        <div key={task} className="bg-gray-800 rounded-lg p-2 text-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1 animate-pulse" />
                          <div className="text-xs text-gray-400">{task}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-red-600 font-semibold tracking-wider text-sm uppercase">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Three steps to transform your recruiting</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'AI Finds Hiring Clients',
                items: ['Scans job boards', 'Scrapes LinkedIn', 'Builds leads list', 'Sends automated outreach']
              },
              {
                step: '02',
                title: 'AI Sources & Screens Candidates',
                items: ['Collects CVs', 'Runs AI interviewing', 'Scores candidates', 'Shortlists automatically']
              },
              {
                step: '03',
                title: 'You Deliver With 70% Less Work',
                items: ['Approve candidates', 'Track progress', 'Get paid faster', 'Scale effortlessly']
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="bg-white rounded-3xl p-8 h-full shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                  <div className="text-6xl font-bold text-red-600/10 absolute top-6 right-8">{item.step}</div>
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {i === 0 && <Target className="w-7 h-7 text-white" />}
                    {i === 1 && <Users className="w-7 h-7 text-white" />}
                    {i === 2 && <Zap className="w-7 h-7 text-white" />}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <ul className="space-y-3">
                    {item.items.map((point, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-600">
                        <Check className="w-5 h-5 text-red-600 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-red-600 font-semibold tracking-wider text-sm uppercase">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Everything you need to scale</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/${feature.page.toLowerCase()}`}>

                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-100 group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors">
                        <feature.icon className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-red-600 transition-colors">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.desc}</p>
                      <div className="flex items-center gap-1 text-red-600 text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        Learn more <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold">See HireRes AI in Action</h2>
            <p className="text-gray-400 mt-4 text-lg">Watch how your new AI hiring department works for you.</p>
          </motion.div>
          
          <Link to="/demo">

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-video max-w-5xl mx-auto rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 cursor-pointer group"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white rounded-full w-20 h-20 p-0 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 ml-1" />
                </Button>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-lg font-semibold">Click to watch interactive demo</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-red-600 font-semibold tracking-wider text-sm uppercase">Pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Choose your plan</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 flex flex-col ${
                  plan.popular 
                    ? 'bg-black text-white ring-4 ring-red-600 scale-105' 
                    : 'bg-white border-2 border-gray-100'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">
                    {plan.name === 'Starter' && '🚀 '}
                    {(plan.name === 'Growth' || plan.name === 'Advance') && '⚡ '}
                    {plan.name === 'Pro' && '👑 '}
                    {plan.name}{plan.name === 'Pro' && ' (White-Label)'}
                  </h3>
                  <p className={`text-sm ${plan.popular ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.subtitle}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.displayPrice}</span>
                    <span className={plan.popular ? 'text-gray-400' : 'text-gray-500'}>{plan.period}</span>
                  </div>
                </div>

                <div className="mb-6 flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-red-500' : 'text-red-600'}`} />
                        <span className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`mb-6 p-4 rounded-xl ${plan.popular ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-semibold mb-2 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                    Best for:
                  </p>
                  <p className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-700'}`}>
                    {plan.bestFor}
                  </p>
                </div>

                {plan.limits.length > 0 && (
                  <div className={`mb-6 p-3 rounded-lg border ${plan.popular ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                    <p className={`text-xs font-semibold mb-2 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                      Limits:
                    </p>
                    <ul className="space-y-1">
                      {plan.limits.map((limit, j) => (
                        <li key={j} className={`text-xs ${plan.popular ? 'text-gray-400' : 'text-gray-600'}`}>
                          • {limit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link to="/register">

                  <Button className={`w-full ${
                    plan.popular 
                      ? 'bg-white text-black hover:bg-gray-100' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}>
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="bg-gray-50 rounded-2xl p-6 max-w-4xl mx-auto">
              <p className="text-sm text-gray-600">
                <strong>All plans include:</strong> AI Client Finder, AI Outreach Engine, CRM + Job Tracker, 
                Candidate Portal, Smart Reporting, and Automated Invoicing. Higher tiers unlock more volume 
                and premium features. <strong>Monthly billing, cancel anytime.</strong>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Franchise Section */}
      <section id="franchise" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-black to-gray-900 rounded-[40px] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-3xl" />
            
            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-full">
                  Partnership Opportunity
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white">Become a HireResQ Partner</h2>
                <p className="text-gray-400 text-lg">Join our network of successful recruitment entrepreneurs. Get your own AI-powered hiring platform.</p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {['R30,000 License', 'Done-for-you AI', 'Earn from placements', 'Work from home'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-white">
                      <Check className="w-5 h-5 text-red-500" />
                      {item}
                    </div>
                  ))}
                </div>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 mt-4">
                  Apply to Join
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">50+</div>
                  <div className="text-gray-400">Active Partners</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-red-500 mb-2">R2M+</div>
                  <div className="text-gray-400">Partner Earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-red-600 font-semibold tracking-wider text-sm uppercase">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Loved by recruiters</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-2 border-red-100 hover:border-red-200 transition-colors">
                  <CardContent className="p-8">
                    <Quote className="w-10 h-10 text-red-600/20 mb-4" />
                    <p className="text-lg text-gray-700 mb-6">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">{testimonial.name[0]}</span>
                      </div>
                      <div>
                        <div className="font-bold">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-red-600 text-red-600" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693b35e7bd22762dbbbf62f1/3b46fae12_HireResQ.png" 
                  alt="HireResQ Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400">Your AI-powered hiring department. Automate recruitment, scale faster.</p>
            </div>
            
            {[
              { 
                title: 'Product', 
                links: [
                  { name: 'Features', href: '#features' },
                  { name: 'Integrations', href: "/settings" },
                  { name: 'API', href: 'https://docs.base44.com', external: true }
                ]
              },
              { 
                title: 'Company', 
                links: [
                  { name: 'About', href: '#' },
                  { name: 'Careers', href: '#' },
                  { name: 'Contact', href: 'mailto:support@hireresq.com' },
                  { name: 'Press', href: '#' }
                ]
              },
              { 
                title: 'Legal', 
                links: [
                  { name: 'Terms', href: '/terms' },
                  { name: 'Privacy', href: '/privacy' },
                  { name: 'Security', href: '/security' },
                  { name: 'POPIA', href: '/popia' }
                ]
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      {link.external ? (
                        <a 
                          href={link.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <a 
                          href={link.href} 
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
           <div className="border-t border-gray-800 pt-8 flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2026 HireResQ AI
            </p>

            <Link
              to="/dashboard"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Dashboard
            </Link>
          </div>

        </div>
      </footer>
    </div>
  );
}

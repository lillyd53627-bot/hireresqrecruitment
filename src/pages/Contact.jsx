import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">HireResQ AI</h1>
              <p className="text-xs text-gray-600">Your Automated Hiring Department</p>
            </div>
          </Link>
          <Link to={createPageUrl('Landing')}>
            <button className="text-gray-600 hover:text-gray-900">← Back to Home</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Contact HireResQ AI</h1>
          <p className="text-xl text-gray-600">
            Ready to automate your recruitment? Get in touch with our team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Call Us</h3>
            <p className="text-gray-600 mb-2">Speak to our team directly</p>
            <a href="tel:0105006844" className="text-red-600 font-semibold text-lg">
              010 500 6844
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Email Us</h3>
            <p className="text-gray-600 mb-2">Send us an enquiry</p>
            <a href="mailto:info@hireresq.co.za" className="text-red-600 font-semibold">
              info@hireresq.co.za
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
            <p className="text-gray-600 mb-2">Monday - Friday</p>
            <p className="text-gray-900 font-semibold">9:00 AM - 5:00 PM SAST</p>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <ContactForm />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 p-8 bg-white rounded-xl shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose HireResQ AI?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">🤖 AI-Powered</h4>
              <p className="text-gray-600">Automate sourcing, screening, and matching with cutting-edge AI technology.</p>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 mb-2">🎯 Client Finder</h4>
              <p className="text-gray-600">Discover companies actively hiring and expand your client base effortlessly.</p>
            </div>
            <div>
              <h4 className="font-semibold text-red-600 mb-2">⚡ 10x Faster</h4>
              <p className="text-gray-600">Reduce time-to-hire from weeks to days with intelligent automation.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2026 HireResQ AI. All rights reserved. | 
            <a href="/privacy" className="text-red-400 hover:underline ml-2">Privacy Policy</a> | 
            <a href="/terms" className="text-red-400 hover:underline ml-2">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
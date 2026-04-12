// src/pages/FeaturesDemo/AIAssistantDemo.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function AIAssistantDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Sparkles className="w-20 h-20 text-red-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold mb-6">AI Recruitment Assistant</h1>
        <p className="text-xl text-gray-600 mb-10">
          Get instant help with sourcing, screening, outreach, and candidate matching.
        </p>
        <Link 
          to="/register" 
          className="bg-red-600 text-white px-10 py-4 rounded-2xl text-lg font-medium hover:bg-red-700"
        >
          Unlock Full AI Assistant
        </Link>
      </div>
    </div>
  );
}
// src/pages/Contact.jsx
import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
        <p className="text-xl text-gray-600 mb-12">
          We're here to help you transform your recruitment process.
        </p>

        <div className="bg-white rounded-3xl p-12 shadow-sm">
          <div className="space-y-8">
            <a 
              href="https://wa.me/0834676026" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl text-xl font-medium transition-all"
            >
              <MessageCircle size={32} />
              Chat with us on WhatsApp
            </a>

            <a 
              href="tel:0834676026" 
              className="flex items-center justify-center gap-4 border-2 border-gray-300 hover:border-red-600 text-gray-700 hover:text-red-600 py-6 rounded-2xl text-xl font-medium transition-all"
            >
              <Phone size={32} />
              Call us: 083 467 6026
            </a>
          </div>

          <p className="mt-12 text-sm text-gray-500">
            Preferred communication: WhatsApp &amp; Phone
          </p>
        </div>
      </div>
    </div>
  );
}
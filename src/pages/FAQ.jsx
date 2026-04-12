import { useState } from "react";

const faqs = [
  {
    q: "What is HireResQ AI?",
    a: "HireResQ AI is a powerful recruitment platform that combines AI sourcing, smart screening, automated outreach, and job tracking — all in one place. It helps recruiters and agencies find candidates faster and win more clients."
  },
  {
    q: "How do Job Posting Credits work?",
    a: "Every plan includes a set number of credits (e.g. 5, 15, or unlimited). Each credit can be used in two ways: 1) To post a job on major platforms, or 2) To run an AI-powered client-finding campaign to discover companies actively hiring. You choose how to use each credit — total flexibility."
  },
  {
    q: "Can I use my credits to find clients instead of posting jobs?",
    a: "Yes! That’s one of our biggest advantages. Your credits are interchangeable. For example, with 5 credits you can post 5 jobs OR run 5 AI client-finding campaigns to discover companies that need recruiters — or mix both."
  },
  {
    q: "How does the AI Client Finder work?",
    a: "Our AI scans thousands of companies across LinkedIn, job boards, and public data to find businesses actively hiring. It then creates personalised outreach sequences so you can book meetings with hiring managers — all automatically."
  },
  {
    q: "What AI features are included?",
    a: "• AI Candidate Sourcing from millions of profiles\n• AI Video Interview Screening with smart scoring\n• AI Outreach Engine that books meetings\n• AI Resume & Job Description Bias Analyser\n• Smart Job Tracker & Pipeline Management\n• Automated Invoicing & Reporting"
  },
  {
    q: "Is my data safe and POPIA compliant?",
    a: "Yes. We are fully POPIA compliant. All data is encrypted, stored securely in South Africa where possible, and we never sell or share your candidate or client data with third parties."
  },
  {
    q: "How fast can I get results?",
    a: "Most users see the first AI-sourced candidates or client leads within 24–48 hours. Outreach campaigns typically start booking meetings within 3–7 days."
  },
  {
    q: "What plans are available?",
    a: "We offer three flexible plans:\n• Starter – 5 credits/month\n• Growth – 15 credits/month\n• Enterprise – Unlimited credits + white-label features"
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. You can cancel or pause your subscription at any time from your dashboard. No long-term contracts."
  },
  {
    q: "Do you offer a free trial?",
    a: "Yes! Every new user gets a 7-day free trial with 3 credits to test both job posting and AI client-finding features."
  },
  {
    q: "Who is HireResQ AI built for?",
    a: "Recruitment agencies, independent recruiters, HR teams, and talent acquisition professionals in South Africa who want to save time and win more business."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Frequently Asked Questions</h1>
        <p className="text-center text-gray-600 mb-12">Everything you need to know about HireResQ AI</p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-lg">{faq.q}</span>
                <span className={`text-red-600 transition-transform ${openIndex === index ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">Still have questions?</p>
          <a
            href="https://wa.me/0105006844?text=Hi%20HireResQ%20team,%20I%20have%20a%20question%20about%20your%20plans..."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            💬 Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
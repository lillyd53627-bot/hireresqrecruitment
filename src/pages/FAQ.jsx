import { useState } from "react";

const faqs = [
  {
    q: "What is HireResQ AI?",
    a: "HireResQ AI is a powerful recruitment platform that combines AI sourcing, smart screening, automated outreach, and job tracking — all in one place. It helps recruiters, agencies, and entrepreneurs find candidates faster and win more clients."
  },
  {
    q: "How does pricing work?",
    a: "There are no credits. When you select a plan, you get full access to the features included in that plan. You pay month-to-month only when you need to use the platform. There is no fixed-term contract — you can pause or cancel anytime."
  },
  {
    q: "What plans are available?",
    a: "We offer flexible month-to-month plans. You simply choose the plan that matches the features you need. You only pay when you actively use the service and can pause at any time."
  },
  {
    q: "How does the AI Client Finder work?",
    a: "Our AI scans thousands of companies across job boards and public data to find businesses that are actively hiring. It then creates personalised outreach sequences so you can book meetings with hiring managers — all automatically."
  },
  {
    q: "What AI features are included?",
    a: "• AI Candidate Sourcing from millions of profiles\n• AI Video Interview Screening with smart scoring\n• AI Outreach Engine that books meetings\n• AI Resume & Job Description Bias Analyser\n• Smart Job Tracker & Pipeline Management\n• Automated Invoicing & Reporting"
  },
  {
    q: "Who is HireResQ AI for?",
    a: "Recruitment agencies, independent recruiters, HR teams, talent acquisition professionals, and entrepreneurs in South Africa who want to start a recruitment business. It’s built for anyone who wants to save time and win more business."
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
    q: "Can I pause or cancel anytime?",
    a: "Yes. There is no fixed-term contract. You pay month-to-month and can pause or cancel your subscription at any time. You only pay when you need to use the features or services."
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
        <p className="text-center text-gray-600 mb-12">
          Everything you need to know about HireResQ AI
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-lg">{faq.q}</span>
                <span
                  className={`text-red-600 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed whitespace-pre-line">
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
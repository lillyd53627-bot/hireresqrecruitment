import { MessageCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-br from-zinc-950 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978')] bg-cover bg-center opacity-30"></div>

        <div className="relative text-center px-6 z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            HireResQ AI
            <br />
            <span className="text-red-600">The Complete AI Recruitment</span>
            <br />
            Department for Modern Agencies
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Built to help recruiters place faster, win more clients, and grow revenue — with less manual work.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg prose-red">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
            About HireResQ AI
          </h1>

          <p className="text-center text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            HireResQ AI was founded with one clear mission — to fix the slow, manual and fragmented recruitment process using intelligent automation.
          </p>

          <div className="space-y-12">
            {/* What Makes Us Different */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                A Smarter Way to Recruit
              </h2>
              <p>
                Traditional recruitment platforms only help you post jobs. HireResQ AI goes further — acting as a complete AI-powered recruitment department that supports you from sourcing candidates to securing new clients.
              </p>
              <p className="mt-4">
                Built by recruiters, HR professionals, and AI engineers, the platform combines real-world recruitment expertise with powerful automation to eliminate repetitive tasks and allow agencies to focus on closing placements and growing their business.
              </p>
            </section>

            {/* Key Benefits */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                What HireResQ AI Does for Recruiters
              </h2>

              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-3">
                    End-to-End Automation
                  </h3>
                  <p className="text-gray-600">
                    Automatically match, screen and shortlist candidates while the platform also identifies companies currently hiring — giving you both talent and clients in one system.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-3">
                    70% Less Admin Work
                  </h3>
                  <p className="text-gray-600">
                    Reduce the time spent sourcing, filtering and tracking candidates by over 70% with AI-driven workflows and a unified recruitment dashboard.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-3">
                    Built for Profitability
                  </h3>
                  <p className="text-gray-600">
                    Flexible credits allow you to use the platform for job postings, client sourcing and candidate matching — ensuring every action contributes directly to revenue growth.
                  </p>
                </div>
              </div>
            </section>

            {/* Vision */}
            <section>
              <h2 className="text-3xl font-bold mb-6">
                Our Vision
              </h2>
              <p>
                We believe recruitment should be faster, more accurate and more profitable. By combining artificial intelligence with real-world recruitment knowledge, HireResQ AI empowers agencies to scale their operations without increasing their workload or headcount.
              </p>
            </section>

            {/* Call to Action */}
            <section className="text-center mt-16">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Transform the Way You Recruit?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join forward-thinking recruiters who are already using HireResQ AI to win more clients, place candidates faster, and grow their monthly revenue with less effort.
              </p>

              <a
                href="https://wa.me/27123456789?text=Hi%20HireResQ%20team,%20I'd%20like%20to%20learn%20more%20about%20your%20platform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-colors"
              >
                <MessageCircle size={24} />
                Chat with us on WhatsApp
              </a>
            </section>

            <div className="mt-16 pt-8 border-t text-center text-sm text-gray-500">
              © 2025 HireResQ AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
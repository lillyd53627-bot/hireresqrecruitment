import { MessageCircle } from 'lucide-react';
// src/pages/Security.jsx
export default function Security() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-lg prose-red">
        <h1 className="text-4xl font-bold text-center mb-12">Security at HireResQ AI</h1>

        <p className="text-center text-xl text-gray-600 mb-12">
          We take the security of your data, candidates, and clients very seriously.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-6">Our Security Commitment</h2>
            <p>
              Protecting sensitive recruitment data (CVs, personal information, client details) is our top priority. We follow industry best practices and South African legal requirements (POPIA) to keep everything safe.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">Key Security Measures</h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl font-bold">🔒</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Encryption</h3>
                  <p className="text-gray-600">
                    All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your files and messages are protected end-to-end.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl font-bold">🛡️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Access Controls</h3>
                  <p className="text-gray-600">
                    Role-based access, multi-factor authentication (MFA), and strict internal access policies. Only authorized personnel can view sensitive data.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl font-bold">📜</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">POPIA & GDPR Alignment</h3>
                  <p className="text-gray-600">
                    Full compliance with South Africa's Protection of Personal Information Act (POPIA). We also align with GDPR principles for international clients.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl font-bold">🧪</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Regular Audits & Testing</h3>
                  <p className="text-gray-600">
                    Annual third-party penetration testing, vulnerability scanning, and continuous monitoring. We maintain SOC 2 Type 1 readiness.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl font-bold">☁️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure Hosting</h3>
                  <p className="text-gray-600">
                    Hosted on leading cloud providers with ISO 27001, SOC 2, and POPIA-aligned data centres (South Africa region where possible).
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold mb-6">Your Data is Yours</h2>
            <p>
              You own your candidate data, job postings, and client information. We only use it to provide the service and improve our AI models (anonymized & aggregated).
            </p>
            <p className="mt-4">
              You can request deletion of your account and data at any time — contact support@hireresq.ai.
            </p>
          </section>

          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              Have security questions or need our latest security report?
            </p>
            <a
              href="https://wa.me/27123456789?text=Hi%20HireResQ%20team,%20I'd%20like%20to%20discuss%20security%20and%20compliance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-colors"
            >
              <MessageCircle size={24} />
              Chat with us on WhatsApp
            </a>
          </div>

          <div className="mt-16 pt-8 border-t text-center text-sm text-gray-500">
            © 2025 HireResQ AI. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
{/* Add this section to src/pages/Security.jsx */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">🇿🇦</div>
    <h4 className="font-semibold">POPIA Compliant</h4>
    <p className="text-xs text-gray-500 mt-1">Fully registered with the Information Regulator</p>
  </div>

  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">🔒</div>
    <h4 className="font-semibold">ISO 27001 Aligned</h4>
    <p className="text-xs text-gray-500 mt-1">International information security standard</p>
  </div>

  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">🛡️</div>
    <h4 className="font-semibold">Data Hosted in SA</h4>
    <p className="text-xs text-gray-500 mt-1">Local servers – no unnecessary cross-border transfers</p>
  </div>

  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">✅</div>
    <h4 className="font-semibold">SOC 2 Ready</h4>
    <p className="text-xs text-gray-500 mt-1">Security, availability & confidentiality controls</p>
  </div>
</div>
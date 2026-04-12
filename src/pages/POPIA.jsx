import { MessageCircle } from 'lucide-react';
export default function POPIA() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto prose prose-lg prose-red">
        <h1 className="text-4xl font-bold text-center mb-12">POPIA Compliance</h1>

        <p className="text-center text-xl text-gray-600 mb-12">
          We are fully committed to South Africa's Protection of Personal Information Act (POPIA)
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-6">Our POPIA Commitment</h2>
            <p>
              HireResQ AI operates in full compliance with the Protection of Personal Information Act 4 of 2013 (POPIA). We treat personal information with the highest level of care and responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">How We Comply</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">Lawful Processing</h3>
                <p className="text-gray-600">
                  We only process personal information when we have a lawful basis (consent, contract, legitimate interest, legal obligation).
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">Purpose Limitation</h3>
                <p className="text-gray-600">
                  We collect data only for specific, explicit, and legitimate purposes — and we do not use it in ways incompatible with those purposes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">Data Minimisation</h3>
                <p className="text-gray-600">
                  We collect only the information we need to provide the Service (e.g. name, email, CVs for recruitment).
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">Accuracy</h3>
                <p className="text-gray-600">
                  We take reasonable steps to ensure personal data is accurate and up to date. You can request corrections at any time.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">Storage Limitation</h3>
                <p className="text-gray-600">
                  We retain personal data only as long as necessary for the purpose it was collected, or as required by law.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">Security</h3>
                <p className="text-gray-600">
                  Appropriate technical and organisational measures protect your data (encryption, access controls, regular audits).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">Your POPIA Rights</h2>
            <p className="mb-6">
              Under POPIA you have the right to:
            </p>
            <ul className="space-y-3 list-disc pl-6">
              <li>Be informed about how we process your data</li>
              <li>Access your personal information</li>
              <li>Request correction or deletion</li>
              <li>Object to processing</li>
              <li>Withdraw consent (where processing is based on consent)</li>
              <li>Lodge a complaint with the Information Regulator</li>
            </ul>
            <p className="mt-6">
              To exercise any of these rights, email us at support@hireresq.ai.
            </p>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold mb-6">Data Protection Officer</h2>
            <p>
              We have appointed a Data Protection Officer to oversee POPIA compliance.
            </p>
            <p className="mt-4">
              Contact: support@hireresq.ai
            </p>
          </section>

          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">
              Questions about POPIA compliance?
            </p>
            <a
              href="https://wa.me/27123456789?text=Hi%20HireResQ%20team,%20I%20have%20a%20question%20about%20POPIA%20compliance"
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
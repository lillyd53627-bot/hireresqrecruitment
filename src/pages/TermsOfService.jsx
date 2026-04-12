// src/pages/TermsOfService.jsx

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>

      <p className="text-gray-600 mb-6">
        Welcome to HireResQ AI. By accessing or using our platform, you agree to
        comply with and be bound by the following terms and conditions.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Use of Service</h2>
      <p className="text-gray-600 mb-4">
        You agree to use our services only for lawful purposes and in accordance
        with these Terms.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Accounts</h2>
      <p className="text-gray-600 mb-4">
        You are responsible for maintaining the confidentiality of your account
        and password and for restricting access to your account.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Privacy</h2>
      <p className="text-gray-600 mb-4">
        Your use of the service is also governed by our Privacy Policy.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitation of Liability</h2>
      <p className="text-gray-600 mb-4">
        HireResQ AI shall not be liable for any indirect, incidental, or
        consequential damages arising from the use of the platform.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Changes to Terms</h2>
      <p className="text-gray-600 mb-4">
        We reserve the right to update these Terms at any time without prior
        notice.
      </p>

      <p className="text-gray-500 mt-10">
        Last updated: {new Date().toLocaleDateString()}
      </p>

    </div>
  );
}
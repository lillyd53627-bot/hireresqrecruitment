import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PartnerAgreement() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          to="/partners"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Partners
        </Link>

        <h1 className="text-3xl font-bold mb-2">Master Partner Agreement</h1>
        <p className="text-sm text-gray-500 mb-8">Version v1.0-2026-10-27</p>

        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <p>
            This is the HireResQ Master Partner Agreement for Independent
            Recruiters and Lead Partners. It covers commission, VAT, client and
            candidate terms, and programme rules.
          </p>
          <p>
            <strong>Independent Recruiter:</strong> flat 50% of the placement
            fee received by HireResQ, after client payment clears. No monthly
            subscription.
          </p>
          <p>
            <strong>Lead Partner:</strong> flat 25% of the placement fee on
            attributed referred leads that result in a paid placement.
          </p>
          <p>
            Full legal text should be reviewed by your attorney before relying
            on this page as the final contract. By registering, you accept the
            partner terms presented at signup.
          </p>
          <p>
            For questions: contact HireResQ support.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/partners/register/recruiter"
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Register as Independent Recruiter
          </Link>
          <Link
            to="/partners/register/affiliate"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Register as Lead Partner
          </Link>
        </div>
      </div>
    </div>
  );
}
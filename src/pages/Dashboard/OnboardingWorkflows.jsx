import React from "react";
import {
  Users,
  UserPlus,
  CheckCircle,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function OnboardingWorkflows() {
  const stats = [
    {
      label: "Active Onboarding",
      value: "12",
      icon: Users,
    },
    {
      label: "Completed",
      value: "48",
      icon: CheckCircle,
    },
    {
      label: "Pending",
      value: "7",
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-full bg-gray-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Onboarding Workflows
        </h1>

        <p className="mt-2 text-gray-600">
          Manage candidate and client onboarding processes from one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Candidate onboarding */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-red-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Candidate Onboarding
              </h2>

              <p className="mt-1 text-gray-600">
                Manage new candidate onboarding, documentation,
                screening and placement preparation.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              "Candidate information",
              "Document collection",
              "Compliance checks",
              "Interview preparation",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors">
            Start Candidate Onboarding
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Client onboarding */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Client Onboarding
              </h2>

              <p className="mt-1 text-gray-600">
                Set up new recruitment clients and capture their
                hiring requirements.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              "Company information",
              "Hiring requirements",
              "Job specifications",
              "Service agreement",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-colors">
            Start Client Onboarding
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent onboarding */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Onboarding
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Recently created onboarding workflows.
          </p>
        </div>

        <div className="p-6">
          <div className="text-center py-10">
            <Users className="w-12 h-12 mx-auto text-gray-300" />

            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No recent workflows
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              New onboarding workflows will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
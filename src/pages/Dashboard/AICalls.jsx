// src/pages/Dashboard/AICalls.jsx

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Phone, Clock, User, Building2, Loader2 } from "lucide-react";

export default function AICalls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalls();
  }, []);

  async function loadCalls() {
    setLoading(true);

    const { data, error } = await supabase
      .from("ai_calls")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Failed to load AI calls:", error);
    }

    setCalls(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Phone className="w-7 h-7 text-red-600" />
          AI Calls
        </h1>
        <p className="text-gray-500 mt-1">
          Complete history of all outbound and inbound AI calls
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {calls.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No calls yet</p>
            <p className="text-sm mt-1">
              Calls will appear here once the AI Voice Agent starts dialling.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">
                    Contact
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">
                    Phone
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">
                    Duration
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">
                    Outcome
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">
                    Interest
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(call.created_at).toLocaleString("en-ZA")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {call.extracted_data?.contact_name || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {call.extracted_data?.company_name || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {call.phone_number}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {call.duration_seconds
                        ? `${Math.floor(call.duration_seconds / 60)}:${String(
                            call.duration_seconds % 60
                          ).padStart(2, "0")}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <OutcomeBadge outcome={call.outcome} />
                    </td>
                    <td className="px-6 py-4">
                      <InterestBadge level={call.interest_level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function OutcomeBadge({ outcome }) {
  if (!outcome) return <span className="text-gray-400">—</span>;

  const styles = {
    qualified: "bg-green-100 text-green-700",
    not_interested: "bg-red-100 text-red-700",
    callback: "bg-yellow-100 text-yellow-700",
    appointment_booked: "bg-blue-100 text-blue-700",
    no_answer: "bg-gray-100 text-gray-600",
    busy: "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        styles[outcome] || "bg-gray-100 text-gray-600"
      }`}
    >
      {outcome.replace(/_/g, " ")}
    </span>
  );
}

function InterestBadge({ level }) {
  if (!level) return <span className="text-gray-400">—</span>;

  const styles = {
    high: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        styles[level] || "bg-gray-100 text-gray-600"
      }`}
    >
      {level}
    </span>
  );
}
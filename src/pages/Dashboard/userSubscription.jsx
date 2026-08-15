// src/pages/Dashboard/userSubscription.jsx

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  CreditCard,
  Users,
  Briefcase,
  UserCheck,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function UserSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setError("Please log in to view your subscription.");
        return;
      }

      const { data, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        throw subscriptionError;
      }

      if (!data) {
        setSubscription(null);
        return;
      }

      // Check whether the 30-day subscription has expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);

      if (
        data.status === "active" &&
        expiresAt.getTime() <= now.getTime()
      ) {
        await supabase
          .from("subscriptions")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id);

        data.status = "expired";
      }

      setSubscription(data);
    } catch (err) {
      console.error("Subscription loading error:", err);
      setError("Unable to load your subscription.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading subscription...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-10 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />

              <h1 className="text-2xl font-bold text-gray-900">
                No Active Subscription
              </h1>

              <p className="text-gray-500 mt-2">
                You don't currently have a HireResQ subscription.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isActive = subscription.status === "active";

  const formattedStart = new Date(
    subscription.starts_at
  ).toLocaleDateString("en-ZA");

  const formattedExpiry = new Date(
    subscription.expires_at
  ).toLocaleDateString("en-ZA");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your HireResQ subscription and plan usage.
          </p>
        </div>

        {/* Current Plan */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">

              <CardTitle>
                Current Plan
              </CardTitle>

              <Badge
                className={
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />

                {isActive ? "Active" : "Expired"}
              </Badge>

            </div>
          </CardHeader>

          <CardContent>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Plan */}
              <div className="p-5 rounded-xl bg-white border">

                <p className="text-sm text-gray-500">
                  Plan
                </p>

                <p className="text-2xl font-bold mt-1">
                  {subscription.plan_name}
                </p>

              </div>

              {/* Price */}
              <div className="p-5 rounded-xl bg-white border">

                <p className="text-sm text-gray-500">
                  Package Price
                </p>

                <p className="text-2xl font-bold mt-1">
                  R{Number(subscription.amount).toLocaleString("en-ZA")}
                </p>

                <p className="text-sm text-gray-500">
                  for 30 days
                </p>

              </div>

              {/* Status */}
              <div className="p-5 rounded-xl bg-white border">

                <p className="text-sm text-gray-500">
                  Account Status
                </p>

                <p
                  className={`text-2xl font-bold mt-1 ${
                    isActive
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {isActive ? "Active" : "Expired"}
                </p>

              </div>

            </div>

          </CardContent>
        </Card>

        {/* Subscription Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Card className="border-0 shadow-sm">

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Subscription Started
              </CardTitle>
            </CardHeader>

            <CardContent>

              <p className="text-2xl font-bold">
                {formattedStart}
              </p>

              <p className="text-gray-500 mt-1">
                30-day access period
              </p>

            </CardContent>

          </Card>

          <Card className="border-0 shadow-sm">

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Subscription Expires
              </CardTitle>
            </CardHeader>

            <CardContent>

              <p className="text-2xl font-bold">
                {formattedExpiry}
              </p>

              <p className="text-gray-500 mt-1">
                Access expires after this date
              </p>

            </CardContent>

          </Card>

        </div>

        {/* Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Users */}
          <Card className="border-0 shadow-sm">

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users
              </CardTitle>
            </CardHeader>

            <CardContent>

              <p className="text-3xl font-bold">
                1
              </p>

              <p className="text-gray-500 mt-1">
                User included
              </p>

            </CardContent>

          </Card>

          {/* Jobs */}
          <Card className="border-0 shadow-sm">

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Active Jobs
              </CardTitle>
            </CardHeader>

            <CardContent>

              <p className="text-3xl font-bold">
                {subscription.active_jobs_limit}
              </p>

              <p className="text-gray-500 mt-1">
                Active jobs included
              </p>

            </CardContent>

          </Card>

          {/* Matches */}
          <Card className="border-0 shadow-sm">

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Candidate Matches
              </CardTitle>
            </CardHeader>

            <CardContent>

              <p className="text-3xl font-bold">
                {subscription.candidate_matches_limit}
              </p>

              <p className="text-gray-500 mt-1">
                Candidate matches included
              </p>

            </CardContent>

          </Card>

        </div>

        {/* Billing */}
        <Card className="border-0 shadow-sm">

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing
            </CardTitle>
          </CardHeader>

          <CardContent>

            <p className="text-gray-600">
              Your HireResQ package is{" "}
              <strong>
                {isActive ? "currently active" : "expired"}.
              </strong>
            </p>

            {subscription.paystack_reference && (
              <p className="text-sm text-gray-500 mt-2">
                Payment reference:{" "}
                {subscription.paystack_reference}
              </p>
            )}

          </CardContent>

        </Card>

      </div>
    </div>
  );
}
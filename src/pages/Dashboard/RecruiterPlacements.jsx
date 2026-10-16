import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Target,
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
  DollarSign,
  UserCheck,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { supabase } from "@/lib/supabase";

const formatZAR = (n) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function RecruiterPlacements() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!currentUser) {
          navigate("/login");
          return;
        }

        const { data: p, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role, commission_rate")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (p?.role !== "recruiter" && p?.role !== "admin") {
          navigate("/dashboard");
          return;
        }

        setUser(currentUser);
        setProfile(p);
        await loadPlacements(currentUser.id);

        if (mounted) setLoading(false);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err.message || "Unable to load placements.");
          setLoading(false);
        }
      }
    };

    initialise();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const loadPlacements = useCallback(async (recruiterId) => {
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("recruiter_placements")
        .select("*")
        .eq("recruiter_id", recruiterId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPlacements(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load placements.");
    }
  }, []);

  const rate = Number(profile?.commission_rate ?? 0.5);

  const stats = useMemo(() => {
    const pending = placements.filter((p) => p.status === "pending");
    const approved = placements.filter((p) => p.status === "approved");
    const paid = placements.filter((p) => p.status === "paid");

    const pendingEarn = pending.reduce(
      (sum, p) => sum + Number(p.commission_amount || 0),
      0
    );
    const approvedEarn = approved.reduce(
      (sum, p) => sum + Number(p.commission_amount || 0),
      0
    );
    const paidEarn = paid.reduce(
      (sum, p) => sum + Number(p.commission_amount || 0),
      0
    );

    return {
      total: placements.length,
      pendingEarn,
      approvedEarn,
      paidEarn,
      totalEarn: pendingEarn + approvedEarn + paidEarn,
    };
  }, [placements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track successful placements and your commission earnings.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => user && loadPlacements(user.id)}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <Card className="border-0 shadow-sm bg-gradient-to-r from-red-600 to-red-700 text-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-white/80 text-sm">Your commission rate</p>
              <p className="text-3xl font-bold">{Math.round(rate * 100)}%</p>
              <p className="text-sm text-white/70 mt-1">
                Earn up to 50% commission on successful placements.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {formatZAR(stats.pendingEarn)}
                </p>
                <p className="text-xs text-white/70">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatZAR(stats.approvedEarn)}
                </p>
                <p className="text-xs text-white/70">Approved</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatZAR(stats.paidEarn)}
                </p>
                <p className="text-xs text-white/70">Paid</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-red-600 bg-red-50">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Placements</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-green-600 bg-green-50">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatZAR(stats.totalEarn)}</p>
              <p className="text-xs text-gray-500">Your Commission</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-yellow-600 bg-yellow-50">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatZAR(stats.pendingEarn + stats.approvedEarn)}
              </p>
              <p className="text-xs text-gray-500">Pending Commission</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatZAR(stats.paidEarn)}</p>
              <p className="text-xs text-gray-500">Commission Paid</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError(null)} className="text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {placements.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-lg">No placements yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              When a candidate is successfully placed, the placement and your
              commission will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {placements.map((placement) => (
          <Card
            key={placement.id}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-lg text-gray-900">
                      {placement.candidate_name || "Candidate"} @{" "}
                      {placement.company_name || "Client"}
                    </p>
                    <Badge
                      className={
                        STATUS_COLORS[placement.status] || STATUS_COLORS.pending
                      }
                    >
                      {placement.status || "pending"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 mt-1">
                    <span>
                      Placement fee:{" "}
                      <strong className="text-gray-700">
                        {formatZAR(placement.fee_amount)}
                      </strong>
                    </span>
                    <span>
                      Your commission (
                      {Math.round((placement.commission_rate ?? rate) * 100)}
                      %):{" "}
                      <strong className="text-red-600">
                        {formatZAR(placement.commission_amount)}
                      </strong>
                    </span>
                    {placement.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(placement.created_at).toLocaleDateString(
                          "en-ZA"
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
// src/components/auth/ProtectedRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const VALID_PAID_PLANS = ["starter", "growth", "advance"];

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        // --------------------------------------------------
        // NOT LOGGED IN
        // --------------------------------------------------
        if (authError || !user) {
          if (mounted) {
            setIsAllowed(false);
            setLoading(false);
          }
          return;
        }

        // --------------------------------------------------
        // GET USER PLAN + ROLE
        // --------------------------------------------------
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("plan, role")
          .eq("email", user.email)
          .single();

        if (userError || !userData) {
          console.error("Could not find user account:", userError);

          if (mounted) {
            setIsAllowed(false);
            setLoading(false);
          }

          return;
        }

        const plan = String(userData.plan || "").toLowerCase();
        const role = String(userData.role || "").toLowerCase();

        // --------------------------------------------------
        // ADMIN + DEVELOPER BYPASS
        // --------------------------------------------------
        const isPrivileged =
          role === "admin" ||
          role === "developer";

        // --------------------------------------------------
        // PAID PLAN CHECK
        // --------------------------------------------------
        const hasPaidPlan = VALID_PAID_PLANS.includes(plan);

        // --------------------------------------------------
        // FINAL ACCESS DECISION
        // --------------------------------------------------
        if (mounted) {
          setIsAllowed(isPrivileged || hasPaidPlan);
          setLoading(false);
        }
      } catch (error) {
        console.error("ProtectedRoute error:", error);

        if (mounted) {
          setIsAllowed(false);
          setLoading(false);
        }
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, []);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">
          Checking your account...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // NOT AUTHORIZED
  // --------------------------------------------------
  if (!isAllowed) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // --------------------------------------------------
  // AUTHORIZED
  // --------------------------------------------------
  return <Outlet />;
}
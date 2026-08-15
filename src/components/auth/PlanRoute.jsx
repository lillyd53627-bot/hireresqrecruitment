// src/components/auth/PlanRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const PLAN_LEVELS = {
  starter: 1,
  growth: 2,
  advance: 3,
};

export default function PlanRoute({ minPlan = "starter" }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkPlan = async () => {
      try {
        // --------------------------------------------------
        // CHECK AUTHENTICATED USER
        // --------------------------------------------------

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          if (mounted) {
            setAllowed(false);
            setLoading(false);
          }

          return;
        }

        // --------------------------------------------------
        // GET PLAN + ROLE
        // --------------------------------------------------

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("plan, role")
          .eq("email", user.email)
          .single();

        if (userError || !userData) {
          console.error("Could not load user plan:", userError);

          if (mounted) {
            setAllowed(false);
            setLoading(false);
          }

          return;
        }

        const role = String(userData.role || "").toLowerCase();
        const plan = String(userData.plan || "").toLowerCase();
        const requiredPlan = String(minPlan || "starter").toLowerCase();

        // --------------------------------------------------
        // ADMIN + DEVELOPER = FULL ACCESS
        // --------------------------------------------------

        const isPrivileged =
          role === "admin" ||
          role === "developer";

        if (isPrivileged) {
          if (mounted) {
            setAllowed(true);
            setLoading(false);
          }

          return;
        }

        // --------------------------------------------------
        // VALIDATE REQUIRED PLAN
        // --------------------------------------------------

        const requiredLevel = PLAN_LEVELS[requiredPlan];

        if (!requiredLevel) {
          console.error(
            `Invalid PlanRoute configuration: "${requiredPlan}"`
          );

          if (mounted) {
            setAllowed(false);
            setLoading(false);
          }

          return;
        }

        // --------------------------------------------------
        // USER PLAN LEVEL
        // --------------------------------------------------

        const userLevel = PLAN_LEVELS[plan] || 0;

        // --------------------------------------------------
        // ACCESS CHECK
        //
        // Starter = 1
        // Growth  = 2
        // Advance = 3
        //
        // Therefore:
        //
        // Starter can access Starter
        // Growth can access Starter + Growth
        // Advance can access Starter + Growth + Advance
        // --------------------------------------------------

        const hasAccess = userLevel >= requiredLevel;

        if (mounted) {
          setAllowed(hasAccess);
          setLoading(false);
        }
      } catch (error) {
        console.error("PlanRoute error:", error);

        if (mounted) {
          setAllowed(false);
          setLoading(false);
        }
      }
    };

    checkPlan();

    return () => {
      mounted = false;
    };
  }, [minPlan]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">
          Checking your subscription...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ACCESS DENIED
  // --------------------------------------------------

  if (!allowed) {
    return (
      <Navigate
        to="/pricing"
        replace
        state={{
          from: location.pathname,
          requiredPlan: minPlan,
        }}
      />
    );
  }

  // --------------------------------------------------
  // ACCESS GRANTED
  // --------------------------------------------------

  return <Outlet />;
}
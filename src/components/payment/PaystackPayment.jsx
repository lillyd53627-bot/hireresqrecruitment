// src/components/payment/PaystackPayment.jsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function PaystackPayment({ plan, amount, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // ============================================================
      // GET CURRENT SUPABASE USER
      // ============================================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Supabase user error:", userError);
        toast.error("Unable to identify your account.");
        setLoading(false);
        return;
      }

      if (!user) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      // ============================================================
      // WAIT FOR PAYSTACK TO LOAD
      // ============================================================

      await new Promise((resolve) => setTimeout(resolve, 800));

      if (typeof window.PaystackPop === "undefined") {
        toast.error(
          "Payment system is still loading. Please refresh and try again."
        );
        setLoading(false);
        return;
      }

      // ============================================================
      // PLAN ID
      // ============================================================

      const planId =
        plan?.id ||
        plan?.name?.toLowerCase();

      if (!planId) {
        toast.error("Unable to identify the selected plan.");
        setLoading(false);
        return;
      }

      // ============================================================
      // LIVE PAYSTACK CHECKOUT
      // ============================================================

      const handler = window.PaystackPop.setup({
        key: "pk_live_cc5867f5fb5677cf09c944f61d1bc5692e8bb46e",

        email: user.email,

        amount: Math.round(Number(amount) * 100),

        currency: "ZAR",

        ref: `hrq_${Date.now()}_${user.id}`,

        channels: ["card", "bank_transfer", "qr"],

        metadata: {
          user_id: user.id,
          plan_id: planId,
          plan: planId,
          plan_name: plan?.name || planId,
        },

        // ==========================================================
        // PAYSTACK CALLBACK
        // ==========================================================

        callback: async (response) => {
          console.log(
            "✅ Paystack payment completed:",
            response
          );

          try {
            toast.info("Payment received. Verifying payment...");

            // ======================================================
            // VERIFY PAYMENT WITH YOUR EXPRESS BACKEND
            // ======================================================

            const API_URL =
              import.meta.env.VITE_API_URL ||
              "http://localhost:3000";

            const verificationResponse = await fetch(
              `${API_URL}/api/verify-paystack`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  reference: response.reference,
                  user_id: user.id,
                  plan_id: planId,
                }),
              }
            );

            const result = await verificationResponse.json();

            console.log(
              "🔎 Payment verification result:",
              result
            );

            // ======================================================
            // PAYMENT VERIFIED
            // ======================================================

            if (
              verificationResponse.ok &&
              result.status === "success"
            ) {
              toast.success(
                "🎉 Payment successful! Your HireResQ subscription is active."
              );

              if (typeof onSuccess === "function") {
                onSuccess(result);
              }

              // Send customer to dashboard
              window.location.href = "/dashboard";

              return;
            }

            // ======================================================
            // PAYMENT COULD NOT BE VERIFIED
            // ======================================================

            console.error(
              "❌ Payment verification failed:",
              result
            );

            toast.error(
              result.message ||
                "Payment could not be verified. Please contact support."
            );

            setLoading(false);
          } catch (verificationError) {
            console.error(
              "❌ Payment verification error:",
              verificationError
            );

            toast.error(
              "Payment was received, but verification failed. Please contact support."
            );

            setLoading(false);
          }
        },

        // ==========================================================
        // PAYMENT WINDOW CLOSED
        // ==========================================================

        onClose: () => {
          toast.info("Payment was cancelled");
          setLoading(false);
        },
      });

      // ============================================================
      // OPEN PAYSTACK
      // ============================================================

      handler.openIframe();
    } catch (error) {
      console.error(
        "❌ Payment initialization error:",
        error
      );

      toast.error(
        "Failed to initialize payment. Please refresh and try again."
      );

      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-red-600 hover:bg-red-700 text-white"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing Payment...
        </>
      ) : (
        <>
          <Check className="w-4 h-4 mr-2" />
          Create Account & Pay R{amount} for 30 days
        </>
      )}
    </Button>
  );
}
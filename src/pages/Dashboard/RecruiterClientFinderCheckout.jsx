import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Search, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const AMOUNT_ZAR = 457;
const AMOUNT_CENTS = 45700;
const PRODUCT = "client_finder_30d";

export default function RecruiterClientFinderCheckout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!currentUser) {
          navigate("/login");
          return;
        }

        setUser(currentUser);
        setEmail(currentUser.email || "");
        setLoading(false);
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load checkout.");
          setLoading(false);
        }
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const activateClientFinder = async (userId) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        client_finder_expires_at: expires.toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      throw new Error(
        updateError.message ||
          "Payment succeeded but access could not be saved. Contact support."
      );
    }
  };

  const loadPaystackScript = () =>
    new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paystack"));
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    if (!user) return;
    setPaying(true);
    setError(null);

    try {
      const publicKey =
        import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
        import.meta.env.VITE_PAYSTACK_KEY ||
        import.meta.env.VITE_PAYSTACK_PUBLIC ||
        import.meta.env.VITE_PAYSTACK;

      if (!publicKey || !String(publicKey).startsWith("pk_")) {
        console.error(
          "Paystack env check:",
          Object.keys(import.meta.env).filter((k) => k.includes("PAYSTACK"))
        );
        throw new Error(
          "Paystack public key missing. Add VITE_PAYSTACK_PUBLIC_KEY=pk_live_... to the project root .env (next to package.json), then stop and restart npm run dev."
        );
      }

      await loadPaystackScript();

      const reference = `cf30_${user.id.slice(0, 8)}_${Date.now()}`;

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email || user.email,
        amount: AMOUNT_CENTS,
        currency: "ZAR",
        ref: reference,
        metadata: {
          product: PRODUCT,
          user_id: user.id,
          days: 30,
        },
        callback: function () {
          (async () => {
            try {
              await activateClientFinder(user.id);
              setSuccess(true);
              setPaying(false);
              setTimeout(() => {
                navigate("/dashboard/aiclientfinder");
              }, 1500);
            } catch (err) {
              console.error(err);
              setError(
                err.message || "Payment received but activation failed."
              );
              setPaying(false);
            }
          })();
        },
        onClose: function () {
          setPaying(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to start payment.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto text-center">
        <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Access unlocked</h1>
        <p className="text-gray-600 mt-2">
          AI Client Finder is active for 30 days. Redirecting…
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-lg mx-auto">
      <button
        type="button"
        onClick={() => navigate("/dashboard/recruiter")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Recruiter Hub
      </button>

      <Card className="border-0 shadow-md">
        <CardContent className="p-8">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <Search className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Unlock AI Client Finder
          </h1>
          <p className="text-gray-600 mt-2">
            30 days of access to find companies currently hiring and enrich
            contacts for your Independent Recruiter desk.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">30-day access</span>
              <span className="text-2xl font-bold text-gray-900">
                R{AMOUNT_ZAR}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              One-time payment · Not a monthly subscription · ZAR
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            className="w-full mt-6 bg-red-600 hover:bg-red-700 py-6 text-base"
            disabled={paying}
            onClick={handlePay}
          >
            {paying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening Paystack…
              </>
            ) : (
              `Pay R${AMOUNT_ZAR} with Paystack`
            )}
          </Button>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            Secure payment via Paystack
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link
              to="/dashboard/recruiter"
              className="text-red-600 hover:underline"
            >
              Cancel and return
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
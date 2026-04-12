// src/components/payment/PaystackPayment.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PaystackPayment({ plan, amount, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please login first');
        setLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      if (typeof window.PaystackPop === 'undefined') {
        toast.error('Payment system is still loading. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: "pk_test_1e3c9cf56e6baaf0baa8481ef4eae75e1807e898",
        email: user.email,
        amount: Math.round(amount * 100),
        currency: 'ZAR',
        ref: `hrq_${Date.now()}_${user.id}`,
        metadata: {
          plan: plan.id || plan.name,
          plan_name: plan.name,
        },
        callback: async (response) => {
          console.log("✅ Payment successful!", response);

          toast.success(`🎉 Payment successful! Welcome to HireResQ AI`);

          // Show alert and let user manually go to login (this stops the loop)
          alert("Payment successful!\n\nPlease click OK, then go to the Login page and sign in with your email and password.");

          // Do NOT do any automatic redirect here
        },
        onClose: () => {
          toast.info("Payment was cancelled");
          setLoading(false);
        }
      });

      handler.openIframe();

    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize payment. Please refresh and try again.");
    } finally {
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
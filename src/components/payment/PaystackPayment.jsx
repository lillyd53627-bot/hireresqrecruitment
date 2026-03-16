import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const PAYSTACK_PUBLIC_KEY = 'pk_test_1e3c9cf56e6baaf0baa8481ef4eae75e1807e898';

export default function PaystackPayment({ plan, amount, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      
      const mockUser = {
        email: 'demo@hireresq.com',
        name: 'Demo Recruiter',
        subscription: 'paid'
      };

      if (!mockUser?.email) {
        
        setLoading(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: mockUser.email,
        amount: amount * 100,
        currency: 'ZAR',
        ref: `${Date.now()}_${mockUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Plan',
              variable_name: 'plan',
              value: plan.name || 'Pro Plan',
            },
          ],
        },
        callback: async (response) => {
          
          console.log('Paystack response:', response);

          toast.success('Payment successful! Welcome aboard!');
          
          if (onSuccess) onSuccess();

          setLoading(false);
        },
        onClose: () => {
          toast.error('Payment cancelled');
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment initialization failed');
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
          Processing...
        </>
      ) : (
        <>
          <Check className="w-4 h-4 mr-2" />
          Subscribe Now
        </>
      )}
    </Button>
  );
}
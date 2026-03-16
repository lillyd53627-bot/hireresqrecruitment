import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/lib/mockBase44';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your payment...');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get reference from URL
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');

      if (!reference) {
        setStatus('error');
        setMessage('Invalid payment reference');
        return;
      }

      // Verify payment with backend
      const response = await base44.functions.invoke('verifyRegistrationPayment', {
        reference
      });

      if (response.data.status === 'success') {
        setStatus('success');
        setMessage('Payment successful! Your HireResQ AI account is ready.');
        setPaymentData(response.data.data);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate(createPageUrl('Dashboard'));
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your payment. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {status === 'verifying' && (
              <>
                <Loader2 className="w-16 h-16 text-red-500 mx-auto animate-spin" />
                <h2 className="text-2xl font-bold text-white">Verifying Payment</h2>
                <p className="text-gray-400">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                <p className="text-gray-300">{message}</p>
                
                {paymentData && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left">
                    <h3 className="text-white font-semibold mb-3">Account Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{paymentData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <span className="text-white font-semibold">{paymentData.plan.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">R{paymentData.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reference:</span>
                        <span className="text-white text-xs">{paymentData.reference}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="text-left">
                      <p className="text-blue-300 text-sm font-semibold">Check Your Email</p>
                      <p className="text-blue-200 text-xs mt-1">
                        We've sent login credentials and onboarding instructions to {paymentData?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm">Redirecting to dashboard...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Payment Failed</h2>
                <p className="text-gray-300">{message}</p>
                
                <div className="space-y-3 mt-6">
                  <Button
                    onClick={() => navigate(createPageUrl('Register'))}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = 'mailto:support@hireresq.ai'}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Contact Support
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// src/pages/PaymentSuccess.jsx
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          <p className="text-gray-600 mt-2">Your 30-day package is now active.</p>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          {reference && <p className="text-sm text-gray-500">Reference: {reference}</p>}

          <div>
            <p className="font-medium mb-4">Next step: Log in to access your dashboard</p>
            
            <Link to="/login">
              <Button className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg">
                Log in to Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            You can cancel or pause your package anytime from your account settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
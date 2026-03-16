import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { reference } = await req.json();

    if (!reference) {
      return Response.json({
        status: 'error',
        message: 'Payment reference is required'
      }, { status: 400 });
    }

    // Verify payment with Paystack
    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackKey) {
      return Response.json({
        status: 'error',
        message: 'Payment configuration error'
      }, { status: 500 });
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${paystackKey}`
        }
      }
    );

    const verifyData = await verifyResponse.json();

    if (verifyData.status && verifyData.data.status === 'success') {
      const { email, metadata } = verifyData.data;
      const { fullName, company, phone, plan } = metadata;

      // Create user account via Base44 auth
      // Note: This is a simplified version - you'll need to adapt to your auth flow
      try {
        // In a real implementation, you would:
        // 1. Create the user account with proper authentication
        // 2. Send them an invitation email
        // 3. Store their subscription details
        
        // For now, we'll return success and let them login manually
        // You might want to store their details in a User entity or similar
        
        return Response.json({
          status: 'success',
          message: 'Payment successful! Your account is being set up.',
          data: {
            email,
            fullName,
            plan,
            amount: verifyData.data.amount / 100, // Convert from kobo to Rand
            reference: verifyData.data.reference
          }
        });
      } catch (error) {
        console.error('Account creation error:', error);
        return Response.json({
          status: 'error',
          message: 'Payment verified but account creation failed. Please contact support with reference: ' + reference
        }, { status: 500 });
      }
    } else {
      return Response.json({
        status: 'error',
        message: 'Payment verification failed or payment was not successful'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return Response.json({
      status: 'error',
      message: 'An error occurred during verification'
    }, { status: 500 });
  }
});
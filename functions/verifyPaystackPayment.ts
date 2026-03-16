import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference, plan } = await req.json();
    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return Response.json({ 
        success: false, 
        error: 'Payment verification failed' 
      }, { status: 400 });
    }

    // Calculate subscription dates
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const endDateStr = endDate.toISOString().split('T')[0];

    // Update user subscription status
    await base44.auth.updateMe({
      subscription_status: 'active',
      subscription_plan: plan,
      paystack_reference: reference,
      subscription_start_date: startDate,
      subscription_end_date: endDateStr,
    });

    return Response.json({ 
      success: true, 
      message: 'Payment verified and subscription activated' 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});
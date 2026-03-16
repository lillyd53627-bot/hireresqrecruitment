import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, fullName, company, phone, password, plan } = await req.json();

    // Validate business email domain
    const blockedDomains = [
      'gmail.com', 'gmail.co.za', 'yahoo.com', 'yahoo.co.za', 'hotmail.com',
      'hotmail.co.za', 'outlook.com', 'live.com', 'icloud.com', 'protonmail.com',
      'aol.com', 'mail.com', 'yandex.com', 'zoho.com', 'tutanota.com', 'gmx.com',
      'mail.ru', 'inbox.com', 'fastmail.com', 'hushmail.com', 'me.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(domain)) {
      return Response.json({
        status: 'error',
        message: 'Personal email addresses are not allowed. Please use a business email.'
      }, { status: 400 });
    }

    // Plan pricing (in kobo/cents - Paystack uses smallest currency unit)
    const planPricing = {
      starter: 154900,  // R1,549.00
      growth: 399900,   // R3,999.00
      advance: 799900,  // R7,999.00
      pro: 1499900      // R14,999.00
    };

    const amount = planPricing[plan] || planPricing.starter;
    const reference = `HIRERESQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store pending registration data temporarily
    // We'll create the actual user account after payment verification
    const registrationData = {
      email,
      fullName,
      company: company || '',
      phone: phone || '',
      password, // In production, this should be hashed before storing
      plan,
      reference,
      status: 'pending_payment',
      created_date: new Date().toISOString()
    };

    // Save to a PendingRegistration entity or similar
    // For now, we'll pass this in metadata to Paystack
    
    // Initialize Paystack transaction
    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackKey) {
      return Response.json({
        status: 'error',
        message: 'Payment configuration error. Please contact support.'
      }, { status: 500 });
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount,
        currency: 'ZAR',
        reference,
        callback_url: `${Deno.env.get('BASE44_APP_URL') || 'https://app.hireresq.ai'}/PaymentCallback?reference=${reference}`,
        metadata: {
          fullName,
          company,
          phone,
          plan,
          custom_fields: [
            {
              display_name: "Full Name",
              variable_name: "full_name",
              value: fullName
            },
            {
              display_name: "Plan",
              variable_name: "plan",
              value: plan.toUpperCase()
            }
          ]
        }
      })
    });

    const paystackData = await paystackResponse.json();

    if (paystackData.status && paystackData.data) {
      // Store registration data with reference for later verification
      // You could use a temporary entity or cache here
      // For simplicity, we'll rely on the webhook/callback verification
      
      return Response.json({
        status: 'success',
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference
      });
    } else {
      return Response.json({
        status: 'error',
        message: paystackData.message || 'Failed to initialize payment'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    return Response.json({
      status: 'error',
      message: 'An error occurred. Please try again.'
    }, { status: 500 });
  }
});
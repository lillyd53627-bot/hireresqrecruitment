// supabase/functions/verify-paystack/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { reference, user_id, plan } = await req.json();

    if (!reference || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Reference and user_id are required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await verifyResponse.json();

    if (!verifyResponse.ok || result.status !== true || result.data.status !== "success") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Payment verification failed",
          paystack_response: result 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Payment successful → Update subscription
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user_id,
        plan: plan || 'Professional',
        amount: result.data.amount / 100,        // Convert kobo → Rand
        currency: 'ZAR',
        status: 'active',
        paystack_reference: reference,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Database update failed:", dbError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update subscription record" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and subscription activated successfully",
        reference: reference,
        amount: result.data.amount / 100
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err) {
    console.error("Verification error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error during verification" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
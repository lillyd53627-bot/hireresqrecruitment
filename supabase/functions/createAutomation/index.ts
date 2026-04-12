// supabase/functions/createAutomation/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      automation_type,
      plan,
      paystack_reference,
      user_email,
      amount,
      user_id
    } = await req.json()

    if (!automation_type || !plan || !user_email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase
      .from('automations')
      .insert({
        automation_type,
        name: `${plan} Subscription - ${new Date().toISOString()}`,
        description: `New ${plan} plan subscription via Paystack`,
        payload: {
          plan,
          paystack_reference,
          amount,
          user_email,
          user_id
        },
        created_by: user_id,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    // Update user plan
    await supabase
      .from('users')
      .update({ 
        plan: plan,
        plan_name: plan.charAt(0).toUpperCase() + plan.slice(1),
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Automation created successfully",
        automation_id: data.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
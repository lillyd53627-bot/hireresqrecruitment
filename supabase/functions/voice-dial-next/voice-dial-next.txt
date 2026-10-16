// supabase/functions/voice-dial-next/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ============================================================
    // 1. Get the next lead that should be called
    // ============================================================
    const { data: leads, error: leadError } = await supabase.rpc(
      "get_next_call_lead"
    );

    if (leadError) throw leadError;

    if (!leads || leads.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No leads ready to call",
          call: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const lead = leads[0];

    // ============================================================
    // 2. Validate phone number
    // ============================================================
    if (!lead.phone || !String(lead.phone).trim()) {
      await supabase
        .from("ai_campaign_leads")
        .update({
          status: "failed",
          notes: "Missing phone number",
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", lead.lead_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Lead has no phone number – skipped",
          lead_id: lead.lead_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Clean the number
    let cleanedPhone = String(lead.phone).replace(/[\s\-\(\)]/g, "");

    // Basic format validation
    const isValidSA =
      /^0[6-8][0-9]{8}$/.test(cleanedPhone) ||
      /^27[6-8][0-9]{8}$/.test(cleanedPhone) ||
      /^\+27[6-8][0-9]{8}$/.test(cleanedPhone);

    const isValidInternational = /^\+?[1-9]\d{7,14}$/.test(cleanedPhone);

    if (!isValidSA && !isValidInternational) {
      await supabase
        .from("ai_campaign_leads")
        .update({
          status: "failed",
          notes: `Invalid phone number: ${lead.phone}`,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", lead.lead_id);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid phone number on lead: ${lead.phone}`,
          lead_id: lead.lead_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Normalise to 27XXXXXXXXX format
    if (cleanedPhone.startsWith("0")) {
      cleanedPhone = "27" + cleanedPhone.slice(1);
    }
    if (cleanedPhone.startsWith("+")) {
      cleanedPhone = cleanedPhone.slice(1);
    }

    // ============================================================
    // 3. Mark the lead as "calling" + increment attempts
    // ============================================================
    const { data: currentLead } = await supabase
      .from("ai_campaign_leads")
      .select("attempts")
      .eq("id", lead.lead_id)
      .single();

    await supabase
      .from("ai_campaign_leads")
      .update({
        status: "calling",
        last_attempt_at: new Date().toISOString(),
        attempts: (currentLead?.attempts || 0) + 1,
      })
      .eq("id", lead.lead_id);

    // ============================================================
    // 4. Create the call record
    // ============================================================
    const { data: callRecord, error: callError } = await supabase
      .from("ai_calls")
      .insert({
        direction: "outbound",
        provider: "switch_telecom",
        phone_number: cleanedPhone,
        campaign_id: lead.campaign_id,
        campaign_lead_id: lead.lead_id,
        status: "initiated",
        started_at: new Date().toISOString(),
        extracted_data: {
          contact_name: lead.contact_name,
          company_name: lead.company_name,
          vacancy_title: lead.vacancy_title,
        },
      })
      .select()
      .single();

    if (callError) throw callError;

    // ============================================================
    // 5. Update campaign stats (calls_made)
    // ============================================================
    const { data: camp } = await supabase
      .from("ai_campaigns")
      .select("calls_made")
      .eq("id", lead.campaign_id)
      .single();

    await supabase
      .from("ai_campaigns")
      .update({
        calls_made: (camp?.calls_made || 0) + 1,
      })
      .eq("id", lead.campaign_id);

    // ============================================================
    // 6. PLACE THE ACTUAL CALL (Switch Telecom placeholder)
    // ============================================================
    const fromNumber = Deno.env.get("SWITCH_TELECOM_FROM_NUMBER");
    const apiKey = Deno.env.get("SWITCH_TELECOM_API_KEY");
    const apiUrl = Deno.env.get("SWITCH_TELECOM_API_URL");
    const appUrl = Deno.env.get("APP_URL");

    let providerCallId: string | null = null;

    if (apiKey && apiUrl && fromNumber) {
      try {
        // ⚠️ TEMPLATE – replace path & body with Switch Telecom’s real API
        const switchRes = await fetch(`${apiUrl}/v1/calls`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            from: fromNumber,
            to: cleanedPhone,
            webhook_url: `${appUrl}/functions/v1/voice-webhook`,
            metadata: {
              hireresq_call_id: callRecord.id,
              campaign_id: lead.campaign_id,
              lead_id: lead.lead_id,
            },
            timeout: 45,
          }),
        });

        const switchData = await switchRes.json();

        if (!switchRes.ok) {
          console.error("Switch Telecom error:", switchData);

          await supabase
            .from("ai_calls")
            .update({
              status: "failed",
              ended_at: new Date().toISOString(),
              summary: `Provider error: ${JSON.stringify(switchData)}`,
            })
            .eq("id", callRecord.id);

          await supabase
            .from("ai_campaign_leads")
            .update({ status: "failed" })
            .eq("id", lead.lead_id);

          return new Response(
            JSON.stringify({
              success: false,
              error: "Failed to place call with Switch Telecom",
              details: switchData,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 502,
            }
          );
        }

        providerCallId =
          switchData.id ||
          switchData.call_id ||
          switchData.sid ||
          switchData.data?.id ||
          null;

        if (providerCallId) {
          await supabase
            .from("ai_calls")
            .update({
              provider_call_id: providerCallId,
              status: "ringing",
            })
            .eq("id", callRecord.id);
        }
      } catch (err) {
        console.error("Switch Telecom request failed:", err);

        await supabase
          .from("ai_calls")
          .update({
            status: "failed",
            ended_at: new Date().toISOString(),
            summary: `Network/request error: ${err.message}`,
          })
          .eq("id", callRecord.id);
      }
    } else {
      console.warn(
        "Switch Telecom credentials not configured – call left in 'initiated' status"
      );
    }

    // ============================================================
    // 7. Return success
    // ============================================================
    return new Response(
      JSON.stringify({
        success: true,
        message: providerCallId
          ? "Call placed successfully"
          : "Call prepared (provider not configured yet)",
        call: callRecord,
        lead: {
          id: lead.lead_id,
          phone: cleanedPhone,
          contact_name: lead.contact_name,
          company_name: lead.company_name,
          vacancy_title: lead.vacancy_title,
        },
        provider_call_id: providerCallId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("voice-dial-next error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
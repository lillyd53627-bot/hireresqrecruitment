// supabase/functions/voice-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-switch-signature",
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

    const payload = await req.json();
    console.log("Incoming voice webhook:", JSON.stringify(payload));

    // --------------------------------------------------
    // Extract provider call ID and event
    // (Adjust field names once you have Switch Telecom’s real payload)
    // --------------------------------------------------
    const providerCallId =
      payload.call_id ||
      payload.id ||
      payload.sid ||
      payload.CallSid ||
      payload.data?.id;

    const event =
      payload.event ||
      payload.status ||
      payload.CallStatus ||
      payload.type ||
      "";

    if (!providerCallId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing call id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Find our matching call record
    const { data: call, error: findError } = await supabase
      .from("ai_calls")
      .select("*")
      .eq("provider_call_id", providerCallId)
      .maybeSingle();

    if (findError || !call) {
      console.warn("No matching ai_calls row for", providerCallId);
      return new Response(
        JSON.stringify({ ok: true, message: "ignored – call not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    const normalised = String(event).toLowerCase();

    // Map provider events → HireResQ statuses
    if (["ringing", "initiated", "trying"].includes(normalised)) {
      updates.status = "ringing";
    } else if (
      ["answered", "in-progress", "in_progress", "connected"].includes(
        normalised
      )
    ) {
      updates.status = "in_progress";
      updates.answered_at = new Date().toISOString();
    } else if (["completed", "hangup", "ended"].includes(normalised)) {
      updates.status = "completed";
      updates.ended_at = new Date().toISOString();
      if (payload.duration || payload.Duration) {
        updates.duration_seconds = Number(payload.duration || payload.Duration);
      }
    } else if (["busy"].includes(normalised)) {
      updates.status = "busy";
      updates.ended_at = new Date().toISOString();
      updates.outcome = "busy";
    } else if (
      ["no-answer", "no_answer", "unanswered"].includes(normalised)
    ) {
      updates.status = "no_answer";
      updates.ended_at = new Date().toISOString();
      updates.outcome = "no_answer";
    } else if (["failed", "cancelled", "canceled"].includes(normalised)) {
      updates.status = "failed";
      updates.ended_at = new Date().toISOString();
    }

    // Optional recording URL
    if (payload.recording_url || payload.RecordingUrl) {
      updates.recording_url = payload.recording_url || payload.RecordingUrl;
    }

    // Update the call record
    await supabase.from("ai_calls").update(updates).eq("id", call.id);

    // Keep the campaign lead in sync
    if (call.campaign_lead_id) {
      let leadStatus = "completed";

      if (updates.status === "no_answer" || updates.status === "busy") {
        leadStatus = updates.status;
      } else if (updates.status === "failed") {
        leadStatus = "failed";
      }

      await supabase
        .from("ai_campaign_leads")
        .update({
          status: leadStatus,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", call.campaign_lead_id);
    }

    // Log the raw event for debugging
    await supabase.from("ai_call_events").insert({
      call_id: call.id,
      event_type: normalised || "webhook",
      payload,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("voice-webhook error:", err);

    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
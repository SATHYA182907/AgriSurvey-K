// AgriSurvey Edge Function: process-notification
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { notification_id, phone_number, message } = await req.json();

    const smsApiKey = Deno.env.get("SMS_PROVIDER_API_KEY");
    const smsSenderId = Deno.env.get("SMS_PROVIDER_SENDER_ID") || "AGRISURV";
    const smsBaseUrl = Deno.env.get("SMS_PROVIDER_BASE_URL");

    // Mask phone number for security in logs
    const maskedPhone = phone_number ? phone_number.replace(/(\d{2})\d{4}(\d{4})/, "$1****$2") : "UNKNOWN";

    if (!smsApiKey || !smsBaseUrl) {
      // Truthful fallback: Provider is not configured
      if (notification_id) {
        await supabaseClient.from("notification_jobs").insert({
          notification_id,
          provider: "SMS_GATEWAY_SIMULATED",
          delivery_status: "provider_unavailable",
          attempt_count: 1,
          last_attempt_at: new Date().toISOString(),
          error_code: "SMS_PROVIDER_CREDENTIALS_NOT_CONFIGURED",
        });
      }

      return new Response(
        JSON.stringify({
          status: "provider_unavailable",
          simulated: true,
          recipient: maskedPhone,
          message: "SMS provider credentials not configured in environment. Event recorded in database.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call external SMS provider API
    const response = await fetch(`${smsBaseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${smsApiKey}`,
      },
      body: JSON.stringify({
        sender: smsSenderId,
        recipient: phone_number,
        text: message,
      }),
    });

    const result = await response.json();
    const isSuccess = response.ok;

    if (notification_id) {
      await supabaseClient.from("notification_jobs").insert({
        notification_id,
        provider: "AUTHORIZED_SMS_GATEWAY",
        delivery_status: isSuccess ? "delivered" : "failed",
        attempt_count: 1,
        last_attempt_at: new Date().toISOString(),
        delivered_at: isSuccess ? new Date().toISOString() : null,
        provider_message_reference: result.id || result.message_id || null,
        error_code: isSuccess ? null : (result.error || "GATEWAY_REJECTED"),
      });
    }

    return new Response(JSON.stringify({ success: isSuccess, result }), {
      status: isSuccess ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

// AgriSurvey Edge Function: review-registration
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Role check: Only Tahsildar or Admin
    const { data: profile } = await supabaseClient.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || (profile.role !== "tahsildar" && profile.role !== "admin")) {
      return new Response(JSON.stringify({ error: "Forbidden: Tahsildar authorization required" }), { status: 403, headers: corsHeaders });
    }

    const { application_id, decision, notes, rejection_reason, additional_info_request } = await req.json();

    if (!application_id || !["APPROVED", "REJECTED", "ADDITIONAL_INFORMATION_REQUIRED"].includes(decision)) {
      return new Response(JSON.stringify({ error: "Invalid review decision or parameters" }), { status: 400, headers: corsHeaders });
    }

    if (decision === "REJECTED" && !rejection_reason) {
      return new Response(JSON.stringify({ error: "Rejection reason is mandatory" }), { status: 400, headers: corsHeaders });
    }

    if (decision === "ADDITIONAL_INFORMATION_REQUIRED" && !additional_info_request) {
      return new Response(JSON.stringify({ error: "Explanation is required for additional information request" }), { status: 400, headers: corsHeaders });
    }

    // Fetch existing application
    const { data: app, error: appFetchError } = await supabaseClient
      .from("registration_applications")
      .select("*, properties(*)")
      .eq("id", application_id)
      .single();

    if (appFetchError || !app) throw new Error("Application not found");

    const previousStatus = app.status;

    // Update status
    const updatePayload: any = {
      status: decision,
      reviewed_at: new Date().toISOString(),
      assigned_tahsildar_id: user.id,
      updated_at: new Date().toISOString(),
    };
    if (decision === "REJECTED") updatePayload.rejection_reason = rejection_reason;
    if (decision === "ADDITIONAL_INFORMATION_REQUIRED") updatePayload.additional_information_request = additional_info_request;

    const { error: updateError } = await supabaseClient
      .from("registration_applications")
      .update(updatePayload)
      .eq("id", application_id);

    if (updateError) throw updateError;

    // Audit Log
    await supabaseClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: `TAHSILDAR_APPLICATION_${decision}`,
      entity_type: "registration_applications",
      entity_id: application_id,
      previous_state: { status: previousStatus },
      new_state: { status: decision, notes: notes || rejection_reason || additional_info_request },
    });

    // In-app Notification to farmer
    let notifTitle = "";
    let notifMsg = "";
    if (decision === "APPROVED") {
      notifTitle = "Land Registration Approved";
      notifMsg = `Your AgriSurvey land registration application ${app.application_reference} has been approved. You may now upload 5-6 photographs of your land.`;
    } else if (decision === "REJECTED") {
      notifTitle = "Registration Application Rejected";
      notifMsg = `Your application ${app.application_reference} was rejected. Reason: ${rejection_reason}`;
    } else {
      notifTitle = "Additional Information Required";
      notifMsg = `Action needed on application ${app.application_reference}: ${additional_info_request}`;
    }

    await supabaseClient.from("notifications").insert({
      recipient_user_id: app.farmer_id,
      notification_type: `REGISTRATION_${decision}`,
      title: notifTitle,
      message: notifMsg,
      related_application_id: app.id,
      channel: "both",
      delivery_status: "pending",
    });

    return new Response(JSON.stringify({ success: true, decision, application_id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

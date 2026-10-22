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

    let generatedUsername: string | undefined;
    let activationTokenStr: string | undefined;
    let activationUrl: string | undefined;
    let smsJobRecord: any = null;

    if (decision === "APPROVED") {
      // 1. Generate unique government-formatted username
      const talukCode = (app.properties?.taluk || "PUN").slice(0, 3).toUpperCase();
      const randomSeq = Math.floor(10000 + Math.random() * 90000);
      generatedUsername = `MH-PUN-${talukCode}-${randomSeq}`;

      // 2. Generate secure 48h activation token
      activationTokenStr = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      // Store in activation_tokens
      await supabaseClient.from("activation_tokens").insert({
        user_id: app.farmer_id,
        application_id: app.id,
        token: activationTokenStr,
        expires_at: expiresAt,
      });

      // Update farmer profile
      await supabaseClient.from("profiles").update({
        username: generatedUsername,
        account_status: "pending_activation",
        activation_token: activationTokenStr,
        activation_expires_at: expiresAt,
      }).eq("id", app.farmer_id);

      const baseUrl = Deno.env.get("APP_LOGIN_URL") || "http://localhost:5173";
      activationUrl = `${baseUrl.replace(/\/auth\/login.*$/, "")}/auth/activate?token=${activationTokenStr}`;

      // 3. MSG91 SMS Notification Dispatch
      const msg91AuthKey = Deno.env.get("MSG91_AUTH_KEY");
      const senderId = Deno.env.get("MSG91_SENDER_ID") || "AGRSRV";
      const templateId = Deno.env.get("MSG91_APPROVAL_TEMPLATE_ID");

      // Fetch farmer phone
      const { data: farmerUser } = await supabaseClient.from("profiles").select("phone_number, full_name").eq("id", app.farmer_id).single();
      const farmerPhone = farmerUser?.phone_number;

      let smsStatus = "PROVIDER_UNAVAILABLE";
      let smsError: string | null = null;
      let providerRef: string | null = null;

      if (farmerPhone && msg91AuthKey && templateId) {
        try {
          const smsPayload = {
            template_id: templateId,
            short_url: "0",
            recipients: [
              {
                mobiles: `91${farmerPhone.replace(/\D/g, "").slice(-10)}`,
                farmer_name: farmerUser.full_name || "Farmer",
                application_ref: app.application_reference,
                username: generatedUsername,
                activation_link: activationUrl,
              },
            ],
          };

          const msg91Res = await fetch("https://control.msg91.com/api/v5/flow/", {
            method: "POST",
            headers: {
              "authkey": msg91AuthKey,
              "content-type": "application/json",
            },
            body: JSON.stringify(smsPayload),
          });

          const msg91Data = await msg91Res.json();
          if (msg91Res.ok && msg91Data.type === "success") {
            smsStatus = "SENT";
            providerRef = msg91Data.message || "MSG91-OK";
          } else {
            smsStatus = "FAILED";
            smsError = msg91Data.message || `MSG91 HTTP ${msg91Res.status}`;
          }
        } catch (e: any) {
          smsStatus = "FAILED";
          smsError = e.message || "Network error dispatching MSG91 SMS";
        }
      }

      // Record in notification_jobs
      const { data: insertedJob } = await supabaseClient.from("notification_jobs").insert({
        provider: "MSG91",
        application_id: app.id,
        recipient_phone: farmerPhone,
        template_id: templateId || "APPROVAL_FLOW",
        delivery_status: smsStatus,
        provider_message_reference: providerRef,
        error_details: smsError,
        idempotency_key: `msg91-approval-${app.id}`,
      }).select().single();

      smsJobRecord = insertedJob;
    }

    // In-app Notification to farmer
    let notifTitle = "";
    let notifMsg = "";
    if (decision === "APPROVED") {
      notifTitle = "Land Registration Approved";
      notifMsg = `Your AgriSurvey land registration application ${app.application_reference} has been approved. Your username is ${generatedUsername}. Please activate your account to set your password.`;
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

    return new Response(JSON.stringify({
      success: true,
      decision,
      application_id,
      username: generatedUsername,
      activationToken: activationTokenStr,
      activationUrl,
      smsJob: smsJobRecord,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

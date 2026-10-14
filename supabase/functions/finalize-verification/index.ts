// AgriSurvey Edge Function: finalize-verification
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

    const {
      application_id,
      property_id,
      final_status,
      findings,
      discrepancies,
      supporting_evidence,
    } = await req.json();

    if (!application_id || !property_id || !final_status) {
      return new Response(JSON.stringify({ error: "Missing required report parameters" }), { status: 400, headers: corsHeaders });
    }

    const reportRef = `AGRI-VR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const { data: report, error: repError } = await supabaseClient
      .from("verification_reports")
      .insert({
        report_reference: reportRef,
        property_id,
        application_id,
        reviewed_by: user.id,
        final_status,
        findings: findings || {},
        discrepancies: discrepancies || null,
        supporting_evidence: supporting_evidence || [],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (repError) throw repError;

    // Audit log
    await supabaseClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "FINAL_LAND_VERIFICATION_COMPLETED",
      entity_type: "verification_reports",
      entity_id: report.id,
      new_state: { report_reference: reportRef, final_status },
    });

    // Notify farmer of final verification report
    const { data: app } = await supabaseClient
      .from("registration_applications")
      .select("farmer_id, application_reference")
      .eq("id", application_id)
      .single();

    if (app) {
      await supabaseClient.from("notifications").insert({
        recipient_user_id: app.farmer_id,
        notification_type: "FINAL_VERIFICATION_COMPLETED",
        title: "Verification Report Available",
        message: `Official land verification report ${reportRef} has been compiled for application ${app.application_reference}. Decision: ${final_status}.`,
        related_application_id: application_id,
        channel: "both",
        delivery_status: "pending",
      });
    }

    return new Response(JSON.stringify({ success: true, report_reference: reportRef, report_id: report.id }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

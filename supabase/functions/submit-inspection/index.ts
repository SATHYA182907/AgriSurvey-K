// AgriSurvey Edge Function: submit-inspection
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

    const { inspection_id, field_notes, status } = await req.json();

    if (!inspection_id) {
      return new Response(JSON.stringify({ error: "Inspection ID required" }), { status: 400, headers: corsHeaders });
    }

    // Verify worker assignment
    const { data: insp, error: inspFetch } = await supabaseClient
      .from("field_inspections")
      .select("*, registration_applications(*)")
      .eq("id", inspection_id)
      .single();

    if (inspFetch || !insp) throw new Error("Inspection record not found");

    const newStatus = status || "SUBMITTED_FOR_REVIEW";

    const { error: updateError } = await supabaseClient
      .from("field_inspections")
      .update({
        inspection_status: newStatus,
        field_notes: field_notes || insp.field_notes,
        completed_at: newStatus === "COMPLETED" || newStatus === "SUBMITTED_FOR_REVIEW" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inspection_id);

    if (updateError) throw updateError;

    // Audit Log
    await supabaseClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "FIELD_INSPECTION_SUBMITTED",
      entity_type: "field_inspections",
      entity_id: inspection_id,
      new_state: { inspection_status: newStatus, field_notes },
    });

    // Notify Tahsildar that drone evidence is ready for review
    if (insp.assigned_tahsildar_id) {
      await supabaseClient.from("notifications").insert({
        recipient_user_id: insp.assigned_tahsildar_id,
        notification_type: "DRONE_EVIDENCE_READY",
        title: "Drone Imagery Submitted for Review",
        message: `Field worker submitted inspection evidence for application ${insp.registration_applications?.application_reference}. Ready for image comparison.`,
        related_application_id: insp.application_id,
        channel: "in_app",
        delivery_status: "delivered",
      });
    }

    return new Response(JSON.stringify({ success: true, inspection_id, status: newStatus }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

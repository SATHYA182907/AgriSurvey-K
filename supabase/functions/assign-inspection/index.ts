// AgriSurvey Edge Function: assign-inspection
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

    const { application_id, property_id, assigned_worker_id, scheduled_at, field_notes } = await req.json();

    if (!application_id || !property_id || !assigned_worker_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
    }

    const { data: inspection, error: inspError } = await supabaseClient
      .from("field_inspections")
      .insert({
        property_id,
        application_id,
        assigned_worker_id,
        assigned_tahsildar_id: user.id,
        inspection_status: "ASSIGNED",
        scheduled_at: scheduled_at || null,
        field_notes: field_notes || "Field inspection assigned for drone boundary & crop verification.",
      })
      .select()
      .single();

    if (inspError) throw inspError;

    // Audit log
    await supabaseClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "FIELD_INSPECTION_ASSIGNED",
      entity_type: "field_inspections",
      entity_id: inspection.id,
      new_state: { inspection_id: inspection.id, assigned_worker_id, scheduled_at },
    });

    // Notify field worker
    await supabaseClient.from("notifications").insert({
      recipient_user_id: assigned_worker_id,
      notification_type: "NEW_INSPECTION_ASSIGNED",
      title: "New Drone Inspection Assigned",
      message: `You have been assigned field inspection for application ${application_id}.`,
      related_application_id: application_id,
      channel: "in_app",
      delivery_status: "delivered",
    });

    return new Response(JSON.stringify({ success: true, inspection }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

// AgriSurvey Edge Function: create-registration
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // 1. Verify authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const { property, identity, documents } = payload;

    // 2. Validate input fields
    if (!property?.survey_number || !property?.land_area || !property?.district || !property?.taluk) {
      return new Response(JSON.stringify({ error: "Missing required property fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Create or update farmer profile (sensitive info masked)
    const { error: profileError } = await supabaseClient
      .from("farmer_profiles")
      .upsert({
        user_id: user.id,
        address: identity.address,
        village: identity.village,
        taluk: identity.taluk,
        district: identity.district,
        state: identity.state,
        postal_code: identity.postal_code,
        identity_verification_status: "VERIFIED_DOC_ATTACHED",
        identity_verification_reference: `ID-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    // 4. Generate unique property reference
    const propRef = `AGRI-PROP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: propData, error: propInsertError } = await supabaseClient
      .from("properties")
      .insert({
        farmer_id: user.id,
        property_reference: propRef,
        property_name: property.property_name || `Land at Survey ${property.survey_number}`,
        survey_number: property.survey_number,
        subdivision_number: property.subdivision_number || null,
        land_document_reference: property.land_document_reference || `DOC-${Date.now().toString().slice(-6)}`,
        land_area: property.land_area,
        land_area_unit: property.land_area_unit || "Acres",
        land_type: property.land_type || "Agricultural Land",
        farm_type: property.farm_type || "Crop Farming",
        ownership_category: property.ownership_category || "Individual Ownership",
        village: property.village,
        taluk: property.taluk,
        district: property.district,
        state: property.state,
        latitude: property.latitude || null,
        longitude: property.longitude || null,
      })
      .select()
      .single();

    if (propInsertError) throw propInsertError;

    // 5. Determine responsible Tahsildar in jurisdiction
    const { data: staffData } = await supabaseClient
      .from("staff_regions")
      .select("staff_user_id")
      .eq("district", property.district)
      .eq("taluk", property.taluk)
      .limit(1)
      .maybeSingle();

    const assignedTahsildarId = staffData?.staff_user_id || null;

    // 6. Generate unique application reference
    const appRef = `AGRI-APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const { data: appData, error: appInsertError } = await supabaseClient
      .from("registration_applications")
      .insert({
        application_reference: appRef,
        farmer_id: user.id,
        property_id: propData.id,
        status: "PENDING_TAHSILDAR_REVIEW",
        assigned_tahsildar_id: assignedTahsildarId,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (appInsertError) throw appInsertError;

    // 7. Audit log event
    await supabaseClient.from("audit_logs").insert({
      actor_user_id: user.id,
      action: "FARMER_REGISTRATION_SUBMITTED",
      entity_type: "registration_applications",
      entity_id: appData.id,
      new_state: { application_reference: appRef, status: "PENDING_TAHSILDAR_REVIEW" },
    });

    // 8. Create In-App Notification for Tahsildar if assigned
    if (assignedTahsildarId) {
      await supabaseClient.from("notifications").insert({
        recipient_user_id: assignedTahsildarId,
        notification_type: "NEW_REGISTRATION_SUBMITTED",
        title: "New Land Registration Review Pending",
        message: `New registration application ${appRef} submitted in ${property.taluk}, ${property.district}. Survey No: ${property.survey_number}.`,
        related_application_id: appData.id,
        channel: "in_app",
        delivery_status: "delivered",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your land registration application has been submitted successfully. It is awaiting verification by the responsible Tahsildar.",
        application_reference: appRef,
        property_reference: propRef,
        application_id: appData.id,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

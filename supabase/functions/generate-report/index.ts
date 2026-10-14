// AgriSurvey Edge Function: generate-report
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

    const { report_id } = await req.json();
    if (!report_id) {
      return new Response(JSON.stringify({ error: "Missing report_id" }), { status: 400, headers: corsHeaders });
    }

    const { data: report, error } = await supabaseClient
      .from("verification_reports")
      .select(`
        *,
        properties(*),
        registration_applications(*),
        reviewed_by_user:profiles!verification_reports_reviewed_by_fkey(full_name, role)
      `)
      .eq("id", report_id)
      .single();

    if (error || !report) throw new Error("Report not found");

    return new Response(
      JSON.stringify({
        success: true,
        report,
        disclaimer: "This document is a technical field verification record compiled under the AgriSurvey platform. It provides evidence-backed cross-referencing between farmer submissions and drone aerial imagery. It does not certify legal title or transfer ownership.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getClient();
    
    console.log("Starting abandonment detection process...");
    
    // Call the database function to detect abandonments
    const { data: abandonedCount, error: abandonError } = await supabase
      .rpc('detect_abandoned_valuations');
    
    if (abandonError) {
      console.error("Error detecting abandonments:", abandonError);
      return new Response(
        JSON.stringify({ error: "Failed to detect abandonments", details: abandonError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Detected ${abandonedCount} abandoned valuations`);
    
    // Call the database function to send recovery emails
    const { data: recoveryCount, error: recoveryError } = await supabase
      .rpc('send_recovery_emails');
    
    if (recoveryError) {
      console.error("Error sending recovery emails:", recoveryError);
      return new Response(
        JSON.stringify({ error: "Failed to send recovery emails", details: recoveryError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    console.log(`Sent ${recoveryCount} recovery emails`);
    
    const result = {
      success: true,
      abandonedDetected: abandonedCount || 0,
      recoveryEmailsSent: recoveryCount || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log("Abandonment detection completed:", result);
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("abandonment-detector fatal error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdatePayload {
  uniqueToken: string;
  data: Record<string, any>;
}

function getClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

// Only allow updating known columns in company_valuations
const ALLOWED_FIELDS = new Set([
  // Basic
  "contact_name",
  "company_name",
  "cif",
  "email",
  "phone",
  "industry",
  "years_of_operation",
  "employee_range",
  // Financial
  "revenue",
  "ebitda",
  "net_profit_margin",
  "growth_rate",
  // Characteristics
  "location",
  "ownership_participation",
  "competitive_advantage",
  // Results
  "final_valuation",
  "ebitda_multiple_used",
  "valuation_range_min",
  "valuation_range_max",
  // Engagement (optional future use)
  "v4_engagement_score",
  "v4_scenarios_viewed",
  "v4_time_spent",
  // New tracking fields
  "current_step",
  "completion_percentage",
  "time_spent_seconds",
  "last_modified_field",
]);

function toSnakeCase(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getClient();
    const body = (await req.json()) as UpdatePayload;

    if (!body || !body.uniqueToken || !body.data || typeof body.data !== "object") {
      return new Response(
        JSON.stringify({ error: "uniqueToken y data son obligatorios" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Map input keys to snake_case and whitelist
    const updateData: Record<string, any> = {};
    for (const [k, v] of Object.entries(body.data)) {
      const key = toSnakeCase(k);
      if (ALLOWED_FIELDS.has(key)) {
        updateData[key] = v;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: "No hay campos válidos para actualizar" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data, error } = await supabase
      .from("company_valuations")
      .update(updateData)
      .eq("unique_token", body.uniqueToken)
      .select("id, unique_token")
      .single();

    if (error) {
      console.error("Update error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data?.id, uniqueToken: data?.unique_token }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("update-valuation fatal error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

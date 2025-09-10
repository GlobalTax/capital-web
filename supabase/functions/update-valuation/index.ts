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
  "phone_e164",
  "whatsapp_opt_in",
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
  // Tracking fields
  "current_step",
  "completion_percentage",
  "time_spent_seconds",
  "last_modified_field",
  // UTM and referrer data for attribution
  "utm_source",
  "utm_medium",
  "utm_campaign", 
  "utm_term",
  "utm_content",
  "gclid",
  "referrer",
  "user_agent",
  // User association
  "user_id",
]);

function toSnakeCase(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

Deno.serve(async (req) => {
  // Set timeout for the entire request
  const timeout = setTimeout(() => {
    console.error('Request timeout after 25 seconds');
  }, 25000);

  if (req.method === "OPTIONS") {
    clearTimeout(timeout);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== UPDATE VALUATION START ===');
    console.log('Request method:', req.method);
    console.log('Timestamp:', new Date().toISOString());
    
    const supabase = getClient();
    
    // Parse body with timeout protection
    let body: UpdatePayload;
    try {
      body = (await req.json()) as UpdatePayload;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      clearTimeout(timeout);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!body || !body.uniqueToken || !body.data || typeof body.data !== "object") {
      return new Response(
        JSON.stringify({ error: "uniqueToken y data son obligatorios" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user ID from JWT if available
    const authHeader = req.headers.get('Authorization');
    let currentUserId: string | null = null;
    let isAuthenticated = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          currentUserId = user.id;
          isAuthenticated = true;
          console.log(`Authenticated request from user: ${currentUserId}`);
        }
      } catch (error) {
        console.log('JWT verification failed, continuing as anonymous:', error);
      }
    }

    // Map input keys to snake_case and whitelist
    const updateData: Record<string, any> = {};
    for (const [k, v] of Object.entries(body.data)) {
      const key = toSnakeCase(k);
      if (ALLOWED_FIELDS.has(key)) {
        updateData[key] = v;
      }
    }

    // Always update activity tracking fields
    updateData.last_activity_at = new Date().toISOString();
    
    // Set unique_token for upsert operation
    updateData.unique_token = body.uniqueToken;

    // If user is authenticated, check if we need to link this valuation to the user
    if (isAuthenticated && currentUserId) {
      // First check if this valuation already exists and has no user_id
      const { data: existingValuation } = await supabase
        .from("company_valuations")
        .select("user_id")
        .eq("unique_token", body.uniqueToken)
        .single();
      
      // If valuation exists and has no user_id, or it's a new valuation, set user_id
      if (!existingValuation || existingValuation.user_id === null) {
        updateData.user_id = currentUserId;
        console.log(`Linking valuation to user: ${currentUserId} (token: ${body.uniqueToken})`);
      }
    }

    // Accept partial data - no validation required
    const logMessage = isAuthenticated 
      ? `Processing authenticated update for user ${currentUserId}, token: ${body.uniqueToken}, fields: ${Object.keys(updateData).join(', ')}`
      : `Processing anonymous update for token: ${body.uniqueToken}, fields: ${Object.keys(updateData).join(', ')}`;
    console.log(logMessage);

    // Use upsert (insert with on_conflict update) to handle both new and existing records
    const { data, error } = await supabase
      .from("company_valuations")
      .upsert(updateData, { 
        onConflict: 'unique_token',
        ignoreDuplicates: false 
      })
      .select("id, unique_token, valuation_status, completion_percentage, user_id")
      .single();

    if (error) {
      console.error("Upsert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Successfully processed update for token: ${body.uniqueToken}, id: ${data?.id}`);
    console.log('=== UPDATE VALUATION SUCCESS ===');

    clearTimeout(timeout);
    return new Response(
      JSON.stringify({ 
        success: true, 
        id: data?.id, 
        uniqueToken: data?.unique_token,
        valuationStatus: data?.valuation_status,
        completionPercentage: data?.completion_percentage
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("=== UPDATE VALUATION ERROR ===");
    console.error("Fatal error:", err);
    console.error("Stack trace:", err?.stack);
    clearTimeout(timeout);
    return new Response(
      JSON.stringify({ 
        error: err?.message || "Unexpected error",
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

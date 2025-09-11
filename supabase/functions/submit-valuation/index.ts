import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InsertData {
  contact_name: string;
  company_name: string;
  cif: string | null;
  email: string;
  phone: string | null;
  phone_e164?: string | null;
  whatsapp_opt_in?: boolean | null;
  industry: string;
  activity_description?: string | null;
  years_of_operation: number | null;
  employee_range: string;
  revenue: number | null;
  ebitda: number | null;
  adjustment_amount?: number | null;
  has_adjustments?: boolean | null;
  net_profit_margin: number | null;
  growth_rate: number | null;
  location: string | null;
  ownership_participation: string | null;
  competitive_advantage: string | null;
  final_valuation: number | null;
  ebitda_multiple_used: number | null;
  valuation_range_min: number | null;
  valuation_range_max: number | null;
  referrer?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  // Status and activity fields
  valuation_status?: string | null;
  completion_percentage?: number | null;
  current_step?: number | null;
  last_activity_at?: string | null;
  form_submitted_at?: string | null;
  time_spent_seconds?: number | null;
  // Communication tracking fields
  email_sent?: boolean | null;
  whatsapp_sent?: boolean | null;
  hubspot_sent?: boolean | null;
  email_sent_at?: string | null;
  whatsapp_sent_at?: string | null;
  hubspot_sent_at?: string | null;
  email_opened?: boolean | null;
  email_opened_at?: string | null;
  email_message_id?: string | null;
  // User tracking
  user_id?: string | null;
  unique_token?: string | null;
  last_modified_field?: string | null;
}

function getClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

function getIp(req: Request): string | null {
  const hdr = req.headers.get("x-forwarded-for") || req.headers.get("X-Forwarded-For");
  if (!hdr) return null;
  return hdr.split(",")[0].trim();
}

Deno.serve(async (req) => {
  // Set timeout for the entire request
  const timeout = setTimeout(() => {
    console.error('Submit valuation timeout after 20 seconds');
  }, 20000);

  if (req.method === "OPTIONS") {
    clearTimeout(timeout);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SUBMIT VALUATION START ===');
    console.log('Request method:', req.method);
    console.log('Timestamp:', new Date().toISOString());
    console.log('RESEND_API_KEY exists:', !!Deno.env.get("RESEND_API_KEY"));
    console.log('SUPABASE_URL exists:', !!Deno.env.get("SUPABASE_URL"));
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    
    const supabase = getClient();

    let body: InsertData;
    try {
      body = (await req.json()) as InsertData;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      clearTimeout(timeout);
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Basic validation (required minimal fields)
    if (!body || !body.company_name || !body.email || !body.industry) {
      return new Response(
        JSON.stringify({ error: "Campos obligatorios: company_name, email, industry" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const ip = getIp(req);
    const ua = req.headers.get("user-agent") || null;

    // Generate a unique token
    const generateToken = () => Math.random().toString(36).substring(2, 15) + 
                                Math.random().toString(36).substring(2, 15);
    const token = generateToken();
    
    console.log("📝 Generated token for valuation:", token);
    console.log("📋 Processing data for:", body.company_name, body.email);

    const insertPayload = {
      ...body,
      unique_token: token,
      ip_address: body.ip_address ?? ip,
      user_agent: body.user_agent ?? ua,
    } as Record<string, any>;

    const { data, error } = await supabase
      .from("company_valuations")
      .insert(insertPayload)
      .select("id, unique_token")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('=== SUBMIT VALUATION SUCCESS ===');
    clearTimeout(timeout);
    return new Response(
      JSON.stringify({ success: true, insertedId: data?.id, uniqueToken: data?.unique_token }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("=== SUBMIT VALUATION ERROR ===");
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

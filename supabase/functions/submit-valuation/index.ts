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
  industry: string;
  years_of_operation: number | null;
  employee_range: string;
  revenue: number | null;
  ebitda: number | null;
  net_profit_margin: number | null;
  growth_rate: number | null;
  location: string | null;
  ownership_participation: string | null;
  competitive_advantage: string | null;
  final_valuation: number | null;
  ebitda_multiple_used: number | null;
  valuation_range_min: number | null;
  valuation_range_max: number | null;
  ip_address?: string | null;
  user_agent?: string | null;
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getClient();

    const body = (await req.json()) as InsertData;

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

    return new Response(
      JSON.stringify({ success: true, insertedId: data?.id, uniqueToken: data?.unique_token }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("submit-valuation fatal error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

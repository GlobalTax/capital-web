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

function isValidHexToken(token: string): boolean {
  return /^[a-f0-9]{32}$/i.test(token);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getClient();

    let token = "";
    const url = new URL(req.url);
    const qsToken = url.searchParams.get("token");

    if (req.headers.get("content-type")?.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      token = body?.token || qsToken || "";
    } else {
      token = qsToken || "";
    }

    if (!token || !isValidHexToken(token)) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data, error } = await supabase
      .from("company_valuations")
      .select(
        "id, contact_name, company_name, email, phone, industry, revenue, ebitda, final_valuation"
      )
      .eq("unique_token", token)
      .maybeSingle();

    if (error) {
      console.error("DB error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Valoración no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const companyData = {
      id: data.id,
      contactName: data.contact_name,
      companyName: data.company_name,
      email: data.email,
      phone: data.phone || "+34 000 000 000",
      industry: data.industry,
      revenue: data.revenue || 0,
      ebitda: data.ebitda || 0,
      baseValuation: data.final_valuation || 0,
    };

    return new Response(
      JSON.stringify({ success: true, companyData }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("get-valuation-v4 fatal error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

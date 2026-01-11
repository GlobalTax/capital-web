import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OutreachResult {
  subject_options: string[];
  email_body: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      fund_id, 
      operation_id,
      person_id,
      buyer_profile,
      teaser,
      sender 
    } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build buyer profile if not provided
    let buyerProfileData = buyer_profile;
    if (!buyerProfileData && fund_id) {
      const { data: fund } = await supabase
        .from("sf_funds")
        .select(`*, sf_people(*)`)
        .eq("id", fund_id)
        .single();

      if (fund) {
        buyerProfileData = {
          name: fund.name,
          entity_type: fund.entity_type,
          based_in: { country: fund.country_base, city: fund.city_base },
          geo_focus: fund.geo_focus || [],
          industry_focus: fund.sector_focus || [],
          size_criteria: fund.size_criteria || {},
          team: fund.sf_people?.map((p: any) => ({ name: p.name, role: p.role })) || [],
        };
      }
    }

    // Build teaser if not provided
    let teaserData = teaser;
    if (!teaserData && operation_id) {
      const { data: operation } = await supabase
        .from("company_operations")
        .select("*")
        .eq("id", operation_id)
        .single();

      if (operation) {
        teaserData = {
          headline: `Oportunidad confidencial - Sector ${operation.sector}`,
          overview: operation.description,
          key_metrics: {
            revenue: operation.revenue_range,
            ebitda: operation.ebitda_range,
            employees: operation.employees,
            location_region: operation.location,
          },
          reason_for_sale: "Sucesión empresarial",
        };
      }
    }

    // Sender defaults
    const senderData = sender || {
      my_name: "Equipo Capittal",
      my_firm: "Capittal",
      my_email: "info@capittal.es",
      my_phone: "+34 900 000 000",
    };

    if (!buyerProfileData || !teaserData) {
      return new Response(
        JSON.stringify({ error: "buyer_profile and teaser are required (or fund_id and operation_id)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get prompt from database
    const { data: promptData } = await supabase
      .from("sf_ai_prompts")
      .select("system_prompt, user_prompt_template, model, temperature, max_tokens")
      .eq("key", "generate-outreach")
      .single();

    const systemPrompt = promptData?.system_prompt || `Eres un banquero M&A sell-side. Redacta un email de primer contacto para un searcher/buyer, ofreciendo una oportunidad confidencial.

Reglas:
- 110-170 palabras.
- 2 asuntos alternativos (subject lines).
- NO revelar nombre de empresa ni detalles identificables.
- Propón: NDA + call de 15 minutos.
- Menciona por qué encaja con su criterio (geo/tamaño/tipo), si existe evidencia.
- Tono profesional europeo, directo, sin marketing.`;

    const userPrompt = `Tu identidad:
- Nombre: ${senderData.my_name}
- Firma: ${senderData.my_firm}
- Email: ${senderData.my_email}
- Teléfono: ${senderData.my_phone}

Buyer profile (JSON): ${JSON.stringify(buyerProfileData)}

Teaser anónimo (JSON): ${JSON.stringify(teaserData)}

Devuelve JSON:
{
  "subject_options": [string, string],
  "email_body": string
}`;

    const startTime = Date.now();

    // Call OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: promptData?.model || "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: promptData?.temperature || 0.5,
        max_tokens: promptData?.max_tokens || 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI error:", error);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const duration = Date.now() - startTime;
    const tokensUsed = openaiData.usage?.total_tokens || 0;

    let result: OutreachResult;
    try {
      result = JSON.parse(openaiData.choices[0].message.content);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Log the AI execution
    await supabase.from("sf_ai_logs").insert({
      prompt_key: "generate-outreach",
      input_data: { fund_id, operation_id, buyer_name: buyerProfileData.name },
      output_data: result,
      tokens_used: tokensUsed,
      duration_ms: duration,
      success: true,
    });

    // Create outreach draft in sf_outreach if fund_id provided
    let outreachId = null;
    if (fund_id) {
      const { data: outreach } = await supabase
        .from("sf_outreach")
        .insert({
          fund_id,
          person_id,
          crm_entity_type: operation_id ? "operation" : null,
          crm_entity_id: operation_id,
          channel: "email",
          direction: "outbound",
          status: "draft",
          subject: result.subject_options[0],
          content: result.email_body,
          metadata: {
            subject_options: result.subject_options,
            teaser_used: teaserData,
            generated_at: new Date().toISOString(),
          },
        })
        .select("id")
        .single();

      outreachId = outreach?.id;
    }

    return new Response(
      JSON.stringify({
        success: true,
        outreach: result,
        outreach_id: outreachId,
        tokens_used: tokensUsed,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in sf-generate-outreach:", error);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("sf_ai_logs").insert({
      prompt_key: "generate-outreach",
      success: false,
      error_message: error.message,
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
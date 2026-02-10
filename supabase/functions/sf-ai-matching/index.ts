import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchResult {
  fit_score: number;
  fit_tier: "A" | "B" | "C" | "D";
  reasons: string[];
  risks_or_unknowns: string[];
  recommended_angle: string[];
  qualifying_questions: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation_id, fund_id, deal_profile, buyer_profile } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build deal profile from operation_id if not provided
    let dealProfile = deal_profile;
    if (!dealProfile && operation_id) {
      const { data: operation } = await supabase
        .from("company_operations")
        .select("*")
        .eq("id", operation_id)
        .single();

      if (operation) {
        dealProfile = {
          id: operation.id,
          sector: operation.sector,
          subsector: operation.subsector,
          location: operation.location,
          country: operation.country || "España",
          revenue: operation.revenue_range,
          ebitda: operation.ebitda_range,
          employees: operation.employees,
          deal_type: operation.deal_type,
          description: operation.description,
          highlights: operation.highlights,
        };
      }
    }

    // Build buyer profile from fund_id if not provided
    let buyerProfile = buyer_profile;
    if (!buyerProfile && fund_id) {
      const { data: fund } = await supabase
        .from("sf_funds")
        .select(`
          *,
          sf_people(*),
          sf_acquisitions(*)
        `)
        .eq("id", fund_id)
        .single();

      if (fund) {
        buyerProfile = {
          id: fund.id,
          name: fund.name,
          entity_type: fund.entity_type || "unknown",
          based_in: {
            country: fund.country_base,
            city: fund.city_base,
          },
          geo_focus: fund.geo_focus || [],
          industry_focus: fund.sector_focus || [],
          status: fund.status,
          size_criteria: fund.size_criteria || {},
          transaction_preferences: fund.transaction_preferences || {},
          team: fund.sf_people?.map((p: any) => ({
            name: p.name,
            role: p.role,
          })) || [],
          acquisitions_count: fund.sf_acquisitions?.length || 0,
        };
      }
    }

    if (!dealProfile || !buyerProfile) {
      return new Response(
        JSON.stringify({ error: "deal_profile and buyer_profile are required (or operation_id and fund_id)" }),
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
      .eq("key", "ai-matching")
      .single();

    const systemPrompt = promptData?.system_prompt || `Eres un motor de matching entre una empresa en venta y buyers tipo Search Fund/ETA.

Tarea:
1) Calcula un "fit_score" 0-100 basado en:
   - Geografía (40%)
   - Tamaño/criterios (30%)
   - Preferencias de transacción (20%)
   - Etapa/actividad (10%)
2) Devuelve razones concretas, riesgos, ángulo recomendado y preguntas de calificación.
3) No inventes: si falta criterio, penaliza ligeramente y marca "unknown".`;

    const userPrompt = `Deal (JSON): ${JSON.stringify(dealProfile)}

Buyer (JSON): ${JSON.stringify(buyerProfile)}

Devuelve JSON:
{
  "fit_score": number (0-100),
  "fit_tier": "A|B|C|D",
  "reasons": [string] (máx 6),
  "risks_or_unknowns": [string] (máx 4),
  "recommended_angle": [string],
  "qualifying_questions": [string] (máx 6)
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
        temperature: promptData?.temperature || 0.3,
        max_tokens: promptData?.max_tokens || 1500,
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

    let matchResult: MatchResult;
    try {
      matchResult = JSON.parse(openaiData.choices[0].message.content);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Log the AI execution
    await supabase.from("sf_ai_logs").insert({
      prompt_key: "ai-matching",
      input_data: { 
        operation_id, 
        fund_id,
        deal_summary: dealProfile.sector,
        buyer_summary: buyerProfile.name,
      },
      output_data: matchResult,
      tokens_used: tokensUsed,
      duration_ms: duration,
      success: true,
    });

    // If operation_id and fund_id provided, create/update the match
    if (operation_id && fund_id) {
      const matchReasons = {
        geo_match: matchResult.reasons.some(r => 
          r.toLowerCase().includes("geogr") || r.toLowerCase().includes("ubicación") || r.toLowerCase().includes("país")
        ),
        sector_match: matchResult.reasons.some(r => 
          r.toLowerCase().includes("sector") || r.toLowerCase().includes("industria")
        ),
        size_match: matchResult.reasons.some(r => 
          r.toLowerCase().includes("tamaño") || r.toLowerCase().includes("ebitda") || r.toLowerCase().includes("revenue")
        ),
        ai_reasons: matchResult.reasons,
        ai_risks: matchResult.risks_or_unknowns,
        ai_angle: matchResult.recommended_angle,
        ai_questions: matchResult.qualifying_questions,
      };

      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from("sf_matches")
        .select("id")
        .eq("fund_id", fund_id)
        .eq("crm_entity_type", "operation")
        .eq("crm_entity_id", operation_id)
        .maybeSingle();

      if (existingMatch) {
        await supabase
          .from("sf_matches")
          .update({
            match_score: matchResult.fit_score,
            match_reasons: matchReasons,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMatch.id);
      } else {
        await supabase
          .from("sf_matches")
          .insert({
            fund_id,
            crm_entity_type: "operation",
            crm_entity_id: operation_id,
            match_score: matchResult.fit_score,
            match_reasons: matchReasons,
            status: "new",
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        match: matchResult,
        tokens_used: tokensUsed,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in sf-ai-matching:", error);

    // Log error
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("sf_ai_logs").insert({
      prompt_key: "ai-matching",
      success: false,
      error_message: error.message,
    });

    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { operation_id, fund_id, deal_profile, buyer_profile } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let dealProfile = deal_profile;
    if (!dealProfile && operation_id) {
      const { data: op } = await supabase.from("company_operations").select("*").eq("id", operation_id).single();
      if (op) dealProfile = { id: op.id, sector: op.sector, subsector: op.subsector, location: op.location, country: op.country || "España", revenue: op.revenue_range, ebitda: op.ebitda_range, employees: op.employees, deal_type: op.deal_type, description: op.description };
    }

    let buyerProfile = buyer_profile;
    if (!buyerProfile && fund_id) {
      const { data: fund } = await supabase.from("sf_funds").select("*, sf_people(*), sf_acquisitions(*)").eq("id", fund_id).single();
      if (fund) buyerProfile = { id: fund.id, name: fund.name, entity_type: fund.entity_type, based_in: { country: fund.country_base, city: fund.city_base }, geo_focus: fund.geo_focus || [], industry_focus: fund.sector_focus || [], status: fund.status, size_criteria: fund.size_criteria || {}, transaction_preferences: fund.transaction_preferences || {}, team: fund.sf_people?.map((p: any) => ({ name: p.name, role: p.role })) || [], acquisitions_count: fund.sf_acquisitions?.length || 0 };
    }

    if (!dealProfile || !buyerProfile) {
      return new Response(JSON.stringify({ error: "deal_profile and buyer_profile required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: promptData } = await supabase.from("sf_ai_prompts").select("system_prompt, model, temperature, max_tokens").eq("key", "ai-matching").single();

    const systemPrompt = promptData?.system_prompt || `Motor de matching entre empresa en venta y buyers Search Fund/ETA. Calcula fit_score 0-100. Devuelve JSON: {"fit_score","fit_tier":"A|B|C|D","reasons":[],"risks_or_unknowns":[],"recommended_angle":[],"qualifying_questions":[]}`;

    const response = await callAI(
      [{ role: "system", content: systemPrompt }, { role: "user", content: `Deal: ${JSON.stringify(dealProfile)}\nBuyer: ${JSON.stringify(buyerProfile)}` }],
      { functionName: 'sf-ai-matching', preferOpenAI: true, temperature: promptData?.temperature || 0.3, maxTokens: promptData?.max_tokens || 1500, jsonMode: true }
    );

    const matchResult = parseAIJson<any>(response.content);

    await supabase.from("sf_ai_logs").insert({ prompt_key: "ai-matching", input_data: { operation_id, fund_id }, output_data: matchResult, tokens_used: response.tokensUsed, duration_ms: response.durationMs, success: true });

    if (operation_id && fund_id) {
      const matchReasons = { geo_match: matchResult.reasons.some((r: string) => /geogr|ubicación|país/i.test(r)), sector_match: matchResult.reasons.some((r: string) => /sector|industria/i.test(r)), size_match: matchResult.reasons.some((r: string) => /tamaño|ebitda|revenue/i.test(r)), ai_reasons: matchResult.reasons, ai_risks: matchResult.risks_or_unknowns, ai_angle: matchResult.recommended_angle, ai_questions: matchResult.qualifying_questions };
      const { data: existing } = await supabase.from("sf_matches").select("id").eq("fund_id", fund_id).eq("crm_entity_type", "operation").eq("crm_entity_id", operation_id).maybeSingle();
      if (existing) {
        await supabase.from("sf_matches").update({ match_score: matchResult.fit_score, match_reasons: matchReasons, updated_at: new Date().toISOString() }).eq("id", existing.id);
      } else {
        await supabase.from("sf_matches").insert({ fund_id, crm_entity_type: "operation", crm_entity_id: operation_id, match_score: matchResult.fit_score, match_reasons: matchReasons, status: "new" });
      }
    }

    return new Response(JSON.stringify({ success: true, match: matchResult, tokens_used: response.tokensUsed, duration_ms: response.durationMs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error in sf-ai-matching:", error);
    return aiErrorResponse(error, corsHeaders);
  }
});

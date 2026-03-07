import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";
import {
  sectorsMatch,
  geographyMatches,
  calculateSemanticScore,
  expandSectorsForQuery
} from "./sector-aliases.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CorporateBuyer {
  id: string; name: string; description: string | null; investment_thesis: string | null;
  sector_focus: string[] | null; sector_exclusions: string[] | null; geography_focus: string[] | null;
  revenue_min: number | null; revenue_max: number | null; ebitda_min: number | null; ebitda_max: number | null;
  buyer_type: string | null; website: string | null; search_keywords: string[] | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { buyer_id, action } = await req.json();
    if (!buyer_id || !action) return new Response(JSON.stringify({ error: "buyer_id and action required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: buyer } = await supabase.from("corporate_buyers").select("*").eq("id", buyer_id).single();
    if (!buyer) return new Response(JSON.stringify({ error: "Buyer not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let result;
    switch (action) {
      case "suggest_targets": result = await suggestTargets(supabase, buyer as CorporateBuyer); break;
      case "improve_description": result = await improveDescription(buyer as CorporateBuyer); break;
      case "generate_thesis": result = await generateThesis(buyer as CorporateBuyer); break;
      case "match_operations": result = await matchOperations(supabase, buyer as CorporateBuyer); break;
      case "auto_configure": result = await autoConfigureCriteria(supabase, buyer as CorporateBuyer); break;
      default: return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return aiErrorResponse(error, corsHeaders);
  }
});

async function suggestTargets(supabase: ReturnType<typeof createClient>, buyer: CorporateBuyer) {
  const hasSectors = !!buyer.sector_focus?.length;
  const hasGeo = !!buyer.geography_focus?.length;
  const hasFinancials = !!(buyer.revenue_min || buyer.revenue_max);
  
  let query = supabase.from("empresas").select("id, nombre, sector, ubicacion, facturacion, revenue, ebitda, descripcion").not("nombre", "is", null);
  if (buyer.revenue_min) query = query.or(`facturacion.gte.${buyer.revenue_min},revenue.gte.${buyer.revenue_min}`);
  const { data: empresas, error } = await query.limit(500);

  if (error || !empresas?.length) return { matches: [], total_candidates_analyzed: 0, message: "No hay empresas" };

  const scoredEmpresas = empresas.map((empresa: any) => {
    let score = 0; const reasons: string[] = []; const risks: string[] = [];
    const rev = empresa.facturacion || empresa.revenue;

    if (hasSectors && empresa.sector) {
      if (sectorsMatch(buyer.sector_focus!, empresa.sector)) { score += 35; reasons.push(`Sector coincide`); }
    } else if (!hasSectors && empresa.sector) { score += 10; reasons.push(`Sector: ${empresa.sector}`); }

    if (hasGeo && empresa.ubicacion) {
      if (geographyMatches(buyer.geography_focus!, empresa.ubicacion)) { score += 25; reasons.push(`Ubicación coincide`); }
    } else if (!hasGeo && empresa.ubicacion) { score += 5; }

    if (rev) {
      const minOk = !buyer.revenue_min || rev >= buyer.revenue_min;
      const maxOk = !buyer.revenue_max || rev <= buyer.revenue_max;
      if (minOk && maxOk) { score += 25; reasons.push(`Facturación en rango`); }
      else risks.push("Facturación fuera de rango");
    } else risks.push("Sin datos de facturación");

    if (empresa.ebitda) {
      const minOk = !buyer.ebitda_min || empresa.ebitda >= buyer.ebitda_min;
      const maxOk = !buyer.ebitda_max || empresa.ebitda <= buyer.ebitda_max;
      if (minOk && maxOk) { score += 15; reasons.push(`EBITDA en rango`); }
    } else risks.push("Sin datos de EBITDA");

    const sem = calculateSemanticScore(buyer.search_keywords, buyer.investment_thesis, empresa.descripcion);
    if (sem.score > 0) { score += sem.score; reasons.push(`Keywords: ${sem.matchedTerms.join(', ')}`); }

    return { empresa_id: empresa.id, nombre: empresa.nombre, sector: empresa.sector, ubicacion: empresa.ubicacion, revenue: rev, ebitda: empresa.ebitda, descripcion: empresa.descripcion, fit_score: Math.min(score, 100), fit_reasons: reasons, risks };
  });

  const qualified = scoredEmpresas.filter(e => e.fit_score >= 20).sort((a, b) => b.fit_score - a.fit_score).slice(0, 20);

  if (qualified.length > 0) {
    try {
      const response = await callAI(
        [
          { role: "system", content: "Analista M&A. Responde JSON: [{empresa_id, ai_score, ai_reasoning, strategic_fit}]" },
          { role: "user", content: `COMPRADOR: ${buyer.name}\nSectores: ${buyer.sector_focus?.join(', ')}\nGeo: ${buyer.geography_focus?.join(', ')}\n\nEMPRESAS:\n${qualified.slice(0, 15).map((m, i) => `${i+1}. ${m.nombre} - ${m.descripcion?.substring(0, 100)}`).join('\n')}` }
        ],
        { functionName: 'corporate-buyer-ai-refine', jsonMode: true, temperature: 0.3 }
      );
      const aiScores = parseAIJson<any[]>(response.content);
      const refined = qualified.map(m => {
        const ai = aiScores.find(a => a.empresa_id === m.empresa_id);
        return { ...m, ai_score: ai?.ai_score || m.fit_score, ai_reasoning: ai?.ai_reasoning, strategic_fit: ai?.strategic_fit || "medio", combined_score: Math.round((m.fit_score * 0.4) + ((ai?.ai_score || m.fit_score) * 0.6)) };
      }).sort((a, b) => b.combined_score - a.combined_score);
      return { matches: refined, total_candidates_analyzed: empresas.length };
    } catch (e) { console.error("AI refine failed", e); }
  }

  return { matches: qualified, total_candidates_analyzed: empresas.length };
}

async function improveDescription(buyer: CorporateBuyer) {
  const response = await callAI(
    [
      { role: "system", content: "Consultor M&A. Responde JSON: {improved_description, key_highlights:[], suggested_keywords:[], suggested_sectors:[]}" },
      { role: "user", content: `Comprador: ${buyer.name}\nTIPO: ${buyer.buyer_type}\nDESC: ${buyer.description}\nTESIS: ${buyer.investment_thesis}` }
    ],
    { functionName: 'corporate-buyer-ai-improve', jsonMode: true, temperature: 0.7 }
  );
  return parseAIJson(response.content);
}

async function generateThesis(buyer: CorporateBuyer) {
  const response = await callAI(
    [
      { role: "system", content: "Estratega M&A. Responde JSON: {thesis:{strategic_objective, ideal_target_profile, exclusion_criteria:[], synergies_sought:[], evaluation_process}, summary, investment_thesis_text}" },
      { role: "user", content: `COMPRADOR: ${buyer.name}\nDESC: ${buyer.description}\nSectores: ${buyer.sector_focus?.join(', ')}` }
    ],
    { functionName: 'corporate-buyer-ai-thesis', jsonMode: true, temperature: 0.6 }
  );
  return parseAIJson(response.content);
}

function checkRangeOverlap(min1: number | null, max1: number | null, min2: number | null, max2: number | null) {
  if (!min1 && !max1) return true; if (!min2 && !max2) return true;
  return (min1 || 0) <= (max2 || Infinity) && (min2 || 0) <= (max1 || Infinity);
}

async function matchOperations(supabase: ReturnType<typeof createClient>, buyer: CorporateBuyer) {
  const { data: sellOps } = await supabase.from("company_operations").select("*").eq("is_active", true).eq("is_deleted", false);
  const { data: mandates } = await supabase.from("buy_side_mandates").select("*").eq("is_active", true);

  const hasSectors = !!buyer.sector_focus?.length;
  const hasGeo = !!buyer.geography_focus?.length;
  const allMatches: any[] = [];

  if (sellOps?.length) {
    allMatches.push(...sellOps.map((op: any) => {
      let score = 0; const reasons = [];
      if (hasSectors && op.sector) { if (sectorsMatch(buyer.sector_focus!, op.sector)) { score += 35; reasons.push("Sector coincide"); } }
      const locs = [...(op.display_locations || []), op.geographic_location].filter(Boolean);
      if (hasGeo && locs.length) { if (locs.some((l: string) => geographyMatches(buyer.geography_focus!, l))) { score += 25; reasons.push("Geo compatible"); } }
      return { operation_id: op.id, title: op.company_name, type: "sell", fit_score: Math.min(score, 100), fit_reasons: reasons };
    }));
  }

  if (mandates?.length) {
    allMatches.push(...mandates.map((m: any) => {
      let score = 0; const reasons = [];
      if (hasSectors && m.sector && sectorsMatch(buyer.sector_focus!, m.sector)) { score += 40; reasons.push("Sector coincide"); }
      if (hasGeo && m.geographic_scope && geographyMatches(buyer.geography_focus!, m.geographic_scope)) { score += 30; reasons.push("Geo coincide"); }
      if (checkRangeOverlap(buyer.revenue_min, buyer.revenue_max, m.revenue_min, m.revenue_max)) { score += 20; reasons.push("Rev OK"); }
      return { operation_id: m.id, mandate_id: m.id, title: m.title, type: "mandate", fit_score: Math.min(score, 100), fit_reasons: reasons };
    }));
  }

  return { matches: allMatches.filter(m => m.fit_score >= 20).sort((a, b) => b.fit_score - a.fit_score) };
}

async function autoConfigureCriteria(supabase: ReturnType<typeof createClient>, buyer: CorporateBuyer) {
  const response = await callAI(
    [
      { role: "system", content: "Analista M&A. Responde JSON: {sector_focus:[], geography_focus:[], search_keywords:[], buyer_type_suggestion:''}" },
      { role: "user", content: `Comprador: ${buyer.name}\nDesc: ${buyer.description}` }
    ],
    { functionName: 'corporate-buyer-ai-autoconfig', jsonMode: true, temperature: 0.3 }
  );
  const gen = parseAIJson<any>(response.content);
  
  const updateData: any = {};
  if (!buyer.sector_focus?.length && gen.sector_focus?.length) updateData.sector_focus = gen.sector_focus;
  if (!buyer.geography_focus?.length && gen.geography_focus?.length) updateData.geography_focus = gen.geography_focus;
  if (!buyer.search_keywords?.length && gen.search_keywords?.length) updateData.search_keywords = gen.search_keywords;
  if (!buyer.buyer_type && gen.buyer_type_suggestion) updateData.buyer_type = gen.buyer_type_suggestion;

  if (Object.keys(updateData).length > 0) {
    await supabase.from("corporate_buyers").update(updateData).eq("id", buyer.id);
  }

  return { success: true, generated: gen, fields_updated: Object.keys(updateData) };
}

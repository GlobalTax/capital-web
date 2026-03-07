import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { callAI, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CACHE_DURATION_DAYS = 7;

async function fetchSectorIntelligence(sector: string, subsector: string | undefined, supabase: any) {
  if (subsector) {
    const { data, error } = await supabase.from('pe_sector_intelligence').select('*').eq('is_active', true).ilike('sector', `%${sector}%`).ilike('subsector', `%${subsector}%`);
    if (!error && data?.length > 0) return data;
  }
  const { data, error } = await supabase.from('pe_sector_intelligence').select('*').eq('is_active', true).ilike('sector', `%${sector}%`);
  return (!error && data?.length > 0) ? data : [];
}

function buildIntelligenceContext(intelData: any[]): string {
  if (!intelData.length) return '';
  const sections = intelData.map(row => {
    const parts = [`### Subsector: ${row.subsector}`];
    if (row.pe_thesis) parts.push(`  - **Tesis PE**: ${row.pe_thesis}`);
    if (row.multiples_valuations) parts.push(`  - **Múltiplos**: ${row.multiples_valuations}`);
    if (row.active_pe_firms) parts.push(`  - **Firmas PE activas**: ${row.active_pe_firms}`);
    if (row.consolidation_phase) parts.push(`  - **Fase consolidación**: ${row.consolidation_phase}`);
    if (row.quantitative_data) parts.push(`  - **Datos cuantitativos**: ${row.quantitative_data}`);
    if (row.platforms_operations) parts.push(`  - **Operaciones plataforma**: ${row.platforms_operations}`);
    if (row.geography) parts.push(`  - **Geografía**: ${row.geography}`);
    return parts.join('\n');
  });
  return `\n🏦 INTELIGENCIA PE SECTORIAL (Datos internos Capittal)\n${sections.join('\n\n')}\n\nUSA estos datos como FUENTE PRIMARIA.\n`;
}

async function fetchSectorData(sector: string, supabase: any) {
  const [{ data: competitors }, { data: multiples }, { data: caseStudies }] = await Promise.all([
    supabase.from('company_operations').select('*').ilike('sector', `%${sector}%`).eq('is_active', true).order('valuation_amount', { ascending: false }).limit(10),
    supabase.from('advisor_valuation_multiples').select('*').ilike('sector_name', `%${sector}%`).eq('is_active', true),
    supabase.from('case_studies').select('*').ilike('sector', `%${sector}%`).eq('is_active', true).order('year', { ascending: false }).limit(5),
  ]);

  const totalDeals = competitors?.length || 0;
  const totalValue = competitors?.reduce((sum: number, c: any) => sum + (c.valuation_amount || 0), 0) || 0;
  return { competitors: competitors || [], multiples: multiples || [], caseStudies: caseStudies || [], stats: { totalDeals, totalValue, averageValuation: totalDeals > 0 ? totalValue / totalDeals : 0, yearRange: '2020-2025' } };
}

function buildSectorDossierPrompt(sector: string, sectorData: any, intelligenceContext: string): string {
  const { competitors, multiples, stats } = sectorData;
  const competitorsText = competitors.length > 0 ? competitors.map((c: any) => `- ${c.company_name}: ${(c.valuation_amount / 1000000).toFixed(1)}M€ (${c.year})`).join('\n') : 'No hay datos';
  const multiplesText = multiples.length > 0 ? multiples.map((m: any) => `- EV/EBITDA: ${m.ebitda_multiple_min}x - ${m.ebitda_multiple_max}x (median: ${m.ebitda_multiple_median}x)`).join('\n') : 'No hay datos';

  return `SECTOR: ${sector}\n
📊 TRANSACCIONES:\n${competitorsText}\nTotal: ${stats.totalDeals}, Media: ${(stats.averageValuation / 1000000).toFixed(1)}M€\n
📈 MÚLTIPLOS:\n${multiplesText}\n
${intelligenceContext}\n
Genera un SECTOR DOSSIER profesional y exhaustivo en 10 secciones:\n1. Panorama del Sector\n2. Subsectores y Nichos\n3. Top Competidores\n4. Múltiplos de Valoración\n5. Análisis de Transacciones\n6. Compradores Estratégicos\n7. Tendencias M&A\n8. Drivers de Valor\n9. Riesgos y Desafíos\n10. Oportunidades de Posicionamiento\n
Formato: Markdown estructurado, datos concretos, tono profesional, enfoque accionable.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let reportId: string | null = null;

  try {
    const { sector, subsector, lead_id, force_regenerate = false } = await req.json();

    if (!sector) throw new Error('Sector is required');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { autoRefreshToken: false, persistSession: false } });

    const syntheticLeadId = lead_id || `sector:${sector}${subsector ? `:${subsector}` : ''}`;

    // Cache check
    if (!force_regenerate) {
      const { data: existingReport } = await supabase.from('lead_ai_reports').select('*').eq('lead_id', syntheticLeadId).eq('generation_status', 'completed').not('report_sector_dossier', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle();

      if (existingReport) {
        const reportAge = Date.now() - new Date(existingReport.created_at).getTime();
        if (reportAge < CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000) {
          return new Response(JSON.stringify({ ...existingReport, cached: true, cache_age_days: (reportAge / (24 * 60 * 60 * 1000)).toFixed(1) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    const [sectorData, intelData] = await Promise.all([fetchSectorData(sector, supabase), fetchSectorIntelligence(sector, subsector, supabase)]);
    const intelligenceContext = buildIntelligenceContext(intelData);

    const { data: report, error: reportError } = await supabase.from('lead_ai_reports').insert({ lead_id: syntheticLeadId, lead_type: `sector_dossier:${sector}`, generation_status: 'processing' }).select().single();
    if (reportError) throw new Error(`Error creating report: ${reportError.message}`);
    reportId = report.id;

    const systemPrompt = `Eres un analista senior de M&A especializado en mercado español de PYMES para Capittal.\nResponde en español, de forma estructurada, concreta y ACCIONABLE.`;

    const userPrompt = buildSectorDossierPrompt(sector, sectorData, intelligenceContext);

    // Use centralized AI helper with preferOpenAI for long-form precision
    const aiResponse = await callAI(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      { functionName: 'generate-sector-dossier', preferOpenAI: true, maxTokens: 6000 }
    );

    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    await supabase.from('lead_ai_reports').update({
      report_sector_dossier: aiResponse.content,
      generation_status: 'completed',
      tokens_used: aiResponse.tokensUsed,
      cost_usd: aiResponse.provider === 'openai' ? (aiResponse.tokensUsed / 1000000) * 0.0002 : (aiResponse.tokensUsed / 1000000) * 0.0001,
      processing_time_seconds: processingTime,
      completed_at: new Date().toISOString()
    }).eq('id', reportId);

    return new Response(JSON.stringify({
      success: true, report_id: reportId, sector, subsector, tokens_used: aiResponse.tokensUsed,
      processing_time_seconds: processingTime, cached: false, intel_count: intelData.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('❌ Error generating sector dossier:', error);
    if (reportId) {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      await supabase.from('lead_ai_reports').update({ generation_status: 'failed', error_message: error instanceof Error ? error.message : 'Unknown error' }).eq('id', reportId);
    }
    return aiErrorResponse(error, corsHeaders);
  }
});

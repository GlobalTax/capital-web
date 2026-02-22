import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const CACHE_DURATION_DAYS = 7;

interface SectorDossierRequest {
  sector: string;
  subsector?: string;
  lead_id?: string;
  lead_type?: string;
  force_regenerate?: boolean;
}

interface CompetitorData {
  company_name: string;
  sector: string;
  subsector?: string;
  valuation_amount: number;
  valuation_currency: string;
  ebitda_multiple?: number;
  revenue_amount?: number;
  year: number;
  deal_type?: string;
  highlights?: string[];
}

interface MultiplesData {
  sector_name: string;
  revenue_multiple_min: number;
  revenue_multiple_median: number;
  revenue_multiple_max: number;
  ebitda_multiple_min: number;
  ebitda_multiple_median: number;
  ebitda_multiple_max: number;
  net_profit_multiple_min: number;
  net_profit_multiple_median: number;
  net_profit_multiple_max: number;
}

// Fetch PE sector intelligence data
async function fetchSectorIntelligence(sector: string, subsector: string | undefined, supabase: any) {
  console.log('🔍 Fetching PE sector intelligence for:', sector, subsector || '(no subsector)');

  // Try exact sector+subsector match first
  if (subsector) {
    const { data: exactMatch, error: exactError } = await supabase
      .from('pe_sector_intelligence')
      .select('*')
      .eq('is_active', true)
      .ilike('sector', `%${sector}%`)
      .ilike('subsector', `%${subsector}%`);

    if (!exactError && exactMatch?.length > 0) {
      console.log(`✅ Exact intel match: ${exactMatch.length} rows`);
      return exactMatch;
    }
  }

  // Fallback: all subsectors for the sector
  const { data: sectorMatch, error: sectorError } = await supabase
    .from('pe_sector_intelligence')
    .select('*')
    .eq('is_active', true)
    .ilike('sector', `%${sector}%`);

  if (!sectorError && sectorMatch?.length > 0) {
    console.log(`✅ Sector intel match: ${sectorMatch.length} rows`);
    return sectorMatch;
  }

  console.log('⚠️ No PE sector intelligence found');
  return [];
}

// Build intelligence context string for prompt injection
function buildIntelligenceContext(intelData: any[]): string {
  if (!intelData.length) return '';

  const sections = intelData.map(row => {
    const parts = [`### Subsector: ${row.subsector}`];
    if (row.pe_thesis) parts.push(`  - **Tesis PE**: ${row.pe_thesis}`);
    if (row.multiples_valuations) parts.push(`  - **Múltiplos y valoraciones**: ${row.multiples_valuations}`);
    if (row.active_pe_firms) parts.push(`  - **Firmas PE activas**: ${row.active_pe_firms}`);
    if (row.consolidation_phase) parts.push(`  - **Fase consolidación**: ${row.consolidation_phase}`);
    if (row.quantitative_data) parts.push(`  - **Datos cuantitativos**: ${row.quantitative_data}`);
    if (row.platforms_operations) parts.push(`  - **Operaciones plataforma**: ${row.platforms_operations}`);
    if (row.geography) parts.push(`  - **Geografía**: ${row.geography}`);
    return parts.join('\n');
  });

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 INTELIGENCIA PE SECTORIAL (Datos internos Capittal - USAR COMO FUENTE PRIMARIA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${sections.join('\n\n')}

INSTRUCCIONES SOBRE ESTA INTELIGENCIA:
- Usa estos datos como FUENTE PRIMARIA para el dossier
- Integra las tesis PE, firmas activas y múltiplos en las secciones relevantes
- Menciona explícitamente las firmas PE activas en la sección de compradores
- Usa los datos cuantitativos para enriquecer el panorama del sector
- Refleja la fase de consolidación en el análisis de tendencias M&A
`;
}

// Fetch sector data from database
async function fetchSectorData(sector: string, supabase: any) {
  console.log('📊 Fetching sector data for:', sector);

  // 1. Fetch top competitors (company_operations)
  const { data: competitors, error: compError } = await supabase
    .from('company_operations')
    .select('*')
    .ilike('sector', `%${sector}%`)
    .eq('is_active', true)
    .order('valuation_amount', { ascending: false })
    .limit(10);

  if (compError) {
    console.warn('⚠️ Error fetching competitors:', compError.message);
  }

  // 2. Fetch valuation multiples (advisor_valuation_multiples)
  const { data: multiples, error: multError } = await supabase
    .from('advisor_valuation_multiples')
    .select('*')
    .ilike('sector_name', `%${sector}%`)
    .eq('is_active', true);

  if (multError) {
    console.warn('⚠️ Error fetching multiples:', multError.message);
  }

  // 3. Fetch case studies
  const { data: caseStudies, error: caseError } = await supabase
    .from('case_studies')
    .select('*')
    .ilike('sector', `%${sector}%`)
    .eq('is_active', true)
    .order('year', { ascending: false })
    .limit(5);

  if (caseError) {
    console.warn('⚠️ Error fetching case studies:', caseError.message);
  }

  // Calculate transaction stats
  const totalDeals = competitors?.length || 0;
  const totalValue = competitors?.reduce((sum: number, c: any) => sum + (c.valuation_amount || 0), 0) || 0;
  const averageValuation = totalDeals > 0 ? totalValue / totalDeals : 0;

  return {
    competitors: competitors || [],
    multiples: multiples || [],
    caseStudies: caseStudies || [],
    stats: {
      totalDeals,
      totalValue,
      averageValuation,
      yearRange: '2020-2025'
    }
  };
}

// Build specialized prompt for sector dossier
function buildSectorDossierPrompt(sector: string, sectorData: any, intelligenceContext: string): string {
  const { competitors, multiples, caseStudies, stats } = sectorData;

  const competitorsText = competitors.length > 0
    ? competitors.map((c: CompetitorData) => 
        `- ${c.company_name}: ${(c.valuation_amount / 1000000).toFixed(1)}M€ (${c.year})`
      ).join('\n')
    : 'No hay datos de competidores disponibles';

  const multiplesText = multiples.length > 0
    ? multiples.map((m: MultiplesData) => 
        `- EV/EBITDA: ${m.ebitda_multiple_min}x - ${m.ebitda_multiple_max}x (median: ${m.ebitda_multiple_median}x)`
      ).join('\n')
    : 'No hay datos de múltiplos disponibles';

  return `
SECTOR: ${sector}

DATOS DISPONIBLES:
━━━━━━━━━━━━━━━━

📊 TRANSACCIONES RECIENTES:
${competitorsText}
Total operaciones: ${stats.totalDeals}
Valoración media: ${(stats.averageValuation / 1000000).toFixed(1)}M€

📈 MÚLTIPLOS DE VALORACIÓN:
${multiplesText}

🎯 CASOS DE ÉXITO:
${caseStudies.length > 0 ? caseStudies.map((c: any) => `- ${c.title} (${c.year})`).join('\n') : 'No disponibles'}

${intelligenceContext}

━━━━━━━━━━━━━━━━

Genera un SECTOR DOSSIER profesional y exhaustivo en 10 secciones:

## 1. 🌐 PANORAMA DEL SECTOR
   - Overview del sector en España
   - Tamaño de mercado estimado
   - Tendencias macroeconómicas clave (2024-2025)
   - Factores de crecimiento o contracción

## 2. 🎯 SUBSECTORES Y NICHOS
   - Desglose de subsectores principales
   - Nichos de alto valor
   - Áreas de especialización con demanda

## 3. 🏢 TOP COMPETIDORES (Basado en nuestros datos)
   - Análisis de los players principales que conocemos
   - Modelos de negocio típicos
   - Rangos de facturación y EBITDA
   - Posicionamiento estratégico

## 4. 💰 MÚLTIPLOS DE VALORACIÓN
   - EV/EBITDA típicos del sector
   - EV/Revenue cuando aplique
   - P/E ratio para empresas rentables
   - Comparativa con sectores adyacentes

## 5. 📊 ANÁLISIS DE TRANSACCIONES
   - Tendencias de valoración (últimos 3 años)
   - Tamaño típico de deals
   - Tipos de operaciones (venta total, parcial, fusión)

## 6. 🎯 COMPRADORES ESTRATÉGICOS
   - Tipos de compradores activos en el sector
   - Fondos de inversión especializados
   - Corporativos que adquieren en este sector
   - Compradores internacionales interesados

## 7. 🔄 TENDENCIAS M&A
   - Consolidación del sector
   - Verticales o segmentos más atractivos
   - Roll-ups sectoriales
   - Movimientos transfronterizos

## 8. 💎 DRIVERS DE VALOR
   - Qué buscan los compradores en este sector
   - Factores clave de valoración (IP, clientes, equipo, etc.)
   - Red flags que reducen valor
   - Elementos diferenciadores premium

## 9. ⚠️ RIESGOS Y DESAFÍOS
   - Barreras regulatorias
   - Riesgos de mercado específicos
   - Challenges de integración post-adquisición
   - Factores de descuento en valoración

## 10. 🚀 OPORTUNIDADES DE POSICIONAMIENTO
   - Cómo preparar una empresa para maximizar valor
   - Timing óptimo de venta
   - Narrativas que funcionan con compradores
   - Quick wins pre-venta

---

**FORMATO**:
- Responde en Markdown estructurado
- Usa viñetas y listas para facilitar lectura
- Incluye datos concretos cuando los tengas
- Si falta info, infiere con criterio de experto M&A
- Mantén un tono profesional pero accesible
- Enfócate en ACCIONABLE: qué hacer con esta info
`.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let reportId: string | null = null;

  try {
    const { sector, subsector, lead_id, force_regenerate = false } = await req.json() as SectorDossierRequest;
    console.log('📊 Generating Sector Dossier:', sector, subsector || '(no subsector)', 'force:', force_regenerate);

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    if (!sector) {
      throw new Error('Sector is required');
    }

    // Create Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create synthetic lead_id for sector dossiers: "sector:{sector_name}"
    const syntheticLeadId = lead_id || `sector:${sector}${subsector ? `:${subsector}` : ''}`;

    // 🔥 CACHE: Check for existing report (7 days)
    if (!force_regenerate) {
      const { data: existingReport, error: existingError } = await supabase
        .from('lead_ai_reports')
        .select('*')
        .eq('lead_id', syntheticLeadId)
        .eq('generation_status', 'completed')
        .not('report_sector_dossier', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingReport && !existingError) {
        const reportAge = Date.now() - new Date(existingReport.created_at).getTime();
        const sevenDays = CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000;

        if (reportAge < sevenDays) {
          const ageDays = (reportAge / (24 * 60 * 60 * 1000)).toFixed(1);
          console.log(`🔥 Using cached dossier (${ageDays} days old)`);
          return new Response(
            JSON.stringify({
              ...existingReport,
              cached: true,
              cache_age_days: ageDays
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    console.log('🚀 Generating new sector dossier...');

    // 1. Fetch sector data + PE intelligence in parallel
    const [sectorData, intelData] = await Promise.all([
      fetchSectorData(sector, supabase),
      fetchSectorIntelligence(sector, subsector, supabase),
    ]);
    console.log('✅ Sector data fetched, intel rows:', intelData.length);

    // 2. Build intelligence context
    const intelligenceContext = buildIntelligenceContext(intelData);

    // 3. Create initial report record
    const { data: report, error: reportError } = await supabase
      .from('lead_ai_reports')
      .insert({
        lead_id: syntheticLeadId,
        lead_type: `sector_dossier:${sector}`,
        generation_status: 'processing'
      })
      .select()
      .single();

    if (reportError) {
      throw new Error(`Error creating report: ${reportError.message}`);
    }

    reportId = report.id;
    console.log('✅ Report record created:', reportId);

    // 4. Build specialized prompt
    const systemPrompt = `Eres un analista senior de M&A especializado en mercado español de PYMES.
Trabajas para Capittal, una boutique de M&A que asesora en compraventa de empresas.

Tu objetivo es crear dossiers sectoriales profesionales que ayuden al equipo comercial a:
1. Entender rápidamente un sector antes de una llamada
2. Identificar oportunidades y riesgos
3. Hablar con autoridad sobre tendencias del sector
4. Preparar argumentos de valor específicos

Responde en español (España), de forma estructurada, concreta y ACCIONABLE.
Usa datos concretos cuando los tengas, pero infiere con criterio de experto cuando sea necesario.`;

    const userPrompt = buildSectorDossierPrompt(sector, sectorData, intelligenceContext);

    console.log('🤖 Calling OpenAI for sector dossier...');

    // 5. Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 6000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const dossierContent = openaiData.choices[0].message.content;
    const tokensUsed = openaiData.usage.total_tokens;
    const costUsd = (tokensUsed / 1000000) * 0.0002;

    console.log('✅ Dossier generated:', tokensUsed, 'tokens, $', costUsd.toFixed(4));

    // 6. Save dossier to database
    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    const { error: updateError } = await supabase
      .from('lead_ai_reports')
      .update({
        report_sector_dossier: dossierContent,
        generation_status: 'completed',
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        processing_time_seconds: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (updateError) {
      throw new Error(`Error updating report: ${updateError.message}`);
    }

    console.log('✅ Sector dossier saved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        report_id: reportId,
        sector: sector,
        subsector: subsector,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        processing_time_seconds: processingTime,
        cached: false,
        intel_count: intelData.length,
        intel_sectors: intelData.map((r: any) => r.subsector),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error generating sector dossier:', error);

    // Mark report as failed if we have a reportId
    if (reportId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from('lead_ai_reports')
        .update({
          generation_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', reportId);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CompanyRecord {
  company_name: string;
  status: 'current' | 'exited' | 'unknown';
  fund: string | null;
  investment_year: number | null;
  sector: string | null;
  short_description: string | null;
  location_countries: string[];
  company_detail_url: string | null;
  evidence: Array<{ field: string; quote: string }>;
  notes: string | null;
}

interface ExtractionResult {
  firm_name: string | null;
  extracted_at: string;
  current: CompanyRecord[];
  exited: CompanyRecord[];
  warnings: string[];
  coverage: {
    detected_sections: string[];
    current_count: number;
    exited_count: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  let requestBody;
  try {
    requestBody = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { fund_id, raw_text, fund_name } = requestBody;

  try {
    if (!fund_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'fund_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!raw_text || raw_text.trim().length < 50) {
      return new Response(
        JSON.stringify({ success: false, error: 'raw_text must have at least 50 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error('[cr-extract-portfolio-from-text] OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify fund exists
    const { data: fund, error: fundError } = await supabase
      .from('cr_funds')
      .select('id, name')
      .eq('id', fund_id)
      .single();

    if (fundError || !fund) {
      console.error('[cr-extract-portfolio-from-text] Fund not found:', fundError);
      return new Response(
        JSON.stringify({ success: false, error: 'Fund not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const effectiveFundName = fund_name || fund.name;
    console.log(`[cr-extract-portfolio-from-text] Processing text for fund: ${effectiveFundName} (${fund_id})`);
    console.log(`[cr-extract-portfolio-from-text] Text length: ${raw_text.length} characters`);

    // Extract with OpenAI using same professional prompt
    const systemPrompt = `Eres un analista de M&A y Data Extractor especializado en private equity portfolios.

Tu objetivo es transformar texto sobre "Portfolio" en datos estructurados y verificables.

Reglas: precisión > completitud. No inventes nada. Si algo no aparece en el texto, devuelve null.

TASK
1) Identifica si el texto lista inversiones/participadas. Detecta secciones: "Current", "Exited", "Actuales", "Históricas", "Realised", "Past", etc.

2) Extrae TODAS las empresas "CURRENT/ACTIVE/ACTUALES" y "EXITED/HISTÓRICAS" en bloques separados.

3) Para cada empresa:
   - company_name (string) - OBLIGATORIO, nombre exacto
   - status ("current" | "exited" | "unknown")
   - fund (string|null) - ej: "Fund I", "Fund II", "Growth Fund"
   - investment_year (number|null) - 4 dígitos, si aparece "since 2018" → 2018
   - sector (string|null) - SOLO si el texto lo menciona explícitamente
   - short_description (string|null) - descripción detallada de la empresa: qué hace, sector, productos/servicios, mercados, posicionamiento. SIN LÍMITE de extensión. Incluye toda la información relevante disponible. SIEMPRE EN CASTELLANO.
   - location_countries (array<string>) - países mencionados, [] si no hay
   - company_detail_url (string|null) - URL si aparece
   - evidence (array) - 1-3 evidencias con quotes literales (máx 25 palabras cada una)
     Formato: {"field": "status|fund|investment_year|sector", "quote": "texto literal"}
   - notes (string|null) - aliases o aclaraciones si aplica

4) Normaliza:
   - Sin duplicados (mismo nombre)
   - Años: "since 2018" o "2018" → 2018
   - Captura badges de fondos si aparecen

IMPORTANTE:
- Si el texto dice "Participadas Actuales" o similar → status = "current"
- Si el texto dice "Participadas Históricas", "Desinvertidas", "Exits" → status = "exited"
- Si no está claro → status = "unknown"

SCHEMA OBLIGATORIO:
{
  "firm_name": string|null,
  "extracted_at": string (ISO-8601),
  "current": [CompanyRecord],
  "exited": [CompanyRecord],
  "warnings": [string],
  "coverage": {
    "detected_sections": [string],
    "current_count": number,
    "exited_count": number
  }
}

QUALITY CHECKS antes de responder:
- ¿Hay al menos 1 evidencia para status de cada company?
- ¿El JSON es válido y parseable?
- Si el texto no distingue current/exited claramente, status="unknown" y añade warning.

Responde SOLO con JSON válido, sin texto adicional.`;

    const userPrompt = `Extrae las participadas de ${effectiveFundName}.

Texto a analizar:
${raw_text.substring(0, 25000)}`;

    console.log('[cr-extract-portfolio-from-text] Calling OpenAI...');
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('[cr-extract-portfolio-from-text] OpenAI error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI extraction failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiData = await openaiResponse.json();
    const extractedContent = openaiData.choices[0]?.message?.content;
    
    let extractionResult: ExtractionResult;
    try {
      extractionResult = JSON.parse(extractedContent);
    } catch (parseError) {
      console.error('[cr-extract-portfolio-from-text] JSON parse error:', parseError, extractedContent);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI response', raw: extractedContent?.substring(0, 500) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[cr-extract-portfolio-from-text] Firm detected: ${extractionResult.firm_name}`);
    console.log(`[cr-extract-portfolio-from-text] Coverage:`, extractionResult.coverage);
    if (extractionResult.warnings?.length) {
      console.log(`[cr-extract-portfolio-from-text] Warnings:`, extractionResult.warnings);
    }

    // Combine current + exited with proper status mapping
    const allCompanies = [
      ...(extractionResult.current || []).map(c => ({ ...c, mappedStatus: 'active' as const })),
      ...(extractionResult.exited || []).map(c => ({ ...c, mappedStatus: 'exited' as const }))
    ];

    console.log(`[cr-extract-portfolio-from-text] Extracted ${allCompanies.length} companies (${extractionResult.coverage?.current_count || 0} current, ${extractionResult.coverage?.exited_count || 0} exited)`);

    if (allCompanies.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No portfolio companies found in text',
          extracted: 0,
          inserted: 0,
          updated: 0,
          fund_name: effectiveFundName,
          warnings: extractionResult.warnings 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert companies into cr_portfolio
    console.log('[cr-extract-portfolio-from-text] Upserting companies into database...');
    
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const company of allCompanies) {
      if (!company.company_name) {
        skippedCount++;
        continue;
      }

      // Prepare evidence as JSON string for notes
      const evidenceJson = company.evidence?.length ? JSON.stringify(company.evidence) : null;
      const notesWithEvidence = evidenceJson 
        ? `${company.notes || ''}\n\n[Evidence]: ${evidenceJson}`.trim()
        : company.notes;

      // Check if company already exists for this fund
      const { data: existing } = await supabase
        .from('cr_portfolio')
        .select('id')
        .eq('fund_id', fund_id)
        .ilike('company_name', company.company_name)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('cr_portfolio')
          .update({
            website: company.company_detail_url || null,
            sector: company.sector || null,
            country: company.location_countries?.[0] || null,
            status: company.mappedStatus,
            investment_year: company.investment_year || null,
            description: company.short_description || null,
            fund_name: company.fund || null,
            source_url: 'manual_text_import',
            notes: notesWithEvidence,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`[cr-extract-portfolio-from-text] Update error for ${company.company_name}:`, updateError);
          errors.push(`Update error for ${company.company_name}: ${updateError.message}`);
        } else {
          updatedCount++;
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('cr_portfolio')
          .insert({
            fund_id,
            company_name: company.company_name,
            website: company.company_detail_url || null,
            sector: company.sector || null,
            country: company.location_countries?.[0] || null,
            status: company.mappedStatus,
            investment_year: company.investment_year || null,
            description: company.short_description || null,
            fund_name: company.fund || null,
            source_url: 'manual_text_import',
            notes: notesWithEvidence,
            ownership_type: null,
          });

        if (insertError) {
          console.error(`[cr-extract-portfolio-from-text] Insert error for ${company.company_name}:`, insertError);
          errors.push(`Insert error for ${company.company_name}: ${insertError.message}`);
        } else {
          insertedCount++;
        }
      }
    }

    // Update fund's last_portfolio_scraped_at
    await supabase
      .from('cr_funds')
      .update({ 
        last_portfolio_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', fund_id);

    console.log(`[cr-extract-portfolio-from-text] Complete: ${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        fund_name: effectiveFundName,
        extracted: allCompanies.length,
        inserted: insertedCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
        warnings: extractionResult.warnings?.length ? extractionResult.warnings : undefined,
        coverage: extractionResult.coverage,
        companies: allCompanies.map(c => ({ 
          company_name: c.company_name, 
          status: c.mappedStatus,
          sector: c.sector,
          fund: c.fund,
          investment_year: c.investment_year
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[cr-extract-portfolio-from-text] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

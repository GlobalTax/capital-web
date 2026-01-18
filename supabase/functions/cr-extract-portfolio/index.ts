import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Nuevo schema profesional para extracción
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fund_id, custom_url } = await req.json();

    if (!fund_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'fund_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!FIRECRAWL_API_KEY) {
      console.error('[cr-extract-portfolio] FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error('[cr-extract-portfolio] OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get fund data
    const { data: fund, error: fundError } = await supabase
      .from('cr_funds')
      .select('id, name, website, portfolio_url')
      .eq('id', fund_id)
      .single();

    if (fundError || !fund) {
      console.error('[cr-extract-portfolio] Fund not found:', fundError);
      return new Response(
        JSON.stringify({ success: false, error: 'Fund not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const portfolioUrl = custom_url || fund.portfolio_url || fund.website;
    if (!portfolioUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Fund has no portfolio URL or website configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[cr-extract-portfolio] Starting extraction for fund ${fund.name} (${fund_id})`);
    console.log(`[cr-extract-portfolio] Portfolio URL: ${portfolioUrl}`);

    // Step 1: Map the website to find portfolio pages
    console.log('[cr-extract-portfolio] Step 1: Mapping website for portfolio pages...');
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: portfolioUrl,
        search: 'portfolio investments participadas companies empresas invertidas exits realised',
        limit: 20,
        includeSubdomains: false,
      }),
    });

    const mapData = await mapResponse.json();
    
    if (!mapResponse.ok) {
      console.error('[cr-extract-portfolio] Map failed:', mapData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to map website', details: mapData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter URLs likely to contain portfolio info
    const portfolioKeywords = ['portfolio', 'participadas', 'investments', 'empresas', 'companies', 'invertidas', 'cartera', 'exits', 'realised', 'realized'];
    const portfolioUrls = (mapData.links || []).filter((url: string) => 
      portfolioKeywords.some(keyword => url.toLowerCase().includes(keyword))
    ).slice(0, 5);

    // If no specific portfolio pages found, try the main URL
    const urlsToScrape = portfolioUrls.length > 0 ? portfolioUrls : [portfolioUrl];
    
    console.log(`[cr-extract-portfolio] Found ${portfolioUrls.length} portfolio pages. Scraping: ${urlsToScrape.join(', ')}`);

    // Step 2: Scrape portfolio pages
    let allMarkdown = '';
    for (const url of urlsToScrape) {
      console.log(`[cr-extract-portfolio] Scraping: ${url}`);
      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 2000,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        if (scrapeResponse.ok && scrapeData.data?.markdown) {
          allMarkdown += `\n\n--- Content from ${url} ---\n\n${scrapeData.data.markdown}`;
        }
      } catch (scrapeError) {
        console.error(`[cr-extract-portfolio] Error scraping ${url}:`, scrapeError);
      }
    }

    if (!allMarkdown.trim()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No content found on portfolio pages',
          urls_tried: urlsToScrape 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[cr-extract-portfolio] Scraped ${allMarkdown.length} characters of content`);

    // Step 3: Extract structured data with OpenAI using professional prompt
    console.log('[cr-extract-portfolio] Step 3: Extracting structured data with OpenAI...');
    
    const systemPrompt = `Eres un analista de M&A y Data Extractor especializado en private equity portfolios.

Tu objetivo es transformar una página web de "Portfolio" en datos estructurados y verificables.

Reglas: precisión > completitud. No inventes nada. Si algo no aparece en la web, devuelve null.

TASK
1) Identifica si la página lista inversiones/participadas. Detecta secciones: "Current", "Exited", "Realised", "Past", etc.

2) Extrae TODAS las empresas "CURRENT/ACTIVE" y "EXITED" en bloques separados.

3) Para cada empresa:
   - company_name (string) - OBLIGATORIO, nombre exacto
   - status ("current" | "exited" | "unknown")
   - fund (string|null) - ej: "Fund I", "Fund II", "Growth Fund"
   - investment_year (number|null) - 4 dígitos, si aparece "since 2018" → 2018
   - sector (string|null) - SOLO si la web lo menciona explícitamente
   - short_description (string|null) - descripción detallada de la empresa: qué hace, sector, productos/servicios, mercados, posicionamiento. SIN LÍMITE de extensión. Incluye toda la información relevante disponible. EN CASTELLANO.
   - location_countries (array<string>) - países mencionados, [] si no hay
   - company_detail_url (string|null) - URL de ficha interna/externa
   - evidence (array) - 1-3 evidencias con quotes literales (máx 25 palabras cada una)
     Formato: {"field": "status|fund|investment_year|sector", "quote": "texto literal"}
   - notes (string|null) - aliases o aclaraciones si aplica

4) Normaliza:
   - Sin duplicados (mismo nombre)
   - Años: "since 2018" o "2018" → 2018
   - Captura badges de fondos si aparecen

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
- Si la web no distingue current/exited claramente, status="unknown" y añade warning.

Responde SOLO con JSON válido, sin texto adicional.`;

    const userPrompt = `Extrae las participadas de ${fund.name}.

URL del portfolio: ${portfolioUrl}

Contenido de la página:
${allMarkdown.substring(0, 20000)}`;

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
      console.error('[cr-extract-portfolio] OpenAI error:', errorText);
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
      console.error('[cr-extract-portfolio] JSON parse error:', parseError, extractedContent);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI response', raw: extractedContent?.substring(0, 500) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log extraction metadata
    console.log(`[cr-extract-portfolio] Firm detected: ${extractionResult.firm_name}`);
    console.log(`[cr-extract-portfolio] Coverage:`, extractionResult.coverage);
    if (extractionResult.warnings?.length) {
      console.log(`[cr-extract-portfolio] Warnings:`, extractionResult.warnings);
    }

    // Combine current + exited with proper status mapping
    const allCompanies = [
      ...(extractionResult.current || []).map(c => ({ ...c, mappedStatus: 'active' as const })),
      ...(extractionResult.exited || []).map(c => ({ ...c, mappedStatus: 'exited' as const }))
    ];

    console.log(`[cr-extract-portfolio] Extracted ${allCompanies.length} companies (${extractionResult.coverage?.current_count || 0} current, ${extractionResult.coverage?.exited_count || 0} exited)`);

    if (allCompanies.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No portfolio companies found',
          extracted: 0,
          inserted: 0,
          fund_name: fund.name,
          warnings: extractionResult.warnings 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Upsert companies into cr_portfolio
    console.log('[cr-extract-portfolio] Step 4: Upserting companies into database...');
    
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
            source_url: portfolioUrl,
            notes: notesWithEvidence,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`[cr-extract-portfolio] Update error for ${company.company_name}:`, updateError);
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
            source_url: portfolioUrl,
            notes: notesWithEvidence,
            ownership_type: null,
          });

        if (insertError) {
          console.error(`[cr-extract-portfolio] Insert error for ${company.company_name}:`, insertError);
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

    console.log(`[cr-extract-portfolio] Complete: ${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        fund_name: fund.name,
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
    console.error('[cr-extract-portfolio] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
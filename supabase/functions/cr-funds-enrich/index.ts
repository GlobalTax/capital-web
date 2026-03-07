// =====================================================
// CR FUNDS ENRICHMENT - FIRECRAWL + AI
// Enrich PE/VC funds with website scraping
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { callAI, parseAIJson } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrichmentResult {
  id: string;
  name: string;
  status: 'success' | 'error' | 'skipped';
  message?: string;
  enriched_data?: Record<string, unknown>;
}

// Scrape website using Firecrawl
async function scrapeWebsite(url: string): Promise<{ markdown?: string; branding?: Record<string, unknown> } | null> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return null;
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'branding'],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('Firecrawl error:', data.error);
      return null;
    }

    return {
      markdown: data.data?.markdown || data.markdown,
      branding: data.data?.branding || data.branding,
    };
  } catch (error) {
    console.error('Error scraping website:', error);
    return null;
  }
}

// Extract fund data using centralized AI helper
async function extractFundData(markdown: string, fundName: string): Promise<Record<string, unknown>> {
  const systemPrompt = `Eres un experto en análisis de fondos de Private Equity y Venture Capital. Extrae información estructurada del contenido web de un fondo de inversión.
Responde SOLO con un objeto JSON válido con la siguiente estructura:
{
  "description": "Descripción del fondo en español (máx 500 caracteres)",
  "investment_thesis": "Tesis de inversión del fondo",
  "aum_estimate": null,
  "team_size_estimate": null,
  "founded_year": null,
  "headquarters": "ciudad y país",
  "sector_focus": [],
  "geography_focus": [],
  "investment_stage": [],
  "ticket_range": {"min": null, "max": null},
  "notable_exits": [],
  "key_partners": [{"name": "", "role": ""}],
  "social_links": {"linkedin": "", "twitter": ""}
}`;

  try {
    const response = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Fondo: ${fundName}\n\nContenido de la web:\n${markdown.slice(0, 15000)}\n\nExtrae la información estructurada. Si algún dato no está disponible, usa null o arrays vacíos.` }
      ],
      { functionName: 'cr-funds-enrich', preferOpenAI: true, jsonMode: true }
    );

    return parseAIJson(response.content);
  } catch (error) {
    console.error('Error extracting fund data:', error);
    return {};
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { fund_ids, limit = 10, force = false } = await req.json();

    let query = supabase
      .from('cr_funds')
      .select('id, name, website, enriched_at, description, aum, sector_focus, geography_focus')
      .eq('is_deleted', false)
      .not('website', 'is', null);

    if (fund_ids && fund_ids.length > 0) {
      query = query.in('id', fund_ids);
    } else {
      if (!force) {
        query = query.or('enriched_at.is.null,enriched_at.lt.' + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      }
      query = query.limit(limit);
    }

    const { data: funds, error: fetchError } = await query;

    if (fetchError) throw new Error(`Error fetching funds: ${fetchError.message}`);

    if (!funds || funds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No funds to enrich', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${funds.length} funds for enrichment`);

    const results: EnrichmentResult[] = [];
    let creditsUsed = 0;

    for (const fund of funds) {
      try {
        console.log(`Enriching: ${fund.name} (${fund.website})`);

        const scrapedData = await scrapeWebsite(fund.website);
        creditsUsed += 1;

        if (!scrapedData || !scrapedData.markdown) {
          results.push({ id: fund.id, name: fund.name, status: 'error', message: 'Failed to scrape website' });
          continue;
        }

        const extractedData = await extractFundData(scrapedData.markdown, fund.name);

        const updateData: Record<string, unknown> = {
          enriched_at: new Date().toISOString(),
          enriched_data: { ...extractedData, branding: scrapedData.branding, scraped_at: new Date().toISOString(), source_url: fund.website },
          enrichment_source: 'firecrawl'
        };

        if (extractedData.investment_thesis) updateData.investment_thesis = extractedData.investment_thesis;
        if (extractedData.team_size_estimate) updateData.team_size_estimate = extractedData.team_size_estimate;
        if (extractedData.notable_exits && Array.isArray(extractedData.notable_exits)) updateData.notable_exits = extractedData.notable_exits;
        if (!fund.description && extractedData.description) updateData.description = extractedData.description;
        if (!fund.aum && extractedData.aum_estimate) updateData.aum = extractedData.aum_estimate;
        if ((!fund.sector_focus || fund.sector_focus.length === 0) && extractedData.sector_focus) updateData.sector_focus = extractedData.sector_focus;
        if ((!fund.geography_focus || fund.geography_focus.length === 0) && extractedData.geography_focus) updateData.geography_focus = extractedData.geography_focus;

        const { error: updateError } = await supabase.from('cr_funds').update(updateData).eq('id', fund.id);

        if (updateError) {
          results.push({ id: fund.id, name: fund.name, status: 'error', message: `Update failed: ${updateError.message}` });
        } else {
          results.push({ id: fund.id, name: fund.name, status: 'success', enriched_data: extractedData });
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error enriching ${fund.name}:`, error);
        results.push({ id: fund.id, name: fund.name, status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    await supabase.from('api_usage_log').insert({
      service: 'firecrawl', operation: 'funds_enrich', credits_used: creditsUsed,
      function_name: 'cr-funds-enrich',
      metadata: { total_funds: funds.length, successful: results.filter(r => r.status === 'success').length, failed: results.filter(r => r.status === 'error').length }
    });

    return new Response(
      JSON.stringify({ success: true, message: `Enriched ${results.filter(r => r.status === 'success').length} funds`, results, credits_used: creditsUsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cr-funds-enrich:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

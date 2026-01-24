// =====================================================
// CR FUNDS ENRICHMENT - FIRECRAWL + AI
// Enrich PE/VC funds with website scraping
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI Helper functions
async function callLovableAI(messages: AIMessage[], jsonMode = false): Promise<string> {
  const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callOpenAI(messages: AIMessage[], jsonMode = false): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callAI(messages: AIMessage[], jsonMode = false): Promise<string> {
  try {
    return await callLovableAI(messages, jsonMode);
  } catch (error) {
    console.log('Lovable AI failed, trying OpenAI:', error);
    return await callOpenAI(messages, jsonMode);
  }
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

// Extract fund data using AI
async function extractFundData(markdown: string, fundName: string): Promise<Record<string, unknown>> {
  const systemPrompt = `Eres un experto en análisis de fondos de Private Equity y Venture Capital. Extrae información estructurada del contenido web de un fondo de inversión.
Responde SOLO con un objeto JSON válido con la siguiente estructura:
{
  \"description\": \"Descripción del fondo en español (máx 500 caracteres)\",
  \"investment_thesis\": \"Tesis de inversión del fondo - qué tipo de empresas buscan, en qué sectores, geografías, tamaños\",
  \"aum_estimate\": número estimado de AUM en millones de euros o null,
  \"team_size_estimate\": número estimado de personas en el equipo o null,
  \"founded_year\": año de fundación o null,
  \"headquarters\": \"ciudad y país de la sede\",
  \"sector_focus\": [\"array\", \"de\", \"sectores\", \"de\", \"enfoque\"],
  \"geography_focus\": [\"array\", \"de\", \"geografías\", \"de\", \"enfoque\"],
  \"investment_stage\": [\"seed\", \"series_a\", \"growth\", \"buyout\"],
  \"ticket_range\": {\"min\": número en millones, \"max\": número en millones},
  \"notable_exits\": [\"array\", \"de\", \"exits\", \"notables\"],
  \"key_partners\": [{\"name\": \"nombre\", \"role\": \"cargo\"}],
  \"social_links\": {\"linkedin\": \"url\", \"twitter\": \"url\"}
}`;

  const userPrompt = `Fondo: ${fundName}

Contenido de la web:
${markdown.slice(0, 15000)}

Extrae la información estructurada de este fondo de inversión. Si algún dato no está disponible, usa null o arrays vacíos.`;

  try {
    const response = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true);

    // Clean and parse JSON
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(cleanedResponse);
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

    // If specific IDs provided, use those
    if (fund_ids && fund_ids.length > 0) {
      query = query.in('id', fund_ids);
    } else {
      // Otherwise, get funds that need enrichment
      if (!force) {
        query = query.or('enriched_at.is.null,enriched_at.lt.' + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      }
      query = query.limit(limit);
    }

    const { data: funds, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Error fetching funds: ${fetchError.message}`);
    }

    if (!funds || funds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No funds to enrich',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${funds.length} funds for enrichment`);

    const results: EnrichmentResult[] = [];
    let creditsUsed = 0;

    for (const fund of funds) {
      try {
        console.log(`Enriching: ${fund.name} (${fund.website})`);

        // Scrape the website
        const scrapedData = await scrapeWebsite(fund.website);
        creditsUsed += 1;

        if (!scrapedData || !scrapedData.markdown) {
          results.push({
            id: fund.id,
            name: fund.name,
            status: 'error',
            message: 'Failed to scrape website'
          });
          continue;
        }

        // Extract structured data using AI
        const extractedData = await extractFundData(scrapedData.markdown, fund.name);

        // Prepare update data
        const updateData: Record<string, unknown> = {
          enriched_at: new Date().toISOString(),
          enriched_data: {
            ...extractedData,
            branding: scrapedData.branding,
            scraped_at: new Date().toISOString(),
            source_url: fund.website
          },
          enrichment_source: 'firecrawl'
        };

        // Update specific fields if extracted
        if (extractedData.investment_thesis) {
          updateData.investment_thesis = extractedData.investment_thesis;
        }
        if (extractedData.team_size_estimate) {
          updateData.team_size_estimate = extractedData.team_size_estimate;
        }
        if (extractedData.notable_exits && Array.isArray(extractedData.notable_exits)) {
          updateData.notable_exits = extractedData.notable_exits;
        }
        // Update description only if empty
        if (!fund.description && extractedData.description) {
          updateData.description = extractedData.description;
        }
        // Update AUM only if empty
        if (!fund.aum && extractedData.aum_estimate) {
          updateData.aum = extractedData.aum_estimate;
        }
        // Update sector_focus only if empty
        if ((!fund.sector_focus || fund.sector_focus.length === 0) && extractedData.sector_focus) {
          updateData.sector_focus = extractedData.sector_focus;
        }
        // Update geography_focus only if empty
        if ((!fund.geography_focus || fund.geography_focus.length === 0) && extractedData.geography_focus) {
          updateData.geography_focus = extractedData.geography_focus;
        }

        // Update the fund
        const { error: updateError } = await supabase
          .from('cr_funds')
          .update(updateData)
          .eq('id', fund.id);

        if (updateError) {
          results.push({
            id: fund.id,
            name: fund.name,
            status: 'error',
            message: `Update failed: ${updateError.message}`
          });
        } else {
          results.push({
            id: fund.id,
            name: fund.name,
            status: 'success',
            enriched_data: extractedData
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error enriching ${fund.name}:`, error);
        results.push({
          id: fund.id,
          name: fund.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log API usage
    await supabase.from('api_usage_log').insert({
      service: 'firecrawl',
      operation: 'funds_enrich',
      credits_used: creditsUsed,
      function_name: 'cr-funds-enrich',
      metadata: {
        total_funds: funds.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }
    });

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enriched ${successCount} funds, ${errorCount} errors`,
        results,
        credits_used: creditsUsed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cr-funds-enrich:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

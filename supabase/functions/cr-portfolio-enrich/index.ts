// =====================================================
// CR PORTFOLIO ENRICHMENT - FIRECRAWL + AI
// Enrich portfolio companies with website scraping
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrichmentResult {
  id: string;
  company_name: string;
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

// Extract company data using AI
async function extractCompanyData(markdown: string, companyName: string): Promise<Record<string, unknown>> {
  const systemPrompt = `Eres un experto en análisis de empresas. Extrae información estructurada del contenido web de una empresa.
Responde SOLO con un objeto JSON válido con la siguiente estructura:
{
  "description": "Descripción de la empresa en español (máx 500 caracteres)",
  "sector": "Sector principal de la empresa",
  "employee_count_estimate": número estimado de empleados o null si no está disponible,
  "revenue_estimate": "Estimación de facturación si está disponible, en formato texto (ej: '10-50M€')",
  "technologies": ["array", "de", "tecnologías", "mencionadas"],
  "key_people": [{"name": "nombre", "role": "cargo"}],
  "social_links": {"linkedin": "url", "twitter": "url"},
  "year_founded": número o null,
  "headquarters": "ubicación de la sede",
  "products_services": ["array", "de", "productos", "o", "servicios"]
}`;

  const userPrompt = `Empresa: ${companyName}

Contenido de la web:
${markdown.slice(0, 15000)}

Extrae la información estructurada de esta empresa. Si algún dato no está disponible, usa null o arrays vacíos.`;

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
    console.error('Error extracting company data:', error);
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

    const { company_ids, limit = 10, force = false } = await req.json();

    let query = supabase
      .from('cr_portfolio')
      .select('id, company_name, website, enriched_at, description, sector')
      .eq('is_deleted', false)
      .not('website', 'is', null);

    // If specific IDs provided, use those
    if (company_ids && company_ids.length > 0) {
      query = query.in('id', company_ids);
    } else {
      // Otherwise, get companies that need enrichment
      if (!force) {
        query = query.or('enriched_at.is.null,enriched_at.lt.' + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      }
      query = query.limit(limit);
    }

    const { data: companies, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Error fetching companies: ${fetchError.message}`);
    }

    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No companies to enrich',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${companies.length} companies for enrichment`);

    const results: EnrichmentResult[] = [];
    let creditsUsed = 0;

    for (const company of companies) {
      try {
        console.log(`Enriching: ${company.company_name} (${company.website})`);

        // Scrape the website
        const scrapedData = await scrapeWebsite(company.website);
        creditsUsed += 1;

        if (!scrapedData || !scrapedData.markdown) {
          results.push({
            id: company.id,
            company_name: company.company_name,
            status: 'error',
            message: 'Failed to scrape website'
          });
          continue;
        }

        // Extract structured data using AI
        const extractedData = await extractCompanyData(scrapedData.markdown, company.company_name);

        // Prepare update data
        const updateData: Record<string, unknown> = {
          enriched_at: new Date().toISOString(),
          enriched_data: {
            ...extractedData,
            branding: scrapedData.branding,
            scraped_at: new Date().toISOString(),
            source_url: company.website
          },
          enrichment_source: 'firecrawl'
        };

        // Update specific fields if extracted
        if (extractedData.employee_count_estimate) {
          updateData.employee_count_estimate = extractedData.employee_count_estimate;
        }
        if (extractedData.revenue_estimate) {
          updateData.revenue_estimate = extractedData.revenue_estimate;
        }
        if (extractedData.technologies && Array.isArray(extractedData.technologies)) {
          updateData.technologies = extractedData.technologies;
        }
        if (extractedData.key_people) {
          updateData.key_people = extractedData.key_people;
        }
        if (extractedData.social_links) {
          updateData.social_links = extractedData.social_links;
        }
        // Update description only if empty
        if (!company.description && extractedData.description) {
          updateData.description = extractedData.description;
        }
        // Update sector only if empty
        if (!company.sector && extractedData.sector) {
          updateData.sector = extractedData.sector;
        }

        // Update the company
        const { error: updateError } = await supabase
          .from('cr_portfolio')
          .update(updateData)
          .eq('id', company.id);

        if (updateError) {
          results.push({
            id: company.id,
            company_name: company.company_name,
            status: 'error',
            message: `Update failed: ${updateError.message}`
          });
        } else {
          results.push({
            id: company.id,
            company_name: company.company_name,
            status: 'success',
            enriched_data: extractedData
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error enriching ${company.company_name}:`, error);
        results.push({
          id: company.id,
          company_name: company.company_name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log API usage
    await supabase.from('api_usage_log').insert({
      service: 'firecrawl',
      operation: 'portfolio_enrich',
      credits_used: creditsUsed,
      function_name: 'cr-portfolio-enrich',
      metadata: {
        total_companies: companies.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }
    });

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enriched ${successCount} companies, ${errorCount} errors`,
        results,
        credits_used: creditsUsed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cr-portfolio-enrich:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

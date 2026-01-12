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

interface PortfolioCompany {
  company_name: string;
  website?: string;
  sector?: string;
  country?: string;
  status: 'active' | 'exited' | 'write_off' | 'partial_exit';
  investment_year?: number;
  exit_year?: number;
  description?: string;
  ownership_type?: 'majority' | 'minority' | 'growth' | 'control';
}

interface ExtractionResult {
  portfolio: PortfolioCompany[];
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
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get fund data
    const { data: fund, error: fundError } = await supabase
      .from('cr_funds')
      .select('id, name, website')
      .eq('id', fund_id)
      .single();

    if (fundError || !fund) {
      console.error('Fund not found:', fundError);
      return new Response(
        JSON.stringify({ success: false, error: 'Fund not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const websiteUrl = custom_url || fund.website;
    if (!websiteUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Fund has no website configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[cr-extract-portfolio] Starting extraction for fund ${fund.name} (${fund_id})`);
    console.log(`[cr-extract-portfolio] Website: ${websiteUrl}`);

    // Step 1: Map the website to find portfolio pages
    console.log('[cr-extract-portfolio] Step 1: Mapping website for portfolio pages...');
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        search: 'portfolio investments participadas companies empresas invertidas',
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
    const portfolioKeywords = ['portfolio', 'participadas', 'investments', 'empresas', 'companies', 'invertidas', 'cartera', 'exits'];
    const portfolioUrls = (mapData.links || []).filter((url: string) => 
      portfolioKeywords.some(keyword => url.toLowerCase().includes(keyword))
    ).slice(0, 5); // Limit to 5 pages

    // If no specific portfolio pages found, try the main website
    const urlsToScrape = portfolioUrls.length > 0 ? portfolioUrls : [websiteUrl];
    
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

    // Step 3: Extract structured data with OpenAI
    console.log('[cr-extract-portfolio] Step 3: Extracting structured data with OpenAI...');
    
    const systemPrompt = `You are a data extraction specialist for Private Equity and Venture Capital.
Your task is to extract portfolio company information from fund websites.

Extract ALL companies mentioned as portfolio investments, current holdings, or exits.

For each company, extract:
- company_name: Exact name of the company (REQUIRED)
- website: Company website URL if mentioned
- sector: Industry/sector (e.g., technology, healthcare, industrial, fintech)
- country: Country of operation if mentioned
- status: "active" for current investments, "exited" for past investments/exits, "partial_exit" for partial exits
- investment_year: Year of investment if mentioned (number)
- exit_year: Year of exit if mentioned (number)
- description: Brief description if available
- ownership_type: Type of ownership stake - only use these exact values:
  - "majority" for buyouts or >50% stake
  - "minority" for <50% stake
  - "growth" for growth equity investments
  - "control" for control stakes
  - Omit this field if not clear from the content

IMPORTANT:
- Only include actual portfolio companies, not team members or partners
- If unsure about status, default to "active"
- Respond ONLY with valid JSON, no additional text
- If no companies found, return {"portfolio": []}`;

    const userPrompt = `Extract portfolio companies from this content from ${fund.name}:

${allMarkdown.substring(0, 15000)}`; // Limit to ~15k chars

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
        JSON.stringify({ success: false, error: 'AI extraction failed' }),
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
        JSON.stringify({ success: false, error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const companies = extractionResult.portfolio || [];
    console.log(`[cr-extract-portfolio] Extracted ${companies.length} companies`);

    if (companies.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No portfolio companies found',
          extracted: 0,
          inserted: 0,
          fund_name: fund.name 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 4: Upsert companies into cr_portfolio
    console.log('[cr-extract-portfolio] Step 4: Upserting companies into database...');
    
    let insertedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const company of companies) {
      if (!company.company_name) {
        skippedCount++;
        continue;
      }

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
            website: company.website || null,
            sector: company.sector || null,
            country: company.country || null,
            status: company.status || 'active',
            investment_year: company.investment_year || null,
            exit_year: company.exit_year || null,
            description: company.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          errors.push(`Update error for ${company.company_name}: ${updateError.message}`);
        } else {
          insertedCount++;
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('cr_portfolio')
          .insert({
            fund_id,
            company_name: company.company_name,
            website: company.website || null,
            sector: company.sector || null,
            country: company.country || null,
            status: company.status || 'active',
            investment_year: company.investment_year || null,
            exit_year: company.exit_year || null,
            description: company.description || null,
            ownership_type: company.ownership_type || null,
          });

        if (insertError) {
          errors.push(`Insert error for ${company.company_name}: ${insertError.message}`);
        } else {
          insertedCount++;
        }
      }
    }

    // Update fund's last_scraped_at
    await supabase
      .from('cr_funds')
      .update({ 
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', fund_id);

    console.log(`[cr-extract-portfolio] Complete: ${insertedCount} inserted/updated, ${skippedCount} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        fund_name: fund.name,
        extracted: companies.length,
        inserted: insertedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
        companies: companies.map(c => ({ 
          company_name: c.company_name, 
          status: c.status,
          sector: c.sector 
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

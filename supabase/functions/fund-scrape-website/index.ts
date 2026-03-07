import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
  fund_id: string;
  fund_type: 'sf' | 'cr';
  url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fund_id, fund_type, url: customUrl } = await req.json() as ScrapeRequest;

    if (!fund_id || !fund_type) {
      return new Response(
        JSON.stringify({ success: false, error: 'fund_id and fund_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tableName = fund_type === 'sf' ? 'sf_funds' : 'cr_funds';
    const { data: fund, error: fundError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', fund_id)
      .single();

    if (fundError || !fund) {
      return new Response(
        JSON.stringify({ success: false, error: 'Fund not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const websiteUrl = customUrl || fund.website;
    if (!websiteUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'No website URL available for this fund' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = websiteUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log(`Scraping ${fund_type} fund website: ${formattedUrl}`);

    // Scrape with Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'links'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl scrape failed:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Scrape failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown;
    const links = scrapeData.data?.links || scrapeData.links || [];

    // Use AI to extract structured data
    let extractedData = null;

    if (markdown) {
      const extractionPrompt = fund_type === 'sf' 
        ? `Analiza esta página web de un Search Fund y extrae la siguiente información en JSON:
{
  "investment_criteria": { "sectors": [], "geography": [], "revenue_range": { "min": null, "max": null, "currency": "EUR" }, "ebitda_range": { "min": null, "max": null, "currency": "EUR" } },
  "team": [{ "name": "", "role": "", "linkedin": "" }],
  "backers": [],
  "portfolio": [{ "company": "", "sector": "", "year": null }],
  "contact": { "email": "", "phone": "", "address": "" },
  "description": ""
}`
        : `Analiza esta página web de un fondo de Capital Riesgo y extrae la siguiente información en JSON:
{
  "investment_criteria": { "sectors": [], "geography": [], "ticket_size": { "min": null, "max": null, "currency": "EUR" }, "fund_size": null, "stage": [] },
  "team": [{ "name": "", "role": "", "linkedin": "" }],
  "portfolio": [{ "company": "", "sector": "", "status": "" }],
  "contact": { "email": "", "phone": "", "address": "" },
  "description": ""
}`;

      try {
        const aiResponse = await callAI(
          [
            { role: 'system', content: 'Eres un experto en análisis de fondos de inversión. Extrae información estructurada de páginas web. Responde SOLO con JSON válido, sin markdown.' },
            { role: 'user', content: `${extractionPrompt}\n\nContenido de la web:\n${markdown.substring(0, 15000)}` }
          ],
          { functionName: 'fund-scrape-website', preferOpenAI: true, temperature: 0.1 }
        );

        extractedData = parseAIJson(aiResponse.content);
      } catch (aiError) {
        console.error('AI extraction failed:', aiError);
      }
    }

    // Update fund with scraped data
    const updateData: Record<string, unknown> = {
      last_scraped_at: new Date().toISOString(),
      scrape_source_urls: [formattedUrl],
      scrape_data: {
        markdown_preview: markdown?.substring(0, 2000),
        links_count: links.length,
        extracted: extractedData,
        scraped_at: new Date().toISOString(),
      },
    };

    const { error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', fund_id);

    if (updateError) {
      console.error('Failed to update fund:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          fund_id,
          fund_type,
          url: formattedUrl,
          markdown_length: markdown?.length || 0,
          links_count: links.length,
          extracted: extractedData,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in fund-scrape-website:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

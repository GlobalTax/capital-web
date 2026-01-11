import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Get fund data
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

    // Format URL
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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let extractedData = null;

    if (openaiApiKey && markdown) {
      const extractionPrompt = fund_type === 'sf' 
        ? `Analiza esta página web de un Search Fund y extrae la siguiente información en JSON:
{
  "investment_criteria": {
    "sectors": ["lista de sectores de interés"],
    "geography": ["regiones/países objetivo"],
    "revenue_range": { "min": number, "max": number, "currency": "EUR" },
    "ebitda_range": { "min": number, "max": number, "currency": "EUR" }
  },
  "team": [
    { "name": "nombre", "role": "rol", "linkedin": "url si está" }
  ],
  "backers": ["lista de inversores/sponsors"],
  "portfolio": [
    { "company": "nombre", "sector": "sector", "year": number }
  ],
  "contact": {
    "email": "email si está",
    "phone": "teléfono si está",
    "address": "dirección si está"
  },
  "description": "descripción breve del fondo"
}`
        : `Analiza esta página web de un fondo de Capital Riesgo y extrae la siguiente información en JSON:
{
  "investment_criteria": {
    "sectors": ["lista de sectores de interés"],
    "geography": ["regiones/países objetivo"],
    "ticket_size": { "min": number, "max": number, "currency": "EUR" },
    "fund_size": number,
    "stage": ["seed", "series_a", "growth", etc]
  },
  "team": [
    { "name": "nombre", "role": "rol", "linkedin": "url si está" }
  ],
  "portfolio": [
    { "company": "nombre", "sector": "sector", "status": "active/exited" }
  ],
  "contact": {
    "email": "email si está",
    "phone": "teléfono si está",
    "address": "dirección si está"
  },
  "description": "descripción breve del fondo"
}`;

      try {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Eres un experto en análisis de fondos de inversión. Extrae información estructurada de páginas web. Responde SOLO con JSON válido, sin markdown.' },
              { role: 'user', content: `${extractionPrompt}\n\nContenido de la web:\n${markdown.substring(0, 15000)}` }
            ],
            temperature: 0.1,
          }),
        });

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        
        if (content) {
          try {
            extractedData = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
          } catch (e) {
            console.error('Failed to parse AI response:', e);
          }
        }
      } catch (aiError) {
        console.error('AI extraction failed:', aiError);
      }
    }

    // Update fund with scraped data
    const updateData: Record<string, unknown> = {
      last_scraped_at: new Date().toISOString(),
      scrape_source_urls: [formattedUrl],
    };

    if (fund_type === 'sf') {
      updateData.scrape_data = {
        markdown_preview: markdown?.substring(0, 2000),
        links_count: links.length,
        extracted: extractedData,
        scraped_at: new Date().toISOString(),
      };
    } else {
      updateData.scrape_data = {
        markdown_preview: markdown?.substring(0, 2000),
        links_count: links.length,
        extracted: extractedData,
        scraped_at: new Date().toISOString(),
      };
    }

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

  } catch (error) {
    console.error('Error in fund-scrape-website:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

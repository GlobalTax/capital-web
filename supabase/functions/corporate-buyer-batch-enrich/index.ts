import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BatchEnrichRequest {
  buyer_ids: string[];
  force?: boolean;
}

interface BatchEnrichResult {
  buyer_id: string;
  buyer_name: string;
  status: 'enriched' | 'skipped' | 'error' | 'no_website';
  fields_updated: string[];
  error_message?: string;
}

interface BatchEnrichResponse {
  success: boolean;
  total_processed: number;
  enriched: number;
  skipped: number;
  errors: number;
  no_website: number;
  results: BatchEnrichResult[];
}

const DELAY_BETWEEN_REQUESTS = 2500; // 2.5 seconds to avoid rate limits

async function scrapeWebsite(url: string, apiKey: string): Promise<{ markdown: string; branding?: any } | null> {
  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

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
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl error:', response.status);
      return null;
    }

    const data = await response.json();
    return {
      markdown: data.data?.markdown || data.markdown || '',
      branding: data.data?.branding || data.branding,
    };
  } catch (error) {
    console.error('Error scraping:', error);
    return null;
  }
}

async function extractWithAI(content: string, buyerName: string, openaiKey: string): Promise<any | null> {
  const systemPrompt = `Eres un experto en M&A corporativo. Analiza el contenido web de un comprador estratégico y extrae información relevante para su perfil de adquisición.

Responde SOLO con JSON válido:
{
  "description": "Descripción profesional en español. Enfócate en: qué hace la empresa, tamaño, mercados, fortalezas. Max 800 chars.",
  "sector_focus": ["sectores específicos donde buscan adquisiciones, máximo 5"],
  "search_keywords": ["palabras clave para matching con empresas target, máximo 10"],
  "key_highlights": ["3-5 puntos diferenciadores clave"],
  "investment_thesis": "Tesis de inversión inferida si es detectable, null si no",
  "geography_inferred": ["geografías de interés detectadas"]
}

Si no puedes extraer información útil, responde: {"error": "insufficient_data"}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Empresa: ${buyerName}\n\nContenido web:\n${content.substring(0, 15000)}` }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', response.status);
      return null;
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    
    if (parsed.error) {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error with AI extraction:', error);
    return null;
  }
}

async function enrichSingleBuyer(
  buyer: any,
  firecrawlKey: string,
  openaiKey: string,
  supabase: any,
  force: boolean
): Promise<BatchEnrichResult> {
  const result: BatchEnrichResult = {
    buyer_id: buyer.id,
    buyer_name: buyer.name,
    status: 'error',
    fields_updated: [],
  };

  // Check if has website
  if (!buyer.website) {
    result.status = 'no_website';
    return result;
  }

  // Check if already enriched and not forcing
  if (!force && buyer.description && buyer.sector_focus?.length > 0) {
    result.status = 'skipped';
    return result;
  }

  try {
    // Scrape website
    const scraped = await scrapeWebsite(buyer.website, firecrawlKey);
    if (!scraped || !scraped.markdown) {
      result.status = 'error';
      result.error_message = 'No se pudo acceder al website';
      return result;
    }

    // Extract with AI
    const extracted = await extractWithAI(scraped.markdown, buyer.name, openaiKey);
    if (!extracted) {
      result.status = 'error';
      result.error_message = 'Error en extracción AI';
      return result;
    }

    // Build update object
    const updateData: Record<string, any> = {
      enriched_at: new Date().toISOString(),
      enrichment_source: buyer.website,
      enriched_data: { ...extracted, scraped_at: new Date().toISOString() },
    };

    // Only update empty fields unless force is true
    if (force || !buyer.description) {
      if (extracted.description) {
        updateData.description = extracted.description;
        result.fields_updated.push('description');
      }
    }

    if (force || !buyer.sector_focus?.length) {
      if (extracted.sector_focus?.length > 0) {
        updateData.sector_focus = extracted.sector_focus;
        result.fields_updated.push('sector_focus');
      }
    }

    if (force || !buyer.search_keywords?.length) {
      if (extracted.search_keywords?.length > 0) {
        updateData.search_keywords = extracted.search_keywords;
        result.fields_updated.push('search_keywords');
      }
    }

    if (force || !buyer.key_highlights?.length) {
      if (extracted.key_highlights?.length > 0) {
        updateData.key_highlights = extracted.key_highlights;
        result.fields_updated.push('key_highlights');
      }
    }

    if (force || !buyer.investment_thesis) {
      if (extracted.investment_thesis) {
        updateData.investment_thesis = extracted.investment_thesis;
        result.fields_updated.push('investment_thesis');
      }
    }

    if (force || !buyer.geography_focus?.length) {
      if (extracted.geography_inferred?.length > 0) {
        updateData.geography_focus = extracted.geography_inferred;
        result.fields_updated.push('geography_focus');
      }
    }

    // Update database
    const { error: updateError } = await supabase
      .from('corporate_buyers')
      .update(updateData)
      .eq('id', buyer.id);

    if (updateError) {
      console.error('Error updating buyer:', updateError);
      result.status = 'error';
      result.error_message = 'Error al guardar datos';
      return result;
    }

    result.status = 'enriched';
    return result;
  } catch (error) {
    console.error('Error enriching buyer:', error);
    result.status = 'error';
    result.error_message = error instanceof Error ? error.message : 'Error desconocido';
    return result;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { buyer_ids, force = false }: BatchEnrichRequest = await req.json();

    if (!buyer_ids || !Array.isArray(buyer_ids) || buyer_ids.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'buyer_ids array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API keys
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY || !OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'API keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all buyers
    const { data: buyers, error: fetchError } = await supabase
      .from('corporate_buyers')
      .select('*')
      .in('id', buyer_ids)
      .eq('is_deleted', false);

    if (fetchError) {
      console.error('Error fetching buyers:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error fetching buyers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!buyers || buyers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No buyers found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting batch enrichment for ${buyers.length} buyers`);

    const results: BatchEnrichResult[] = [];
    let enriched = 0;
    let skipped = 0;
    let errors = 0;
    let noWebsite = 0;

    // Process buyers sequentially to avoid rate limits
    for (let i = 0; i < buyers.length; i++) {
      const buyer = buyers[i];
      console.log(`Processing ${i + 1}/${buyers.length}: ${buyer.name}`);

      const result = await enrichSingleBuyer(buyer, FIRECRAWL_API_KEY, OPENAI_API_KEY, supabase, force);
      results.push(result);

      switch (result.status) {
        case 'enriched':
          enriched++;
          break;
        case 'skipped':
          skipped++;
          break;
        case 'no_website':
          noWebsite++;
          break;
        case 'error':
          errors++;
          break;
      }

      // Delay between requests (except for the last one)
      if (i < buyers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }
    }

    const response: BatchEnrichResponse = {
      success: true,
      total_processed: buyers.length,
      enriched,
      skipped,
      errors,
      no_website: noWebsite,
      results,
    };

    console.log(`Batch enrichment complete: ${enriched} enriched, ${skipped} skipped, ${errors} errors, ${noWebsite} no website`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in batch enrichment:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

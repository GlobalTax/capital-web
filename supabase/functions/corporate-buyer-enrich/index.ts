import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface EnrichmentResult {
  description?: string;
  sector_focus?: string[];
  search_keywords?: string[];
  key_highlights?: string[];
  investment_thesis?: string;
  buyer_type_suggestion?: string;
  geography_inferred?: string[];
  estimated_revenue?: string;
  acquisition_history?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const { buyer_id, force = false, preview_only = false } = await req.json();

    if (!buyer_id) {
      return new Response(JSON.stringify({ success: false, error: 'buyer_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: buyer, error: buyerError } = await supabase.from('corporate_buyers').select('*').eq('id', buyer_id).single();
    if (buyerError || !buyer) {
      return new Response(JSON.stringify({ success: false, error: 'Buyer not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!buyer.website) {
      return new Response(JSON.stringify({ success: false, error: 'Buyer has no website configured' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Enriching buyer: ${buyer.name} (${buyer.website})`);

    let formattedUrl = buyer.website.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Step 1: Scrape website with Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: formattedUrl, formats: ['markdown'], onlyMainContent: true, waitFor: 2000 }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      return new Response(JSON.stringify({ success: false, error: `Failed to scrape website: ${scrapeData.error || 'Unknown error'}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    if (!markdown || markdown.length < 100) {
      return new Response(JSON.stringify({ success: false, error: 'Website content too short or empty' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 2: Extract with centralized AI helper
    const systemPrompt = `Eres un experto en M&A corporativo. Analiza el contenido web de un comprador estratégico.

El comprador: "${buyer.name}"
${buyer.country_base ? `País: ${buyer.country_base}` : ''}
${buyer.buyer_type ? `Tipo: ${buyer.buyer_type}` : ''}

Responde SOLO con JSON válido:
{
  "description": "Descripción en ESPAÑOL, max 800 chars, o null",
  "sector_focus": ["sectores de adquisición"],
  "search_keywords": ["palabras clave para matching"],
  "key_highlights": ["3-5 diferenciadores"],
  "investment_thesis": "tesis de inversión o null",
  "buyer_type_suggestion": "corporate|family_office|pe_fund|strategic_buyer|holding",
  "geography_inferred": ["países/regiones"],
  "estimated_revenue": "rango o null",
  "acquisition_history": ["adquisiciones previas"]
}`;

    const aiResponse = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analiza este contenido web:\n\n${markdown.substring(0, 15000)}` }
      ],
      { functionName: 'corporate-buyer-enrich', preferOpenAI: true, temperature: 0.3, maxTokens: 1500 }
    );

    const enrichedData: EnrichmentResult = parseAIJson(aiResponse.content);

    if (preview_only) {
      return new Response(JSON.stringify({
        success: true, preview: true, enriched_data: enrichedData,
        current_data: { description: buyer.description, sector_focus: buyer.sector_focus, search_keywords: buyer.search_keywords, key_highlights: buyer.key_highlights, investment_thesis: buyer.investment_thesis, buyer_type: buyer.buyer_type, geography_focus: buyer.geography_focus },
        source_url: formattedUrl,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 3: Update
    const fieldsToUpdate: Record<string, any> = {};
    const fieldsUpdated: string[] = [];

    if (enrichedData.description && (force || !buyer.description)) { fieldsToUpdate.description = enrichedData.description; fieldsUpdated.push('description'); }
    if (enrichedData.sector_focus?.length && (force || !buyer.sector_focus?.length)) { fieldsToUpdate.sector_focus = enrichedData.sector_focus; fieldsUpdated.push('sector_focus'); }
    if (enrichedData.search_keywords?.length && (force || !buyer.search_keywords?.length)) { fieldsToUpdate.search_keywords = enrichedData.search_keywords; fieldsUpdated.push('search_keywords'); }
    if (enrichedData.key_highlights?.length && (force || !buyer.key_highlights?.length)) { fieldsToUpdate.key_highlights = enrichedData.key_highlights; fieldsUpdated.push('key_highlights'); }
    if (enrichedData.investment_thesis && (force || !buyer.investment_thesis)) { fieldsToUpdate.investment_thesis = enrichedData.investment_thesis; fieldsUpdated.push('investment_thesis'); }
    if (enrichedData.geography_inferred?.length && (force || !buyer.geography_focus?.length)) { fieldsToUpdate.geography_focus = enrichedData.geography_inferred; fieldsUpdated.push('geography_focus'); }

    fieldsToUpdate.enriched_at = new Date().toISOString();
    fieldsToUpdate.enriched_data = enrichedData;
    fieldsToUpdate.enrichment_source = formattedUrl;
    fieldsToUpdate.updated_at = new Date().toISOString();

    const { error: updateError } = await supabase.from('corporate_buyers').update(fieldsToUpdate).eq('id', buyer_id);
    if (updateError) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to save enriched data' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true, enriched_data: enrichedData, fields_updated: fieldsUpdated,
      message: fieldsUpdated.length > 0 ? `Perfil enriquecido: ${fieldsUpdated.length} campos actualizados` : 'Solo metadatos actualizados',
      source_url: formattedUrl,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Enrichment error:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
      return new Response(
        JSON.stringify({ success: false, error: 'buyer_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'OPENAI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current buyer data
    const { data: buyer, error: buyerError } = await supabase
      .from('corporate_buyers')
      .select('*')
      .eq('id', buyer_id)
      .single();

    if (buyerError || !buyer) {
      return new Response(
        JSON.stringify({ success: false, error: 'Buyer not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!buyer.website) {
      return new Response(
        JSON.stringify({ success: false, error: 'Buyer has no website configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Enriching buyer: ${buyer.name} (${buyer.website})`);

    // Step 1: Scrape website with Firecrawl
    let formattedUrl = buyer.website.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Error interno del servidor.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    
    if (!markdown || markdown.length < 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Website content too short or empty' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraped ${markdown.length} chars from website`);

    // Step 2: Extract structured data with AI
    const systemPrompt = `Eres un experto en M&A corporativo. Analiza el contenido web de un comprador estratégico y extrae información relevante para identificar su perfil de adquisición.

El comprador actual es: "${buyer.name}"
${buyer.country_base ? `País base: ${buyer.country_base}` : ''}
${buyer.buyer_type ? `Tipo actual: ${buyer.buyer_type}` : ''}

Responde SOLO con JSON válido (sin markdown, sin \`\`\`):
{
  "description": "Descripción profesional en ESPAÑOL. Enfócate en: qué hace la empresa, tamaño, mercados, fortalezas. Máximo 800 caracteres. Si no hay info suficiente, null.",
  "sector_focus": ["sectores donde buscan adquisiciones o donde operan"],
  "search_keywords": ["palabras clave para matching con targets - productos, servicios, tecnologías"],
  "key_highlights": ["3-5 puntos diferenciadores clave de la empresa"],
  "investment_thesis": "Tesis de inversión inferida si es detectable (qué buscan comprar y por qué), null si no es claro",
  "buyer_type_suggestion": "corporate|family_office|pe_fund|strategic_buyer|holding - basado en el contenido",
  "geography_inferred": ["países o regiones donde operan o buscan targets"],
  "estimated_revenue": "Rango de facturación si se menciona (ej: '50-100M€'), null si no",
  "acquisition_history": ["lista de adquisiciones previas mencionadas, vacío si no hay"]
}

IMPORTANTE:
- Solo incluye información que puedas extraer con confianza del contenido
- Si un campo no tiene información clara, usa null o array vacío
- La descripción DEBE estar en español
- Los sectores deben ser específicos (ej: "software logístico", no solo "tecnología")`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analiza este contenido web:\n\n${markdown.substring(0, 15000)}` }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const aiError = await aiResponse.text();
      console.error('OpenAI error:', aiError);
      return new Response(
        JSON.stringify({ success: false, error: 'AI extraction failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI raw response:', rawContent.substring(0, 500));

    let enrichedData: EnrichmentResult;
    try {
      // Clean potential markdown formatting
      const cleanedContent = rawContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      enrichedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to parse AI extraction results',
          raw_response: rawContent.substring(0, 500)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If preview only, return the extracted data without saving
    if (preview_only) {
      return new Response(
        JSON.stringify({
          success: true,
          preview: true,
          enriched_data: enrichedData,
          current_data: {
            description: buyer.description,
            sector_focus: buyer.sector_focus,
            search_keywords: buyer.search_keywords,
            key_highlights: buyer.key_highlights,
            investment_thesis: buyer.investment_thesis,
            buyer_type: buyer.buyer_type,
            geography_focus: buyer.geography_focus,
          },
          source_url: formattedUrl,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Prepare update object
    const fieldsToUpdate: Record<string, any> = {};
    const fieldsUpdated: string[] = [];

    // Only update empty fields unless force=true
    if (enrichedData.description && (force || !buyer.description)) {
      fieldsToUpdate.description = enrichedData.description;
      fieldsUpdated.push('description');
    }

    if (enrichedData.sector_focus?.length && (force || !buyer.sector_focus?.length)) {
      fieldsToUpdate.sector_focus = enrichedData.sector_focus;
      fieldsUpdated.push('sector_focus');
    }

    if (enrichedData.search_keywords?.length && (force || !buyer.search_keywords?.length)) {
      fieldsToUpdate.search_keywords = enrichedData.search_keywords;
      fieldsUpdated.push('search_keywords');
    }

    if (enrichedData.key_highlights?.length && (force || !buyer.key_highlights?.length)) {
      fieldsToUpdate.key_highlights = enrichedData.key_highlights;
      fieldsUpdated.push('key_highlights');
    }

    if (enrichedData.investment_thesis && (force || !buyer.investment_thesis)) {
      fieldsToUpdate.investment_thesis = enrichedData.investment_thesis;
      fieldsUpdated.push('investment_thesis');
    }

    if (enrichedData.geography_inferred?.length && (force || !buyer.geography_focus?.length)) {
      fieldsToUpdate.geography_focus = enrichedData.geography_inferred;
      fieldsUpdated.push('geography_focus');
    }

    // Always update metadata
    fieldsToUpdate.enriched_at = new Date().toISOString();
    fieldsToUpdate.enriched_data = enrichedData;
    fieldsToUpdate.enrichment_source = formattedUrl;
    fieldsToUpdate.updated_at = new Date().toISOString();

    // Step 4: Update database
    const { error: updateError } = await supabase
      .from('corporate_buyers')
      .update(fieldsToUpdate)
      .eq('id', buyer_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save enriched data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully enriched buyer. Updated fields: ${fieldsUpdated.join(', ')}`);

    return new Response(
      JSON.stringify({
        success: true,
        enriched_data: enrichedData,
        fields_updated: fieldsUpdated,
        message: fieldsUpdated.length > 0 
          ? `Perfil enriquecido: ${fieldsUpdated.length} campos actualizados`
          : 'Perfil ya estaba completo, solo se actualizaron metadatos',
        source_url: formattedUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Enrichment error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

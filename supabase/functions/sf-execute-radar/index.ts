/**
 * SF Execute Radar - Execute search queries using Firecrawl
 * Searches for Search Fund leads and filters by relevance using AI
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
}

interface RelevanceResult {
  is_relevant: boolean;
  entity_type: string;
  stage: string;
  confidence: number;
  reason: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query_id, limit = 10 } = await req.json();

    if (!query_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'query_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!lovableKey && !openaiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'No AI API key configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the query details
    const { data: searchQuery, error: queryError } = await supabase
      .from('sf_search_queries')
      .select('*')
      .eq('id', query_id)
      .single();

    if (queryError || !searchQuery) {
      return new Response(
        JSON.stringify({ success: false, error: 'Search query not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sf-execute-radar] Executing query: "${searchQuery.query_text}" (${searchQuery.country_code})`);

    // Execute Firecrawl search
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery.query_text,
        limit,
        lang: searchQuery.language || 'en',
        country: searchQuery.country_code || 'ES',
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok || !searchData.success) {
      console.error('[sf-execute-radar] Firecrawl search failed:', searchData);
      return new Response(
        JSON.stringify({ success: false, error: 'Search failed', details: searchData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: SearchResult[] = searchData.data || [];
    console.log(`[sf-execute-radar] Found ${results.length} results`);

    // Process each result for relevance
    let relevantCount = 0;
    let processedCount = 0;
    const errors: string[] = [];

    for (const result of results) {
      try {
        processedCount++;

        // Create URL hash for deduplication
        const urlHash = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(result.url)
        ).then(hash => 
          Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
        );

        // Check if URL already exists
        const { data: existing } = await supabase
          .from('sf_scraped_urls')
          .select('id')
          .eq('url_hash', urlHash)
          .maybeSingle();

        if (existing) {
          console.log(`[sf-execute-radar] URL already exists: ${result.url}`);
          continue;
        }

        // Extract domain
        let domain = '';
        try {
          domain = new URL(result.url).hostname.replace('www.', '');
        } catch {}

        // Use AI to check relevance (prefer Lovable AI for cost saving)
        const relevanceResult = await checkRelevanceWithAI(
          result.url,
          result.title,
          result.description,
          result.markdown,
          lovableKey,
          openaiKey
        );

        // Save to sf_scraped_urls
        const { error: insertError } = await supabase
          .from('sf_scraped_urls')
          .insert({
            url: result.url,
            url_hash: urlHash,
            domain,
            query_id,
            raw_title: result.title,
            raw_snippet: result.description,
            raw_content: result.markdown?.substring(0, 50000),
            is_relevant: relevanceResult.is_relevant,
            entity_type: relevanceResult.entity_type,
            stage: relevanceResult.stage,
            confidence: relevanceResult.confidence,
            extraction_status: relevanceResult.is_relevant ? 'pending' : 'skipped',
          });

        if (insertError) {
          console.error(`[sf-execute-radar] Insert error:`, insertError);
          errors.push(`Insert error for ${result.url}: ${insertError.message}`);
        } else if (relevanceResult.is_relevant) {
          relevantCount++;
        }

      } catch (error) {
        console.error(`[sf-execute-radar] Error processing ${result.url}:`, error);
        errors.push(`Error processing ${result.url}: ${error.message}`);
      }
    }

    // Update query execution timestamp
    await supabase
      .from('sf_search_queries')
      .update({
        last_executed_at: new Date().toISOString(),
        last_results_count: results.length,
      })
      .eq('id', query_id);

    console.log(`[sf-execute-radar] Complete: ${processedCount} processed, ${relevantCount} relevant, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          query_id,
          query_text: searchQuery.query_text,
          total_results: results.length,
          processed: processedCount,
          relevant: relevantCount,
          errors: errors.length > 0 ? errors : undefined,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sf-execute-radar] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Check URL relevance using AI (hybrid: prefer Lovable, fallback to OpenAI)
 */
async function checkRelevanceWithAI(
  url: string,
  title: string,
  snippet: string,
  markdown: string | undefined,
  lovableKey: string | undefined,
  openaiKey: string | undefined
): Promise<RelevanceResult> {
  const systemPrompt = `Actúa como clasificador de leads para una base de datos de compradores tipo Search Fund/ETA en Europa.

Tarea:
1) Determina si esta página describe (a) un search fund/searcher activo, (b) un programa/operator-led/holding de ETA, o (c) no es relevante.
2) Si NO es relevante, explica por qué (en 1-2 frases).
3) Si SÍ es relevante, clasifica el tipo y la etapa si hay señales.

Reglas:
- No adivines. Si no hay evidencia, usa "unknown".
- No confundas "search fund report/centro académico" con un buyer.
- Considera relevante si hay señales como: "looking to acquire", "acquisition criteria", "investment criteria", "searching for a company", "fondo de búsqueda para adquirir".

Responde SOLO con JSON:
{
  "is_relevant": true|false,
  "entity_type": "traditional_search_fund|self_funded_search|operator_led|holding_company|community_or_report|pe_fund|other|unknown",
  "stage": "fundraising|searching|under_offer|acquired|inactive|unknown",
  "confidence": 0-100,
  "reason": "..."
}`;

  const content = markdown || snippet || '';
  const userPrompt = `URL: ${url}
Título: ${title || ''}
Snippet: ${snippet || ''}
Contenido (markdown): ${content.substring(0, 6000)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  // Try Lovable AI first (free tier)
  if (lovableKey) {
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result;
      }
      console.warn('[sf-execute-radar] Lovable AI failed, trying OpenAI...');
    } catch (error) {
      console.warn('[sf-execute-radar] Lovable AI error:', error);
    }
  }

  // Fallback to OpenAI
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return result;
      }
    } catch (error) {
      console.error('[sf-execute-radar] OpenAI error:', error);
    }
  }

  // Default fallback if both fail
  return {
    is_relevant: false,
    entity_type: 'unknown',
    stage: 'unknown',
    confidence: 0,
    reason: 'AI classification failed',
  };
}

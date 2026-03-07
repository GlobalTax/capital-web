import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query_id, limit = 10 } = await req.json();
    if (!query_id) {
      return new Response(JSON.stringify({ success: false, error: 'query_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: searchQuery, error: queryError } = await supabase.from('sf_search_queries').select('*').eq('id', query_id).single();
    if (queryError || !searchQuery) {
      return new Response(JSON.stringify({ success: false, error: 'Search query not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const langMap: Record<string, string> = { 'ES': 'es', 'FR': 'fr', 'DE': 'de', 'IT': 'it', 'PT': 'pt', 'NL': 'nl' };
    const lang = langMap[searchQuery.country_code] || 'en';

    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST', headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery.query, limit, lang, country: searchQuery.country_code || 'ES', scrapeOptions: { formats: ['markdown'], onlyMainContent: true } }),
    });
    const searchData = await searchResponse.json();
    if (!searchResponse.ok || !searchData.success) {
      return new Response(JSON.stringify({ success: false, error: 'Search failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results = searchData.data || [];
    let relevantCount = 0, processedCount = 0;
    const errors: string[] = [];

    for (const result of results) {
      try {
        processedCount++;
        const urlHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(result.url))
          .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join(''));

        const { data: existing } = await supabase.from('sf_scraped_urls').select('id').eq('url_hash', urlHash).maybeSingle();
        if (existing) continue;

        let domain = '';
        try { domain = new URL(result.url).hostname.replace('www.', ''); } catch {}

        // Use AI helper for relevance check
        let relevanceResult = { is_relevant: false, entity_type: 'unknown', stage: 'unknown', confidence: 0, reason: 'AI classification failed' };
        try {
          const aiResponse = await callAI(
            [
              { role: 'system', content: `Clasificador de leads Search Fund/ETA. Responde JSON: {"is_relevant","entity_type","stage","confidence","reason"}` },
              { role: 'user', content: `URL: ${result.url}\nTítulo: ${result.title}\nSnippet: ${result.description}\nContenido: ${(result.markdown || '').substring(0, 6000)}` }
            ],
            { functionName: 'sf-execute-radar', temperature: 0.2, jsonMode: true }
          );
          relevanceResult = parseAIJson(aiResponse.content);
        } catch (e) { console.warn('[sf-execute-radar] AI classification failed:', e); }

        await supabase.from('sf_scraped_urls').insert({
          url: result.url, url_hash: urlHash, domain, query_id,
          raw_title: result.title, raw_snippet: result.description, raw_content: result.markdown?.substring(0, 50000),
          is_relevant: relevanceResult.is_relevant, entity_type: relevanceResult.entity_type,
          stage: relevanceResult.stage, confidence: relevanceResult.confidence,
          extraction_status: relevanceResult.is_relevant ? 'pending' : 'skipped',
        });
        if (relevanceResult.is_relevant) relevantCount++;
      } catch (error: any) {
        errors.push(`Error: ${error.message}`);
      }
    }

    await supabase.from('sf_search_queries').update({ last_executed_at: new Date().toISOString(), results_count: results.length }).eq('id', query_id);

    return new Response(JSON.stringify({ success: true, data: { query_id, total_results: results.length, processed: processedCount, relevant: relevantCount, errors: errors.length > 0 ? errors : undefined } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('[sf-execute-radar] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

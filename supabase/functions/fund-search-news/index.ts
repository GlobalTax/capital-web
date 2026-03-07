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
    const { fund_id, fund_type, custom_query, limit = 10 } = await req.json();
    if (!fund_id || !fund_type) {
      return new Response(JSON.stringify({ success: false, error: 'fund_id and fund_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const tableName = fund_type === 'sf' ? 'sf_funds' : 'cr_funds';
    const { data: fund, error: fundError } = await supabase.from(tableName).select('*').eq('id', fund_id).single();
    if (fundError || !fund) {
      return new Response(JSON.stringify({ success: false, error: 'Fund not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const fundName = fund.name;
    const searchQueries = custom_query ? [custom_query] : [
      `"${fundName}" adquisición OR compra OR inversión`,
      `"${fundName}" cierra operación OR deal closed`,
      `"${fundName}" portfolio OR cartera empresa`,
    ];

    const allResults: any[] = [];
    for (const query of searchQueries) {
      try {
        const res = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST', headers: { 'Authorization': `Bearer ${firecrawlApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: Math.ceil(limit / searchQueries.length), lang: 'es', country: 'ES', tbs: 'qdr:y' }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          for (const r of data.data) {
            if (!allResults.some(x => x.url === r.url)) {
              allResults.push({ title: r.title || 'Sin título', url: r.url, description: r.description || '', source: new URL(r.url).hostname });
            }
          }
        }
      } catch (e) { console.error(`Search failed: ${query}`, e); }
    }

    let processedNews: any[] = [];
    if (allResults.length > 0) {
      try {
        const response = await callAI(
          [
            { role: 'system', content: `Analista M&A. Clasifica resultados sobre "${fundName}". JSON array: [{"title","url","source_name","content_preview","news_type","relevance_score","is_material_change"}]. Solo relevantes (score >= 5).` },
            { role: 'user', content: JSON.stringify(allResults) }
          ],
          { functionName: 'fund-search-news', temperature: 0.1 }
        );
        processedNews = parseAIJson(response.content);
      } catch { processedNews = allResults.map(r => ({ title: r.title, url: r.url, source_name: r.source, content_preview: r.description, news_type: 'other', relevance_score: 5, is_material_change: false })); }
    }

    let savedCount = 0;
    for (const news of processedNews) {
      const { error } = await supabase.from('fund_news').upsert({
        fund_id, fund_type, title: news.title, url: news.url, source_name: news.source_name,
        content_preview: news.content_preview, news_type: news.news_type, relevance_score: news.relevance_score,
        is_material_change: news.is_material_change, news_date: new Date().toISOString(),
      }, { onConflict: 'fund_id,fund_type,url', ignoreDuplicates: true });
      if (!error) savedCount++;
    }

    return new Response(JSON.stringify({ success: true, data: { fund_id, fund_type, fund_name: fundName, total_results: allResults.length, saved_count: savedCount, news: processedNews } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Error in fund-search-news:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Fund {
  id: string;
  name: string;
  website: string;
  last_news_scan_at: string | null;
  is_active: boolean;
}

interface NewsArticle {
  title: string;
  url: string;
  description: string;
  source: string;
}

interface ProcessedNewsArticle {
  title: string;
  url: string;
  source_name: string;
  content_preview: string;
  news_type: string;
  relevance_score: number;
  is_material_change: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let limit = 50, prioritize_active = true;
    try { const body = await req.json(); limit = body.limit || limit; prioritize_active = body.prioritize_active ?? prioritize_active; } catch { }

    let query = supabase.from('cr_funds').select('id, name, website, last_news_scan_at').not('website', 'is', null).neq('website', '');
    if (prioritize_active) query = query.eq('is_active', true);
    query = query.order('last_news_scan_at', { ascending: true, nullsFirst: true }).limit(limit);

    const { data: funds, error: fundsError } = await query;
    if (fundsError || !funds?.length) {
      return new Response(JSON.stringify({ success: true, message: 'No funds to scan', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results: any[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < funds.length; i += BATCH_SIZE) {
      const batch = funds.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(async (fund) => {
        try {
          const result = await searchFundNews(fund.id, fund.name, firecrawlApiKey, supabase);
          await supabase.from('cr_funds').update({ last_news_scan_at: new Date().toISOString() }).eq('id', fund.id);
          return result;
        } catch (error: any) {
          return { fund_id: fund.id, fund_name: fund.name, news_count: 0, error: error.message };
        }
      }));
      results.push(...batchResults);
      if (i + BATCH_SIZE < funds.length) await new Promise(r => setTimeout(r, 2000));
    }

    const totalNews = results.reduce((s, r) => s + r.news_count, 0);
    if (totalNews > 0) {
      await supabase.from('admin_notifications').insert({
        type: 'fund_news', title: `🗞️ Scan semanal CR: ${totalNews} noticias`,
        message: `Se escanearon ${results.filter(r => !r.error).length} fondos.`,
        metadata: { scan_type: 'weekly_cr_news', total_news: totalNews },
      });
    }

    return new Response(JSON.stringify({ success: true, data: { funds_scanned: funds.length, total_news_found: totalNews, results } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Error in cr-weekly-news-scan:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function searchFundNews(fundId: string, fundName: string, firecrawlApiKey: string, supabase: any) {
  const searchQueries = [`\"${fundName}\" adquisición OR compra OR inversión`, `\"${fundName}\" cierra operación OR deal closed`];
  const allResults: any[] = [];

  for (const q of searchQueries) {
    try {
      const res = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST', headers: { 'Authorization': `Bearer ${firecrawlApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 5, lang: 'es', country: 'ES', tbs: 'qdr:w' }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        for (const r of data.data) {
          if (!allResults.some(x => x.url === r.url)) {
            allResults.push({ title: r.title || 'Sin título', url: r.url, description: r.description || '', source: new URL(r.url).hostname });
          }
        }
      }
    } catch (e) { console.error(`Search failed for ${fundName}:`, e); }
  }

  if (!allResults.length) return { fund_id: fundId, fund_name: fundName, news_count: 0 };

  let processedNews: any[] = [];
  try {
    const response = await callAI(
      [
        { role: 'system', content: `Eres un analista de M&A. Analiza resultados sobre \"${fundName}\". Responde SOLO con JSON array: [{\\"title\\\",\\\"url\\\",\\\"source_name\\\",\\\"content_preview\\\",\\\"news_type\\\",\\\"relevance_score\\\",\\\"is_material_change\\\"}]. Solo relevantes (score >= 6).` },
        { role: 'user', content: JSON.stringify(allResults) }
      ],
      { functionName: 'cr-weekly-news-scan', temperature: 0.2, maxTokens: 2000 }
    );
    processedNews = parseAIJson(response.content);
  } catch { console.warn('[cr-weekly-news-scan] AI classification failed'); }

  let savedCount = 0;
  for (const news of processedNews) {
    const { error } = await supabase.from('fund_news').upsert({
      fund_id: fundId, fund_type: 'cr', title: news.title, url: news.url, source_name: news.source_name,
      content_preview: news.content_preview, news_type: news.news_type, relevance_score: news.relevance_score,
      is_material_change: news.is_material_change, news_date: new Date().toISOString(),
    }, { onConflict: 'fund_id,fund_type,url', ignoreDuplicates: true });
    if (!error) savedCount++;
  }

  return { fund_id: fundId, fund_name: fundName, news_count: savedCount };
}

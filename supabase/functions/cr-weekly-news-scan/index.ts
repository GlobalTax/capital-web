import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FundNewsResult {
  fund_id: string;
  fund_name: string;
  news_count: number;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse optional parameters
    let limit = 50; // Default: process 50 funds per run
    let prioritize_active = true;
    
    try {
      const body = await req.json();
      limit = body.limit || limit;
      prioritize_active = body.prioritize_active ?? prioritize_active;
    } catch {
      // No body provided, use defaults
    }

    console.log(`Starting weekly CR news scan. Limit: ${limit}, Prioritize active: ${prioritize_active}`);

    // Get CR funds to scan
    // Prioritize: active funds with website, ordered by last news scan date
    let query = supabase
      .from('cr_funds')
      .select('id, name, website, last_news_scan_at')
      .not('website', 'is', null)
      .neq('website', '');

    if (prioritize_active) {
      query = query.eq('is_active', true);
    }

    // Order by last scan (null first = never scanned), then by name
    query = query
      .order('last_news_scan_at', { ascending: true, nullsFirst: true })
      .limit(limit);

    const { data: funds, error: fundsError } = await query;

    if (fundsError) {
      console.error('Error fetching funds:', fundsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch funds' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!funds || funds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No funds to scan', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${funds.length} funds to scan for news`);

    const results: FundNewsResult[] = [];
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

    // Process in batches to avoid rate limits
    for (let i = 0; i < funds.length; i += BATCH_SIZE) {
      const batch = funds.slice(i, i + BATCH_SIZE);
      
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(funds.length / BATCH_SIZE)}`);

      const batchPromises = batch.map(async (fund) => {
        try {
          const result = await searchFundNews(
            fund.id,
            fund.name,
            firecrawlApiKey,
            openaiApiKey,
            supabase
          );
          
          // Update last scan timestamp
          await supabase
            .from('cr_funds')
            .update({ last_news_scan_at: new Date().toISOString() })
            .eq('id', fund.id);

          return result;
        } catch (error) {
          console.error(`Error scanning fund ${fund.name}:`, error);
          return {
            fund_id: fund.id,
            fund_name: fund.name,
            news_count: 0,
            error: error.message || 'Unknown error',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < funds.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    const totalNews = results.reduce((sum, r) => sum + r.news_count, 0);
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;

    console.log(`Weekly scan complete. Funds scanned: ${funds.length}, News found: ${totalNews}, Errors: ${errorCount}`);

    // Log to admin notifications if significant news found
    if (totalNews > 0) {
      await supabase.from('admin_notifications').insert({
        type: 'fund_news',
        title: `🗞️ Scan semanal CR: ${totalNews} noticias encontradas`,
        message: `Se escanearon ${successCount} fondos y se encontraron ${totalNews} noticias relevantes.`,
        metadata: {
          scan_type: 'weekly_cr_news',
          funds_scanned: successCount,
          total_news: totalNews,
          errors: errorCount,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          funds_scanned: funds.length,
          successful: successCount,
          errors: errorCount,
          total_news_found: totalNews,
          results,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cr-weekly-news-scan:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function searchFundNews(
  fundId: string,
  fundName: string,
  firecrawlApiKey: string,
  openaiApiKey: string | undefined,
  supabase: any
): Promise<FundNewsResult> {
  const searchQueries = [
    `"${fundName}" adquisición OR compra OR inversión`,
    `"${fundName}" cierra operación OR deal closed`,
  ];

  const allResults: Array<{
    title: string;
    url: string;
    description: string;
    source: string;
  }> = [];

  // Search with each query
  for (const query of searchQueries) {
    try {
      const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 5,
          lang: 'es',
          country: 'ES',
          tbs: 'qdr:w', // Last week only for weekly scan
        }),
      });

      const searchData = await searchResponse.json();

      if (searchResponse.ok && searchData.success && searchData.data) {
        for (const result of searchData.data) {
          if (!allResults.some(r => r.url === result.url)) {
            allResults.push({
              title: result.title || 'Sin título',
              url: result.url,
              description: result.description || '',
              source: new URL(result.url).hostname,
            });
          }
        }
      }
    } catch (e) {
      console.error(`Search query failed for ${fundName}: ${query}`, e);
    }
  }

  if (allResults.length === 0) {
    return { fund_id: fundId, fund_name: fundName, news_count: 0 };
  }

  // Use AI to filter and classify results
  let processedNews: Array<{
    title: string;
    url: string;
    source_name: string;
    content_preview: string;
    news_type: string;
    relevance_score: number;
    is_material_change: boolean;
  }> = [];

  if (openaiApiKey) {
    try {
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-nano-2025-08-07',
          messages: [
            { 
              role: 'system', 
              content: `Eres un analista de M&A. Analiza estos resultados sobre el fondo "${fundName}".
Responde SOLO con JSON array:
[{
  "title": "título",
  "url": "url",
  "source_name": "medio",
  "content_preview": "resumen breve",
  "news_type": "acquisition|fundraising|exit|team|partnership|other",
  "relevance_score": 1-10,
  "is_material_change": true/false
}]
Solo noticias relevantes (score >= 6). Array vacío si ninguna es relevante.`
            },
            { role: 'user', content: JSON.stringify(allResults) }
          ],
          max_completion_tokens: 2000,
        }),
      });

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;
      
      if (content) {
        try {
          processedNews = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
        } catch {
          // Fallback: skip AI classification
        }
      }
    } catch (aiError) {
      console.error('AI classification failed:', aiError);
    }
  }

  // Save news to database
  let savedCount = 0;
  for (const news of processedNews) {
    const { error: insertError } = await supabase
      .from('fund_news')
      .upsert({
        fund_id: fundId,
        fund_type: 'cr',
        title: news.title,
        url: news.url,
        source_name: news.source_name,
        content_preview: news.content_preview,
        news_type: news.news_type,
        relevance_score: news.relevance_score,
        is_material_change: news.is_material_change,
        news_date: new Date().toISOString(),
      }, {
        onConflict: 'fund_id,fund_type,url',
        ignoreDuplicates: true,
      });

    if (!insertError) {
      savedCount++;
    }
  }

  return { fund_id: fundId, fund_name: fundName, news_count: savedCount };
}

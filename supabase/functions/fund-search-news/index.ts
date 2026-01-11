import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  fund_id: string;
  fund_type: 'sf' | 'cr';
  custom_query?: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fund_id, fund_type, custom_query, limit = 10 } = await req.json() as SearchRequest;

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

    const fundName = fund.name;
    
    // Build search queries
    const searchQueries = custom_query 
      ? [custom_query]
      : [
          `"${fundName}" adquisición OR compra OR inversión`,
          `"${fundName}" cierra operación OR deal closed`,
          `"${fundName}" portfolio OR cartera empresa`,
        ];

    console.log(`Searching news for ${fund_type} fund: ${fundName}`);

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
            limit: Math.ceil(limit / searchQueries.length),
            lang: 'es',
            country: 'ES',
            tbs: 'qdr:y', // Last year
          }),
        });

        const searchData = await searchResponse.json();

        if (searchResponse.ok && searchData.success && searchData.data) {
          for (const result of searchData.data) {
            // Avoid duplicates
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
        console.error(`Search query failed: ${query}`, e);
      }
    }

    // Use AI to filter and classify results
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let processedNews: Array<{
      title: string;
      url: string;
      source_name: string;
      content_preview: string;
      news_type: string;
      relevance_score: number;
      is_material_change: boolean;
    }> = [];

    if (openaiApiKey && allResults.length > 0) {
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
              { 
                role: 'system', 
                content: `Eres un analista de M&A. Analiza estos resultados de búsqueda sobre el fondo "${fundName}" y clasifícalos.
Responde SOLO con un JSON array con esta estructura para cada resultado relevante:
[{
  "title": "título original",
  "url": "url original",
  "source_name": "nombre del medio",
  "content_preview": "resumen breve de 1-2 líneas",
  "news_type": "acquisition|fundraising|exit|team|partnership|other",
  "relevance_score": 1-10,
  "is_material_change": true/false (si es una operación concreta)
}]
Incluye solo noticias realmente relacionadas con el fondo (relevance >= 5). Excluye resultados genéricos o no relacionados.`
              },
              { 
                role: 'user', 
                content: `Resultados de búsqueda:\n${JSON.stringify(allResults, null, 2)}` 
              }
            ],
            temperature: 0.1,
          }),
        });

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        
        if (content) {
          try {
            processedNews = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
          } catch (e) {
            console.error('Failed to parse AI response:', e);
            // Fallback: use raw results
            processedNews = allResults.map(r => ({
              title: r.title,
              url: r.url,
              source_name: r.source,
              content_preview: r.description,
              news_type: 'other' as const,
              relevance_score: 5,
              is_material_change: false,
            }));
          }
        }
      } catch (aiError) {
        console.error('AI classification failed:', aiError);
      }
    } else {
      // No AI, use raw results
      processedNews = allResults.map(r => ({
        title: r.title,
        url: r.url,
        source_name: r.source,
        content_preview: r.description,
        news_type: 'other' as const,
        relevance_score: 5,
        is_material_change: false,
      }));
    }

    // Save news to database
    let savedCount = 0;
    for (const news of processedNews) {
      const { error: insertError } = await supabase
        .from('fund_news')
        .upsert({
          fund_id,
          fund_type,
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

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          fund_id,
          fund_type,
          fund_name: fundName,
          total_results: allResults.length,
          processed_news: processedNews.length,
          saved_count: savedCount,
          news: processedNews,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fund-search-news:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

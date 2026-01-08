import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Spanish M&A news sources - will rotate through these
const NEWS_SOURCES = [
  {
    id: 0,
    name: 'Expansión',
    searchQuery: 'fusiones adquisiciones M&A compra empresa site:expansion.com',
    keywords: ['fusión', 'adquisición', 'M&A', 'compra', 'venta', 'private equity', 'capital riesgo', 'OPA']
  },
  {
    id: 1,
    name: 'El Economista',
    searchQuery: 'M&A fusiones adquisiciones private equity site:eleconomista.es',
    keywords: ['fusión', 'adquisición', 'M&A', 'compra', 'venta', 'private equity', 'venture capital']
  },
  {
    id: 2,
    name: 'Capital & Corporate',
    searchQuery: 'M&A fusiones adquisiciones operaciones site:capitalandcorporate.com',
    keywords: ['M&A', 'fusión', 'adquisición', 'private equity', 'venture capital', 'operación']
  },
  {
    id: 3,
    name: 'Cinco Días',
    searchQuery: 'fusiones adquisiciones empresas compra site:cincodias.elpais.com',
    keywords: ['fusión', 'adquisición', 'M&A', 'compra', 'venta', 'OPA', 'private equity']
  },
  {
    id: 4,
    name: 'El Confidencial',
    searchQuery: 'M&A fusiones adquisiciones private equity site:elconfidencial.com',
    keywords: ['fusión', 'adquisición', 'M&A', 'compra', 'venta', 'private equity', 'fondo']
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get source from request body or rotate based on time
    let requestedSource: number | undefined;
    try {
      const body = await req.json();
      requestedSource = body?.source_index;
    } catch {
      // No body or invalid JSON, use rotation
    }

    let sourceIndex: number;
    if (requestedSource !== undefined && requestedSource >= 0 && requestedSource < NEWS_SOURCES.length) {
      sourceIndex = requestedSource;
    } else {
      // Rotate based on hour and day
      const currentHour = new Date().getUTCHours();
      if (currentHour >= 0 && currentHour < 6) {
        sourceIndex = 0;
      } else if (currentHour >= 6 && currentHour < 12) {
        sourceIndex = 1;
      } else if (currentHour >= 12 && currentHour < 18) {
        sourceIndex = 2;
      } else {
        sourceIndex = 3;
      }
      const dayOfWeek = new Date().getUTCDay();
      sourceIndex = (sourceIndex + dayOfWeek) % NEWS_SOURCES.length;
    }

    const source = NEWS_SOURCES[sourceIndex];
    const allNews: any[] = [];

    console.log(`🔍 Fetching M&A news from: ${source.name} (source ${sourceIndex + 1}/${NEWS_SOURCES.length})`);

    try {
      // Use Firecrawl search API
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: source.searchQuery,
          limit: 8,
          lang: 'es',
          country: 'ES',
          tbs: 'qdr:d', // Last 24 hours
          scrapeOptions: {
            formats: ['markdown']
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Firecrawl search failed:`, response.status, errorText);
        return new Response(
          JSON.stringify({ success: false, error: `Firecrawl error: ${response.status}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log(`📰 Firecrawl returned ${data.data?.length || 0} results`);

      if (data.success && data.data) {
        for (const result of data.data) {
          // Check if article is M&A related based on keywords
          const content = (result.markdown || result.description || '').toLowerCase();
          const title = (result.title || '').toLowerCase();

          const isMARelated = source.keywords.some(keyword =>
            content.includes(keyword.toLowerCase()) ||
            title.includes(keyword.toLowerCase())
          );

          if (isMARelated && result.title && result.url) {
            allNews.push({
              source_name: source.name,
              source_url: result.url,
              title: result.title,
              content: result.markdown || result.description || '',
              fetched_at: new Date().toISOString()
            });
          }
        }
      }

      console.log(`✅ Found ${allNews.length} relevant M&A articles`);

    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store news, checking for duplicates
    let insertedCount = 0;
    if (allNews.length > 0) {
      const urls = allNews.map(n => n.source_url);
      const { data: existingNews } = await supabase
        .from('news_articles')
        .select('source_url')
        .in('source_url', urls);

      const existingUrls = new Set((existingNews || []).map(n => n.source_url));
      const newArticles = allNews.filter(n => !existingUrls.has(n.source_url));

      console.log(`📝 New articles to insert: ${newArticles.length} (${existingUrls.size} duplicates skipped)`);

      if (newArticles.length > 0) {
        // Determine category based on content
        const categorizeArticle = (content: string, title: string): string => {
          const text = (content + ' ' + title).toLowerCase();
          if (text.includes('private equity') || text.includes('capital riesgo')) return 'Private Equity';
          if (text.includes('venture capital') || text.includes('startup') || text.includes('ronda')) return 'Venture Capital';
          if (text.includes('opa') || text.includes('oferta pública')) return 'OPA';
          if (text.includes('reestructuración') || text.includes('concurso')) return 'Reestructuración';
          return 'M&A';
        };

        const articlesToInsert = newArticles.map(article => ({
          title: article.title?.substring(0, 255) || 'Sin título',
          slug: article.title?.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100) + '-' + Date.now(),
          content: article.content || '',
          excerpt: article.content?.substring(0, 200)?.replace(/\n/g, ' ')?.trim() || '',
          source_name: article.source_name,
          source_url: article.source_url,
          category: categorizeArticle(article.content || '', article.title || ''),
          is_published: false, // Needs admin approval
          is_featured: false,
          fetched_at: article.fetched_at,
          is_processed: false
        }));

        const { error: insertError } = await supabase
          .from('news_articles')
          .insert(articlesToInsert);

        if (insertError) {
          console.error('Error inserting news:', insertError);
        } else {
          insertedCount = articlesToInsert.length;
          console.log(`✅ Inserted ${insertedCount} new articles from ${source.name}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: source.name,
        source_index: sourceIndex,
        found: allNews.length,
        inserted: insertedCount,
        message: `Fetched ${allNews.length} articles from ${source.name}, inserted ${insertedCount} new`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-ma-news:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Spanish M&A news sources
const NEWS_SOURCES = [
  {
    name: 'Expansión M&A',
    url: 'https://www.expansion.com/empresas.html',
    keywords: ['fusiones', 'adquisiciones', 'M&A', 'compra', 'venta empresa', 'private equity', 'capital riesgo']
  },
  {
    name: 'Capital & Corporate',
    url: 'https://www.capitalandcorporate.com/',
    keywords: ['M&A', 'fusiones', 'adquisiciones', 'private equity', 'venture capital']
  },
  {
    name: 'El Economista',
    url: 'https://www.eleconomista.es/empresas-finanzas/',
    keywords: ['fusión', 'adquisición', 'OPA', 'compraventa', 'M&A']
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
    const allNews: any[] = [];

    console.log('Starting M&A news fetch from Spanish sources...');

    // Fetch news from each source using Firecrawl search
    for (const source of NEWS_SOURCES) {
      try {
        console.log(`Searching news from: ${source.name}`);
        
        // Use Firecrawl search API to find M&A related articles
        const searchQuery = `site:${new URL(source.url).hostname} ${source.keywords.slice(0, 3).join(' OR ')}`;
        
        const response = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 5,
            scrapeOptions: {
              formats: ['markdown']
            }
          }),
        });

        if (!response.ok) {
          console.error(`Firecrawl search failed for ${source.name}:`, response.status);
          continue;
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          for (const result of data.data) {
            // Check if article is M&A related based on keywords
            const content = (result.markdown || result.description || '').toLowerCase();
            const title = (result.title || '').toLowerCase();
            
            const isMARelated = source.keywords.some(keyword => 
              content.includes(keyword.toLowerCase()) || 
              title.includes(keyword.toLowerCase())
            );

            if (isMARelated) {
              allNews.push({
                source_name: source.name,
                source_url: result.url,
                title: result.title,
                content: result.markdown || result.description,
                fetched_at: new Date().toISOString(),
                is_processed: false
              });
            }
          }
        }

        console.log(`Found ${allNews.length} relevant articles so far`);
        
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
      }
    }

    console.log(`Total M&A news found: ${allNews.length}`);

    // Store raw news in temporary staging table
    if (allNews.length > 0) {
      // Check for duplicates based on URL
      const urls = allNews.map(n => n.source_url);
      const { data: existingNews } = await supabase
        .from('news_articles')
        .select('source_url')
        .in('source_url', urls);

      const existingUrls = new Set((existingNews || []).map(n => n.source_url));
      const newArticles = allNews.filter(n => !existingUrls.has(n.source_url));

      console.log(`New articles to process: ${newArticles.length}`);

      // Insert new articles as pending
      if (newArticles.length > 0) {
        const articlesToInsert = newArticles.map(article => ({
          title: article.title?.substring(0, 255) || 'Sin título',
          content: article.content || '',
          excerpt: article.content?.substring(0, 200) || '',
          source_name: article.source_name,
          source_url: article.source_url,
          category: 'M&A',
          is_published: false,
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
          console.log(`Inserted ${articlesToInsert.length} new articles`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fetched ${allNews.length} M&A news articles`,
        new_articles: allNews.length
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

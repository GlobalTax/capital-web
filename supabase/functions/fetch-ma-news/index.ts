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

// Generate SHA-256 hash for title deduplication
async function generateTitleHash(title: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(title.toLowerCase().trim().replace(/\s+/g, ' '));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

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
        
        // Create error notification
        await supabase.from('admin_notifications_news').insert({
          type: 'scrape_error',
          title: `Error en scraping: ${source.name}`,
          message: `Firecrawl devolvió error ${response.status}`,
          metadata: { source: source.name, status: response.status }
        });
        
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
      
      // Create error notification
      await supabase.from('admin_notifications_news').insert({
        type: 'scrape_error',
        title: `Error en scraping: ${source.name}`,
        message: error.message,
        metadata: { source: source.name, error: error.message }
      });
      
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store news, checking for duplicates by URL and title hash
    let insertedCount = 0;
    let duplicatesByHash = 0;
    
    if (allNews.length > 0) {
      // Generate hashes for all articles
      const articlesWithHash = await Promise.all(
        allNews.map(async (article) => ({
          ...article,
          title_hash: await generateTitleHash(article.title)
        }))
      );

      // Check for existing articles by URL
      const urls = articlesWithHash.map(n => n.source_url);
      const { data: existingByUrl } = await supabase
        .from('news_articles')
        .select('source_url')
        .in('source_url', urls);

      const existingUrls = new Set((existingByUrl || []).map(n => n.source_url));

      // Check for existing articles by title hash
      const hashes = articlesWithHash.map(n => n.title_hash);
      const { data: existingByHash } = await supabase
        .from('news_articles')
        .select('title_hash')
        .in('title_hash', hashes);

      const existingHashes = new Set((existingByHash || []).map(n => n.title_hash));

      // Filter out duplicates by URL or hash
      const newArticles = articlesWithHash.filter(n => {
        if (existingUrls.has(n.source_url)) return false;
        if (existingHashes.has(n.title_hash)) {
          duplicatesByHash++;
          console.log(`🔄 Duplicate by hash: "${n.title.substring(0, 50)}..."`);
          return false;
        }
        return true;
      });

      console.log(`📝 New articles to insert: ${newArticles.length} (${existingUrls.size} by URL, ${duplicatesByHash} by hash duplicates skipped)`);

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

        // Clean content from tracking pixels, markdown images, and junk
        const cleanContent = (text: string): string => {
          if (!text) return '';
          return text
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/https?:\/\/[^\s]*pixelcounter[^\s]*/g, '')
            .replace(/https?:\/\/[^\s]*permutive[^\s]*/g, '')
            .replace(/https?:\/\/[^\s]*tracking[^\s]*/g, '')
            .replace(/^https?:\/\/\S+\s*/gm, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim();
        };

        // Extract clean excerpt
        const extractExcerpt = (content: string, title: string): string => {
          const cleaned = cleanContent(content);
          const sentences = cleaned.split(/[.!?]\s+/);
          for (const sentence of sentences) {
            const trimmed = sentence.trim();
            if (trimmed.length >= 50 && 
                !trimmed.startsWith('http') && 
                !trimmed.startsWith('!') &&
                !trimmed.includes('pixelcounter') &&
                !trimmed.includes('blocked')) {
              return trimmed.substring(0, 200) + (trimmed.length > 200 ? '...' : '');
            }
          }
          return `Noticia sobre ${title.substring(0, 150)}...`;
        };

        const articlesToInsert = newArticles.map(article => ({
          title: article.title?.substring(0, 255) || 'Sin título',
          slug: article.title?.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100) + '-' + Date.now(),
          content: cleanContent(article.content || ''),
          excerpt: extractExcerpt(article.content || '', article.title || ''),
          source_name: article.source_name,
          source_url: article.source_url,
          title_hash: article.title_hash,
          category: categorizeArticle(article.content || '', article.title || ''),
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
          insertedCount = articlesToInsert.length;
          console.log(`✅ Inserted ${insertedCount} new articles from ${source.name}`);
          
          // Create notification for new pending articles
          if (insertedCount > 0) {
            await supabase.from('admin_notifications_news').insert({
              type: 'new_pending_news',
              title: `${insertedCount} noticias nuevas pendientes`,
              message: `Se importaron ${insertedCount} noticias de ${source.name}`,
              metadata: { 
                source: source.name, 
                count: insertedCount,
                duplicates_by_hash: duplicatesByHash
              }
            });
            console.log('📬 Admin notification created for new articles');
          }
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
        duplicates_by_hash: duplicatesByHash,
        message: `Fetched ${allNews.length} articles from ${source.name}, inserted ${insertedCount} new (${duplicatesByHash} hash duplicates)`
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
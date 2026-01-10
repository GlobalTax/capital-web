import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Spanish M&A news sources with optimized search queries
const NEWS_SOURCES = [
  {
    id: 0,
    name: 'Expansión',
    searchQuery: 'fusiones adquisiciones compra empresa site:expansion.com',
    altQuery: 'M&A private equity capital riesgo site:expansion.com',
    keywords: ['fusión', 'adquisición', 'M&A', 'compra', 'venta', 'private equity', 'capital riesgo', 'OPA', 'operación']
  },
  {
    id: 1,
    name: 'El Economista',
    searchQuery: 'fusiones adquisiciones private equity site:eleconomista.es',
    altQuery: 'M&A compra venta empresa site:eleconomista.es',
    keywords: ['fusión', 'adquisición', 'M&A', 'compra', 'venta', 'private equity', 'venture capital', 'operación']
  },
  {
    id: 2,
    name: 'Capital & Corporate',
    searchQuery: 'M&A fusiones adquisiciones site:capitalandcorporate.com',
    altQuery: 'private equity venture capital operaciones site:capitalandcorporate.com',
    keywords: ['M&A', 'fusión', 'adquisición', 'private equity', 'venture capital', 'operación', 'deal']
  },
  {
    id: 3,
    name: 'Cinco Días',
    searchQuery: 'fusiones adquisiciones empresas site:cincodias.elpais.com',
    altQuery: 'compra venta empresa M&A site:cincodias.elpais.com',
    keywords: ['fusión', 'adquisición', 'M&A', 'compra', 'venta', 'OPA', 'private equity', 'operación']
  },
  {
    id: 4,
    name: 'El Confidencial',
    searchQuery: 'M&A fusiones adquisiciones site:elconfidencial.com',
    altQuery: 'private equity fondo inversión compra site:elconfidencial.com',
    keywords: ['fusión', 'adquisición', 'M&A', 'compra', 'venta', 'private equity', 'fondo', 'operación']
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

// Fetch articles from Firecrawl with retry
async function fetchFromFirecrawl(
  apiKey: string, 
  query: string, 
  timeRange: string = 'qdr:w' // Default to last week
): Promise<any[]> {
  console.log(`🔍 Firecrawl query: "${query}" (time: ${timeRange})`);
  
  const response = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      limit: 10,
      lang: 'es',
      country: 'ES',
      tbs: timeRange, // qdr:d = day, qdr:w = week
      scrapeOptions: {
        formats: ['markdown']
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Firecrawl error ${response.status}:`, errorText);
    throw new Error(`Firecrawl error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`📰 Firecrawl returned ${data.data?.length || 0} raw results`);
  
  return data.success ? (data.data || []) : [];
}

// Categorize article based on content
function categorizeArticle(content: string, title: string): string {
  const text = (content + ' ' + title).toLowerCase();
  if (text.includes('private equity') || text.includes('capital riesgo')) return 'Private Equity';
  if (text.includes('venture capital') || text.includes('startup') || text.includes('ronda')) return 'Venture Capital';
  if (text.includes('opa') || text.includes('oferta pública')) return 'OPA';
  if (text.includes('reestructuración') || text.includes('concurso')) return 'Reestructuración';
  return 'M&A';
}

// Clean content from tracking pixels and junk
function cleanContent(text: string): string {
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
}

// Extract clean excerpt
function extractExcerpt(content: string, title: string): string {
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
      console.error('❌ FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    let requestedSource: number | undefined;
    let fetchAll = false;
    let timeRange = 'qdr:w'; // Default: last week (more results)
    
    try {
      const body = await req.json();
      requestedSource = body?.source_index;
      fetchAll = body?.fetch_all === true;
      if (body?.time_range) timeRange = body.time_range;
    } catch {
      // No body or invalid JSON
    }

    // Determine which sources to fetch
    let sourcesToFetch: typeof NEWS_SOURCES;
    
    if (fetchAll) {
      sourcesToFetch = NEWS_SOURCES;
      console.log(`🚀 Fetching from ALL ${NEWS_SOURCES.length} sources`);
    } else if (requestedSource !== undefined && requestedSource >= 0 && requestedSource < NEWS_SOURCES.length) {
      sourcesToFetch = [NEWS_SOURCES[requestedSource]];
    } else {
      // Rotate based on hour - cycle through sources
      const currentHour = new Date().getUTCHours();
      const sourceIndex = Math.floor(currentHour / 6) % NEWS_SOURCES.length;
      sourcesToFetch = [NEWS_SOURCES[sourceIndex]];
    }

    const allNews: any[] = [];
    const sourceResults: any[] = [];

    // Fetch from each source
    for (const source of sourcesToFetch) {
      console.log(`\n📰 Processing source: ${source.name}`);
      
      try {
        // Try main query first
        let results = await fetchFromFirecrawl(firecrawlApiKey, source.searchQuery, timeRange);
        
        // If no results, try alternative query
        if (results.length === 0 && source.altQuery) {
          console.log(`🔄 Main query empty, trying alt query for ${source.name}`);
          results = await fetchFromFirecrawl(firecrawlApiKey, source.altQuery, timeRange);
        }

        // Filter by keywords
        let relevantCount = 0;
        for (const result of results) {
          const content = (result.markdown || result.description || '').toLowerCase();
          const title = (result.title || '').toLowerCase();

          const isMARelated = source.keywords.some(keyword =>
            content.includes(keyword.toLowerCase()) ||
            title.includes(keyword.toLowerCase())
          );

          if (isMARelated && result.title && result.url) {
            relevantCount++;
            allNews.push({
              source_name: source.name,
              source_url: result.url,
              title: result.title,
              content: result.markdown || result.description || '',
              fetched_at: new Date().toISOString()
            });
          }
        }

        sourceResults.push({
          source: source.name,
          raw_results: results.length,
          relevant: relevantCount,
          status: 'success'
        });

        console.log(`✅ ${source.name}: ${results.length} raw → ${relevantCount} relevant`);

      } catch (error) {
        console.error(`❌ Error fetching ${source.name}:`, error.message);
        sourceResults.push({
          source: source.name,
          raw_results: 0,
          relevant: 0,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`\n📊 Total relevant articles found: ${allNews.length}`);

    // Store news, checking for duplicates by URL and title hash
    let insertedCount = 0;
    let duplicatesByUrl = 0;
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
      duplicatesByUrl = existingUrls.size;

      // Check for existing articles by title hash
      const hashes = articlesWithHash.map(n => n.title_hash);
      const { data: existingByHash } = await supabase
        .from('news_articles')
        .select('title_hash')
        .in('title_hash', hashes);

      const existingHashes = new Set((existingByHash || []).map(n => n.title_hash));

      // Filter out duplicates
      const newArticles = articlesWithHash.filter(n => {
        if (existingUrls.has(n.source_url)) return false;
        if (existingHashes.has(n.title_hash)) {
          duplicatesByHash++;
          console.log(`🔄 Duplicate by hash: "${n.title.substring(0, 50)}..."`);
          return false;
        }
        return true;
      });

      console.log(`📝 New articles: ${newArticles.length} (skipped: ${duplicatesByUrl} URL, ${duplicatesByHash} hash)`);

      if (newArticles.length > 0) {
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
          console.error('❌ Error inserting news:', insertError);
        } else {
          insertedCount = articlesToInsert.length;
          console.log(`✅ Inserted ${insertedCount} new articles`);

          // Create notification for new pending articles
          await supabase.from('admin_notifications_news').insert({
            type: 'new_pending_news',
            title: `${insertedCount} noticias nuevas pendientes`,
            message: `Se importaron ${insertedCount} noticias de ${sourcesToFetch.map(s => s.name).join(', ')}`,
            metadata: {
              sources: sourceResults,
              count: insertedCount,
              duplicates_url: duplicatesByUrl,
              duplicates_hash: duplicatesByHash
            }
          });
          console.log('📬 Admin notification created');
        }
      }
    } else {
      // No articles found - create warning notification if this is a scheduled run
      if (!requestedSource && !fetchAll) {
        await supabase.from('admin_notifications_news').insert({
          type: 'no_news_found',
          title: 'Sin noticias nuevas',
          message: `No se encontraron artículos relevantes en ${sourcesToFetch[0]?.name || 'ninguna fuente'}`,
          metadata: { sources: sourceResults, time_range: timeRange }
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sources: sourceResults,
        total_found: allNews.length,
        inserted: insertedCount,
        duplicates: {
          by_url: duplicatesByUrl,
          by_hash: duplicatesByHash
        },
        time_range: timeRange,
        message: `Found ${allNews.length} articles, inserted ${insertedCount} new`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in fetch-ma-news:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

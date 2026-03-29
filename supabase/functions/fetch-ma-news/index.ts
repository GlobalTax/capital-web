import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Spanish M&A news sources with DEAL-FOCUSED search queries
const NEWS_SOURCES = [
  {
    id: 0,
    name: 'Expansión',
    // FOCUSED: Real operations with action verbs
    searchQuery: '"ha adquirido" OR "compra de" OR "vende" OR "fusión con" site:expansion.com',
    altQuery: '"millones de euros" adquisición empresa site:expansion.com',
    keywords: ['adquiere', 'compra', 'vende', 'fusión', 'OPA', 'millones', 'operación', 'cierra', 'acuerdo']
  },
  {
    id: 1,
    name: 'El Economista',
    // FOCUSED: Deal announcements
    searchQuery: '"ha comprado" OR "adquiere" OR "venta de" OR "se fusiona" site:eleconomista.es',
    altQuery: 'private equity compra empresa española millones site:eleconomista.es',
    keywords: ['adquiere', 'compra', 'vende', 'fusión', 'OPA', 'millones', 'cierra', 'operación']
  },
  {
    id: 2,
    name: 'Capital & Corporate',
    // Specialized M&A source - keep broad but relevant
    searchQuery: 'adquisición OR venta OR fusión site:capitalandcorporate.com',
    altQuery: 'private equity deal operación site:capitalandcorporate.com',
    keywords: ['adquisición', 'venta', 'fusión', 'deal', 'operación', 'cierre', 'millones', 'compra']
  },
  {
    id: 3,
    name: 'Cinco Días',
    // FOCUSED: Concrete operations
    searchQuery: '"compra" OR "adquiere" OR "vende" empresa millones site:cincodias.elpais.com',
    altQuery: '"operación de" compra venta empresa site:cincodias.elpais.com',
    keywords: ['compra', 'adquiere', 'vende', 'fusión', 'OPA', 'millones', 'operación', 'cierra']
  },
  {
    id: 4,
    name: 'El Confidencial',
    // FOCUSED: Private equity and strategic deals
    searchQuery: 'fondo compra empresa OR "ha adquirido" OR venta site:elconfidencial.com',
    altQuery: 'private equity inversión empresa española millones site:elconfidencial.com',
    keywords: ['compra', 'adquiere', 'vende', 'fondo', 'private equity', 'millones', 'operación']
  }
];

// Keywords that indicate a REAL deal (not just market commentary)
const DEAL_INDICATORS = [
  'ha adquirido', 'ha comprado', 'ha vendido', 'adquiere', 'compra', 'vende',
  'cierra la compra', 'cierra la venta', 'se fusiona', 'opa sobre', 'opa por',
  'millones de euros', 'millones €', 'M€', 'desinversión', 'build-up',
  'entrada en el capital', 'toma de control', 'compra del 100%', 'venta del',
  'acuerdo de compra', 'acuerdo de venta', 'operación valorada', 'transacción'
];

// Keywords that indicate NON-deal content (to deprioritize)
const NON_DEAL_INDICATORS = [
  'podría comprar', 'estudia comprar', 'analiza la venta', 'rumores de',
  'el mercado de m&a', 'tendencias en', 'perspectivas para', 'opinión:',
  'análisis:', 'cómo vender', 'guía para', 'qué es un', 'entrevista con',
  'nombramiento', 'resultados del trimestre', 'resultados anuales'
];

// Generate SHA-256 hash for title deduplication
async function generateTitleHash(title: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(title.toLowerCase().trim().replace(/\s+/g, ' '));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// Score article relevance based on deal indicators
function scoreDealRelevance(content: string, title: string): { score: number; hasDealIndicator: boolean } {
  const text = (content + ' ' + title).toLowerCase();
  
  // Check for non-deal indicators first
  const hasNonDeal = NON_DEAL_INDICATORS.some(indicator => text.includes(indicator.toLowerCase()));
  
  // Check for deal indicators
  const dealIndicatorCount = DEAL_INDICATORS.filter(indicator => 
    text.includes(indicator.toLowerCase())
  ).length;
  
  // Calculate score
  let score = dealIndicatorCount * 2;
  if (hasNonDeal) score -= 3;
  
  // Bonus for specific patterns
  if (/\d+\s*(?:millones|M€|M\s*€)/i.test(text)) score += 2; // Has deal value
  if (/(?:ha|han)\s+(?:adquirido|comprado|vendido)/i.test(text)) score += 3; // Past tense = completed deal
  if (/(?:cierra|completa|finaliza)\s+(?:la\s+)?(?:compra|venta|operación)/i.test(text)) score += 3;
  
  return {
    score: Math.max(0, Math.min(10, score)),
    hasDealIndicator: dealIndicatorCount > 0
  };
}

// Fetch articles from Firecrawl with retry
async function fetchFromFirecrawl(
  apiKey: string, 
  query: string, 
  timeRange: string = 'qdr:w'
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
      tbs: timeRange,
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
  if (text.includes('opa') || text.includes('oferta pública')) return 'OPA';
  if (text.includes('private equity') || text.includes('capital riesgo') || text.includes('fondo de inversión')) return 'Private Equity';
  if (text.includes('venture capital') || text.includes('startup') || text.includes('ronda de financiación')) return 'Venture Capital';
  if (text.includes('reestructuración') || text.includes('concurso') || text.includes('ERE')) return 'Reestructuración';
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

  // Authentication: either CRON_SECRET header or JWT + admin check
  const cronSecret = req.headers.get('X-Cron-Secret');
  const expectedCronSecret = Deno.env.get('CRON_SECRET');
  const isScheduledCall = cronSecret && expectedCronSecret && cronSecret === expectedCronSecret;

  if (!isScheduledCall) {
    const { validateAdminRequest } = await import("../_shared/auth-guard.ts");
    const auth = await validateAdminRequest(req, corsHeaders);
    if (auth.error) return auth.error;
    console.log(`[fetch-ma-news] Authenticated admin: ${auth.userEmail} (role: ${auth.role})`);
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
    let timeRange = 'qdr:w';
    
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

        // Filter and score by deal relevance
        let relevantCount = 0;
        let skippedLowScore = 0;
        
        for (const result of results) {
          const content = (result.markdown || result.description || '');
          const title = (result.title || '');

          // Check basic keyword match
          const isMARelated = source.keywords.some(keyword =>
            content.toLowerCase().includes(keyword.toLowerCase()) ||
            title.toLowerCase().includes(keyword.toLowerCase())
          );

          if (!isMARelated || !result.title || !result.url) continue;

          // Score deal relevance
          const { score, hasDealIndicator } = scoreDealRelevance(content, title);
          
          // Pre-filter: only include if has deal indicator or decent score
          if (!hasDealIndicator && score < 3) {
            skippedLowScore++;
            console.log(`⏭️ Pre-filtered (score ${score}): "${title.substring(0, 50)}..."`);
            continue;
          }

          relevantCount++;
          allNews.push({
            source_name: source.name,
            source_url: result.url,
            title: result.title,
            content: result.markdown || result.description || '',
            fetched_at: new Date().toISOString(),
            pre_score: score // Store pre-score for logging
          });
        }

        sourceResults.push({
          source: source.name,
          raw_results: results.length,
          relevant: relevantCount,
          pre_filtered: skippedLowScore,
          status: 'success'
        });

        console.log(`✅ ${source.name}: ${results.length} raw → ${relevantCount} relevant (${skippedLowScore} pre-filtered)`);

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
          is_processed: false,
          ai_metadata: { pre_score: article.pre_score } // Store pre-score
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
            title: `${insertedCount} noticias pendientes de procesar`,
            message: `Se importaron ${insertedCount} noticias de ${sourcesToFetch.map(s => s.name).join(', ')}. Pendientes de análisis AI.`,
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
      // No articles found
      if (!requestedSource && !fetchAll) {
        await supabase.from('admin_notifications_news').insert({
          type: 'no_news_found',
          title: 'Sin noticias nuevas',
          message: `No se encontraron artículos relevantes de operaciones M&A en ${sourcesToFetch[0]?.name || 'ninguna fuente'}`,
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
        message: `Found ${allNews.length} deal-focused articles, inserted ${insertedCount} new`
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

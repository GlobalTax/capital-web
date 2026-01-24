import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PortfolioCompany {
  id: string;
  company_name: string;
  website: string | null;
  fund_id: string;
  fund_name: string;
}

interface NewsResult {
  portfolio_id: string;
  company_name: string;
  news_count: number;
  exit_signals: number;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Parse optional parameters
    let limit = 30; // Default: process 30 companies per run
    let fund_id: string | null = null;
    let portfolio_id: string | null = null;
    
    try {
      const body = await req.json();
      limit = body.limit || limit;
      fund_id = body.fund_id || null;
      portfolio_id = body.portfolio_id || null;
    } catch {
      // No body provided, use defaults
    }

    console.log(`[cr-portfolio-news-scan] Starting scan. Limit: ${limit}, Fund ID: ${fund_id || 'all'}`);

    // Build query for portfolio companies
    let query = supabase
      .from('cr_portfolio')
      .select(`
        id,
        company_name,
        website,
        fund_id,
        cr_funds!inner(name)
      `)
      .eq('status', 'ACTIVO')
      .eq('is_deleted', false);

    if (fund_id) {
      query = query.eq('fund_id', fund_id);
    }

    if (portfolio_id) {
      query = query.eq('id', portfolio_id);
    }

    // Order by last scan (null first = never scanned), then limit
    query = query
      .order('last_news_scan_at', { ascending: true, nullsFirst: true })
      .limit(limit);

    const { data: companies, error: companiesError } = await query;

    if (companiesError) {
      console.error('[cr-portfolio-news-scan] Error fetching companies:', companiesError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch portfolio companies' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No portfolio companies to scan', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform to flat structure
    const portfolioCompanies: PortfolioCompany[] = companies.map((c: any) => ({
      id: c.id,
      company_name: c.company_name,
      website: c.website,
      fund_id: c.fund_id,
      fund_name: c.cr_funds?.name || 'Unknown Fund',
    }));

    console.log(`[cr-portfolio-news-scan] Found ${portfolioCompanies.length} companies to scan`);

    const results: NewsResult[] = [];
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 2000;

    // Process in batches
    for (let i = 0; i < portfolioCompanies.length; i += BATCH_SIZE) {
      const batch = portfolioCompanies.slice(i, i + BATCH_SIZE);
      
      console.log(`[cr-portfolio-news-scan] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(portfolioCompanies.length / BATCH_SIZE)}`);

      const batchPromises = batch.map(async (company) => {
        try {
          const result = await searchCompanyNews(
            company,
            firecrawlApiKey,
            supabase
          );
          
          // Update last scan timestamp
          await supabase
            .from('cr_portfolio')
            .update({ 
              last_news_scan_at: new Date().toISOString(),
              news_alert_count: result.exit_signals,
            })
            .eq('id', company.id);

          return result;
        } catch (error: any) {
          console.error(`[cr-portfolio-news-scan] Error scanning ${company.company_name}:`, error);
          return {
            portfolio_id: company.id,
            company_name: company.company_name,
            news_count: 0,
            exit_signals: 0,
            error: error.message || 'Unknown error',
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches
      if (i + BATCH_SIZE < portfolioCompanies.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    const totalNews = results.reduce((sum, r) => sum + r.news_count, 0);
    const totalExitSignals = results.reduce((sum, r) => sum + r.exit_signals, 0);
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;

    console.log(`[cr-portfolio-news-scan] Scan complete. Companies: ${portfolioCompanies.length}, News: ${totalNews}, Exit signals: ${totalExitSignals}`);

    // Create admin notification if significant findings
    if (totalExitSignals > 0 || totalNews >= 5) {
      await supabase.from('admin_notifications_news').insert({
        type: 'portfolio_scan',
        title: totalExitSignals > 0 
          ? `🚨 ${totalExitSignals} señales de exit detectadas`
          : `📰 ${totalNews} noticias de portfolio encontradas`,
        message: `Scan de ${successCount} empresas del portfolio. ${totalNews} noticias, ${totalExitSignals} posibles exits.`,
        metadata: {
          scan_type: 'portfolio_news',
          companies_scanned: successCount,
          total_news: totalNews,
          exit_signals: totalExitSignals,
          errors: errorCount,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          companies_scanned: portfolioCompanies.length,
          successful: successCount,
          errors: errorCount,
          total_news_found: totalNews,
          exit_signals_found: totalExitSignals,
          results,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[cr-portfolio-news-scan] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function searchCompanyNews(
  company: PortfolioCompany,
  firecrawlApiKey: string,
  supabase: any
): Promise<NewsResult> {
  // Build search queries for the company
  const searchQueries = [
    `"${company.company_name}" vendida OR adquirida OR desinversión`,
    `"${company.company_name}" ${company.fund_name} salida OR exit`,
    `"${company.company_name}" crecimiento OR expansión OR resultados`,
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
          tbs: 'qdr:m', // Last month
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
      console.warn(`[cr-portfolio-news-scan] Search query failed for ${company.company_name}: ${query}`, e);
    }
  }

  if (allResults.length === 0) {
    return { portfolio_id: company.id, company_name: company.company_name, news_count: 0, exit_signals: 0 };
  }

  // Use AI to classify news and detect exit signals
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  let processedNews: Array<{
    title: string;
    url: string;
    source_name: string;
    content_preview: string;
    news_type: string;
    relevance_score: number;
    is_exit_signal: boolean;
    is_acquisition_signal: boolean;
    ai_summary: string;
  }> = [];

  const systemPrompt = `Eres un analista de M&A especializado en Private Equity. 
Analiza noticias sobre "${company.company_name}" (participada del fondo ${company.fund_name}).

OBJETIVO: Detectar señales de desinversión (exit) o cambios importantes.

Señales de EXIT incluyen:
- Venta a otro inversor/fondo
- IPO o salida a bolsa
- Venta estratégica a competidor
- Secondary buyout
- Recapitalización con salida de inversor

Responde SOLO con JSON array:
[{
  "title": "título",
  "url": "url",
  "source_name": "medio",
  "content_preview": "resumen 2-3 líneas",
  "news_type": "exit|acquisition|growth|funding|partnership|crisis|management|other",
  "relevance_score": 1-10,
  "is_exit_signal": true/false,
  "is_acquisition_signal": true/false,
  "ai_summary": "análisis breve de la noticia y su impacto"
}]
Solo noticias con relevance >= 5. Array vacío si no hay noticias relevantes.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: JSON.stringify(allResults) }
  ];

  // Try Lovable AI first
  if (lovableApiKey) {
    try {
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages,
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          try {
            processedNews = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
          } catch {
            console.warn('[cr-portfolio-news-scan] Failed to parse Lovable AI response');
          }
        }
      }
    } catch (aiError) {
      console.warn('[cr-portfolio-news-scan] Lovable AI error:', aiError);
    }
  }

  // Fallback to OpenAI
  if (processedNews.length === 0 && openaiApiKey) {
    try {
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.1,
          max_tokens: 2000,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          try {
            processedNews = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
          } catch {
            console.warn('[cr-portfolio-news-scan] Failed to parse OpenAI response');
          }
        }
      }
    } catch (aiError) {
      console.error('[cr-portfolio-news-scan] OpenAI classification failed:', aiError);
    }
  }

  // Save news to portfolio_news table
  let savedCount = 0;
  let exitSignalCount = 0;

  for (const news of processedNews) {
    const { error: insertError } = await supabase
      .from('portfolio_news')
      .upsert({
        portfolio_id: company.id,
        fund_id: company.fund_id,
        company_name: company.company_name,
        title: news.title,
        url: news.url,
        source_name: news.source_name,
        content_preview: news.content_preview,
        news_type: news.news_type,
        relevance_score: news.relevance_score,
        is_exit_signal: news.is_exit_signal,
        is_acquisition_signal: news.is_acquisition_signal,
        ai_summary: news.ai_summary,
        news_date: new Date().toISOString(),
      }, {
        onConflict: 'url',
        ignoreDuplicates: true,
      });

    if (!insertError) {
      savedCount++;
      if (news.is_exit_signal) {
        exitSignalCount++;
      }
    }
  }

  return { 
    portfolio_id: company.id, 
    company_name: company.company_name, 
    news_count: savedCount,
    exit_signals: exitSignalCount,
  };
}

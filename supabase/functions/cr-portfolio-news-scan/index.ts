import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

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
  scan_priority: string;
}

interface NewsResult {
  portfolio_id: string;
  company_name: string;
  news_count: number;
  exit_signals: number;
  error?: string;
}

const COMPANIES_PER_BATCH_SEARCH = 5;
const MAX_SEARCH_RESULTS = 10;

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

    let limit = 30;
    let fund_id: string | null = null;
    let portfolio_id: string | null = null;
    let min_days_since_scan = 7;
    
    try {
      const body = await req.json();
      limit = body.limit || limit;
      fund_id = body.fund_id || null;
      portfolio_id = body.portfolio_id || null;
      min_days_since_scan = body.min_days_since_scan ?? min_days_since_scan;
    } catch { /* defaults */ }

    console.log(`[cr-portfolio-news-scan] Starting optimized scan. Limit: ${limit}`);

    const scanCutoff = new Date();
    scanCutoff.setDate(scanCutoff.getDate() - min_days_since_scan);

    let query = supabase
      .from('cr_portfolio')
      .select(`id, company_name, website, fund_id, scan_priority, cr_funds!inner(name)`)
      .eq('status', 'ACTIVO')
      .eq('is_deleted', false)
      .eq('skip_news_scan', false)
      .or(`last_news_scan_at.is.null,last_news_scan_at.lt.${scanCutoff.toISOString()}`);

    if (fund_id) query = query.eq('fund_id', fund_id);
    if (portfolio_id) query = query.eq('id', portfolio_id);

    query = query.order('scan_priority', { ascending: true }).order('last_news_scan_at', { ascending: true, nullsFirst: true }).limit(limit);

    const { data: companies, error: companiesError } = await query;

    if (companiesError) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch portfolio companies' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!companies || companies.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No portfolio companies need scanning', results: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const portfolioCompanies: PortfolioCompany[] = companies
      .map((c: any) => ({ id: c.id, company_name: c.company_name, website: c.website, fund_id: c.fund_id, fund_name: c.cr_funds?.name || 'Unknown Fund', scan_priority: c.scan_priority || 'normal' }))
      .sort((a: any, b: any) => (priorityOrder[a.scan_priority as keyof typeof priorityOrder] || 1) - (priorityOrder[b.scan_priority as keyof typeof priorityOrder] || 1));

    await logApiUsage(supabase, 'firecrawl', 'search', 0, 'cr-portfolio-news-scan', { companies_count: portfolioCompanies.length, optimization: 'batch_search' });

    const results: NewsResult[] = [];
    
    const companiesByFund = new Map<string, PortfolioCompany[]>();
    for (const company of portfolioCompanies) {
      if (!companiesByFund.has(company.fund_id)) companiesByFund.set(company.fund_id, []);
      companiesByFund.get(company.fund_id)!.push(company);
    }

    let totalCreditsUsed = 0;

    for (const [, fundCompanies] of companiesByFund) {
      const fundName = fundCompanies[0]?.fund_name || 'Unknown';
      
      for (let i = 0; i < fundCompanies.length; i += COMPANIES_PER_BATCH_SEARCH) {
        const batch = fundCompanies.slice(i, i + COMPANIES_PER_BATCH_SEARCH);

        try {
          const { newsResults, creditsUsed } = await batchSearchCompanyNews(batch, fundName, firecrawlApiKey, supabase);
          results.push(...newsResults);
          totalCreditsUsed += creditsUsed;

          for (const company of batch) {
            const result = newsResults.find(r => r.portfolio_id === company.id);
            await supabase.from('cr_portfolio').update({ last_news_scan_at: new Date().toISOString(), news_alert_count: result?.exit_signals || 0 }).eq('id', company.id);
          }
        } catch (error: any) {
          for (const company of batch) {
            results.push({ portfolio_id: company.id, company_name: company.company_name, news_count: 0, exit_signals: 0, error: error.message || 'Batch search failed' });
          }
        }

        if (i + COMPANIES_PER_BATCH_SEARCH < fundCompanies.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    await logApiUsage(supabase, 'firecrawl', 'search', totalCreditsUsed, 'cr-portfolio-news-scan', { companies_scanned: portfolioCompanies.length, search_queries: Math.ceil(portfolioCompanies.length / COMPANIES_PER_BATCH_SEARCH) });

    const totalNews = results.reduce((sum, r) => sum + r.news_count, 0);
    const totalExitSignals = results.reduce((sum, r) => sum + r.exit_signals, 0);
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;

    if (totalExitSignals > 0 || totalNews >= 5) {
      await supabase.from('admin_notifications_news').insert({
        type: 'portfolio_scan',
        title: totalExitSignals > 0 ? `🚨 ${totalExitSignals} señales de exit detectadas` : `📰 ${totalNews} noticias de portfolio encontradas`,
        message: `Scan optimizado de ${successCount} empresas. ${totalNews} noticias, ${totalExitSignals} posibles exits. Créditos: ${totalCreditsUsed}`,
        metadata: { scan_type: 'portfolio_news', companies_scanned: successCount, total_news: totalNews, exit_signals: totalExitSignals, errors: errorCount, credits_used: totalCreditsUsed, optimization: 'batch_search' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: { companies_scanned: portfolioCompanies.length, successful: successCount, errors: errorCount, total_news_found: totalNews, exit_signals_found: totalExitSignals, credits_used: totalCreditsUsed, results }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[cr-portfolio-news-scan] Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function batchSearchCompanyNews(companies: PortfolioCompany[], fundName: string, firecrawlApiKey: string, supabase: any): Promise<{ newsResults: NewsResult[]; creditsUsed: number }> {
  const companyNames = companies.map(c => `"${c.company_name}"`).join(' OR ');
  const batchQuery = `(${companyNames}) (${fundName}) (vendida OR adquirida OR exit OR desinversión OR venta OR expansión)`;

  let creditsUsed = 2;

  const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${firecrawlApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: batchQuery, limit: MAX_SEARCH_RESULTS, lang: 'es', country: 'ES', tbs: 'qdr:m' }),
  });

  const searchData = await searchResponse.json();
  const allResults: Array<{ title: string; url: string; description: string; source: string }> = [];

  if (searchResponse.ok && searchData.success && searchData.data) {
    for (const result of searchData.data) {
      const urlHash = await hashUrl(result.url);
      const { data: existingUrl } = await supabase.from('processed_urls').select('id').eq('url_hash', urlHash).single();

      if (!existingUrl) {
        allResults.push({ title: result.title || 'Sin título', url: result.url, description: result.description || '', source: new URL(result.url).hostname });
        await supabase.from('processed_urls').insert({ url_hash: urlHash, url: result.url, source: 'news_scan', result_type: 'pending' }).onConflict('url_hash').ignore();
      }
    }
  }

  if (allResults.length === 0) {
    return { newsResults: companies.map(c => ({ portfolio_id: c.id, company_name: c.company_name, news_count: 0, exit_signals: 0 })), creditsUsed };
  }

  const companyListForAI = companies.map(c => ({ id: c.id, name: c.company_name }));
  
  const systemPrompt = `Eres un analista de M&A especializado en Private Equity.
Analiza estas noticias y asócialas con las empresas correctas del portfolio.

EMPRESAS DEL PORTFOLIO (fondo ${fundName}):
${JSON.stringify(companyListForAI)}

Responde SOLO con JSON array:
[{
  "portfolio_id": "uuid de la empresa",
  "company_name": "nombre empresa",
  "title": "título noticia",
  "url": "url",
  "source_name": "medio",
  "content_preview": "resumen 2-3 líneas",
  "news_type": "exit|acquisition|growth|funding|partnership|crisis|management|other",
  "relevance_score": 1-10,
  "is_exit_signal": true/false,
  "is_acquisition_signal": true/false,
  "ai_summary": "análisis breve"
}]
Solo noticias con relevance >= 5 y que claramente correspondan a una empresa del portfolio. Array vacío si no hay matches.`;

  let processedNews: any[] = [];

  try {
    const aiResponse = await callAI(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: JSON.stringify(allResults) }],
      { functionName: 'cr-portfolio-news-scan', temperature: 0.1, maxTokens: 3000 }
    );
    processedNews = parseAIJson<any[]>(aiResponse.content);
  } catch (e) {
    console.warn('[cr-portfolio-news-scan] AI classification failed:', e);
  }

  const resultsByCompany = new Map<string, NewsResult>();
  for (const company of companies) {
    resultsByCompany.set(company.id, { portfolio_id: company.id, company_name: company.company_name, news_count: 0, exit_signals: 0 });
  }

  for (const news of processedNews) {
    const company = companies.find(c => c.id === news.portfolio_id);
    if (!company) continue;

    const { error: insertError } = await supabase.from('portfolio_news').upsert({
      portfolio_id: news.portfolio_id, fund_id: company.fund_id, company_name: news.company_name,
      title: news.title, url: news.url, source_name: news.source_name, content_preview: news.content_preview,
      news_type: news.news_type, relevance_score: news.relevance_score, is_exit_signal: news.is_exit_signal,
      is_acquisition_signal: news.is_acquisition_signal, ai_summary: news.ai_summary, news_date: new Date().toISOString(),
    }, { onConflict: 'url', ignoreDuplicates: true });

    if (!insertError) {
      const result = resultsByCompany.get(news.portfolio_id)!;
      result.news_count++;
      if (news.is_exit_signal) result.exit_signals++;

      const urlHash = await hashUrl(news.url);
      await supabase.from('processed_urls').update({ result_type: news.is_exit_signal ? 'exit_signal' : 'news', portfolio_company_id: news.portfolio_id, fund_id: company.fund_id }).eq('url_hash', urlHash);
    }
  }

  return { newsResults: Array.from(resultsByCompany.values()), creditsUsed };
}

async function hashUrl(url: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(url.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

async function logApiUsage(supabase: any, service: string, operation: string, credits: number, functionName: string, metadata: Record<string, any>): Promise<void> {
  try {
    await supabase.from('api_usage_log').insert({ service, operation, credits_used: credits, function_name: functionName, metadata });
  } catch (e) { console.warn('[cr-portfolio-news-scan] Failed to log API usage:', e); }
}

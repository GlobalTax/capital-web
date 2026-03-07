import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiffResult {
  fund_id: string;
  fund_name: string;
  new_companies: number;
  possible_exits: number;
  skipped?: boolean;
  skip_reason?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let fund_id: string | null = null;
    let limit = 10;
    let force_scan = false;
    
    try {
      const body = await req.json();
      fund_id = body.fund_id || null;
      limit = body.limit || limit;
      force_scan = body.force_scan || false;
    } catch { /* defaults */ }

    let query = supabase.from('cr_funds').select('id, name, website, portfolio_url, last_web_etag, last_web_modified, last_diff_scan_at').eq('is_deleted', false).eq('portfolio_diff_enabled', true).not('portfolio_url', 'is', null);
    if (fund_id) query = query.eq('id', fund_id);
    query = query.order('last_diff_scan_at', { ascending: true, nullsFirst: true }).limit(limit);

    const { data: funds, error: fundsError } = await query;

    if (fundsError) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch funds' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!funds || funds.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No funds with portfolio_url configured', results: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const results: DiffResult[] = [];
    let totalCreditsUsed = 0;
    let skippedCount = 0;

    for (const fund of funds) {
      try {
        if (!force_scan && fund.last_web_etag) {
          const hasChanged = await checkWebsiteChanged(fund.portfolio_url, fund.last_web_etag, fund.last_web_modified);
          if (!hasChanged) {
            results.push({ fund_id: fund.id, fund_name: fund.name, new_companies: 0, possible_exits: 0, skipped: true, skip_reason: 'No website changes detected' });
            skippedCount++;
            await supabase.from('cr_funds').update({ last_diff_scan_at: new Date().toISOString() }).eq('id', fund.id);
            continue;
          }
        }

        const { result, creditsUsed, webHeaders } = await compareFundPortfolio(fund, firecrawlApiKey, supabase);
        totalCreditsUsed += creditsUsed;

        await supabase.from('cr_funds').update({ last_diff_scan_at: new Date().toISOString(), last_web_etag: webHeaders.etag || fund.last_web_etag, last_web_modified: webHeaders.lastModified || fund.last_web_modified }).eq('id', fund.id);
        results.push(result);
      } catch (error: any) {
        results.push({ fund_id: fund.id, fund_name: fund.name, new_companies: 0, possible_exits: 0, error: error.message });
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    await logApiUsage(supabase, 'firecrawl', 'scrape', totalCreditsUsed, 'cr-portfolio-diff-scan', { funds_scanned: funds.length - skippedCount, funds_skipped: skippedCount, optimization: 'selective_diff' });

    const totalNewCompanies = results.reduce((sum, r) => sum + r.new_companies, 0);
    const totalExits = results.reduce((sum, r) => sum + r.possible_exits, 0);

    if (totalNewCompanies > 0 || totalExits > 0) {
      await supabase.from('admin_notifications_news').insert({
        type: 'portfolio_diff',
        title: `🔄 Cambios detectados en portfolios`,
        message: `${totalNewCompanies} posibles nuevas adquisiciones, ${totalExits} posibles exits en ${funds.length - skippedCount} fondos. Créditos: ${totalCreditsUsed}`,
        metadata: { scan_type: 'portfolio_diff', funds_scanned: funds.length - skippedCount, funds_skipped: skippedCount, new_companies: totalNewCompanies, possible_exits: totalExits, credits_used: totalCreditsUsed },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: { funds_scanned: funds.length, funds_actually_scraped: funds.length - skippedCount, funds_skipped: skippedCount, total_new_companies: totalNewCompanies, total_possible_exits: totalExits, credits_used: totalCreditsUsed, results }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message || 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function checkWebsiteChanged(url: string, lastEtag: string | null, lastModified: string | null): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'Capittal-Portfolio-Monitor/1.0' } });
    if (!response.ok) return true;
    const currentEtag = response.headers.get('ETag');
    const currentModified = response.headers.get('Last-Modified');
    if (lastEtag && currentEtag && lastEtag === currentEtag) return false;
    if (lastModified && currentModified && lastModified === currentModified) return false;
    return true;
  } catch { return true; }
}

async function compareFundPortfolio(fund: any, firecrawlApiKey: string, supabase: any): Promise<{ result: DiffResult; creditsUsed: number; webHeaders: { etag?: string; lastModified?: string } }> {
  const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${firecrawlApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: fund.portfolio_url, formats: ['markdown'] }),
  });

  const scrapeData = await scrapeResponse.json();
  const creditsUsed = 1;

  if (!scrapeResponse.ok || !scrapeData.success) throw new Error(scrapeData.error || 'Scrape failed');

  const markdown = scrapeData.data?.markdown || '';
  const webHeaders = { etag: scrapeData.data?.metadata?.etag, lastModified: scrapeData.data?.metadata?.lastModified };

  const { data: existingCompanies, error: dbError } = await supabase.from('cr_portfolio').select('id, company_name, status').eq('fund_id', fund.id).eq('is_deleted', false);
  if (dbError) throw new Error('Failed to fetch existing portfolio');

  const existingNames = new Set((existingCompanies || []).map((c: any) => normalizeCompanyName(c.company_name)));

  // Use centralized AI helper
  const systemPrompt = `Extrae los nombres de empresas del portfolio del fondo "${fund.name}" del siguiente contenido.
Responde SOLO con un JSON array de strings con los nombres de las empresas.
Ejemplo: ["Empresa 1", "Empresa 2"]
Solo incluye empresas que claramente sean participadas/portfolio companies.`;

  let extractedCompanies: string[] = [];

  try {
    const aiResponse = await callAI(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: markdown.slice(0, 15000) }],
      { functionName: 'cr-portfolio-diff-scan', temperature: 0.1 }
    );
    extractedCompanies = parseAIJson<string[]>(aiResponse.content);
  } catch (e) {
    console.warn('[cr-portfolio-diff-scan] AI extraction failed:', e);
  }

  if (extractedCompanies.length === 0) {
    return { result: { fund_id: fund.id, fund_name: fund.name, new_companies: 0, possible_exits: 0 }, creditsUsed, webHeaders };
  }

  const extractedNamesNormalized = new Set(extractedCompanies.map(normalizeCompanyName));

  const newCompanies = extractedCompanies.filter(name => !existingNames.has(normalizeCompanyName(name)));
  const possibleExits: string[] = [];
  for (const company of existingCompanies || []) {
    if (company.status === 'ACTIVO' && !extractedNamesNormalized.has(normalizeCompanyName(company.company_name))) {
      possibleExits.push(company.company_name);
    }
  }

  for (const companyName of newCompanies) {
    await supabase.from('portfolio_changes').upsert({ fund_id: fund.id, change_type: 'new_company', company_name: companyName, company_name_normalized: normalizeCompanyName(companyName), detected_data: { source: 'web_scrape', url: fund.portfolio_url }, metadata: { extracted_from: 'portfolio_diff_scan' } }, { onConflict: 'fund_id,company_name_normalized,change_type', ignoreDuplicates: true });
  }

  for (const companyName of possibleExits) {
    const existingCompany = (existingCompanies || []).find((c: any) => c.company_name === companyName);
    await supabase.from('portfolio_changes').upsert({ fund_id: fund.id, change_type: 'exit', company_name: companyName, company_name_normalized: normalizeCompanyName(companyName), existing_portfolio_id: existingCompany?.id, detected_data: { source: 'web_comparison', url: fund.portfolio_url }, metadata: { extracted_from: 'portfolio_diff_scan' } }, { onConflict: 'fund_id,company_name_normalized,change_type', ignoreDuplicates: true });
  }

  return { result: { fund_id: fund.id, fund_name: fund.name, new_companies: newCompanies.length, possible_exits: possibleExits.length }, creditsUsed, webHeaders };
}

function normalizeCompanyName(name: string): string {
  return name.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').replace(/\b(s\.?l\.?|s\.?a\.?|s\.?l\.?u\.?|inc\.?|ltd\.?|gmbh|corp\.?)\b/gi, '').trim();
}

async function logApiUsage(supabase: any, service: string, operation: string, credits: number, functionName: string, metadata: Record<string, any>): Promise<void> {
  try { await supabase.from('api_usage_log').insert({ service, operation, credits_used: credits, function_name: functionName, metadata }); } catch (e) { console.warn('Failed to log API usage:', e); }
}

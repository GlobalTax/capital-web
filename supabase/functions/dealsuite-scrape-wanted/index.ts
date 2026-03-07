import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RETRY_CONFIG = { maxAttempts: 3, waitTimes: [45000, 60000, 90000], baseTimeout: 180000 };

interface DealRecord { deal_id: string; title: string; sector: string | null; country: string | null; ebitda_min: number | null; ebitda_max: number | null; revenue_min: number | null; revenue_max: number | null; deal_type: string | null; advisor: string | null; description: string | null; published_at: string | null; detail_url: string | null; }

interface ExtractionResult { deals: DealRecord[]; total_found: number; has_more_pages: boolean; warnings: string[]; }

function buildDealsuitUrl(filters?: Record<string, string>): string {
  const baseUrl = 'https://app.dealsuite.com/en/market/wanted';
  const params = { currency: '1', continents: '3', ebitda_in_percentage: '1', ...filters };
  return `${baseUrl}?${new URLSearchParams(params).toString()}`;
}

function validateCookieFormat(cookie: string) {
  const requiredKeys = ['user=', 'dstoken='];
  const missing = requiredKeys.filter(key => !cookie.includes(key));
  const detected: string[] = [];
  const warnings: string[] = [];
  requiredKeys.forEach(key => { if (cookie.includes(key)) detected.push(key.replace('=', '')); });
  const isTruncated = cookie.includes('…') || cookie.endsWith('...') || cookie.endsWith('…');
  const hasInvalidChars = /[\n\r\t]/.test(cookie);
  const cookieCount = (cookie.match(/=/g) || []).length;
  if (isTruncated) warnings.push('cookie_truncated');
  if (hasInvalidChars) warnings.push('invalid_chars');
  if (cookie.length < 100) warnings.push('cookie_too_short');
  if (cookieCount < 2) warnings.push('too_few_cookies');
  return { valid: missing.length === 0 && !isTruncated && !hasInvalidChars, missing: missing.map(k => k.replace('=', '')), detected, warnings, diagnostics: { length: cookie.length, isTruncated, hasExtraQuotes: false, hasInvalidChars, estimatedExpiry: null, cookieCount } };
}

function isLoginPage(content: string | undefined): boolean {
  if (!content) return true;
  const lc = content.toLowerCase();
  const hasLogin = ['sign in', 'login', 'log in', 'enter your email'].some(i => lc.includes(i));
  const hasDeal = lc.includes('wanted') && (lc.includes('ebitda') || lc.includes('revenue'));
  return hasLogin && !hasDeal;
}

function isCaptchaPage(content: string | undefined): boolean {
  if (!content) return false;
  return ['captcha', 'verify you are human', 'recaptcha', 'hcaptcha', 'cloudflare'].some(i => content.toLowerCase().includes(i));
}

async function scrapeWithRetry(url: string, sessionCookie: string, firecrawlKey: string, attempt = 1): Promise<{ success: boolean; markdown?: string; html?: string; error?: string; attempt?: number }> {
  const waitFor = RETRY_CONFIG.waitTimes[attempt - 1] || 60000;
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url, formats: ['markdown', 'html'], waitFor, timeout: RETRY_CONFIG.baseTimeout, onlyMainContent: false, blockResources: ['image', 'media', 'font'],
        actions: [{ type: 'wait', selector: '.deal-card, .listing-item, [data-deal-id], .market-listing, table tbody tr', timeout: waitFor }],
        headers: { 'Cookie': sessionCookie, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://app.dealsuite.com/' },
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      if ((errorText.includes('timeout') || response.status === 408) && attempt < RETRY_CONFIG.maxAttempts) {
        await new Promise(r => setTimeout(r, 3000));
        return scrapeWithRetry(url, sessionCookie, firecrawlKey, attempt + 1);
      }
      if (response.status === 429) return { success: false, error: 'rate_limited', attempt };
      return { success: false, error: `Firecrawl error: ${response.status}`, attempt };
    }
    const scrapeData = await response.json();
    const markdown = scrapeData.data?.markdown || scrapeData.markdown;
    if (!markdown || markdown.length < 200) {
      if (attempt < RETRY_CONFIG.maxAttempts) { await new Promise(r => setTimeout(r, 3000)); return scrapeWithRetry(url, sessionCookie, firecrawlKey, attempt + 1); }
      return { success: false, error: 'No content retrieved', attempt };
    }
    return { success: true, markdown, html: scrapeData.data?.html || scrapeData.html, attempt };
  } catch (error: any) {
    if (attempt < RETRY_CONFIG.maxAttempts) { await new Promise(r => setTimeout(r, 3000)); return scrapeWithRetry(url, sessionCookie, firecrawlKey, attempt + 1); }
    return { success: false, error: error.message || 'Unknown scrape error', attempt };
  }
}

async function extractDealsWithAI(content: string): Promise<ExtractionResult> {
  const systemPrompt = `Eres un analista de M&A especializado en deal sourcing.
Tu objetivo es extraer deals del marketplace "Wanted" de Dealsuite.
Reglas: precisión > completitud. No inventes datos. Si un campo no está disponible, usa null.

TASK: Identifica todos los deals y para cada uno extrae deal_id, title, sector, country, ebitda_min/max, revenue_min/max, deal_type, advisor, description, published_at, detail_url.
CONVERSIÓN: "1M" → 1000 (miles), "500K" → 500 (miles)

SCHEMA: { "deals": [DealRecord], "total_found": number, "has_more_pages": boolean, "warnings": [string] }
Responde SOLO con JSON válido.`;

  const response = await callAI(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Extrae los deals de este contenido de Dealsuite:\n\n${content.substring(0, 30000)}` }
    ],
    { functionName: 'dealsuite-scrape-wanted', preferOpenAI: true, temperature: 0.1, maxTokens: 4000 }
  );

  return parseAIJson<ExtractionResult>(response.content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let body;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { session_cookie, filters, dry_run } = body;

    if (!session_cookie || typeof session_cookie !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'session_cookie es requerida' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const cookieValidation = validateCookieFormat(session_cookie);
    if (!cookieValidation.valid) {
      return new Response(JSON.stringify({ success: false, error: 'invalid_cookie_format', detected: cookieValidation.detected, missing: cookieValidation.missing, warnings: cookieValidation.warnings, diagnostics: cookieValidation.diagnostics }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!firecrawlKey) {
      return new Response(JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: adminUser } = await supabase.from('admin_users').select('is_active').eq('user_id', userData.user.id).single();
    if (!adminUser?.is_active) {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const url = buildDealsuitUrl(filters);
    const scrapeResult = await scrapeWithRetry(url, session_cookie, firecrawlKey);
    
    if (!scrapeResult.success) {
      let suggestion = '';
      if (scrapeResult.error?.includes('timeout')) suggestion = ' Intenta de nuevo.';
      else if (scrapeResult.error === 'rate_limited') suggestion = ' Espera 5-10 minutos.';
      return new Response(JSON.stringify({ success: false, error: scrapeResult.error, message: (scrapeResult.error || '') + suggestion, attempts: scrapeResult.attempt, can_retry: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { markdown, html } = scrapeResult;
    if (isLoginPage(markdown)) {
      return new Response(JSON.stringify({ success: false, error: 'session_expired', message: 'Cookie inválida o expirada.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (isCaptchaPage(markdown)) {
      return new Response(JSON.stringify({ success: false, error: 'captcha_detected', message: 'Captcha detectado.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (dry_run) {
      return new Response(JSON.stringify({ success: true, dry_run: true, is_authenticated: true, content_length: markdown?.length || 0, preview: markdown?.substring(0, 5000), attempts: scrapeResult.attempt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const extractionResult = await extractDealsWithAI(markdown!);

    if (extractionResult.deals.length === 0) {
      return new Response(JSON.stringify({ success: true, deals: [], total_found: 0, warning: 'no_deals_found', has_more_pages: extractionResult.has_more_pages, attempts: scrapeResult.attempt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let inserted = 0, updated = 0;
    for (const deal of extractionResult.deals) {
      const { data: existing } = await supabase.from('dealsuite_deals').select('id').eq('deal_id', deal.deal_id).single();
      const dealData = { deal_id: deal.deal_id, title: deal.title, sector: deal.sector, country: deal.country, ebitda_min: deal.ebitda_min, ebitda_max: deal.ebitda_max, revenue_min: deal.revenue_min, revenue_max: deal.revenue_max, deal_type: deal.deal_type, advisor: deal.advisor, description: deal.description, published_at: deal.published_at, detail_url: deal.detail_url, source_url: url, scraped_at: new Date().toISOString(), raw_data: deal };
      if (existing) { await supabase.from('dealsuite_deals').update(dealData).eq('id', existing.id); updated++; }
      else { await supabase.from('dealsuite_deals').insert(dealData); inserted++; }
    }

    return new Response(JSON.stringify({ success: true, extracted: extractionResult.deals.length, inserted, updated, has_more_pages: extractionResult.has_more_pages, warnings: extractionResult.warnings, attempts: scrapeResult.attempt }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[DEALSUITE] Error:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Retry configuration with increasing wait times
const RETRY_CONFIG = {
  maxAttempts: 3,
  waitTimes: [30000, 45000, 60000], // 30s, 45s, 60s progressive wait
  baseTimeout: 120000, // 120 seconds total timeout (Firecrawl max)
};

interface DealRecord {
  deal_id: string;
  title: string;
  sector: string | null;
  country: string | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  deal_type: string | null;
  advisor: string | null;
  description: string | null;
  published_at: string | null;
  detail_url: string | null;
}

interface ExtractionResult {
  deals: DealRecord[];
  total_found: number;
  has_more_pages: boolean;
  warnings: string[];
}

interface ScrapeResult {
  success: boolean;
  markdown?: string;
  html?: string;
  error?: string;
  attempt?: number;
}

function buildDealsuitUrl(filters?: Record<string, string>): string {
  const baseUrl = 'https://app.dealsuite.com/en/market/wanted';
  const defaultParams = {
    currency: '1',
    continents: '3',
    ebitda_in_percentage: '1'
  };
  
  const params = { ...defaultParams, ...filters };
  const queryString = new URLSearchParams(params).toString();
  
  return `${baseUrl}?${queryString}`;
}

function isLoginPage(content: string | undefined): boolean {
  if (!content) return true;
  
  const loginIndicators = [
    'sign in',
    'login',
    'log in',
    'enter your email',
    'forgot password',
    'create account',
    'register now'
  ];
  
  const lowerContent = content.toLowerCase();
  const hasLoginIndicator = loginIndicators.some(indicator => lowerContent.includes(indicator));
  
  // También verificar que NO tiene contenido de deals
  const hasDealContent = lowerContent.includes('wanted') && 
    (lowerContent.includes('ebitda') || lowerContent.includes('revenue') || lowerContent.includes('sector'));
  
  return hasLoginIndicator && !hasDealContent;
}

function isCaptchaPage(content: string | undefined): boolean {
  if (!content) return false;
  
  const captchaIndicators = [
    'captcha',
    'verify you are human',
    'robot',
    'recaptcha',
    'hcaptcha',
    'cloudflare'
  ];
  
  const lowerContent = content.toLowerCase();
  return captchaIndicators.some(indicator => lowerContent.includes(indicator));
}

async function scrapeWithRetry(
  url: string,
  sessionCookie: string,
  firecrawlKey: string,
  attempt: number = 1
): Promise<ScrapeResult> {
  const waitFor = RETRY_CONFIG.waitTimes[attempt - 1] || 60000;
  
  console.log(`[DEALSUITE] Scrape attempt ${attempt}/${RETRY_CONFIG.maxAttempts} with waitFor: ${waitFor}ms`);
  
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
        waitFor,
        timeout: RETRY_CONFIG.baseTimeout,
        onlyMainContent: false,
        headers: {
          'Cookie': sessionCookie,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
          'Referer': 'https://app.dealsuite.com/',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      }),
    });

    // Check for timeout or scrape failure
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEALSUITE] Firecrawl error on attempt ${attempt}:`, response.status, errorText);
      
      const isTimeout = errorText.includes('timeout') || 
                        errorText.includes('408') ||
                        response.status === 408;
      
      if (isTimeout && attempt < RETRY_CONFIG.maxAttempts) {
        console.log(`[DEALSUITE] Timeout on attempt ${attempt}, retrying with longer wait...`);
        await new Promise(r => setTimeout(r, 3000)); // Wait 3s before retry
        return scrapeWithRetry(url, sessionCookie, firecrawlKey, attempt + 1);
      }
      
      // Rate limit - no retry
      if (response.status === 429) {
        return { 
          success: false, 
          error: 'rate_limited',
          attempt 
        };
      }
      
      return { 
        success: false, 
        error: `Firecrawl error: ${response.status}`,
        attempt 
      };
    }

    const scrapeData = await response.json();
    const markdown = scrapeData.data?.markdown || scrapeData.markdown;
    const html = scrapeData.data?.html || scrapeData.html;
    
    // Check if we got valid content
    if (!markdown || markdown.length < 200) {
      if (attempt < RETRY_CONFIG.maxAttempts) {
        console.log(`[DEALSUITE] Empty or short content on attempt ${attempt} (${markdown?.length || 0} chars), retrying...`);
        await new Promise(r => setTimeout(r, 3000));
        return scrapeWithRetry(url, sessionCookie, firecrawlKey, attempt + 1);
      }
      return { 
        success: false, 
        error: 'No content retrieved from page',
        attempt 
      };
    }

    console.log(`[DEALSUITE] Successfully scraped ${markdown.length} characters on attempt ${attempt}`);
    return { 
      success: true, 
      markdown, 
      html,
      attempt 
    };
    
  } catch (error) {
    console.error(`[DEALSUITE] Error on attempt ${attempt}:`, error);
    
    if (attempt < RETRY_CONFIG.maxAttempts) {
      await new Promise(r => setTimeout(r, 3000));
      return scrapeWithRetry(url, sessionCookie, firecrawlKey, attempt + 1);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown scrape error',
      attempt 
    };
  }
}

async function extractDealsWithAI(content: string, openaiKey: string): Promise<ExtractionResult> {
  const systemPrompt = `Eres un analista de M&A especializado en deal sourcing.

Tu objetivo es extraer deals del marketplace "Wanted" de Dealsuite.

Reglas: precisión > completitud. No inventes datos. Si un campo no está disponible, usa null.

TASK
1) Identifica todos los deals listados en la página
2) Para cada deal, extrae:
   - deal_id (string) - ID único (de URL, número de referencia, o genera uno basado en título)
   - title (string) - Título del deal
   - sector (string|null) - Industria/sector
   - country (string|null) - País
   - ebitda_min (number|null) - EBITDA mínimo en miles de euros
   - ebitda_max (number|null) - EBITDA máximo en miles de euros
   - revenue_min (number|null) - Facturación mínima en miles de euros
   - revenue_max (number|null) - Facturación máxima en miles de euros
   - deal_type (string|null) - Tipo: MBO, MBI, Acquisition, Strategic Buyer, etc.
   - advisor (string|null) - Asesor/firma que lista el deal
   - description (string|null) - Descripción resumida del deal
   - published_at (string|null) - Fecha ISO si aparece
   - detail_url (string|null) - URL completa al detalle del deal

CONVERSIÓN DE VALORES:
- Si ves "1M" o "1 million" → 1000 (miles)
- Si ves "500K" o "500.000" → 500 (miles)
- Si ves un rango como "1-5M EBITDA" → ebitda_min: 1000, ebitda_max: 5000

SCHEMA OBLIGATORIO:
{
  "deals": [DealRecord],
  "total_found": number,
  "has_more_pages": boolean,
  "warnings": [string]
}

Responde SOLO con JSON válido, sin markdown ni comentarios.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extrae los deals de este contenido de Dealsuite:\n\n${content.substring(0, 30000)}` }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const resultText = data.choices?.[0]?.message?.content;

  if (!resultText) {
    throw new Error('No response from OpenAI');
  }

  // Limpiar posible markdown
  let cleanJson = resultText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.slice(7);
  }
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.slice(3);
  }
  if (cleanJson.endsWith('```')) {
    cleanJson = cleanJson.slice(0, -3);
  }

  try {
    return JSON.parse(cleanJson.trim());
  } catch (e) {
    console.error('Failed to parse AI response:', cleanJson);
    throw new Error('Failed to parse AI extraction result');
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { session_cookie, filters, dry_run } = body;

    // Validate session cookie
    if (!session_cookie || typeof session_cookie !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'session_cookie es requerida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API keys
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'OPENAI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('is_active')
      .eq('user_id', userData.user.id)
      .single();

    if (!adminUser?.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build URL
    const url = buildDealsuitUrl(filters);
    console.log('[DEALSUITE] Scraping URL:', url);

    // Scrape with retry logic
    const scrapeResult = await scrapeWithRetry(url, session_cookie, firecrawlKey);
    
    if (!scrapeResult.success) {
      // Provide helpful error messages
      let errorMessage = scrapeResult.error || 'Scrape failed';
      let suggestion = '';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('408')) {
        suggestion = ' La página tardó demasiado en cargar. Intenta de nuevo más tarde o durante horas de menor tráfico.';
      } else if (errorMessage === 'rate_limited') {
        suggestion = ' Se ha excedido el límite de peticiones de Firecrawl. Espera unos minutos antes de reintentar.';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'scrape_failed', 
          message: errorMessage + suggestion,
          attempts: scrapeResult.attempt
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { markdown, html } = scrapeResult;

    // Check for login page
    if (isLoginPage(markdown)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'session_expired', 
          message: 'Cookie inválida o expirada. El contenido devuelto parece ser una página de login.',
          preview: markdown?.substring(0, 500)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for captcha
    if (isCaptchaPage(markdown)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'captcha_detected', 
          message: 'Dealsuite ha mostrado un captcha. Intenta de nuevo más tarde.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If dry run, return preview
    if (dry_run) {
      return new Response(
        JSON.stringify({
          success: true,
          dry_run: true,
          is_authenticated: true,
          content_length: markdown?.length || 0,
          preview: markdown?.substring(0, 5000),
          html_preview: html?.substring(0, 2000),
          attempts: scrapeResult.attempt
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract deals with AI
    console.log('[DEALSUITE] Extracting deals with AI...');
    const extractionResult = await extractDealsWithAI(markdown!, openaiKey);
    console.log(`[DEALSUITE] Extracted ${extractionResult.deals.length} deals`);

    if (extractionResult.deals.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          deals: [],
          total_found: 0,
          warning: 'no_deals_found',
          has_more_pages: extractionResult.has_more_pages,
          extraction_warnings: extractionResult.warnings,
          attempts: scrapeResult.attempt
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert deals to database
    let inserted = 0;
    let updated = 0;

    for (const deal of extractionResult.deals) {
      const { data: existing } = await supabase
        .from('dealsuite_deals')
        .select('id')
        .eq('deal_id', deal.deal_id)
        .single();

      const dealData = {
        deal_id: deal.deal_id,
        title: deal.title,
        sector: deal.sector,
        country: deal.country,
        ebitda_min: deal.ebitda_min,
        ebitda_max: deal.ebitda_max,
        revenue_min: deal.revenue_min,
        revenue_max: deal.revenue_max,
        deal_type: deal.deal_type,
        advisor: deal.advisor,
        description: deal.description,
        published_at: deal.published_at,
        detail_url: deal.detail_url,
        source_url: url,
        scraped_at: new Date().toISOString(),
        raw_data: deal
      };

      if (existing) {
        await supabase
          .from('dealsuite_deals')
          .update(dealData)
          .eq('id', existing.id);
        updated++;
      } else {
        await supabase
          .from('dealsuite_deals')
          .insert(dealData);
        inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        extracted: extractionResult.deals.length,
        inserted,
        updated,
        has_more_pages: extractionResult.has_more_pages,
        warnings: extractionResult.warnings,
        attempts: scrapeResult.attempt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[DEALSUITE] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

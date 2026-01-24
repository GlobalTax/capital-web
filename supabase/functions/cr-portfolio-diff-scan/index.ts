import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let fund_id: string | null = null;
    let limit = 10;
    let force_scan = false; // PHASE 4: Option to bypass cache check
    
    try {
      const body = await req.json();
      fund_id = body.fund_id || null;
      limit = body.limit || limit;
      force_scan = body.force_scan || false;
    } catch {
      // No body, use defaults
    }

    console.log(`[cr-portfolio-diff-scan] Starting optimized diff scan. Fund: ${fund_id || 'all'}, Limit: ${limit}, Force: ${force_scan}`);

    // Get funds with portfolio URL
    let query = supabase
      .from('cr_funds')
      .select('id, name, website, portfolio_url, last_web_etag, last_web_modified, last_diff_scan_at')
      .eq('is_deleted', false)
      .eq('portfolio_diff_enabled', true)
      .not('portfolio_url', 'is', null);

    if (fund_id) {
      query = query.eq('id', fund_id);
    }

    query = query
      .order('last_diff_scan_at', { ascending: true, nullsFirst: true })
      .limit(limit);

    const { data: funds, error: fundsError } = await query;

    if (fundsError) {
      console.error('[cr-portfolio-diff-scan] Error fetching funds:', fundsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch funds' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!funds || funds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No funds with portfolio_url configured or portfolio_diff_enabled', 
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[cr-portfolio-diff-scan] Found ${funds.length} funds to compare`);

    const results: DiffResult[] = [];
    let totalCreditsUsed = 0;
    let skippedCount = 0;

    for (const fund of funds) {
      try {
        // PHASE 4: Check if website has changed before scraping
        if (!force_scan && fund.last_web_etag) {
          const hasChanged = await checkWebsiteChanged(
            fund.portfolio_url,
            fund.last_web_etag,
            fund.last_web_modified
          );

          if (!hasChanged) {
            console.log(`[cr-portfolio-diff-scan] Skipping ${fund.name} - no changes detected`);
            results.push({
              fund_id: fund.id,
              fund_name: fund.name,
              new_companies: 0,
              possible_exits: 0,
              skipped: true,
              skip_reason: 'No website changes detected',
            });
            skippedCount++;

            // Update last scan time but keep etag
            await supabase
              .from('cr_funds')
              .update({ last_diff_scan_at: new Date().toISOString() })
              .eq('id', fund.id);

            continue;
          }
        }

        const { result, creditsUsed, webHeaders } = await compareFundPortfolio(
          fund, 
          firecrawlApiKey, 
          supabase
        );
        
        totalCreditsUsed += creditsUsed;

        // Update last diff timestamp and web headers
        await supabase
          .from('cr_funds')
          .update({ 
            last_diff_scan_at: new Date().toISOString(),
            last_web_etag: webHeaders.etag || fund.last_web_etag,
            last_web_modified: webHeaders.lastModified || fund.last_web_modified,
          })
          .eq('id', fund.id);

        results.push(result);
      } catch (error: any) {
        console.error(`[cr-portfolio-diff-scan] Error comparing ${fund.name}:`, error);
        results.push({
          fund_id: fund.id,
          fund_name: fund.name,
          new_companies: 0,
          possible_exits: 0,
          error: error.message,
        });
      }

      // Delay between funds to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // PHASE 5: Log API usage
    await logApiUsage(supabase, 'firecrawl', 'scrape', totalCreditsUsed, 'cr-portfolio-diff-scan', { 
      funds_scanned: funds.length - skippedCount,
      funds_skipped: skippedCount,
      optimization: 'selective_diff',
    });

    const totalNewCompanies = results.reduce((sum, r) => sum + r.new_companies, 0);
    const totalExits = results.reduce((sum, r) => sum + r.possible_exits, 0);

    // Create notification if changes detected
    if (totalNewCompanies > 0 || totalExits > 0) {
      await supabase.from('admin_notifications_news').insert({
        type: 'portfolio_diff',
        title: `🔄 Cambios detectados en portfolios`,
        message: `${totalNewCompanies} posibles nuevas adquisiciones, ${totalExits} posibles exits en ${funds.length - skippedCount} fondos (${skippedCount} sin cambios). Créditos: ${totalCreditsUsed}`,
        metadata: {
          scan_type: 'portfolio_diff',
          funds_scanned: funds.length - skippedCount,
          funds_skipped: skippedCount,
          new_companies: totalNewCompanies,
          possible_exits: totalExits,
          credits_used: totalCreditsUsed,
          optimization: 'selective_diff',
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          funds_scanned: funds.length,
          funds_actually_scraped: funds.length - skippedCount,
          funds_skipped: skippedCount,
          total_new_companies: totalNewCompanies,
          total_possible_exits: totalExits,
          credits_used: totalCreditsUsed,
          results,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[cr-portfolio-diff-scan] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// PHASE 4: Check if website has changed using HEAD request (free!)
async function checkWebsiteChanged(
  url: string,
  lastEtag: string | null,
  lastModified: string | null
): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Capittal-Portfolio-Monitor/1.0',
      },
    });

    if (!response.ok) {
      // If HEAD fails, assume changed to be safe
      return true;
    }

    const currentEtag = response.headers.get('ETag');
    const currentModified = response.headers.get('Last-Modified');

    // Check if ETag changed
    if (lastEtag && currentEtag && lastEtag === currentEtag) {
      return false;
    }

    // Check if Last-Modified changed
    if (lastModified && currentModified && lastModified === currentModified) {
      return false;
    }

    // If no cache headers available, consider as potentially changed
    return true;
  } catch (e) {
    console.warn('[cr-portfolio-diff-scan] HEAD request failed:', e);
    // If HEAD fails, proceed with full scrape
    return true;
  }
}

async function compareFundPortfolio(
  fund: { id: string; name: string; portfolio_url: string },
  firecrawlApiKey: string,
  supabase: any
): Promise<{ result: DiffResult; creditsUsed: number; webHeaders: { etag?: string; lastModified?: string } }> {
  console.log(`[cr-portfolio-diff-scan] Scraping portfolio from: ${fund.portfolio_url}`);

  // 1. Scrape current portfolio from website
  const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: fund.portfolio_url,
      formats: ['markdown'],
    }),
  });

  const scrapeData = await scrapeResponse.json();

  // 1 scrape = 1 credit
  const creditsUsed = 1;

  if (!scrapeResponse.ok || !scrapeData.success) {
    throw new Error(scrapeData.error || 'Scrape failed');
  }

  const markdown = scrapeData.data?.markdown || '';
  const webHeaders = {
    etag: scrapeData.data?.metadata?.etag,
    lastModified: scrapeData.data?.metadata?.lastModified,
  };

  // 2. Get existing portfolio companies from DB
  const { data: existingCompanies, error: dbError } = await supabase
    .from('cr_portfolio')
    .select('id, company_name, status')
    .eq('fund_id', fund.id)
    .eq('is_deleted', false);

  if (dbError) {
    throw new Error('Failed to fetch existing portfolio');
  }

  const existingNames = new Set(
    (existingCompanies || []).map((c: any) => normalizeCompanyName(c.company_name))
  );

  // 3. Use AI to extract company names from scraped content
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  const systemPrompt = `Extrae los nombres de empresas del portfolio del fondo "${fund.name}" del siguiente contenido.
Responde SOLO con un JSON array de strings con los nombres de las empresas.
Ejemplo: ["Empresa 1", "Empresa 2", "Empresa 3"]
Solo incluye empresas que claramente sean participadas/portfolio companies. Excluye:
- El nombre del propio fondo
- Socios/partners
- Asesores
- Empresas mencionadas como clientes o proveedores`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: markdown.slice(0, 15000) } // Limit content size
  ];

  let extractedCompanies: string[] = [];

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
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          try {
            extractedCompanies = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
            await logApiUsage(supabase, 'lovable_ai', 'extract', 1, 'cr-portfolio-diff-scan', {
              model: 'google/gemini-2.5-flash',
              fund_id: fund.id,
            });
          } catch {
            console.warn('[cr-portfolio-diff-scan] Failed to parse AI response');
          }
        }
      }
    } catch (e) {
      console.warn('[cr-portfolio-diff-scan] Lovable AI failed:', e);
    }
  }

  // Fallback to OpenAI
  if (extractedCompanies.length === 0 && openaiApiKey) {
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
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          try {
            extractedCompanies = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
            await logApiUsage(supabase, 'openai', 'extract', 1, 'cr-portfolio-diff-scan', {
              model: 'gpt-4o-mini',
              fund_id: fund.id,
            });
          } catch {
            console.warn('[cr-portfolio-diff-scan] Failed to parse OpenAI response');
          }
        }
      }
    } catch (e) {
      console.error('[cr-portfolio-diff-scan] OpenAI failed:', e);
    }
  }

  if (extractedCompanies.length === 0) {
    return {
      result: {
        fund_id: fund.id,
        fund_name: fund.name,
        new_companies: 0,
        possible_exits: 0,
      },
      creditsUsed,
      webHeaders,
    };
  }

  const extractedNamesNormalized = new Set(extractedCompanies.map(normalizeCompanyName));

  // 4. Detect new companies (on web but not in DB)
  const newCompanies = extractedCompanies.filter(
    name => !existingNames.has(normalizeCompanyName(name))
  );

  // 5. Detect possible exits (in DB as active but not on web)
  const possibleExits: string[] = [];
  for (const company of existingCompanies || []) {
    if (company.status === 'ACTIVO') {
      const normalized = normalizeCompanyName(company.company_name);
      if (!extractedNamesNormalized.has(normalized)) {
        possibleExits.push(company.company_name);
      }
    }
  }

  // 6. Save detected changes
  for (const companyName of newCompanies) {
    await supabase.from('portfolio_changes').upsert({
      fund_id: fund.id,
      change_type: 'new_company',
      company_name: companyName,
      company_name_normalized: normalizeCompanyName(companyName),
      detected_data: { source: 'web_scrape', url: fund.portfolio_url },
      metadata: { extracted_from: 'portfolio_diff_scan' },
    }, {
      onConflict: 'fund_id,company_name_normalized,change_type',
      ignoreDuplicates: true,
    });
  }

  for (const companyName of possibleExits) {
    const existingCompany = (existingCompanies || []).find(
      (c: any) => c.company_name === companyName
    );
    
    await supabase.from('portfolio_changes').upsert({
      fund_id: fund.id,
      change_type: 'exit',
      company_name: companyName,
      company_name_normalized: normalizeCompanyName(companyName),
      existing_portfolio_id: existingCompany?.id,
      detected_data: { source: 'web_comparison', url: fund.portfolio_url },
      metadata: { extracted_from: 'portfolio_diff_scan' },
    }, {
      onConflict: 'fund_id,company_name_normalized,change_type',
      ignoreDuplicates: true,
    });
  }

  console.log(`[cr-portfolio-diff-scan] ${fund.name}: ${newCompanies.length} new, ${possibleExits.length} possible exits`);

  return {
    result: {
      fund_id: fund.id,
      fund_name: fund.name,
      new_companies: newCompanies.length,
      possible_exits: possibleExits.length,
    },
    creditsUsed,
    webHeaders,
  };
}

function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ')
    .replace(/\b(s\.?l\.?|s\.?a\.?|s\.?l\.?u\.?|inc\.?|ltd\.?|gmbh|corp\.?)\b/gi, '')
    .trim();
}

// PHASE 5: Log API usage
async function logApiUsage(
  supabase: any,
  service: string,
  operation: string,
  credits: number,
  functionName: string,
  metadata: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('api_usage_log').insert({
      service,
      operation,
      credits_used: credits,
      function_name: functionName,
      metadata,
    });
  } catch (e) {
    console.warn('[cr-portfolio-diff-scan] Failed to log API usage:', e);
  }
}

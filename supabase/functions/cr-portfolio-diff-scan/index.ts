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
    
    try {
      const body = await req.json();
      fund_id = body.fund_id || null;
      limit = body.limit || limit;
    } catch {
      // No body, use defaults
    }

    console.log(`[cr-portfolio-diff-scan] Starting diff scan. Fund: ${fund_id || 'all'}, Limit: ${limit}`);

    // Get funds with portfolio URL
    let query = supabase
      .from('cr_funds')
      .select('id, name, website, portfolio_url')
      .eq('is_deleted', false)
      .eq('portfolio_diff_enabled', true)
      .not('portfolio_url', 'is', null);

    if (fund_id) {
      query = query.eq('id', fund_id);
    }

    query = query
      .order('last_portfolio_diff_at', { ascending: true, nullsFirst: true })
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

    for (const fund of funds) {
      try {
        const result = await compareFundPortfolio(fund, firecrawlApiKey, supabase);
        
        // Update last diff timestamp
        await supabase
          .from('cr_funds')
          .update({ last_portfolio_diff_at: new Date().toISOString() })
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

    const totalNewCompanies = results.reduce((sum, r) => sum + r.new_companies, 0);
    const totalExits = results.reduce((sum, r) => sum + r.possible_exits, 0);

    // Create notification if changes detected
    if (totalNewCompanies > 0 || totalExits > 0) {
      await supabase.from('admin_notifications_news').insert({
        type: 'portfolio_diff',
        title: `🔄 Cambios detectados en portfolios`,
        message: `${totalNewCompanies} posibles nuevas adquisiciones, ${totalExits} posibles exits detectados en ${funds.length} fondos.`,
        metadata: {
          scan_type: 'portfolio_diff',
          funds_scanned: funds.length,
          new_companies: totalNewCompanies,
          possible_exits: totalExits,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          funds_scanned: funds.length,
          total_new_companies: totalNewCompanies,
          total_possible_exits: totalExits,
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

async function compareFundPortfolio(
  fund: { id: string; name: string; portfolio_url: string },
  firecrawlApiKey: string,
  supabase: any
): Promise<DiffResult> {
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

  if (!scrapeResponse.ok || !scrapeData.success) {
    throw new Error(scrapeData.error || 'Scrape failed');
  }

  const markdown = scrapeData.data?.markdown || '';

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
  const activeNames = new Set(
    (existingCompanies || [])
      .filter((c: any) => c.status === 'ACTIVO')
      .map((c: any) => normalizeCompanyName(c.company_name))
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
      fund_id: fund.id,
      fund_name: fund.name,
      new_companies: 0,
      possible_exits: 0,
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
    fund_id: fund.id,
    fund_name: fund.name,
    new_companies: newCompanies.length,
    possible_exits: possibleExits.length,
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

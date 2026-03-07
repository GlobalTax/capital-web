import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { fund_id, custom_url } = await req.json();
    if (!fund_id) return new Response(JSON.stringify({ error: 'fund_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) return new Response(JSON.stringify({ error: 'Firecrawl not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: fund } = await supabase.from('cr_funds').select('id, name, website, portfolio_url').eq('id', fund_id).single();
    if (!fund) return new Response(JSON.stringify({ error: 'Fund not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const portfolioUrl = custom_url || fund.portfolio_url || fund.website;
    if (!portfolioUrl) return new Response(JSON.stringify({ error: 'No URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST', headers: { 'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: portfolioUrl, search: 'portfolio investments participadas companies empresas invertidas exits realised', limit: 20, includeSubdomains: false }),
    });

    const mapData = await mapResponse.json();
    if (!mapResponse.ok) return new Response(JSON.stringify({ error: 'Map failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const keywords = ['portfolio', 'participadas', 'investments', 'empresas', 'companies', 'invertidas', 'cartera', 'exits', 'realised', 'realized'];
    const urlsToScrape = (mapData.links || []).filter((u: string) => keywords.some(k => u.toLowerCase().includes(k))).slice(0, 5);
    if (!urlsToScrape.length) urlsToScrape.push(portfolioUrl);

    let allMarkdown = '';
    for (const u of urlsToScrape) {
      try {
        const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST', headers: { 'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: u, formats: ['markdown'], onlyMainContent: true, waitFor: 2000 }),
        });
        const data = await res.json();
        if (res.ok && data.data?.markdown) allMarkdown += `\n\n--- Content from ${u} ---\n\n${data.data.markdown}`;
      } catch (e) { console.error(`Scrape error:`, e); }
    }

    if (!allMarkdown.trim()) return new Response(JSON.stringify({ error: 'No content' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const response = await callAI(
      [
        { role: 'system', content: `Analista de PE. Extrae portfolio. JSON: {"firm_name","extracted_at","current":[{"company_name","status","fund","investment_year","sector","short_description","location_countries":[],"company_detail_url","evidence":[{"field","quote"}],"notes"}],"exited":[],"warnings":[],"coverage":{"detected_sections":[],"current_count":0,"exited_count":0}}` },
        { role: 'user', content: `Participadas de ${fund.name}\nURL: ${portfolioUrl}\nContenido:\n${allMarkdown.substring(0, 20000)}` }
      ],
      { functionName: 'cr-extract-portfolio', preferOpenAI: true, temperature: 0.1, jsonMode: true }
    );

    const result = parseAIJson<any>(response.content);
    const allCompanies = [
      ...(result.current || []).map((c: any) => ({ ...c, mappedStatus: 'active' })),
      ...(result.exited || []).map((c: any) => ({ ...c, mappedStatus: 'exited' }))
    ];

    if (!allCompanies.length) return new Response(JSON.stringify({ success: true, message: 'No companies found', extracted: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    let insertedCount = 0, updatedCount = 0;
    for (const c of allCompanies) {
      if (!c.company_name) continue;
      const notes = c.evidence?.length ? `${c.notes || ''}\n\n[Evidence]: ${JSON.stringify(c.evidence)}`.trim() : c.notes;
      const { data: ext } = await supabase.from('cr_portfolio').select('id').eq('fund_id', fund_id).ilike('company_name', c.company_name).maybeSingle();
      const cData = { website: c.company_detail_url, sector: c.sector, country: c.location_countries?.[0], status: c.mappedStatus, investment_year: c.investment_year, description: c.short_description, fund_name: c.fund, source_url: portfolioUrl, notes };
      if (ext) { await supabase.from('cr_portfolio').update({ ...cData, updated_at: new Date().toISOString() }).eq('id', ext.id); updatedCount++; }
      else { await supabase.from('cr_portfolio').insert({ fund_id, company_name: c.company_name, ...cData }); insertedCount++; }
    }

    await supabase.from('cr_funds').update({ last_portfolio_scraped_at: new Date().toISOString() }).eq('id', fund_id);

    return new Response(JSON.stringify({ success: true, extracted: allCompanies.length, inserted: insertedCount, updated: updatedCount, companies: allCompanies }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fund_id, custom_url } = await req.json();

    if (!fund_id) return new Response(JSON.stringify({ error: 'fund_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) return new Response(JSON.stringify({ error: 'Firecrawl not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: fund } = await supabase.from('sf_funds').select('id, name, website, portfolio_url').eq('id', fund_id).single();
    if (!fund) return new Response(JSON.stringify({ error: 'Fund not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const portfolioUrl = custom_url || fund.portfolio_url || fund.website;
    if (!portfolioUrl) return new Response(JSON.stringify({ error: 'Fund has no URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST', headers: { 'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: portfolioUrl, search: 'portfolio acquisitions adquisiciones companies empresas track record exits realized deal', limit: 20, includeSubdomains: false }),
    });

    const mapData = await mapResponse.json();
    if (!mapResponse.ok) return new Response(JSON.stringify({ error: 'Map failed', details: mapData }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const keywords = ['portfolio', 'acquisitions', 'adquisiciones', 'companies', 'empresas', 'track-record', 'exits', 'deal', 'investment', 'case-study'];
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
      } catch (e) { console.error(`Scrape error ${u}:`, e); }
    }

    if (!allMarkdown.trim()) return new Response(JSON.stringify({ error: 'No content found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const response = await callAI(
      [
        { role: 'system', content: `Analista de M&A y Search Funds. Extrae empresas del portfolio. Responde JSON: {"fund_name","extracted_at","owned":[{"company_name","status","fund_name","deal_year","sector","short_description","location_country","location_region","company_website","company_detail_url","evidence":[{"field","quote"}],"notes"}],"exited":[],"warnings":[],"coverage":{"detected_sections":[],"owned_count":0,"exited_count":0}}` },
        { role: 'user', content: `Portfolio: ${portfolioUrl}\nContenido:\n${allMarkdown.substring(0, 20000)}` }
      ],
      { functionName: 'sf-extract-portfolio', preferOpenAI: true, temperature: 0.1, jsonMode: true }
    );

    const extractionResult = parseAIJson<any>(response.content);
    const allCompanies = [
      ...(extractionResult.owned || []).map((c: any) => ({ ...c, mappedStatus: 'owned' })),
      ...(extractionResult.exited || []).map((c: any) => ({ ...c, mappedStatus: 'exited' }))
    ];

    if (!allCompanies.length) return new Response(JSON.stringify({ success: true, message: 'No companies found', extracted: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    let insertedCount = 0, updatedCount = 0, skippedCount = 0;
    for (const c of allCompanies) {
      if (!c.company_name) { skippedCount++; continue; }
      const evJson = c.evidence?.length ? JSON.stringify(c.evidence) : null;
      const notes = evJson ? `${c.notes || ''}\n\n[Evidence]: ${evJson}`.trim() : c.notes;

      const { data: ext } = await supabase.from('sf_acquisitions').select('id').eq('fund_id', fund_id).ilike('company_name', c.company_name).maybeSingle();
      const compData = { website: c.company_website, sector: c.sector, country: c.location_country, region: c.location_region, status: c.mappedStatus, deal_year: c.deal_year, description: c.short_description, fund_name: c.fund_name, source_url: portfolioUrl, notes };

      if (ext) {
        await supabase.from('sf_acquisitions').update({ ...compData, updated_at: new Date().toISOString() }).eq('id', ext.id);
        updatedCount++;
      } else {
        await supabase.from('sf_acquisitions').insert({ fund_id, company_name: c.company_name, ...compData, deal_type: 'unknown' });
        insertedCount++;
      }
    }

    await supabase.from('sf_funds').update({ last_portfolio_scraped_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', fund_id);

    return new Response(JSON.stringify({ success: true, extracted: allCompanies.length, inserted: insertedCount, updated: updatedCount, skipped: skippedCount, companies: allCompanies }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

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
    const { fund_id, raw_text, fund_name } = await req.json();
    if (!fund_id || !raw_text || raw_text.length < 50) return new Response(JSON.stringify({ error: 'fund_id and raw_text (>50 chars) required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: fund } = await supabase.from('cr_funds').select('id, name').eq('id', fund_id).single();
    if (!fund) return new Response(JSON.stringify({ error: 'Fund not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const effectiveName = fund_name || fund.name;

    const response = await callAI(
      [
        { role: 'system', content: `Analista PE. Extrae portfolio de texto. JSON: {"firm_name","extracted_at","current":[{"company_name","status","fund","investment_year","sector","short_description","location_countries":[],"company_detail_url","evidence":[{"field","quote"}],"notes"}],"exited":[],"warnings":[],"coverage":{"detected_sections":[],"current_count":0,"exited_count":0}}` },
        { role: 'user', content: `Extrae participadas de ${effectiveName}.\n\nTexto:\n${raw_text.substring(0, 25000)}` }
      ],
      { functionName: 'cr-extract-portfolio-from-text', preferOpenAI: true, temperature: 0.1, jsonMode: true }
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
      const cData = { website: c.company_detail_url, sector: c.sector, country: c.location_countries?.[0], status: c.mappedStatus, investment_year: c.investment_year, description: c.short_description, fund_name: c.fund, source_url: 'manual_text_import', notes };
      
      if (ext) { await supabase.from('cr_portfolio').update({ ...cData, updated_at: new Date().toISOString() }).eq('id', ext.id); updatedCount++; }
      else { await supabase.from('cr_portfolio').insert({ fund_id, company_name: c.company_name, ...cData }); insertedCount++; }
    }

    await supabase.from('cr_funds').update({ last_portfolio_scraped_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', fund_id);

    return new Response(JSON.stringify({ success: true, extracted: allCompanies.length, inserted: insertedCount, updated: updatedCount, companies: allCompanies }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

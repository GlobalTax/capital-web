import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, extractToolCallArgs, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function searchFirecrawl(query: string, apiKey: string): Promise<string> {
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 5, lang: 'es', country: 'ES', scrapeOptions: { formats: ['markdown'] } }),
    });
    const data = await res.json();
    return (data.data || data.results || []).map((r: any) => `URL: ${r.url || ''}\nTitle: ${r.title || ''}\n${(r.markdown || r.description || '').slice(0, 1500)}`).join('\n---\n').slice(0, 6000);
  } catch { return ''; }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { companies } = await req.json();
    if (!companies?.length) return new Response(JSON.stringify({ error: 'companies required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) throw new Error('Firecrawl not configured');

    const results = [];
    for (const company of companies) {
      const cifPart = company.client_cif ? ` ${company.client_cif}` : '';
      let searchContent = await searchFirecrawl(`"${company.client_company}"${cifPart} contacto email teléfono site:.es`, FIRECRAWL_API_KEY);
      if (searchContent.length < 200) searchContent += '\n---\n' + await searchFirecrawl(`"${company.client_company}" empresa España contacto`, FIRECRAWL_API_KEY);

      const missingFields = [];
      if (!company.client_email) missingFields.push('contact_email');
      if (!company.client_name) missingFields.push('contact_name');
      if (!company.client_phone) missingFields.push('contact_phone');
      if (!company.client_cif) missingFields.push('cif');

      let found = false;
      let updates = {};

      if (searchContent) {
        const response = await callAI(
          [
            { role: "system", content: "Extraes datos de contacto empresarial de España de contenido web." },
            { role: "user", content: `Empresa: "${company.client_company}"\nCampos: ${missingFields.join(', ')}\n\nContenido:\n${searchContent || 'N/A'}` },
          ],
          {
            functionName: 'enrich-campaign-companies-data',
            tools: [{
              type: "function",
              function: {
                name: "extract_contact_data",
                parameters: {
                  type: "object", properties: { contact_name: { type: "string" }, contact_email: { type: "string" }, contact_phone: { type: "string" }, cif: { type: "string" }, confidence: { type: "string", enum: ["high", "medium", "low"] } },
                  required: ["contact_name", "contact_email", "contact_phone", "cif", "confidence"], additionalProperties: false,
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "extract_contact_data" } }
          }
        );

        const extracted = extractToolCallArgs<any>(response);
        if (extracted) {
          updates = {};
          if (!company.client_email && extracted.contact_email) (updates as any).client_email = extracted.contact_email;
          if (!company.client_name && extracted.contact_name) (updates as any).client_name = extracted.contact_name;
          if (!company.client_phone && extracted.contact_phone) (updates as any).client_phone = extracted.contact_phone;
          if (!company.client_cif && extracted.cif) (updates as any).client_cif = extracted.cif;
          found = Object.keys(updates).length > 0;
        }
      }

      results.push({ id: company.id, data: updates, found });
      if (companies.indexOf(company) < companies.length - 1) await new Promise(r => setTimeout(r, 1500));
    }

    return new Response(JSON.stringify({ results, enrichedCount: results.filter(r => r.found).length, total: results.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

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

// Default fields (backward compat)
const CONTACT_FIELDS = ['client_email', 'client_name', 'client_phone', 'client_cif'];

function buildSearchQuery(company: any, fields: string[]): string {
  const name = `"${company.client_company}"`;
  const cifPart = company.client_cif ? ` ${company.client_cif}` : '';

  const hasContact = fields.some(f => CONTACT_FIELDS.includes(f));
  const hasWebsite = fields.includes('client_website');
  const hasProvincia = fields.includes('client_provincia');

  const parts: string[] = [name];
  if (cifPart) parts.push(cifPart);

  if (hasContact) parts.push('contacto email teléfono');
  if (hasWebsite) parts.push('sitio web oficial');
  if (hasProvincia) parts.push('ubicación sede provincia');
  if (!hasContact && !hasWebsite && !hasProvincia) parts.push('empresa España');

  parts.push('site:.es');
  return parts.join(' ');
}

function buildToolProperties(fields: string[]) {
  const props: Record<string, any> = {};
  const required: string[] = [];

  if (fields.includes('client_name')) { props.contact_name = { type: "string" }; required.push('contact_name'); }
  if (fields.includes('client_email')) { props.contact_email = { type: "string" }; required.push('contact_email'); }
  if (fields.includes('client_phone')) { props.contact_phone = { type: "string" }; required.push('contact_phone'); }
  if (fields.includes('client_cif')) { props.cif = { type: "string" }; required.push('cif'); }
  if (fields.includes('client_website')) { props.website = { type: "string", description: "URL del sitio web oficial de la empresa" }; required.push('website'); }
  if (fields.includes('client_provincia')) { props.provincia = { type: "string", description: "Provincia o comunidad autónoma donde tiene su sede la empresa" }; required.push('provincia'); }

  props.confidence = { type: "string", enum: ["high", "medium", "low"] };
  required.push('confidence');

  return { props, required };
}

function buildMissingFieldsDescription(company: any, fields: string[]): string[] {
  const missing: string[] = [];
  if (fields.includes('client_email') && !company.client_email) missing.push('contact_email');
  if (fields.includes('client_name') && !company.client_name) missing.push('contact_name');
  if (fields.includes('client_phone') && !company.client_phone) missing.push('contact_phone');
  if (fields.includes('client_cif') && !company.client_cif) missing.push('cif');
  if (fields.includes('client_website') && !company.client_website) missing.push('website');
  if (fields.includes('client_provincia') && !company.client_provincia) missing.push('provincia');
  return missing;
}

function domainFromEmail(email: string): string | null {
  const match = email.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
  if (!match) return null;
  const domain = match[1].toLowerCase();
  // Skip generic email providers
  const generic = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'yahoo.es', 'hotmail.es', 'live.com', 'icloud.com', 'protonmail.com', 'aol.com', 'msn.com', 'telefonica.net', 'ono.com', 'orange.es', 'movistar.es'];
  if (generic.includes(domain)) return null;
  return domain;
}

function extractUpdates(company: any, extracted: any, fields: string[]): Record<string, string> {
  const updates: Record<string, string> = {};
  if (fields.includes('client_email') && !company.client_email && extracted.contact_email) updates.client_email = extracted.contact_email;
  if (fields.includes('client_name') && !company.client_name && extracted.contact_name) updates.client_name = extracted.contact_name;
  if (fields.includes('client_phone') && !company.client_phone && extracted.contact_phone) updates.client_phone = extracted.contact_phone;
  if (fields.includes('client_cif') && !company.client_cif && extracted.cif) updates.client_cif = extracted.cif;
  if (fields.includes('client_website') && !company.client_website) {
    if (extracted.website) {
      updates.client_website = extracted.website;
    } else {
      // Derive website from email domain (existing or just extracted)
      const email = company.client_email || extracted?.contact_email || '';
      const domain = domainFromEmail(email);
      if (domain) updates.client_website = domain;
    }
  }
  if (fields.includes('client_provincia') && !company.client_provincia && extracted.provincia) updates.client_provincia = extracted.provincia;
  return updates;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { companies, fields } = await req.json();
    if (!companies?.length) return new Response(JSON.stringify({ error: 'companies required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // Default to contact fields for backward compat
    const activeFields: string[] = fields && fields.length > 0 ? fields : CONTACT_FIELDS;

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) throw new Error('Firecrawl not configured');

    const { props, required } = buildToolProperties(activeFields);

    const results = [];
    for (const company of companies) {
      const missingFields = buildMissingFieldsDescription(company, activeFields);

      if (missingFields.length === 0) {
        results.push({ id: company.id, data: {}, found: false });
        continue;
      }

      // Quick path: if only website is missing and we have an email, derive from domain
      const onlyNeedsWebsite = missingFields.length === 1 && missingFields[0] === 'website';
      if (onlyNeedsWebsite && company.client_email) {
        const domain = domainFromEmail(company.client_email);
        if (domain) {
          console.log(`[enrich] ${company.client_company}: web derivada del email → ${domain}`);
          results.push({ id: company.id, data: { client_website: domain }, found: true });
          continue;
        }
      }

      const query = buildSearchQuery(company, activeFields);
      let searchContent = await searchFirecrawl(query, FIRECRAWL_API_KEY);
      if (searchContent.length < 200) {
        searchContent += '\n---\n' + await searchFirecrawl(`"${company.client_company}" empresa España`, FIRECRAWL_API_KEY);
      }

      let found = false;
      let updates: Record<string, string> = {};

      if (searchContent) {
        const systemPrompt = activeFields.includes('client_website') || activeFields.includes('client_provincia')
          ? "Extraes datos empresariales de España de contenido web. Para website, devuelve la URL del sitio oficial. Para provincia, devuelve la provincia española donde tiene su sede."
          : "Extraes datos de contacto empresarial de España de contenido web.";

        const response = await callAI(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Empresa: "${company.client_company}"\nCampos: ${missingFields.join(', ')}\n\nContenido:\n${searchContent || 'N/A'}` },
          ],
          {
            functionName: 'enrich-campaign-companies-data',
            tools: [{
              type: "function",
              function: {
                name: "extract_contact_data",
                parameters: {
                  type: "object", properties: props,
                  required, additionalProperties: false,
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "extract_contact_data" } }
          }
        );

        const extracted = extractToolCallArgs<any>(response);
        if (extracted) {
          updates = extractUpdates(company, extracted, activeFields);
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

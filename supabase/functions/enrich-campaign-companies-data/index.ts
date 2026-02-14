import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CompanyInput {
  id: string;
  client_company: string;
  client_cif?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
}

async function searchFirecrawl(query: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        lang: 'es',
        country: 'ES',
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[enrich-data] Firecrawl error:', response.status, err);
      return '';
    }

    const data = await response.json();
    const results = data.data || data.results || [];
    return results.map((r: any) => {
      const content = r.markdown || r.description || '';
      return `URL: ${r.url || ''}\nTitle: ${r.title || ''}\n${content.slice(0, 1500)}`;
    }).join('\n---\n').slice(0, 6000);
  } catch (e) {
    console.error('[enrich-data] Firecrawl exception:', e);
    return '';
  }
}

async function extractWithAI(company: CompanyInput, searchContent: string, lovableKey: string) {
  const missingFields: string[] = [];
  if (!company.client_email) missingFields.push('contact_email');
  if (!company.client_name) missingFields.push('contact_name');
  if (!company.client_phone) missingFields.push('contact_phone');
  if (!company.client_cif) missingFields.push('cif');

  const prompt = `Analiza la siguiente información web sobre la empresa "${company.client_company}" y extrae los datos de contacto empresarial que faltan.

CAMPOS QUE NECESITO ENCONTRAR: ${missingFields.join(', ')}

REGLAS:
- Solo devuelve datos que encuentres EXPLÍCITAMENTE en el contenido web
- Para email: busca emails corporativos (info@, contacto@, comercial@, dirección@) o de personas clave
- Para contact_name: busca el nombre del director general, CEO, gerente, administrador o persona de contacto principal
- Para contact_phone: busca teléfonos fijos o móviles de la empresa
- Para cif: busca el CIF/NIF de la empresa (formato letra + 8 dígitos o 8 dígitos + letra)
- Si no encuentras un dato con certeza, déjalo como cadena vacía ""
- NO inventes datos

Contenido web encontrado:
${searchContent || 'No se encontró contenido web para esta empresa.'}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "Eres un asistente experto en buscar datos de contacto empresarial en España. Extraes información precisa de contenido web." },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_contact_data",
            description: "Extrae datos de contacto empresarial encontrados en el contenido web",
            parameters: {
              type: "object",
              properties: {
                contact_name: { type: "string", description: "Nombre completo de la persona de contacto (director, CEO, gerente). Vacío si no se encuentra." },
                contact_email: { type: "string", description: "Email profesional de la empresa o contacto. Vacío si no se encuentra." },
                contact_phone: { type: "string", description: "Teléfono de la empresa. Vacío si no se encuentra." },
                cif: { type: "string", description: "CIF/NIF de la empresa. Vacío si no se encuentra." },
                confidence: { type: "string", enum: ["high", "medium", "low"], description: "Nivel de confianza en los datos extraídos" },
              },
              required: ["contact_name", "contact_email", "contact_phone", "cif", "confidence"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "extract_contact_data" } },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[enrich-data] AI error:', response.status, errText);
    if (response.status === 429 || response.status === 402) {
      throw new Error(`AI_RATE_LIMIT:${response.status}`);
    }
    return null;
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) return null;

  try {
    return JSON.parse(toolCall.function.arguments);
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth verification — validate JWT via Supabase
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Token inválido o expirado' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Cuerpo de la petición inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { companies } = body;

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Se requiere un array de empresas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const results: Array<{ id: string; data: any; found: boolean }> = [];

    for (const company of companies as CompanyInput[]) {
      console.log('[enrich-data] Processing:', company.client_company);

      // Step 1: Search with Firecrawl if available
      let searchContent = '';
      if (FIRECRAWL_API_KEY) {
        const cifPart = company.client_cif ? ` ${company.client_cif}` : '';
        const query = `"${company.client_company}"${cifPart} contacto email teléfono site:.es`;
        searchContent = await searchFirecrawl(query, FIRECRAWL_API_KEY);

        // If first search returns little, try broader search
        if (searchContent.length < 200) {
          const query2 = `"${company.client_company}" empresa España contacto`;
          const moreContent = await searchFirecrawl(query2, FIRECRAWL_API_KEY);
          searchContent += '\n---\n' + moreContent;
        }
      }

      // Step 2: Extract with AI
      try {
        const extracted = await extractWithAI(company, searchContent, LOVABLE_API_KEY);

        if (extracted) {
          // Only return non-empty fields that were missing
          const updates: Record<string, string> = {};
          if (!company.client_email && extracted.contact_email) updates.client_email = extracted.contact_email;
          if (!company.client_name && extracted.contact_name) updates.client_name = extracted.contact_name;
          if (!company.client_phone && extracted.contact_phone) updates.client_phone = extracted.contact_phone;
          if (!company.client_cif && extracted.cif) updates.client_cif = extracted.cif;

          const found = Object.keys(updates).length > 0;
          results.push({ id: company.id, data: updates, found });
          console.log('[enrich-data]', company.client_company, '→', found ? `Found ${Object.keys(updates).length} fields` : 'No new data');
        } else {
          results.push({ id: company.id, data: {}, found: false });
        }
      } catch (e: any) {
        if (e.message?.startsWith('AI_RATE_LIMIT')) {
          const status = parseInt(e.message.split(':')[1]);
          return new Response(
            JSON.stringify({
              error: status === 429 ? 'Límite de peticiones excedido' : 'Créditos agotados',
              partial_results: results,
            }),
            { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        results.push({ id: company.id, data: {}, found: false });
      }

      // Delay between companies to avoid rate limits
      if (companies.indexOf(company) < companies.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    const enrichedCount = results.filter(r => r.found).length;
    console.log(`[enrich-data] Done: ${enrichedCount}/${results.length} enriched`);

    return new Response(
      JSON.stringify({ results, enrichedCount, total: results.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[enrich-data] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

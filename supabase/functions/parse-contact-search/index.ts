import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres un parser de búsqueda para un CRM de contactos empresariales.
Tu tarea es extraer filtros estructurados de consultas en lenguaje natural en español.

CAMPOS DISPONIBLES:
- text_search: texto libre para búsqueda por nombre de contacto O nombre de empresa
- sector: texto (tecnología, salud, industrial, servicios, retail, software, fintech, etc.)
- location: texto (ciudad o provincia española)
- revenue_min, revenue_max: número en euros (interpreta "1M" como 1000000)
- ebitda_min, ebitda_max: número en euros
- employee_min, employee_max: número de empleados
- status: nuevo|contactado|calificado|perdido|ganado
- lead_status_crm: nuevo|contactado|calificado|descartado|contactando|en_espera|propuesta_enviada|negociacion|ganado|perdido|archivado
- origin: valuation|contact|collaborator|acquisition|company_acquisition
- email_status: opened|sent|not_contacted
- date_range: last_7_days|last_30_days|last_90_days|this_year|today

REGLAS:
1. Extrae SOLO los campos que puedas inferir claramente
2. Para números, convierte expresiones como "más de 1M" a revenue_min: 1000000
3. Si buscan una empresa específica por nombre, usa text_search
4. No inventes campos que no existen

Responde SOLO con JSON válido. Si no hay filtros claros, devuelve {}.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ filters: {}, error: 'Query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[parse-contact-search] Processing query: "${query}"`);

    const response = await callAI(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query }
      ],
      { functionName: 'parse-contact-search', temperature: 0.1, maxTokens: 500 }
    );

    let filters = {};
    try {
      filters = parseAIJson(response.content);
    } catch {
      console.error('[parse-contact-search] JSON parse error');
      filters = {};
    }

    return new Response(
      JSON.stringify({ filters, query, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[parse-contact-search] Error:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

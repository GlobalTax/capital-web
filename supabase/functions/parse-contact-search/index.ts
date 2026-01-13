import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres un parser de búsqueda para un CRM de contactos empresariales.
Tu tarea es extraer filtros estructurados de consultas en lenguaje natural en español.

CAMPOS DISPONIBLES:
- sector: texto (tecnología, salud, industrial, servicios, retail, software, fintech, etc.)
- location: texto (ciudad o provincia española: Barcelona, Madrid, Valencia, Bilbao, etc.)
- revenue_min, revenue_max: número en euros (interpreta "1M" como 1000000, "500k" como 500000)
- ebitda_min, ebitda_max: número en euros
- employee_min, employee_max: número de empleados (interpreta "pyme" como 1-50, "grande" como >250)
- status: nuevo|contactado|calificado|perdido|ganado
- lead_status_crm: nuevo|contactado|calificado|descartado|contactando|en_espera|propuesta_enviada|negociacion|ganado|perdido|archivado
- origin: valuation|contact|collaborator|acquisition|company_acquisition
- email_status: opened|sent|not_contacted
- date_range: last_7_days|last_30_days|last_90_days|this_year|today
- text_search: texto libre para búsqueda fuzzy (solo si no encaja en ningún otro campo)

REGLAS:
1. Extrae SOLO los campos que puedas inferir claramente de la consulta
2. Para números, convierte expresiones como "más de 1M" a revenue_min: 1000000
3. Para ubicaciones, usa el nombre de la ciudad/provincia en español
4. Si mencionan "sin contactar" o "sin email", usa email_status: "not_contacted"
5. Si mencionan "nuevos" o "recientes", considera date_range: "last_7_days" o status: "nuevo"
6. Para sectores, normaliza: "tech" → "tecnología", "health" → "salud"
7. No inventes campos que no existen

Responde SOLO con JSON válido, sin explicaciones. Si no hay filtros claros, devuelve {}.

EJEMPLOS:
Input: "empresas de tecnología de más de 1 millón en Barcelona"
Output: {"sector":"tecnología","revenue_min":1000000,"location":"Barcelona"}

Input: "leads nuevos del sector salud sin contactar"
Output: {"sector":"salud","email_status":"not_contacted","date_range":"last_7_days"}

Input: "contactos calificados con EBITDA mayor a 500k"
Output: {"lead_status_crm":"calificado","ebitda_min":500000}

Input: "valoraciones de más de 50 empleados en Madrid últimos 30 días"
Output: {"employee_min":50,"location":"Madrid","date_range":"last_30_days","origin":"valuation"}

Input: "pymes industriales"
Output: {"sector":"industrial","employee_max":50}`;

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ filters: {}, error: 'AI service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[parse-contact-search] Processing query: "${query}"`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: query }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI gateway error: ${response.status}`, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ filters: {}, error: 'Rate limit exceeded, please try again' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ filters: {}, error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    console.log(`[parse-contact-search] AI response: ${content}`);

    // Parse JSON from response
    let filters = {};
    try {
      // Handle potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                        content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      filters = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error(`[parse-contact-search] JSON parse error:`, parseError);
      filters = {};
    }

    console.log(`[parse-contact-search] Parsed filters:`, filters);

    return new Response(
      JSON.stringify({ 
        filters,
        query,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[parse-contact-search] Error:', error);
    return new Response(
      JSON.stringify({ 
        filters: {}, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

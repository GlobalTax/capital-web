import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      companyName,
      sector,
      revenue,
      ebitda,
      financialYear,
      valuationCentral,
      campaignStrengthsTemplate,
      campaignWeaknessesTemplate,
      campaignContextTemplate,
    } = await req.json();

    console.log('[enrich-campaign-company] Empresa:', companyName, '| Sector:', sector);

    if (!companyName || !ebitda) {
      return new Response(
        JSON.stringify({ error: 'Se requiere nombre de empresa y EBITDA' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const ebitdaMargin = revenue && revenue > 0 ? ((ebitda / revenue) * 100).toFixed(1) : 'N/A';

    const systemPrompt = `Eres un analista senior de M&A de Capittal, boutique de asesoría en fusiones y adquisiciones en España.

Tu tarea es personalizar el análisis cualitativo de una empresa específica basándote en sus datos financieros y en las plantillas generales proporcionadas.

REGLAS:
- Adapta las fortalezas y debilidades a los datos CONCRETOS de la empresa
- Si el margen EBITDA es alto (>15%), destaca la rentabilidad como fortaleza
- Si el margen es bajo (<8%), inclúyelo como debilidad
- Si la facturación es alta pero el EBITDA bajo, menciona oportunidades de optimización
- Mantén un tono profesional y específico, evitando generalidades
- Máximo 5 puntos por sección
- Responde SOLO con el JSON solicitado, sin texto adicional`;

    const userPrompt = `Datos de la empresa:
- Empresa: ${companyName}
- Sector: ${sector}
- Facturación: ${revenue ? `${(revenue / 1000000).toFixed(2)}M€` : 'No disponible'}
- EBITDA: ${(ebitda / 1000000).toFixed(2)}M€ (${financialYear || 2024})
- Margen EBITDA: ${ebitdaMargin}%
- Valoración estimada: ${valuationCentral ? `${(valuationCentral / 1000000).toFixed(2)}M€` : 'Pendiente'}

Plantilla base de fortalezas:
${campaignStrengthsTemplate || 'No proporcionada'}

Plantilla base de debilidades:
${campaignWeaknessesTemplate || 'No proporcionada'}

Plantilla base de contexto:
${campaignContextTemplate || 'No proporcionada'}

Genera fortalezas, debilidades y contexto personalizados para esta empresa.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "enrich_company",
              description: "Devuelve fortalezas, debilidades y contexto personalizados para una empresa",
              parameters: {
                type: "object",
                properties: {
                  strengths: {
                    type: "string",
                    description: "5 fortalezas personalizadas, separadas por saltos de línea, cada una comenzando con •"
                  },
                  weaknesses: {
                    type: "string",
                    description: "5 debilidades/riesgos personalizados, separados por saltos de línea, cada uno comenzando con •"
                  },
                  context: {
                    type: "string",
                    description: "1 párrafo de contexto de valoración personalizado (máximo 100 palabras)"
                  },
                },
                required: ["strengths", "weaknesses", "context"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "enrich_company" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[enrich-campaign-company] AI error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de peticiones excedido. Inténtalo de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos agotados. Contacta con el administrador." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Error de IA: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No se recibió respuesta estructurada de la IA");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('[enrich-campaign-company] Enriquecimiento completado para:', companyName);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[enrich-campaign-company] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

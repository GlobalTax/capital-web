import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawText, clientCompany, sector, valuationCentral } = await req.json();

    console.log('[rewrite-comparables] Request recibido');
    console.log('[rewrite-comparables] Empresa:', clientCompany);
    console.log('[rewrite-comparables] Texto largo:', rawText?.length, 'caracteres');

    if (!rawText || rawText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Se requiere texto con información de operaciones (mínimo 50 caracteres)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Eres un analista senior de M&A especializado en el mercado español. Tu tarea es reescribir información sobre transacciones comparables para incluirla en un informe de valoración profesional.

REQUISITOS OBLIGATORIOS:
- Lenguaje formal y profesional, apropiado para un informe de valoración empresarial
- Mantener TODOS los datos numéricos exactos (precios, múltiplos, facturación, EBITDA)
- Eliminar emojis, tablas markdown y formato informal
- Estructurar el contenido en párrafos claros y legibles
- No usar bullet points con símbolos, usa párrafos narrativos
- El texto debe poder leerse directamente en un PDF sin necesidad de formato especial
- Máximo 800 palabras

ESTRUCTURA SUGERIDA:
1. Párrafo introductorio breve sobre el contexto del sector
2. Descripción de cada operación relevante mencionada (nombre, año, valoración/precio, contexto)
3. Párrafo de cierre con conclusiones sobre múltiplos típicos del sector

NO incluyas:
- Tablas con formato
- Emojis o símbolos decorativos
- Notas al pie o referencias
- Títulos de sección (el título lo ponemos nosotros)
- Frases como "Aquí tienes" o referencias al proceso de escritura`;

    const userPrompt = `Reescribe la siguiente información sobre transacciones comparables del sector para incluirla en un informe de valoración profesional.

CONTEXTO:
- Empresa valorada: ${clientCompany || 'No especificada'}
- Sector: ${sector || 'No especificado'}
- Valoración estimada: ${valuationCentral ? `${(valuationCentral / 1000000).toFixed(1)}M€` : 'No especificada'}

INFORMACIÓN ORIGINAL A REESCRIBIR:
${rawText}`;

    console.log('[rewrite-comparables] Llamando a Lovable AI...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[rewrite-comparables] Error de Lovable AI:', response.status, errorText);
      
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
    const formattedText = data.choices?.[0]?.message?.content;

    if (!formattedText) {
      throw new Error("No se recibió respuesta de la IA");
    }

    console.log('[rewrite-comparables] Texto generado:', formattedText.length, 'caracteres');

    return new Response(
      JSON.stringify({ formattedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[rewrite-comparables] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

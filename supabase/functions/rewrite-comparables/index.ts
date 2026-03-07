import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, aiErrorResponse } from "../_shared/ai-helper.ts";

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

    if (!rawText || rawText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Se requiere texto con información de operaciones (mínimo 50 caracteres)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Eres un analista senior de M&A. Tu tarea es estructurar información sobre transacciones comparables para un informe de valoración.

FORMATO DE SALIDA OBLIGATORIO:

📌 Transacciones recientes (España y Europa)

🇪🇸 España
[Para cada operación española relevante:]
**[Comprador] adquiere [Target] ([Mes Año])**
- Comprador: [descripción breve]
- Target: [descripción breve]
- Valor: [precio o "no divulgado"]
- Múltiplo: [EV/EBITDA si disponible o rango estimado ~Xx–Yx]
- Contexto: [1 línea sobre la lógica estratégica]

🇪🇺 Europa
[Mismo formato para operaciones europeas relevantes]

📊 Rangos de múltiplos observados
- [Sector específico]: ~Xx–Yx EV/EBITDA

📌 Conclusión
[2-3 líneas sobre qué múltiplos aplican al caso valorado]

REGLAS ESTRICTAS:
- Usa emojis como separadores visuales (📌 🇪🇸 🇪🇺 📊)
- Mantén TODOS los datos numéricos exactos del texto original
- Máximo 5-7 operaciones más relevantes
- Si no hay datos concretos, indica "no divulgado" - NUNCA inventes cifras
- Máximo 600 palabras total`;

    const userPrompt = `Estructura la siguiente información de transacciones comparables.

EMPRESA VALORADA:
- Nombre: ${clientCompany || 'No especificada'}
- Sector: ${sector || 'No especificado'}
- Valoración estimada: ${valuationCentral ? `${(valuationCentral / 1000000).toFixed(1)}M€` : 'No especificada'}

INFORMACIÓN A ESTRUCTURAR:
${rawText}`;

    console.log('[rewrite-comparables] Llamando a AI...');

    let aiResponse;
    try {
      aiResponse = await callAI(
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        { model: 'google/gemini-2.5-flash', functionName: 'rewrite-comparables' }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    if (!aiResponse.content) throw new Error("No se recibió respuesta de la IA");

    console.log('[rewrite-comparables] Texto generado:', aiResponse.content.length, 'caracteres');

    return new Response(
      JSON.stringify({ formattedText: aiResponse.content }),
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

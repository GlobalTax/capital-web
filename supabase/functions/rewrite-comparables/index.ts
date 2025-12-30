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
- [Subsector o región]: ~Xx–Yx EV/EBITDA

📌 Conclusión
[2-3 líneas sobre qué múltiplos aplican al caso valorado]

REGLAS ESTRICTAS:
- Usa emojis como separadores visuales (📌 🇪🇸 🇪🇺 📊 🧠 👉)
- Mantén TODOS los datos numéricos exactos del texto original
- Máximo 5-7 operaciones más relevantes
- Si no hay datos concretos, indica "no divulgado" - NUNCA inventes cifras
- Sé conciso: cada operación máximo 4-5 líneas
- NO generes texto de relleno ni párrafos largos narrativos
- NO incluyas tablas markdown, solo listas con guiones
- Máximo 600 palabras total
- NO uses frases como "Aquí tienes" o referencias al proceso de escritura`;

    const userPrompt = `Estructura la siguiente información de transacciones comparables.

EMPRESA VALORADA:
- Nombre: ${clientCompany || 'No especificada'}
- Sector: ${sector || 'No especificado'}
- Valoración estimada: ${valuationCentral ? `${(valuationCentral / 1000000).toFixed(1)}M€` : 'No especificada'}

INFORMACIÓN A ESTRUCTURAR:
${rawText}

Extrae las operaciones más relevantes y presenta en el formato indicado. Si el texto incluye rangos de múltiplos, inclúyelos en la sección de rangos.`;

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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Actúa como un analista empresarial especializado en M&A, valoraciones y perfiles corporativos.

A partir del nombre mercantil de la empresa, genera exclusivamente una descripción profesional de la actividad.

REGLAS OBLIGATORIAS:
- Solo devolver la descripción de la actividad (un único párrafo)
- NO incluir datos legales, contacto, empleados, facturación ni observaciones
- NO listar servicios en formato bullets
- Descripción objetiva, profesional y verificable
- Alineada con el sector real de la empresa (evitar texto genérico o inventado)
- Tono adecuado para informes de valoración, M&A o dossiers de inversión
- Extensión aproximada de 4–6 líneas

ANTES DE REDACTAR:
- Identificar el CIF/NIF real si está disponible en fuentes públicas (Empresite, Informa, BORME)
- Usar esa información para validar la actividad real y evitar descripciones incorrectas

PROHIBICIONES:
- No inventar actividades no contrastables
- No usar expresiones vagas como "diversos sectores" si no es consistente con la actividad
- No usar lenguaje comercial excesivo
- No incluir encabezados ni títulos

FORMATO DE SALIDA:
Devuelve ÚNICAMENTE el párrafo descriptivo, sin ningún encabezado, título ni formato adicional.`;

const getCIFPriorityInstructions = (cif: string | undefined) => {
  if (!cif) return '';
  return `

⚠️ PRIORIDAD ABSOLUTA - SE HA PROPORCIONADO CIF: ${cif}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEBES priorizar OBLIGATORIAMENTE estas fuentes en este orden:
1. Registro Mercantil Central (BORME) - Buscar por CIF
2. Directorios empresariales españoles (Empresite, Infocif, Einforma, Axesor)
3. Base de datos de la AEAT / Hacienda
4. Listados de sociedades (eInforma, Expansión)

El CIF es el identificador fiscal OFICIAL. Úsalo para:
- Validar el nombre mercantil completo
- Confirmar la actividad real registrada
- Verificar el CNAE principal

Si encuentras discrepancias entre fuentes, PRIORIZA SIEMPRE la información del registro mercantil.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_name, cif } = await req.json();

    if (!company_name) {
      return new Response(
        JSON.stringify({ error: 'Se requiere el nombre de la empresa' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build user prompt
    let userPrompt = `Nombre mercantil: ${company_name}`;
    if (cif) {
      userPrompt += `\nCIF: ${cif}`;
    }

    // Build dynamic system prompt with CIF priority if available
    const dynamicSystemPrompt = SYSTEM_PROMPT + getCIFPriorityInstructions(cif);

    // Try OpenAI first (better for structured/precise output), fallback to Lovable AI
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    let response;
    let model = 'gpt-4o-mini';

    if (openAIKey) {
      console.log('Using OpenAI API for activity description');
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: dynamicSystemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });
    } else if (lovableKey) {
      console.log('Using Lovable AI Gateway for activity description');
      model = 'google/gemini-3-flash-preview';
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: dynamicSystemPrompt },
            { role: 'user', content: userPrompt }
          ],
        }),
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'No API key configured (OPENAI_API_KEY or LOVABLE_API_KEY)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de solicitudes excedido. Inténtalo de nuevo más tarde.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Se requiere añadir créditos a la cuenta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Error del servicio de IA', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let description = data.choices?.[0]?.message?.content;

    if (!description) {
      return new Response(
        JSON.stringify({ error: 'No se pudo generar la descripción' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up the description - remove any headers like "Descripción de la actividad"
    description = description
      .replace(/^(Descripción de la actividad|Descripción|Actividad)[\s:]*\n*/i, '')
      .trim();

    console.log('Activity description generated successfully using model:', model);

    return new Response(
      JSON.stringify({ 
        description, 
        generated_at: new Date().toISOString(),
        model 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-company-activity-description:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

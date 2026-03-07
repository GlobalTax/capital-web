import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, aiErrorResponse } from "../_shared/ai-helper.ts";

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
  return `\n\n⚠️ PRIORIDAD ABSOLUTA - SE HA PROPORCIONADO CIF: ${cif}\nDEBES priorizar OBLIGATORIAMENTE fuentes oficiales (BORME, Empresite, Infocif, Einforma, Axesor) para validar la actividad real.`;
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

    let userPrompt = `Nombre mercantil: ${company_name}`;
    if (cif) userPrompt += `\nCIF: ${cif}`;

    const dynamicSystemPrompt = SYSTEM_PROMPT + getCIFPriorityInstructions(cif);

    const response = await callAI(
      [
        { role: 'system', content: dynamicSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      { functionName: 'generate-company-activity-description', preferOpenAI: true, maxTokens: 500, temperature: 0.3 }
    );

    let description = response.content
      .replace(/^(Descripción de la actividad|Descripción|Actividad)[\s:]*\n*/i, '')
      .trim();

    return new Response(
      JSON.stringify({ description, generated_at: new Date().toISOString(), model: response.model }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-company-activity-description:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

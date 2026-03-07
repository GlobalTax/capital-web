import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateTemplateRequest {
  objective: string;
  audience: string;
  tone: 'profesional' | 'cercano' | 'urgente';
  cta_text: string;
  cta_url?: string;
}

const SYSTEM_PROMPT = `Eres un experto en email marketing para M&A (fusiones y adquisiciones) de empresas.
Tu trabajo es generar templates de email de re-engagement en HTML que sigan EXACTAMENTE la identidad corporativa de Capittal.

## ESTILOS CORPORATIVOS OBLIGATORIOS:

### Tipografía
- Font family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Incluir: <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">

### Colores
- Primary/Header gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%)
- CTA button: background #0f172a, color #ffffff
- Text títulos: #0f172a
- Text contenido: #334155
- Text secundario: #64748b
- Background wrapper: #f8fafc
- Background container: #ffffff
- Footer background: #f8fafc
- Borders: #e2e8f0

### Variables de Brevo (OBLIGATORIAS)
- {{contact.FIRSTNAME}} - Nombre del contacto
- {{contact.COMPANY}} - Empresa del contacto
- {{contact.SECTOR}} - Sector de la empresa
- {{contact.VALUATION}} - Última valoración (opcional)
- {{unsubscribe}} - Link de baja
- {{update_profile}} - Actualizar preferencias

### URLs con UTM
Todas las URLs deben incluir parámetros UTM:
- utm_source=brevo
- utm_medium=email
- utm_campaign=reengagement_[slug]
- utm_content=[contexto_del_link]

Responde SOLO con un JSON válido con esta estructura:
{
  "label": "Nombre corto del template",
  "description": "Descripción del template",
  "default_subject": "Asunto del email con variables Brevo",
  "brevo_segment": "Condición de segmentación sugerida",
  "trigger_condition": "Cuándo enviar este email",
  "html_template": "<!DOCTYPE html>...",
  "variables_used": ["FIRSTNAME", "COMPANY", ...]
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objective, audience, tone, cta_text, cta_url } = await req.json() as GenerateTemplateRequest;

    if (!objective || !audience || !tone || !cta_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: objective, audience, tone, cta_text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `Genera un template de email de re-engagement con los siguientes requisitos:

OBJETIVO: ${objective}
AUDIENCIA: ${audience}
TONO: ${tone}
CTA PRINCIPAL: ${cta_text}
${cta_url ? `URL DEL CTA: ${cta_url}` : 'URL DEL CTA: https://capittal.es/contacto'}

Recuerda:
1. El HTML debe ser completo y responsive
2. Usar TODAS las variables de Brevo donde tenga sentido
3. El tono debe ser ${tone === 'profesional' ? 'formal y directo' : tone === 'cercano' ? 'amigable y empático' : 'con sentido de urgencia pero sin ser agresivo'}
4. Mantener la identidad visual de Capittal`;

    console.log('Calling AI to generate template...');

    let aiResponse;
    try {
      aiResponse = await callAI(
        [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userPrompt }],
        { model: 'google/gemini-2.5-flash', temperature: 0.7, maxTokens: 8000, functionName: 'generate-reengagement-template' }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    console.log('AI response received, parsing JSON...');
    const templateData = parseAIJson(aiResponse.content);

    if (!templateData.label || !templateData.html_template || !templateData.default_subject) {
      throw new Error('Invalid template data: missing required fields');
    }

    console.log('Template generated successfully:', templateData.label);

    return new Response(
      JSON.stringify({ success: true, template: templateData, usage: { total_tokens: aiResponse.tokensUsed } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating template:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate template', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

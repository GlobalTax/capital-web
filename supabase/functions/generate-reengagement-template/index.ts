import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

### Estructura del Email
1. Wrapper con padding y background #f8fafc
2. Container con max-width 600px, border-radius 12px, box-shadow
3. Header con gradient y logo "CAPITTAL" en blanco
4. Content con padding 40px 30px
5. Footer con links y unsubscribe

### Variables de Brevo (OBLIGATORIAS)
- {{contact.FIRSTNAME}} - Nombre del contacto
- {{contact.COMPANY}} - Empresa del contacto
- {{contact.SECTOR}} - Sector de la empresa
- {{contact.VALUATION}} - Última valoración (opcional)
- {{unsubscribe}} - Link de baja
- {{update_profile}} - Actualizar preferencias

### Elementos disponibles
- .greeting: título de saludo (h2, 22px, font-weight 600)
- .text: párrafos normales (16px, line-height 1.7)
- .highlight-box: caja destacada con borde izquierdo
- .cta-button: botón principal
- .secondary-cta: botón secundario con borde
- .stats-grid: grid de estadísticas
- .tip-box: caja de consejo/tip
- .bullet-list: lista con bullets

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
3. Incluir estadísticas o datos relevantes si es apropiado
4. El tono debe ser ${tone === 'profesional' ? 'formal y directo' : tone === 'cercano' ? 'amigable y empático' : 'con sentido de urgencia pero sin ser agresivo'}
5. Mantener la identidad visual de Capittal`;

    console.log('Calling Lovable AI to generate template...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from AI');
    }

    console.log('AI response received, parsing JSON...');

    // Parse the JSON response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const templateData = JSON.parse(jsonContent);

    // Validate required fields
    if (!templateData.label || !templateData.html_template || !templateData.default_subject) {
      throw new Error('Invalid template data: missing required fields');
    }

    console.log('Template generated successfully:', templateData.label);

    return new Response(
      JSON.stringify({
        success: true,
        template: templateData,
        usage: aiData.usage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating template:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate template',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

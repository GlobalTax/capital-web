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
    const { prompt, type, category, length, tone } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = `Eres un experto redactor de contenido especializado en M&A (fusiones y adquisiciones), valoraciones empresariales y consultoría financiera para la empresa Capittal.

CONTEXTO DE CAPITTAL:
- Empresa líder en asesoramiento M&A en España
- Especialistas en valoraciones empresariales
- Ubicados en Madrid (Carrer Ausias March 36, P.º de la Castellana 11-B)
- Expertos en due diligence, planificación fiscal y reestructuraciones

INSTRUCCIONES:
- Escribe contenido profesional y técnico pero accesible
- Incluye datos reales del mercado español cuando sea posible
- Menciona casos prácticos y ejemplos relevantes
- Usa un enfoque educativo pero comercial sutil
- Termina siempre con una mención de Capittal como expertos en el tema`;

    if (category) systemPrompt += `\n- Enfócate específicamente en: ${category}`;
    if (tone) systemPrompt += `\n- Usa un tono: ${tone}`;
    if (length) {
      const lengthGuide: Record<string, string> = {
        'corto': '800-1200 palabras',
        'medio': '1500-2500 palabras',
        'largo': '3000-4500 palabras'
      };
      systemPrompt += `\n- Longitud aproximada: ${lengthGuide[length] || '1500-2500 palabras'}`;
    }

    const response = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      { functionName: 'generate-blog-ai-content', maxTokens: 4000 }
    );

    return new Response(JSON.stringify({
      content: response.content,
      type: type || 'content',
      usage: { total_tokens: response.tokensUsed }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-blog-ai-content:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

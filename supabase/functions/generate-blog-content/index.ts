import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, extractToolCallArgs, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, context = {} } = await req.json();

    let systemMessage = '';
    let userMessage = '';

    switch (type) {
      case 'title':
        systemMessage = 'Eres un experto en marketing digital y M&A que crea títulos atractivos para artículos de blog sobre fusiones, adquisiciones, valoraciones empresariales y finanzas corporativas.';
        userMessage = `Genera 3 títulos atractivos para un artículo sobre: ${prompt}. Los títulos deben ser específicos del sector M&A/finanzas, profesionales y optimizados para búsquedas.`;
        break;
      case 'content':
        systemMessage = 'Eres un consultor experto en M&A y finanzas corporativas que escribe artículos profesionales. Tu audiencia son empresarios, directivos financieros y profesionales del sector.';
        userMessage = `Escribe un artículo completo en formato markdown sobre: ${prompt}.\n\nEstructura requerida:\n- Introducción que enganche al lector\n- 3-4 secciones principales con subtítulos\n- Ejemplos prácticos o casos reales\n- Conclusión con llamada a la acción\n- Longitud: 1500-2000 palabras`;
        break;
      case 'excerpt':
        systemMessage = 'Eres un experto en marketing de contenidos que crea extractos atractivos para artículos de blog sobre M&A y finanzas corporativas.';
        userMessage = `Basándote en este título: "${context.title}" y este contenido resumido: "${prompt}", crea un extracto de 150-200 caracteres.`;
        break;
      case 'seo':
        systemMessage = 'Eres un especialista en SEO para el sector financiero y M&A.';
        userMessage = `Para un artículo titulado "${context.title}" con contenido sobre: "${context.content?.substring(0, 500) || prompt}", genera meta tags SEO optimizados.`;
        break;
      case 'tags':
        systemMessage = 'Eres un experto en taxonomía de contenidos para el sector M&A y finanzas corporativas.';
        userMessage = `Basándote en este título: "${context.title}" y contenido: "${prompt}", sugiere 5-7 tags relevantes.`;
        break;
      default:
        throw new Error('Tipo de generación no válido');
    }

    const aiConfig: any = {
      model: 'google/gemini-3-flash-preview',
      maxTokens: type === 'content' ? 3000 : 500,
      functionName: 'generate-blog-content',
    };

    // Use tool calling for structured SEO output
    if (type === 'seo') {
      aiConfig.tools = [
        {
          type: "function",
          function: {
            name: "generate_seo_metadata",
            description: "Genera meta título y descripción optimizados para SEO",
            parameters: {
              type: "object",
              properties: {
                meta_title: { type: "string", description: "Meta título SEO optimizado (máximo 60 caracteres)" },
                meta_description: { type: "string", description: "Meta descripción SEO atractiva (máximo 160 caracteres)" }
              },
              required: ["meta_title", "meta_description"],
              additionalProperties: false
            }
          }
        }
      ];
      aiConfig.tool_choice = { type: "function", function: { name: "generate_seo_metadata" } };
    }

    let aiResponse;
    try {
      aiResponse = await callAI(
        [{ role: 'system', content: systemMessage }, { role: 'user', content: userMessage }],
        aiConfig
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    // Handle tool calling response for SEO
    if (type === 'seo' && aiResponse.toolCalls?.length) {
      const seoData = extractToolCallArgs(aiResponse);
      if (seoData) {
        return new Response(JSON.stringify({ content: '', type, tool_calls: aiResponse.toolCalls, seo_data: seoData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ content: aiResponse.content, type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-blog-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

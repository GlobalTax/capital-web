import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { type, prompt, context = {} } = await req.json();
    
    let systemMessage = '';
    let userMessage = '';

    switch (type) {
      case 'title':
        systemMessage = 'Eres un experto en marketing digital y M&A que crea títulos atractivos para artículos de blog sobre fusiones, adquisiciones, valoraciones empresariales y finanzas corporativas. Los títulos deben ser profesionales pero atractivos, específicos del sector, y optimizados para SEO.';
        userMessage = `Genera 3 títulos atractivos para un artículo sobre: ${prompt}. Los títulos deben ser específicos del sector M&A/finanzas, profesionales y optimizados para búsquedas.`;
        break;
      
      case 'content':
        systemMessage = 'Eres un consultor experto en M&A y finanzas corporativas que escribe artículos profesionales. Tu audiencia son empresarios, directivos financieros y profesionales del sector. Escribes en español con un tono profesional pero accesible, usando ejemplos prácticos y datos del mercado cuando sea apropiado.';
        userMessage = `Escribe un artículo completo en formato markdown sobre: ${prompt}. 
        
Estructura requerida:
- Introducción que enganche al lector
- 3-4 secciones principales con subtítulos
- Ejemplos prácticos o casos reales cuando sea posible
- Conclusión con llamada a la acción
- Longitud: 1500-2000 palabras
- Incluye datos y tendencias del mercado español/europeo cuando sea relevante
- Tono: profesional pero accesible
- Audiencia: empresarios y directivos que consideran operaciones M&A`;
        break;
      
      case 'excerpt':
        systemMessage = 'Eres un experto en marketing de contenidos que crea extractos atractivos para artículos de blog sobre M&A y finanzas corporativas.';
        userMessage = `Basándote en este título: "${context.title}" y este contenido resumido: "${prompt}", crea un extracto de 150-200 caracteres que sea atractivo y resuma el valor del artículo para empresarios interesados en M&A.`;
        break;
      
      case 'seo':
        systemMessage = 'Eres un especialista en SEO para el sector financiero y M&A. Creas meta títulos y descripciones optimizadas para búsquedas relacionadas con fusiones, adquisiciones, valoraciones y finanzas corporativas.';
        userMessage = `Para un artículo titulado "${context.title}" con contenido sobre: "${context.content?.substring(0, 500) || prompt}", genera meta tags SEO optimizados.`;
        break;
      
      case 'tags':
        systemMessage = 'Eres un experto en taxonomía de contenidos para el sector M&A y finanzas corporativas.';
        userMessage = `Basándote en este título: "${context.title}" y contenido: "${prompt}", sugiere 5-7 tags relevantes para el artículo. Los tags deben ser específicos del sector M&A, valoraciones, finanzas corporativas, y términos que usarían profesionales del sector.`;
        break;
      
      default:
        throw new Error('Tipo de generación no válido');
    }

    // Build request body
    const body: Record<string, unknown> = {
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      max_tokens: type === 'content' ? 3000 : 500,
    };

    // Use tool calling for structured SEO output
    if (type === 'seo') {
      body.tools = [
        {
          type: "function",
          function: {
            name: "generate_seo_metadata",
            description: "Genera meta título y descripción optimizados para SEO",
            parameters: {
              type: "object",
              properties: {
                meta_title: { 
                  type: "string", 
                  description: "Meta título SEO optimizado (máximo 60 caracteres)" 
                },
                meta_description: { 
                  type: "string", 
                  description: "Meta descripción SEO atractiva (máximo 160 caracteres)" 
                }
              },
              required: ["meta_title", "meta_description"],
              additionalProperties: false
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "generate_seo_metadata" } };
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle tool calling response for SEO
    if (type === 'seo' && data.choices?.[0]?.message?.tool_calls?.[0]) {
      const toolCall = data.choices[0].message.tool_calls[0];
      if (toolCall.function?.name === 'generate_seo_metadata') {
        try {
          const seoData = JSON.parse(toolCall.function.arguments);
          return new Response(JSON.stringify({ 
            content: '', 
            type,
            tool_calls: data.choices[0].message.tool_calls,
            seo_data: seoData
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (parseError) {
          console.error('Error parsing tool call arguments:', parseError);
        }
      }
    }

    const generatedContent = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ content: generatedContent, type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-blog-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

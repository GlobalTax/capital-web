
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
        userMessage = `Para un artículo titulado "${context.title}", crea:
        1. Meta título (máximo 60 caracteres) optimizado para SEO
        2. Meta descripción (máximo 160 caracteres) que incluya palabras clave relevantes del sector M&A
        
        Palabras clave a considerar: fusiones, adquisiciones, valoración empresarial, due diligence, M&A, finanzas corporativas, empresa, valorar empresa`;
        break;
      
      case 'tags':
        systemMessage = 'Eres un experto en taxonomía de contenidos para el sector M&A y finanzas corporativas.';
        userMessage = `Basándote en este título: "${context.title}" y contenido: "${prompt}", sugiere 5-7 tags relevantes para el artículo. Los tags deben ser específicos del sector M&A, valoraciones, finanzas corporativas, y términos que usarían profesionales del sector.`;
        break;
      
      default:
        throw new Error('Tipo de generación no válido');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_completion_tokens: type === 'content' ? 3000 : 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

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

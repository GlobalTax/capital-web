import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { prompt, type, category, length, tone } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build system prompt based on parameters
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

    if (category) {
      systemPrompt += `\n- Enfócate específicamente en: ${category}`;
    }

    if (tone) {
      systemPrompt += `\n- Usa un tono: ${tone}`;
    }

    if (length) {
      const lengthGuide = {
        'corto': '800-1200 palabras',
        'medio': '1500-2500 palabras', 
        'largo': '3000-4500 palabras'
      };
      systemPrompt += `\n- Longitud aproximada: ${lengthGuide[length as keyof typeof lengthGuide] || '1500-2500 palabras'}`;
    }

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    console.log('Generating content with OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Content generated successfully');

    return new Response(JSON.stringify({ 
      content: generatedContent,
      type: type || 'content',
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-blog-ai-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate content' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
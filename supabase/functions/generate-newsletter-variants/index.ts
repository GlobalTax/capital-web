import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VariantRequest {
  type: 'subject' | 'intro' | 'cta';
  originalContent: string;
  context?: {
    newsletterType?: string;
    sector?: string;
    audience?: string;
  };
  variantCount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { type, originalContent, context = {}, variantCount = 3 }: VariantRequest = await req.json();
    
    console.log('Generating newsletter variants:', { type, variantCount, context });

    const systemPrompts: Record<string, string> = {
      subject: `Eres un experto en email marketing para el sector M&A y finanzas corporativas. 
Tu trabajo es generar variantes de asuntos de email para tests A/B.

REGLAS:
- Cada variante debe tener máximo 50 caracteres
- Evita palabras spam como "gratis", "urgente", "oferta"
- Usa diferentes enfoques: curiosidad, datos, preguntas, beneficios
- Mantén tono profesional pero atractivo
- Personaliza con {{contact.FIRSTNAME}} si es apropiado

Responde SOLO con un JSON array de objetos con: {variant, approach, expectedImpact}`,

      intro: `Eres un redactor experto en email marketing B2B para el sector financiero y M&A.
Tu trabajo es generar variantes de textos introductorios para tests A/B.

REGLAS:
- Cada variante debe ser 2-3 frases máximo
- Usa diferentes tonos: formal, cercano, directo, narrativo
- Genera interés inmediato
- Incluye call-to-action implícito

Responde SOLO con un JSON array de objetos con: {variant, tone, expectedImpact}`,

      cta: `Eres un experto en conversión y copywriting para el sector financiero.
Tu trabajo es generar variantes de botones CTA para tests A/B.

REGLAS:
- Cada variante debe ser 2-4 palabras
- Usa verbos de acción
- Evita genéricos como "Leer más"
- Diferentes enfoques: urgencia, beneficio, curiosidad, exclusividad

Responde SOLO con un JSON array de objetos con: {variant, approach, expectedImpact}`
    };

    const userPrompts: Record<string, string> = {
      subject: `Contenido original del asunto: "${originalContent}"
Tipo de newsletter: ${context.newsletterType || 'general'}
Sector: ${context.sector || 'M&A general'}
Audiencia: ${context.audience || 'empresarios y directivos'}

Genera ${variantCount} variantes alternativas optimizadas para mejorar la tasa de apertura.`,

      intro: `Texto introductorio original: "${originalContent}"
Tipo de newsletter: ${context.newsletterType || 'general'}
Sector: ${context.sector || 'M&A general'}

Genera ${variantCount} variantes alternativas con diferentes tonos y enfoques.`,

      cta: `Texto del CTA original: "${originalContent}"
Contexto del newsletter: ${context.newsletterType || 'general'}

Genera ${variantCount} variantes alternativas que incentiven más clics.`
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompts[type] },
          { role: 'user', content: userPrompts[type] }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let variants = [];
    try {
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        variants = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing variants:', parseError);
      // Fallback: create simple variants from text
      variants = content.split('\n')
        .filter((line: string) => line.trim())
        .slice(0, variantCount)
        .map((line: string, i: number) => ({
          variant: line.replace(/^[\d\-\.\)]+\s*/, '').trim(),
          approach: ['curiosidad', 'datos', 'beneficio'][i] || 'general',
          expectedImpact: 'medium'
        }));
    }

    console.log('Generated variants:', variants.length);

    return new Response(JSON.stringify({
      success: true,
      type,
      original: originalContent,
      variants,
      usage: {
        tokens: data.usage?.total_tokens || 0,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating variants:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

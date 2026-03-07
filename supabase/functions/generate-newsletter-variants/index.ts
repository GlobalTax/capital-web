import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VariantRequest {
  type: 'subject' | 'intro' | 'cta';
  originalContent: string;
  context?: { newsletterType?: string; sector?: string; audience?: string };
  variantCount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, originalContent, context = {}, variantCount = 3 }: VariantRequest = await req.json();
    console.log('Generating newsletter variants:', { type, variantCount, context });

    const systemPrompts: Record<string, string> = {
      subject: `Eres un experto en email marketing para el sector M&A y finanzas corporativas. Tu trabajo es generar variantes de asuntos de email para tests A/B.\n\nREGLAS:\n- Cada variante debe tener máximo 50 caracteres\n- Evita palabras spam\n- Usa diferentes enfoques: curiosidad, datos, preguntas, beneficios\n- Mantén tono profesional pero atractivo\n- Personaliza con {{contact.FIRSTNAME}} si es apropiado\n\nResponde SOLO con un JSON array de objetos con: {variant, approach, expectedImpact}`,
      intro: `Eres un redactor experto en email marketing B2B para el sector financiero y M&A.\n\nREGLAS:\n- Cada variante debe ser 2-3 frases máximo\n- Usa diferentes tonos: formal, cercano, directo, narrativo\n- Genera interés inmediato\n- Incluye call-to-action implícito\n\nResponde SOLO con un JSON array de objetos con: {variant, tone, expectedImpact}`,
      cta: `Eres un experto en conversión y copywriting para el sector financiero.\n\nREGLAS:\n- Cada variante debe ser 2-4 palabras\n- Usa verbos de acción\n- Evita genéricos como "Leer más"\n- Diferentes enfoques: urgencia, beneficio, curiosidad, exclusividad\n\nResponde SOLO con un JSON array de objetos con: {variant, approach, expectedImpact}`
    };

    const userPrompts: Record<string, string> = {
      subject: `Contenido original del asunto: "${originalContent}"\nTipo: ${context.newsletterType || 'general'}\nSector: ${context.sector || 'M&A general'}\nAudiencia: ${context.audience || 'empresarios y directivos'}\n\nGenera ${variantCount} variantes.`,
      intro: `Texto introductorio original: "${originalContent}"\nTipo: ${context.newsletterType || 'general'}\nSector: ${context.sector || 'M&A general'}\n\nGenera ${variantCount} variantes.`,
      cta: `Texto del CTA original: "${originalContent}"\nContexto: ${context.newsletterType || 'general'}\n\nGenera ${variantCount} variantes.`
    };

    let aiResponse;
    try {
      aiResponse = await callAI(
        [
          { role: 'system', content: systemPrompts[type] },
          { role: 'user', content: userPrompts[type] }
        ],
        { temperature: 0.8, maxTokens: 1000, functionName: 'generate-newsletter-variants' }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    let variants = [];
    try {
      const jsonMatch = aiResponse.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) variants = JSON.parse(jsonMatch[0]);
    } catch {
      variants = aiResponse.content.split('\n')
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
      success: true, type, original: originalContent, variants,
      usage: { tokens: aiResponse.tokensUsed }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error generating variants:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

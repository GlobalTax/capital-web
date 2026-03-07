import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context } = await req.json();

    const systemPrompt = 'Eres un experto en recursos humanos y redacción de ofertas de trabajo profesionales para el mercado español.';
    let userPrompt = '';

    switch (type) {
      case 'title':
        userPrompt = `Genera un título atractivo (max 80 chars) para oferta de ${context.title || 'este puesto'}. Nivel: ${context.level || 'N/A'}. Sector: ${context.sector || 'N/A'}. Responde SOLO el título.`;
        break;
      case 'short_description':
        userPrompt = `Genera descripción corta (100-250 chars) para: ${context.title}. Nivel: ${context.level || 'N/A'}. Responde SOLO la descripción.`;
        break;
      case 'description':
        userPrompt = `Genera descripción completa (200-400 palabras) para: ${context.title}. Nivel: ${context.level || 'N/A'}. Sector: ${context.sector || 'N/A'}. Incluye contexto, reto, equipo, cultura. Responde SOLO la descripción.`;
        break;
      case 'requirements':
        userPrompt = `Genera 5-7 requisitos para ${context.title}. Nivel: ${context.level || 'N/A'}. Formato: JSON array ["req1", "req2", ...]`;
        break;
      case 'responsibilities':
        userPrompt = `Genera 5-7 responsabilidades para ${context.title}. Nivel: ${context.level || 'N/A'}. Formato: JSON array ["resp1", "resp2", ...]`;
        break;
      case 'benefits':
        userPrompt = `Genera 4-6 beneficios para ${context.title}. Sector: ${context.sector || 'N/A'}. Formato: JSON array ["ben1", "ben2", ...]`;
        break;
      case 'full':
        userPrompt = `Genera oferta completa para ${context.title}. Nivel: ${context.level || 'N/A'}. Sector: ${context.sector || 'N/A'}. JSON: {"title","short_description","description","requirements":[],"responsibilities":[],"benefits":[]}`;
        break;
      case 'parse':
        userPrompt = `Analiza esta oferta y extrae datos en JSON: {"title","short_description","description","requirements":[],"responsibilities":[],"benefits":[],"location","is_remote","contract_type","experience_level","sector","salary_min","salary_max"}\n\nTEXTO:\n${context.rawText}`;
        break;
      default:
        throw new Error('Tipo de generación no válido');
    }

    const response = await callAI(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      { functionName: 'generate-job-offer-ai', maxTokens: 1500 }
    );

    const content = response.content.trim();
    let result;

    if (['requirements', 'responsibilities', 'benefits'].includes(type)) {
      try {
        const matches = content.match(/\[[\s\S]*\]/);
        result = { items: JSON.parse(matches ? matches[0] : content) };
      } catch {
        result = { items: content.split('\n').filter(l => l.trim()).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(l => l.length > 0) };
      }
    } else if (type === 'full' || type === 'parse') {
      result = parseAIJson(content);
    } else {
      result = { content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-job-offer-ai:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

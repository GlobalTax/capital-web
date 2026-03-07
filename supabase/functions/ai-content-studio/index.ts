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
    const { type, prompt, context = {}, model = 'gpt-4o-mini', template, options = {} } = await req.json();
    
    console.log('AI Content Studio request:', { type, model, template, options });

    let systemMessage = '';
    let userMessage = '';

    if (template) {
      systemMessage = getSystemMessageForTemplate(template, type);
      userMessage = buildUserMessageFromTemplate(template, prompt, context);
    } else {
      const promptConfig = getDefaultPromptConfig(type);
      systemMessage = promptConfig.system;
      userMessage = buildUserMessage(promptConfig.user, prompt, context);
    }

    const modelConfig = getModelConfig(model, type);

    // Use centralized AI helper instead of direct OpenAI call
    const aiResponse = await callAI(
      [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      {
        functionName: 'ai-content-studio',
        preferOpenAI: true,
        temperature: options.temperature || modelConfig.temperature,
        maxTokens: options.maxTokens || modelConfig.maxTokens,
      }
    );

    const generatedContent = aiResponse.content;
    const metrics = calculateContentMetrics(generatedContent, type);
    const suggestions = generateSuggestions(generatedContent, type, context);

    const result = {
      content: generatedContent,
      type,
      model: aiResponse.model,
      usage: {
        tokens: aiResponse.tokensUsed,
        cost: calculateCost(aiResponse.tokensUsed, aiResponse.model),
      },
      confidence: calculateConfidence(generatedContent, type),
      suggestions,
      metrics
    };

    console.log('Generation completed:', { type, model: aiResponse.model, tokens: result.usage.tokens });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in ai-content-studio:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});

function getSystemMessageForTemplate(template: string, type: string): string {
  const templates: Record<string, string> = {
    'ma-article-expert': `Eres el consultor M&A más prestigioso de España, con 20+ años de experiencia. Escribes para directivos, empresarios y profesionales financieros. Tu estilo es profesional pero accesible, usando datos reales del mercado español/europeo.

Estructura tus artículos así:
1. Hook inicial
2. Introducción con contexto y valor
3. 3-4 secciones con subtítulos
4. Ejemplos prácticos
5. Conclusión con CTA
6. 1500-2000 palabras`,
    'title-optimizer': `Eres un experto en marketing digital y SEO especializado en contenido M&A. Creas títulos que capturan la atención, están optimizados para SEO, y son específicos del sector M&A.`,
    'research-assistant': `Eres un analista financiero experto que investiga el mercado M&A. Proporcionas datos actuales, tendencias, análisis comparativo, y contexto para España/Europa.`,
    'sector-report-generator': `Eres un consultor senior especializado en análisis sectoriales y M&A con 25+ años de experiencia. Generas reports profesionales con: Resumen Ejecutivo, Análisis de Mercado, Oportunidades, Conclusiones y Recomendaciones.`,
    'newsletter-subject': `Eres un experto en email marketing M&A. Crea asuntos de email concisos (máx 50 chars), profesionales y que evitan spam. Responde SOLO con el asunto.`,
    'newsletter-intro': `Eres un redactor de email marketing B2B financiero. Escribe textos intro breves (2-3 frases), directos y profesionales. Responde SOLO con el texto.`,
    'newsletter-text-block': `Eres un redactor de contenido financiero para newsletters. Crea bloques informativos, profesionales y concisos. Responde SOLO con el contenido.`,
    'newsletter-improve': `Eres un editor de contenido B2B financiero. Mejora claridad, fluidez, concisión y engagement. Responde SOLO con el texto mejorado.`
  };
  return templates[template] || getDefaultPromptConfig(type).system;
}

function buildUserMessageFromTemplate(template: string, prompt: string, context: any): string {
  if (template === 'sector-report-generator') {
    const reportTypeLabels: Record<string, string> = { 'market-analysis': 'Análisis de Mercado', 'ma-trends': 'Tendencias M&A', 'valuation-multiples': 'Múltiplos de Valoración', 'due-diligence': 'Guía de Due Diligence' };
    const depthLabels: Record<string, string> = { 'basic': 'básico (2,000-2,500 palabras)', 'intermediate': 'intermedio (3,500-4,000 palabras)', 'advanced': 'avanzado (5,000-6,000 palabras)' };
    const audienceLabels: Record<string, string> = { 'investors': 'inversores', 'entrepreneurs': 'empresarios', 'advisors': 'asesores financieros', 'executives': 'directivos C-level' };
    
    return `Genera un reporte sectorial para ${context.sector?.toUpperCase() || 'el sector'}.
Tipo: ${reportTypeLabels[context.reportType] || context.reportType}
Profundidad: ${depthLabels[context.depth] || context.depth}
Audiencia: ${audienceLabels[context.targetAudience] || context.targetAudience}
Enfoque: ${context.customFocus || 'General'}`;
  }
  return buildUserMessage(prompt, prompt, context);
}

function getDefaultPromptConfig(type: string) {
  const configs: Record<string, { system: string; user: string }> = {
    title: { system: 'Eres un experto en marketing digital y M&A que crea títulos atractivos para artículos de blog.', user: 'Genera 3 títulos para: {prompt}. Contexto: {context}' },
    content: { system: 'Eres un consultor experto en M&A que escribe artículos profesionales.', user: 'Escribe un artículo completo sobre: {prompt}. Contexto: {context}' },
    excerpt: { system: 'Eres un experto en marketing de contenidos M&A.', user: 'Crea un extracto de 150-200 chars. Título: {title}, Contenido: {prompt}' },
    seo: { system: 'Eres un especialista en SEO para M&A.', user: 'Para "{title}", crea meta título (<60 chars) y meta descripción (<160 chars).' },
    tags: { system: 'Eres un experto en taxonomía M&A.', user: 'Sugiere 5-7 tags. Título: {title}, Contenido: {prompt}' },
    research: { system: 'Eres un analista financiero experto en M&A.', user: 'Investiga: {prompt}. Incluye datos, tendencias, análisis. Contexto: {context}' }
  };
  return configs[type] || configs.content;
}

function buildUserMessage(template: string, prompt: string, context: any): string {
  return template.replace('{prompt}', prompt).replace('{title}', context.title || prompt).replace('{context}', JSON.stringify(context, null, 2));
}

function getModelConfig(model: string, type: string) {
  return { temperature: 0.7, maxTokens: type === 'content' ? 3000 : 800 };
}

function calculateContentMetrics(content: string, type: string) {
  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const avgWords = wordCount / sentences;
  const readability = Math.max(0, Math.min(10, 10 - (avgWords - 15) / 5));
  
  let seoScore = 5;
  const maKeywords = ['fusión', 'adquisición', 'valoración', 'due diligence', 'M&A', 'empresa'];
  seoScore += maKeywords.filter(k => content.toLowerCase().includes(k.toLowerCase())).length * 0.5;
  if (type === 'content' && wordCount >= 1500 && wordCount <= 2500) seoScore += 1;

  let engagement = 5;
  if (content.includes('?')) engagement += 0.5;
  if (content.includes('ejemplo')) engagement += 0.5;
  if (/\d+/.test(content)) engagement += 0.5;
  if (content.includes('€') || content.includes('%')) engagement += 0.5;

  return { wordCount, readability: Math.round(readability * 100) / 100, seoScore: Math.round(Math.min(10, seoScore) * 100) / 100, engagement: Math.min(10, engagement) };
}

function generateSuggestions(content: string, type: string, _context: any): string[] {
  const suggestions: string[] = [];
  if (type === 'content') {
    if (content.split(/\s+/).length < 1000) suggestions.push('Considera expandir el contenido');
    if (!content.includes('ejemplo')) suggestions.push('Añadir ejemplos prácticos');
    if (!/\d+/.test(content)) suggestions.push('Incluir datos o estadísticas');
  }
  if (type === 'title' && content.length > 60) suggestions.push('Considera acortar el título');
  return suggestions;
}

function calculateConfidence(content: string, type: string): number {
  let confidence = 0.8;
  if (content.length > 100) confidence += 0.05;
  if (content.includes('€') || content.includes('%')) confidence += 0.05;
  if (type === 'content' && content.split('\n').length > 5) confidence += 0.05;
  return Math.min(0.95, confidence);
}

function calculateCost(tokens: number, model: string): number {
  if (model.includes('gpt-4o')) return (tokens / 1000000) * 2.5;
  if (model.includes('gpt-4o-mini')) return (tokens / 1000000) * 0.15;
  if (model.includes('gemini')) return (tokens / 1000000) * 0.075;
  return (tokens / 1000000) * 0.15;
}

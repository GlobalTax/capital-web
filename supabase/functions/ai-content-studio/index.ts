
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Construir el system message basado en el template o tipo
    let systemMessage = '';
    let userMessage = '';

    if (template) {
      // Usar template específico (será expandido en futuras iteraciones)
      systemMessage = getSystemMessageForTemplate(template, type);
      userMessage = buildUserMessageFromTemplate(template, prompt, context);
    } else {
      // Usar prompts por defecto mejorados
      const promptConfig = getDefaultPromptConfig(type);
      systemMessage = promptConfig.system;
      userMessage = buildUserMessage(promptConfig.user, prompt, context);
    }

    // Seleccionar parámetros del modelo
    const modelConfig = getModelConfig(model, type);

    // Realizar la llamada a OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: options.temperature || modelConfig.temperature,
        max_tokens: options.maxTokens || modelConfig.maxTokens,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Calcular métricas básicas
    const metrics = calculateContentMetrics(generatedContent, type);
    
    // Generar sugerencias de mejora
    const suggestions = generateSuggestions(generatedContent, type, context);

    const result = {
      content: generatedContent,
      type,
      model,
      usage: {
        tokens: data.usage?.total_tokens || 0,
        cost: calculateCost(data.usage?.total_tokens || 0, model),
      },
      confidence: calculateConfidence(generatedContent, type),
      suggestions,
      metrics
    };

    console.log('Generation completed successfully:', { type, model, tokens: result.usage.tokens });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-content-studio function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSystemMessageForTemplate(template: string, type: string): string {
  const templates = {
    'ma-article-expert': `Eres el consultor M&A más prestigioso de España, con 20+ años de experiencia. Escribes para directivos, empresarios y profesionales financieros. Tu estilo es profesional pero accesible, usando datos reales del mercado español/europeo. Siempre incluyes ejemplos prácticos y casos reales cuando es apropiado.

Estructura tus artículos así:
1. Hook inicial que conecte con el lector
2. Introducción que establezca el contexto y valor
3. 3-4 secciones principales con subtítulos claros
4. Ejemplos prácticos o casos reales
5. Conclusión con llamada a la acción
6. Longitud: 1500-2000 palabras

Usa un tono: Experto pero accesible, con autoridad pero sin ser intimidante.`,
    'title-optimizer': `Eres un experto en marketing digital y SEO especializado en contenido M&A. Creas títulos que:
- Capturan la atención inmediata
- Están optimizados para SEO
- Generan curiosidad y clicks
- Son específicos del sector M&A
- Incluyen números o datos cuando es apropiado`,
    'research-assistant': `Eres un analista financiero experto que realiza investigaciones profundas sobre el mercado M&A. Proporcionas:
- Datos actuales y verificados
- Tendencias del mercado
- Análisis comparativo
- Fuentes confiables
- Contexto relevante para España/Europa`
  };
  
  return templates[template as keyof typeof templates] || getDefaultPromptConfig(type).system;
}

function buildUserMessageFromTemplate(template: string, prompt: string, context: any): string {
  // Implementación básica - será expandida
  return buildUserMessage(prompt, prompt, context);
}

function getDefaultPromptConfig(type: string) {
  const configs = {
    title: {
      system: 'Eres un experto en marketing digital y M&A que crea títulos atractivos para artículos de blog sobre fusiones, adquisiciones, valoraciones empresariales y finanzas corporativas. Los títulos deben ser profesionales pero atractivos, específicos del sector, y optimizados para SEO.',
      user: 'Genera 3 títulos atractivos para un artículo sobre: {prompt}. Los títulos deben ser específicos del sector M&A/finanzas, profesionales y optimizados para búsquedas. Contexto: {context}'
    },
    content: {
      system: 'Eres un consultor experto en M&A y finanzas corporativas que escribe artículos profesionales. Tu audiencia son empresarios, directivos financieros y profesionales del sector. Escribes en español con un tono profesional pero accesible, usando ejemplos prácticos y datos del mercado cuando sea apropiado.',
      user: `Escribe un artículo completo en formato markdown sobre: {prompt}. 

Estructura requerida:
- Introducción que enganche al lector
- 3-4 secciones principales con subtítulos
- Ejemplos prácticos o casos reales cuando sea posible
- Conclusión con llamada a la acción
- Longitud: 1500-2000 palabras
- Incluye datos y tendencias del mercado español/europeo cuando sea relevante
- Tono: profesional pero accesible
- Audiencia: empresarios y directivos que consideran operaciones M&A

Contexto adicional: {context}`
    },
    excerpt: {
      system: 'Eres un experto en marketing de contenidos que crea extractos atractivos para artículos de blog sobre M&A y finanzas corporativas.',
      user: 'Basándote en este título y contenido, crea un extracto de 150-200 caracteres que sea atractivo y resuma el valor del artículo para empresarios interesados en M&A. Título: {title}, Contenido: {prompt}'
    },
    seo: {
      system: 'Eres un especialista en SEO para el sector financiero y M&A. Creas meta títulos y descripciones optimizadas para búsquedas relacionadas con fusiones, adquisiciones, valoraciones y finanzas corporativas.',
      user: `Para un artículo titulado "{title}", crea:
1. Meta título (máximo 60 caracteres) optimizado para SEO
2. Meta descripción (máximo 160 caracteres) que incluya palabras clave relevantes del sector M&A

Palabras clave a considerar: fusiones, adquisiciones, valoración empresarial, due diligence, M&A, finanzas corporativas, empresa, valorar empresa`
    },
    tags: {
      system: 'Eres un experto en taxonomía de contenidos para el sector M&A y finanzas corporativas.',
      user: 'Basándote en este título y contenido, sugiere 5-7 tags relevantes para el artículo. Los tags deben ser específicos del sector M&A, valoraciones, finanzas corporativas, y términos que usarían profesionales del sector. Título: {title}, Contenido: {prompt}'
    },
    research: {
      system: 'Eres un analista financiero experto especializado en M&A que investiga y proporciona datos actuales del mercado. Siempre incluyes fuentes y contexto relevante para el mercado español y europeo.',
      user: `Investiga y proporciona información actualizada sobre: {prompt}

Incluye:
1. Datos y estadísticas recientes (últimos 12 meses)
2. Tendencias del mercado M&A en España/Europa
3. Análisis del sector específico
4. Comparativas regionales cuando sea relevante
5. Implicaciones para empresarios y directivos
6. Fuentes de información confiables

Contexto: {context}`
    }
  };
  
  return configs[type as keyof typeof configs] || configs.content;
}

function buildUserMessage(template: string, prompt: string, context: any): string {
  let message = template.replace('{prompt}', prompt);
  message = message.replace('{title}', context.title || prompt);
  message = message.replace('{context}', JSON.stringify(context, null, 2));
  return message;
}

function getModelConfig(model: string, type: string) {
  const baseConfig = {
    temperature: 0.7,
    maxTokens: type === 'content' ? 3000 : 800
  };
  
  // Configuraciones específicas por modelo
  const modelConfigs = {
    'gpt-4o': { temperature: 0.6, maxTokens: type === 'content' ? 4000 : 1000 },
    'gpt-4o-mini': { temperature: 0.7, maxTokens: type === 'content' ? 3000 : 800 },
    'claude-3-5-sonnet-20241022': { temperature: 0.5, maxTokens: type === 'content' ? 4000 : 1000 }
  };
  
  return { ...baseConfig, ...(modelConfigs[model as keyof typeof modelConfigs] || {}) };
}

function calculateContentMetrics(content: string, type: string) {
  const wordCount = content.split(/\s+/).length;
  const readability = calculateReadabilityScore(content);
  const seoScore = calculateSEOScore(content, type);
  
  return {
    wordCount,
    readability: Math.round(readability * 100) / 100,
    seoScore: Math.round(seoScore * 100) / 100,
    engagement: calculateEngagementScore(content, type)
  };
}

function calculateReadabilityScore(content: string): number {
  // Fórmula simplificada de legibilidad
  const sentences = content.split(/[.!?]+/).length;
  const words = content.split(/\s+/).length;
  const avgWordsPerSentence = words / sentences;
  
  // Score inverso - menos palabras por oración = mayor legibilidad
  return Math.max(0, Math.min(10, 10 - (avgWordsPerSentence - 15) / 5));
}

function calculateSEOScore(content: string, type: string): number {
  let score = 5; // Score base
  
  // Verificar palabras clave M&A
  const maKeywords = ['fusión', 'adquisición', 'valoración', 'due diligence', 'M&A', 'empresa'];
  const keywordCount = maKeywords.filter(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  score += keywordCount * 0.5;
  
  // Longitud apropiada
  const wordCount = content.split(/\s+/).length;
  if (type === 'content' && wordCount >= 1500 && wordCount <= 2500) score += 1;
  if (type === 'title' && content.length >= 30 && content.length <= 60) score += 2;
  
  return Math.min(10, score);
}

function calculateEngagementScore(content: string, type: string): number {
  let score = 5;
  
  // Elementos que aumentan engagement
  if (content.includes('?')) score += 0.5; // Preguntas
  if (content.includes('ejemplo')) score += 0.5; // Ejemplos
  if (/\d+/.test(content)) score += 0.5; // Números/datos
  if (content.includes('€') || content.includes('%')) score += 0.5; // Métricas financieras
  
  return Math.min(10, score);
}

function generateSuggestions(content: string, type: string, context: any): string[] {
  const suggestions = [];
  
  if (type === 'content') {
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 1000) suggestions.push('Considera expandir el contenido para mayor profundidad');
    if (!content.includes('ejemplo')) suggestions.push('Añadir ejemplos prácticos mejoraría el artículo');
    if (!/\d+/.test(content)) suggestions.push('Incluir datos o estadísticas aumentaría la credibilidad');
  }
  
  if (type === 'title') {
    if (content.length > 60) suggestions.push('Considera acortar el título para mejor SEO');
    if (!content.includes('M&A') && !content.includes('fusión') && !content.includes('adquisición')) {
      suggestions.push('Incluir términos específicos de M&A mejoraría la relevancia');
    }
  }
  
  return suggestions;
}

function calculateConfidence(content: string, type: string): number {
  let confidence = 0.8; // Base confidence
  
  // Factores que aumentan la confianza
  if (content.length > 100) confidence += 0.05;
  if (content.includes('€') || content.includes('%')) confidence += 0.05;
  if (type === 'content' && content.split('\n').length > 5) confidence += 0.05; // Estructura
  
  return Math.min(0.95, confidence);
}

function calculateCost(tokens: number, model: string): number {
  const costs = {
    'gpt-4o-mini': 0.00015,
    'gpt-4o': 0.03,
    'claude-3-5-sonnet-20241022': 0.003
  };
  
  return (tokens * (costs[model as keyof typeof costs] || 0.00015)) / 1000;
}

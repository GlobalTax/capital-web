import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const PE_SECTORS = [
  { id: 'business_services', name_es: 'Servicios Empresariales', name_en: 'Business Services' },
  { id: 'industrial_services', name_es: 'Servicios Industriales', name_en: 'Industrial Services' },
  { id: 'manufacturing', name_es: 'Manufactura', name_en: 'Manufacturing' },
  { id: 'construction_engineering', name_es: 'Construcción e Ingeniería', name_en: 'Construction & Engineering' },
  { id: 'energy_utilities', name_es: 'Energía y Utilities', name_en: 'Energy & Utilities' },
  { id: 'technology_software', name_es: 'Tecnología y Software', name_en: 'Technology & Software' },
  { id: 'healthcare', name_es: 'Salud', name_en: 'Healthcare' },
  { id: 'consumer_services', name_es: 'Servicios al Consumidor', name_en: 'Consumer Services' },
  { id: 'consumer_products', name_es: 'Productos de Consumo', name_en: 'Consumer Products' },
  { id: 'distribution_logistics', name_es: 'Distribución y Logística', name_en: 'Distribution & Logistics' },
  { id: 'transportation', name_es: 'Transporte', name_en: 'Transportation' },
  { id: 'education_training', name_es: 'Educación y Formación', name_en: 'Education & Training' },
  { id: 'financial_services', name_es: 'Servicios Financieros', name_en: 'Financial Services' },
  { id: 'real_estate_services', name_es: 'Servicios Inmobiliarios', name_en: 'Real Estate Services' },
  { id: 'environmental_services', name_es: 'Servicios Medioambientales', name_en: 'Environmental Services' },
  { id: 'media_marketing', name_es: 'Medios y Marketing', name_en: 'Media & Marketing' },
  { id: 'agriculture_food', name_es: 'Agricultura y Alimentación', name_en: 'Agriculture & Food' },
  { id: 'hospitality_leisure', name_es: 'Hostelería y Ocio', name_en: 'Hospitality & Leisure' },
  { id: 'other', name_es: 'Otros', name_en: 'Other' },
];

const SYSTEM_PROMPT = `Eres un analista de clasificación sectorial para Search Funds y Private Equity.
Tu tarea es convertir una descripción de empresa en un conjunto de etiquetas (#tags) normalizadas que sirvan para hacer matching con inversores.

SECTORES PERMITIDOS (elige SOLO UNO):
${PE_SECTORS.map(s => `- ${s.id}: ${s.name_es} (${s.name_en})`).join('\n')}

REGLAS OBLIGATORIAS:
1. Elegir UN único sector principal de la lista anterior
2. Generar entre 12 y 20 etiquetas normalizadas
3. Tags en minúsculas, sin acentos, formato snake_case
4. No usar tags genéricas como "empresa", "negocio", "servicios"
5. Si hay duda, añadir "needs_validation"
6. Incluir tags de modelo de negocio si aplican:
   - recurring_revenue: si menciona mantenimiento, suscripciones, contratos recurrentes
   - project_based: si menciona proyectos, instalación, obra, llave en mano
   - capex_light: si es servicios puros, poco activo fijo
   - capex_heavy: si requiere maquinaria, instalaciones, flota
7. Añadir 0-5 etiquetas negativas (sectores a excluir)
8. Devolver un confidence score de 0 a 100

PROHIBICIONES:
- No inventar actividades no mencionadas
- No usar expresiones vagas
- No repetir tags con diferentes formatos

FORMATO DE RESPUESTA (JSON estricto):
{
  "sector_pe": "id_del_sector",
  "sector_name_es": "Nombre en español",
  "sector_name_en": "Name in English",
  "confidence": 85,
  "tags": ["tag1", "tag2", ...],
  "negative_tags": ["tag_neg1", ...],
  "business_model_tags": ["recurring_revenue", "capex_light"],
  "reasoning": "Breve explicación de 1-2 líneas indicando qué palabras clave dispararon la clasificación"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { description, company_name } = await req.json();

    if (!description || description.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: 'Se requiere una descripción de al menos 20 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Servicio de IA no configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `Analiza la siguiente empresa y genera las etiquetas de sector:

${company_name ? `Nombre de la empresa: ${company_name}` : ''}

Descripción de la actividad:
${description}

Genera el JSON con sector, tags (12-20), tags negativos, tags de modelo de negocio y confidence score.`;

    console.log('Generating sector tags for:', company_name || 'Unknown company');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Límite de solicitudes excedido. Inténtalo de nuevo en unos minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA agotados. Contacta con el administrador.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Error en el servicio de IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Respuesta vacía del servicio de IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let result;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Error al procesar la respuesta de IA', raw: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate sector is in allowed list
    const validSector = PE_SECTORS.find(s => s.id === result.sector_pe);
    if (!validSector) {
      result.sector_pe = 'other';
      result.sector_name_es = 'Otros';
      result.sector_name_en = 'Other';
      result.confidence = Math.min(result.confidence || 50, 50);
    }

    // Ensure tags are arrays
    result.tags = Array.isArray(result.tags) ? result.tags : [];
    result.negative_tags = Array.isArray(result.negative_tags) ? result.negative_tags : [];
    result.business_model_tags = Array.isArray(result.business_model_tags) ? result.business_model_tags : [];

    // Normalize tags (lowercase, no accents, snake_case)
    const normalizeTag = (tag: string): string => {
      return tag
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    };

    result.tags = result.tags.map(normalizeTag).filter((t: string) => t.length > 1);
    result.negative_tags = result.negative_tags.map(normalizeTag).filter((t: string) => t.length > 1);
    result.business_model_tags = result.business_model_tags.map(normalizeTag).filter((t: string) => t.length > 1);

    // Ensure minimum tags
    if (result.tags.length < 12) {
      result.tags.push('needs_validation');
    }

    console.log('Generated sector tags:', {
      sector: result.sector_pe,
      confidence: result.confidence,
      tags_count: result.tags.length
    });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-sector-tags:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

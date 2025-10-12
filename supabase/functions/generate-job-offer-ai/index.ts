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

  try {
    const { type, context } = await req.json();
    console.log('Generating content for type:', type, 'with context:', context);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY no está configurada');
    }

    // Construir prompt según tipo de generación
    let systemPrompt = 'Eres un experto en recursos humanos y redacción de ofertas de trabajo profesionales para el mercado español.';
    let userPrompt = '';
    
    switch (type) {
      case 'title':
        userPrompt = `Genera un título atractivo y profesional para una oferta de trabajo de ${context.title || 'este puesto'}.
Nivel: ${context.level || 'no especificado'}
Sector: ${context.sector || 'no especificado'}
${context.keywords ? `Keywords: ${context.keywords}` : ''}

Requisitos:
- Máximo 80 caracteres
- Profesional pero atractivo
- Incluir nivel si es relevante (Junior, Senior, etc.)
- En español
- Sin usar comillas

Responde SOLO con el título, sin explicaciones adicionales.`;
        break;

      case 'short_description':
        userPrompt = `Genera una descripción corta (2-3 líneas) para una oferta de trabajo:
Puesto: ${context.title}
Nivel: ${context.level || 'no especificado'}
Sector: ${context.sector || 'no especificado'}

Requisitos:
- Entre 100-250 caracteres
- Atractiva para candidatos cualificados
- Enfocada en el valor del puesto
- En español
- Sin usar comillas

Responde SOLO con la descripción corta, sin explicaciones adicionales.`;
        break;

      case 'description':
        userPrompt = `Genera una descripción completa y profesional para una oferta de trabajo:
Puesto: ${context.title}
Nivel: ${context.level || 'no especificado'}
Sector: ${context.sector || 'no especificado'}
${context.keywords ? `Aspectos clave: ${context.keywords}` : ''}

La descripción debe incluir:
1. Breve contexto de la empresa/departamento
2. El reto y propósito del puesto
3. Tipo de equipo con el que trabajará
4. Cultura y valores de la empresa

Requisitos:
- Entre 200-400 palabras
- Tono profesional pero cercano
- Estructurado en 2-3 párrafos
- En español
- Sin usar comillas ni caracteres especiales

Responde SOLO con la descripción, sin título ni explicaciones adicionales.`;
        break;

      case 'requirements':
        userPrompt = `Genera una lista de 5-7 requisitos realistas y específicos para:
Puesto: ${context.title}
Nivel: ${context.level || 'no especificado'}
Sector: ${context.sector || 'no especificado'}

Los requisitos deben incluir:
- Experiencia relevante (años, tecnologías, herramientas)
- Formación necesaria
- Habilidades técnicas clave
- Soft skills relevantes
- Idiomas si es necesario

Formato: Devuelve SOLO una lista JSON con los requisitos, sin explicaciones:
["Requisito 1", "Requisito 2", ...]`;
        break;

      case 'responsibilities':
        userPrompt = `Genera una lista de 5-7 responsabilidades principales para:
Puesto: ${context.title}
Nivel: ${context.level || 'no especificado'}
Sector: ${context.sector || 'no especificado'}

Las responsabilidades deben ser:
- Específicas y concretas
- Orientadas a tareas del día a día
- Progresivas (de más a menos importantes)
- Realistas para el nivel del puesto

Formato: Devuelve SOLO una lista JSON con las responsabilidades, sin explicaciones:
["Responsabilidad 1", "Responsabilidad 2", ...]`;
        break;

      case 'benefits':
        userPrompt = `Genera una lista de 4-6 beneficios atractivos y realistas para:
Puesto: ${context.title}
Sector: ${context.sector || 'no especificado'}

Los beneficios deben incluir:
- Compensación (salario competitivo, bonus, etc.)
- Flexibilidad (horario, remoto, híbrido)
- Desarrollo (formación, crecimiento)
- Ambiente laboral
- Otros beneficios relevantes del sector español

Formato: Devuelve SOLO una lista JSON con los beneficios, sin explicaciones:
["Beneficio 1", "Beneficio 2", ...]`;
        break;

      case 'full':
        userPrompt = `Genera una oferta de trabajo completa en formato JSON para:
Puesto: ${context.title}
Nivel: ${context.level || 'no especificado'}
Sector: ${context.sector || 'no especificado'}
${context.keywords ? `Keywords: ${context.keywords}` : ''}

Genera un JSON con esta estructura exacta:
{
  "title": "Título atractivo de la oferta",
  "short_description": "Descripción corta de 2-3 líneas",
  "description": "Descripción completa de 200-400 palabras",
  "requirements": ["Requisito 1", "Requisito 2", ...],
  "responsibilities": ["Responsabilidad 1", "Responsabilidad 2", ...],
  "benefits": ["Beneficio 1", "Beneficio 2", ...]
}

Requisitos generales:
- Todo en español
- Tono profesional pero cercano
- Realista para el mercado español
- Sin comillas dentro de los textos

Responde SOLO con el JSON válido, sin explicaciones adicionales.`;
        break;

      case 'parse':
        userPrompt = `Analiza el siguiente texto de una oferta de trabajo y extrae toda la información en formato JSON estructurado:

TEXTO:
${context.rawText}

Genera un JSON con esta estructura exacta:
{
  "title": "Título extraído",
  "short_description": "Descripción corta (2-3 líneas)",
  "description": "Descripción completa",
  "requirements": ["Requisito 1", "Requisito 2", ...],
  "responsibilities": ["Responsabilidad 1", "Responsabilidad 2", ...],
  "benefits": ["Beneficio 1", "Beneficio 2", ...],
  "location": "Ubicación extraída",
  "is_remote": true/false,
  "is_hybrid": true/false,
  "contract_type": "indefinido/temporal/practicas/freelance",
  "employment_type": "full_time/part_time/contract",
  "experience_level": "junior/mid/senior/lead",
  "sector": "Sector identificado",
  "required_languages": ["Idioma 1", "Idioma 2", ...],
  "salary_min": número o null,
  "salary_max": número o null
}

Si no encuentras algún dato, usa null o valores vacíos.
Responde SOLO con el JSON válido, sin explicaciones.`;
        break;

      default:
        throw new Error('Tipo de generación no válido');
    }

    // Llamar a OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content.trim();
    
    console.log('Generated content:', generatedContent);

    // Procesar según tipo
    let result;
    if (['requirements', 'responsibilities', 'benefits'].includes(type)) {
      try {
        // Intentar parsear como JSON
        result = { items: JSON.parse(generatedContent) };
      } catch (e) {
        // Si falla, intentar extraer array de texto
        const matches = generatedContent.match(/\[[\s\S]*\]/);
        if (matches) {
          result = { items: JSON.parse(matches[0]) };
        } else {
          // Última opción: dividir por líneas
          result = {
            items: generatedContent
              .split('\n')
              .filter(line => line.trim() && !line.startsWith('[') && !line.startsWith(']'))
              .map(line => line.replace(/^[-•*]\s*/, '').replace(/^"\s*/, '').replace(/\s*"$/, '').trim())
              .filter(line => line.length > 0)
          };
        }
      }
    } else if (type === 'full') {
      try {
        result = JSON.parse(generatedContent);
      } catch (e) {
        console.error('Error parsing full JSON:', e);
        throw new Error('No se pudo parsear la respuesta completa de la IA');
      }
    } else {
      result = { content: generatedContent };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-job-offer-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error desconocido',
        details: error.toString()
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

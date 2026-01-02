import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestData {
  id: string;
  email: string;
  name?: string;
  company_name?: string;
  responses: Array<{
    question_id: number;
    answer: string;
    points: number;
  }>;
  total_score: number;
  readiness_level: string;
  recommendations: string[];
}

interface QuestionData {
  question_order: number;
  question_text: string;
  question_key: string;
  options: Array<{
    label: string;
    value: string;
    points: number;
  }>;
  recommendation_if_low: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { testId } = await req.json();

    if (!testId) {
      return new Response(
        JSON.stringify({ error: 'testId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-exit-readiness-report] Processing test: ${testId}`);

    // Update status to processing
    await supabase
      .from('exit_readiness_tests')
      .update({ ai_report_status: 'processing' })
      .eq('id', testId);

    // Fetch the test data
    const { data: testData, error: testError } = await supabase
      .from('exit_readiness_tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (testError || !testData) {
      console.error('[generate-exit-readiness-report] Test not found:', testError);
      return new Response(
        JSON.stringify({ error: 'Test not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch questions for context
    const { data: questions } = await supabase
      .from('exit_readiness_questions')
      .select('*')
      .eq('is_active', true)
      .order('question_order');

    // Build responses context
    const responsesContext = buildResponsesContext(testData as TestData, questions as QuestionData[] || []);

    // Get readiness level label
    const levelLabels: Record<string, string> = {
      'ready': 'Preparado para la venta',
      'in_progress': 'En proceso de preparación',
      'needs_work': 'Necesita trabajo previo'
    };
    const levelLabel = levelLabels[testData.readiness_level] || testData.readiness_level;

    // Build the AI prompt
    const prompt = `Eres un consultor senior de M&A especializado en preparación de empresas para la venta en España. Tu cliente acaba de completar un Test Exit-Ready.

DATOS DEL EMPRESARIO:
- Nombre: ${testData.name || 'No proporcionado'}
- Empresa: ${testData.company_name || 'No proporcionada'}
- Email: ${testData.email}

RESULTADOS DEL TEST:
- Puntuación Total: ${testData.total_score}/100
- Nivel de Preparación: ${levelLabel}

RESPUESTAS DETALLADAS:
${responsesContext}

---

Genera un INFORME PROFESIONAL Y PERSONALIZADO siguiendo exactamente esta estructura:

## RESUMEN EJECUTIVO

[Escribe 3-4 frases resumiendo el estado de preparación de esta empresa específica, mencionando su puntuación y lo que significa para su situación. Sé directo y profesional.]

## FORTALEZAS IDENTIFICADAS

[Lista 3-5 puntos fuertes basándote en las respuestas con alta puntuación. Cada punto debe ser específico a las respuestas del empresario.]

## ÁREAS DE MEJORA PRIORITARIAS

[Lista ordenada por impacto de las áreas que necesitan trabajo. Para cada área:
1. **Nombre del área**: Descripción del problema + acción concreta a tomar]

## PLAN DE ACCIÓN RECOMENDADO

### Próximos 30 días (Acciones inmediatas):
[2-3 acciones prioritarias basadas en las debilidades más críticas]

### Próximos 3 meses:
[2-3 acciones de medio plazo para consolidar mejoras]

### Próximos 6-12 meses:
[2-3 acciones de preparación final según el horizonte de venta indicado]

## PRÓXIMOS PASOS CON CAPITTAL

Te recomendamos agendar una consulta gratuita con nuestro equipo para:
- Obtener una valoración inicial de tu empresa
- Analizar en detalle tu situación específica
- Diseñar un plan personalizado de preparación Exit-Ready

**Recuerda**: Una buena preparación puede aumentar significativamente el valor de venta de tu empresa y reducir el tiempo del proceso.

---

INSTRUCCIONES IMPORTANTES:
- Usa un tono profesional pero cercano, como un consultor de confianza
- Sé específico basándote en las respuestas, no des consejos genéricos
- Si la puntuación es alta (>70), enfócate en optimización. Si es baja (<40), enfócate en preparación básica
- Usa formato Markdown para los encabezados y listas
- No menciones datos ficticios sobre la empresa que no conozcas`;

    let reportContent: string;

    if (lovableApiKey) {
      // Use Lovable AI API
      console.log('[generate-exit-readiness-report] Using Lovable AI API');
      
      const aiResponse = await fetch('https://api.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Eres un consultor senior de M&A especializado en preparación de empresas para la venta.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('[generate-exit-readiness-report] AI API error:', errorText);
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();
      reportContent = aiResult.choices?.[0]?.message?.content || '';
    } else {
      // Fallback: Generate a structured report without AI
      console.log('[generate-exit-readiness-report] No AI API key, using template-based report');
      reportContent = generateTemplateReport(testData as TestData, questions as QuestionData[] || []);
    }

    // Save the report
    const { error: updateError } = await supabase
      .from('exit_readiness_tests')
      .update({
        ai_report_content: reportContent,
        ai_report_status: 'completed',
        ai_report_generated_at: new Date().toISOString()
      })
      .eq('id', testId);

    if (updateError) {
      console.error('[generate-exit-readiness-report] Error saving report:', updateError);
      throw updateError;
    }

    console.log(`[generate-exit-readiness-report] Report generated successfully for test: ${testId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportContent: reportContent.substring(0, 500) + '...' // Preview only
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-exit-readiness-report] Error:', error);

    // Try to update status to failed
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { testId } = await req.clone().json().catch(() => ({}));
      if (testId) {
        await supabase
          .from('exit_readiness_tests')
          .update({
            ai_report_status: 'failed',
            ai_report_error: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', testId);
      }
    } catch (e) {
      console.error('[generate-exit-readiness-report] Error updating failure status:', e);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildResponsesContext(testData: TestData, questions: QuestionData[]): string {
  if (!testData.responses || !Array.isArray(testData.responses)) {
    return 'No hay respuestas disponibles';
  }

  return testData.responses.map(response => {
    const question = questions.find(q => q.question_order === response.question_id);
    if (!question) return null;

    const selectedOption = question.options.find(o => o.value === response.answer);
    const maxPoints = Math.max(...question.options.map(o => o.points));
    
    return `- **${question.question_text}**
  Respuesta: ${selectedOption?.label || response.answer}
  Puntuación: ${response.points}/${maxPoints}`;
  }).filter(Boolean).join('\n\n');
}

function generateTemplateReport(testData: TestData, questions: QuestionData[]): string {
  const levelLabels: Record<string, string> = {
    'ready': 'Preparado para la venta',
    'in_progress': 'En proceso de preparación',
    'needs_work': 'Necesita trabajo previo'
  };

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (testData.responses && Array.isArray(testData.responses)) {
    testData.responses.forEach(response => {
      const question = questions.find(q => q.question_order === response.question_id);
      if (!question) return;

      const maxPoints = Math.max(...question.options.map(o => o.points));
      const selectedOption = question.options.find(o => o.value === response.answer);
      
      if (response.points >= maxPoints * 0.7) {
        strengths.push(`**${question.question_key}**: ${selectedOption?.label}`);
      } else if (response.points < maxPoints * 0.5) {
        improvements.push(`**${question.question_text}**: ${question.recommendation_if_low}`);
      }
    });
  }

  return `## RESUMEN EJECUTIVO

Tu empresa ha obtenido una puntuación de **${testData.total_score}/100** en el Test Exit-Ready, lo que indica un nivel de preparación: **${levelLabels[testData.readiness_level] || testData.readiness_level}**.

${testData.total_score >= 70 
  ? 'Tu empresa muestra una buena preparación para afrontar un proceso de venta. Hay áreas que optimizar, pero los fundamentos están sólidos.'
  : testData.total_score >= 40
  ? 'Tu empresa tiene bases interesantes pero requiere trabajo en varias áreas clave antes de iniciar un proceso de venta.'
  : 'Es importante que dediques tiempo a preparar tu empresa antes de considerar una venta. Trabajar en las áreas identificadas aumentará significativamente tus posibilidades de éxito.'}

## FORTALEZAS IDENTIFICADAS

${strengths.length > 0 ? strengths.map(s => `- ${s}`).join('\n') : '- Disposición a evaluar la preparación de la empresa\n- Interés en mejorar antes de la venta'}

## ÁREAS DE MEJORA PRIORITARIAS

${improvements.length > 0 ? improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n\n') : 'No se identificaron áreas críticas de mejora basadas en tus respuestas.'}

## PLAN DE ACCIÓN RECOMENDADO

### Próximos 30 días:
- Revisar y organizar la documentación financiera de los últimos 3 años
- Identificar y documentar los procesos clave del negocio

### Próximos 3 meses:
- Trabajar en reducir la dependencia del propietario
- Formalizar contratos con clientes y proveedores clave

### Próximos 6-12 meses:
- Obtener una valoración profesional actualizada
- Preparar un memorándum de información para potenciales compradores

## PRÓXIMOS PASOS CON CAPITTAL

Te recomendamos agendar una consulta gratuita con nuestro equipo para:
- Obtener una valoración inicial de tu empresa
- Analizar en detalle tu situación específica
- Diseñar un plan personalizado de preparación Exit-Ready

**Contacta con nosotros en info@capittal.es o visita capittal.es para más información.**`;
}

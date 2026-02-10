import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

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

const defaultSenderEmail = Deno.env.get('SENDER_EMAIL') || 'samuel@capittal.es';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

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
      
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Eres un consultor senior de M&A especializado en preparación de empresas para la venta.' },
            { role: 'user', content: prompt }
          ],
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

    // Send email with the report
    let emailSent = false;
    if (resendApiKey && testData.email) {
      try {
        console.log('[generate-exit-readiness-report] Sending email to:', testData.email);
        const resend = new Resend(resendApiKey);
        
        const emailHtml = generateEmailHtml(testData as TestData, reportContent, levelLabel);
        
        const { error: emailError } = await resend.emails.send({
          from: `Capittal <${defaultSenderEmail}>`,
          to: [testData.email],
          subject: `Tu Informe Exit-Ready - ${testData.company_name || 'Capittal'}`,
          html: emailHtml,
        });

        if (emailError) {
          console.error('[generate-exit-readiness-report] Email error:', emailError);
        } else {
          emailSent = true;
          console.log('[generate-exit-readiness-report] Email sent successfully');
          
          // Update email sent status
          await supabase
            .from('exit_readiness_tests')
            .update({ email_sent: true, email_sent_at: new Date().toISOString() })
            .eq('id', testId);
        }
      } catch (emailErr) {
        console.error('[generate-exit-readiness-report] Email send error:', emailErr);
      }
    } else {
      console.log('[generate-exit-readiness-report] Skipping email - no RESEND_API_KEY or email');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailSent,
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

function generateEmailHtml(testData: TestData, reportContent: string, levelLabel: string): string {
  const userName = testData.name || 'Empresario';
  const companyName = testData.company_name || 'tu empresa';
  
  // Convert markdown to simple HTML
  const reportHtml = reportContent
    .replace(/^## (.+)$/gm, '<h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 28px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 20px 0 12px 0;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin: 6px 0; color: #334155;">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin: 8px 0; color: #334155;"><strong>$1.</strong> $2</li>')
    .replace(/\n\n/g, '</p><p style="margin: 12px 0; color: #334155; line-height: 1.6;">')
    .replace(/<li/g, '</ul><ul style="margin: 12px 0; padding-left: 20px;"><li')
    .replace(/<\/li>\n<\/ul>/g, '</li></ul>')
    .replace(/<\/ul><ul[^>]*>/g, '');

  // Determine badge color based on readiness level
  const badgeColors: Record<string, { bg: string; text: string }> = {
    'ready': { bg: '#dcfce7', text: '#166534' },
    'in_progress': { bg: '#fef3c7', text: '#92400e' },
    'needs_work': { bg: '#ffedd5', text: '#9a3412' }
  };
  const badge = badgeColors[testData.readiness_level] || badgeColors['in_progress'];

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Informe Exit-Ready - Capittal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 40px; text-align: center;">
              <img src="https://capittal.es/lovable-uploads/capittal-logo-white.png" alt="Capittal" width="140" style="display: block; margin: 0 auto 16px;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Tu Informe Exit-Ready</h1>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 24px;">
              <p style="margin: 0 0 16px; color: #334155; font-size: 16px; line-height: 1.6;">
                Hola <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 24px; color: #334155; font-size: 16px; line-height: 1.6;">
                Gracias por completar el Test Exit-Ready de Capittal. A continuación encontrarás tu informe personalizado con un análisis detallado del nivel de preparación de <strong>${companyName}</strong> para un proceso de venta.
              </p>
              
              <!-- Score Badge -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Puntuación</p>
                    <p style="margin: 0 0 12px; color: #0f172a; font-size: 36px; font-weight: 700;">${testData.total_score}<span style="font-size: 20px; color: #64748b;">/100</span></p>
                    <span style="display: inline-block; background-color: ${badge.bg}; color: ${badge.text}; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">${levelLabel}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Report Content -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                ${reportHtml}
              </div>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <h3 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 12px;">¿Quieres dar el siguiente paso?</h3>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px;">Agenda una consulta gratuita con nuestro equipo de expertos.</p>
                    <a href="https://capittal.es/contacto" style="display: inline-block; background-color: #ffffff; color: #0f172a; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none;">Solicitar consulta gratuita</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">
                      <strong>Capittal</strong> · Especialistas en M&A
                    </p>
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">
                      📞 +34 695 717 490 · ✉️ info@capittal.es
                    </p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                      Este informe es confidencial y está destinado únicamente al destinatario.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';
import { callAI } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestData {
  id: string;
  email: string;
  name?: string;
  company_name?: string;
  responses: Array<{ question_id: number; answer: string; points: number }>;
  total_score: number;
  readiness_level: string;
  recommendations: string[];
}

interface QuestionData {
  question_order: number;
  question_text: string;
  question_key: string;
  options: Array<{ label: string; value: string; points: number }>;
  recommendation_if_low: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { testId } = await req.json();
    if (!testId) {
      return new Response(JSON.stringify({ error: 'testId is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`[generate-exit-readiness-report] Processing test: ${testId}`);

    await supabase.from('exit_readiness_tests').update({ ai_report_status: 'processing' }).eq('id', testId);

    const { data: testData, error: testError } = await supabase.from('exit_readiness_tests').select('*').eq('id', testId).single();
    if (testError || !testData) {
      return new Response(JSON.stringify({ error: 'Test not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: questions } = await supabase.from('exit_readiness_questions').select('*').eq('is_active', true).order('question_order');

    const responsesContext = buildResponsesContext(testData as TestData, questions as QuestionData[] || []);

    const levelLabels: Record<string, string> = {
      'ready': 'Preparado para la venta',
      'in_progress': 'En proceso de preparación',
      'needs_work': 'Necesita trabajo previo'
    };
    const levelLabel = levelLabels[testData.readiness_level] || testData.readiness_level;

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
[3-4 frases resumiendo el estado de preparación]

## FORTALEZAS IDENTIFICADAS
[3-5 puntos fuertes basados en respuestas con alta puntuación]

## ÁREAS DE MEJORA PRIORITARIAS
[Lista ordenada por impacto]

## PLAN DE ACCIÓN RECOMENDADO
### Próximos 30 días:
[2-3 acciones inmediatas]
### Próximos 3 meses:
[2-3 acciones de medio plazo]
### Próximos 6-12 meses:
[2-3 acciones de preparación final]

## PRÓXIMOS PASOS CON CAPITTAL
Te recomendamos agendar una consulta gratuita con nuestro equipo.

INSTRUCCIONES: Tono profesional pero cercano. Sé específico. Usa formato Markdown.`;

    let reportContent: string;

    try {
      const aiResponse = await callAI(
        [
          { role: 'system', content: 'Eres un consultor senior de M&A especializado en preparación de empresas para la venta.' },
          { role: 'user', content: prompt }
        ],
        { model: 'google/gemini-2.5-flash', functionName: 'generate-exit-readiness-report' }
      );
      reportContent = aiResponse.content;
    } catch {
      console.log('[generate-exit-readiness-report] AI failed, using template-based report');
      reportContent = generateTemplateReport(testData as TestData, questions as QuestionData[] || []);
    }

    const { error: updateError } = await supabase
      .from('exit_readiness_tests')
      .update({ ai_report_content: reportContent, ai_report_status: 'completed', ai_report_generated_at: new Date().toISOString() })
      .eq('id', testId);

    if (updateError) throw updateError;

    console.log(`[generate-exit-readiness-report] Report generated successfully for test: ${testId}`);

    // Send email
    let emailSent = false;
    if (resendApiKey && testData.email) {
      try {
        const resend = new Resend(resendApiKey);
        const emailHtml = generateEmailHtml(testData as TestData, reportContent, levelLabel);
        const { error: emailError } = await resend.emails.send({
          from: 'Capittal <samuel@capittal.es>',
          to: [testData.email],
          cc: ['lluis@capittal.es'],
          subject: `Tu Informe Exit-Ready - ${testData.company_name || 'Capittal'}`,
          html: emailHtml,
        });
        if (!emailError) {
          emailSent = true;
          await supabase.from('exit_readiness_tests').update({ email_sent: true, email_sent_at: new Date().toISOString() }).eq('id', testId);
        }
      } catch (emailErr) {
        console.error('[generate-exit-readiness-report] Email send error:', emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailSent, reportContent: reportContent.substring(0, 500) + '...' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-exit-readiness-report] Error:', error);
    try {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const { testId } = await req.clone().json().catch(() => ({}));
      if (testId) {
        await supabase.from('exit_readiness_tests').update({ ai_report_status: 'failed', ai_report_error: error instanceof Error ? error.message : 'Unknown error' }).eq('id', testId);
      }
    } catch (e) { console.error('Error updating failure status:', e); }

    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function buildResponsesContext(testData: TestData, questions: QuestionData[]): string {
  if (!testData.responses || !Array.isArray(testData.responses)) return 'No hay respuestas disponibles';
  return testData.responses.map(response => {
    const question = questions.find(q => q.question_order === response.question_id);
    if (!question) return null;
    const selectedOption = question.options.find(o => o.value === response.answer);
    const maxPoints = Math.max(...question.options.map(o => o.points));
    return `- **${question.question_text}**\n  Respuesta: ${selectedOption?.label || response.answer}\n  Puntuación: ${response.points}/${maxPoints}`;
  }).filter(Boolean).join('\n\n');
}

function generateTemplateReport(testData: TestData, questions: QuestionData[]): string {
  const levelLabels: Record<string, string> = { 'ready': 'Preparado para la venta', 'in_progress': 'En proceso de preparación', 'needs_work': 'Necesita trabajo previo' };
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (testData.responses && Array.isArray(testData.responses)) {
    testData.responses.forEach(response => {
      const question = questions.find(q => q.question_order === response.question_id);
      if (!question) return;
      const maxPoints = Math.max(...question.options.map(o => o.points));
      const selectedOption = question.options.find(o => o.value === response.answer);
      if (response.points >= maxPoints * 0.7) strengths.push(`**${question.question_key}**: ${selectedOption?.label}`);
      else if (response.points < maxPoints * 0.5) improvements.push(`**${question.question_text}**: ${question.recommendation_if_low}`);
    });
  }

  return `## RESUMEN EJECUTIVO\n\nTu empresa ha obtenido una puntuación de **${testData.total_score}/100** en el Test Exit-Ready, nivel: **${levelLabels[testData.readiness_level] || testData.readiness_level}**.\n\n## FORTALEZAS IDENTIFICADAS\n\n${strengths.length > 0 ? strengths.map(s => `- ${s}`).join('\n') : '- Disposición a evaluar la preparación'}\n\n## ÁREAS DE MEJORA PRIORITARIAS\n\n${improvements.length > 0 ? improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n\n') : 'No se identificaron áreas críticas.'}\n\n## PLAN DE ACCIÓN RECOMENDADO\n\n### Próximos 30 días:\n- Revisar documentación financiera\n- Identificar procesos clave\n\n### Próximos 3 meses:\n- Reducir dependencia del propietario\n- Formalizar contratos clave\n\n### Próximos 6-12 meses:\n- Obtener valoración profesional\n- Preparar memorándum de información\n\n## PRÓXIMOS PASOS CON CAPITTAL\n\nContacta con nosotros en info@capittal.es`;
}

function generateEmailHtml(testData: TestData, reportContent: string, levelLabel: string): string {
  const userName = testData.name || 'Empresario';
  const companyName = testData.company_name || 'tu empresa';
  const reportHtml = reportContent
    .replace(/^## (.+)$/gm, '<h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 28px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 20px 0 12px 0;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin: 6px 0; color: #334155;">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin: 8px 0; color: #334155;"><strong>$1.</strong> $2</li>')
    .replace(/\n\n/g, '</p><p style="margin: 12px 0; color: #334155; line-height: 1.6;">');

  const badgeColors: Record<string, { bg: string; text: string }> = {
    'ready': { bg: '#dcfce7', text: '#166534' },
    'in_progress': { bg: '#fef3c7', text: '#92400e' },
    'needs_work': { bg: '#ffedd5', text: '#9a3412' }
  };
  const badge = badgeColors[testData.readiness_level] || badgeColors['in_progress'];

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Tu Informe Exit-Ready - Capittal</title></head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
<tr><td align="center" style="padding: 40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
<tr><td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 40px; text-align: center;">
<h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Tu Informe Exit-Ready</h1>
</td></tr>
<tr><td style="padding: 32px 40px 24px;">
<p style="margin: 0 0 16px; color: #334155; font-size: 16px;">Hola <strong>${userName}</strong>,</p>
<p style="margin: 0 0 24px; color: #334155; font-size: 16px;">Gracias por completar el Test Exit-Ready de Capittal. A continuación encontrarás tu informe personalizado para <strong>${companyName}</strong>.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center;">
<p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-transform: uppercase;">Puntuación</p>
<p style="margin: 0 0 12px; color: #0f172a; font-size: 36px; font-weight: 700;">${testData.total_score}<span style="font-size: 20px; color: #64748b;">/100</span></p>
<span style="display: inline-block; background-color: ${badge.bg}; color: ${badge.text}; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">${levelLabel}</span>
</td></tr></table>
</td></tr>
<tr><td style="padding: 0 40px 32px;">
<div style="color: #334155; font-size: 15px; line-height: 1.6;">${reportHtml}</div>
</td></tr>
<tr><td style="padding: 24px 40px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
<a href="https://capittal.es/contacto" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Agendar consulta gratuita</a>
<p style="margin: 16px 0 0; color: #64748b; font-size: 13px;">© ${new Date().getFullYear()} Capittal. Todos los derechos reservados.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

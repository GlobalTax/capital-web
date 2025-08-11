import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendV4LinkRequest {
  valuationId: string;
  sendEmail?: boolean;
  lang?: 'es' | 'ca' | 'val' | 'gl';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const { valuationId, sendEmail = true, lang = 'es' }: SendV4LinkRequest = await req.json();

    console.log('Processing V4 link request for valuation:', valuationId);

    // Obtener datos de la valoración
    const { data: valuation, error: valuationError } = await supabase
      .from('company_valuations')
      .select('*')
      .eq('id', valuationId)
      .single();

    if (valuationError || !valuation) {
      console.error('Valuation not found:', valuationError);
      return new Response(
        JSON.stringify({ error: 'Valoración no encontrada' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Generar token si no existe
    let token = valuation.unique_token;
    if (!token) {
      const { data: updated, error: updateError } = await supabase
        .from('company_valuations')
        .update({ unique_token: crypto.randomUUID().replace(/-/g, '') })
        .eq('id', valuationId)
        .select('unique_token')
        .single();

      if (updateError || !updated) {
        console.error('Error generating token:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error generando enlace' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      token = updated.unique_token;
    }

    const v4Url = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '.lovable.app')}/simulador-ultra-rapido/${token}`;

    if (sendEmail && valuation.email) {
      const dict = {
        es: {
          subject: `🚀 ${valuation.company_name} - Tu Simulador de Venta Personalizado`,
          title: '🚀 Tu Simulador Está Listo',
          subtitle: 'Explora escenarios de venta en tiempo real',
          greeting: `Hola ${valuation.contact_name},`,
          prepared: `Hemos preparado un <strong>simulador ultra-rápido personalizado</strong> con los datos de <strong>${valuation.company_name}</strong>.`,
          bulletsHeader: '🎯 Con este simulador podrás:',
          bullets: [
            'Ver múltiples escenarios de valoración en tiempo real',
            'Ajustar parámetros fiscales y de venta',
            'Calcular el impacto fiscal automáticamente',
            'Visualizar el retorno neto de cada escenario'
          ],
          cta: '🔥 Acceder al Simulador',
          nextSteps: 'Después de explorar los escenarios, podremos agendar una consulta personalizada para profundizar en las mejores estrategias para tu caso específico.',
          questions: '¿Tienes alguna pregunta? Responde a este email o contáctanos directamente.'
        },
        ca: {
          subject: `🚀 ${valuation.company_name} - El teu Simulador de Venda Personalitzat`,
          title: '🚀 El teu Simulador Està Llest',
          subtitle: 'Explora escenaris de venda en temps real',
          greeting: `Hola ${valuation.contact_name},`,
          prepared: `Hem preparat un <strong>simulador ultra-ràpid personalitzat</strong> amb les dades de <strong>${valuation.company_name}</strong>.`,
          bulletsHeader: '🎯 Amb aquest simulador podràs:',
          bullets: [
            'Veure múltiples escenaris de valoració en temps real',
            'Ajustar paràmetres fiscals i de venda',
            "Calcular l'impacte fiscal automàticament",
            'Visualitzar el retorn net de cada escenari'
          ],
          cta: '🔥 Accedir al Simulador',
          nextSteps: 'Després d\'explorar els escenaris, podrem agendar una consulta personalitzada per aprofundir en les millors estratègies per al teu cas específic.',
          questions: 'Tens algun dubte? Respon a aquest correu o contacta\'ns directament.'
        },
        val: {
          subject: `🚀 ${valuation.company_name} - El teu Simulador de Venda Personalitzat`,
          title: '🚀 El teu Simulador Està Llest',
          subtitle: 'Explora escenaris de venda en temps real',
          greeting: `Hola ${valuation.contact_name},`,
          prepared: `Hem preparat un <strong>simulador ultra-ràpid personalitzat</strong> amb les dades de <strong>${valuation.company_name}</strong>.`,
          bulletsHeader: '🎯 Amb este simulador podràs:',
          bullets: [
            'Vore múltiples escenaris de valoració en temps real',
            'Ajustar paràmetres fiscals i de venda',
            "Calcular l'impacte fiscal automàticament",
            'Visualisar el retorn net de cada escenari'
          ],
          cta: '🔥 Accedir al Simulador',
          nextSteps: 'Després d\'explorar els escenaris, podrem agendar una consulta personalitzada per a aprofundir en les millors estratègies per al teu cas en concret.',
          questions: 'Tens algun dubte? Respon a este correu o contacta\'ns directament.'
        },
        gl: {
          subject: `🚀 ${valuation.company_name} - O teu simulador de venda personalizado`,
          title: '🚀 O teu simulador está preparado',
          subtitle: 'Explora escenarios de venda en tempo real',
          greeting: `Ola ${valuation.contact_name},`,
          prepared: `Preparamos un <strong>simulador ultra-rápido personalizado</strong> cos datos de <strong>${valuation.company_name}</strong>.`,
          bulletsHeader: '🎯 Con este simulador poderás:',
          bullets: [
            'Ver múltiples escenarios de valoración en tempo real',
            'Axustar parámetros fiscais e de venda',
            'Calcular o impacto fiscal automaticamente',
            'Visualizar o retorno neto de cada escenario'
          ],
          cta: '🔥 Acceder ao simulador',
          nextSteps: 'Despois de explorar os escenarios, poderemos axendar unha consulta personalizada para afondar nas mellores estratexias para o teu caso.',
          questions: 'Tes algunha dúbida? Responde a este email ou contáctanos directamente.'
        }
      } as const;
      const S = dict[(lang as 'es'|'ca'|'val'|'gl') || 'es'] || dict.es;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
            <title>${S.subject.replace(/^🚀\s*/, '')}</title>
          </head>
        <body style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                ${S.title}
              </h1>
              <p style="color: #e0f2fe; margin: 10px 0 0; font-size: 16px;">
                ${S.subtitle}
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1e40af; margin: 0 0 20px; font-size: 22px;">
                ${S.greeting}
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px;">
                ${S.prepared}
              </p>

              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px; color: #1e40af; font-size: 18px;">${S.bulletsHeader}</h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569;">
                  ${S.bullets.map(li => `<li>${li}</li>`).join('')}
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${v4Url}" 
                   style="display: inline-block; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s;">
                  ${S.cta}
                </a>
              </div>

              <!-- Company Info -->
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0;">
                <strong style="color: #1e40af;">Empresa:</strong> ${valuation.company_name}<br>
                <strong style="color: #1e40af;">Sector:</strong> ${valuation.industry}<br>
                <strong style="color: #1e40af;">Valoración Base:</strong> €${(valuation.final_valuation || 0).toLocaleString('es-ES')}
              </div>

              <p style="margin: 25px 0 10px; font-size: 14px; color: #64748b;">
                <strong>Próximos pasos:</strong><br>
                ${S.nextSteps}
              </p>

              <p style="margin: 20px 0; font-size: 14px; color: #64748b;">
                ${S.questions}
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 14px; color: #64748b;">
                <strong>Capittal</strong><br>
                Especialistas en M&A y Valoraciones<br>
                📍 P.º de la Castellana, 11, B-A, 28046 Madrid
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: 'Capittal <onboarding@resend.dev>',
          to: [valuation.email],
          subject: S.subject,
          html: emailHtml,
        });

        console.log('Email sent successfully:', emailResponse);

        // Actualizar registro de envío
        await supabase
          .from('company_valuations')
          .update({
            v4_link_sent: true,
            v4_link_sent_at: new Date().toISOString()
          })
          .eq('id', valuationId);

      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continuar aunque falle el email
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        v4Url,
        token,
        emailSent: sendEmail && valuation.email 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-v4-link function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormNotificationRequest {
  submissionId: string;
  formType: 'contact' | 'collaborator' | 'newsletter' | 'calendar' | 'general_contact' | 'sell_lead' | 'operation_contact' | 'lead_magnet_download';
  email: string;
  fullName: string;
  formData: any;
}

// Reducido a 3 admins principales para respetar rate limit de Resend (2 emails/segundo)
const ADMIN_EMAILS = ['lluis@capittal.es', 'samuel@capittal.es', 'pau@capittal.es'];

const getUserConfirmationTemplate = (formType: string, data: any) => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .header { background: #0f172a; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background: #f9f9f9; }
      .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .label { font-weight: bold; color: #0f172a; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      .cta-button { background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
    </style>
  `;

  switch (formType) {
    case 'contact':
    case 'general_contact':
      return {
        subject: `✅ Hemos recibido tu consulta - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Gracias por contactarnos!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName}</strong>,</p>
              <p>Hemos recibido tu consulta y queremos agradecerte por ponerte en contacto con nosotros.</p>
              <p>Nuestro equipo revisará tu mensaje y se pondrá en contacto contigo en las próximas 24-48 horas para dar seguimiento a tu consulta.</p>
              <p>Mientras tanto, te invitamos a:</p>
              <ul>
                <li>Explorar nuestros casos de éxito en <a href="https://capittal.es/casos-exito">capittal.es/casos-exito</a></li>
                <li>Conocer más sobre nuestros servicios en <a href="https://capittal.es/servicios">capittal.es/servicios</a></li>
                <li>Probar nuestra calculadora de valoración gratuita en <a href="https://capittal.es/lp/calculadora">capittal.es/lp/calculadora</a></li>
              </ul>
              <p>Si tienes alguna pregunta urgente, no dudes en llamarnos al <strong>+34 XXX XXX XXX</strong>.</p>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    case 'sell_lead':
      return {
        subject: `✅ Tu consulta de venta ha sido recibida - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Gracias por confiar en nosotros!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName}</strong>,</p>
              <p>Hemos recibido tu consulta sobre la venta de tu empresa <strong>${data.company}</strong>.</p>
              <p>Entendemos que esta es una decisión importante y queremos asegurarnos de brindarte el mejor asesoramiento posible.</p>
              <p>Nuestro equipo de expertos en M&A revisará tu caso y se pondrá en contacto contigo en las próximas 24 horas para programar una consulta inicial gratuita.</p>
              <p>En esta primera reunión podremos:</p>
              <ul>
                <li>Evaluar el valor potencial de tu empresa</li>
                <li>Discutir tus objetivos y expectativas</li>
                <li>Explicarte nuestro proceso de venta</li>
                <li>Resolver todas tus dudas</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de M&A de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    case 'collaborator':
      return {
        subject: `✅ Tu solicitud de colaboración ha sido recibida - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Bienvenido al programa de colaboradores!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName}</strong>,</p>
              <p>¡Gracias por tu interés en formar parte de nuestra red de colaboradores profesionales!</p>
              <p>Hemos recibido tu solicitud y estamos muy emocionados de conocer más sobre tu experiencia en <strong>${data.profession}</strong>.</p>
              <p>Nuestro equipo revisará tu perfil y se pondrá en contacto contigo en los próximos 3-5 días hábiles para programar una entrevista inicial.</p>
              <p>Mientras tanto, te recomendamos:</p>
              <ul>
                <li>Preparar ejemplos de proyectos anteriores relevantes</li>
                <li>Revisar nuestros casos de éxito en <a href="https://capittal.es/casos-exito">capittal.es/casos-exito</a></li>
                <li>Conocer más sobre nuestra metodología de trabajo</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de RRHH de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    case 'operation_contact':
      return {
        subject: `✅ Tu interés en la operación ha sido registrado - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Gracias por tu interés!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName}</strong>,</p>
              <p>Hemos recibido tu consulta sobre la operación <strong>${data.companyName}</strong>.</p>
              <p><span class="label">ID de operación:</span> ${data.operationId}</p>
              ${data.message ? `<p><span class="label">Tu mensaje:</span> ${data.message}</p>` : ''}
              <p>Nuestro equipo revisará tu perfil de inversor y se pondrá en contacto contigo en las próximas 24-48 horas para proporcionarte más información detallada sobre esta oportunidad.</p>
              <p>Te recordamos que todas nuestras operaciones están sujetas a:</p>
              <ul>
                <li>Proceso de due diligence completo</li>
                <li>Verificación de perfil de inversor</li>
                <li>Firma de acuerdos de confidencialidad</li>
                <li>Cumplimiento de requisitos regulatorios</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de Inversiones de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    case 'newsletter':
      return {
        subject: `✅ ¡Bienvenido a nuestro newsletter! - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Bienvenido a la comunidad Capittal!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>¡Hola!</p>
              <p>¡Gracias por suscribirte a nuestro newsletter!</p>
              <p>Ahora recibirás contenido exclusivo sobre:</p>
              <ul>
                <li>📈 Tendencias del mercado M&A</li>
                <li>💡 Consejos para valorar empresas</li>
                <li>🎯 Estrategias de crecimiento empresarial</li>
                <li>📊 Análisis de sectores</li>
                <li>🔥 Oportunidades de inversión</li>
              </ul>
              <p>Tu primer newsletter llegará la próxima semana. ¡No te lo pierdas!</p>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    default:
      return {
        subject: `✅ Hemos recibido tu información - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Gracias por contactarnos!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName || 'Usuario'}</strong>,</p>
              <p>Hemos recibido tu información y nos pondremos en contacto contigo muy pronto.</p>
              <p>Gracias por tu interés en Capittal.</p>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };
  }
};

const getEmailTemplate = (formType: string, data: any) => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .header { background: #0f172a; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background: #f9f9f9; }
      .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .label { font-weight: bold; color: #0f172a; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
  `;

  switch (formType) {
    case 'contact':
      return {
        subject: `🔥 Nuevo Lead de Contacto - ${data.fullName}`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>🎯 Nuevo Lead de Contacto</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><span class="label">Nombre:</span> ${data.fullName}</p>
              <p><span class="label">Email:</span> ${data.email}</p>
              <p><span class="label">Empresa:</span> ${data.company || 'No especificada'}</p>
              <p><span class="label">Teléfono:</span> ${data.phone || 'No especificado'}</p>
              <p><span class="label">País:</span> ${data.country || 'No especificado'}</p>
              <p><span class="label">Tamaño de empresa:</span> ${data.companySize || 'No especificado'}</p>
              <p><span class="label">Referencia:</span> ${data.referral || 'No especificada'}</p>
            </div>
          </div>
          <div class="footer">
            <p>Capittal - Sistema de Gestión de Leads</p>
          </div>
        `
      };

    case 'general_contact':
      return {
        subject: `💼 Nuevo Lead de Contacto General - ${data.fullName}`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>💼 Nuevo Lead de Contacto General</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><span class="label">Nombre:</span> ${data.fullName}</p>
              <p><span class="label">Email:</span> ${data.email}</p>
              <p><span class="label">Empresa:</span> ${data.company}</p>
              <p><span class="label">Teléfono:</span> ${data.phone || 'No especificado'}</p>
              <p><span class="label">País:</span> ${data.country || 'No especificado'}</p>
              <p><span class="label">Facturación anual:</span> ${data.annual_revenue || 'No especificada'}</p>
              <p><span class="label">¿Cómo nos conociste?:</span> ${data.how_did_you_hear || 'No especificado'}</p>
              <p><span class="label">Página de origen:</span> ${data.page_origin || 'No especificada'}</p>
              <p><span class="label">Mensaje:</span> ${data.message}</p>
            </div>
          </div>
          <div class="footer">
            <p>Capittal - Sistema de Contacto</p>
          </div>
        `
      };

    case 'sell_lead':
      return {
        subject: `🏢 Nuevo Lead de Venta de Empresa - ${data.fullName}`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>🏢 Nueva Consulta de Venta de Empresa</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><span class="label">Nombre:</span> ${data.fullName}</p>
              <p><span class="label">Email:</span> ${data.email}</p>
              <p><span class="label">Empresa:</span> ${data.company}</p>
              <p><span class="label">Teléfono:</span> ${data.phone || 'No especificado'}</p>
              <p><span class="label">Rango de facturación:</span> ${data.revenue_range || 'No especificado'}</p>
              <p><span class="label">Mensaje:</span> ${data.message || 'Sin mensaje específico'}</p>
            </div>
          </div>
          <div class="footer">
            <p>Capittal - Venta de Empresas</p>
          </div>
        `
      };

    case 'operation_contact':
      return {
        subject: `🎯 Nueva Consulta de Operación - ${data.fullName}`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>🎯 Nueva Consulta de Operación</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><span class="label">Nombre:</span> ${data.fullName}</p>
              <p><span class="label">Email:</span> ${data.email}</p>
              <p><span class="label">Empresa:</span> ${data.company || 'No especificada'}</p>
              <p><span class="label">Teléfono:</span> ${data.phone || 'No especificado'}</p>
              <p><span class="label">Tipo de servicio:</span> ${data.serviceType || 'No especificado'}</p>
              <p><span class="label">Operación de interés:</span> ${data.companyName}</p>
              <p><span class="label">ID de operación:</span> <a href="https://capittal.es/oportunidades?operation=${data.operationId}">${data.operationId}</a></p>
              <p><span class="label">Mensaje:</span> ${data.message || 'Sin mensaje'}</p>
              <p><span class="label">Fecha:</span> ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
          <div class="footer">
            <p>Capittal - Consulta de Operación</p>
          </div>
        `
      };

    case 'lead_magnet_download':
      return {
        subject: `📥 Nueva Descarga de Lead Magnet - ${data.fullName}`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>📥 Nueva Descarga de Lead Magnet</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><span class="label">Nombre:</span> ${data.fullName}</p>
              <p><span class="label">Email:</span> ${data.email}</p>
              <p><span class="label">Empresa:</span> ${data.user_company || 'No especificada'}</p>
              <p><span class="label">Teléfono:</span> ${data.user_phone || 'No especificado'}</p>
              <p><span class="label">Lead Magnet ID:</span> ${data.lead_magnet_id}</p>
              <p><span class="label">Fecha:</span> ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
          <div class="footer">
            <p>Capittal - Lead Magnet</p>
          </div>
        `
      };

    case 'collaborator':
      return {
        subject: `🤝 Nueva Solicitud de Colaborador - ${data.fullName}`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>🤝 Nueva Solicitud de Colaborador</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><span class="label">Nombre:</span> ${data.fullName}</p>
              <p><span class="label">Email:</span> ${data.email}</p>
              <p><span class="label">Teléfono:</span> ${data.phone}</p>
              <p><span class="label">Empresa:</span> ${data.company || 'No especificada'}</p>
              <p><span class="label">Profesión:</span> ${data.profession}</p>
              <p><span class="label">Experiencia:</span> ${data.experience || 'No especificada'}</p>
              <p><span class="label">Motivación:</span> ${data.motivation || 'No especificada'}</p>
            </div>
          </div>
          <div class="footer">
            <p>Capittal - Programa de Colaboradores</p>
          </div>
        `
      };

    case 'newsletter':
      return {
        subject: `📧 Nueva Suscripción Newsletter - ${data.email}`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>📧 Nueva Suscripción Newsletter</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><span class="label">Email:</span> ${data.email}</p>
              <p><span class="label">Fecha:</span> ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
          <div class="footer">
            <p>Capittal - Newsletter</p>
          </div>
        `
      };

    case 'calendar':
      return {
        subject: `📅 Nueva Reserva de Reunión - ${data.clientName}`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>📅 Nueva Reserva de Reunión</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><span class="label">Cliente:</span> ${data.clientName}</p>
              <p><span class="label">Email:</span> ${data.clientEmail}</p>
              <p><span class="label">Teléfono:</span> ${data.clientPhone || 'No especificado'}</p>
              <p><span class="label">Empresa:</span> ${data.companyName || 'No especificada'}</p>
              <p><span class="label">Fecha:</span> ${data.bookingDate}</p>
              <p><span class="label">Hora:</span> ${data.bookingTime}</p>
              <p><span class="label">Tipo de reunión:</span> ${data.meetingType}</p>
              <p><span class="label">Formato:</span> ${data.meetingFormat}</p>
              <p><span class="label">Notas:</span> ${data.notes || 'Sin notas'}</p>
            </div>
          </div>
          <div class="footer">
            <p>Capittal - Sistema de Reservas</p>
          </div>
        `
      };

    default:
      return {
        subject: `📝 Nueva Submission - ${formType}`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>📝 Nueva Submission</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p><span class="label">Tipo:</span> ${formType}</p>
              <p><span class="label">Email:</span> ${data.email}</p>
              <p><span class="label">Datos:</span> ${JSON.stringify(data, null, 2)}</p>
            </div>
          </div>
          <div class="footer">
            <p>Capittal - Sistema de Formularios</p>
          </div>
        `
      };
  }
};

// Helper para respetar rate limit de Resend (2 emails/segundo)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const { submissionId, formType, email, fullName, formData }: FormNotificationRequest = await req.json();

    console.log(`Processing form notification: ${formType} - ${email}`);

    // Obtener plantillas para administradores y usuario
    const adminTemplate = getEmailTemplate(formType, { 
      email, 
      fullName, 
      ...formData 
    });

    const userTemplate = getUserConfirmationTemplate(formType, {
      email,
      fullName,
      ...formData
    });

    // Enviar emails a administradores con delay para respetar rate limit
    console.log(`Enviando ${ADMIN_EMAILS.length} emails a administradores con delays...`);
    const adminEmailResults = [];
    
    for (const adminEmail of ADMIN_EMAILS) {
      try {
        const result = await resend.emails.send({
          from: "Capittal Forms <s.navarro@capittal.es>",
          to: [adminEmail],
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        });
        adminEmailResults.push({ status: 'fulfilled', value: result });
        console.log(`✅ Email enviado a ${adminEmail}`);
      } catch (error) {
        adminEmailResults.push({ status: 'rejected', reason: error });
        console.error(`❌ Error enviando a ${adminEmail}:`, error);
      }
      
      // Delay de 500ms entre emails (respeta límite de 2 req/segundo)
      await delay(500);
    }

    // Enviar email de confirmación al usuario
    console.log(`Enviando email de confirmación a ${email}...`);
    let userResult;
    try {
      const result = await resend.emails.send({
        from: "Capittal <s.navarro@capittal.es>",
        to: [email],
        subject: userTemplate.subject,
        html: userTemplate.html,
      });
      userResult = { status: 'fulfilled', value: result };
      console.log(`✅ Email de confirmación enviado a ${email}`);
    } catch (error) {
      userResult = { status: 'rejected', reason: error };
      console.error(`❌ Error enviando confirmación a ${email}:`, error);
    }

    const allAdminSuccessful = adminEmailResults.every(result => result.status === 'fulfilled');
    const userEmailSuccessful = userResult.status === 'fulfilled';
    
    const firstAdminSuccess = adminEmailResults.find(result => result.status === 'fulfilled');

    // Actualizar estado en base de datos
    if (allAdminSuccessful || userEmailSuccessful) {
      await supabase
        .from('form_submissions')
        .update({
          email_sent: allAdminSuccessful,
          email_sent_at: new Date().toISOString(),
          email_message_id: firstAdminSuccess?.status === 'fulfilled' ? firstAdminSuccess.value.data?.id : null
        })
        .eq('id', submissionId);
    }

    // Logging detallado
    if (allAdminSuccessful) {
      console.log(`Admin notification emails sent successfully for submission ${submissionId}`);
    } else {
      console.error(`Some admin emails failed for submission ${submissionId}:`, adminEmailResults);
    }

    if (userEmailSuccessful) {
      console.log(`User confirmation email sent successfully to ${email} for submission ${submissionId}`);
    } else {
      console.error(`User confirmation email failed for ${email}:`, userResult.status === 'rejected' ? userResult.reason : 'Unknown error');
    }

    return new Response(
      JSON.stringify({ 
        success: allAdminSuccessful && userEmailSuccessful,
        adminEmailsSuccess: allAdminSuccessful,
        userEmailSuccess: userEmailSuccessful,
        adminResults: adminEmailResults.map(r => r.status === 'fulfilled' ? r.value : r.reason),
        userResult: userResult.status === 'fulfilled' ? userResult.value : userResult.reason
      }), 
      {
        status: (allAdminSuccessful && userEmailSuccessful) ? 200 : 207,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-form-notifications function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
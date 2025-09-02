import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

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

const ADMIN_EMAILS = ['info@capittal.es', 'lluis@capittal.es', 'samuel@capittal.es'];

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
              <p><span class="label">Teléfono:</span> ${data.phone || 'No especificado'}</p>
              <p><span class="label">Operación de interés:</span> ${data.company_name}</p>
              <p><span class="label">ID de operación:</span> ${data.operation_id}</p>
              <p><span class="label">Mensaje:</span> ${data.message}</p>
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

    const template = getEmailTemplate(formType, { 
      email, 
      fullName, 
      ...formData 
    });

    const emailPromises = ADMIN_EMAILS.map(async (adminEmail) => {
      return resend.emails.send({
        from: "Capittal Forms <noreply@capittal.es>",
        to: [adminEmail],
        subject: template.subject,
        html: template.html,
      });
    });

    const emailResults = await Promise.allSettled(emailPromises);
    
    const allSuccessful = emailResults.every(result => result.status === 'fulfilled');
    const firstSuccess = emailResults.find(result => result.status === 'fulfilled');

    if (allSuccessful) {
      await supabase
        .from('form_submissions')
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          email_message_id: firstSuccess?.status === 'fulfilled' ? firstSuccess.value.data?.id : null
        })
        .eq('id', submissionId);

      console.log(`Notification emails sent successfully for submission ${submissionId}`);
    } else {
      console.error("Some emails failed to send:", emailResults);
    }

    return new Response(
      JSON.stringify({ 
        success: allSuccessful,
        results: emailResults.map(r => r.status === 'fulfilled' ? r.value : r.reason)
      }), 
      {
        status: allSuccessful ? 200 : 207,
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
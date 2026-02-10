import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName?: string;
  bookingDate: string;
  bookingTime: string;
  meetingType: string;
  notes?: string;
  leadId?: string;
}

// Team recipients for CC
const recipientsEnv = Deno.env.get('INTERNAL_NOTIFICATION_EMAILS');
const TEAM_RECIPIENTS: string[] = recipientsEnv
  ? recipientsEnv.split(',').map(e => e.trim()).filter(Boolean)
  : [];

const handler = async (req: Request): Promise<Response> => {
  console.log("[send-booking-notification] Function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const data: BookingNotificationRequest = await req.json();
    console.log("[send-booking-notification] Booking data received:", {
      bookingId: data.bookingId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime
    });

    const {
      bookingId,
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      bookingDate,
      bookingTime,
      meetingType,
      notes,
      leadId
    } = data;

    // Format the booking datetime
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const formattedDate = bookingDateTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = bookingDateTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Email content for the client (lead)
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background-color: #0f172a; padding: 24px; text-align: center;">
            <img src="https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/public-assets/logotipo-white.svg" alt="Capittal" style="height: 32px;" />
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 64px; height: 64px; background-color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✓</span>
              </div>
            </div>
            
            <h1 style="color: #0f172a; font-size: 24px; text-align: center; margin-bottom: 8px;">
              ¡Tu llamada está confirmada!
            </h1>
            <p style="color: #64748b; text-align: center; margin-bottom: 32px;">
              Hola ${clientName}, hemos reservado tu llamada con el equipo de Capittal.
            </p>
            
            <!-- Booking Details Card -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">📅 Fecha</span>
                    <p style="color: #0f172a; font-weight: 600; margin: 4px 0 0 0; text-transform: capitalize;">${formattedDate}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">🕐 Hora</span>
                    <p style="color: #0f172a; font-weight: 600; margin: 4px 0 0 0;">${formattedTime} (Europe/Madrid)</p>
                  </td>
                </tr>
                ${clientPhone ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px;">📞 Te llamaremos al</span>
                    <p style="color: #0f172a; font-weight: 600; margin: 4px 0 0 0;">${clientPhone}</p>
                  </td>
                </tr>
                ` : ''}
                ${companyName ? `
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #64748b; font-size: 14px;">🏢 Empresa</span>
                    <p style="color: #0f172a; font-weight: 600; margin: 4px 0 0 0;">${companyName}</p>
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- What to expect -->
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">
                ¿Qué puedes esperar?
              </p>
              <ul style="color: #1e3a8a; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li>Un asesor de Capittal te llamará a la hora acordada</li>
                <li>La llamada durará aproximadamente 30 minutos</li>
                <li>Hablaremos sobre tu empresa y tus objetivos</li>
              </ul>
            </div>
            
            <!-- Contact info -->
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              ¿Necesitas cambiar la cita? Responde a este email y te ayudaremos.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Capittal. Todos los derechos reservados.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
              <a href="https://capittal.es" style="color: #64748b;">capittal.es</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // CC recipients - filter out the client email to avoid duplicate
    const ccRecipients = TEAM_RECIPIENTS.filter(
      email => email.toLowerCase() !== clientEmail.toLowerCase()
    );

    console.log("[send-booking-notification] Sending email to client:", clientEmail);
    console.log("[send-booking-notification] CC recipients:", ccRecipients.length);

    // Send confirmation email to client with team in CC
    const emailResponse = await resend.emails.send({
      from: "Capittal <citas@capittal.es>",
      to: [clientEmail],
      cc: ccRecipients,
      subject: `✅ Tu llamada con Capittal - ${formattedDate} a las ${formattedTime}`,
      html: clientEmailHtml,
      reply_to: "info@capittal.es"
    });

    console.log("[send-booking-notification] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId,
        emailResponse,
        sentTo: clientEmail,
        ccRecipients: ccRecipients.length
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("[send-booking-notification] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to send booking notification"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);

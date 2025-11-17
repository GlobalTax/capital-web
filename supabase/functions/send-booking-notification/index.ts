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
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Booking notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const data: BookingNotificationRequest = await req.json();
    console.log("Booking data received:", data);

    const {
      bookingId,
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      bookingDate,
      bookingTime,
      meetingType,
      notes
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

    // Recipients for internal notification - actualizados post-migración Exchange
    const recipients = [
      "samuel@capittal.es",
      "pau@capittal.es",
      "marcc@capittal.es",
      "marc@capittal.es", 
      "lluis@capittal.es",
      "l.linares@nrro.es"
    ];

    // Email content for internal team
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          🗓️ Nueva Reserva de Cita
        </h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0f172a; margin-top: 0;">Detalles de la Reserva</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">ID de Reserva:</td>
              <td style="padding: 8px 0; color: #0f172a;">${bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Cliente:</td>
              <td style="padding: 8px 0; color: #0f172a;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
              <td style="padding: 8px 0; color: #0f172a;">${clientEmail}</td>
            </tr>
            ${clientPhone ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Teléfono:</td>
              <td style="padding: 8px 0; color: #0f172a;">${clientPhone}</td>
            </tr>
            ` : ''}
            ${companyName ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Empresa:</td>
              <td style="padding: 8px 0; color: #0f172a;">${companyName}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Fecha:</td>
              <td style="padding: 8px 0; color: #0f172a;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Hora:</td>
              <td style="padding: 8px 0; color: #0f172a;">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Tipo de Reunión:</td>
              <td style="padding: 8px 0; color: #0f172a;">${meetingType === 'consultation' ? 'Consulta' : meetingType === 'valuation_review' ? 'Revisión de Valoración' : 'Negociación'}</td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569; vertical-align: top;">Notas:</td>
              <td style="padding: 8px 0; color: #0f172a;">${notes}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="background-color: #3b82f6; color: white; padding: 15px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            Esta reserva se ha creado automáticamente a través de la calculadora de valoración.
          </p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>Próximos pasos:</strong><br>
            1. Confirmar la cita con el cliente<br>
            2. Preparar la documentación necesaria<br>
            3. Enviar recordatorio 24h antes
          </p>
        </div>
      </div>
    `;

    // Send notification email to internal team
    const emailResponse = await resend.emails.send({
      from: "Capittal <s.navarro@capittal.es>",
      to: recipients,
      subject: `🗓️ Nueva Cita Reservada - ${clientName} (${formattedDate} ${formattedTime})`,
      html: emailHtml,
    });

    console.log("Booking notification sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId,
        emailResponse 
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
    console.error("Error in send-booking-notification function:", error);
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
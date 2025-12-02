import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValuationEmailRequest {
  recipientEmail: string;
  recipientName: string;
  valuationData: {
    clientCompany: string;
    valuationCentral: number;
    valuationLow: number;
    valuationHigh: number;
    sector: string;
    normalizedEbitda?: number;
    ebitdaMultipleUsed?: number;
  };
  pdfUrl?: string;
  advisorName?: string;
  advisorEmail?: string;
  customSubject?: string;
  customMessage?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const generateEmailHtml = (data: ValuationEmailRequest): string => {
  const { recipientName, valuationData, pdfUrl, advisorName, customMessage } = data;
  
  const greeting = recipientName ? `Estimado/a ${recipientName}` : 'Estimado/a cliente';
  const advisor = advisorName || 'El equipo de Capittal';
  
  const personalMessage = customMessage || `
    Nos complace hacerle llegar el informe de valoración de ${valuationData.clientCompany} que hemos preparado para usted.
    Este documento contiene un análisis detallado basado en la información financiera proporcionada y los múltiplos de mercado aplicables a su sector.
  `;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Valoración - ${valuationData.clientCompany}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 3px solid #1a1a1a;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1a1a1a; letter-spacing: -1px;">Capittal</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 2px;">Asesores en M&A</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <p style="margin: 0; font-size: 18px; color: #1a1a1a; font-weight: 600;">${greeting},</p>
            </td>
          </tr>
          
          <!-- Custom Message -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #444;">${personalMessage}</p>
            </td>
          </tr>
          
          <!-- Valuation Summary Box -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); border-radius: 8px;">
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Empresa valorada</p>
                    <p style="margin: 0 0 20px; font-size: 20px; font-weight: 700; color: #fff;">${valuationData.clientCompany}</p>
                    
                    <p style="margin: 0 0 8px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Rango de valoración estimado</p>
                    <p style="margin: 0; font-size: 28px; font-weight: 700; color: #fff;">
                      ${formatCurrency(valuationData.valuationLow)} - ${formatCurrency(valuationData.valuationHigh)}
                    </p>
                    <p style="margin: 8px 0 0; font-size: 14px; color: #ccc;">
                      Valor central: <strong style="color: #fff;">${formatCurrency(valuationData.valuationCentral)}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <span style="font-size: 14px; color: #666;">Sector</span>
                    <span style="float: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${valuationData.sector}</span>
                  </td>
                </tr>
                ${valuationData.normalizedEbitda ? `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <span style="font-size: 14px; color: #666;">EBITDA Normalizado</span>
                    <span style="float: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${formatCurrency(valuationData.normalizedEbitda)}</span>
                  </td>
                </tr>
                ` : ''}
                ${valuationData.ebitdaMultipleUsed ? `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <span style="font-size: 14px; color: #666;">Múltiplo EBITDA aplicado</span>
                    <span style="float: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${valuationData.ebitdaMultipleUsed.toFixed(1)}x</span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          ${pdfUrl ? `
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${pdfUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 6px; letter-spacing: 0.5px;">
                      Descargar Informe Completo (PDF)
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0 0 15px; font-size: 15px; line-height: 1.7; color: #444;">
                Quedamos a su disposición para comentar el informe en detalle y resolver cualquier duda que pueda tener.
                No dude en contactarnos para agendar una reunión de presentación de resultados.
              </p>
            </td>
          </tr>
          
          <!-- Signature -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0; font-size: 15px; color: #444;">
                Un cordial saludo,<br><br>
                <strong style="color: #1a1a1a;">${advisor}</strong><br>
                <span style="color: #666;">Capittal - Asesores en M&A</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 10px; font-size: 13px; color: #666;">
                      <strong>Capittal</strong> | Expertos en valoración y venta de empresas
                    </p>
                    <p style="margin: 0 0 10px; font-size: 12px; color: #999;">
                      Tel: +34 900 000 000 | info@capittal.es | www.capittal.es
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #bbb;">
                      Este correo y su contenido son confidenciales y están destinados únicamente al destinatario indicado.
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
</html>
  `.trim();
};

const handler = async (req: Request): Promise<Response> => {
  console.log('[send-professional-valuation-email] Request received');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ValuationEmailRequest = await req.json();
    console.log('[send-professional-valuation-email] Request data:', {
      recipientEmail: requestData.recipientEmail,
      clientCompany: requestData.valuationData?.clientCompany,
      hasPdfUrl: !!requestData.pdfUrl,
    });

    // Validate required fields
    if (!requestData.recipientEmail) {
      console.error('[send-professional-valuation-email] Missing recipient email');
      return new Response(
        JSON.stringify({ error: 'El email del destinatario es requerido' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!requestData.valuationData?.clientCompany) {
      console.error('[send-professional-valuation-email] Missing client company');
      return new Response(
        JSON.stringify({ error: 'El nombre de la empresa es requerido' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate email HTML
    const emailHtml = generateEmailHtml(requestData);
    const subject = requestData.customSubject || 
      `Informe de Valoración - ${requestData.valuationData.clientCompany}`;

    console.log('[send-professional-valuation-email] Sending email to:', requestData.recipientEmail);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Capittal <valoraciones@capittal.es>",
      to: [requestData.recipientEmail],
      subject: subject,
      html: emailHtml,
      reply_to: requestData.advisorEmail || "info@capittal.es",
    });

    console.log('[send-professional-valuation-email] Email sent successfully:', emailResponse);

    // Send copy to internal team (optional)
    try {
      await resend.emails.send({
        from: "Capittal <valoraciones@capittal.es>",
        to: ["valoraciones@capittal.es"],
        subject: `[COPIA] ${subject}`,
        html: `
          <p><strong>Copia del email enviado a:</strong> ${requestData.recipientEmail}</p>
          <p><strong>Enviado por:</strong> ${requestData.advisorName || 'Sistema'}</p>
          <hr>
          ${emailHtml}
        `,
      });
      console.log('[send-professional-valuation-email] Internal copy sent');
    } catch (copyError) {
      console.warn('[send-professional-valuation-email] Failed to send internal copy:', copyError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        sentTo: requestData.recipientEmail 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('[send-professional-valuation-email] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al enviar el email' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

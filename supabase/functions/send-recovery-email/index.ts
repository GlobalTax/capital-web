import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryEmailRequest {
  valuationId: string;
  token: string;
  email: string;
  contactName: string;
  companyName: string;
  step: number;
  completion: number;
}

function getClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

function generateRecoveryHTML(data: RecoveryEmailRequest): string {
  const recoveryUrl = `https://fwhqtzkkvnjkazhaficj.supabase.co/lp/calculadora?token=${data.token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Continúa tu valoración - Capittal</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin: 0;">¡No pierdas tu valoración!</h1>
        </div>
        
        <div style="margin-bottom: 30px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hola ${data.contactName},
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Notamos que comenzaste el proceso de valoración para <strong>${data.companyName}</strong> 
            pero no pudiste completarlo. Has completado el <strong>${data.completion}%</strong> del proceso.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            No te preocupes, hemos guardado toda tu información. Puedes continuar exactamente donde lo dejaste:
          </p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${recoveryUrl}" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Continuar Valoración
          </a>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">Estado de tu valoración:</h3>
          <div style="color: #374151;">
            <p style="margin: 5px 0;"><strong>Empresa:</strong> ${data.companyName}</p>
            <p style="margin: 5px 0;"><strong>Progreso:</strong> ${data.completion}% completado</p>
            <p style="margin: 5px 0;"><strong>Paso actual:</strong> ${data.step} de 4</p>
          </div>
        </div>
        
        <div style="margin-top: 40px; color: #6b7280; font-size: 14px;">
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          <p style="margin-top: 20px;">
            Saludos cordiales,<br>
            <strong>Equipo Capittal</strong><br>
            Carrer Ausias March número 36 principal<br>
            P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getClient();
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const body = (await req.json()) as RecoveryEmailRequest;
    
    if (!body.email || !body.token || !body.contactName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate recovery email content
    const emailHTML = generateRecoveryHTML(body);
    
    // Send recovery email via Resend
    const emailResponse = await resend.emails.send({
      from: "Capittal <noreply@capittal.es>",
      to: [body.email],
      subject: `Continúa tu valoración de ${body.companyName} - Capittal`,
      html: emailHTML,
    });

    if (emailResponse.error) {
      console.error("Error sending recovery email:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: "Failed to send recovery email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Recovery email sent successfully to ${body.email} for valuation ${body.valuationId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Recovery email sent successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("send-recovery-email fatal error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
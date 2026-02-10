import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[${requestId}] Test email config started`);
  
  try {
    const { recipientEmail } = await req.json();
    
    // 1. Verificar que la API key existe
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error(`[${requestId}] RESEND_API_KEY not configured`);
      return new Response(JSON.stringify({
        success: false,
        step: "api_key_check",
        error: "RESEND_API_KEY no está configurada"
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      });
    }

    console.log(`[${requestId}] API key configured`);

    // 2. Inicializar Resend
    const resend = new Resend(apiKey);

    // 3. Enviar email de prueba
    const testEmail = recipientEmail || "samuel@capittal.es";
    console.log(`[${requestId}] Sending test email`);

    const emailResponse = await resend.emails.send({
      from: "Capittal Test <samuel@capittal.es>",
      to: [testEmail],
      subject: `🧪 Test Email Config - ${new Date().toLocaleString('es-ES')}`,
      html: `
        <div style="font-family: 'Manrope', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #0f172a; margin-bottom: 20px;">✅ Configuración de Email Verificada</h2>
          <p style="color: #64748b; font-size: 16px;">Este es un email de prueba enviado desde Capittal.</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <ul style="list-style: none; padding: 0; margin: 0; color: #334155;">
              <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Request ID:</strong> ${requestId}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              <li style="padding: 8px 0;"><strong>Proveedor:</strong> Resend</li>
            </ul>
          </div>
          <p style="color: #22c55e; font-weight: 600;">Si recibes este email, la configuración es correcta.</p>
        </div>
      `,
    });

    console.log(`[${requestId}] Resend response:`, JSON.stringify(emailResponse));

    // 4. Verificar respuesta
    if (emailResponse.error) {
      console.error(`[${requestId}] Resend error:`, emailResponse.error);
      return new Response(JSON.stringify({
        success: false,
        step: "send_email",
        error: emailResponse.error.message,
        details: emailResponse.error
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      });
    }

    console.log(`[${requestId}] Email sent successfully, ID: ${emailResponse.data?.id}`);

    return new Response(JSON.stringify({
      success: true,
      messageId: emailResponse.data?.id,
      recipient: testEmail,
      requestId,
      message: "Email de prueba enviado correctamente"
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error: any) {
    console.error(`[${requestId}] Exception:`, error.message);
    return new Response(JSON.stringify({
      success: false,
      step: "exception",
      error: error.message
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status: 500 
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false, step: "api_key_check",
        error: "RESEND_API_KEY no está configurada"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }

    // Obtener destinatarios CC y BCC de la tabla
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: recipients } = await supabase
      .from("email_recipients_config")
      .select("email, name, is_bcc")
      .eq("is_active", true)
      .eq("is_default_copy", true);

    const ccRecipients = (recipients || []).filter(r => !r.is_bcc).map(r => r.email);
    const bccRecipients = (recipients || []).filter(r => r.is_bcc).map(r => r.email);

    const testEmail = recipientEmail || "samuel@capittal.es";
    
    // Filtrar el destinatario principal de CC/BCC para evitar duplicados
    const filteredCc = ccRecipients.filter(e => e !== testEmail);
    const filteredBcc = bccRecipients.filter(e => e !== testEmail);

    console.log(`[${requestId}] To: ${testEmail}, CC: ${filteredCc.join(', ')}, BCC: ${filteredBcc.join(', ')}`);

    const resend = new Resend(apiKey);

    const ccListHtml = filteredCc.length > 0 
      ? filteredCc.map(e => `<li>${e}</li>`).join('') 
      : '<li style="color:#94a3b8;">Ninguno</li>';
    const bccListHtml = filteredBcc.length > 0 
      ? filteredBcc.map(e => `<li>${e}</li>`).join('') 
      : '<li style="color:#94a3b8;">Ninguno</li>';

    const emailPayload: any = {
      from: "Capittal Test <samuel@capittal.es>",
      to: [testEmail],
      subject: `🧪 Test CC/BCC - ${new Date().toLocaleString('es-ES')}`,
      html: `
        <div style="font-family: 'Manrope', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #0f172a;">✅ Test de CC y BCC</h2>
          <p style="color: #64748b;">Email de prueba para verificar la configuración de Copia y Copia Oculta.</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Destinatario principal:</strong> ${testEmail}</p>
            <h3 style="margin-top:16px;">📋 CC (Copia visible):</h3>
            <ul>${ccListHtml}</ul>
            <h3>🔒 BCC (Copia oculta):</h3>
            <ul>${bccListHtml}</ul>
          </div>
          <p style="color: #22c55e; font-weight: 600;">Si recibes este email, la configuración funciona correctamente.</p>
        </div>
      `,
    };

    if (filteredCc.length > 0) emailPayload.cc = filteredCc;
    if (filteredBcc.length > 0) emailPayload.bcc = filteredBcc;

    const emailResponse = await resend.emails.send(emailPayload);

    console.log(`[${requestId}] Resend response:`, JSON.stringify(emailResponse));

    if (emailResponse.error) {
      return new Response(JSON.stringify({
        success: false, step: "send_email",
        error: emailResponse.error.message
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: emailResponse.data?.id,
      recipient: testEmail,
      cc: filteredCc,
      bcc: filteredBcc,
      requestId,
      message: "Email de prueba enviado con CC y BCC"
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error(`[${requestId}] Exception:`, error.message);
    return new Response(JSON.stringify({
      success: false, step: "exception", error: error.message
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

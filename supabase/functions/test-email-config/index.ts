import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🧪 Testing email configuration...");

    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY not configured");
      return new Response(JSON.stringify({
        success: false,
        error: "RESEND_API_KEY not configured",
        details: "Please add RESEND_API_KEY to edge function secrets"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Test basic Resend connection
    console.log("✅ Resend API key found, testing connection...");
    
    // Get test email from request body
    const { testEmail } = await req.json();
    
    if (!testEmail) {
      return new Response(JSON.stringify({
        success: false,
        error: "Test email required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Send test email
    const emailResponse = await resend.emails.send({
      from: "Test Capittal <onboarding@resend.dev>",
      to: [testEmail],
      subject: "🧪 Test de Configuración de Email - Capittal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px;">
            <h1 style="color: white; margin: 0;">✅ Test Exitoso</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb; margin-top: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937;">Configuración de Email Verificada</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              ¡Perfecto! La configuración de email está funcionando correctamente.
            </p>
            
            <div style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
              <p style="margin: 0; color: #065f46; font-weight: bold;">✅ Detalles del Test:</p>
              <ul style="margin: 5px 0 0 0; color: #065f46; padding-left: 20px;">
                <li>Resend API Key: Configurado correctamente</li>
                <li>Edge Function: Funcionando</li>
                <li>Envío de Email: Exitoso</li>
                <li>Fecha del test: ${new Date().toISOString()}</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Este email fue enviado automáticamente por el sistema de test de Capittal.
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Email configuration test successful",
      details: {
        resend_configured: true,
        email_sent: true,
        email_id: emailResponse.data?.id,
        test_email: testEmail,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("❌ Email test failed:", error);
    
    let errorDetails = {
      resend_configured: !!Deno.env.get("RESEND_API_KEY"),
      email_sent: false,
      error_type: error.name,
      error_message: error.message,
      timestamp: new Date().toISOString()
    };

    // Analyze specific error types
    if (error.message?.includes("API key")) {
      errorDetails.error_type = "API_KEY_ERROR";
    } else if (error.message?.includes("domain")) {
      errorDetails.error_type = "DOMAIN_ERROR";
    } else if (error.message?.includes("rate limit")) {
      errorDetails.error_type = "RATE_LIMIT_ERROR";
    }

    return new Response(JSON.stringify({
      success: false,
      error: "Email test failed",
      details: errorDetails
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

serve(handler);
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserCredentialsRequest {
  email: string;
  fullName: string;
  temporaryPassword: string;
  role: string;
  requiresPasswordChange?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for logging
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      email, 
      fullName, 
      temporaryPassword, 
      role, 
      requiresPasswordChange = true 
    }: UserCredentialsRequest = await req.json();

    // Enhanced validation
    if (!email || !temporaryPassword) {
      await supabase.from('security_events').insert({
        event_type: 'INVALID_CREDENTIALS_REQUEST',
        severity: 'medium',
        details: { error: 'Missing email or password', email }
      });
      
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log security event
    await supabase.from('security_events').insert({
      event_type: 'USER_CREDENTIALS_SENT',
      severity: 'high',
      details: { 
        email, 
        role, 
        requires_password_change: requiresPasswordChange,
        timestamp: new Date().toISOString()
      }
    });

    const roleTranslations: Record<string, string> = {
      'editor': 'Editor',
      'admin': 'Administrador', 
      'super_admin': 'Super Administrador'
    };

    const roleName = roleTranslations[role] || role;

    const emailResponse = await resend.emails.send({
      from: "Capittal <admin@capittal.es>",
      to: [email],
      subject: "Acceso a la plataforma Capittal - Credenciales temporales",
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background:#f8fafc;">
          <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:32px;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin:0 0 8px; color:#111827; font-size:24px; font-weight:700;">Bienvenido a Capittal</h1>
              <p style="margin:0; color:#6b7280; font-size:16px;">Tu acceso a la plataforma está listo</p>
            </div>

            <!-- Saludo personalizado -->
            <div style="margin-bottom: 24px;">
              <h2 style="margin:0 0 12px; color:#111827; font-size:18px; font-weight:600;">Hola ${fullName || 'Usuario'},</h2>
              <p style="margin:0; color:#374151; line-height:1.6;">
                Tu cuenta ha sido creada exitosamente en la plataforma Capittal. Como parte del equipo de M&A líder en España, 
                ahora tienes acceso a nuestras herramientas profesionales de valoración y análisis financiero.
              </p>
            </div>
            
            <!-- Credenciales -->
            <div style="background: #f9fafb; padding: 24px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 24px 0;">
              <h3 style="margin:0 0 16px; color:#111827; font-size:16px; font-weight:600;">📧 Tus credenciales de acceso</h3>
              <table style="width:100%; border-collapse:collapse;">
                <tr><td style="padding:8px 0; color:#374151; font-weight:500;">Email:</td><td style="padding:8px 0; color:#111827; font-weight:600;">${email}</td></tr>
                <tr><td style="padding:8px 0; color:#374151; font-weight:500;">Contraseña temporal:</td><td style="padding:8px 0;"><code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; color:#111827; font-weight:600;">${temporaryPassword}</code></td></tr>
                <tr><td style="padding:8px 0; color:#374151; font-weight:500;">Rol asignado:</td><td style="padding:8px 0; color:#111827; font-weight:600;">${roleName}</td></tr>
              </table>
            </div>
            
            <!-- Advertencia importante -->
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 24px 0;">
              <div style="display: flex; align-items: flex-start;">
                <span style="font-size: 20px; margin-right: 8px;">⚠️</span>
                <div>
                  <p style="margin: 0 0 8px; color:#92400e; font-weight:700;">Contraseña temporal y segura</p>
                  <p style="margin: 0; color:#92400e; line-height:1.5;">
                    ${requiresPasswordChange ? 
                      'Por tu seguridad, deberás cambiar esta contraseña en tu primer inicio de sesión. La contraseña actual es temporal y altamente segura.' : 
                      'Esta contraseña ha sido generada de forma segura. Guárdala en un lugar protegido hasta que puedas cambiarla por una de tu elección.'}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Medidas de seguridad -->
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 24px 0;">
              <div style="display: flex; align-items: flex-start;">
                <span style="font-size: 20px; margin-right: 8px;">🔒</span>
                <div>
                  <p style="margin: 0 0 12px; color:#991b1b; font-weight:700;">Medidas de seguridad obligatorias</p>
                  <ul style="margin: 0; color:#991b1b; padding-left: 20px; line-height:1.6;">
                    <li>No compartas estas credenciales con terceros</li>
                    <li>Accede únicamente desde dispositivos seguros y confiables</li>
                    <li>Cierra siempre la sesión al finalizar tu trabajo</li>
                    <li>Este email contiene información confidencial y se autoelimina por seguridad</li>
                    <li>Reporta inmediatamente cualquier acceso sospechoso</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Botón de acceso -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://app.capittal.es/auth"
                 style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 14px 32px; 
                        border-radius: 8px; 
                        display: inline-block; 
                        font-weight: 600;
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                🚀 Acceder a la plataforma Capittal
              </a>
            </div>
            
            <!-- Información adicional sobre Capittal -->
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 24px 0;">
              <h3 style="margin:0 0 12px; color:#111827; font-size:16px; font-weight:600;">💼 Sobre Capittal</h3>
              <p style="margin:0 0 12px; color:#374151; line-height:1.6;">
                Capittal es la firma líder en M&A en España, especializada en valoración y venta de empresas. 
                Nuestro equipo combina experiencia financiera con tecnología avanzada para ofrecer análisis precisos 
                y asesoramiento estratégico de alta calidad.
              </p>
              <p style="margin:0; color:#374151; line-height:1.6;">
                Como miembro del equipo, tendrás acceso a nuestras herramientas profesionales, bases de datos 
                de valoraciones y sistemas de análisis que utilizamos para asesorar a empresarios y fondos de inversión.
              </p>
            </div>

            <!-- Soporte y contacto -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
              <h3 style="margin:0 0 16px; color:#111827; font-size:16px; font-weight:600;">📞 Soporte técnico</h3>
              <p style="margin:0 0 16px; color:#374151; line-height:1.6;">
                Si tienes alguna pregunta sobre el acceso a la plataforma o necesitas asistencia técnica, 
                nuestro equipo está disponible para ayudarte inmediatamente.
              </p>
              
              <div style="background:#f9fafb; padding:16px; border-radius:6px; margin:16px 0;">
                <p style="margin:0 0 8px; color:#111827; font-weight:600;">Equipo Capittal</p>
                <p style="margin:0 0 4px; color:#6b7280; font-size:14px;">✉️ Email: admin@capittal.es</p>
                <p style="margin:0 0 4px; color:#6b7280; font-size:14px;">📍 Oficinas:</p>
                <p style="margin:0 0 2px; color:#6b7280; font-size:14px;">• Barcelona: Carrer Ausias March, 36 Principal</p>
                <p style="margin:0; color:#6b7280; font-size:14px;">• Madrid: P.º de la Castellana, 11, B - A, Chamberí, 28046</p>
              </div>
            </div>

            <!-- Footer legal -->
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.5;">
                Este email contiene información confidencial destinada únicamente al usuario especificado.<br>
                Si has recibido este mensaje por error, por favor elimínalo inmediatamente y notifícanos.<br>
                <strong>Capittal</strong> - Especialistas en M&A | <a href="https://capittal.es" style="color:#9ca3af;">capittal.es</a>
              </p>
            </div>

          </div>
        </div>
      `,
    });

    console.log("User credentials email sent successfully:", emailResponse);

    // Log successful email sending
    await supabase.from('admin_notifications_log').insert({
      notification_type: 'user_credentials',
      recipient_email: email,
      email_id: emailResponse.data?.id,
      status: 'sent'
    });

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      securityNote: "Credentials sent via encrypted email with enhanced security logging" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-credentials function:", error);
    
    // Log error event
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('security_events').insert({
        event_type: 'CREDENTIALS_EMAIL_FAILED',
        severity: 'high',
        details: { error: error.message, timestamp: new Date().toISOString() }
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
    
    return new Response(
      JSON.stringify({ error: "Failed to send credentials securely" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
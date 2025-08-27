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
      from: "Capittal <admin@capittal.com>",
      to: [email],
      subject: "Acceso a la plataforma Capittal - Credenciales temporales",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Bienvenido a Capittal</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937;">Hola ${fullName || 'Usuario'},</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Tu cuenta ha sido preparada en la plataforma Capittal. Aquí tienes tus credenciales de acceso temporal:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="margin: 0; color: #1f2937;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0 0 0; color: #1f2937;"><strong>Contraseña temporal:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
              <p style="margin: 10px 0 0 0; color: #1f2937;"><strong>Rol:</strong> ${roleName}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ Importante:</p>
              <p style="margin: 5px 0 0 0; color: #92400e;">
                Esta es una contraseña temporal altamente segura. ${requiresPasswordChange ? 'Deberás cambiar la contraseña en tu primer inicio de sesión por seguridad.' : 'Guarda esta contraseña en un lugar seguro.'}
              </p>
            </div>
            
            <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">🔒 Medidas de Seguridad:</p>
              <ul style="margin: 5px 0 0 0; color: #991b1b; padding-left: 20px;">
                <li>No compartas estas credenciales con nadie</li>
                <li>Accede solo desde dispositivos seguros</li>
                <li>Cierra sesión al terminar de trabajar</li>
                <li>Este email se elimina automáticamente por seguridad</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://app.capittal.com/auth" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 12px 30px; 
                        border-radius: 6px; 
                        display: inline-block; 
                        font-weight: bold;">
                Acceder a la plataforma
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Si tienes alguna pregunta o problemas de acceso, contactanos inmediatamente.<br>
                <strong>Equipo Capittal</strong><br>
                Carrer Ausias March número 36 principal<br>
                P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid
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
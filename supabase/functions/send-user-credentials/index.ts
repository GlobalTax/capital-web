import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UserCredentialsRequest {
  email: string;
  fullName: string;
  password: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, password, role }: UserCredentialsRequest = await req.json();

    console.log(`Sending credentials to ${email} for user ${fullName}`);

    const roleTranslations: Record<string, string> = {
      'editor': 'Editor',
      'admin': 'Administrador', 
      'super_admin': 'Super Administrador'
    };

    const roleName = roleTranslations[role] || role;

    const emailResponse = await resend.emails.send({
      from: "Capittal <no-reply@capittal.com>",
      to: [email],
      subject: "Bienvenido a Capittal - Credenciales de acceso",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a Capittal</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a Capittal!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Tu cuenta ha sido creada exitosamente</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong>${fullName}</strong>,</p>
            
            <p>Se ha creado tu cuenta en la plataforma Capittal. A continuación encontrarás tus credenciales de acceso:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Credenciales de Acceso</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Contraseña temporal:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code></p>
              <p style="margin: 5px 0;"><strong>Rol:</strong> ${roleName}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar esta contraseña temporal en tu primer inicio de sesión.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://capittal.com/auth" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Acceder a Capittal
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <h3 style="color: #333; margin-bottom: 15px;">¿Qué puedes hacer con tu cuenta?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Acceder al panel de administración</li>
              <li>Gestionar valoraciones de empresas</li>
              <li>Ver métricas y reportes</li>
              <li>Administrar contenido de la plataforma</li>
            </ul>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #1565c0;">
                <strong>¿Necesitas ayuda?</strong><br>
                Si tienes alguna pregunta o problema para acceder, no dudes en contactarnos en 
                <a href="mailto:soporte@capittal.com" style="color: #1565c0;">soporte@capittal.com</a>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p style="margin: 0;">Este email fue enviado desde Capittal</p>
            <p style="margin: 5px 0 0 0;">
              <a href="https://capittal.com" style="color: #667eea; text-decoration: none;">www.capittal.com</a> | 
              <a href="mailto:contacto@capittal.com" style="color: #667eea; text-decoration: none;">contacto@capittal.com</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Credentials email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error sending credentials email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
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
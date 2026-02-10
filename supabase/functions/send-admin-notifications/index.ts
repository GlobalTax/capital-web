import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const defaultSenderEmail = Deno.env.get('SENDER_EMAIL') || 'admin@capittal.com';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  type: 'welcome' | 'role_changed' | 'account_deactivated' | 'account_activated' | 'password_reset';
  recipientEmail: string;
  recipientName: string;
  data?: {
    role?: string;
    changedBy?: string;
    temporaryPassword?: string;
    loginUrl?: string;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  const baseUrl = "https://capittal.com";
  const loginUrl = data?.loginUrl || `${baseUrl}/admin`;
  
  const templates = {
    welcome: {
      subject: "¡Bienvenido al Panel de Administración de Capittal!",
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">Capittal</h1>
            <p style="color: #6b7280; margin: 5px 0;">Panel de Administración</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #374151; margin-top: 0;">¡Hola ${data.recipientName}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Te damos la bienvenida al panel de administración de Capittal. Tu cuenta ha sido creada con el rol de <strong>${data.role}</strong>.
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Puedes acceder al panel utilizando tu email y la contraseña proporcionada por el administrador.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Acceder al Panel
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
            <p>Si tienes alguna pregunta, contacta con el administrador del sistema.</p>
            <p style="margin: 0;">© ${new Date().getFullYear()} Capittal. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    },
    
    role_changed: {
      subject: "Cambio de Rol en tu Cuenta de Administración",
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">Capittal</h1>
            <p style="color: #6b7280; margin: 5px 0;">Panel de Administración</p>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px;">
            <h2 style="color: #92400e; margin-top: 0;">Cambio de Rol</h2>
            <p style="color: #78350f; line-height: 1.6;">
              Hola ${data.recipientName}, tu rol en el panel de administración ha sido actualizado a <strong>${data.role}</strong> por ${data.changedBy}.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #4b5563; line-height: 1.6;">
              Este cambio afecta a los permisos y funcionalidades a las que tienes acceso. Si tienes dudas sobre tus nuevos permisos, contacta con el administrador.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Acceder al Panel
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
            <p>© ${new Date().getFullYear()} Capittal. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    },
    
    account_deactivated: {
      subject: "Tu Cuenta de Administración ha sido Desactivada",
      html: `
          <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">Capittal</h1>
            <p style="color: #6b7280; margin: 5px 0;">Panel de Administración</p>
          </div>
          
          <div style="background: #fecaca; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 30px;">
            <h2 style="color: #991b1b; margin-top: 0;">Cuenta Desactivada</h2>
            <p style="color: #7f1d1d; line-height: 1.6;">
              Hola ${data.recipientName}, tu cuenta de administración ha sido desactivada por ${data.changedBy}.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #4b5563; line-height: 1.6;">
              Ya no podrás acceder al panel de administración. Si consideras que esto es un error o necesitas reactivar tu cuenta, contacta con el administrador del sistema.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
            <p>© ${new Date().getFullYear()} Capittal. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    },
    
    account_activated: {
      subject: "Tu Cuenta de Administración ha sido Reactivada",
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin: 0;">Capittal</h1>
            <p style="color: #6b7280; margin: 5px 0;">Panel de Administración</p>
          </div>
          
          <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 30px;">
            <h2 style="color: #065f46; margin-top: 0;">Cuenta Reactivada</h2>
            <p style="color: #064e3b; line-height: 1.6;">
              ¡Buenas noticias ${data.recipientName}! Tu cuenta de administración ha sido reactivada por ${data.changedBy}.
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #4b5563; line-height: 1.6;">
              Ya puedes volver a acceder al panel de administración con tu rol de <strong>${data.role}</strong>.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Acceder al Panel
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; color: #6b7280; font-size: 14px;">
            <p>© ${new Date().getFullYear()} Capittal. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    }
  };
  
  return templates[type as keyof typeof templates] || templates.welcome;
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Admin notification request received');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const { type, recipientEmail, recipientName, data }: AdminNotificationRequest = await req.json();
    
    console.log(`Sending ${type} notification to ${recipientEmail}`);

    if (!recipientEmail || !recipientName) {
      throw new Error("recipientEmail and recipientName are required");
    }

    const template = getEmailTemplate(type, { ...data, recipientName });

    const emailResponse = await resend.emails.send({
      from: `Capittal Admin <${defaultSenderEmail}>`,
      to: [recipientEmail],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the notification in the database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('admin_notifications_log').insert({
      recipient_email: recipientEmail,
      notification_type: type,
      sent_at: new Date().toISOString(),
      email_id: emailResponse.data?.id,
      status: 'sent'
    });

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-admin-notifications function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
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
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Equipo completo que recibe notificaciones
const recipientsEnv = Deno.env.get('INTERNAL_NOTIFICATION_EMAILS');
const ADMIN_EMAILS: string[] = recipientsEnv
  ? recipientsEnv.split(',').map(e => e.trim()).filter(Boolean)
  : [];

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  ebitda_amount?: number;
  valuation_currency?: string;
}

interface BulkInquiryRequest {
  full_name: string;
  email: string;
  phone?: string;
  company_name: string;
  message?: string;
  operations: Operation[];
}

const formatCurrency = (amount: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (): string => {
  return new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  });
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BulkInquiryRequest = await req.json();
    console.log("Received bulk inquiry request:", JSON.stringify(data, null, 2));

    const { full_name, email, phone, company_name, message, operations } = data;

    // Validate required fields
    if (!full_name || !email || !company_name || !operations || operations.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into bulk_inquiries table
    const { data: insertedData, error: insertError } = await supabase
      .from("bulk_inquiries")
      .insert({
        full_name,
        email,
        phone: phone || null,
        company_name,
        message: message || null,
        operation_ids: operations.map(op => op.id),
        operation_names: operations.map(op => op.company_name),
        referrer: req.headers.get("referer") || null,
        user_agent: req.headers.get("user-agent") || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("Bulk inquiry saved to database:", insertedData?.id);

    const dateTime = formatDateTime();

    // Build operations list HTML
    const operationsListHtml = operations.map((op, index) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; font-weight: 500; color: #64748b;">${index + 1}</td>
        <td style="padding: 12px 8px;">
          <strong style="color: #0f172a;">${op.company_name}</strong>
          <br>
          <span style="color: #64748b; font-size: 13px;">${op.sector}</span>
        </td>
        <td style="padding: 12px 8px; text-align: right; color: #059669; font-weight: 600;">
          ${op.ebitda_amount ? formatCurrency(op.ebitda_amount, op.valuation_currency || 'EUR') : 'Consultar'}
        </td>
        <td style="padding: 12px 8px; text-align: center;">
          <a href="https://capittal.es/oportunidades?op=${op.id}" style="color: #2563eb; text-decoration: none; font-weight: 500;">Ver →</a>
        </td>
      </tr>
    `).join('');

    // Build professional email HTML
    const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Solicitud Conjunta de Información</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; line-height: 1.5;">
  <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">CAPITTAL</h1>
      <p style="color: #64748b; font-size: 14px; margin: 8px 0 0;">Marketplace de Operaciones</p>
    </div>

    <!-- Main Card -->
    <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); overflow: hidden;">
      
      <!-- Title Bar -->
      <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: #ffffff; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 600;">🔔 Solicitud Conjunta – ${operations.length} Operaciones</h2>
        <div style="margin-top: 12px; font-size: 13px; color: rgba(255,255,255,0.85);">
          <span>📅 ${dateTime}</span>
          <span style="margin-left: 16px;">🔗 Marketplace</span>
        </div>
      </div>

      <!-- Content -->
      <div style="padding: 24px;">
        
        <!-- Contact Data -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            👤 Datos del Solicitante
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 120px;">Nombre</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${full_name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Email</td>
              <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${email}</a></td>
            </tr>
            ${phone ? `
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Teléfono</td>
              <td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${phone}</a></td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Empresa</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${company_name}</td>
            </tr>
          </table>
        </div>

        ${message ? `
        <!-- Message -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            💬 Mensaje
          </h3>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${message}</p>
          </div>
        </div>
        ` : ''}

        <!-- Operations Table -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            🏢 Operaciones Solicitadas (${operations.length})
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px 8px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">#</th>
                <th style="padding: 12px 8px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Operación</th>
                <th style="padding: 12px 8px; text-align: right; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">EBITDA</th>
                <th style="padding: 12px 8px; text-align: center; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Enlace</th>
              </tr>
            </thead>
            <tbody>
              ${operationsListHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- CTA -->
      <div style="padding: 0 24px 24px; text-align: center;">
        <a href="https://capittal.es/admin/crm" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Gestionar en CRM →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        Este email fue generado automáticamente por el marketplace de Capittal.
      </p>
    </div>

  </div>
</body>
</html>
    `;

    // Send email notifications
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      // Send to all admin emails with reply_to
      for (const adminEmail of ADMIN_EMAILS) {
        try {
          await resend.emails.send({
            from: "Capittal Marketplace <notificaciones@capittal.es>",
            to: [adminEmail],
            reply_to: email, // Reply-To al email del lead
            subject: `Solicitud conjunta (${operations.length} ops) – ${full_name} – Capittal`,
            html: emailHtml,
          });
          console.log(`Email sent to ${adminEmail}`);
          
          // Small delay between emails
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (emailError) {
          console.error(`Error sending to ${adminEmail}:`, emailError);
        }
      }

      // Send confirmation to user
      const userConfirmationHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; line-height: 1.5;">
  <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">CAPITTAL</h1>
    </div>

    <!-- Main Card -->
    <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 32px;">
      
      <h2 style="color: #0f172a; margin: 0 0 16px; font-size: 20px;">¡Hemos recibido tu solicitud!</h2>
      
      <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
        Hola ${full_name},<br><br>
        Hemos recibido tu solicitud de información para <strong>${operations.length} operaciones</strong>.
        Nuestro equipo revisará tu petición y te contactará en las próximas 24-48 horas.
      </p>
      
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; font-weight: 600;">Operaciones solicitadas:</p>
        <ul style="margin: 0; padding-left: 20px; color: #0f172a;">
          ${operations.map(op => `<li style="margin-bottom: 4px;">${op.company_name} <span style="color: #64748b;">(${op.sector})</span></li>`).join('')}
        </ul>
      </div>
      
      <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
        Si tienes alguna pregunta, no dudes en contactarnos en <a href="mailto:info@capittal.es" style="color: #2563eb; text-decoration: none;">info@capittal.es</a>.
      </p>
      
      <p style="color: #64748b; margin: 0;">
        Un saludo,<br>
        <strong style="color: #0f172a;">El equipo de Capittal</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        📧 info@capittal.es | 🌐 capittal.es
      </p>
    </div>

  </div>
</body>
</html>
      `;

      try {
        await resend.emails.send({
          from: "Capittal <info@capittal.es>",
          to: [email],
          subject: `Tu solicitud de información – ${operations.length} operaciones – Capittal`,
          html: userConfirmationHtml,
        });
        console.log(`Confirmation email sent to user: ${email}`);
      } catch (userEmailError) {
        console.error("Error sending user confirmation:", userEmailError);
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping email notifications");
    }

    return new Response(
      JSON.stringify({ success: true, id: insertedData?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-bulk-inquiry-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

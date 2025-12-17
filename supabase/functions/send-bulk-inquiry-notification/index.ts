import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = [
  "s.navarro@capittal.es",
  "marcc@capittal.es",
  "marc@capittal.es",
  "lluis@capittal.es",
  "samuel@capittal.es",
];

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

    // Build operations list HTML
    const operationsListHtml = operations.map((op, index) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; font-weight: 500;">${index + 1}</td>
        <td style="padding: 12px 8px;">
          <strong>${op.company_name}</strong>
          <br>
          <span style="color: #6b7280; font-size: 13px;">${op.sector}</span>
        </td>
        <td style="padding: 12px 8px; text-align: right; color: #059669; font-weight: 500;">
          ${op.ebitda_amount ? formatCurrency(op.ebitda_amount, op.valuation_currency || 'EUR') : 'Consultar'}
        </td>
        <td style="padding: 12px 8px; text-align: center;">
          <a href="https://capittal.es/oportunidades?op=${op.id}" style="color: #3b82f6; text-decoration: none;">Ver</a>
        </td>
      </tr>
    `).join('');

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Solicitud Conjunta de Información</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 640px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #0f172a; font-size: 24px; margin: 0;">CAPITTAL</h1>
            <p style="color: #64748b; margin: 8px 0 0;">Nueva Solicitud de Información</p>
          </div>

          <!-- Main Card -->
          <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <!-- Alert Badge -->
            <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 12px 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
              <strong>🔔 Solicitud Conjunta - ${operations.length} Operaciones</strong>
            </div>

            <!-- User Info -->
            <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
              Datos del Solicitante
            </h2>
            <table style="width: 100%; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 140px;">Nombre:</td>
                <td style="padding: 8px 0; font-weight: 500;">${full_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Teléfono:</td>
                <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #3b82f6;">${phone}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Empresa:</td>
                <td style="padding: 8px 0; font-weight: 500;">${company_name}</td>
              </tr>
            </table>

            ${message ? `
            <!-- Message -->
            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Mensaje:</p>
              <p style="margin: 0; color: #0f172a;">${message}</p>
            </div>
            ` : ''}

            <!-- Operations Table -->
            <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
              Operaciones Solicitadas (${operations.length})
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 12px 8px; text-align: left; font-size: 13px; color: #6b7280;">#</th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 13px; color: #6b7280;">Operación</th>
                  <th style="padding: 12px 8px; text-align: right; font-size: 13px; color: #6b7280;">EBITDA</th>
                  <th style="padding: 12px 8px; text-align: center; font-size: 13px; color: #6b7280;">Enlace</th>
                </tr>
              </thead>
              <tbody>
                ${operationsListHtml}
              </tbody>
            </table>

            <!-- CTA -->
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <a href="https://capittal.es/admin/crm" style="display: inline-block; background: #0f172a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Gestionar en CRM →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 13px;">
            <p style="margin: 0;">Este email fue generado automáticamente por el marketplace de Capittal.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email notifications
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      // Send to all admin emails
      for (const adminEmail of ADMIN_EMAILS) {
        try {
          await resend.emails.send({
            from: "Capittal Marketplace <info@capittal.es>",
            to: [adminEmail],
            subject: `🔔 Nueva solicitud conjunta: ${operations.length} operaciones - ${full_name}`,
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
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 640px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #0f172a; font-size: 24px; margin: 0;">CAPITTAL</h1>
            </div>
            <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <h2 style="color: #0f172a; margin: 0 0 16px;">¡Hemos recibido tu solicitud!</h2>
              <p style="color: #64748b; line-height: 1.6;">
                Hola ${full_name},<br><br>
                Hemos recibido tu solicitud de información para <strong>${operations.length} operaciones</strong>.
                Nuestro equipo revisará tu petición y te contactará en las próximas 24-48 horas.
              </p>
              <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">Operaciones solicitadas:</p>
                <ul style="margin: 0; padding-left: 20px; color: #0f172a;">
                  ${operations.map(op => `<li>${op.company_name} (${op.sector})</li>`).join('')}
                </ul>
              </div>
              <p style="color: #64748b; line-height: 1.6;">
                Si tienes alguna pregunta, no dudes en contactarnos en <a href="mailto:info@capittal.es" style="color: #3b82f6;">info@capittal.es</a>.
              </p>
              <p style="color: #64748b; margin-top: 24px;">
                Un saludo,<br>
                <strong>El equipo de Capittal</strong>
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
          subject: `Tu solicitud de información - ${operations.length} operaciones`,
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

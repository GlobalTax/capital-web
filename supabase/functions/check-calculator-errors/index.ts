import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Configuration
const ERROR_THRESHOLD = 3; // Minimum errors to trigger alert
const TIME_WINDOW_MINUTES = 720; // 12 hours - runs twice daily at 9:00 and 18:00
const COOLDOWN_MINUTES = 30; // Minimum time between alerts (for manual triggers)

interface CalculatorError {
  id: string;
  error_type: string;
  error_message: string;
  component: string;
  action: string;
  company_data: {
    email?: string;
    companyName?: string;
    contactName?: string;
  } | null;
  created_at: string;
}

interface EmailRecipient {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CHECK-CALCULATOR-ERRORS] Starting check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("[CHECK-CALCULATOR-ERRORS] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Calculate time window
    const now = new Date();
    const timeWindowStart = new Date(now.getTime() - TIME_WINDOW_MINUTES * 60 * 1000);

    // 1. Count errors in the time window
    const { data: recentErrors, error: countError } = await supabase
      .from("calculator_errors")
      .select("*")
      .gte("created_at", timeWindowStart.toISOString())
      .order("created_at", { ascending: false });

    if (countError) {
      console.error("[CHECK-CALCULATOR-ERRORS] Error querying errors:", countError);
      throw countError;
    }

    const errorCount = recentErrors?.length || 0;
    console.log(`[CHECK-CALCULATOR-ERRORS] Found ${errorCount} errors in last ${TIME_WINDOW_MINUTES} minutes`);

    // 2. Check if threshold is met
    if (errorCount < ERROR_THRESHOLD) {
      console.log(`[CHECK-CALCULATOR-ERRORS] Below threshold (${ERROR_THRESHOLD}), no action needed`);
      return new Response(
        JSON.stringify({ 
          status: "ok", 
          message: `Only ${errorCount} errors found, threshold is ${ERROR_THRESHOLD}`,
          errorCount 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check cooldown period
    const { data: lastAlert, error: alertError } = await supabase
      .from("calculator_error_alerts")
      .select("alert_sent_at")
      .order("alert_sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (alertError) {
      console.error("[CHECK-CALCULATOR-ERRORS] Error checking cooldown:", alertError);
      // Continue anyway - better to potentially duplicate than miss an alert
    }

    if (lastAlert) {
      const lastAlertTime = new Date(lastAlert.alert_sent_at);
      const cooldownEnd = new Date(lastAlertTime.getTime() + COOLDOWN_MINUTES * 60 * 1000);
      
      if (now < cooldownEnd) {
        const minutesRemaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 60000);
        console.log(`[CHECK-CALCULATOR-ERRORS] In cooldown period, ${minutesRemaining} minutes remaining`);
        return new Response(
          JSON.stringify({ 
            status: "cooldown", 
            message: `In cooldown period, ${minutesRemaining} minutes remaining`,
            errorCount 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 4. Get active recipients from email_recipients_config
    const { data: recipients, error: recipientsError } = await supabase
      .from("email_recipients_config")
      .select("email, name")
      .eq("is_active", true)
      .eq("is_default_copy", true);

    if (recipientsError) {
      console.error("[CHECK-CALCULATOR-ERRORS] Error getting recipients:", recipientsError);
      throw recipientsError;
    }

    if (!recipients || recipients.length === 0) {
      console.error("[CHECK-CALCULATOR-ERRORS] No active recipients found");
      return new Response(
        JSON.stringify({ error: "No active recipients configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[CHECK-CALCULATOR-ERRORS] Will notify ${recipients.length} recipients`);

    // 5. Prepare error summary
    const errors = recentErrors as CalculatorError[];
    const errorTypes = [...new Set(errors.map(e => e.error_type))];
    const affectedLeads = errors
      .filter(e => e.company_data?.email || e.company_data?.companyName)
      .map(e => ({
        email: e.company_data?.email || "Sin email",
        companyName: e.company_data?.companyName || "Sin empresa",
        contactName: e.company_data?.contactName || "Sin nombre"
      }));

    // 6. Build email HTML
    const emailHtml = buildAlertEmailHtml({
      errorCount,
      errorTypes,
      affectedLeads,
      timeWindowMinutes: TIME_WINDOW_MINUTES,
      sampleErrors: errors.slice(0, 5).map(e => ({
        type: e.error_type,
        message: e.error_message?.substring(0, 100) || "Sin mensaje",
        component: e.component || "Desconocido",
        time: new Date(e.created_at).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
      }))
    });

    // 7. Send email
    const recipientEmails = recipients.map((r: EmailRecipient) => r.email);
    
    const emailResponse = await resend.emails.send({
      from: "Capittal Alertas <samuel@capittal.es>",
      to: recipientEmails,
      subject: `⚠️ ALERTA: ${errorCount} errores críticos en Calculadora`,
      html: emailHtml,
      replyTo: "samuel@capittal.es"
    });

    console.log("[CHECK-CALCULATOR-ERRORS] Email sent:", emailResponse);

    // 8. Record the alert
    const { error: insertError } = await supabase
      .from("calculator_error_alerts")
      .insert({
        error_count: errorCount,
        time_window_start: timeWindowStart.toISOString(),
        time_window_end: now.toISOString(),
        error_types: errorTypes,
        sample_errors: errors.slice(0, 5).map(e => ({
          id: e.id,
          type: e.error_type,
          message: e.error_message?.substring(0, 200),
          component: e.component,
          created_at: e.created_at
        })),
        recipients: recipientEmails
      });

    if (insertError) {
      console.error("[CHECK-CALCULATOR-ERRORS] Error recording alert:", insertError);
      // Don't throw - the email was sent, that's the important part
    }

    console.log("[CHECK-CALCULATOR-ERRORS] Alert sent and recorded successfully");

    return new Response(
      JSON.stringify({ 
        status: "alert_sent",
        errorCount,
        recipientCount: recipientEmails.length,
        emailId: emailResponse.data?.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[CHECK-CALCULATOR-ERRORS] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

function buildAlertEmailHtml(params: {
  errorCount: number;
  errorTypes: string[];
  affectedLeads: Array<{ email: string; companyName: string; contactName: string }>;
  timeWindowMinutes: number;
  sampleErrors: Array<{ type: string; message: string; component: string; time: string }>;
}): string {
  const { errorCount, errorTypes, affectedLeads, timeWindowMinutes, sampleErrors } = params;
  
  const errorTypeBadges: Record<string, { color: string; label: string }> = {
    calculation: { color: "#dc2626", label: "Cálculo" },
    submission: { color: "#ea580c", label: "Envío" },
    validation: { color: "#ca8a04", label: "Validación" },
    network: { color: "#2563eb", label: "Red" },
    unknown: { color: "#6b7280", label: "Desconocido" }
  };

  const errorTypesList = errorTypes.map(type => {
    const badge = errorTypeBadges[type] || errorTypeBadges.unknown;
    return `<span style="background: ${badge.color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 4px;">${badge.label}</span>`;
  }).join("");

  const leadsHtml = affectedLeads.length > 0
    ? affectedLeads.map(lead => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.contactName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.email}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${lead.companyName}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="3" style="padding: 8px; text-align: center; color: #6b7280;">No hay datos de leads disponibles</td></tr>`;

  const errorsHtml = sampleErrors.map(err => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        <span style="background: ${(errorTypeBadges[err.type] || errorTypeBadges.unknown).color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${err.type}</span>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151;">${err.message}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">${err.component}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">${err.time}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
  <div style="max-width: 640px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: #dc2626; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">⚠️ Alerta de Errores Críticos</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Calculadora de Valoración</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <!-- Alert Banner -->
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">
          Se han detectado <strong>${errorCount} errores</strong> en los últimos ${timeWindowMinutes} minutos.
        </p>
        <p style="margin: 8px 0 0 0; color: #7f1d1d; font-size: 14px;">
          Esto puede indicar un problema sistémico que requiere atención inmediata.
        </p>
      </div>
      
      <!-- Summary -->
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Resumen</h2>
      <table style="width: 100%; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Total de errores:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #dc2626;">${errorCount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Tipos de error:</td>
          <td style="padding: 8px 0;">${errorTypesList}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Período:</td>
          <td style="padding: 8px 0;">Últimos ${timeWindowMinutes} minutos</td>
        </tr>
      </table>
      
      <!-- Error Details -->
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Muestra de Errores</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Tipo</th>
            <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Mensaje</th>
            <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Componente</th>
            <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Hora</th>
          </tr>
        </thead>
        <tbody>
          ${errorsHtml}
        </tbody>
      </table>
      
      <!-- Affected Leads -->
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Leads Afectados</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Nombre</th>
            <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Email</th>
            <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Empresa</th>
          </tr>
        </thead>
        <tbody>
          ${leadsHtml}
        </tbody>
      </table>
      
      <!-- CTA -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://webcapittal.lovable.app/admin/calculator-errors" 
           style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          Ver Dashboard de Errores
        </a>
      </div>
      
      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p style="margin: 0;">Este es un email automático del sistema de monitoreo de Capittal.</p>
        <p style="margin: 8px 0 0 0;">Las alertas tienen un cooldown de ${COOLDOWN_MINUTES} minutos para evitar spam.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

serve(handler);

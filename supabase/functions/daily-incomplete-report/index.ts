import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function getClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

interface IncompleteValuation {
  id: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  industry: string;
  created_at: string;
  unique_token: string;
  revenue: number;
  ebitda: number;
}

function generateEmailHTML(incompleteValuations: IncompleteValuation[], date: string): string {
  const total = incompleteValuations.length;
  
  if (total === 0) {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d;">📊 Resumen Diario - Valoraciones</h1>
          <p><strong>Fecha:</strong> ${date}</p>
          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #38a169;">✅ Excelentes noticias</h3>
            <p>No hay valoraciones incompletas pendientes del día de ayer.</p>
          </div>
        </body>
      </html>
    `;
  }

  const valuationRows = incompleteValuations.map(val => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; font-weight: bold;">${val.company_name}</td>
      <td style="padding: 12px;">${val.contact_name}</td>
      <td style="padding: 12px;">${val.email}</td>
      <td style="padding: 12px;">${val.industry}</td>
      <td style="padding: 12px;">${new Date(val.created_at).toLocaleTimeString('es-ES')}</td>
      <td style="padding: 12px;">
        ${val.revenue ? `${(val.revenue / 1000000).toFixed(1)}M€` : 'N/A'}
      </td>
      <td style="padding: 12px;">
        ${val.ebitda ? `${(val.ebitda / 1000).toFixed(0)}k€` : 'N/A'}
      </td>
    </tr>
  `).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a365d;">📊 Resumen Diario - Valoraciones Incompletas</h1>
        <p><strong>Fecha:</strong> ${date}</p>
        
        <div style="background: #fed7d7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #c53030;">⚠️ ${total} valoraciones incompletas</h3>
          <p>Estas empresas iniciaron el proceso pero no lo completaron:</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <thead style="background: #4a5568; color: white;">
            <tr>
              <th style="padding: 12px; text-align: left;">Empresa</th>
              <th style="padding: 12px; text-align: left;">Contacto</th>
              <th style="padding: 12px; text-align: left;">Email</th>
              <th style="padding: 12px; text-align: left;">Sector</th>
              <th style="padding: 12px; text-align: left;">Hora</th>
              <th style="padding: 12px; text-align: left;">Ingresos</th>
              <th style="padding: 12px; text-align: left;">EBITDA</th>
            </tr>
          </thead>
          <tbody>
            ${valuationRows}
          </tbody>
        </table>

        <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #319795;">💡 Acciones recomendadas</h3>
          <ul style="margin: 10px 0;">
            <li>Considerar seguimiento personalizado para empresas con datos financieros completos</li>
            <li>Analizar puntos de abandono más comunes en el proceso</li>
            <li>Revisar experiencia de usuario en pasos críticos</li>
          </ul>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #718096; font-size: 14px;">
          <strong>Capittal</strong><br>
          Este reporte se genera automáticamente cada día a las 9:00 AM.<br>
          Datos de: ${Deno.env.get("SUPABASE_URL")}
        </p>
      </body>
    </html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let reportStatus = 'pending';
  let errorMessage = null;
  let emailSent = false;
  let emailId = null;
  let emailSubject = '';

  try {
    const supabase = getClient();
    
    // Calcular rango de ayer (24 horas atrás)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    console.log(`Buscando valoraciones incompletas entre ${startOfYesterday.toISOString()} y ${endOfYesterday.toISOString()}`);

    // Buscar valoraciones incompletas del día anterior
    const { data: incompleteValuations, error } = await supabase
      .from("company_valuations")
      .select(`
        id,
        contact_name,
        company_name,
        email,
        phone,
        industry,
        created_at,
        unique_token,
        revenue,
        ebitda
      `)
      .gte("created_at", startOfYesterday.toISOString())
      .lte("created_at", endOfYesterday.toISOString())
      .is("final_valuation", null) // Valoraciones sin completar
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error consultando valoraciones:", error);
      throw error;
    }

    console.log(`Encontradas ${incompleteValuations?.length || 0} valoraciones incompletas`);

    // Generar email
    const dateStr = yesterday.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailHTML = generateEmailHTML(incompleteValuations || [], dateStr);
    const total = incompleteValuations?.length || 0;
    
    const subject = total === 0 
      ? `✅ Sin valoraciones pendientes - ${dateStr}`
      : `⚠️ ${total} valoraciones incompletas - ${dateStr}`;

    emailSubject = subject;

    // Enviar email SIEMPRE (incluso si no hay valoraciones incompletas)
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Capittal Reportes <reportes@capittal.es>",
      to: ["samuel@capittal.es"],
      subject,
      html: emailHTML,
    });

    if (emailError) {
      console.error("Error enviando email:", emailError);
      errorMessage = `Error enviando email: ${emailError.message}`;
      reportStatus = 'error';
    } else {
      console.log("Email de reporte diario enviado exitosamente:", emailData);
      emailSent = true;
      emailId = emailData?.id;
      reportStatus = 'success';
    }

    const executionTime = Date.now() - startTime;

    // Guardar SIEMPRE registro del reporte en la base de datos
    const { error: reportError } = await supabase
      .from("daily_incomplete_reports")
      .insert({
        report_date: yesterday.toISOString().split('T')[0], // Solo la fecha
        period_start: startOfYesterday.toISOString(),
        period_end: endOfYesterday.toISOString(),
        incomplete_count: total,
        incomplete_valuations: incompleteValuations || [],
        email_sent: emailSent,
        email_id: emailId,
        email_subject: emailSubject,
        report_status: reportStatus,
        execution_time_ms: executionTime
      });

    if (reportError) {
      console.error("Error guardando registro del reporte:", reportError);
      // No lanzamos error aquí porque el reporte ya se envió exitosamente
    } else {
      console.log("Registro del reporte guardado exitosamente");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        incompleteCount: total,
        emailId: emailData?.id,
        executionTime,
        message: `Reporte enviado: ${total} valoraciones incompletas`
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (err: any) {
    console.error("Error en daily-incomplete-report:", err);
    
    reportStatus = 'error';
    errorMessage = err?.message || "Error inesperado";
    const executionTime = Date.now() - startTime;

    // Intentar guardar el error en la base de datos
    try {
      const supabase = getClient();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

      await supabase
        .from("daily_incomplete_reports")
        .insert({
          report_date: yesterday.toISOString().split('T')[0],
          period_start: startOfYesterday.toISOString(),
          period_end: endOfYesterday.toISOString(),
          incomplete_count: 0,
          incomplete_valuations: [],
          email_sent: emailSent,
          email_id: emailId,
          email_subject: emailSubject,
          report_status: reportStatus,
          error_message: errorMessage,
          execution_time_ms: executionTime
        });
    } catch (reportErr) {
      console.error("Error guardando registro de error:", reportErr);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
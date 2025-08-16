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

interface IncompleteAlertRequest {
  valuationId: string;
  type?: string; // 'abandonment' | 'immediate_alert'
  step?: number;
  completion?: number;
  timeSpent?: number;
}

function generateAlertHTML(valuation: any, alertData?: { type?: string; step?: number; completion?: number; timeSpent?: number }): string {
  const timeStr = new Date(valuation.created_at).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const lastActivityStr = valuation.last_activity_at 
    ? new Date(valuation.last_activity_at).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'No disponible';

  const completionStatus = {
    revenue: valuation.revenue ? '✅' : '❌',
    ebitda: valuation.ebitda ? '✅' : '❌',
    industry: valuation.industry ? '✅' : '❌',
    employee_range: valuation.employee_range ? '✅' : '❌'
  };

  const alertType = alertData?.type === 'immediate_alert' ? 'Alerta Inmediata' : 'Abandono Detectado';
  const alertColor = alertData?.type === 'immediate_alert' ? '#f56500' : '#c53030';
  const alertBg = alertData?.type === 'immediate_alert' ? '#fed7af' : '#fed7d7';
  
  const progressPercentage = alertData?.completion || valuation.completion_percentage || 0;
  const currentStep = alertData?.step || valuation.current_step || 1;
  const timeSpent = alertData?.timeSpent || valuation.time_spent_seconds || 0;
  const timeSpentMinutes = Math.floor(timeSpent / 60);

  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${alertColor};">🚨 Valoración Incompleta - ${alertType}</h1>
        
        <div style="background: ${alertBg}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${alertColor};">
          <h3 style="color: ${alertColor}; margin-top: 0;">Nueva valoración ${alertData?.type === 'immediate_alert' ? 'con abandono inminente' : 'abandonada'}</h3>
          <p><strong>Empresa:</strong> ${valuation.company_name}</p>
          <p><strong>Contacto:</strong> ${valuation.contact_name}</p>
          <p><strong>Email:</strong> ${valuation.email}</p>
          <p><strong>Teléfono:</strong> ${valuation.phone || 'No proporcionado'}</p>
          <p><strong>Iniciado:</strong> ${timeStr}</p>
          <p><strong>Última actividad:</strong> ${lastActivityStr}</p>
        </div>

        <div style="background: #e6f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb;">📊 Progreso de la valoración:</h3>
          <div style="background: #f0f0f0; border-radius: 10px; padding: 3px; margin: 10px 0;">
            <div style="background: linear-gradient(90deg, #10b981 0%, #f59e0b 70%, #ef4444 100%); height: 20px; border-radius: 8px; width: ${progressPercentage}%; max-width: 100%; transition: width 0.3s ease;"></div>
          </div>
          <ul style="list-style: none; padding: 0; margin: 10px 0;">
            <li style="margin: 5px 0;"><strong>Progreso:</strong> ${progressPercentage}% completado</li>
            <li style="margin: 5px 0;"><strong>Paso actual:</strong> ${currentStep}/7</li>
            <li style="margin: 5px 0;"><strong>Tiempo invertido:</strong> ${timeSpentMinutes} minutos</li>
            <li style="margin: 5px 0;"><strong>Estado:</strong> ${valuation.valuation_status || 'En progreso'}</li>
          </ul>
        </div>

        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748;">📋 Estado del formulario:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;">${completionStatus.revenue} <strong>Ingresos:</strong> ${valuation.revenue ? `${(valuation.revenue / 1000000).toFixed(1)}M€` : 'No completado'}</li>
            <li style="margin: 8px 0;">${completionStatus.ebitda} <strong>EBITDA:</strong> ${valuation.ebitda ? `${(valuation.ebitda / 1000).toFixed(0)}k€` : 'No completado'}</li>
            <li style="margin: 8px 0;">${completionStatus.industry} <strong>Sector:</strong> ${valuation.industry || 'No especificado'}</li>
            <li style="margin: 8px 0;">${completionStatus.employee_range} <strong>Empleados:</strong> ${valuation.employee_range || 'No especificado'}</li>
          </ul>
        </div>

        <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #319795;">💡 Acciones recomendadas:</h3>
          <ul>
            <li>Contactar en las próximas 2 horas para máxima conversión</li>
            <li>Ofrecer asistencia personalizada para completar la valoración</li>
            <li>Preparar propuesta de servicios según datos disponibles</li>
          </ul>
        </div>

        <div style="background: #f0f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #4a5568;">
            <strong>ID de Valoración:</strong> ${valuation.id}<br>
            <strong>Token único:</strong> ${valuation.unique_token || 'No generado'}<br>
            <strong>IP:</strong> ${valuation.ip_address || 'No disponible'}
          </p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #718096; font-size: 14px;">
          <strong>Capittal</strong><br>
          Alerta automática de valoración incompleta<br>
          Recibido: ${timeStr}
        </p>
      </body>
    </html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { valuationId, type, step, completion, timeSpent }: IncompleteAlertRequest = await req.json();

    if (!valuationId) {
      return new Response(
        JSON.stringify({ error: "valuationId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = getClient();

    // Obtener datos de la valoración con criterios más flexibles
    const { data: valuation, error } = await supabase
      .from("company_valuations")
      .select("*")
      .eq("id", valuationId)
      // Más flexible: aceptar cualquier valoración incompleta (no solo final_valuation = null)
      .single();

    if (error) {
      console.error("Error obteniendo valoración:", error);
      return new Response(
        JSON.stringify({ error: "Valuation not found or already completed" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!valuation) {
      return new Response(
        JSON.stringify({ error: "Valuation not found or already completed" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generar email con datos adicionales
    const alertData = { type, step, completion, timeSpent };
    const emailHTML = generateAlertHTML(valuation, alertData);
    const alertTypeText = type === 'immediate_alert' ? 'Alerta inmediata' : 'Abandono detectado';
    const subject = `🚨 ${alertTypeText}: ${valuation.company_name} - ${valuation.contact_name} (${completion || valuation.completion_percentage || 0}%)`;

    // Enviar email de alerta
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Capittal Alertas <alertas@capittal.es>",
      to: ["samuel@capittal.es"],
      subject,
      html: emailHTML,
    });

    if (emailError) {
      console.error("Error enviando alerta:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send alert email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Alerta de valoración incompleta enviada:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailData?.id,
        message: `Alerta enviada para ${valuation.company_name}`
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (err: any) {
    console.error("Error en send-incomplete-alert:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
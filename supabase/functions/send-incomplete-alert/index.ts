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
}

function generateAlertHTML(valuation: any): string {
  const timeStr = new Date(valuation.created_at).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const completionStatus = {
    revenue: valuation.revenue ? '✅' : '❌',
    ebitda: valuation.ebitda ? '✅' : '❌',
    industry: valuation.industry ? '✅' : '❌',
    employee_range: valuation.employee_range ? '✅' : '❌'
  };

  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #c53030;">🚨 Valoración Incompleta - Alerta Inmediata</h1>
        
        <div style="background: #fed7d7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c53030;">
          <h3 style="color: #c53030; margin-top: 0;">Nueva valoración abandonada</h3>
          <p><strong>Empresa:</strong> ${valuation.company_name}</p>
          <p><strong>Contacto:</strong> ${valuation.contact_name}</p>
          <p><strong>Email:</strong> ${valuation.email}</p>
          <p><strong>Teléfono:</strong> ${valuation.phone || 'No proporcionado'}</p>
          <p><strong>Hora:</strong> ${timeStr}</p>
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
    const { valuationId }: IncompleteAlertRequest = await req.json();

    if (!valuationId) {
      return new Response(
        JSON.stringify({ error: "valuationId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = getClient();

    // Obtener datos de la valoración
    const { data: valuation, error } = await supabase
      .from("company_valuations")
      .select("*")
      .eq("id", valuationId)
      .is("final_valuation", null) // Solo si está incompleta
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

    // Generar email
    const emailHTML = generateAlertHTML(valuation);
    const subject = `🚨 Valoración incompleta: ${valuation.company_name} - ${valuation.contact_name}`;

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
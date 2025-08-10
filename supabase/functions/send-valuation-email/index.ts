import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompanyDataEmail {
  contactName?: string;
  companyName?: string;
  cif?: string | null;
  email?: string;
  phone?: string | null;
  industry?: string;
  yearsOfOperation?: number | null;
  employeeRange?: string;
  revenue?: number | null;
  ebitda?: number | null;
  netProfitMargin?: number | null;
  growthRate?: number | null;
  location?: string | null;
  ownershipParticipation?: string | null;
  competitiveAdvantage?: string | null;
}

interface ValuationResultEmail {
  ebitdaMultiple?: number;
  finalValuation?: number;
  valuationRange?: { min?: number; max?: number };
  multiples?: { ebitdaMultipleUsed?: number };
}

interface SendValuationEmailRequest {
  recipientEmail?: string; // opcional, por defecto se usa el de pruebas
  companyData: CompanyDataEmail;
  result: ValuationResultEmail;
}

const euros = (n?: number | null) =>
  typeof n === "number" && !isNaN(n) ? n.toLocaleString("es-ES", { style: "currency", currency: "EUR" }) : "-";

const pct = (n?: number | null) =>
  typeof n === "number" && !isNaN(n) ? `${n.toFixed(2)}%` : "-";

const handler = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { recipientEmail, companyData, result } = (await req.json()) as SendValuationEmailRequest;

    // Emails por defecto para pruebas + posible extra desde el frontend
    const baseRecipients = ["samuel@capittal.es", "lluis@capittal.es"];
    const extraRecipient = recipientEmail?.trim();
    const recipients = Array.from(new Set([...baseRecipients, ...(extraRecipient ? [extraRecipient] : [])]));

    const subject = `Nueva valoración recibida - ${companyData.companyName || "Capittal"}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background:#f8fafc;">
        <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:24px;">
          <h1 style="margin:0 0 8px; color:#111827; font-size:20px;">Nueva valoración recibida</h1>
          <p style="margin:0 0 16px; color:#6b7280;">Calculadora de valoración - Capittal</p>

          <h2 style="margin:16px 0 8px; color:#111827; font-size:16px;">Datos de contacto</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td style="padding:6px 0; color:#374151;">Nombre</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.contactName || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Empresa</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.companyName || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">CIF</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.cif || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Email</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.email || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Teléfono</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.phone || "-"}</td></tr>
          </table>

          <h2 style="margin:16px 0 8px; color:#111827; font-size:16px;">Información de la empresa</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td style="padding:6px 0; color:#374151;">Sector</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.industry || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Años de actividad</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.yearsOfOperation ?? "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Empleados</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.employeeRange || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Ingresos</td><td style="padding:6px 0; color:#111827; font-weight:600;">${euros(companyData.revenue)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">EBITDA</td><td style="padding:6px 0; color:#111827; font-weight:600;">${euros(companyData.ebitda)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Margen Neto</td><td style="padding:6px 0; color:#111827; font-weight:600;">${pct(companyData.netProfitMargin)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Crec. anual</td><td style="padding:6px 0; color:#111827; font-weight:600;">${pct(companyData.growthRate)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Ubicación</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.location || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Participación</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.ownershipParticipation || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Ventaja competitiva</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.competitiveAdvantage || "-"}</td></tr>
          </table>

          <h2 style="margin:16px 0 8px; color:#111827; font-size:16px;">Resultado de la valoración</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td style="padding:6px 0; color:#374151;">Valoración final</td><td style="padding:6px 0; color:#111827; font-weight:700;">${euros(result?.finalValuation ?? result?.valuationRange?.min)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Rango</td><td style="padding:6px 0; color:#111827; font-weight:700;">${euros(result?.valuationRange?.min)} - ${euros(result?.valuationRange?.max)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Múltiplo EBITDA usado</td><td style="padding:6px 0; color:#111827; font-weight:600;">${result?.multiples?.ebitdaMultipleUsed ?? result?.ebitdaMultiple ?? "-"}x</td></tr>
          </table>

          <p style="margin:16px 0 0; color:#6b7280; font-size:12px;">Este correo se generó automáticamente desde la calculadora de Capittal.</p>
        </div>
      </div>
    `;

    let emailResponse: any;
    try {
      emailResponse = await resend.emails.send({
        from: "Samuel de Capittal <samuel@capittal.es>",
        to: recipients,
        subject,
        html,
      });
    } catch (e: any) {
      console.error("Primary sender failed, retrying with Resend test domain:", e?.message || e);
      emailResponse = await resend.emails.send({
        from: "Capittal (Test) <onboarding@resend.dev>",
        to: recipients,
        subject: `${subject} (pruebas)`,
        html: `${html}\n<p style=\"margin-top:12px;color:#9ca3af;font-size:12px;\">Enviado con remitente de pruebas por dominio no verificado.</p>`,
      });
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-valuation-email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

function formatCurrency(val?: number): string {
  if (!val) return "No especificado";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

function formatFrequency(freq: string): string {
  const map: Record<string, string> = { daily: "Diaria", weekly: "Semanal", monthly: "Mensual" };
  return map[freq] || freq;
}

function buildInternalHtml(prefs: any): string {
  const rows = [
    ["Nombre", prefs.full_name || "—"],
    ["Email", prefs.email],
    ["Teléfono", prefs.phone || "—"],
    ["Empresa", prefs.company || "—"],
    ["Sectores", (prefs.preferred_sectors || []).join(", ") || "—"],
    ["Ubicaciones", (prefs.preferred_locations || []).join(", ") || "—"],
    ["Valoración mín.", formatCurrency(prefs.min_valuation)],
    ["Valoración máx.", formatCurrency(prefs.max_valuation)],
    ["Frecuencia", formatFrequency(prefs.alert_frequency || "weekly")],
  ];

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#1e293b;padding:24px;">
  <h2 style="color:#0f172a;margin-bottom:4px;">🔔 Nueva Alerta de Comprador</h2>
  <p style="color:#64748b;margin-top:0;">Un nuevo usuario se ha suscrito a alertas de oportunidades.</p>
  <table style="border-collapse:collapse;width:100%;max-width:560px;">
    ${rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#475569;width:140px;">${label}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#1e293b;">${value}</td>
    </tr>`).join("")}
  </table>
  <p style="margin-top:20px;">
    <a href="https://webcapittal.lovable.app/admin/oportunidades" style="background:#0f172a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Ver en panel</a>
  </p>
</body></html>`;
}

function buildSubscriberHtml(prefs: any): string {
  const sectors = (prefs.preferred_sectors || []).join(", ") || "Todos los sectores";
  const locations = (prefs.preferred_locations || []).join(", ") || "Todas las ubicaciones";
  const valRange =
    prefs.min_valuation || prefs.max_valuation
      ? `${formatCurrency(prefs.min_valuation)} — ${formatCurrency(prefs.max_valuation)}`
      : "Sin restricción";

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#0f172a;padding:28px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Capittal</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 8px;">¡Tus alertas están configuradas!</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
            ${prefs.full_name ? `Hola ${prefs.full_name},` : "Hola,"}<br/>
            Hemos registrado tus preferencias de búsqueda. Te avisaremos cuando encontremos oportunidades que encajen con tu perfil.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 12px;font-weight:700;color:#0f172a;font-size:14px;">Resumen de tus preferencias</p>
              <table width="100%" style="font-size:13px;color:#334155;">
                <tr><td style="padding:4px 0;font-weight:600;">Sectores</td><td style="padding:4px 0;">${sectors}</td></tr>
                <tr><td style="padding:4px 0;font-weight:600;">Ubicaciones</td><td style="padding:4px 0;">${locations}</td></tr>
                <tr><td style="padding:4px 0;font-weight:600;">Rango de valoración</td><td style="padding:4px 0;">${valRange}</td></tr>
                <tr><td style="padding:4px 0;font-weight:600;">Frecuencia</td><td style="padding:4px 0;">${formatFrequency(prefs.alert_frequency || "weekly")}</td></tr>
              </table>
            </td></tr>
          </table>

          <p style="text-align:center;">
            <a href="https://webcapittal.lovable.app/oportunidades" style="display:inline-block;background:#0f172a;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Modificar mis preferencias</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;text-align:center;">
            Capittal · Asesoría M&A<br/>
            +34 695 717 490 · samuel@capittal.es
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences } = await req.json();
    if (!preferences?.email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[buyer-alert] Processing notification for:", preferences.email);

    // 1. Fetch internal recipients
    const { data: recipients } = await supabase
      .from("email_recipients_config")
      .select("*")
      .eq("is_active", true);

    const ccRecipients = (recipients || []).filter((r: any) => r.is_default_copy && !r.is_bcc).map((r: any) => r.email);
    const bccRecipients = (recipients || []).filter((r: any) => r.is_default_copy && r.is_bcc).map((r: any) => r.email);
    const mainRecipient = ccRecipients.length > 0 ? ccRecipients[0] : "samuel@capittal.es";
    const restCc = ccRecipients.slice(1);

    // 2. Send internal email
    const internalRes = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Capittal Alertas <samuel@capittal.es>",
        to: [mainRecipient],
        cc: restCc.length > 0 ? restCc : undefined,
        bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
        reply_to: "samuel@capittal.es",
        subject: `🔔 Nueva Alerta de Comprador: ${preferences.full_name || preferences.email}`,
        html: buildInternalHtml(preferences),
      }),
    });

    const internalResult = await internalRes.json();
    console.log("[buyer-alert] Internal email result:", JSON.stringify(internalResult));

    // 3. Send subscriber confirmation email
    const subscriberRes = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Samuel Navarro - Capittal <samuel@capittal.es>",
        to: [preferences.email],
        reply_to: "samuel@capittal.es",
        subject: "Tus alertas de oportunidades en Capittal",
        html: buildSubscriberHtml(preferences),
      }),
    });

    const subscriberResult = await subscriberRes.json();
    console.log("[buyer-alert] Subscriber email result:", JSON.stringify(subscriberResult));

    return new Response(
      JSON.stringify({ success: true, internal: internalResult, subscriber: subscriberResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[buyer-alert] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

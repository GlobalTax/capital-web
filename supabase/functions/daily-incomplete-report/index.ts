import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTERNAL_TEAM = [
  "samuel@capittal.es",
  "marcc@capittal.es",
  "marc@capittal.es",
  "oriol@capittal.es",
  "lluis@capittal.es",
  "marcel@capittal.es",
  "albert@capittal.es",
];

const log = (level: string, event: string, data: object = {}) => {
  const entry = { timestamp: new Date().toISOString(), function: "daily-incomplete-report", level, event, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("info", "REPORT_STARTED");

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch incomplete valuations from last 24h
    const { data: valuations, error: valError } = await supabase
      .from("company_valuations")
      .select("id, company_name, ai_sector_name, current_step, created_at, ip_address, email, phone, contact_name, revenue, ebitda")
      .gte("created_at", twentyFourHoursAgo.toISOString())
      .is("final_valuation", null)
      .order("created_at", { ascending: false });

    if (valError) {
      log("error", "FETCH_ERROR", { error: valError.message });
      throw valError;
    }

    // Deduplicate by IP - keep most recent per IP
    const seenIps = new Set<string>();
    const uniqueValuations = (valuations || []).filter((v: any) => {
      if (!v.ip_address) return true;
      const ip = String(v.ip_address);
      if (seenIps.has(ip)) return false;
      seenIps.add(ip);
      return true;
    });

    // Metrics
    const total = uniqueValuations.length;
    const byStep: Record<string, number> = {};
    const bySector: Record<string, number> = {};

    for (const v of uniqueValuations) {
      const step = v.current_step || "unknown";
      byStep[step] = (byStep[step] || 0) + 1;
      const sector = v.ai_sector_name || "Sin sector";
      bySector[sector] = (bySector[sector] || 0) + 1;
    }

    // Also fetch completed count for context
    const { count: completedCount } = await supabase
      .from("company_valuations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", twentyFourHoursAgo.toISOString())
      .not("final_valuation", "is", null);

    const dateStr = now.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    // Build HTML email
    const stepRows = Object.entries(byStep)
      .sort((a, b) => b[1] - a[1])
      .map(([step, count]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${step}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;font-weight:bold">${count}</td></tr>`)
      .join("");

    const sectorRows = Object.entries(bySector)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([sector, count]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${sector}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;font-weight:bold">${count}</td></tr>`)
      .join("");

    const valuationRows = uniqueValuations
      .slice(0, 20)
      .map((v: any) => {
        const time = new Date(v.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
        return `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:13px">${time}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:13px">${v.company_name || "-"}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:13px">${v.ai_sector_name || "-"}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:13px">${v.current_step || "-"}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:13px">${v.contact_name || "-"}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:13px">${v.email || "-"}</td>
        </tr>`;
      })
      .join("");

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px">
      <h2 style="color:#0f172a;margin-bottom:4px">📊 Reporte Diario - Valoraciones Incompletas</h2>
      <p style="color:#64748b;margin-top:0">${dateStr}</p>
      
      <div style="display:flex;gap:16px;margin:20px 0">
        <div style="background:#fef2f2;border-radius:8px;padding:16px;flex:1;text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#dc2626">${total}</div>
          <div style="color:#991b1b;font-size:13px">Incompletas</div>
        </div>
        <div style="background:#f0fdf4;border-radius:8px;padding:16px;flex:1;text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#16a34a">${completedCount || 0}</div>
          <div style="color:#166534;font-size:13px">Completadas</div>
        </div>
        <div style="background:#eff6ff;border-radius:8px;padding:16px;flex:1;text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#2563eb">${total + (completedCount || 0)}</div>
          <div style="color:#1e40af;font-size:13px">Total 24h</div>
        </div>
      </div>

      ${stepRows ? `
      <h3 style="color:#0f172a;margin-top:24px">Por paso abandonado</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0">Paso</th><th style="text-align:center;padding:8px;border-bottom:2px solid #e2e8f0">Cantidad</th></tr></thead>
        <tbody>${stepRows}</tbody>
      </table>` : ""}

      ${sectorRows ? `
      <h3 style="color:#0f172a;margin-top:24px">Por sector (top 10)</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0">Sector</th><th style="text-align:center;padding:8px;border-bottom:2px solid #e2e8f0">Cantidad</th></tr></thead>
        <tbody>${sectorRows}</tbody>
      </table>` : ""}

      ${valuationRows ? `
      <h3 style="color:#0f172a;margin-top:24px">Detalle (últimas 20)</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e2e8f0">Hora</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e2e8f0">Empresa</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e2e8f0">Sector</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e2e8f0">Paso</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e2e8f0">Contacto</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #e2e8f0">Email</th>
        </tr></thead>
        <tbody>${valuationRows}</tbody>
      </table>` : ""}

      <p style="color:#94a3b8;font-size:12px;margin-top:24px">
        Reporte automático generado por Capittal · ${now.toISOString()}
      </p>
    </div>`;

    // Send email
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "Capittal <samuel@capittal.es>",
      replyTo: "info@capittal.es",
      to: INTERNAL_TEAM,
      subject: `📊 Valoraciones incompletas: ${total} en últimas 24h - ${now.toLocaleDateString("es-ES")}`,
      html,
    });

    if (emailError) {
      log("error", "EMAIL_ERROR", { error: emailError });
      throw new Error(`Email send failed: ${JSON.stringify(emailError)}`);
    }

    log("info", "REPORT_SENT", { total, completed: completedCount || 0, messageId: emailResult?.id });

    return new Response(
      JSON.stringify({ success: true, incomplete: total, completed: completedCount || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    log("error", "REPORT_FAILED", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


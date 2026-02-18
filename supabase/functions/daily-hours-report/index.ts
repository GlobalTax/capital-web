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
  const entry = { timestamp: new Date().toISOString(), function: "daily-hours-report", level, event, ...data };
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
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString();

    // 1. Valuations processed yesterday
    const { count: totalValuations } = await supabase
      .from("company_valuations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterdayStr);

    const { count: completedValuations } = await supabase
      .from("company_valuations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterdayStr)
      .not("final_valuation", "is", null);

    // 2. Advisor valuations
    const { count: advisorValuations } = await supabase
      .from("advisor_valuations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterdayStr);

    // 3. Leads received
    const { count: newLeads } = await supabase
      .from("acquisition_leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterdayStr);

    // 4. Emails sent (from outbox)
    const { count: emailsSent } = await supabase
      .from("email_outbox")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterdayStr)
      .eq("status", "sent");

    // 5. Bookings
    const { count: newBookings } = await supabase
      .from("calendar_bookings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterdayStr);

    // 6. Blog posts published
    const { count: blogPosts } = await supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .gte("published_at", yesterdayStr)
      .eq("is_published", true);

    // 7. Notifications sent
    const { count: notificationsSent } = await supabase
      .from("admin_notifications_log")
      .select("id", { count: "exact", head: true })
      .gte("sent_at", yesterdayStr)
      .eq("status", "sent");

    const dateStr = yesterday.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const metricRow = (icon: string, label: string, value: number | null) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px">${icon} ${label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-weight:bold;font-size:16px">${value || 0}</td>
      </tr>`;

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#0f172a;margin-bottom:4px">📋 Resumen Diario de Actividad</h2>
      <p style="color:#64748b;margin-top:0">${dateStr}</p>

      <table style="width:100%;border-collapse:collapse;margin-top:20px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
        <thead>
          <tr style="background:#f8fafc">
            <th style="text-align:left;padding:12px;border-bottom:2px solid #e2e8f0;color:#475569">Métrica</th>
            <th style="text-align:center;padding:12px;border-bottom:2px solid #e2e8f0;color:#475569;width:80px">Total</th>
          </tr>
        </thead>
        <tbody>
          ${metricRow("📊", "Valoraciones totales", totalValuations)}
          ${metricRow("✅", "Valoraciones completadas", completedValuations)}
          ${metricRow("🏢", "Valoraciones advisor", advisorValuations)}
          ${metricRow("🎯", "Nuevos leads", newLeads)}
          ${metricRow("📧", "Emails enviados", emailsSent)}
          ${metricRow("📅", "Reservas", newBookings)}
          ${metricRow("📝", "Posts publicados", blogPosts)}
          ${metricRow("🔔", "Notificaciones", notificationsSent)}
        </tbody>
      </table>

      <p style="color:#94a3b8;font-size:12px;margin-top:24px">
        Reporte automático generado por Capittal · ${now.toISOString()}
      </p>
    </div>`;

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "Capittal <samuel@capittal.es>",
      replyTo: "info@capittal.es",
      to: INTERNAL_TEAM,
      subject: `📋 Resumen diario: ${totalValuations || 0} valoraciones, ${newLeads || 0} leads - ${yesterday.toLocaleDateString("es-ES")}`,
      html,
    });

    if (emailError) {
      log("error", "EMAIL_ERROR", { error: emailError });
      throw new Error(`Email send failed: ${JSON.stringify(emailError)}`);
    }

    log("info", "REPORT_SENT", {
      messageId: emailResult?.id,
      metrics: { totalValuations, completedValuations, advisorValuations, newLeads, emailsSent, newBookings, blogPosts, notificationsSent },
    });

    return new Response(
      JSON.stringify({ success: true, metrics: { totalValuations, completedValuations, newLeads, emailsSent } }),
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

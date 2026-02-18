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

const log = (level: string, event: string, data: object = {}) => {
  const entry = { timestamp: new Date().toISOString(), function: "run-alerts-cron", level, event, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("info", "ALERTS_STARTED");

    // Get active buyer preferences
    const { data: preferences, error: prefsError } = await supabase
      .from("buyer_preferences")
      .select("*")
      .eq("is_active", true);

    if (prefsError) throw prefsError;

    log("info", "PREFERENCES_LOADED", { count: preferences?.length || 0 });

    let totalMatches = 0;
    let emailsSent = 0;

    for (const pref of preferences || []) {
      try {
        // Look for operations from last 24h
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        let query = supabase
          .from("company_operations")
          .select("id, company_name, sector, location, valuation_amount, description, created_at")
          .eq("is_active", true)
          .gte("created_at", oneDayAgo.toISOString());

        if (pref.preferred_sectors?.length > 0) {
          query = query.in("sector", pref.preferred_sectors);
        }
        if (pref.preferred_locations?.length > 0) {
          query = query.overlaps("display_locations", pref.preferred_locations);
        }
        if (pref.min_valuation) {
          query = query.gte("valuation_amount", pref.min_valuation);
        }
        if (pref.max_valuation) {
          query = query.lte("valuation_amount", pref.max_valuation);
        }

        const { data: matchingOps, error: opsError } = await query;

        if (opsError) {
          log("error", "QUERY_ERROR", { userId: pref.user_id, error: opsError.message });
          continue;
        }

        if (!matchingOps || matchingOps.length === 0) continue;

        totalMatches += matchingOps.length;

        // Build alert email
        const opsRows = matchingOps
          .map(
            (op: any) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #f0f0f0">${op.company_name || "Confidencial"}</td>
            <td style="padding:8px;border-bottom:1px solid #f0f0f0">${op.sector || "-"}</td>
            <td style="padding:8px;border-bottom:1px solid #f0f0f0">${op.location || "-"}</td>
            <td style="padding:8px;border-bottom:1px solid #f0f0f0">${op.valuation_amount ? `${(op.valuation_amount / 1000000).toFixed(1)}M€` : "-"}</td>
          </tr>`
          )
          .join("");

        const html = `
        <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:20px">
          <h2 style="color:#0f172a">🔔 Nuevas operaciones que coinciden con tus preferencias</h2>
          <p style="color:#64748b">Se han encontrado <strong>${matchingOps.length}</strong> operaciones nuevas en las últimas 24 horas.</p>
          
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <thead>
              <tr style="background:#f8fafc">
                <th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0">Empresa</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0">Sector</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0">Ubicación</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0">Valoración</th>
              </tr>
            </thead>
            <tbody>${opsRows}</tbody>
          </table>

          <p style="margin-top:20px">
            <a href="https://capittal.es/marketplace" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">Ver operaciones</a>
          </p>

          <p style="color:#94a3b8;font-size:12px;margin-top:24px">
            Alerta automática de Capittal · Para modificar tus preferencias, accede a tu perfil.
          </p>
        </div>`;

        if (pref.email) {
          const { error: emailError } = await resend.emails.send({
            from: "Capittal <samuel@capittal.es>",
            replyTo: "info@capittal.es",
            to: [pref.email],
            subject: `🔔 ${matchingOps.length} nuevas operaciones coinciden con tu búsqueda`,
            html,
          });

          if (emailError) {
            log("error", "EMAIL_ERROR", { email: pref.email, error: emailError });
          } else {
            emailsSent++;
            log("info", "ALERT_SENT", { email: pref.email, matches: matchingOps.length });
          }
        }
      } catch (prefError) {
        log("error", "PREF_ERROR", { userId: pref.user_id, error: prefError.message });
      }
    }

    log("info", "ALERTS_COMPLETED", { preferences: preferences?.length || 0, totalMatches, emailsSent });

    return new Response(
      JSON.stringify({ success: true, processed: preferences?.length || 0, totalMatches, emailsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    log("error", "ALERTS_FAILED", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RECIPIENTS = [
  "samuel@capittal.es",
  "lluis@capittal.es",
  "oriol@capittal.es",
  "marcc@capittal.es",
];

const log = (level: string, event: string, data: object = {}) => {
  const entry = { timestamp: new Date().toISOString(), function: "send-outbound-report", level, event, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
};

// ─── Date helpers ───────────────────────────────────────────────
function getYesterdayRange(): { from: string; to: string; label: string } {
  const now = new Date();
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const from = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0).toISOString();
  const to = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999).toISOString();
  const label = y.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  return { from, to, label };
}

function getWeekRange(): { from: string; to: string; label: string } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1; // distance to Monday
  const monday = new Date(now);
  monday.setDate(monday.getDate() - diff);
  const from = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0).toISOString();
  const to = now.toISOString();
  const monLabel = monday.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const nowLabel = now.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const label = `Semana: ${monLabel} → ${nowLabel}`;
  return { from, to, label };
}

function getMonthRange(): { from: string; to: string; label: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).toISOString();
  const to = now.toISOString();
  const monthName = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  return { from, to, label: `Mes: ${monthName}` };
}

// ─── KPI calculation ────────────────────────────────────────────
interface RawEmail {
  campaign_id: string;
  status: string;
  delivery_status: string;
  email_opened: boolean;
  sent_at: string | null;
  company_id: string | null;
}

interface RawCompany {
  campaign_id: string;
  seguimiento_estado: string | null;
  seguimiento_notas: string | null;
  client_company: string | null;
  id: string;
}

interface Campaign {
  id: string;
  name: string;
  sector: string | null;
  total_companies: number;
}

interface PeriodKPIs {
  label: string;
  empresas: number;
  enviados: number;
  entregados: number;
  rebotados: number;
  abiertos: number;
  tasaApertura: number;
  sinRespuesta: number;
  interesados: number;
  reuniones: number;
  noInteresados: number;
  contestados: number;
  tasaContestacion: number;
  campaigns: Array<{
    name: string;
    sector: string | null;
    empresas: number;
    enviados: number;
    abiertos: number;
    tasa: number;
    contestados: number;
    interesados: number;
    reuniones: number;
    noInteresados: number;
  }>;
}

function calcKPIs(
  from: string,
  to: string,
  label: string,
  campaigns: Campaign[],
  emails: RawEmail[],
  companies: RawCompany[],
): PeriodKPIs {
  const fromD = new Date(from);
  const toD = new Date(to);

  // Filter emails in date range
  const filtered = emails.filter(e => {
    if (!e.sent_at) return false;
    const d = new Date(e.sent_at);
    return d >= fromD && d <= toD;
  });

  // Active company IDs
  const activeIds = new Set<string>();
  for (const e of filtered) {
    if (e.company_id) activeIds.add(e.company_id);
  }

  let totalSent = 0, totalDelivered = 0, totalBounced = 0, totalOpened = 0;
  let sinRespuesta = 0, interesados = 0, reuniones = 0, noInteresados = 0;
  let totalEmpresas = 0;

  const campaignBreakdown = campaigns.map(c => {
    const cEmails = filtered.filter(e => e.campaign_id === c.id);
    const sent = cEmails.filter(e => e.status === 'sent').length;
    const delivered = cEmails.filter(e => e.delivery_status === 'delivered').length;
    const bounced = cEmails.filter(e => e.delivery_status === 'bounced').length;
    const opened = cEmails.filter(e => e.email_opened).length;

    const cCompanyIds = new Set<string>();
    for (const e of cEmails) {
      if (e.company_id) cCompanyIds.add(e.company_id);
    }
    const empresas = cCompanyIds.size;

    const cCompanies = companies.filter(
      co => co.campaign_id === c.id && activeIds.has(co.id)
    );
    let cSR = 0, cI = 0, cR = 0, cNI = 0;
    for (const co of cCompanies) {
      const estado = co.seguimiento_estado || 'sin_respuesta';
      if (estado === 'interesado') cI++;
      else if (estado === 'reunion_agendada') cR++;
      else if (estado === 'no_interesado') cNI++;
      else cSR++;
    }

    totalSent += sent;
    totalDelivered += delivered;
    totalBounced += bounced;
    totalOpened += opened;
    totalEmpresas += empresas;
    sinRespuesta += cSR;
    interesados += cI;
    reuniones += cR;
    noInteresados += cNI;

    const contestados = cI + cR + cNI;
    return {
      name: c.name,
      sector: c.sector,
      empresas,
      enviados: sent,
      abiertos: opened,
      tasa: sent > 0 ? (opened / sent) * 100 : 0,
      contestados,
      interesados: cI,
      reuniones: cR,
      noInteresados: cNI,
    };
  }).filter(c => c.enviados > 0); // Only show campaigns with activity

  const contestados = interesados + reuniones + noInteresados;

  return {
    label,
    empresas: totalEmpresas,
    enviados: totalSent,
    entregados: totalDelivered,
    rebotados: totalBounced,
    abiertos: totalOpened,
    tasaApertura: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    sinRespuesta,
    interesados,
    reuniones,
    noInteresados,
    contestados,
    tasaContestacion: totalSent > 0 ? (contestados / totalSent) * 100 : 0,
    campaigns: campaignBreakdown,
  };
}

// ─── HTML generation ────────────────────────────────────────────
function renderKPISection(kpis: PeriodKPIs): string {
  const fmt = (n: number) => n.toLocaleString("es-ES");
  const pct = (n: number) => n.toFixed(1) + "%";

  const kpiCards = [
    { icon: "🏢", label: "Empresas", value: fmt(kpis.empresas) },
    { icon: "📧", label: "Enviados", value: fmt(kpis.enviados) },
    { icon: "✅", label: "Entregados", value: fmt(kpis.entregados) },
    { icon: "❌", label: "Rebotados", value: fmt(kpis.rebotados) },
    { icon: "👁️", label: "Abiertos", value: fmt(kpis.abiertos) },
    { icon: "📊", label: "Tasa Apertura", value: pct(kpis.tasaApertura) },
    { icon: "💬", label: "Contestados", value: `${fmt(kpis.contestados)} (${pct(kpis.tasaContestacion)})` },
  ];

  const funnelItems = [
    { icon: "⏳", label: "Sin respuesta", value: fmt(kpis.sinRespuesta), color: "#94a3b8" },
    { icon: "👍", label: "Interesados", value: fmt(kpis.interesados), color: "#3b82f6" },
    { icon: "📅", label: "Reuniones", value: fmt(kpis.reuniones), color: "#10b981" },
    { icon: "👎", label: "No interesados", value: fmt(kpis.noInteresados), color: "#ef4444" },
  ];

  const kpiCardsHtml = kpiCards.map(k => `
    <td style="padding:8px 6px;text-align:center;background:#f8fafc;border-radius:6px">
      <div style="font-size:12px;color:#64748b">${k.icon} ${k.label}</div>
      <div style="font-size:18px;font-weight:bold;color:#0f172a;margin-top:2px">${k.value}</div>
    </td>
  `).join('');

  const funnelHtml = funnelItems.map(f => `
    <td style="padding:8px 6px;text-align:center;border-left:3px solid ${f.color};background:#fafafa;border-radius:4px">
      <div style="font-size:11px;color:${f.color}">${f.icon} ${f.label}</div>
      <div style="font-size:16px;font-weight:bold;color:#0f172a">${f.value}</div>
    </td>
  `).join('');

  // Campaign breakdown table
  let campaignTableHtml = '';
  if (kpis.campaigns.length > 0) {
    const rows = kpis.campaigns.map(c => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:12px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:11px;color:#64748b">${c.sector || '—'}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px">${c.empresas}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px">${c.enviados}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px">${c.abiertos}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px">${pct(c.tasa)}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;font-weight:bold">${c.contestados}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#3b82f6">${c.interesados}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#10b981">${c.reuniones}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#ef4444">${c.noInteresados}</td>
      </tr>
    `).join('');

    campaignTableHtml = `
    <table style="width:100%;border-collapse:collapse;margin-top:12px;font-family:'Plus Jakarta Sans',Arial,sans-serif">
      <thead>
        <tr style="background:#f1f5f9">
          <th style="text-align:left;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">Campaña</th>
          <th style="text-align:left;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">Sector</th>
          <th style="text-align:center;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">Emp.</th>
          <th style="text-align:center;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">Env.</th>
          <th style="text-align:center;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">Abiert.</th>
          <th style="text-align:center;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">Tasa</th>
          <th style="text-align:center;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">Contest.</th>
          <th style="text-align:center;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">Inter.</th>
          <th style="text-align:center;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">Reun.</th>
          <th style="text-align:center;padding:8px;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0">No int.</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  return `
  <div style="margin-bottom:32px">
    <h3 style="color:#0f172a;font-size:16px;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #e2e8f0">${kpis.label}</h3>
    
    <table style="width:100%;border-collapse:separate;border-spacing:6px 0"><tr>${kpiCardsHtml}</tr></table>
    
    <div style="margin-top:12px">
      <table style="width:100%;border-collapse:separate;border-spacing:6px 0"><tr>${funnelHtml}</tr></table>
    </div>

    ${campaignTableHtml}
  </div>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("info", "REPORT_STARTED");

    // 1. Fetch all campaigns
    const { data: campaigns, error: campErr } = await supabase
      .from("valuation_campaigns")
      .select("id, name, sector, total_companies")
      .order("created_at", { ascending: false });

    if (campErr) throw new Error(`Campaigns query failed: ${campErr.message}`);
    if (!campaigns?.length) {
      log("info", "NO_CAMPAIGNS");
      return new Response(JSON.stringify({ success: true, message: "No campaigns found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ids = campaigns.map((c: any) => c.id);

    // 2. Fetch all emails and companies
    const [{ data: emails, error: emailErr }, { data: companies, error: compErr }] = await Promise.all([
      supabase
        .from("campaign_emails")
        .select("campaign_id, status, delivery_status, email_opened, sent_at, company_id")
        .in("campaign_id", ids),
      supabase
        .from("valuation_campaign_companies")
        .select("campaign_id, seguimiento_estado, seguimiento_notas, client_company, id")
        .in("campaign_id", ids),
    ]);

    if (emailErr) throw new Error(`Emails query failed: ${emailErr.message}`);
    if (compErr) throw new Error(`Companies query failed: ${compErr.message}`);

    const allEmails = (emails || []) as RawEmail[];
    const allCompanies = (companies || []) as RawCompany[];
    const allCampaigns = campaigns as Campaign[];

    // 3. Calculate KPIs for all 4 periods
    const yesterday = getYesterdayRange();
    const week = getWeekRange();
    const month = getMonthRange();

    const yesterdayKPIs = calcKPIs(yesterday.from, yesterday.to, `📅 Ayer — ${yesterday.label}`, allCampaigns, allEmails, allCompanies);
    const weekKPIs = calcKPIs(week.from, week.to, `📆 ${week.label}`, allCampaigns, allEmails, allCompanies);
    const monthKPIs = calcKPIs(month.from, month.to, `📆 ${month.label}`, allCampaigns, allEmails, allCompanies);

    // Global: use extreme date range to include everything
    const globalFrom = "2020-01-01T00:00:00.000Z";
    const globalTo = new Date().toISOString();
    const globalKPIs = calcKPIs(globalFrom, globalTo, "🌐 Global (histórico)", allCampaigns, allEmails, allCompanies);

    // 4. Build HTML
    const now = new Date();
    const dateTitle = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;background:#ffffff">
      <div style="text-align:center;margin-bottom:24px">
        <h2 style="color:#0f172a;margin:0 0 4px;font-size:20px">📊 Informe Outbound</h2>
        <p style="color:#64748b;margin:0;font-size:13px">${dateTitle}</p>
      </div>

      ${renderKPISection(yesterdayKPIs)}
      ${renderKPISection(weekKPIs)}
      ${renderKPISection(monthKPIs)}
      ${renderKPISection(globalKPIs)}

      ${renderRespondedCompaniesTable(allCompanies, allCampaigns)}

      <p style="color:#94a3b8;font-size:11px;margin-top:32px;text-align:center;border-top:1px solid #f0f0f0;padding-top:16px">
        Reporte automático generado por Capittal · ${now.toISOString()}
      </p>
    </div>`;

    // 5. Send email
    const subjectParts = [];
    if (yesterdayKPIs.enviados > 0) subjectParts.push(`Ayer: ${yesterdayKPIs.enviados} env.`);
    if (weekKPIs.enviados > 0) subjectParts.push(`Semana: ${weekKPIs.enviados} env.`);
    const subjectDetail = subjectParts.length > 0 ? subjectParts.join(" · ") : "Sin actividad";

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "Capittal <samuel@capittal.es>",
      replyTo: "samuel@capittal.es",
      to: RECIPIENTS,
      subject: `📊 Outbound: ${subjectDetail} — ${now.toLocaleDateString("es-ES")}`,
      html,
    });

    if (emailError) {
      log("error", "EMAIL_ERROR", { error: emailError });
      throw new Error(`Email send failed: ${JSON.stringify(emailError)}`);
    }

    log("info", "REPORT_SENT", {
      messageId: emailResult?.id,
      yesterday: { enviados: yesterdayKPIs.enviados, abiertos: yesterdayKPIs.abiertos, contestados: yesterdayKPIs.contestados },
      week: { enviados: weekKPIs.enviados, abiertos: weekKPIs.abiertos, contestados: weekKPIs.contestados },
      month: { enviados: monthKPIs.enviados, abiertos: monthKPIs.abiertos, contestados: monthKPIs.contestados },
      global: { enviados: globalKPIs.enviados, abiertos: globalKPIs.abiertos, contestados: globalKPIs.contestados },
    });

    return new Response(
      JSON.stringify({
        success: true,
        yesterday: { enviados: yesterdayKPIs.enviados, empresas: yesterdayKPIs.empresas, contestados: yesterdayKPIs.contestados },
        week: { enviados: weekKPIs.enviados, empresas: weekKPIs.empresas, contestados: weekKPIs.contestados },
        month: { enviados: monthKPIs.enviados, empresas: monthKPIs.empresas, contestados: monthKPIs.contestados },
        global: { enviados: globalKPIs.enviados, empresas: globalKPIs.empresas, contestados: globalKPIs.contestados },
      }),
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

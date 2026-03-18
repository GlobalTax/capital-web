import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";
import autoTable from "https://esm.sh/jspdf-autotable@3.8.4";

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
  const entry = { timestamp: new Date().toISOString(), function: "send-weekly-outbound-pdf", level, event, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
};

// ─── Colors ─────────────────────────────────────────────────────
const COLORS = {
  primary: [15, 23, 42] as [number, number, number],       // slate-900
  secondary: [100, 116, 139] as [number, number, number],   // slate-500
  accent: [59, 130, 246] as [number, number, number],       // blue-500
  green: [16, 185, 129] as [number, number, number],        // emerald-500
  red: [239, 68, 68] as [number, number, number],           // red-500
  amber: [245, 158, 11] as [number, number, number],        // amber-500
  headerBg: [241, 245, 249] as [number, number, number],    // slate-100
  lightBg: [248, 250, 252] as [number, number, number],     // slate-50
  border: [226, 232, 240] as [number, number, number],      // slate-200
  white: [255, 255, 255] as [number, number, number],
};

// ─── Date helpers ───────────────────────────────────────────────
function getWeekRange(offsetWeeks = 0): { from: string; to: string; fromDate: Date; toDate: Date } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(monday.getDate() - diff - (offsetWeeks * 7));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const from = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0);
  const to = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999);

  return { from: from.toISOString(), to: to.toISOString(), fromDate: from, toDate: to };
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Interfaces ─────────────────────────────────────────────────
interface Campaign { id: string; name: string; sector: string | null; total_companies: number; }
interface RawEmail { campaign_id: string; status: string; delivery_status: string; email_opened: boolean; sent_at: string | null; company_id: string | null; }
interface RawCompany { campaign_id: string; seguimiento_estado: string | null; seguimiento_notas: string | null; client_company: string | null; id: string; }
interface FollowupSend { campaign_id: string; company_id: string; sequence_id: string; status: string | null; delivery_status: string | null; email_opened: boolean | null; sent_at: string | null; seguimiento_estado: string | null; }
interface FollowupSequence { id: string; campaign_id: string; sequence_number: number; label: string; }
interface Interaction { id: string; campaign_company_id: string; tipo: string; titulo: string; descripcion: string | null; resultado: string | null; fecha: string; }

interface PeriodKPIs {
  empresas: number; enviados: number; entregados: number; rebotados: number;
  abiertos: number; tasaApertura: number; contestados: number; tasaContestacion: number;
  interesados: number; reuniones: number; noInteresados: number;
}

// ─── KPI calculation ────────────────────────────────────────────
function calcKPIs(from: string, to: string, campaigns: Campaign[], emails: RawEmail[], companies: RawCompany[]): PeriodKPIs {
  const fromD = new Date(from), toD = new Date(to);
  const filtered = emails.filter(e => { if (!e.sent_at) return false; const d = new Date(e.sent_at); return d >= fromD && d <= toD; });
  const activeIds = new Set<string>();
  for (const e of filtered) { if (e.company_id) activeIds.add(e.company_id); }

  let totalSent = 0, totalDelivered = 0, totalBounced = 0, totalOpened = 0;
  let interesados = 0, reuniones = 0, noInteresados = 0;

  for (const c of campaigns) {
    const cEmails = filtered.filter(e => e.campaign_id === c.id);
    totalSent += cEmails.filter(e => e.status === 'sent').length;
    totalDelivered += cEmails.filter(e => e.delivery_status === 'delivered').length;
    totalBounced += cEmails.filter(e => e.delivery_status === 'bounced').length;
    totalOpened += cEmails.filter(e => e.email_opened).length;

    const cCompanies = companies.filter(co => co.campaign_id === c.id && activeIds.has(co.id));
    for (const co of cCompanies) {
      const estado = co.seguimiento_estado || 'sin_respuesta';
      if (estado === 'interesado') interesados++;
      else if (estado === 'reunion_agendada') reuniones++;
      else if (estado === 'no_interesado') noInteresados++;
    }
  }

  const contestados = interesados + reuniones + noInteresados;
  return {
    empresas: activeIds.size, enviados: totalSent, entregados: totalDelivered, rebotados: totalBounced,
    abiertos: totalOpened, tasaApertura: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    contestados, tasaContestacion: totalSent > 0 ? (contestados / totalSent) * 100 : 0,
    interesados, reuniones, noInteresados,
  };
}

// ─── Campaign breakdown ─────────────────────────────────────────
function getCampaignBreakdown(from: string, to: string, campaigns: Campaign[], emails: RawEmail[], companies: RawCompany[]) {
  const fromD = new Date(from), toD = new Date(to);
  const filtered = emails.filter(e => { if (!e.sent_at) return false; const d = new Date(e.sent_at); return d >= fromD && d <= toD; });

  return campaigns.map(c => {
    const cEmails = filtered.filter(e => e.campaign_id === c.id);
    const sent = cEmails.filter(e => e.status === 'sent').length;
    if (sent === 0) return null;

    const opened = cEmails.filter(e => e.email_opened).length;
    const companyIds = new Set(cEmails.filter(e => e.company_id).map(e => e.company_id!));
    const cComps = companies.filter(co => co.campaign_id === c.id && companyIds.has(co.id));

    let int = 0, reun = 0, noInt = 0;
    for (const co of cComps) {
      const e = co.seguimiento_estado || 'sin_respuesta';
      if (e === 'interesado') int++;
      else if (e === 'reunion_agendada') reun++;
      else if (e === 'no_interesado') noInt++;
    }

    return {
      name: c.name, sector: c.sector || '—', empresas: companyIds.size,
      enviados: sent, abiertos: opened, tasa: (opened / sent * 100).toFixed(1) + '%',
      contestados: int + reun + noInt, interesados: int, reuniones: reun, noInteresados: noInt,
    };
  }).filter(Boolean);
}

// ─── PDF Generation ─────────────────────────────────────────────
function generatePDF(
  currentWeek: { from: string; to: string; fromDate: Date; toDate: Date },
  prevWeek: { from: string; to: string; fromDate: Date; toDate: Date },
  campaigns: Campaign[],
  emails: RawEmail[],
  companies: RawCompany[],
  followupSends: FollowupSend[],
  sequences: FollowupSequence[],
  interactions: Interaction[],
  companyMap: Map<string, { name: string; campaignName: string }>,
): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  const fmt = (n: number) => n.toLocaleString("es-ES");
  const pct = (n: number) => n.toFixed(1) + "%";

  const addPageIfNeeded = (neededSpace: number) => {
    if (y + neededSpace > 275) {
      doc.addPage();
      y = 20;
    }
  };

  // ─── COVER ───
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("CAPITTAL", pageWidth / 2, 25, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Informe Semanal Outbound", pageWidth / 2, 35, { align: "center" });
  doc.setFontSize(11);
  doc.text(`${formatDateFull(currentWeek.fromDate)} — ${formatDateFull(currentWeek.toDate)}`, pageWidth / 2, 45, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Generado: ${new Date().toLocaleString("es-ES")}`, pageWidth / 2, 53, { align: "center" });

  y = 72;
  doc.setTextColor(...COLORS.primary);

  // ─── SECTION 1: KPIs GLOBALES ───
  const currentKPIs = calcKPIs(currentWeek.from, currentWeek.to, campaigns, emails, companies);
  const prevKPIs = calcKPIs(prevWeek.from, prevWeek.to, campaigns, emails, companies);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. KPIs Globales de la Semana", margin, y);
  y += 2;

  const delta = (curr: number, prev: number): string => {
    if (prev === 0) return curr > 0 ? "↑ nuevo" : "—";
    const d = ((curr - prev) / prev) * 100;
    return d > 0 ? `↑ ${d.toFixed(0)}%` : d < 0 ? `↓ ${Math.abs(d).toFixed(0)}%` : "= 0%";
  };

  const deltaColor = (curr: number, prev: number): [number, number, number] => {
    if (prev === 0) return curr > 0 ? COLORS.green : COLORS.secondary;
    return curr > prev ? COLORS.green : curr < prev ? COLORS.red : COLORS.secondary;
  };

  const kpiRows = [
    ["Empresas contactadas", fmt(currentKPIs.empresas), fmt(prevKPIs.empresas), delta(currentKPIs.empresas, prevKPIs.empresas)],
    ["Emails enviados", fmt(currentKPIs.enviados), fmt(prevKPIs.enviados), delta(currentKPIs.enviados, prevKPIs.enviados)],
    ["Entregados", fmt(currentKPIs.entregados), fmt(prevKPIs.entregados), delta(currentKPIs.entregados, prevKPIs.entregados)],
    ["Rebotados", fmt(currentKPIs.rebotados), fmt(prevKPIs.rebotados), delta(currentKPIs.rebotados, prevKPIs.rebotados)],
    ["Abiertos", fmt(currentKPIs.abiertos), fmt(prevKPIs.abiertos), delta(currentKPIs.abiertos, prevKPIs.abiertos)],
    ["Tasa de apertura", pct(currentKPIs.tasaApertura), pct(prevKPIs.tasaApertura), delta(currentKPIs.tasaApertura, prevKPIs.tasaApertura)],
    ["Contestados", fmt(currentKPIs.contestados), fmt(prevKPIs.contestados), delta(currentKPIs.contestados, prevKPIs.contestados)],
    ["Tasa contestación", pct(currentKPIs.tasaContestacion), pct(prevKPIs.tasaContestacion), delta(currentKPIs.tasaContestacion, prevKPIs.tasaContestacion)],
    ["Interesados", fmt(currentKPIs.interesados), fmt(prevKPIs.interesados), delta(currentKPIs.interesados, prevKPIs.interesados)],
    ["Reuniones", fmt(currentKPIs.reuniones), fmt(prevKPIs.reuniones), delta(currentKPIs.reuniones, prevKPIs.reuniones)],
    ["No interesados", fmt(currentKPIs.noInteresados), fmt(prevKPIs.noInteresados), delta(currentKPIs.noInteresados, prevKPIs.noInteresados)],
  ];

  autoTable(doc, {
    startY: y + 4,
    head: [["Métrica", "Esta semana", "Semana anterior", "Δ Variación"]],
    body: kpiRows,
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'left', cellWidth: 50, fontStyle: 'bold', fontSize: 9 },
      1: { halign: 'center', fontSize: 10, fontStyle: 'bold' },
      2: { halign: 'center', fontSize: 9, textColor: COLORS.secondary },
      3: { halign: 'center', fontSize: 9 },
    },
    styles: { cellPadding: 3, lineColor: COLORS.border, lineWidth: 0.3 },
    alternateRowStyles: { fillColor: COLORS.lightBg },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 3) {
        const row = kpiRows[data.row.index];
        if (!row) return;
        const text = row[3];
        if (text.startsWith('↑')) data.cell.styles.textColor = COLORS.green;
        else if (text.startsWith('↓')) data.cell.styles.textColor = COLORS.red;
        else data.cell.styles.textColor = COLORS.secondary;
      }
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ─── SECTION 2: DESGLOSE POR CAMPAÑA ───
  addPageIfNeeded(50);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("2. Desglose por Campaña", margin, y);
  y += 2;

  const campaignData = getCampaignBreakdown(currentWeek.from, currentWeek.to, campaigns, emails, companies);

  if (campaignData.length > 0) {
    autoTable(doc, {
      startY: y + 4,
      head: [["Campaña", "Sector", "Emp.", "Env.", "Abiert.", "Tasa", "Contest.", "Inter.", "Reun.", "No int."]],
      body: campaignData.map((c: any) => [c.name, c.sector, c.empresas, c.enviados, c.abiertos, c.tasa, c.contestados, c.interesados, c.reuniones, c.noInteresados]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'left', cellWidth: 38, fontSize: 7.5 },
        1: { halign: 'left', cellWidth: 25, fontSize: 7, textColor: COLORS.secondary },
        2: { halign: 'center', fontSize: 8 },
        3: { halign: 'center', fontSize: 8 },
        4: { halign: 'center', fontSize: 8 },
        5: { halign: 'center', fontSize: 8 },
        6: { halign: 'center', fontSize: 8, fontStyle: 'bold' },
        7: { halign: 'center', fontSize: 8, textColor: COLORS.accent },
        8: { halign: 'center', fontSize: 8, textColor: COLORS.green },
        9: { halign: 'center', fontSize: 8, textColor: COLORS.red },
      },
      styles: { cellPadding: 2.5, lineColor: COLORS.border, lineWidth: 0.3 },
      alternateRowStyles: { fillColor: COLORS.lightBg },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.secondary);
    doc.text("Sin actividad de campaña esta semana.", margin, y + 8);
    y += 18;
  }

  // ─── SECTION 3: FOLLOW-UPS ENVIADOS ───
  addPageIfNeeded(50);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("3. Follow-ups Enviados", margin, y);
  y += 2;

  const fromD = new Date(currentWeek.from), toD = new Date(currentWeek.to);
  const weekFollowups = followupSends.filter(f => {
    if (!f.sent_at) return false;
    const d = new Date(f.sent_at);
    return d >= fromD && d <= toD;
  });

  // Group by sequence
  const seqMap = new Map(sequences.map(s => [s.id, s]));
  const fuBySeq = new Map<string, FollowupSend[]>();
  for (const f of weekFollowups) {
    const arr = fuBySeq.get(f.sequence_id) || [];
    arr.push(f);
    fuBySeq.set(f.sequence_id, arr);
  }

  if (fuBySeq.size > 0) {
    const fuRows: any[] = [];
    for (const [seqId, sends] of fuBySeq) {
      const seq = seqMap.get(seqId);
      const label = seq ? `FU${seq.sequence_number} — ${seq.label}` : seqId;
      const sent = sends.filter(s => s.status === 'sent').length;
      const delivered = sends.filter(s => s.delivery_status === 'delivered').length;
      const opened = sends.filter(s => s.email_opened).length;
      const tasa = sent > 0 ? (opened / sent * 100).toFixed(1) + '%' : '0%';
      const responded = sends.filter(s => s.seguimiento_estado && s.seguimiento_estado !== 'sin_respuesta').length;
      fuRows.push([label, sent, delivered, opened, tasa, responded]);
    }

    autoTable(doc, {
      startY: y + 4,
      head: [["Ronda", "Enviados", "Entregados", "Abiertos", "Tasa Apert.", "Respondidos"]],
      body: fuRows,
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 8.5, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'left', cellWidth: 55, fontSize: 8.5 },
        1: { halign: 'center', fontSize: 9 },
        2: { halign: 'center', fontSize: 9 },
        3: { halign: 'center', fontSize: 9 },
        4: { halign: 'center', fontSize: 9, fontStyle: 'bold' },
        5: { halign: 'center', fontSize: 9, fontStyle: 'bold', textColor: COLORS.green },
      },
      styles: { cellPadding: 3, lineColor: COLORS.border, lineWidth: 0.3 },
      alternateRowStyles: { fillColor: COLORS.lightBg },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.secondary);
    doc.text("Sin follow-ups enviados esta semana.", margin, y + 8);
    y += 18;
  }

  // ─── SECTION 4: EMPRESAS CON RESPUESTA ───
  addPageIfNeeded(40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("4. Empresas con Respuesta", margin, y);
  y += 2;

  const responded = companies.filter(c => c.seguimiento_estado && c.seguimiento_estado !== 'sin_respuesta');
  const campaignNameMap = new Map(campaigns.map(c => [c.id, c.name]));

  const estadoLabels: Record<string, string> = {
    interesado: 'Interesado',
    reunion_agendada: 'Reunion',
    no_interesado: 'No interesado',
    contactado: 'Contactado',
    en_negociacion: 'En negociacion',
  };

  const estadoColors: Record<string, [number, number, number]> = {
    interesado: [59, 130, 246],
    reunion_agendada: [34, 197, 94],
    no_interesado: [239, 68, 68],
    contactado: [249, 115, 22],
    en_negociacion: [139, 92, 246],
  };

  if (responded.length > 0) {
    const respRows = responded.map(c => [
      c.client_company || '—',
      campaignNameMap.get(c.campaign_id) || '—',
      estadoLabels[c.seguimiento_estado!] || c.seguimiento_estado,
      (c.seguimiento_notas || '—').substring(0, 60),
    ]);

    autoTable(doc, {
      startY: y + 4,
      head: [["Empresa", "Campaña", "Estado", "Notas"]],
      body: respRows,
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 8.5, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'left', cellWidth: 45, fontSize: 8, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 40, fontSize: 7.5, textColor: COLORS.secondary },
        2: { halign: 'center', cellWidth: 30, fontSize: 7.5 },
        3: { halign: 'left', fontSize: 7, textColor: COLORS.secondary },
      },
      styles: { cellPadding: 2.5, lineColor: COLORS.border, lineWidth: 0.3 },
      alternateRowStyles: { fillColor: COLORS.lightBg },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.secondary);
    doc.text("Sin empresas con respuesta registrada.", margin, y + 8);
    y += 18;
  }

  // ─── SECTION 5: INTERACCIONES REGISTRADAS ───
  addPageIfNeeded(40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("5. Interacciones Registradas (semana)", margin, y);
  y += 2;

  const weekInteractions = interactions.filter(i => {
    const d = new Date(i.fecha);
    return d >= fromD && d <= toD;
  });

  const tipoLabels: Record<string, string> = {
    email_followup: '📧 Email',
    llamada: '📞 Llamada',
    whatsapp: '💬 WhatsApp',
    reunion: '🤝 Reunión',
    respuesta_cliente: '💌 Respuesta',
    nota: '📝 Nota',
  };

  const resultLabels: Record<string, string> = {
    positivo: '✅ Positivo',
    neutral: '➖ Neutral',
    negativo: '❌ Negativo',
    sin_respuesta: '⏳ Sin resp.',
  };

  if (weekInteractions.length > 0) {
    const intRows = weekInteractions.map(i => {
      const info = companyMap.get(i.campaign_company_id);
      return [
        info?.name || '—',
        info?.campaignName || '—',
        tipoLabels[i.tipo] || i.tipo,
        i.titulo.substring(0, 40),
        resultLabels[i.resultado || ''] || (i.resultado || '—'),
        new Date(i.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
      ];
    });

    autoTable(doc, {
      startY: y + 4,
      head: [["Empresa", "Campaña", "Tipo", "Título", "Resultado", "Fecha"]],
      body: intRows,
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'left', cellWidth: 35, fontSize: 7.5, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 30, fontSize: 7, textColor: COLORS.secondary },
        2: { halign: 'center', cellWidth: 22, fontSize: 7 },
        3: { halign: 'left', cellWidth: 40, fontSize: 7 },
        4: { halign: 'center', cellWidth: 25, fontSize: 7 },
        5: { halign: 'center', cellWidth: 20, fontSize: 7.5 },
      },
      styles: { cellPadding: 2, lineColor: COLORS.border, lineWidth: 0.3 },
      alternateRowStyles: { fillColor: COLORS.lightBg },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.secondary);
    doc.text("Sin interacciones registradas esta semana.", margin, y + 8);
    y += 18;
  }

  // ─── SECTION 6: EVOLUCIÓN TEMPORAL ───
  addPageIfNeeded(50);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("6. Evolución Temporal (semana vs semana anterior)", margin, y);
  y += 2;

  const evoRows = [
    ["Emails enviados", fmt(currentKPIs.enviados), fmt(prevKPIs.enviados), delta(currentKPIs.enviados, prevKPIs.enviados)],
    ["Abiertos", fmt(currentKPIs.abiertos), fmt(prevKPIs.abiertos), delta(currentKPIs.abiertos, prevKPIs.abiertos)],
    ["Tasa apertura", pct(currentKPIs.tasaApertura), pct(prevKPIs.tasaApertura), delta(currentKPIs.tasaApertura, prevKPIs.tasaApertura)],
    ["Contestados", fmt(currentKPIs.contestados), fmt(prevKPIs.contestados), delta(currentKPIs.contestados, prevKPIs.contestados)],
    ["Tasa contestación", pct(currentKPIs.tasaContestacion), pct(prevKPIs.tasaContestacion), delta(currentKPIs.tasaContestacion, prevKPIs.tasaContestacion)],
    ["Interesados", fmt(currentKPIs.interesados), fmt(prevKPIs.interesados), delta(currentKPIs.interesados, prevKPIs.interesados)],
    ["Reuniones", fmt(currentKPIs.reuniones), fmt(prevKPIs.reuniones), delta(currentKPIs.reuniones, prevKPIs.reuniones)],
    ["Follow-ups enviados", fmt(weekFollowups.length), "—", "—"],
    ["Interacciones registradas", fmt(weekInteractions.length), "—", "—"],
  ];

  autoTable(doc, {
    startY: y + 4,
    head: [[
      "Métrica",
      `Semana actual (${formatDateShort(currentWeek.fromDate)}–${formatDateShort(currentWeek.toDate)})`,
      `Semana anterior (${formatDateShort(prevWeek.fromDate)}–${formatDateShort(prevWeek.toDate)})`,
      "Δ Variación",
    ]],
    body: evoRows,
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { halign: 'left', cellWidth: 42, fontSize: 9, fontStyle: 'bold' },
      1: { halign: 'center', fontSize: 10, fontStyle: 'bold' },
      2: { halign: 'center', fontSize: 9, textColor: COLORS.secondary },
      3: { halign: 'center', fontSize: 9 },
    },
    styles: { cellPadding: 3, lineColor: COLORS.border, lineWidth: 0.3 },
    alternateRowStyles: { fillColor: COLORS.lightBg },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 3) {
        const text = evoRows[data.row.index]?.[3] || '';
        if (text.startsWith('↑')) data.cell.styles.textColor = COLORS.green;
        else if (text.startsWith('↓')) data.cell.styles.textColor = COLORS.red;
        else data.cell.styles.textColor = COLORS.secondary;
      }
    },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 16;

  // ─── FOOTER ───
  addPageIfNeeded(20);
  doc.setDrawColor(...COLORS.border);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.secondary);
  doc.text("Reporte generado automáticamente por Capittal · Datos actualizados a " + new Date().toLocaleString("es-ES"), pageWidth / 2, y, { align: "center" });

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.secondary);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 290, { align: "right" });
  }

  return doc.output('arraybuffer') as unknown as Uint8Array;
}

// ─── Base64 conversion (chunked for large files) ────────────────
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 32768;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

// ─── Main handler ───────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("info", "WEEKLY_PDF_STARTED");

    const currentWeek = getWeekRange(0);
    const prevWeek = getWeekRange(1);

    // 1. Fetch campaigns
    const { data: campaigns, error: campErr } = await supabase
      .from("valuation_campaigns")
      .select("id, name, sector, total_companies")
      .order("created_at", { ascending: false });

    if (campErr) throw new Error(`Campaigns query failed: ${campErr.message}`);
    if (!campaigns?.length) {
      log("info", "NO_CAMPAIGNS");
      return new Response(JSON.stringify({ success: true, message: "No campaigns" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ids = campaigns.map((c: any) => c.id);

    // 2. Fetch all data in parallel
    const [
      { data: emails, error: emailErr },
      { data: companies, error: compErr },
      { data: followupSends, error: fuErr },
      { data: sequences, error: seqErr },
      { data: interactions, error: intErr },
    ] = await Promise.all([
      supabase.from("campaign_emails")
        .select("campaign_id, status, delivery_status, email_opened, sent_at, company_id")
        .in("campaign_id", ids),
      supabase.from("valuation_campaign_companies")
        .select("campaign_id, seguimiento_estado, seguimiento_notas, client_company, id")
        .in("campaign_id", ids),
      supabase.from("campaign_followup_sends")
        .select("campaign_id, company_id, sequence_id, status, delivery_status, email_opened, sent_at, seguimiento_estado")
        .in("campaign_id", ids),
      supabase.from("campaign_followup_sequences")
        .select("id, campaign_id, sequence_number, label")
        .in("campaign_id", ids)
        .order("sequence_number", { ascending: true }),
      supabase.from("campaign_company_interactions")
        .select("id, campaign_company_id, tipo, titulo, descripcion, resultado, fecha"),
    ]);

    if (emailErr) throw new Error(`Emails: ${emailErr.message}`);
    if (compErr) throw new Error(`Companies: ${compErr.message}`);
    if (fuErr) throw new Error(`Followups: ${fuErr.message}`);
    if (seqErr) throw new Error(`Sequences: ${seqErr.message}`);
    if (intErr) throw new Error(`Interactions: ${intErr.message}`);

    const allEmails = (emails || []) as RawEmail[];
    const allCompanies = (companies || []) as RawCompany[];
    const allFollowups = (followupSends || []) as FollowupSend[];
    const allSequences = (sequences || []) as FollowupSequence[];
    const allInteractions = (interactions || []) as Interaction[];
    const allCampaigns = campaigns as Campaign[];

    // Build company lookup map for interactions
    const companyMap = new Map<string, { name: string; campaignName: string }>();
    const campaignNameMap = new Map(allCampaigns.map(c => [c.id, c.name]));
    for (const co of allCompanies) {
      companyMap.set(co.id, {
        name: co.client_company || '—',
        campaignName: campaignNameMap.get(co.campaign_id) || '—',
      });
    }

    // 3. Generate PDF
    log("info", "GENERATING_PDF");
    const pdfBuffer = generatePDF(
      currentWeek, prevWeek, allCampaigns, allEmails, allCompanies,
      allFollowups, allSequences, allInteractions, companyMap,
    );
    const pdfBase64 = arrayBufferToBase64(pdfBuffer);

    // 4. Build email subject
    const currentKPIs = calcKPIs(currentWeek.from, currentWeek.to, allCampaigns, allEmails, allCompanies);
    const weekLabel = `${formatDateShort(currentWeek.fromDate)}–${formatDateShort(currentWeek.toDate)}`;
    const subject = `📊 Informe Semanal Outbound — ${weekLabel} | ${currentKPIs.enviados} env. · ${currentKPIs.abiertos} abiert. · ${currentKPIs.contestados} contest.`;

    // 5. Send email with PDF attachment
    const fileName = `Outbound_Semanal_${currentWeek.fromDate.toISOString().split('T')[0]}_${currentWeek.toDate.toISOString().split('T')[0]}.pdf`;

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "Capittal <samuel@capittal.es>",
      replyTo: "samuel@capittal.es",
      to: RECIPIENTS,
      subject,
      html: `
        <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#0f172a;font-size:18px;margin:0 0 8px">📊 Informe Semanal Outbound</h2>
          <p style="color:#64748b;margin:0 0 16px;font-size:14px">${formatDateFull(currentWeek.fromDate)} — ${formatDateFull(currentWeek.toDate)}</p>
          
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <tr>
              <td style="padding:12px;background:#f1f5f9;border-radius:8px;text-align:center;width:33%">
                <div style="font-size:24px;font-weight:bold;color:#0f172a">${currentKPIs.enviados}</div>
                <div style="font-size:12px;color:#64748b">Enviados</div>
              </td>
              <td style="width:8px"></td>
              <td style="padding:12px;background:#f1f5f9;border-radius:8px;text-align:center;width:33%">
                <div style="font-size:24px;font-weight:bold;color:#3b82f6">${currentKPIs.abiertos}</div>
                <div style="font-size:12px;color:#64748b">Abiertos (${(currentKPIs.tasaApertura).toFixed(0)}%)</div>
              </td>
              <td style="width:8px"></td>
              <td style="padding:12px;background:#f1f5f9;border-radius:8px;text-align:center;width:33%">
                <div style="font-size:24px;font-weight:bold;color:#10b981">${currentKPIs.contestados}</div>
                <div style="font-size:12px;color:#64748b">Contestados</div>
              </td>
            </tr>
          </table>

          <p style="color:#475569;font-size:13px;line-height:1.5">
            El informe detallado se encuentra adjunto en PDF con el desglose completo por campaña, 
            follow-ups, interacciones registradas y comparativa semanal.
          </p>

          <p style="color:#94a3b8;font-size:11px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px">
            Reporte automático generado por Capittal · ${new Date().toLocaleString("es-ES")}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          content_type: "application/pdf",
        },
      ],
    });

    if (emailError) {
      log("error", "EMAIL_ERROR", { error: emailError });
      throw new Error(`Email failed: ${JSON.stringify(emailError)}`);
    }

    log("info", "WEEKLY_PDF_SENT", {
      messageId: emailResult?.id,
      pdfSizeKB: Math.round(pdfBase64.length * 3 / 4 / 1024),
      kpis: { enviados: currentKPIs.enviados, abiertos: currentKPIs.abiertos, contestados: currentKPIs.contestados },
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResult?.id,
        pdfSizeKB: Math.round(pdfBase64.length * 3 / 4 / 1024),
        week: weekLabel,
        kpis: currentKPIs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    log("error", "WEEKLY_PDF_FAILED", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

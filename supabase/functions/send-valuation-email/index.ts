import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// STRUCTURED LOGGING HELPER
// =====================================================
const log = (level: 'info' | 'warn' | 'error', event: string, data: object = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    function: 'send-valuation-email',
    level,
    event,
    ...data
  };
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
};

// =====================================================
// EMAIL OUTBOX HELPERS
// =====================================================
interface OutboxEntry {
  id: string;
  valuation_id: string | null;
  valuation_type: 'standard' | 'professional';
  recipient_email: string;
  recipient_name?: string;
  email_type: 'client' | 'internal' | 'both';
  subject?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'retrying';
  attempts: number;
  max_attempts: number;
  provider_message_id?: string;
  last_error?: string;
  error_details?: object;
  metadata?: object;
}

async function createOutboxEntry(data: Partial<OutboxEntry>): Promise<string | null> {
  try {
    const { data: entry, error } = await supabase
      .from('email_outbox')
      .insert({
        valuation_id: data.valuation_id,
        valuation_type: data.valuation_type || 'standard',
        recipient_email: data.recipient_email,
        recipient_name: data.recipient_name,
        email_type: data.email_type || 'both',
        subject: data.subject,
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        metadata: data.metadata
      })
      .select('id')
      .single();
    
    if (error) {
      log('error', 'OUTBOX_CREATE_FAILED', { error: error.message });
      return null;
    }
    
    log('info', 'OUTBOX_ENTRY_CREATED', { outbox_id: entry.id });
    return entry.id;
  } catch (e: any) {
    log('error', 'OUTBOX_CREATE_EXCEPTION', { error: e?.message || e });
    return null;
  }
}

async function updateOutboxStatus(
  outboxId: string, 
  status: 'sending' | 'sent' | 'failed' | 'retrying',
  updates: Partial<OutboxEntry> = {}
): Promise<void> {
  try {
    const updateData: Record<string, any> = { 
      status,
      last_attempt_at: new Date().toISOString(),
      ...updates
    };
    
    if (status === 'sending' && !updates.first_attempt_at) {
      updateData.first_attempt_at = new Date().toISOString();
    }
    
    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString();
    }
    
    if (status === 'retrying' || status === 'failed') {
      // Exponential backoff: 1min, 2min, 4min
      const attempts = updates.attempts || 1;
      const delayMs = Math.pow(2, attempts - 1) * 60000;
      updateData.next_retry_at = new Date(Date.now() + delayMs).toISOString();
    }
    
    const { error } = await supabase
      .from('email_outbox')
      .update(updateData)
      .eq('id', outboxId);
    
    if (error) {
      log('warn', 'OUTBOX_UPDATE_FAILED', { outbox_id: outboxId, error: error.message });
    } else {
      log('info', 'OUTBOX_STATUS_UPDATED', { outbox_id: outboxId, status });
    }
  } catch (e: any) {
    log('error', 'OUTBOX_UPDATE_EXCEPTION', { outbox_id: outboxId, error: e?.message || e });
  }
}

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
  recipientEmail?: string;
  companyData: CompanyDataEmail;
  result: ValuationResultEmail & {
    revenueValuation?: number;
    revenueRange?: { min?: number; max?: number };
  };
  pdfBase64?: string;
  pdfFilename?: string;
  enlaces?: {
    pdfUrl?: string;
    escenariosUrl?: string;
    calculadoraFiscalUrl?: string;
  };
  sender?: {
    nombre?: string;
    cargo?: string;
    firma?: string;
  };
  subjectOverride?: string;
  pdfOnly?: boolean;
  lang?: 'es' | 'ca' | 'val' | 'gl';
  source?: 'advisor' | 'standard';
  sourceProject?: string;
  leadSource?: string;
  leadSourceDetail?: string;
  // NEW: For retry system
  isRetry?: boolean;
  outboxId?: string;
  valuationId?: string;
}

const euros = (n?: number | null, locale: string = "es-ES") =>
  typeof n === "number" && !isNaN(n) ? n.toLocaleString(locale, { style: "currency", currency: "EUR" }) : "-";

const pct = (n?: number | null) =>
  typeof n === "number" && !isNaN(n) ? `${n.toFixed(2)}%` : "-";

const sanitizeForFilename = (input: string): string => {
  try {
    let s = (input || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    s = s
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-.]+|[-.]+$/g, '');
    return s || 'documento';
  } catch (_) {
    return 'documento';
  }
};

const ensurePdfExtension = (name: string) =>
  name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;

const cleanPdfBase64 = (b64: string): string => {
  const trimmed = (b64 || '').trim();
  if (trimmed.toLowerCase().includes('base64,')) {
    return trimmed.substring(trimmed.indexOf(',') + 1);
  }
  return trimmed.replace(/^data:application\/pdf;base64,/, '');
};

const generateValuationPdfBase64 = async (
  companyData: CompanyDataEmail,
  result: ValuationResultEmail,
  locale: string,
  logoBytes?: Uint8Array | null
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const margin = 40;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - margin;
  const lineHeight = 18;
  const colorPrimary = rgb(0.106, 0.247, 0.675);

  const drawHeader = async () => {
    const title = "Informe de Valoración";
    page.drawText(title, { x: margin, y, size: 20, font: fontBold, color: colorPrimary });
    y -= lineHeight + 6;
    
    // Draw logo or text fallback
    if (logoBytes) {
      try {
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const logoHeight = 24;
        const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
        page.drawImage(logoImage, { x: margin, y: y - 4, width: logoWidth, height: logoHeight });
      } catch {
        page.drawText("Capittal", { x: margin, y, size: 12, font: fontBold, color: colorPrimary });
      }
    } else {
      page.drawText("Capittal", { x: margin, y, size: 12, font: fontBold, color: colorPrimary });
    }
    
    const date = new Date().toLocaleDateString(locale);
    const dateText = `Fecha: ${date}`;
    const dateWidth = font.widthOfTextAtSize(dateText, 10);
    page.drawText(dateText, { x: width - margin - dateWidth, y, size: 10, font });
    y -= lineHeight;
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, color: rgb(0.85, 0.89, 0.95), thickness: 1 });
    y -= lineHeight;
  };

  const drawSectionTitle = (text: string) => {
    page.drawText(text, { x: margin, y, size: 14, font: fontBold, color: colorPrimary });
    y -= lineHeight;
  };

  const drawKV = (k: string, v: string) => {
    page.drawText(k, { x: margin, y, size: 11, font: fontBold });
    page.drawText(v, { x: margin + 170, y, size: 11, font });
    y -= lineHeight;
  };

  await drawHeader();
  drawSectionTitle("Datos de la empresa");
  drawKV("Contacto:", companyData.contactName || "-");
  drawKV("Empresa:", companyData.companyName || "-");
  drawKV("Email:", companyData.email || "-");
  drawKV("Teléfono:", companyData.phone || "-");
  drawKV("Sector:", companyData.industry || "-");
  y -= 6;

  drawSectionTitle("Resultado de la valoración");
  drawKV("Valoración final:", euros(result?.finalValuation ?? result?.valuationRange?.min ?? null, locale));
  drawKV("Rango estimado:", `${euros(result?.valuationRange?.min, locale)} - ${euros(result?.valuationRange?.max, locale)}`);
  drawKV("EBITDA:", euros(companyData.ebitda ?? null, locale));
  drawKV("Múltiplo EBITDA usado:", `${result?.multiples?.ebitdaMultipleUsed ?? result?.ebitdaMultiple ?? "-"}x`);
  y -= lineHeight;

  const disclaimer =
    "Documento informativo y no vinculante. La valoración es orientativa y requiere un análisis más detallado.";
  page.drawText("Nota legal:", { x: margin, y, size: 11, font: fontBold });
  y -= lineHeight;
  page.drawText(disclaimer, { x: margin, y, size: 10, font, maxWidth: width - margin * 2, lineHeight: 12 });
  y -= 36;

  const addr1 = "Carrer Ausias March, 36 Principal";
  const addr2 = "P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid";
  page.drawText("Capittal · Oficinas:", { x: margin, y, size: 10, font: fontBold, color: colorPrimary });
  y -= lineHeight;
  page.drawText(`- ${addr1}`, { x: margin, y, size: 10, font });
  y -= lineHeight;
  page.drawText(`- ${addr2}`, { x: margin, y, size: 10, font });

  const base64 = await pdfDoc.saveAsBase64({ dataUri: false });
  return base64;
};

// =====================================================
// CONFIDENTIALITY COMMITMENT PDF GENERATOR
// =====================================================
const generateConfidentialityPdf = async (
  contactName: string,
  companyName: string,
  locale: string,
  logoBytes?: Uint8Array | null
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  const colorPrimary = rgb(0.106, 0.247, 0.675);
  const colorText = rgb(0.13, 0.13, 0.13);
  const colorGray = rgb(0.42, 0.42, 0.42);
  const margin = 50;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 16;
  
  const today = new Date();
  const dateStr = today.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Header - Logo or text fallback
  if (logoBytes) {
    try {
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoHeight = 30;
      const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
      page.drawImage(logoImage, { x: margin, y: y - logoHeight + 8, width: logoWidth, height: logoHeight });
      y -= logoHeight + 2;
    } catch {
      page.drawText('CAPITTAL', { x: margin, y, size: 22, font: fontBold, color: colorPrimary });
      y -= 20;
    }
  } else {
    page.drawText('CAPITTAL', { x: margin, y, size: 22, font: fontBold, color: colorPrimary });
    y -= 20;
  }
  page.drawText('Transacciones S.L.', { x: margin, y, size: 11, font, color: colorPrimary });
  y -= 10;
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, color: colorPrimary, thickness: 2 });
  y -= 30;

  // Title
  page.drawText('COMPROMISO DE CONFIDENCIALIDAD', { x: margin, y, size: 16, font: fontBold, color: colorPrimary });
  y -= 28;

  // Date and location
  page.drawText(`Barcelona, a ${dateStr}`, { x: margin, y, size: 10, font: fontItalic, color: colorGray });
  y -= 28;

  // Parties section
  page.drawText('PARTES', { x: margin, y, size: 12, font: fontBold, color: colorPrimary });
  y -= 18;
  
  const drawWrappedText = (text: string, x: number, yStart: number, fontSize: number, usedFont: any, maxWidth: number, lh: number): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = yStart;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (usedFont.widthOfTextAtSize(test, fontSize) > maxWidth && line) {
        page.drawText(line, { x, y: currentY, size: fontSize, font: usedFont, color: colorText });
        currentY -= lh;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      page.drawText(line, { x, y: currentY, size: fontSize, font: usedFont, color: colorText });
      currentY -= lh;
    }
    return currentY;
  };

  y = drawWrappedText(
    `De una parte, CAPITTAL TRANSACCIONES S.L. (en adelante, "Capittal"), con domicilio social en Carrer Ausias March, 36 Principal, 08010 Barcelona, representada a estos efectos por su equipo directivo.`,
    margin, y, 10, font, contentWidth, lineHeight
  );
  y -= 6;
  y = drawWrappedText(
    `De otra parte, ${contactName || 'el cliente'}${companyName ? `, en representación de ${companyName}` : ''} (en adelante, "el Cliente").`,
    margin, y, 10, font, contentWidth, lineHeight
  );
  y -= 20;

  // Object
  page.drawText('OBJETO', { x: margin, y, size: 12, font: fontBold, color: colorPrimary });
  y -= 18;
  y = drawWrappedText(
    'Mediante el presente documento, Capittal manifiesta su compromiso unilateral e irrevocable de mantener la más estricta confidencialidad sobre toda la información proporcionada por el Cliente, así como sobre cualquier dato, documento o comunicación intercambiada en el contexto de la valoración de su empresa y de cualquier servicio de asesoramiento que pudiera derivarse.',
    margin, y, 10, font, contentWidth, lineHeight
  );
  y -= 20;

  // Clauses
  page.drawText('COMPROMISOS', { x: margin, y, size: 12, font: fontBold, color: colorPrimary });
  y -= 18;

  const clauses = [
    ['1. Obligación de confidencialidad.', ' Capittal se compromete a tratar como estrictamente confidencial toda la información financiera, operativa, estratégica, comercial y personal que el Cliente comparta durante el proceso de valoración y asesoramiento.'],
    ['2. Uso exclusivo.', ' La información recibida será utilizada exclusivamente para evaluar la operación objeto de consulta y prestar los servicios profesionales solicitados, sin que pueda destinarse a ningún otro fin.'],
    ['3. No divulgación a terceros.', ' Capittal no revelará, divulgará ni comunicará la información confidencial a terceros sin el consentimiento previo y por escrito del Cliente, salvo requerimiento legal o judicial debidamente acreditado.'],
    ['4. Protección interna.', ' Dentro de la organización de Capittal, el acceso a la información confidencial quedará restringido exclusivamente al personal directamente involucrado en la operación, quienes estarán sujetos a las mismas obligaciones de confidencialidad.'],
    ['5. Devolución o destrucción.', ' En caso de que la operación no se materialice, Capittal procederá, a petición del Cliente, a la devolución o destrucción de toda la documentación recibida, certificando dicha acción por escrito.'],
    ['6. Duración.', ' Las obligaciones de confidencialidad aquí asumidas permanecerán vigentes durante un periodo de tres (3) años desde la fecha del presente documento, con independencia de que la relación profesional entre las partes finalice con anterioridad.'],
    ['7. Protección de datos personales.', ' Capittal tratará los datos personales del Cliente conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD). Los datos facilitados serán tratados con la finalidad exclusiva de prestar los servicios profesionales solicitados. El Cliente podrá ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición dirigiéndose a samuel@capittal.es. Para más información, puede consultar nuestra política de privacidad en capittal.es.'],
  ];

  for (const [bold, rest] of clauses) {
    const boldWidth = fontBold.widthOfTextAtSize(bold, 10);
    page.drawText(bold, { x: margin, y, size: 10, font: fontBold, color: colorText });
    
    // Draw rest as wrapped text starting after the bold part
    const firstLineRemaining = contentWidth - boldWidth;
    const restWords = rest.trim().split(' ');
    let line = '';
    let isFirstLine = true;
    
    for (const word of restWords) {
      const test = line ? `${line} ${word}` : word;
      const maxW = isFirstLine ? firstLineRemaining : contentWidth;
      if (font.widthOfTextAtSize(test, 10) > maxW && line) {
        const xPos = isFirstLine ? margin + boldWidth : margin;
        page.drawText(line, { x: xPos, y, size: 10, font, color: colorText });
        y -= lineHeight;
        isFirstLine = false;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      const xPos = isFirstLine ? margin + boldWidth : margin;
      page.drawText(line, { x: xPos, y, size: 10, font, color: colorText });
      y -= lineHeight;
    }
    y -= 4;
    
    // Check if we need a new page
    if (y < 120) {
      const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
      // We can't easily switch page context in this simple approach,
      // but with 6 clauses this shouldn't overflow a single page
    }
  }

  y -= 16;

  // Signature
  page.drawText('Firmado electrónicamente por:', { x: margin, y, size: 10, font: fontItalic, color: colorGray });
  y -= 18;
  page.drawText('CAPITTAL TRANSACCIONES S.L.', { x: margin, y, size: 11, font: fontBold, color: colorPrimary });
  y -= 16;
  page.drawText(`Fecha: ${dateStr}`, { x: margin, y, size: 10, font, color: colorGray });
  y -= 30;

  // Footer
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, color: rgb(0.85, 0.89, 0.95), thickness: 1 });
  y -= 14;
  page.drawText('Capittal · samuel@capittal.es · +34 695 717 490', { x: margin, y, size: 8, font, color: colorGray });
  y -= 12;
  page.drawText('Carrer Ausias March, 36 Principal, 08010 Barcelona', { x: margin, y, size: 8, font, color: colorGray });
  y -= 12;
  page.drawText('P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid', { x: margin, y, size: 8, font, color: colorGray });

  const base64 = await pdfDoc.saveAsBase64({ dataUri: false });
  return base64;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  let outboxId: string | null = null;

  try {
    log('info', 'REQUEST_RECEIVED', { method: req.method });
    
    const payload = (await req.json()) as SendValuationEmailRequest;
    const { recipientEmail, companyData, result, pdfBase64, pdfFilename, enlaces, sender, subjectOverride, lang, source } = payload;

    log('info', 'PAYLOAD_PARSED', { 
      email: companyData.email,
      company: companyData.companyName,
      isRetry: payload.isRetry || false,
      existingOutboxId: payload.outboxId
    });

    const localeMap: Record<string, string> = { es: 'es-ES', ca: 'ca-ES', val: 'ca-ES-valencia', gl: 'gl-ES' };
    const locale = localeMap[lang || 'es'] || 'es-ES';

    // Obtener destinatarios internos de email_recipients_config
    let internalRecipients: string[] = [];
    let internalBccRecipients: string[] = [];
    try {
      const { data: recipientsData, error: recipientsError } = await supabase
        .from('email_recipients_config')
        .select('email, is_bcc')
        .eq('is_active', true)
        .eq('is_default_copy', true);
      
      if (recipientsError) {
        log('warn', 'RECIPIENTS_DB_ERROR', { error: recipientsError.message });
      }
      
      if (recipientsData && recipientsData.length > 0) {
        internalRecipients = recipientsData.filter((r: any) => !r.is_bcc).map((r: any) => r.email);
        internalBccRecipients = recipientsData.filter((r: any) => r.is_bcc).map((r: any) => r.email);
        log('info', 'RECIPIENTS_LOADED', { cc: internalRecipients.length, bcc: internalBccRecipients.length });
      } else {
        internalRecipients = ['samuel@capittal.es'];
        log('warn', 'NO_RECIPIENTS_FOUND_USING_FALLBACK');
      }
    } catch (e: any) {
      log('error', 'RECIPIENTS_FETCH_EXCEPTION', { error: e?.message });
      internalRecipients = ['samuel@capittal.es'];
    }

    const leadEmail = companyData.email?.trim() || recipientEmail?.trim();

    if (leadEmail) {
      const leadInRecipients = internalRecipients.some(
        email => email.toLowerCase() === leadEmail.toLowerCase()
      );
      if (leadInRecipients) {
        log('warn', 'LEAD_IS_INTERNAL_RECIPIENT', { email: leadEmail });
        // Remove lead from CC list to avoid duplicate
        internalRecipients = internalRecipients.filter(
          email => email.toLowerCase() !== leadEmail.toLowerCase()
        );
      }
    }

    const isAdvisorCalculation = source === 'advisor' || (companyData.industry && (
      companyData.industry.includes('asesor') || 
      companyData.industry.includes('fiscal') ||
      companyData.industry.includes('contable')
    ));

    const isManualEntry = payload.sourceProject === 'manual-admin-entry';
    
    const LEAD_SOURCE_LABELS: Record<string, string> = {
      'meta-ads': 'Meta Ads (Facebook/Instagram)',
      'google-ads': 'Google Ads',
      'llamada-entrante': 'Llamada Entrante',
      'referido': 'Referido',
      'feria-evento': 'Feria / Evento',
      'linkedin': 'LinkedIn',
      'email-directo': 'Email Directo',
      'otro': 'Otro'
    };
    
    const leadSourceLabel = payload.leadSource 
      ? LEAD_SOURCE_LABELS[payload.leadSource] || payload.leadSource 
      : 'No especificado';

    const subject = isManualEntry
      ? `[ENTRADA MANUAL] Nueva valoración recibida - ${companyData.companyName || "Capittal"}`
      : isAdvisorCalculation 
        ? `Nueva valoración de asesoría - ${companyData.companyName || "Capittal"}`
        : `Nueva valoración recibida - ${companyData.companyName || "Capittal"}`;
    
    const fromName = isManualEntry ? 'Capittal (Manual)' : 'Capittal';

    // =====================================================
    // CREATE OUTBOX ENTRY BEFORE SENDING
    // =====================================================
    if (payload.outboxId) {
      outboxId = payload.outboxId;
      log('info', 'USING_EXISTING_OUTBOX', { outbox_id: outboxId });
    } else {
      outboxId = await createOutboxEntry({
        valuation_id: payload.valuationId || null,
        valuation_type: 'standard',
        recipient_email: leadEmail || 'internal-only',
        recipient_name: companyData.contactName,
        email_type: 'both',
        subject,
        metadata: {
          companyName: companyData.companyName,
          source: payload.sourceProject || source || 'unknown',
          leadSource: payload.leadSource,
          isManualEntry
        }
      });
    }

    if (outboxId) {
      await updateOutboxStatus(outboxId, 'sending', { attempts: (payload.isRetry ? 2 : 1) });
    }

    const manualEntryBlock = isManualEntry ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7; border:2px solid #f59e0b; border-radius:8px; margin-bottom:20px;">
        <tr>
          <td style="padding:16px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f59e0b; color:#ffffff; padding:6px 14px; border-radius:4px; font-weight:700; font-size:14px; font-family:Arial,sans-serif;">
                  ✍️ ENTRADA MANUAL
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
              <tr>
                <td style="padding:4px 0; color:#92400e; font-weight:600; font-family:Arial,sans-serif; width:140px;">Canal de origen:</td>
                <td style="padding:4px 0; color:#78350f; font-weight:700; font-family:Arial,sans-serif;">${leadSourceLabel}</td>
              </tr>
              ${payload.leadSourceDetail ? `
              <tr>
                <td style="padding:4px 0; color:#92400e; font-weight:600; font-family:Arial,sans-serif; width:140px;">Detalle:</td>
                <td style="padding:4px 0; color:#78350f; font-family:Arial,sans-serif;">${payload.leadSourceDetail}</td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
      </table>
    ` : '';

    const htmlInternal = `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background:#f8fafc;">
        <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:24px;">
          ${manualEntryBlock}
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
            <tr><td style="padding:6px 0; color:#374151;">Ingresos</td><td style="padding:6px 0; color:#111827; font-weight:600;">${euros(companyData.revenue, locale)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">EBITDA</td><td style="padding:6px 0; color:#111827; font-weight:600;">${euros(companyData.ebitda, locale)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Margen Neto</td><td style="padding:6px 0; color:#111827; font-weight:600;">${pct(companyData.netProfitMargin)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Crec. anual</td><td style="padding:6px 0; color:#111827; font-weight:600;">${pct(companyData.growthRate)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Ubicación</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.location || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Participación</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.ownershipParticipation || "-"}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Ventaja competitiva</td><td style="padding:6px 0; color:#111827; font-weight:600;">${companyData.competitiveAdvantage || "-"}</td></tr>
          </table>

          <h2 style="margin:16px 0 8px; color:#111827; font-size:16px;">Resultado de la valoración</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td style="padding:6px 0; color:#374151;">Valoración final (EBITDA)</td><td style="padding:6px 0; color:#111827; font-weight:700;">${euros(result?.finalValuation ?? result?.valuationRange?.min, locale)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Rango EBITDA</td><td style="padding:6px 0; color:#111827; font-weight:700;">${euros(result?.valuationRange?.min, locale)} - ${euros(result?.valuationRange?.max, locale)}</td></tr>
            <tr><td style="padding:6px 0; color:#374151;">Múltiplo EBITDA usado</td><td style="padding:6px 0; color:#111827; font-weight:600;">${result?.multiples?.ebitdaMultipleUsed ?? result?.ebitdaMultiple ?? "-"}x</td></tr>
            ${isAdvisorCalculation && result.revenueValuation ? `
              <tr><td colspan="2" style="padding:12px 0 6px; color:#111827; font-weight:700; border-top:1px solid #e5e7eb;">Valoración por Facturación</td></tr>
              <tr><td style="padding:6px 0; color:#374151;">Valoración (Facturación)</td><td style="padding:6px 0; color:#111827; font-weight:700;">${euros(result.revenueValuation, locale)}</td></tr>
              <tr><td style="padding:6px 0; color:#374151;">Rango Facturación</td><td style="padding:6px 0; color:#111827; font-weight:700;">${euros(result.revenueRange?.min, locale)} - ${euros(result.revenueRange?.max, locale)}</td></tr>
              <tr><td style="padding:6px 0; color:#374151;">Múltiplo Facturación</td><td style="padding:6px 0; color:#111827; font-weight:600;">${result?.multiples?.revenueMultipleUsed ?? "-"}x</td></tr>
            ` : ''}
          </table>

          <p style="margin:16px 0 0; color:#6b7280; font-size:12px;">Este correo se generó automáticamente desde la calculadora${isManualEntry ? ' (entrada manual)' : isAdvisorCalculation ? ' de asesores' : ''} de Capittal.</p>
          ${payload.leadSource === 'web' ? `
          <p style="margin:16px 0 0; padding:8px 12px; background:#e0f2fe; border-left:3px solid #0284c7; font-size:13px; color:#0c4a6e;">
            <strong>Origen:</strong> Web
          </p>
          ` : ''}
        </div>
      </div>
    `;

    // Download logo once for both PDFs
    let logoBytes: Uint8Array | null = null;
    try {
      const logoUrl = 'https://webcapittal.lovable.app/logotipo.png';
      const logoResp = await fetch(logoUrl);
      if (logoResp.ok) {
        logoBytes = new Uint8Array(await logoResp.arrayBuffer());
        log('info', 'LOGO_DOWNLOADED', { sizeBytes: logoBytes.length });
      } else {
        log('warn', 'LOGO_DOWNLOAD_FAILED', { status: logoResp.status });
      }
    } catch (logoErr: any) {
      log('warn', 'LOGO_DOWNLOAD_ERROR', { error: logoErr?.message || logoErr });
    }

    // Prepare PDF
    let pdfToAttach: string | null = (pdfBase64 && pdfBase64.trim().length > 0) ? pdfBase64.trim() : null;
    if (!pdfToAttach) {
      try {
        pdfToAttach = await generateValuationPdfBase64(companyData, result, locale, logoBytes);
      } catch (ePdf: any) {
        log('error', 'PDF_GENERATION_FAILED', { error: ePdf?.message || ePdf });
      }
    }
    const filename = pdfFilename || `Capittal-Valoracion-${(companyData.companyName || 'empresa').replaceAll(' ', '-')}.pdf`;

    // Upload PDF to storage
    let pdfPublicUrl: string | null = null;
    if (pdfToAttach) {
      try {
        const cleaned = cleanPdfBase64(pdfToAttach);
        const binary = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));
        const baseName = sanitizeForFilename(
          (pdfFilename && pdfFilename.replace(/\.pdf$/i, '')) || (companyData.companyName || 'empresa')
        );
        const fileName = ensurePdfExtension(`${Date.now()}-${baseName}`);
        const { data: up, error: upErr } = await supabase.storage
          .from('valuations')
          .upload(fileName, binary, { contentType: 'application/pdf', upsert: true });
        if (upErr) {
          log('error', 'PDF_UPLOAD_FAILED', { error: upErr.message });
        } else {
          const pub = supabase.storage.from('valuations').getPublicUrl(fileName);
          pdfPublicUrl = pub.data.publicUrl;
          log('info', 'PDF_UPLOADED', { fileName, publicUrl: pdfPublicUrl });
        }
      } catch (eUp: any) {
        log('error', 'PDF_UPLOAD_EXCEPTION', { error: eUp?.message || eUp });
      }
    }

    // PDF only mode
    if (payload.pdfOnly) {
      if (outboxId) {
        await updateOutboxStatus(outboxId, 'sent', { 
          provider_message_id: 'pdf-only',
          metadata: { pdfUrl: pdfPublicUrl }
        });
      }
      return new Response(
        JSON.stringify({ success: true, pdfUrl: pdfPublicUrl, filename }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const internalText = `Nueva valoración recibida - ${companyData.companyName || "Capittal"}\n` +
      `Contacto: ${companyData.contactName || "-"}\n` +
      `Email: ${companyData.email || "-"}\n` +
      `Teléfono: ${companyData.phone || "-"}\n` +
      `Ingresos: ${euros(companyData.revenue, locale)}\n` +
      `EBITDA: ${euros(companyData.ebitda, locale)}\n` +
      `Valoración final: ${euros(result?.finalValuation ?? result?.valuationRange?.min, locale)}\n` +
      `Rango: ${euros(result?.valuationRange?.min, locale)} - ${euros(result?.valuationRange?.max, locale)}\n` +
      (pdfPublicUrl ? `PDF: ${pdfPublicUrl}\n` : '') +
      `Calculadora de valoración - Capittal`;

    let emailResponse: any;
    
    log('info', 'SENDING_INTERNAL_EMAIL', {
      isManualEntry,
      sourceProject: payload.sourceProject,
      recipientCount: internalRecipients.length,
      leadEmail
    });
    
    try {
      emailResponse = await resend.emails.send({
        from: `${fromName} <samuel@capittal.es>`,
        to: internalRecipients,
        bcc: internalBccRecipients.length > 0 ? internalBccRecipients : undefined,
        subject,
        html: htmlInternal,
        text: internalText,
        reply_to: leadEmail || "samuel@capittal.es",
        headers: { 
          "List-Unsubscribe": "<mailto:samuel@capittal.es?subject=unsubscribe>, <https://capittal.es/unsubscribe>",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" 
        },
      });
      log('info', 'INTERNAL_EMAIL_SENT', { messageId: emailResponse?.data?.id });
    } catch (e: any) {
      log('warn', 'PRIMARY_SENDER_FAILED', { error: e?.message });
      emailResponse = await resend.emails.send({
        from: "Capittal (Test) <onboarding@resend.dev>",
        to: internalRecipients,
        bcc: internalBccRecipients.length > 0 ? internalBccRecipients : undefined,
        subject: `${subject} (pruebas)`,
        html: `${htmlInternal}\n<p style=\"margin-top:12px;color:#9ca3af;font-size:12px;\">Enviado con remitente de pruebas por dominio no verificado.</p>`,
        text: internalText,
        reply_to: leadEmail || "samuel@capittal.es",
        headers: { 
          "List-Unsubscribe": "<mailto:samuel@capittal.es?subject=unsubscribe>, <https://capittal.es/unsubscribe>",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" 
        },
      });
    }

    // Send client email
    if (companyData.email) {
      const userSubject = subjectOverride || `Valoración · PDF, escenarios y calculadora fiscal`;
      const saludo = companyData.contactName ? `Hola ${companyData.contactName},` : 'Hola,';
      const sector = companyData.industry || 'su sector';
      const nombre = sender?.nombre || 'Equipo Capittal';
      const cargo = sender?.cargo || 'M&A';
      const firma = sender?.firma || 'Capittal · Carrer Ausias March, 36 Principal · P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid';

      const pdfUrlFinal = (enlaces && enlaces.pdfUrl) || pdfPublicUrl || '';
      const enlacesUtiles = [
        pdfUrlFinal ? `<p style="margin:0 0 6px;"><strong>📄 Re-descargar el PDF:</strong> <a href="${pdfUrlFinal}" target="_blank" style="color:#1f2937; text-decoration:underline; font-weight:600;">Haga clic aquí</a></p>` : '',
        `<p style="margin:0 0 6px;"><strong>🔢 Volver a hacer la calculadora:</strong> <a href="https://capittal.es/lp/calculadora" target="_blank" style="color:#1f2937; text-decoration:underline; font-weight:600;">Acceder a la calculadora</a></p>`
      ].filter(Boolean).join('');

      const userText = `${saludo}\n` +
        `Gracias por completar el formulario de valoración de ${companyData.companyName || ''}.\n` +
        (pdfUrlFinal ? `Descargar PDF: ${pdfUrlFinal}\n` : '') +
        `Para cualquier duda, responda a este correo o escriba a info@capittal.es\n` +
        `\nUn saludo,\n${nombre} · ${cargo}\n${firma}`;

      const userHtml = `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background:#f8fafc;">
          <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:32px; color:#111827;">
            <p style="margin:0 0 16px; font-size:16px;">${saludo}</p>
            <p style="margin:0 0 16px; line-height:1.6;">Le escribimos desde el equipo de Capittal. Gracias por completar el formulario de valoración de <strong>${companyData.companyName || ''}</strong>.</p>
            <p style="margin:0 0 16px; line-height:1.6;">Su PDF ya se ha generado y pudo descargarlo en la pantalla de confirmación. Por si lo necesita de nuevo, puede volver a descargarlo desde el enlace más abajo.</p>

            <div style="background:#f3f4f6; border-radius:8px; padding:20px; margin:20px 0;">
              <p style="margin:0 0 12px; font-weight:600; color:#374151;">📊 En ese documento encontrará:</p>
              <ul style="margin:0 0 0 20px; padding:0; line-height:1.5;">
                <li style="margin:0 0 8px;">Una horquilla preliminar basada en comparables de <strong>${sector}</strong> y en el tamaño de la compañía.</li>
                <li style="margin:0 0 8px;">La metodología aplicada y los principales supuestos considerados.</li>
                <li style="margin:0;">Se trata de una valoración orientativa, dado que por el momento hemos tenido acceso a información limitada.</li>
              </ul>
            </div>

            <p style="margin:20px 0 16px; line-height:1.6;">Quedamos a su disposición para concertar una llamada y revisar las conclusiones (metodología, horquilla orientativa y próximos pasos).</p>
            <p style="margin:0 0 20px; line-height:1.6;">Si lo considera oportuno, indíquenos dos o tres opciones de horario y le remitiremos la invitación. Le recordamos que esta valoración es <strong>completamente confidencial</strong>.</p>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:20px; margin:20px 0;">
              <p style="margin:0; line-height:1.6; color:#1e40af;">
                <strong>🔒 Compromiso de Confidencialidad:</strong> Adjuntamos también nuestro Compromiso de Confidencialidad, que garantiza la protección absoluta de toda la información compartida durante este proceso. La confianza y discreción son pilares fundamentales de nuestro servicio.
              </p>
            </div>

            ${enlacesUtiles ? `<div style="background:#ecfdf5; border:1px solid #d1fae5; border-radius:8px; padding:20px; margin:20px 0;"><p style="margin:0 0 12px; font-weight:600; color:#065f46;">🔗 Enlaces útiles (guarde este correo):</p>${enlacesUtiles}</div>` : ''}

            <div style="background:#f8fafc; border-radius:8px; padding:20px; margin:24px 0;">
              <p style="margin:0 0 12px; font-weight:600; color:#374151;">🏢 Sobre Capittal</p>
              <ul style="margin:0 0 0 20px; padding:0; line-height:1.5;">
                <li style="margin:0 0 8px;">Equipo multidisciplinar de <strong>50 profesionales</strong> (M&A, fiscal y legal).</li>
                <li style="margin:0 0 8px;">Más de <strong>100 operaciones cerradas</strong> en 15 años.</li>
                <li style="margin:0;">Enfoque práctico y acompañamiento de principio a fin del proceso.</li>
              </ul>
            </div>

            <div style="border-top:1px solid #e5e7eb; padding-top:20px; margin-top:24px;">
              <p style="margin:0 0 8px; font-size:16px;">Un saludo,</p>
              <p style="margin:0 0 4px; font-weight:600; color:#1f2937;">${nombre} · ${cargo}</p>
              <p style="margin:0 0 20px; font-size:14px; color:#6b7280;">${firma}</p>
            </div>

            <div style="background:#fef2f2; border:2px solid #ef4444; border-radius:6px; padding:16px; margin:16px 0;">
              <p style="margin:0; font-size:14px; color:#991b1b; line-height:1.5;">
                <span style="font-size:20px; font-weight:bold;">*</span>
                <strong>Importante:</strong> Esta valoración <strong>NO incluye el valor de los inmuebles</strong> que la empresa pueda tener en su balance. Si la empresa es propietaria de bienes inmuebles, su valor debería añadirse a esta valoración de forma independiente.
              </p>
            </div>

            <div style="background:#fef3c7; border:1px solid #fbbf24; border-radius:6px; padding:16px; margin:20px 0;">
              <p style="margin:0; font-size:12px; color:#92400e; line-height:1.4;"><strong>⚖️ Nota legal:</strong> Este contenido es orientativo y no constituye una valoración u oferta vinculante. La valoración final puede variar tras el análisis completo de la documentación (estados financieros, deuda y ajustes de EBITDA).</p>
            </div>
          </div>
        </div>`;

      // =====================================================
      // GENERATE CONFIDENTIALITY PDF
      // =====================================================
      let confidentialityPdfBase64: string | null = null;
      const confidentialityFilename = `Capittal-Compromiso-Confidencialidad-${sanitizeForFilename(companyData.companyName || 'empresa')}.pdf`;
      
      try {
        log('info', 'CONFIDENTIALITY_PDF_GENERATE_START', { company: companyData.companyName });
        confidentialityPdfBase64 = await generateConfidentialityPdf(
          companyData.contactName || '',
          companyData.companyName || '',
          locale,
          logoBytes
        );
        log('info', 'CONFIDENTIALITY_PDF_GENERATED', { sizeBytes: confidentialityPdfBase64?.length || 0 });
        
        // Upload to storage
        try {
          const confBinary = Uint8Array.from(atob(confidentialityPdfBase64), (c) => c.charCodeAt(0));
          const confFileName = ensurePdfExtension(`${Date.now()}-confidencialidad-${sanitizeForFilename(companyData.companyName || 'empresa')}`);
          const { error: confUpErr } = await supabase.storage
            .from('valuations')
            .upload(confFileName, confBinary, { contentType: 'application/pdf', upsert: true });
          if (confUpErr) {
            log('warn', 'CONFIDENTIALITY_PDF_UPLOAD_FAILED', { error: confUpErr.message });
          } else {
            log('info', 'CONFIDENTIALITY_PDF_UPLOADED', { fileName: confFileName });
          }
        } catch (eConfUp: any) {
          log('warn', 'CONFIDENTIALITY_PDF_UPLOAD_EXCEPTION', { error: eConfUp?.message || eConfUp });
        }
      } catch (eConf: any) {
        log('warn', 'CONFIDENTIALITY_PDF_GENERATION_FAILED', { error: eConf?.message || eConf });
        // Continue without it - decoupled pattern
      }

      // Build attachments array
      const clientAttachments: Array<{ filename: string; content: string }> = [];
      if (pdfToAttach) {
        clientAttachments.push({ filename, content: cleanPdfBase64(pdfToAttach) });
      }
      if (confidentialityPdfBase64) {
        clientAttachments.push({ filename: confidentialityFilename, content: confidentialityPdfBase64 });
      }

      try {
        await resend.emails.send({
          from: "Capittal <samuel@capittal.es>",
          to: [companyData.email],
          subject: userSubject,
          html: userHtml,
          text: userText,
          reply_to: "samuel@capittal.es",
          headers: { 
            "List-Unsubscribe": "<mailto:samuel@capittal.es?subject=unsubscribe>, <https://capittal.es/unsubscribe>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" 
          },
          ...(clientAttachments.length > 0 ? { attachments: clientAttachments } : {}),
        });
        log('info', 'CLIENT_EMAIL_SENT', { recipient: companyData.email, attachmentCount: clientAttachments.length });
      } catch (e2: any) {
        log('warn', 'CLIENT_EMAIL_FALLBACK', { error: e2?.message });
        await resend.emails.send({
          from: "Capittal (Test) <onboarding@resend.dev>",
          to: [companyData.email],
          subject: `${userSubject} (pruebas)`,
          html: `${userHtml}\n<p style=\"margin-top:12px;color:#9ca3af;font-size:12px;\">Enviado con remitente de pruebas por dominio no verificado.</p>`,
          text: userText,
          reply_to: "samuel@capittal.es",
          headers: { 
            "List-Unsubscribe": "<mailto:samuel@capittal.es?subject=unsubscribe>, <https://capittal.es/unsubscribe>", 
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" 
          },
          ...(clientAttachments.length > 0 ? { attachments: clientAttachments } : {}),
        });
      }
    }

    // =====================================================
    // UPDATE OUTBOX AND VALUATION STATUS
    // =====================================================
    // CRITICAL: Validate provider response before marking as sent
    const emailSentSuccessfully = emailResponse?.data?.id && !emailResponse?.error;
    
    if (outboxId) {
      if (emailSentSuccessfully) {
        await updateOutboxStatus(outboxId, 'sent', {
          provider_message_id: emailResponse.data.id,
          provider_response: emailResponse
        });
        log('info', 'OUTBOX_MARKED_SENT', { outbox_id: outboxId, message_id: emailResponse.data.id });
      } else {
        // Provider returned error - mark as failed even though no exception was thrown
        const providerError = emailResponse?.error?.message || emailResponse?.error?.name || 'Provider returned error without message ID';
        await updateOutboxStatus(outboxId, 'failed', {
          last_error: providerError,
          error_details: { provider_response: emailResponse },
          provider_response: emailResponse
        });
        log('error', 'OUTBOX_MARKED_FAILED_PROVIDER_ERROR', { 
          outbox_id: outboxId, 
          error: providerError,
          response: emailResponse 
        });
      }
    }

    // Update email_sent by valuation ID (more robust than email) - ONLY if email was actually sent
    if (emailSentSuccessfully && payload.valuationId) {
      try {
        const { error: updateError } = await supabase
          .from('company_valuations')
          .update({ 
            email_sent: true, 
            email_sent_at: new Date().toISOString(),
            email_message_id: emailResponse?.data?.id || null,
            email_outbox_id: outboxId
          })
          .eq('id', payload.valuationId);
        
        if (updateError) {
          log('warn', 'VALUATION_UPDATE_BY_ID_FAILED', { id: payload.valuationId, error: updateError.message });
        } else {
          log('info', 'VALUATION_UPDATED_BY_ID', { id: payload.valuationId });
        }
      } catch (e: any) {
        log('warn', 'VALUATION_UPDATE_EXCEPTION', { error: e?.message });
      }
    } else if (emailSentSuccessfully && companyData.email) {
      // Fallback to email-based update
      try {
        const { error: updateError } = await supabase
          .from('company_valuations')
          .update({ 
            email_sent: true, 
            email_sent_at: new Date().toISOString(),
            email_message_id: emailResponse?.data?.id || null,
            email_outbox_id: outboxId
          })
          .eq('email', companyData.email)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (updateError) {
          log('warn', 'VALUATION_UPDATE_BY_EMAIL_FAILED', { email: companyData.email, error: updateError.message });
        } else {
          log('info', 'VALUATION_UPDATED_BY_EMAIL', { email: companyData.email });
        }
      } catch (e: any) {
        log('warn', 'VALUATION_UPDATE_EXCEPTION', { error: e?.message });
      }
    }

    log('info', 'EMAIL_FLOW_COMPLETED', {
      outboxId,
      messageId: emailResponse?.data?.id,
      pdfUrl: pdfPublicUrl,
      internalRecipients: internalRecipients.length,
      clientEmail: companyData.email
    });

    // Sync to CRM
    try {
      const syncPayload = {
        type: 'valuation_pdf',
        data: {
          pdf_url: pdfPublicUrl,
          company: companyData,
          result,
          source: 'send-valuation-email',
          timestamp: new Date().toISOString()
        }
      };
      await supabase.functions.invoke('sync-leads', { body: syncPayload });
    } catch (e) {
      log('warn', 'SYNC_LEADS_FAILED', { error: (e as any)?.message });
    }

    return new Response(
      JSON.stringify({ 
        success: emailSentSuccessfully, 
        emailId: emailResponse?.data?.id, 
        pdfUrl: pdfPublicUrl, 
        filename, 
        outboxId,
        // Include error info if provider failed silently
        ...(emailSentSuccessfully ? {} : { 
          warning: 'Email may not have been sent - provider did not return message ID',
          providerError: emailResponse?.error?.message || null
        })
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    log('error', 'EMAIL_FLOW_FAILED', { error: error?.message, stack: error?.stack });
    
    // Update outbox with failure
    if (outboxId) {
      await updateOutboxStatus(outboxId, 'failed', {
        last_error: error?.message || 'Unknown error',
        error_details: { stack: error?.stack }
      });
    }
    
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Unknown error", outboxId }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

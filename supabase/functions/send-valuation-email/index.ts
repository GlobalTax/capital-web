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
  result: ValuationResultEmail & {
    revenueValuation?: number; // Para calculadora de asesores
    revenueRange?: { min?: number; max?: number }; // Para calculadora de asesores
  };
  pdfBase64?: string; // PDF generado en frontend (base64 sin prefijo data:)
  pdfFilename?: string; // nombre sugerido para el adjunto
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
  pdfOnly?: boolean; // si true, solo genera/sube PDF y devuelve URL, no envía emails
  lang?: 'es' | 'ca' | 'val' | 'gl';
  source?: 'advisor' | 'standard'; // Para identificar calculadora de asesores
}

const euros = (n?: number | null, locale: string = "es-ES") =>
  typeof n === "number" && !isNaN(n) ? n.toLocaleString(locale, { style: "currency", currency: "EUR" }) : "-";

const pct = (n?: number | null) =>
  typeof n === "number" && !isNaN(n) ? `${n.toFixed(2)}%` : "-";

// Helpers: sanitizar nombre de archivo y limpiar base64
const sanitizeForFilename = (input: string): string => {
  try {
    let s = (input || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // quitar acentos
    s = s
      .replace(/[^a-zA-Z0-9._-]+/g, '-') // caracteres seguros
      .replace(/-+/g, '-') // colapsar guiones
      .replace(/^[-.]+|[-.]+$/g, ''); // recortar extremos
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

// Genera un PDF sencillo con el resumen de la valoración y lo devuelve en Base64 (sin data URI)
const generateValuationPdfBase64 = async (
  companyData: CompanyDataEmail,
  result: ValuationResultEmail,
  locale: string
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos (72 dpi)
  const { width, height } = page.getSize();
  const margin = 40;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - margin;
  const lineHeight = 18;
  const colorPrimary = rgb(0.106, 0.247, 0.675); // Azul Capittal aprox

  const drawHeader = () => {
    const title = "Informe de Valoración";
    page.drawText(title, { x: margin, y, size: 20, font: fontBold, color: colorPrimary });
    y -= lineHeight + 6;
    page.drawText("Capittal", { x: margin, y, size: 12, font: fontBold, color: colorPrimary });
    const date = new Date().toLocaleDateString(locale);
    const dateText = `Fecha: ${date}`;
    const dateWidth = font.widthOfTextAtSize(dateText, 10);
    page.drawText(dateText, { x: width - margin - dateWidth, y, size: 10, font });
    y -= lineHeight;

    // Línea separadora
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

  drawHeader();

  // Datos de contacto y empresa
  drawSectionTitle("Datos de la empresa");
  drawKV("Contacto:", companyData.contactName || "-");
  drawKV("Empresa:", companyData.companyName || "-");
  drawKV("Email:", companyData.email || "-");
  drawKV("Teléfono:", companyData.phone || "-");
  drawKV("Sector:", companyData.industry || "-");
  y -= 6;

  // Resultados
  drawSectionTitle("Resultado de la valoración");
  drawKV("Valoración final:", euros(result?.finalValuation ?? result?.valuationRange?.min ?? null, locale));
  drawKV("Rango estimado:", `${euros(result?.valuationRange?.min, locale)} - ${euros(result?.valuationRange?.max, locale)}`);
  drawKV("EBITDA:", euros(companyData.ebitda ?? null, locale));
  drawKV("Múltiplo EBITDA usado:", `${result?.multiples?.ebitdaMultipleUsed ?? result?.ebitdaMultiple ?? "-"}x`);
  y -= lineHeight;

  // Nota legal y direcciones
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

  // Devolver en Base64 sin data URI
  const base64 = await pdfDoc.saveAsBase64({ dataUri: false });
  return base64;
};

const handler = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    console.log("=== INICIO DEBUG send-valuation-email ===");
    console.log("Request method:", req.method);
    console.log("RESEND_API_KEY exists:", !!Deno.env.get("RESEND_API_KEY"));
    
    const payload = (await req.json()) as SendValuationEmailRequest;
    console.log("Payload received:", JSON.stringify(payload, null, 2));
    
    const { recipientEmail, companyData, result, pdfBase64, pdfFilename, enlaces, sender, subjectOverride, lang, source } = payload as SendValuationEmailRequest & { lang?: 'es' | 'ca' | 'val' | 'gl'; source?: 'advisor' | 'standard' };

    const localeMap: Record<string, string> = { es: 'es-ES', ca: 'ca-ES', val: 'ca-ES-valencia', gl: 'gl-ES' };
    const locale = localeMap[lang || 'es'] || 'es-ES';

    // Destinatarios SOLO internos - el cliente NO debe recibir este email
    const internalRecipients = [
      "samuel@capittal.es",
      "marcc@capittal.es",
      "oriol@capittal.es",
      "marc@capittal.es",
      "marcel@capittal.es",
      "lluis@capittal.es",
      "albert@capittal.es"
    ];

    // El email del lead se usará SOLO para reply_to, NO como destinatario
    const leadEmail = companyData.email?.trim() || recipientEmail?.trim();

    // GUARDRAIL: Asegurar que el lead NO está en los destinatarios internos
    if (leadEmail) {
      const leadInRecipients = internalRecipients.some(
        email => email.toLowerCase() === leadEmail.toLowerCase()
      );
      if (leadInRecipients) {
        console.error('GUARDRAIL: Lead email detectado en destinatarios internos, bloqueando:', leadEmail);
        throw new Error('Lead email cannot be in internal recipients');
      }
    }

    // Detectar si es calculadora de asesores
    const isAdvisorCalculation = source === 'advisor' || (companyData.industry && (
      companyData.industry.includes('asesor') || 
      companyData.industry.includes('fiscal') ||
      companyData.industry.includes('contable')
    ));

    const subject = isAdvisorCalculation 
      ? `Nueva valoración de asesoría - ${companyData.companyName || "Capittal"}`
      : `Nueva valoración recibida - ${companyData.companyName || "Capittal"}`;

    // HTML para emails internos (equipo Capittal)
    const htmlInternal = `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background:#f8fafc;">
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

          <p style="margin:16px 0 0; color:#6b7280; font-size:12px;">Este correo se generó automáticamente desde la calculadora${isAdvisorCalculation ? ' de asesores' : ''} de Capittal.</p>
        </div>
      </div>
    `;

    // Preparar PDF adjunto: usar el generado en frontend o crear uno de respaldo
    let pdfToAttach: string | null = (pdfBase64 && pdfBase64.trim().length > 0) ? pdfBase64.trim() : null;
    if (!pdfToAttach) {
      try {
        pdfToAttach = await generateValuationPdfBase64(companyData, result, locale);
      } catch (ePdf: any) {
        console.error("Error generando PDF de respaldo:", ePdf?.message || ePdf);
      }
    }
    const filename = pdfFilename || `Capittal-Valoracion-${(companyData.companyName || 'empresa').replaceAll(' ', '-')}.pdf`;

    // Subir PDF a Supabase Storage (bucket: valuations) para re-descarga
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
          console.error('Error subiendo PDF a storage:', upErr);
        } else {
          const pub = supabase.storage.from('valuations').getPublicUrl(fileName);
          pdfPublicUrl = pub.data.publicUrl;
          console.log('PDF subido correctamente', { fileName, publicUrl: pdfPublicUrl });
        }
      } catch (eUp: any) {
        console.error('Excepción al subir PDF a storage:', eUp?.message || eUp);
      }
    }
    // Si solo se solicita el PDF, devolver URL y no enviar emails
    if (payload.pdfOnly) {
      return new Response(
        JSON.stringify({ success: true, pdfUrl: pdfPublicUrl, filename }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Texto plano para mejorar entregabilidad (sin adjuntos)
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
    console.log("Attempting to send INTERNAL email to:", internalRecipients);
    console.log("Lead email (reply_to only):", leadEmail);
    console.log("Subject:", subject);
    
    try {
      console.log("Trying primary sender: Capittal <samuel@capittal.es>");
      emailResponse = await resend.emails.send({
        from: "Capittal <samuel@capittal.es>",
        to: internalRecipients,
        subject,
        html: htmlInternal,
        text: internalText,
        reply_to: leadEmail || "samuel@capittal.es",
         headers: { 
           "List-Unsubscribe": "<mailto:samuel@capittal.es?subject=unsubscribe>, <https://capittal.es/unsubscribe>",
           "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" 
         },
      });
      console.log("Primary email sent successfully:", emailResponse);
    } catch (e: any) {
      console.error("Primary sender failed, retrying with Resend test domain:", e?.message || e);
      console.error("Error details:", JSON.stringify(e, null, 2));
      console.log("Trying fallback sender: Capittal (Test) <onboarding@resend.dev>");
      emailResponse = await resend.emails.send({
        from: "Capittal (Test) <onboarding@resend.dev>",
        to: internalRecipients,
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

    // Enviar confirmación al usuario que completó el formulario (si hay email)
    if (companyData.email) {
      const userSubject = subjectOverride || `Valoración · PDF, escenarios y calculadora fiscal`;
      const saludo = companyData.contactName ? `Hola ${companyData.contactName},` : 'Hola,';
      const sector = companyData.industry || 'su sector';
      const nombre = sender?.nombre || 'Equipo Capittal';
      const cargo = sender?.cargo || 'M&A';
      const firma = sender?.firma || 'Capittal · Carrer Ausias March, 36 Principal · P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid';

      // Enlaces útiles con texto descriptivo (no URLs visibles)
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
        });
      } catch (e2: any) {
        console.error("User confirmation failed, retrying with Resend test domain:", e2?.message || e2);
        await resend.emails.send({
          from: "Capittal (Test) <onboarding@resend.dev>",
          to: [companyData.email],
          subject: `${userSubject} (pruebas)` ,
          html: `${userHtml}\n<p style=\"margin-top:12px;color:#9ca3af;font-size:12px;\">Enviado con remitente de pruebas por dominio no verificado.</p>`,
          text: userText,
          reply_to: "samuel@capittal.es",
           headers: { 
             "List-Unsubscribe": "<mailto:samuel@capittal.es?subject=unsubscribe>, <https://capittal.es/unsubscribe>", 
             "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" 
           },
        });
      }
    }

    // Replicar metadatos al CRM/segunda DB vía función sync-leads
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
      const { data: syncData, error: syncErr } = await supabase.functions.invoke('sync-leads', { body: syncPayload });
      if (syncErr) {
        console.error('sync-leads error:', syncErr);
      } else {
        console.log('sync-leads ok:', syncData);
      }
    } catch (e) {
      console.error('Exception calling sync-leads:', e);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse?.data?.id, pdfUrl: pdfPublicUrl, filename }),
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

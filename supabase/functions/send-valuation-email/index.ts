import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

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
  result: ValuationResultEmail;
  pdfBase64?: string; // PDF generado en frontend (base64 sin prefijo data:)
  pdfFilename?: string; // nombre sugerido para el adjunto
  agendaUrl?: string;
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
}

const euros = (n?: number | null) =>
  typeof n === "number" && !isNaN(n) ? n.toLocaleString("es-ES", { style: "currency", currency: "EUR" }) : "-";

const pct = (n?: number | null) =>
  typeof n === "number" && !isNaN(n) ? `${n.toFixed(2)}%` : "-";

// Genera un PDF sencillo con el resumen de la valoración y lo devuelve en Base64 (sin data URI)
const generateValuationPdfBase64 = async (
  companyData: CompanyDataEmail,
  result: ValuationResultEmail
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
    const date = new Date().toLocaleDateString("es-ES");
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
  drawKV("Valoración final:", euros(result?.finalValuation ?? result?.valuationRange?.min ?? null));
  drawKV("Rango estimado:", `${euros(result?.valuationRange?.min)} - ${euros(result?.valuationRange?.max)}`);
  drawKV("EBITDA:", euros(companyData.ebitda ?? null));
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
    const payload = (await req.json()) as SendValuationEmailRequest;
    const { recipientEmail, companyData, result, pdfBase64, pdfFilename, agendaUrl, enlaces, sender, subjectOverride } = payload;

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

    // Preparar PDF adjunto: usar el generado en frontend o crear uno de respaldo
    let pdfToAttach: string | null = (pdfBase64 && pdfBase64.trim().length > 0) ? pdfBase64.trim() : null;
    if (!pdfToAttach) {
      try {
        pdfToAttach = await generateValuationPdfBase64(companyData, result);
      } catch (ePdf: any) {
        console.error("Error generando PDF de respaldo:", ePdf?.message || ePdf);
      }
    }
    const filename = pdfFilename || `Capittal-Valoracion-${(companyData.companyName || 'empresa').replaceAll(' ', '-')}.pdf`;

    // Subir PDF a Supabase Storage (bucket: valuations) para re-descarga
    let pdfPublicUrl: string | null = null;
    if (pdfToAttach) {
      try {
        const binary = Uint8Array.from(atob(pdfToAttach), (c) => c.charCodeAt(0));
        const objectKey = `valuations/${Date.now()}-${(companyData.companyName || 'empresa').replaceAll(' ', '-')}.pdf`;
        const { data: up, error: upErr } = await supabase.storage
          .from('valuations')
          .upload(objectKey, binary, { contentType: 'application/pdf', upsert: true });
        if (upErr) {
          console.error('Error subiendo PDF a storage:', upErr);
        } else {
          pdfPublicUrl = `${supabaseUrl}/storage/v1/object/public/${objectKey}`;
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

    let emailResponse: any;
    try {
      emailResponse = await resend.emails.send({
        from: "Samuel de Capittal <samuel@capittal.es>",
        to: recipients,
        subject,
        html,
        attachments: pdfToAttach ? [{ filename, content: pdfToAttach, contentType: "application/pdf" }] : undefined,
      });
    } catch (e: any) {
      console.error("Primary sender failed, retrying with Resend test domain:", e?.message || e);
      emailResponse = await resend.emails.send({
        from: "Capittal (Test) <onboarding@resend.dev>",
        to: recipients,
        subject: `${subject} (pruebas)`,
        html: `${html}\n<p style=\"margin-top:12px;color:#9ca3af;font-size:12px;\">Enviado con remitente de pruebas por dominio no verificado.</p>`,
        attachments: pdfToAttach ? [{ filename, content: pdfToAttach, contentType: "application/pdf" }] : undefined,
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

      // Enlaces útiles (sólo si se facilitan)
      const pdfUrlFinal = (enlaces && enlaces.pdfUrl) || pdfPublicUrl || '';
      const enlacesUtiles = [
        pdfUrlFinal ? `<p style="margin:0 0 6px;"><strong>Re-descargar el PDF:</strong> <a href="${pdfUrlFinal}" target="_blank" style="color:#1f2937;">${pdfUrlFinal}</a></p>` : '',
        enlaces?.escenariosUrl ? `<p style="margin:0 0 6px;"><strong>Generar nuevos escenarios:</strong> <a href="${enlaces.escenariosUrl}" target="_blank" style="color:#1f2937;">${enlaces.escenariosUrl}</a></p>` : '',
        enlaces?.calculadoraFiscalUrl ? `<p style="margin:0 0 6px;"><strong>Calculadora del impacto fiscal:</strong> <a href="${enlaces.calculadoraFiscalUrl}" target="_blank" style="color:#1f2937;">${enlaces.calculadoraFiscalUrl}</a></p>` : ''
      ].filter(Boolean).join('');

      const userHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background:#f8fafc;">
          <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:24px; color:#111827;">
            <p style="margin:0 0 16px;">${saludo}</p>
            <p style="margin:0 0 12px;">Le escribimos desde el equipo de Capittal. Gracias por completar el formulario de valoración de <strong>${companyData.companyName || ''}</strong>.</p>
            <p style="margin:0 0 12px;">Su PDF ya se ha generado y pudo descargarlo en la pantalla de confirmación. Por si lo necesita de nuevo, lo adjuntamos a este correo.</p>

            <p style="margin:16px 0 8px;"><strong>En ese documento encontrará:</strong></p>
            <ul style="margin:0 0 12px 18px; padding:0;">
              <li style="margin:0 0 6px;">Una horquilla preliminar basada en comparables de ${sector} y en el tamaño de la compañía.</li>
              <li style="margin:0 0 6px;">La metodología aplicada y los principales supuestos considerados.</li>
              <li style="margin:0;">Se trata de una valoración orientativa, dado que por el momento hemos tenido acceso a información limitada.</li>
            </ul>

            <p style="margin:0 0 12px;">Quedamos a su disposición para concertar una llamada y revisar las conclusiones (metodología, horquilla orientativa y próximos pasos). ${agendaUrl ? `Puede reservar una llamada de 20–30 minutos aquí: <a href="${agendaUrl}" target="_blank" style="color:#1f2937;">${agendaUrl}</a>.` : ''}</p>
            <p style="margin:0 0 16px;">Si lo considera oportuno, indíquenos dos o tres opciones de horario y le remitiremos la invitación. Le recordamos que esta valoración es completamente confidencial.</p>

            ${enlacesUtiles ? `<div style="margin:16px 0 12px;"><p style=\"margin:0 0 8px;\"><strong>Enlaces útiles (guarde este correo):</strong></p>${enlacesUtiles}</div>` : ''}

            <p style="margin:16px 0 8px;"><strong>Sobre Capittal</strong></p>
            <ul style="margin:0 0 12px 18px; padding:0;">
              <li style="margin:0 0 6px;">Equipo multidisciplinar de 50 profesionales (M&A, fiscal y legal).</li>
              <li style="margin:0 0 6px;">Más de 100 operaciones cerradas en 15 años.</li>
              <li style="margin:0;">Enfoque práctico y acompañamiento de principio a fin del proceso.</li>
            </ul>

            <p style="margin:16px 0 6px;">Un saludo,</p>
            <p style="margin:0;">${nombre} · ${cargo}</p>
            <p style="margin:0 0 16px;">${firma}</p>

            <p style="margin:12px 0 0; font-size:12px; color:#6b7280;"><strong>Nota legal:</strong> Este contenido es orientativo y no constituye una valoración u oferta vinculante. La valoración final puede variar tras el análisis completo de la documentación (estados financieros, deuda y ajustes de EBITDA).</p>
          </div>
        </div>`;

      try {
        await resend.emails.send({
          from: "Samuel de Capittal <samuel@capittal.es>",
          to: [companyData.email],
          subject: userSubject,
          html: userHtml,
          attachments: pdfToAttach ? [{ filename, content: pdfToAttach, contentType: "application/pdf" }] : undefined,
        });
      } catch (e2: any) {
        console.error("User confirmation failed, retrying with Resend test domain:", e2?.message || e2);
        await resend.emails.send({
          from: "Capittal (Test) <onboarding@resend.dev>",
          to: [companyData.email],
          subject: `${userSubject} (pruebas)` ,
          html: `${userHtml}\n<p style=\"margin-top:12px;color:#9ca3af;font-size:12px;\">Enviado con remitente de pruebas por dominio no verificado.</p>`,
          attachments: pdfToAttach ? [{ filename, content: pdfToAttach, contentType: "application/pdf" }] : undefined,
        });
      }
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

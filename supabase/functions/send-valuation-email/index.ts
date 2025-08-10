import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

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
  pdfBase64?: string; // PDF generado en frontend (base64 sin prefijo data:)
  pdfFilename?: string; // nombre sugerido para el adjunto
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
    const { recipientEmail, companyData, result, pdfBase64, pdfFilename } = (await req.json()) as SendValuationEmailRequest;

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

    // Enviar confirmación al usuario que completó el formulario (si hay email)
    if (companyData.email) {
      const userSubject = `Hemos recibido tu solicitud de valoración | Capittal`;
      const saludo = companyData.contactName ? `Hola ${companyData.contactName},` : 'Hola,';
      const rangoMin = euros(result?.valuationRange?.min);
      const rangoMax = euros(result?.valuationRange?.max);
      const userHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background:#f8fafc;">
          <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:24px;">
            <h1 style="margin:0 0 12px; color:#111827; font-size:20px;">${saludo}</h1>
            <p style="margin:0 0 12px; color:#374151;">Gracias por utilizar nuestra calculadora de valoración. Hemos recibido tus datos y en breve un asesor de Capittal se pondrá en contacto contigo.</p>
            <p style="margin:0 0 16px; color:#374151;">Estimación orientativa: <strong>${rangoMin} - ${rangoMax}</strong></p>
            <p style="margin:0 0 8px; color:#6b7280; font-size:12px;">La estimación es indicativa y deberá analizarse con más detalle.</p>
            <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
            <p style="margin:0 0 8px; color:#374151;">Si quieres acelerar el proceso, respóndenos a este correo con disponibilidad para una breve llamada.</p>
            <p style="margin:8px 0 0; color:#6b7280; font-size:12px;">Capittal · P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid</p>
          </div>
        </div>`;

      // Adjuntar el MISMO PDF del frontend si viene en la petición; si no, generar uno de respaldo
      let pdfToAttach: string | null = (pdfBase64 && pdfBase64.trim().length > 0) ? pdfBase64.trim() : null;
      if (!pdfToAttach) {
        try {
          pdfToAttach = await generateValuationPdfBase64(companyData, result);
        } catch (ePdf: any) {
          console.error("Error generando PDF de respaldo para el usuario:", ePdf?.message || ePdf);
        }
      }

      const filename = pdfFilename || `Capittal-Valoracion-${(companyData.companyName || 'empresa').replaceAll(' ', '-')}.pdf`;

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

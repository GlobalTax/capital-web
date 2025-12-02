import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Equipo interno que recibe copia de todas las valoraciones
const INTERNAL_TEAM = [
  "samuel@capittal.es",
  "pau@capittal.es",
  "marcc@capittal.es",
  "marc@capittal.es",
  "lluis@capittal.es",
  "oriol@capittal.es",
  "l.linares@nrro.es"
];

interface FinancialYear {
  year: number;
  revenue: number;
  ebitda: number;
  netProfit: number;
}

interface NormalizationAdjustment {
  concept: string;
  amount: number;
  type: 'add' | 'subtract';
  description?: string;
}

interface ValuationEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  valuationData: {
    clientCompany: string;
    clientName?: string;
    clientCif?: string;
    valuationCentral: number;
    valuationLow: number;
    valuationHigh: number;
    sector: string;
    normalizedEbitda?: number;
    ebitdaMultipleUsed?: number;
    multipleLow?: number;
    multipleHigh?: number;
    financialYears?: FinancialYear[];
    normalizationAdjustments?: NormalizationAdjustment[];
  };
  pdfBase64?: string; // PDF en base64 para adjuntar
  pdfUrl?: string;
  advisorName?: string;
  advisorEmail?: string;
  customSubject?: string;
  customMessage?: string;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number | null | undefined, decimals: number = 0): string => {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Sanitizar nombre para filename
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

// Limpiar base64
const cleanPdfBase64 = (b64: string): string => {
  const trimmed = (b64 || '').trim();
  if (trimmed.toLowerCase().includes('base64,')) {
    return trimmed.substring(trimmed.indexOf(',') + 1);
  }
  return trimmed.replace(/^data:application\/pdf;base64,/, '');
};

// Generar HTML del email para cliente
const generateClientEmailHtml = (data: ValuationEmailRequest): string => {
  const { recipientName, valuationData, pdfUrl, advisorName, customMessage } = data;
  
  const greeting = recipientName ? `Estimado/a ${recipientName}` : 'Estimado/a cliente';
  const advisor = advisorName || 'El equipo de Capittal';
  
  const personalMessage = customMessage || `
    Nos complace hacerle llegar el informe de valoración de <strong>${valuationData.clientCompany}</strong> que hemos preparado para usted.
    Este documento contiene un análisis profesional basado en la información financiera proporcionada, 
    aplicando múltiplos de mercado específicos para su sector (${valuationData.sector}).
  `;

  // Generar filas de años financieros si existen
  let financialYearsHtml = '';
  if (valuationData.financialYears && valuationData.financialYears.length > 0) {
    const yearsHeaders = valuationData.financialYears.map(y => 
      `<th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #1a1a1a; border-bottom: 2px solid #e5e7eb;">${y.year}</th>`
    ).join('');
    
    const revenueRow = valuationData.financialYears.map(y => 
      `<td style="padding: 10px 8px; text-align: right; color: #374151;">${formatCurrency(y.revenue)}</td>`
    ).join('');
    
    const ebitdaRow = valuationData.financialYears.map(y => 
      `<td style="padding: 10px 8px; text-align: right; color: #374151;">${formatCurrency(y.ebitda)}</td>`
    ).join('');
    
    const netProfitRow = valuationData.financialYears.map(y => 
      `<td style="padding: 10px 8px; text-align: right; color: #374151;">${formatCurrency(y.netProfit)}</td>`
    ).join('');

    financialYearsHtml = `
      <tr>
        <td style="padding: 0 40px 30px;">
          <p style="margin: 0 0 15px; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Datos Financieros</p>
          <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 6px;">
            <thead>
              <tr>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Concepto</th>
                ${yearsHeaders}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px 8px; color: #374151; font-weight: 500;">Facturación</td>
                ${revenueRow}
              </tr>
              <tr style="background: #f3f4f6;">
                <td style="padding: 10px 8px; color: #374151; font-weight: 500;">EBITDA</td>
                ${ebitdaRow}
              </tr>
              <tr>
                <td style="padding: 10px 8px; color: #374151; font-weight: 500;">Beneficio Neto</td>
                ${netProfitRow}
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    `;
  }

  // Generar tabla de ajustes de normalización si existen
  let adjustmentsHtml = '';
  if (valuationData.normalizationAdjustments && valuationData.normalizationAdjustments.length > 0) {
    const adjustmentRows = valuationData.normalizationAdjustments.map(adj => `
      <tr>
        <td style="padding: 8px; color: #374151;">${adj.concept}</td>
        <td style="padding: 8px; text-align: center; color: ${adj.type === 'add' ? '#059669' : '#dc2626'};">${adj.type === 'add' ? '+' : '-'}</td>
        <td style="padding: 8px; text-align: right; color: #374151;">${formatCurrency(adj.amount)}</td>
      </tr>
    `).join('');

    adjustmentsHtml = `
      <tr>
        <td style="padding: 0 40px 30px;">
          <p style="margin: 0 0 15px; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Ajustes de Normalización del EBITDA</p>
          <table role="presentation" style="width: 100%; border-collapse: collapse; background: #fef3c7; border-radius: 6px; border: 1px solid #fcd34d;">
            <thead>
              <tr>
                <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #92400e; text-transform: uppercase;">Concepto</th>
                <th style="padding: 10px 8px; text-align: center; font-size: 12px; color: #92400e; text-transform: uppercase;">Tipo</th>
                <th style="padding: 10px 8px; text-align: right; font-size: 12px; color: #92400e; text-transform: uppercase;">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${adjustmentRows}
            </tbody>
          </table>
        </td>
      </tr>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Valoración Profesional - ${valuationData.clientCompany}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 650px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 3px solid #1a1a1a;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1a1a1a; letter-spacing: -1px;">Capittal</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 2px;">Asesores en M&A</p>
            </td>
          </tr>
          
          <!-- Badge tipo informe -->
          <tr>
            <td style="padding: 30px 40px 10px; text-align: center;">
              <span style="display: inline-block; padding: 6px 16px; background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-radius: 20px;">Informe de Valoración Profesional</span>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 20px 40px 20px;">
              <p style="margin: 0; font-size: 18px; color: #1a1a1a; font-weight: 600;">${greeting},</p>
            </td>
          </tr>
          
          <!-- Custom Message -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #444;">${personalMessage}</p>
            </td>
          </tr>
          
          <!-- Valuation Summary Box -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 8px;">
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 8px; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Empresa Valorada</p>
                    <p style="margin: 0 0 5px; font-size: 22px; font-weight: 700; color: #fff;">${valuationData.clientCompany}</p>
                    ${valuationData.clientCif ? `<p style="margin: 0 0 20px; font-size: 13px; color: #999;">CIF: ${valuationData.clientCif}</p>` : '<p style="margin: 0 0 20px;"></p>'}
                    
                    <p style="margin: 0 0 8px; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Rango de Valoración Estimado</p>
                    <p style="margin: 0; font-size: 28px; font-weight: 700; color: #fff;">
                      ${formatCurrency(valuationData.valuationLow)} - ${formatCurrency(valuationData.valuationHigh)}
                    </p>
                    <p style="margin: 10px 0 0; font-size: 14px; color: #ccc;">
                      Valor central: <strong style="color: #4ade80; font-size: 18px;">${formatCurrency(valuationData.valuationCentral)}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Key Details -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <span style="font-size: 14px; color: #666;">Sector</span>
                    <span style="float: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${valuationData.sector}</span>
                  </td>
                </tr>
                ${valuationData.normalizedEbitda ? `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <span style="font-size: 14px; color: #666;">EBITDA Normalizado</span>
                    <span style="float: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${formatCurrency(valuationData.normalizedEbitda)}</span>
                  </td>
                </tr>
                ` : ''}
                ${valuationData.ebitdaMultipleUsed ? `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <span style="font-size: 14px; color: #666;">Múltiplo EBITDA aplicado</span>
                    <span style="float: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${formatNumber(valuationData.ebitdaMultipleUsed, 1)}x</span>
                  </td>
                </tr>
                ` : ''}
                ${valuationData.multipleLow && valuationData.multipleHigh ? `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <span style="font-size: 14px; color: #666;">Rango de múltiplos</span>
                    <span style="float: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${formatNumber(valuationData.multipleLow, 1)}x - ${formatNumber(valuationData.multipleHigh, 1)}x</span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          
          <!-- Financial Years Table -->
          ${financialYearsHtml}
          
          <!-- Normalization Adjustments -->
          ${adjustmentsHtml}
          
          <!-- CTA Button -->
          ${pdfUrl ? `
          <tr>
            <td style="padding: 0 40px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${pdfUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 6px; letter-spacing: 0.5px;">
                      📄 Descargar Informe Completo (PDF)
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Disclaimer -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="padding: 15px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">
                <p style="margin: 0; font-size: 12px; color: #991b1b; line-height: 1.5;">
                  <strong>⚠️ Importante:</strong> Esta valoración NO incluye el valor de los activos inmobiliarios que la empresa pueda tener en su balance. 
                  La valoración es orientativa y no vinculante, basada en la información proporcionada y metodologías estándar del sector.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0 0 15px; font-size: 15px; line-height: 1.7; color: #444;">
                Quedamos a su disposición para comentar el informe en detalle y resolver cualquier duda que pueda tener.
                No dude en contactarnos para agendar una reunión de presentación de resultados.
              </p>
            </td>
          </tr>
          
          <!-- Signature -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0; font-size: 15px; color: #444;">
                Un cordial saludo,<br><br>
                <strong style="color: #1a1a1a;">${advisor}</strong><br>
                <span style="color: #666;">Capittal - Asesores en M&A</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 10px; font-size: 13px; color: #666;">
                      <strong>Capittal</strong> | Expertos en valoración y venta de empresas
                    </p>
                    <p style="margin: 0 0 10px; font-size: 12px; color: #999;">
                      Tel: +34 931 255 628 | info@capittal.es | www.capittal.es
                    </p>
                    <p style="margin: 0 0 10px; font-size: 11px; color: #999;">
                      Barcelona: Carrer Ausias March, 36 Principal | Madrid: P.º de la Castellana, 11
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #bbb;">
                      Este correo y su contenido son confidenciales y están destinados únicamente al destinatario indicado.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

// Generar HTML del email interno (más datos técnicos)
const generateInternalEmailHtml = (data: ValuationEmailRequest, pdfPublicUrl: string | null): string => {
  const { recipientName, valuationData, advisorName } = data;
  
  // Filas de años financieros
  let financialYearsRows = '';
  if (valuationData.financialYears && valuationData.financialYears.length > 0) {
    financialYearsRows = valuationData.financialYears.map(y => `
      <tr>
        <td style="padding:6px 0; color:#374151;">${y.year}</td>
        <td style="padding:6px 0; color:#111827; font-weight:600;">${formatCurrency(y.revenue)}</td>
        <td style="padding:6px 0; color:#111827; font-weight:600;">${formatCurrency(y.ebitda)}</td>
        <td style="padding:6px 0; color:#111827; font-weight:600;">${formatCurrency(y.netProfit)}</td>
      </tr>
    `).join('');
  }

  // Filas de ajustes
  let adjustmentsRows = '';
  if (valuationData.normalizationAdjustments && valuationData.normalizationAdjustments.length > 0) {
    adjustmentsRows = valuationData.normalizationAdjustments.map(adj => `
      <tr>
        <td style="padding:4px 0; color:#374151;">${adj.concept}</td>
        <td style="padding:4px 0; color:${adj.type === 'add' ? '#059669' : '#dc2626'}; font-weight:600;">${adj.type === 'add' ? '+' : '-'} ${formatCurrency(adj.amount)}</td>
      </tr>
    `).join('');
  }

  return `
    <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; background:#f8fafc;">
      <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:24px;">
        <div style="background:#1a1a1a; color:#fff; padding:12px 16px; border-radius:6px; margin-bottom:20px;">
          <h1 style="margin:0; font-size:18px;">🏢 Nueva Valoración Profesional Enviada</h1>
        </div>

        <h2 style="margin:16px 0 8px; color:#111827; font-size:16px;">📋 Información del Envío</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
          <tr><td style="padding:6px 0; color:#374151; width:40%;">Enviado a:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${data.recipientEmail}</td></tr>
          <tr><td style="padding:6px 0; color:#374151;">Nombre cliente:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${recipientName || '-'}</td></tr>
          <tr><td style="padding:6px 0; color:#374151;">Asesor:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${advisorName || 'Sistema'}</td></tr>
        </table>

        <h2 style="margin:16px 0 8px; color:#111827; font-size:16px;">🏭 Datos de la Empresa</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
          <tr><td style="padding:6px 0; color:#374151; width:40%;">Empresa:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${valuationData.clientCompany}</td></tr>
          <tr><td style="padding:6px 0; color:#374151;">CIF:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${valuationData.clientCif || '-'}</td></tr>
          <tr><td style="padding:6px 0; color:#374151;">Sector:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${valuationData.sector}</td></tr>
        </table>

        ${valuationData.financialYears && valuationData.financialYears.length > 0 ? `
        <h2 style="margin:16px 0 8px; color:#111827; font-size:16px;">📊 Datos Financieros</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px; background:#f9fafb; padding:10px; border-radius:6px;">
          <tr style="background:#e5e7eb;">
            <th style="padding:8px; text-align:left; font-size:12px;">Año</th>
            <th style="padding:8px; text-align:left; font-size:12px;">Facturación</th>
            <th style="padding:8px; text-align:left; font-size:12px;">EBITDA</th>
            <th style="padding:8px; text-align:left; font-size:12px;">Beneficio Neto</th>
          </tr>
          ${financialYearsRows}
        </table>
        ` : ''}

        ${valuationData.normalizationAdjustments && valuationData.normalizationAdjustments.length > 0 ? `
        <h2 style="margin:16px 0 8px; color:#111827; font-size:16px;">⚙️ Ajustes de Normalización</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
          ${adjustmentsRows}
        </table>
        ` : ''}

        <h2 style="margin:16px 0 8px; color:#111827; font-size:16px;">💰 Resultado de la Valoración</h2>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
          <tr style="background:#ecfdf5;">
            <td style="padding:10px; color:#065f46; font-weight:700;">Valoración Central</td>
            <td style="padding:10px; color:#065f46; font-weight:700; font-size:18px;">${formatCurrency(valuationData.valuationCentral)}</td>
          </tr>
          <tr><td style="padding:6px 0; color:#374151;">Rango:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${formatCurrency(valuationData.valuationLow)} - ${formatCurrency(valuationData.valuationHigh)}</td></tr>
          <tr><td style="padding:6px 0; color:#374151;">EBITDA Normalizado:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${formatCurrency(valuationData.normalizedEbitda)}</td></tr>
          <tr><td style="padding:6px 0; color:#374151;">Múltiplo EBITDA:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${formatNumber(valuationData.ebitdaMultipleUsed, 1)}x</td></tr>
          ${valuationData.multipleLow && valuationData.multipleHigh ? `
          <tr><td style="padding:6px 0; color:#374151;">Rango múltiplos:</td><td style="padding:6px 0; color:#111827; font-weight:600;">${formatNumber(valuationData.multipleLow, 1)}x - ${formatNumber(valuationData.multipleHigh, 1)}x</td></tr>
          ` : ''}
        </table>

        ${pdfPublicUrl ? `
        <div style="margin-top:20px; padding:15px; background:#f0f9ff; border-radius:6px; text-align:center;">
          <a href="${pdfPublicUrl}" style="color:#0369a1; font-weight:600; text-decoration:none;">📄 Descargar PDF del Informe</a>
        </div>
        ` : ''}

        <p style="margin:20px 0 0; color:#6b7280; font-size:12px;">Este correo se generó automáticamente desde el sistema de valoraciones profesionales de Capittal.</p>
      </div>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log('[send-professional-valuation-email] Request received');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ValuationEmailRequest = await req.json();
    console.log('[send-professional-valuation-email] Request data:', {
      recipientEmail: requestData.recipientEmail,
      clientCompany: requestData.valuationData?.clientCompany,
      hasPdfBase64: !!requestData.pdfBase64,
      hasPdfUrl: !!requestData.pdfUrl,
      hasFinancialYears: !!requestData.valuationData?.financialYears?.length,
      hasAdjustments: !!requestData.valuationData?.normalizationAdjustments?.length,
    });

    // Validate required fields
    if (!requestData.recipientEmail) {
      console.error('[send-professional-valuation-email] Missing recipient email');
      return new Response(
        JSON.stringify({ error: 'El email del destinatario es requerido' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!requestData.valuationData?.clientCompany) {
      console.error('[send-professional-valuation-email] Missing client company');
      return new Response(
        JSON.stringify({ error: 'El nombre de la empresa es requerido' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Preparar PDF: limpiar base64 y subir a Storage
    let pdfPublicUrl = requestData.pdfUrl || null;
    let pdfAttachmentContent: string | null = null;
    
    if (requestData.pdfBase64 && requestData.pdfBase64.trim().length > 100) {
      try {
        const cleanedBase64 = cleanPdfBase64(requestData.pdfBase64);
        pdfAttachmentContent = cleanedBase64;
        
        // Subir a Supabase Storage
        const binary = Uint8Array.from(atob(cleanedBase64), (c) => c.charCodeAt(0));
        const baseName = sanitizeForFilename(requestData.valuationData.clientCompany);
        const fileName = `professional/${Date.now()}-${baseName}.pdf`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('valuations')
          .upload(fileName, binary, { contentType: 'application/pdf', upsert: true });
        
        if (uploadError) {
          console.error('[send-professional-valuation-email] Error uploading PDF:', uploadError);
        } else {
          const { data: urlData } = supabase.storage.from('valuations').getPublicUrl(fileName);
          pdfPublicUrl = urlData.publicUrl;
          console.log('[send-professional-valuation-email] PDF uploaded:', pdfPublicUrl);
        }
      } catch (pdfError: any) {
        console.error('[send-professional-valuation-email] Error processing PDF:', pdfError?.message || pdfError);
      }
    }

    // Preparar datos con URL del PDF
    const dataWithPdfUrl = { ...requestData, pdfUrl: pdfPublicUrl };
    
    // Generar HTML del email para cliente
    const clientEmailHtml = generateClientEmailHtml(dataWithPdfUrl);
    const subject = requestData.customSubject || `Informe de Valoración - ${requestData.valuationData.clientCompany}`;

    // Preparar attachment si tenemos el PDF
    const attachments = pdfAttachmentContent ? [{
      filename: `Valoracion-${sanitizeForFilename(requestData.valuationData.clientCompany)}.pdf`,
      content: pdfAttachmentContent,
    }] : undefined;

    console.log('[send-professional-valuation-email] Sending email to client:', requestData.recipientEmail);
    console.log('[send-professional-valuation-email] Has attachment:', !!attachments);

    // Enviar email al cliente CON PDF adjunto
    const clientEmailResponse = await resend.emails.send({
      from: "Capittal <valoraciones@capittal.es>",
      to: [requestData.recipientEmail],
      subject: subject,
      html: clientEmailHtml,
      reply_to: requestData.advisorEmail || "info@capittal.es",
      attachments: attachments,
      headers: {
        "List-Unsubscribe": "<mailto:info@capittal.es?subject=unsubscribe>",
      },
    });

    console.log('[send-professional-valuation-email] Client email sent:', clientEmailResponse);

    // Enviar copia al equipo interno
    try {
      const internalEmailHtml = generateInternalEmailHtml(requestData, pdfPublicUrl);
      
      await resend.emails.send({
        from: "Capittal <valoraciones@capittal.es>",
        to: INTERNAL_TEAM,
        subject: `[Valoración Pro] ${requestData.valuationData.clientCompany} → ${requestData.recipientEmail}`,
        html: internalEmailHtml,
        attachments: attachments,
      });
      
      console.log('[send-professional-valuation-email] Internal team email sent to:', INTERNAL_TEAM.length, 'recipients');
    } catch (copyError: any) {
      console.warn('[send-professional-valuation-email] Failed to send internal copy:', copyError?.message || copyError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: clientEmailResponse.data?.id,
        sentTo: requestData.recipientEmail,
        pdfUrl: pdfPublicUrl,
        teamNotified: INTERNAL_TEAM.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('[send-professional-valuation-email] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al enviar el email' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

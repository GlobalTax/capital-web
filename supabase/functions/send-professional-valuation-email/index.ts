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

// Fallback: Equipo interno por defecto si la BD no está disponible
const DEFAULT_INTERNAL_TEAM = [
  "samuel@capittal.es",
  "pau@capittal.es", 
  "marcc@capittal.es",
  "marc@capittal.es",
  "lluis@capittal.es",
  "oriol@capittal.es",
  "valoraciones@capittal.es"
];

// Función para obtener destinatarios activos desde la BD
async function getInternalRecipients(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('email_recipients_config')
      .select('email')
      .eq('is_active', true)
      .eq('is_default_copy', true);
    
    if (error) {
      console.warn('[getInternalRecipients] Error fetching from DB, using defaults:', error.message);
      return DEFAULT_INTERNAL_TEAM;
    }
    
    if (!data || data.length === 0) {
      console.warn('[getInternalRecipients] No recipients found in DB, using defaults');
      return DEFAULT_INTERNAL_TEAM;
    }
    
    const emails = data.map(r => r.email);
    console.log('[getInternalRecipients] Loaded', emails.length, 'recipients from DB');
    return emails;
  } catch (e) {
    console.error('[getInternalRecipients] Exception:', e);
    return DEFAULT_INTERNAL_TEAM;
  }
}

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
  selectedRecipients?: string[]; // Lista de destinatarios seleccionados por el usuario
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

// Formato compacto para valores grandes (mejor en móvil)
const formatCurrencyCompact = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace('.0', '')}M €`;
  }
  if (Math.abs(value) >= 1000) {
    return `${Math.round(value / 1000)}K €`;
  }
  return `${value} €`;
};

// Generar HTML del email para cliente (estilo igual que calculadora pública)
const generateClientEmailHtml = (data: ValuationEmailRequest): string => {
  const { recipientName, valuationData, pdfUrl, advisorName, advisorEmail, customMessage } = data;
  
  const saludo = recipientName ? `Hola ${recipientName},` : 'Hola,';
  const advisor = advisorName || 'Equipo Capittal';
  const sector = valuationData.sector || 'su sector';
  
  const personalMessage = customMessage || `Le escribimos desde el equipo de Capittal. Gracias por confiar en nosotros para la valoración de <strong>${valuationData.clientCompany}</strong>.`;

  // Generar layout de años financieros RESPONSIVE (tarjetas verticales para móvil)
  let financialYearsHtml = '';
  if (valuationData.financialYears && valuationData.financialYears.length > 0) {
    // Usar tarjetas verticales apiladas para mejor visualización en móvil
    const yearCards = valuationData.financialYears.map(y => `
      <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:6px; padding:12px; margin-bottom:8px;">
        <p style="margin:0 0 8px; font-weight:700; color:#1a1a1a; font-size:14px; border-bottom:1px solid #e5e7eb; padding-bottom:6px;">${y.year}</p>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:#6b7280; font-size:12px;">Facturación:</span>
          <strong style="color:#111827; font-size:12px;">${formatCurrencyCompact(y.revenue)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:#6b7280; font-size:12px;">EBITDA:</span>
          <strong style="color:#111827; font-size:12px;">${formatCurrencyCompact(y.ebitda)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:#6b7280; font-size:12px;">B. Neto:</span>
          <strong style="color:#111827; font-size:12px;">${formatCurrencyCompact(y.netProfit)}</strong>
        </div>
      </div>
    `).join('');

    financialYearsHtml = `
      <div style="background:#f3f4f6; border-radius:8px; padding:16px; margin:20px 0;">
        <p style="margin:0 0 12px; font-weight:600; color:#374151; font-size:14px;">📊 Datos Financieros Analizados</p>
        ${yearCards}
      </div>
    `;
  }

  // Generar layout de ajustes RESPONSIVE (lista vertical)
  let adjustmentsHtml = '';
  if (valuationData.normalizationAdjustments && valuationData.normalizationAdjustments.length > 0) {
    const adjustmentItems = valuationData.normalizationAdjustments.map(adj => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #fcd34d;">
        <span style="color:#92400e; font-size:12px; flex:1; padding-right:8px;">${adj.concept}</span>
        <span style="color:${adj.type === 'add' ? '#059669' : '#dc2626'}; font-weight:600; font-size:12px; white-space:nowrap;">${adj.type === 'add' ? '+' : '-'} ${formatCurrencyCompact(adj.amount)}</span>
      </div>
    `).join('');

    adjustmentsHtml = `
      <div style="background:#fef3c7; border:1px solid #fbbf24; border-radius:8px; padding:16px; margin:20px 0;">
        <p style="margin:0 0 12px; font-weight:600; color:#92400e; font-size:14px;">⚙️ Ajustes de Normalización</p>
        ${adjustmentItems}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Valoración - ${valuationData.clientCompany}</title>
</head>
<body style="margin:0; padding:0; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#f8fafc; font-size:14px;">
  <div style="max-width:600px; margin:0 auto; padding:16px;">
    <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:20px; color:#111827;">
      
      <!-- Header -->
      <div style="text-align:center; margin-bottom:24px; padding-bottom:20px; border-bottom:2px solid #1a1a1a;">
        <h1 style="margin:0; font-size:28px; font-weight:700; color:#1a1a1a; letter-spacing:-0.5px;">Capittal</h1>
        <p style="margin:6px 0 0; font-size:13px; color:#6b7280; text-transform:uppercase; letter-spacing:1.5px;">Asesores en M&A</p>
      </div>
      
      <!-- Badge -->
      <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; padding:6px 16px; background:linear-gradient(135deg, #1a1a1a 0%, #333 100%); color:#fff; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:1px; border-radius:20px;">Informe de Valoración Profesional</span>
      </div>
      
      <!-- Saludo -->
      <p style="margin:0 0 16px; font-size:17px; font-weight:600; color:#1a1a1a;">${saludo}</p>
      <p style="margin:0 0 16px; line-height:1.7; color:#374151;">${personalMessage}</p>
      <p style="margin:0 0 20px; line-height:1.7; color:#374151;">Su PDF ya se ha generado y está adjunto a este correo. Por si lo necesita de nuevo, también puede descargarlo desde el enlace más abajo.</p>

      <!-- Resultado de Valoración (caja destacada) -->
      <div style="background:linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius:10px; padding:24px; margin:24px 0;">
        <p style="margin:0 0 6px; font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px;">Empresa Valorada</p>
        <p style="margin:0 0 4px; font-size:20px; font-weight:700; color:#fff;">${valuationData.clientCompany}</p>
        ${valuationData.clientCif ? `<p style="margin:0 0 16px; font-size:13px; color:#9ca3af;">CIF: ${valuationData.clientCif}</p>` : '<div style="margin-bottom:16px;"></div>'}
        
        <p style="margin:0 0 6px; font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px;">Rango de Valoración Estimado</p>
        <p style="margin:0; font-size:24px; font-weight:700; color:#fff;">
          ${formatCurrency(valuationData.valuationLow)} - ${formatCurrency(valuationData.valuationHigh)}
        </p>
        <p style="margin:8px 0 0; font-size:14px; color:#d1d5db;">
          Valor central: <strong style="color:#4ade80; font-size:18px;">${formatCurrency(valuationData.valuationCentral)}</strong>
        </p>
      </div>

      <!-- Info documento -->
      <div style="background:#f3f4f6; border-radius:8px; padding:20px; margin:20px 0;">
        <p style="margin:0 0 12px; font-weight:600; color:#374151;">📊 En este informe encontrará:</p>
        <ul style="margin:0 0 0 20px; padding:0; line-height:1.6; color:#4b5563;">
          <li style="margin:0 0 8px;">Una horquilla de valoración basada en comparables de <strong>${sector}</strong>.</li>
          <li style="margin:0 0 8px;">La metodología aplicada y los principales supuestos considerados.</li>
          <li style="margin:0 0 8px;">Análisis del EBITDA normalizado${valuationData.normalizedEbitda ? `: <strong>${formatCurrency(valuationData.normalizedEbitda)}</strong>` : ''}.</li>
          <li style="margin:0;">Múltiplo EBITDA aplicado: <strong>${formatNumber(valuationData.ebitdaMultipleUsed, 1)}x</strong>${valuationData.multipleLow && valuationData.multipleHigh ? ` (rango: ${formatNumber(valuationData.multipleLow, 1)}x - ${formatNumber(valuationData.multipleHigh, 1)}x)` : ''}.</li>
        </ul>
      </div>

      ${financialYearsHtml}
      ${adjustmentsHtml}

      <p style="margin:20px 0 16px; line-height:1.7; color:#374151;">
        Quedamos a su disposición para comentar el informe en detalle y resolver cualquier duda que pueda tener.
        No dude en contactarnos para agendar una reunión de presentación de resultados.
      </p>
      <p style="margin:0 0 20px; line-height:1.7; color:#374151;">
        Si lo considera oportuno, indíquenos dos o tres opciones de horario y le remitiremos la invitación. Le recordamos que esta valoración es <strong>completamente confidencial</strong>.
      </p>

      <!-- Enlaces útiles -->
      <div style="background:#ecfdf5; border:1px solid #d1fae5; border-radius:8px; padding:20px; margin:20px 0;">
        <p style="margin:0 0 12px; font-weight:600; color:#065f46;">🔗 Enlaces útiles (guarde este correo):</p>
        ${pdfUrl ? `<p style="margin:0 0 8px;"><strong>📄 Re-descargar el PDF:</strong> <a href="${pdfUrl}" target="_blank" style="color:#065f46; text-decoration:underline; font-weight:600;">Haga clic aquí</a></p>` : ''}
        <p style="margin:0;"><strong>🔢 Probar nuestra calculadora gratuita:</strong> <a href="https://capittal.es/lp/calculadora" target="_blank" style="color:#065f46; text-decoration:underline; font-weight:600;">Acceder a la calculadora</a></p>
      </div>

      <!-- Sobre Capittal -->
      <div style="background:#f8fafc; border-radius:8px; padding:20px; margin:24px 0;">
        <p style="margin:0 0 12px; font-weight:600; color:#374151;">🏢 Sobre Capittal</p>
        <ul style="margin:0 0 0 20px; padding:0; line-height:1.6; color:#4b5563;">
          <li style="margin:0 0 8px;">Equipo multidisciplinar de <strong>50 profesionales</strong> (M&A, fiscal y legal).</li>
          <li style="margin:0 0 8px;">Más de <strong>100 operaciones cerradas</strong> en 15 años.</li>
          <li style="margin:0;">Enfoque práctico y acompañamiento de principio a fin del proceso.</li>
        </ul>
      </div>

      <!-- Firma -->
      <div style="border-top:1px solid #e5e7eb; padding-top:20px; margin-top:24px;">
        <p style="margin:0 0 8px; font-size:16px; color:#374151;">Un saludo,</p>
        <p style="margin:0 0 4px; font-weight:600; color:#1a1a1a;">${advisor}</p>
        <p style="margin:0 0 16px; font-size:14px; color:#6b7280;">Capittal · Asesores en M&A</p>
      </div>

      <!-- Disclaimer inmuebles -->
      <div style="background:#fef2f2; border:2px solid #ef4444; border-radius:6px; padding:16px; margin:16px 0;">
        <p style="margin:0; font-size:14px; color:#991b1b; line-height:1.5;">
          <span style="font-size:20px; font-weight:bold;">*</span>
          <strong>Importante:</strong> Esta valoración <strong>NO incluye el valor de los inmuebles</strong> que la empresa pueda tener en su balance. Si la empresa es propietaria de bienes inmuebles, su valor debería añadirse a esta valoración de forma independiente.
        </p>
      </div>

      <!-- Nota legal -->
      <div style="background:#fef3c7; border:1px solid #fbbf24; border-radius:6px; padding:16px; margin:20px 0;">
        <p style="margin:0; font-size:12px; color:#92400e; line-height:1.5;"><strong>⚖️ Nota legal:</strong> Este contenido es orientativo y no constituye una valoración u oferta vinculante. La valoración final puede variar tras el análisis completo de la documentación (estados financieros, deuda y ajustes de EBITDA).</p>
      </div>

      <!-- Footer -->
      <div style="text-align:center; padding-top:20px; border-top:1px solid #e5e7eb; margin-top:24px;">
        <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">
          <strong>Capittal</strong> | Expertos en valoración y venta de empresas
        </p>
        <p style="margin:0 0 8px; font-size:12px; color:#9ca3af;">
          Tel: +34 695 717 490 | info@capittal.es | www.capittal.es
        </p>
        <p style="margin:0; font-size:11px; color:#9ca3af;">
          Barcelona: Carrer Ausias March, 36 Principal | Madrid: P.º de la Castellana, 11
        </p>
      </div>
      
    </div>
  </div>
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

    // Determinar destinatarios CC: usar los seleccionados por el usuario si existen, sino obtener de BD
    let internalTeam: string[];
    if (requestData.selectedRecipients && requestData.selectedRecipients.length > 0) {
      internalTeam = requestData.selectedRecipients;
      console.log('[send-professional-valuation-email] Using user-selected CC recipients:', internalTeam.length);
    } else {
      internalTeam = await getInternalRecipients();
      console.log('[send-professional-valuation-email] Using default CC recipients from DB:', internalTeam.length);
    }

    // Filtrar el email del cliente de la lista CC para evitar duplicados
    const ccRecipients = internalTeam.filter(email => 
      email.toLowerCase() !== requestData.recipientEmail.toLowerCase()
    );

    console.log('[send-professional-valuation-email] Sending email to client:', requestData.recipientEmail);
    console.log('[send-professional-valuation-email] CC recipients:', ccRecipients);
    console.log('[send-professional-valuation-email] Has attachment:', !!attachments);

    // Enviar email al cliente CON PDF adjunto y equipo en CC visible
    const clientEmailResponse = await resend.emails.send({
      from: "Capittal <valoraciones@capittal.es>",
      to: [requestData.recipientEmail],
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      subject: subject,
      html: clientEmailHtml,
      reply_to: requestData.advisorEmail || "info@capittal.es",
      attachments: attachments,
      headers: {
        "List-Unsubscribe": "<mailto:info@capittal.es?subject=unsubscribe>",
      },
    });

    console.log('[send-professional-valuation-email] Email sent with CC:', clientEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: clientEmailResponse.data?.id,
        sentTo: requestData.recipientEmail,
        pdfUrl: pdfPublicUrl,
        teamNotified: ccRecipients.length,
        ccRecipients: ccRecipients,
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

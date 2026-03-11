import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormNotificationRequest {
  submissionId: string;
  formType: 'contact' | 'collaborator' | 'newsletter' | 'calendar' | 'general_contact' | 'sell_lead' | 'operation_contact' | 'lead_magnet_download' | 'campaign_valuation' | 'exit_readiness_test';
  email: string;
  fullName: string;
  formData: any;
}

// Equipo completo que recibe notificaciones de formularios
const ADMIN_EMAILS = [
  'samuel@capittal.es',
  'marcc@capittal.es',
  'oriol@capittal.es',
  'marc@capittal.es',
  'marcel@capittal.es',
  'lluis@capittal.es',
  'albert@capittal.es',
];

// Helper functions for formatting
const getPageOriginLabel = (pageOrigin: string | undefined): string => {
  const labels: Record<string, string> = {
    'venta-empresas': 'Venta Empresas',
    'lp/venta-empresas': 'LP Venta Empresas',
    'compra-empresas': 'Compra Empresas',
    'lp/compra-empresas': 'LP Compra Empresas',
    'contact_page': 'Página de Contacto',
    'contacto': 'Página de Contacto',
    'calculadora': 'Calculadora',
    'lp/calculadora': 'LP Calculadora',
    'operation_inquiry': 'Consulta de Operación',
    'valoracion_cierre_2025': 'Campaña Valoración 2025',
  };
  return labels[pageOrigin || ''] || pageOrigin || '';
};

const formatCurrency = (amount: number | string | undefined): string => {
  if (!amount) return 'No especificado';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
  if (isNaN(num)) return String(amount);
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatRevenueRange = (range: string | undefined): string => {
  const labels: Record<string, string> = {
    'menos-500k': 'Menos de 500.000€',
    '500k-1m': '500.000€ - 1M€',
    '1m-5m': '1M€ - 5M€',
    '5m-10m': '5M€ - 10M€',
    'mas-10m': 'Más de 10M€',
  };
  return labels[range || ''] || range || 'No especificado';
};

const formatEbitdaRange = (range: string | undefined): string => {
  const labels: Record<string, string> = {
    'menos-100k': 'Menos de 100.000€',
    '100k-500k': '100.000€ - 500.000€',
    '500k-1m': '500.000€ - 1M€',
    '1m-2m': '1M€ - 2M€',
    'mas-2m': 'Más de 2M€',
  };
  return labels[range || ''] || range || 'No especificado';
};

const formatEmployeeRange = (range: string | undefined): string => {
  const labels: Record<string, string> = {
    '1-5': '1-5 empleados',
    '6-15': '6-15 empleados',
    '16-50': '16-50 empleados',
    '51-100': '51-100 empleados',
    'mas-100': 'Más de 100 empleados',
  };
  return labels[range || ''] || range || 'No especificado';
};

const formatUrgency = (urgency: string | undefined): string => {
  const labels: Record<string, string> = {
    'urgente': '🔴 Urgente (< 1 mes)',
    'corto': '🟠 Corto plazo (1-3 meses)',
    'medio': '🟡 Medio plazo (3-6 meses)',
    'largo': '🟢 Largo plazo (> 6 meses)',
  };
  return labels[urgency || ''] || urgency || 'No especificado';
};

const formatDateTime = (): string => {
  return new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  });
};

// Plantilla HTML profesional base para emails a usuarios (sin CRM, sin UTM)
const getUserEmailBaseHtml = (
  title: string,
  subtitle: string,
  contentHtml: string
): string => {
  const dateTime = formatDateTime();
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; line-height: 1.5;">
  <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">CAPITTAL</h1>
      <p style="color: #64748b; font-size: 14px; margin: 8px 0 0;">${subtitle}</p>
    </div>

    <!-- Main Card -->
    <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); overflow: hidden;">
      
      <!-- Title Bar -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 600;">${title}</h2>
        <div style="margin-top: 12px; font-size: 13px; color: #94a3b8;">
          <span>📅 ${dateTime}</span>
        </div>
      </div>

      <!-- Content -->
      <div style="padding: 24px;">
        ${contentHtml}
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px; padding: 0 16px;">
      <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">
        ¿Tienes alguna pregunta? Contáctanos en <a href="mailto:samuel@capittal.es" style="color: #2563eb; text-decoration: none;">samuel@capittal.es</a>
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        +34 695 717 490 | capittal.es
      </p>
    </div>

  </div>
</body>
</html>
  `;
};

// Plantilla HTML profesional base para emails internos
const getAdminEmailBaseHtml = (
  title: string,
  subtitle: string,
  contentHtml: string,
  pageOrigin: string,
  ctaUrl?: string,
  ctaText?: string,
  utmData?: { source?: string; medium?: string; campaign?: string }
): string => {
  const dateTime = formatDateTime();
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; line-height: 1.5;">
  <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">CAPITTAL</h1>
      <p style="color: #64748b; font-size: 14px; margin: 8px 0 0;">${subtitle}</p>
    </div>

    <!-- Main Card -->
    <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); overflow: hidden;">
      
      <!-- Title Bar -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 600;">${title}</h2>
        <div style="display: flex; gap: 16px; margin-top: 12px; font-size: 13px; color: #94a3b8;">
          <span>📅 ${dateTime}</span>
          <span>🔗 ${pageOrigin || 'Web'}</span>
        </div>
      </div>

      <!-- Content -->
      <div style="padding: 24px;">
        ${contentHtml}
      </div>

      ${ctaUrl ? `
      <!-- CTA -->
      <div style="padding: 0 24px 24px; text-align: center;">
        <a href="${ctaUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          ${ctaText || 'Ver en CRM'} →
        </a>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px; padding: 0 16px;">
      ${utmData?.source || utmData?.medium || utmData?.campaign ? `
      <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">
        UTM: ${utmData.source || '-'} / ${utmData.medium || '-'} / ${utmData.campaign || '-'}
      </p>
      ` : ''}
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        Este email fue generado automáticamente por Capittal.
      </p>
    </div>

  </div>
</body>
</html>
  `;
};

// Generar sección de datos de contacto
const getContactDataSection = (data: any): string => {
  return `
    <div style="margin-bottom: 24px;">
      <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
        👤 Datos del Contacto
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px; vertical-align: top;">Nombre</td>
          <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${data.fullName || data.full_name || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Email</td>
          <td style="padding: 10px 0;"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${data.email}</a></td>
        </tr>
        ${data.phone ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Teléfono</td>
          <td style="padding: 10px 0;"><a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${data.phone}</a></td>
        </tr>
        ` : ''}
        ${data.company ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Empresa</td>
          <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${data.company}</td>
        </tr>
        ` : ''}
        ${data.cif ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">CIF</td>
          <td style="padding: 10px 0; color: #0f172a; font-size: 14px;">${data.cif}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `;
};

// Generar sección de datos financieros
const getFinancialDataSection = (data: any): string => {
  const hasFinancialData = data.revenue || data.revenue_range || data.ebitda || data.ebitda_range || data.annualRevenue || data.employeeCount;
  
  if (!hasFinancialData) return '';

  return `
    <div style="margin-bottom: 24px;">
      <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
        💰 Datos Financieros
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${data.revenue || data.annualRevenue ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px; vertical-align: top;">Facturación</td>
          <td style="padding: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">${formatCurrency(data.revenue || data.annualRevenue)}</td>
        </tr>
        ` : data.revenue_range ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px; vertical-align: top;">Facturación</td>
          <td style="padding: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">${formatRevenueRange(data.revenue_range)}</td>
        </tr>
        ` : ''}
        ${data.ebitda ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">EBITDA</td>
          <td style="padding: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">${formatCurrency(data.ebitda)}</td>
        </tr>
        ` : data.ebitda_range ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">EBITDA</td>
          <td style="padding: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">${formatEbitdaRange(data.ebitda_range)}</td>
        </tr>
        ` : ''}
        ${data.employeeCount ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Empleados</td>
          <td style="padding: 10px 0; color: #0f172a; font-size: 14px;">${formatEmployeeRange(data.employeeCount)}</td>
        </tr>
        ` : ''}
        ${data.urgency ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Urgencia</td>
          <td style="padding: 10px 0; color: #0f172a; font-size: 14px;">${formatUrgency(data.urgency)}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  `;
};

// Generar sección de mensaje
const getMessageSection = (message: string | undefined): string => {
  if (!message) return '';
  
  return `
    <div style="margin-bottom: 24px;">
      <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
        💬 Mensaje
      </h3>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${message}</p>
      </div>
    </div>
  `;
};

const getUserConfirmationTemplate = (formType: string, data: any) => {
  const baseStyle = `
    <style>
      body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; line-height: 1.6; color: #333; }
      .header { background: #0f172a; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background: #f9f9f9; }
      .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .label { font-weight: bold; color: #0f172a; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      .cta-button { background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
    </style>
  `;

  switch (formType) {
    case 'contact':
    case 'general_contact':
      return {
        subject: `Hemos recibido tu información`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>Hemos recibido tu información</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName}</strong>,</p>
              <p>Gracias por ponerte en contacto con Capittal.</p>
              <p>Hemos recibido correctamente tu información y nuestro equipo la está revisando. En breve nos pondremos en contacto contigo para comentar los siguientes pasos y resolver cualquier duda que puedas tener.</p>
              <p>Mientras tanto, si necesitas ampliar información o quieres adelantarnos algún detalle adicional, no dudes en responder a este email.</p>
            </div>
          </div>
          <div class="footer">
            <p>Un cordial saludo,<br><strong>El equipo de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    case 'sell_lead':
      return {
        subject: `✅ Tu consulta de venta ha sido recibida - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Gracias por confiar en nosotros!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName}</strong>,</p>
              <p>Hemos recibido tu consulta sobre la venta de tu empresa <strong>${data.company}</strong>.</p>
              <p>Entendemos que esta es una decisión importante y queremos asegurarnos de brindarte el mejor asesoramiento posible.</p>
              <p>Nuestro equipo de expertos en M&A revisará tu caso y se pondrá en contacto contigo en las próximas 24 horas para programar una consulta inicial gratuita.</p>
              <p>En esta primera reunión podremos:</p>
              <ul>
                <li>Evaluar el valor potencial de tu empresa</li>
                <li>Discutir tus objetivos y expectativas</li>
                <li>Explicarte nuestro proceso de venta</li>
                <li>Resolver todas tus dudas</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de M&A de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    case 'collaborator':
      return {
        subject: `✅ Tu solicitud de colaboración ha sido recibida - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Bienvenido al programa de colaboradores!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName}</strong>,</p>
              <p>¡Gracias por tu interés en formar parte de nuestra red de colaboradores profesionales!</p>
              <p>Hemos recibido tu solicitud y estamos muy emocionados de conocer más sobre tu experiencia en <strong>${data.profession}</strong>.</p>
              <p>Nuestro equipo revisará tu perfil y se pondrá en contacto contigo en los próximos 3-5 días hábiles para programar una entrevista inicial.</p>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de RRHH de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    case 'operation_contact':
      return {
        subject: `✅ Tu interés en la operación ha sido registrado - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Gracias por tu interés!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName}</strong>,</p>
              <p>Hemos recibido tu consulta sobre la operación <strong>${data.companyName}</strong>.</p>
              <p>Nuestro equipo revisará tu perfil de inversor y se pondrá en contacto contigo en las próximas 24-48 horas para proporcionarte más información detallada sobre esta oportunidad.</p>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de Inversiones de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    case 'newsletter':
      return {
        subject: `✅ ¡Bienvenido a nuestro newsletter! - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Bienvenido a la comunidad Capittal!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>¡Hola!</p>
              <p>¡Gracias por suscribirte a nuestro newsletter!</p>
              <p>Ahora recibirás contenido exclusivo sobre tendencias M&A, valoración de empresas y oportunidades de inversión.</p>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };

    case 'campaign_valuation': {
      const contentHtml = `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            👤 Datos del Contacto
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px; vertical-align: top;">Email</td>
              <td style="padding: 10px 0;"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">CIF</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${data.cif}</td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Teléfono</td>
              <td style="padding: 10px 0;"><a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${data.phone}</a></td>
            </tr>
            ` : ''}
          </table>
        </div>
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            💰 Datos Financieros 2025
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px; vertical-align: top;">Facturación 2025</td>
              <td style="padding: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">${formatCurrency(data.revenue)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">EBITDA 2025</td>
              <td style="padding: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">${formatCurrency(data.ebitda)}</td>
            </tr>
          </table>
        </div>
        
        <!-- Próximos Pasos -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            📋 Próximos Pasos
          </h3>
          
          <!-- Paso 1 -->
          <div style="display: flex; margin-bottom: 16px;">
            <div style="background: #0f172a; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; flex-shrink: 0; margin-right: 12px;">1</div>
            <div>
              <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 14px;">Revisión (24-48h)</p>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Nuestro equipo analizará la información proporcionada sobre tu empresa.</p>
            </div>
          </div>
          
          <!-- Paso 2 -->
          <div style="display: flex; margin-bottom: 16px;">
            <div style="background: #0f172a; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; flex-shrink: 0; margin-right: 12px;">2</div>
            <div>
              <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 14px;">Contacto Personalizado</p>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Un asesor especializado se pondrá en contacto contigo para resolver dudas.</p>
            </div>
          </div>
          
          <!-- Paso 3 -->
          <div style="display: flex; margin-bottom: 16px;">
            <div style="background: #0f172a; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; flex-shrink: 0; margin-right: 12px;">3</div>
            <div>
              <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 14px;">Informe Preliminar</p>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Recibirás un primer análisis de valoración basado en los datos proporcionados.</p>
            </div>
          </div>
          
          <!-- Paso 4 -->
          <div style="display: flex; margin-bottom: 0;">
            <div style="background: #0f172a; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; flex-shrink: 0; margin-right: 12px;">4</div>
            <div>
              <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 14px;">Reunión de Presentación</p>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Agendaremos una reunión para presentar los resultados y discutir opciones estratégicas.</p>
            </div>
          </div>
        </div>
      `;
      
      return {
        subject: `Hemos recibido tu solicitud de valoración - Capittal`,
        html: getUserEmailBaseHtml(
          'Solicitud de Valoración Recibida',
          'Campaña Cierre de Año 2025',
          contentHtml
        )
      };
    }

    case 'exit_readiness_test': {
      const readinessLabel = data.readinessLevel === 'Preparado' ? '🟢 Preparado para vender' :
                             data.readinessLevel === 'En Progreso' ? '🟡 En Progreso' :
                             '🔴 Necesita Trabajo';
      
      const contentHtml = `
        <div style="margin-bottom: 24px;">
          <p style="margin: 0; color: #0f172a; font-size: 16px;">
            Hola <strong>${data.fullName}</strong>,
          </p>
          <p style="margin: 12px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
            Hemos recibido los resultados de tu Test Exit-Ready. Nuestro equipo está preparando un informe personalizado con recomendaciones detalladas basadas en tus respuestas.
          </p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #22c55e; margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            📊 Tu Resultado
          </h3>
          <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 700;">
            ${readinessLabel}
          </p>
          <p style="margin: 8px 0 0; color: #64748b; font-size: 13px;">
            Puntuación: ${data.score}/80 puntos
          </p>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            📋 Próximos Pasos
          </h3>
          
          <div style="display: flex; margin-bottom: 16px;">
            <div style="background: #0f172a; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; flex-shrink: 0; margin-right: 12px;">1</div>
            <div>
              <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 14px;">Informe IA Personalizado</p>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">En breve recibirás por email un informe detallado con análisis y recomendaciones.</p>
            </div>
          </div>
          
          <div style="display: flex; margin-bottom: 16px;">
            <div style="background: #0f172a; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; flex-shrink: 0; margin-right: 12px;">2</div>
            <div>
              <p style="margin: 0; color: #0f172a; font-weight: 600; font-size: 14px;">Contacto Personalizado</p>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Un asesor se pondrá en contacto contigo para resolver dudas.</p>
            </div>
          </div>
        </div>
      `;
      
      return {
        subject: `Tu resultado del Test Exit-Ready - Capittal`,
        html: getUserEmailBaseHtml(
          'Test Exit-Ready Completado',
          'Diagnóstico de preparación para venta',
          contentHtml
        )
      };
    }

    default:
      return {
        subject: `✅ Hemos recibido tu información - Capittal`,
        html: `
          ${baseStyle}
          <div class="header">
            <h1>¡Gracias por contactarnos!</h1>
          </div>
          <div class="content">
            <div class="info-box">
              <p>Hola <strong>${data.fullName || 'Usuario'}</strong>,</p>
              <p>Hemos recibido tu información y nos pondremos en contacto contigo muy pronto.</p>
            </div>
          </div>
          <div class="footer">
            <p>Saludos cordiales,<br><strong>El equipo de Capittal</strong></p>
            <p>📧 info@capittal.es | 🌐 capittal.es</p>
          </div>
        `
      };
  }
};

const getEmailTemplate = (formType: string, data: any) => {
  const pageOriginLabel = getPageOriginLabel(data.page_origin);
  const utmData = { source: data.utm_source, medium: data.utm_medium, campaign: data.utm_campaign };

  switch (formType) {
    case 'contact':
    case 'general_contact': {
      const contentHtml = `
        ${getContactDataSection(data)}
        ${getFinancialDataSection(data)}
        ${data.serviceType ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            🎯 Tipo de Servicio
          </h3>
          <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 500;">${data.serviceType}</span>
        </div>
        ` : ''}
        ${getMessageSection(data.message)}
      `;
      
      return {
        subject: `Nueva solicitud – ${data.company || data.fullName} – Capittal`,
        html: getAdminEmailBaseHtml(
          'Nueva Solicitud de Contacto',
          pageOriginLabel || 'Formulario de Contacto',
          contentHtml,
          pageOriginLabel || 'Web',
          data._crmLink || 'https://capittal.es/admin/crm',
          'Ver en CRM',
          utmData
        )
      };
    }

    case 'sell_lead': {
      const contentHtml = `
        ${getContactDataSection(data)}
        ${getFinancialDataSection(data)}
        ${getMessageSection(data.message)}
      `;
      
      return {
        subject: `Nueva solicitud de venta – ${data.company || data.fullName} – Capittal`,
        html: getAdminEmailBaseHtml(
          'Nueva Consulta de Venta de Empresa',
          pageOriginLabel || 'LP Venta Empresas',
          contentHtml,
          pageOriginLabel || 'LP Venta Empresas',
          data._crmLink || 'https://capittal.es/admin/crm',
          'Ver en CRM',
          utmData
        )
      };
    }

    case 'operation_contact': {
      const contentHtml = `
        ${getContactDataSection(data)}
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            🏢 Operación de Interés
          </h3>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0 0 8px; color: #0f172a; font-size: 16px; font-weight: 600;">${data.companyName}</p>
            <p style="margin: 0; color: #64748b; font-size: 13px;">
              ID: <a href="https://capittal.es/oportunidades?operation=${data.operationId}" style="color: #2563eb;">${data.operationId}</a>
            </p>
          </div>
        </div>
        ${data.serviceType ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            🎯 Tipo de Servicio
          </h3>
          <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 500;">${data.serviceType}</span>
        </div>
        ` : ''}
        ${getMessageSection(data.message)}
      `;
      
      return {
        subject: `Interés en operación – ${data.companyName} – Capittal`,
        html: getAdminEmailBaseHtml(
          'Nueva Consulta de Operación',
          'Marketplace de Operaciones',
          contentHtml,
          'Marketplace',
          `https://capittal.es/oportunidades?operation=${data.operationId}`,
          'Ver Operación',
          utmData
        )
      };
    }

    case 'lead_magnet_download': {
      const contentHtml = `
        ${getContactDataSection({ ...data, fullName: data.fullName, company: data.user_company, phone: data.user_phone })}
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            📥 Lead Magnet
          </h3>
          <span style="display: inline-block; background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 500;">ID: ${data.lead_magnet_id}</span>
        </div>
      `;
      
      return {
        subject: `Nueva descarga Lead Magnet – ${data.fullName} – Capittal`,
        html: getAdminEmailBaseHtml(
          'Nueva Descarga de Lead Magnet',
          'Lead Magnet',
          contentHtml,
          'Lead Magnet',
          data._crmLink || 'https://capittal.es/admin/crm',
          'Ver en CRM',
          utmData
        )
      };
    }

    case 'collaborator': {
      const contentHtml = `
        ${getContactDataSection(data)}
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            💼 Perfil Profesional
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px;">Profesión</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${data.profession}</td>
            </tr>
            ${data.experience ? `
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Experiencia</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px;">${data.experience}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        ${data.motivation ? getMessageSection(data.motivation) : ''}
      `;
      
      return {
        subject: `Nueva solicitud colaborador – ${data.fullName} – Capittal`,
        html: getAdminEmailBaseHtml(
          'Nueva Solicitud de Colaborador',
          'Programa de Colaboradores',
          contentHtml,
          'Colaboradores',
          data._crmLink || 'https://capittal.es/admin/crm',
          'Ver en CRM',
          utmData
        )
      };
    }

    case 'newsletter':
      return {
        subject: `Nueva suscripción newsletter – ${data.email} – Capittal`,
        html: getAdminEmailBaseHtml(
          'Nueva Suscripción Newsletter',
          'Newsletter',
          `
            <div style="text-align: center; padding: 20px;">
              <p style="color: #64748b; margin: 0 0 8px;">Nuevo suscriptor:</p>
              <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0;">
                <a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a>
              </p>
            </div>
          `,
          'Newsletter',
          undefined,
          undefined,
          utmData
        )
      };

    case 'calendar': {
      const contentHtml = `
        ${getContactDataSection({ fullName: data.clientName, email: data.clientEmail, phone: data.clientPhone, company: data.companyName })}
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            📅 Detalles de la Reunión
          </h3>
          <div style="background: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Fecha</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${data.bookingDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Hora</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${data.bookingTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Tipo</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${data.meetingType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Formato</td>
                <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${data.meetingFormat}</td>
              </tr>
            </table>
          </div>
        </div>
        ${data.notes ? getMessageSection(data.notes) : ''}
      `;
      
      return {
        subject: `Nueva reserva reunión – ${data.clientName} – ${data.bookingDate} – Capittal`,
        html: getAdminEmailBaseHtml(
          'Nueva Reserva de Reunión',
          'Sistema de Reservas',
          contentHtml,
          'Calendario',
          'https://capittal.es/admin/calendario',
          'Ver Calendario',
          utmData
        )
      };
    }

    case 'campaign_valuation': {
      const contentHtml = `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            👤 Datos del Contacto
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px; vertical-align: top;">Email</td>
              <td style="padding: 10px 0;"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${data.email}</a></td>
            </tr>
            <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">CIF</td>
          <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${data.cif}</td>
        </tr>
        ${data.phone ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">📱 Teléfono</td>
          <td style="padding: 10px 0;"><a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${data.phone}</a></td>
        </tr>
        ` : ''}
      </table>
    </div>
    <div style="margin-bottom: 24px;">
      <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
        💰 Datos Financieros 2025
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px; vertical-align: top;">Facturación 2025</td>
          <td style="padding: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">${formatCurrency(data.revenue)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">EBITDA 2025</td>
          <td style="padding: 10px 0; color: #059669; font-size: 16px; font-weight: 700;">${formatCurrency(data.ebitda)}</td>
        </tr>
      </table>
    </div>
  `;
      
      return {
        subject: `🎯 Nueva Solicitud – Campaña Valoración 2025 – Capittal`,
        html: getAdminEmailBaseHtml(
          '📈 Nueva Solicitud de Valoración',
          'Campaña Cierre de Año 2025',
          contentHtml,
          'valoracion_cierre_2025',
          data._crmLink || 'https://capittal.es/admin/crm',
          'Ver en CRM',
          { source: data.utmSource, medium: data.utmMedium, campaign: data.utmCampaign }
        )
      };
    }

    case 'exit_readiness_test': {
      const readinessLabel = data.readinessLevel === 'Preparado' ? '🟢 Preparado' :
                             data.readinessLevel === 'En Progreso' ? '🟡 En Progreso' :
                             '🔴 Necesita Trabajo';
      
      const contentHtml = `
        ${getContactDataSection(data)}
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            📊 Resultado del Test
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 140px; vertical-align: top;">Puntuación</td>
              <td style="padding: 10px 0; color: #059669; font-size: 18px; font-weight: 700;">${data.score}/80 puntos</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Nivel de Preparación</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 16px; font-weight: 600;">${readinessLabel}</td>
            </tr>
          </table>
        </div>
        ${data.testId ? `
        <div style="margin-bottom: 16px;">
          <span style="color: #64748b; font-size: 12px;">Test ID: ${data.testId}</span>
        </div>
        ` : ''}
      `;
      
      return {
        subject: `🎯 Nuevo Test Exit-Ready – ${data.fullName} (${data.company || 'Sin empresa'}) – Capittal`,
        html: getAdminEmailBaseHtml(
          '📊 Nuevo Test Exit-Ready Completado',
          'Diagnóstico de preparación para venta',
          contentHtml,
          'exit_readiness_test',
          'https://capittal.es/admin/recursos/exit-ready',
          'Ver en Admin',
          utmData
        )
      };
    }

    case 'operation_inquiry': {
      const contentHtml = `
        ${getContactDataSection(data)}
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            🏢 Operación de Interés
          </h3>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0 0 8px; color: #0f172a; font-size: 16px; font-weight: 600;">${data.companyName || 'Operación'}</p>
            ${data.operationId ? `<p style="margin: 0; color: #64748b; font-size: 13px;">ID: <a href="https://capittal.es/oportunidades?operation=${data.operationId}" style="color: #2563eb;">${data.operationId}</a></p>` : ''}
          </div>
        </div>
        ${data.serviceType ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px;">
            🎯 Tipo de Servicio
          </h3>
          <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 500;">${data.serviceType}</span>
        </div>
        ` : ''}
        ${getMessageSection(data.message)}
      `;
      
      return {
        subject: `Interés en operación – ${data.companyName || 'Marketplace'} – Capittal`,
        html: getAdminEmailBaseHtml(
          '🏢 Nueva Consulta de Operación',
          'Marketplace de Operaciones',
          contentHtml,
          'Marketplace',
          data.operationId ? `https://capittal.es/oportunidades?operation=${data.operationId}` : 'https://capittal.es/oportunidades',
          'Ver Operación',
          utmData
        )
      };
    }

    default:
      return {
        subject: `Nueva submission – ${formType} – Capittal`,
        html: getAdminEmailBaseHtml(
          `Nueva Submission: ${formType}`,
          'Formulario',
          `
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
              <pre style="margin: 0; font-size: 12px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
            </div>
          `,
          'Web',
          data._crmLink || 'https://capittal.es/admin/crm',
          'Ver en CRM',
          utmData
        )
      };
  }
};

// ============= LEAD UPSERT LOGIC =============
// Creates or updates a lead in contact_leads before sending emails

interface LeadUpsertResult {
  leadId: string | null;
  error?: string;
}

function mapFormTypeToChannel(formType: string): string {
  const map: Record<string, string> = {
    contact: 'web',
    general_contact: 'web',
    sell_lead: 'web',
    operation_contact: 'marketplace',
    operation_inquiry: 'marketplace',
    campaign_valuation: 'campaña',
    lead_magnet_download: 'lead_magnet',
    exit_readiness_test: 'web',
    collaborator: 'web',
    calendar: 'web',
  };
  return map[formType] || 'web';
}

function mapFormTypeToServiceType(formType: string, formData: any): string | null {
  const validServiceTypes = ['venta_empresas', 'due_diligence', 'valoraciones', 'asesoramiento_legal', 'planificacion_fiscal', 'reestructuraciones'];
  
  switch (formType) {
    case 'sell_lead':
      return 'venta_empresas';
    case 'campaign_valuation':
      return 'valoraciones';
    case 'contact':
    case 'general_contact': {
      // Try to map the serviceType from formData to enum
      const st = formData?.serviceType?.toLowerCase()?.replace(/\s+/g, '_');
      if (st && validServiceTypes.includes(st)) return st;
      if (formData?.serviceType?.includes('venta') || formData?.serviceType?.includes('Venta')) return 'venta_empresas';
      if (formData?.serviceType?.includes('valoraci') || formData?.serviceType?.includes('Valoraci')) return 'valoraciones';
      return null;
    }
    default:
      return null;
  }
}

async function upsertLeadFromForm(
  email: string,
  fullName: string,
  formType: string,
  formData: any
): Promise<LeadUpsertResult> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const company = formData.company || formData.companyName || '';
    const phone = formData.phone || null;
    const cif = formData.cif || null;
    const channel = mapFormTypeToChannel(formType);
    const serviceType = mapFormTypeToServiceType(formType, formData);

    // Handle potentially negative financial data
    let revenue: number | null = null;
    let ebitda: number | null = null;
    let financialNotes = '';

    const rawRevenue = formData.revenue || formData.annualRevenue;
    if (rawRevenue !== undefined && rawRevenue !== null) {
      const numRevenue = typeof rawRevenue === 'string' ? parseFloat(rawRevenue.replace(/[^\d.-]/g, '')) : Number(rawRevenue);
      if (!isNaN(numRevenue)) {
        if (numRevenue < 0) {
          financialNotes += `Facturación introducida: ${numRevenue}€ (valor sospechoso). `;
        } else {
          revenue = numRevenue;
        }
      }
    }

    const rawEbitda = formData.ebitda;
    if (rawEbitda !== undefined && rawEbitda !== null) {
      const numEbitda = typeof rawEbitda === 'string' ? parseFloat(rawEbitda.replace(/[^\d.-]/g, '')) : Number(rawEbitda);
      if (!isNaN(numEbitda)) {
        if (numEbitda < 0) {
          financialNotes += `EBITDA introducido: ${numEbitda}€ (valor sospechoso). `;
        } else {
          ebitda = numEbitda;
        }
      }
    }

    // Build message/notes
    const messageParts: string[] = [];
    if (formData.message) messageParts.push(formData.message);
    if (financialNotes) messageParts.push(`[Datos sospechosos] ${financialNotes.trim()}`);
    if (formData.operationId) messageParts.push(`Operación: ${formData.operationId}`);
    if (formData.lead_magnet_id) messageParts.push(`Lead Magnet: ${formData.lead_magnet_id}`);
    const fullMessage = messageParts.join(' | ') || null;

    // 1. Deduplicate by email
    const { data: existingLead } = await supabase
      .from('contact_leads')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (existingLead) {
      // UPDATE existing lead
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (company) updatePayload.company = company;
      if (phone) updatePayload.phone = phone;
      if (cif) updatePayload.cif = cif;

      await supabase
        .from('contact_leads')
        .update(updatePayload)
        .eq('id', existingLead.id);

      // Add activity
      await supabase
        .from('lead_activities')
        .insert({
          lead_id: existingLead.id,
          lead_type: 'contact_leads',
          activity_type: 'form_submission',
          description: `Nueva solicitud (${formType}) desde ${channel}`,
          metadata: {
            formType,
            channel,
            message: fullMessage,
            revenue,
            ebitda,
            page_origin: formData.page_origin,
          },
        });

      console.log(`[upsertLead] Updated existing lead ${existingLead.id}`);
      return { leadId: existingLead.id };
    }

    // 2. New lead - upsert empresa
    let empresaId: string | null = null;
    if (company) {
      const { data: existingEmpresa } = await supabase
        .from('empresas')
        .select('id')
        .ilike('nombre', company.trim())
        .limit(1)
        .maybeSingle();

      if (existingEmpresa) {
        empresaId = existingEmpresa.id;
      } else {
        const { data: newEmpresa } = await supabase
          .from('empresas')
          .insert({
            nombre: company.trim(),
            cif: cif || null,
            facturacion: revenue,
          })
          .select('id')
          .single();
        empresaId = newEmpresa?.id || null;
      }
    }

    // 3. Upsert contacto
    let contactoId: string | null = null;
    const { data: existingContacto } = await supabase
      .from('contactos')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (existingContacto) {
      contactoId = existingContacto.id;
    } else {
      const nameParts = fullName.trim().split(' ');
      const nombre = nameParts[0] || '';
      const apellidos = nameParts.slice(1).join(' ') || null;

      const { data: newContacto } = await supabase
        .from('contactos')
        .insert({
          nombre,
          apellidos,
          email: normalizedEmail,
          telefono: phone,
          empresa_principal_id: empresaId,
        })
        .select('id')
        .single();
      contactoId = newContacto?.id || null;
    }

    // 4. Insert contact_lead
    const insertPayload: Record<string, any> = {
      full_name: fullName,
      email: normalizedEmail,
      company: company || 'No especificada',
      phone,
      status: 'new',
      lead_status_crm: 'nuevo',
      empresa_id: empresaId,
      crm_contacto_id: contactoId,
      lead_received_at: new Date().toISOString(),
      lead_entry_date: new Date().toISOString(),
    };

    if (serviceType) insertPayload.service_type = serviceType;
    if (cif) insertPayload.cif = cif;
    if (fullMessage) insertPayload.notes = fullMessage;

    const { data: newLead, error: insertError } = await supabase
      .from('contact_leads')
      .insert(insertPayload)
      .select('id')
      .single();

    if (insertError) {
      console.error(`[upsertLead] Insert failed:`, insertError);
      return { leadId: null, error: insertError.message };
    }

    // Add activity for new lead
    if (newLead) {
      await supabase
        .from('lead_activities')
        .insert({
          lead_id: newLead.id,
          lead_type: 'contact_leads',
          activity_type: 'form_submission',
          description: `Lead creado desde formulario (${formType})`,
          metadata: {
            formType,
            channel,
            message: fullMessage,
            revenue,
            ebitda,
            page_origin: formData.page_origin,
          },
        });
    }

    console.log(`[upsertLead] Created new lead ${newLead?.id}`);
    return { leadId: newLead?.id || null };
  } catch (err: any) {
    console.error(`[upsertLead] Unexpected error:`, err);
    return { leadId: null, error: err.message };
  }
}

// Helper para respetar rate limit de Resend (2 emails/segundo)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const { submissionId, formType, email, fullName, formData }: FormNotificationRequest = await req.json();

    console.log(`Processing form notification: type=${formType}, submissionId=${submissionId}`);

    // ====== STEP 1: Upsert lead BEFORE sending emails ======
    let leadId: string | null = null;
    const skipLeadCreation = ['newsletter', 'calendar'].includes(formType);
    
    if (!skipLeadCreation) {
      const leadResult = await upsertLeadFromForm(email, fullName, formType, formData);
      leadId = leadResult.leadId;
      if (leadResult.error) {
        console.error(`[handler] Lead upsert failed (will continue with email): ${leadResult.error}`);
      } else {
        console.log(`[handler] Lead upserted successfully: ${leadId}`);
      }
    }

    // Build CRM link with real leadId
    const crmLink = leadId
      ? `https://capittal.es/admin/contacts/${leadId}`
      : 'https://capittal.es/admin/crm';

    // ====== STEP 2: Generate email templates ======
    const adminTemplate = getEmailTemplate(formType, { 
      email, 
      fullName, 
      ...formData,
      _crmLink: crmLink,
    });

    const userTemplate = getUserConfirmationTemplate(formType, {
      email,
      fullName,
      ...formData
    });

    // ====== STEP 3: Fetch dynamic recipients from email_recipients_config ======
    let dynamicEmails: string[] = [];
    let dynamicBccEmails: string[] = [];
    try {
      const { data: allActive } = await supabase
        .from('email_recipients_config')
        .select('email, is_default_copy')
        .eq('is_active', true);
      
      if (allActive && allActive.length > 0) {
        dynamicEmails = allActive.map((r: any) => r.email);
        dynamicBccEmails = allActive.filter((r: any) => r.is_default_copy).map((r: any) => r.email);
        console.log(`[dynamic] Fetched ${dynamicEmails.length} active recipients, ${dynamicBccEmails.length} with default_copy`);
      }
    } catch (e) {
      console.error('[dynamic] Error fetching email_recipients_config, using hardcoded fallback:', e);
    }

    // Merge hardcoded + dynamic, deduplicate
    const allAdminEmails = [...new Set([...ADMIN_EMAILS, ...dynamicEmails])];

    // Enviar emails a administradores con delay para respetar rate limit
    console.log(`Enviando ${allAdminEmails.length} emails admin para submissionId=${submissionId}...`);
    const adminEmailResults = [];
    
    for (const adminEmail of allAdminEmails) {
      try {
        const result = await resend.emails.send({
          from: "Capittal Forms <notificaciones@capittal.es>",
          to: [adminEmail],
          reply_to: email, // Reply-To al email del lead
          subject: adminTemplate.subject,
          html: adminTemplate.html,
        });
        adminEmailResults.push({ status: 'fulfilled', value: result });
        console.log(`✅ Email admin enviado correctamente`);
      } catch (error) {
        adminEmailResults.push({ status: 'rejected', reason: error });
        console.error(`❌ Error enviando email admin:`, error);
      }
      
      // Delay de 500ms entre emails (respeta límite de 2 req/segundo)
      await delay(500);
    }

    // Enviar email de confirmación al usuario
    console.log(`Enviando email de confirmación al usuario (type=${formType})...`);
    let userResult;
    try {
      // Configuración especial para campaign_valuation
      const isCampaignValuation = formType === 'campaign_valuation';
      
      // BCC interno para control de calidad (copia oculta al equipo)
      const CONFIRMATION_BCC_EMAILS = [
        'samuel@capittal.es',
        'lluis@capittal.es',
        'oriol@capittal.es'
      ];
      
      const result = await resend.emails.send({
        from: isCampaignValuation 
          ? "Samuel Navarro - Capittal <samuel@capittal.es>"
          : "Capittal <info@capittal.es>",
        to: [email],
        bcc: CONFIRMATION_BCC_EMAILS, // Copia oculta al equipo interno
        cc: isCampaignValuation ? ["lluis@capittal.es"] : undefined,
        reply_to: isCampaignValuation ? "samuel@capittal.es" : undefined,
        subject: userTemplate.subject,
        html: userTemplate.html,
      });
      userResult = { status: 'fulfilled', value: result };
      console.log(`✅ Email de confirmación enviado correctamente`);
    } catch (error) {
      userResult = { status: 'rejected', reason: error };
      console.error(`❌ Error enviando confirmación:`, error);
    }

    const allAdminSuccessful = adminEmailResults.every(result => result.status === 'fulfilled');
    const userEmailSuccessful = userResult.status === 'fulfilled';
    
    const firstAdminSuccess = adminEmailResults.find(result => result.status === 'fulfilled');

    // Actualizar estado en base de datos
    if (allAdminSuccessful || userEmailSuccessful) {
      await supabase
        .from('form_submissions')
        .update({
          email_sent: allAdminSuccessful,
          email_sent_at: new Date().toISOString(),
          email_message_id: firstAdminSuccess?.status === 'fulfilled' ? firstAdminSuccess.value.data?.id : null
        })
        .eq('id', submissionId);
    }

    // Logging detallado
    if (allAdminSuccessful) {
      console.log(`Admin notification emails sent successfully for submission ${submissionId}`);
    } else {
      console.error(`Some admin emails failed for submission ${submissionId}:`, adminEmailResults);
    }

    if (userEmailSuccessful) {
      console.log(`User confirmation email sent successfully for submission ${submissionId}`);
    } else {
      console.error(`User confirmation email failed for submission ${submissionId}:`, userResult.status === 'rejected' ? userResult.reason : 'Unknown error');
    }

    return new Response(
      JSON.stringify({ 
        success: allAdminSuccessful && userEmailSuccessful,
        adminEmailsSuccess: allAdminSuccessful,
        userEmailSuccess: userEmailSuccessful,
        adminResults: adminEmailResults.map(r => r.status === 'fulfilled' ? r.value : r.reason),
        userResult: userResult.status === 'fulfilled' ? userResult.value : userResult.reason
      }), 
      {
        status: (allAdminSuccessful && userEmailSuccessful) ? 200 : 207,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-form-notifications function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

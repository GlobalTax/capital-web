export type SeasonalType = 'new_year' | 'summer' | 'q1_review' | 'q4_closing';

export interface SeasonalConfig {
  id: SeasonalType;
  label: string;
  description: string;
  defaultSubject: string;
  typicalMonth: string;
  icon: string;
}

export const SEASONAL_TYPES: SeasonalConfig[] = [
  {
    id: 'new_year',
    label: 'Año Nuevo',
    description: 'Campaña de inicio de año para valoración de empresas',
    defaultSubject: '¡Feliz Año Nuevo! – Empieza {year} conociendo el valor de tu empresa',
    typicalMonth: 'Enero',
    icon: '🎉',
  },
  {
    id: 'q1_review',
    label: 'Cierre Q1',
    description: 'Balance del primer trimestre y objetivos Q2',
    defaultSubject: 'Cierre Q1 {year} – ¿Conoces el valor de tu empresa?',
    typicalMonth: 'Abril',
    icon: '📊',
  },
  {
    id: 'summer',
    label: 'Verano',
    description: 'Campaña pre-vacaciones de reactivación',
    defaultSubject: 'Antes del verano – Valora tu empresa con Capittal',
    typicalMonth: 'Junio',
    icon: '☀️',
  },
  {
    id: 'q4_closing',
    label: 'Cierre de Año',
    description: 'Reflexión del año y planificación del siguiente',
    defaultSubject: 'Cierre {year} – Planifica el próximo año con claridad',
    typicalMonth: 'Diciembre',
    icon: '📈',
  },
];

export const getSeasonalConfig = (type: SeasonalType): SeasonalConfig => {
  return SEASONAL_TYPES.find((t) => t.id === type) || SEASONAL_TYPES[0];
};

export function generateNewYearHtml(year: number = new Date().getFullYear()): string {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="es" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>¡Feliz Año Nuevo ${year}! – Capittal</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; }
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #f8fafc;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .header-section {
      background-color: #0f172a;
      padding: 40px 30px;
      text-align: center;
    }
    
    .header-title {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    }
    
    .header-subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin: 0;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    }
    
    .golden-line {
      height: 4px;
      background-color: #f59e0b;
      margin: 0;
    }
    
    .content-section {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 20px 0;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    }
    
    .message-text {
      font-size: 16px;
      line-height: 1.7;
      color: #334155;
      margin: 0 0 24px 0;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    }
    
    .cta-section {
      text-align: center;
      padding: 30px 0;
    }
    
    .cta-button {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      margin: 8px;
    }
    
    .cta-button-secondary {
      display: inline-block;
      background-color: #ffffff;
      color: #0f172a !important;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      border: 2px solid #0f172a;
      margin: 8px;
    }
    
    .footer-section {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
    }
    
    .footer-text {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 16px 0;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    }
    
    .footer-link {
      color: #0f172a;
      text-decoration: underline;
    }
    
    .unsubscribe-text {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 20px;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
    }
    
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .content-section { padding: 30px 20px !important; }
      .header-section { padding: 30px 20px !important; }
      .header-title { font-size: 24px !important; }
      .greeting { font-size: 20px !important; }
      .message-text { font-size: 15px !important; }
      .cta-button, .cta-button-secondary { 
        display: block !important; 
        width: 100% !important; 
        margin: 8px 0 !important;
        text-align: center !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <center style="width: 100%; background-color: #f8fafc; padding: 40px 0;">
    <!--[if mso]>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">
    <tr>
    <td>
    <![endif]-->
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-container">
      <!-- Header -->
      <tr>
        <td class="header-section" style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
          <!--[if mso]>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
          <td style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
          <![endif]-->
          <h1 class="header-title" style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">CAPITTAL</h1>
          <p class="header-subtitle" style="color: #94a3b8; font-size: 14px; margin: 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">${currentDate}</p>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
      
      <!-- Golden Line -->
      <tr>
        <td class="golden-line" style="height: 4px; background-color: #f59e0b;"></td>
      </tr>
      
      <!-- Content -->
      <tr>
        <td class="content-section" style="background-color: #ffffff; padding: 40px 30px;">
          <h2 class="greeting" style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 20px 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">¡Feliz Año Nuevo, {{contact.FIRSTNAME}}!</h2>
          
          <p class="message-text" style="font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 24px 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
            Desde <strong>Capittal</strong> te deseamos un próspero ${year} lleno de éxitos y nuevas oportunidades.
          </p>
          
          <p class="message-text" style="font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 24px 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
            El comienzo de año es el momento ideal para <strong>reflexionar sobre el valor de tu empresa</strong> y planificar los próximos pasos. Ya sea que estés considerando una venta, una fusión, una ampliación de capital o simplemente quieras conocer tu posición en el mercado, estamos aquí para ayudarte.
          </p>
          
          <p class="message-text" style="font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 32px 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
            Te invitamos a descubrir el valor estimado de tu empresa con nuestra <strong>calculadora gratuita</strong>, o a solicitar una <strong>valoración profesional personalizada</strong> con nuestro equipo de expertos.
          </p>
          
          <!-- CTAs -->
          <div class="cta-section" style="text-align: center; padding: 30px 0;">
            <!--[if mso]>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
            <td style="padding: 8px;">
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://capittal.es/lp/calculadora?utm_source=brevo&utm_medium=email&utm_campaign=newyear_${year}&utm_content=cta_quick_valuation" style="height: 50px; v-text-anchor: middle; width: 250px;" arcsize="16%" strokecolor="#0f172a" fillcolor="#0f172a">
              <w:anchorlock/>
              <center style="color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Valoración Rápida Online</center>
            </v:roundrect>
            </td>
            </tr>
            </table>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="https://capittal.es/lp/calculadora?utm_source=brevo&utm_medium=email&utm_campaign=newyear_${year}&utm_content=cta_quick_valuation" class="cta-button" style="display: inline-block; background-color: #0f172a; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 8px;">Valoración Rápida Online</a>
            <!--<![endif]-->
            
            <br><br>
            
            <!--[if mso]>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
            <td style="padding: 8px;">
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://capittal.es/contacto?utm_source=brevo&utm_medium=email&utm_campaign=newyear_${year}&utm_content=cta_professional_valuation" style="height: 50px; v-text-anchor: middle; width: 280px;" arcsize="16%" strokecolor="#0f172a" fillcolor="#ffffff">
              <w:anchorlock/>
              <center style="color: #0f172a; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold;">Solicitar Valoración Profesional</center>
            </v:roundrect>
            </td>
            </tr>
            </table>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="https://capittal.es/contacto?utm_source=brevo&utm_medium=email&utm_campaign=newyear_${year}&utm_content=cta_professional_valuation" class="cta-button-secondary" style="display: inline-block; background-color: #ffffff; color: #0f172a !important; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 16px; font-weight: 600; font-family: 'Plus Jakarta Sans', Arial, sans-serif; border: 2px solid #0f172a; margin: 8px;">Solicitar Valoración Profesional</a>
            <!--<![endif]-->
          </div>
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td class="footer-section" style="background-color: #f8fafc; padding: 30px; text-align: center;">
          <p class="footer-text" style="font-size: 13px; color: #64748b; margin: 0 0 16px 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
            <strong>Capittal</strong> – Asesoramiento en M&A y valoración de empresas<br>
            <a href="https://capittal.es?utm_source=brevo&utm_medium=email&utm_campaign=newyear_${year}&utm_content=footer_website" class="footer-link" style="color: #0f172a; text-decoration: underline;">capittal.es</a> | 
            <a href="mailto:info@capittal.es" class="footer-link" style="color: #0f172a; text-decoration: underline;">info@capittal.es</a>
          </p>
          
          <p class="unsubscribe-text" style="font-size: 11px; color: #94a3b8; margin-top: 20px; font-family: 'Plus Jakarta Sans', Arial, sans-serif;">
            Si no deseas recibir más comunicaciones, puedes <a href="{{unsubscribe}}" style="color: #94a3b8; text-decoration: underline;">darte de baja aquí</a>.
          </p>
        </td>
      </tr>
    </table>
    
    <!--[if mso]>
    </td>
    </tr>
    </table>
    <![endif]-->
  </center>
</body>
</html>`;
}

export function generateSeasonalHtml(type: SeasonalType, year: number): string {
  switch (type) {
    case 'new_year':
      return generateNewYearHtml(year);
    // Future seasonal templates can be added here
    case 'q1_review':
    case 'summer':
    case 'q4_closing':
      // Placeholder - returns New Year template for now
      return generateNewYearHtml(year);
    default:
      return generateNewYearHtml(year);
  }
}

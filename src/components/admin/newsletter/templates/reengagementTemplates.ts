// Re-engagement email templates for Brevo
// Uses Brevo variables: {{contact.FIRSTNAME}}, {{contact.COMPANY}}, {{contact.SECTOR}}, {{contact.VALUATION}}

export type ReengagementType = 'abandoned' | 'reactivation' | 'value_added' | 'revaluation' | 'nurturing';

export interface ReengagementConfig {
  id: ReengagementType;
  label: string;
  description: string;
  brevoSegment: string;
  triggerCondition: string;
  defaultSubject: string;
}

export const REENGAGEMENT_TYPES: ReengagementConfig[] = [
  {
    id: 'abandoned',
    label: 'Valoración Abandonada',
    description: 'Leads que empezaron pero no completaron la valoración',
    brevoSegment: 'valuation_status = "started"',
    triggerCondition: '24-48h después de abandono',
    defaultSubject: '{{contact.FIRSTNAME}}, tu valoración está esperando',
  },
  {
    id: 'reactivation',
    label: 'Reactivación Suave',
    description: 'Leads inactivos 30+ días',
    brevoSegment: 'last_activity > 30 días',
    triggerCondition: '30 días sin actividad',
    defaultSubject: '¿Sigues pensando en vender {{contact.COMPANY}}?',
  },
  {
    id: 'value_added',
    label: 'Valor Añadido',
    description: 'Información de valor sobre su sector',
    brevoSegment: 'completed_valuation = true',
    triggerCondition: '45-60 días post-valoración',
    defaultSubject: 'Múltiplos actualizados para {{contact.SECTOR}}',
  },
  {
    id: 'revaluation',
    label: 'Re-valorización',
    description: 'Invitación a actualizar valoración (6+ meses)',
    brevoSegment: 'valuation_date < 6 meses',
    triggerCondition: '6 meses desde última valoración',
    defaultSubject: '{{contact.FIRSTNAME}}, ¿ha cambiado el valor de {{contact.COMPANY}}?',
  },
  {
    id: 'nurturing',
    label: 'Nurturing Mensual',
    description: 'Contenido periódico de valor',
    brevoSegment: 'is_active = true',
    triggerCondition: 'Mensual',
    defaultSubject: 'Novedades del mercado M&A – {{current_month}}',
  },
];

const baseStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { background-color: #f5f5f5; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; text-align: center; }
    .logo { color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px; margin: 0; }
    .logo-accent { color: #c9a55c; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 22px; font-weight: 600; color: #1a1a2e; margin: 0 0 20px 0; }
    .text { font-size: 16px; line-height: 1.7; color: #4a5568; margin: 0 0 20px 0; }
    .highlight-box { background: linear-gradient(135deg, #f8f6f0 0%, #faf9f7 100%); border-left: 4px solid #c9a55c; padding: 24px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .highlight-title { font-size: 14px; font-weight: 600; color: #c9a55c; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0; }
    .highlight-value { font-size: 28px; font-weight: 700; color: #1a1a2e; margin: 0; }
    .cta-container { text-align: center; margin: 32px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #c9a55c 0%, #b8956e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .secondary-cta { display: inline-block; color: #1a1a2e; text-decoration: none; padding: 12px 24px; font-weight: 500; font-size: 14px; border: 2px solid #e2e8f0; border-radius: 8px; margin-top: 12px; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 32px 0; }
    .stats-grid { display: table; width: 100%; margin: 24px 0; }
    .stat-item { display: table-cell; text-align: center; padding: 20px; background: #f8fafc; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0; }
    .stat-label { font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0 0 0; }
    .footer { background: #1a1a2e; padding: 30px; text-align: center; }
    .footer-text { color: #a0aec0; font-size: 13px; margin: 0 0 16px 0; }
    .footer-link { color: #c9a55c; text-decoration: none; }
    .unsubscribe { color: #718096; font-size: 11px; margin-top: 20px; }
    .unsubscribe a { color: #718096; text-decoration: underline; }
    .tip-box { background: #eef2ff; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .tip-icon { font-size: 20px; margin-right: 8px; }
    .tip-text { font-size: 14px; color: #4338ca; margin: 0; }
    .bullet-list { padding-left: 20px; margin: 16px 0; }
    .bullet-list li { color: #4a5568; margin: 8px 0; line-height: 1.6; }
  </style>
`;

const generateHeader = () => `
  <div class="header">
    <h1 class="logo">CAPI<span class="logo-accent">TT</span>AL</h1>
  </div>
`;

const generateFooter = (campaign: string = 'reengagement') => `
  <div class="footer">
    <p class="footer-text">
      <a href="https://capittal.es?utm_source=brevo&utm_medium=email&utm_campaign=${campaign}&utm_content=footer_logo" class="footer-link">capittal.es</a> | 
      <a href="mailto:info@capittal.es" class="footer-link">info@capittal.es</a>
    </p>
    <p class="footer-text">Especialistas en M&A y valoración de empresas</p>
    <p class="unsubscribe">
      <a href="{{unsubscribe}}">Darme de baja</a> | 
      <a href="{{update_profile}}">Actualizar preferencias</a>
    </p>
  </div>
`;

// 1. Valoración Abandonada
export const generateAbandonedValuationHtml = (): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Completa tu valoración</title>
  ${baseStyles}
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${generateHeader()}
      
      <div class="content">
        <h2 class="greeting">Hola {{contact.FIRSTNAME}},</h2>
        
        <p class="text">
          Vimos que empezaste a valorar <strong>{{contact.COMPANY}}</strong> pero no llegaste a ver el resultado. 
          Entendemos que a veces surgen imprevistos.
        </p>
        
        <div class="highlight-box">
          <p class="highlight-title">Tu valoración está lista</p>
          <p class="highlight-value">Solo faltan 2 minutos</p>
        </div>
        
        <p class="text">
          Completar la valoración te dará una estimación del valor de tu empresa basada en múltiplos reales 
          de transacciones en el sector <strong>{{contact.SECTOR}}</strong>.
        </p>
        
        <div class="cta-container">
          <a href="https://capittal.es/lp/calculadora?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_abandoned&utm_content=cta_complete_valuation" class="cta-button">
            Completar mi valoración →
          </a>
        </div>
        
        <div class="tip-box">
          <p class="tip-text">
            <span class="tip-icon">💡</span>
            <strong>¿Sabías que...?</strong> El 73% de los empresarios que completan la valoración 
            descubren que su empresa vale más de lo que pensaban.
          </p>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px; color: #718096;">
          Si tienes dudas sobre el proceso o necesitas ayuda, responde a este email. 
          Estaremos encantados de ayudarte.
        </p>
      </div>
      
      ${generateFooter('reengagement_abandoned')}
    </div>
  </div>
</body>
</html>
  `.trim();
};

// 2. Reactivación Suave
export const generateReactivationHtml = (): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¿Sigues pensando en vender?</title>
  ${baseStyles}
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${generateHeader()}
      
      <div class="content">
        <h2 class="greeting">Hola {{contact.FIRSTNAME}},</h2>
        
        <p class="text">
          Hace un tiempo valoraste <strong>{{contact.COMPANY}}</strong> con nosotros. 
          Queríamos saber cómo van las cosas y si podemos ayudarte de alguna manera.
        </p>
        
        <p class="text">
          Desde entonces, hemos visto movimiento interesante en el mercado de <strong>{{contact.SECTOR}}</strong>:
        </p>
        
        <div class="stats-grid">
          <div class="stat-item" style="border-right: 1px solid #e2e8f0;">
            <p class="stat-value">+12%</p>
            <p class="stat-label">Múltiplos EBITDA</p>
          </div>
          <div class="stat-item" style="border-right: 1px solid #e2e8f0;">
            <p class="stat-value">23</p>
            <p class="stat-label">Operaciones cerradas</p>
          </div>
          <div class="stat-item">
            <p class="stat-value">6.2x</p>
            <p class="stat-label">Múltiplo medio</p>
          </div>
        </div>
        
        <p class="text">
          Si en algún momento quieres retomar la conversación o simplemente entender 
          mejor tus opciones, estamos aquí para ayudarte. Sin compromiso.
        </p>
        
        <div class="cta-container">
          <a href="https://capittal.es/contacto?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_reactivation&utm_content=cta_contact" class="cta-button">
            Hablemos sin compromiso
          </a>
          <br>
          <a href="https://capittal.es/lp/calculadora?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_reactivation&utm_content=cta_update_valuation" class="secondary-cta">
            Actualizar mi valoración
          </a>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px; color: #718096;">
          PD: Si ya no estás interesado, no te preocupes. Puedes 
          <a href="{{unsubscribe}}" style="color: #c9a55c;">actualizar tus preferencias</a> 
          en cualquier momento.
        </p>
      </div>
      
      ${generateFooter('reengagement_reactivation')}
    </div>
  </div>
</body>
</html>
  `.trim();
};

// 3. Valor Añadido (Múltiplos del sector)
export const generateValueAddedHtml = (): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Múltiplos actualizados para tu sector</title>
  ${baseStyles}
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${generateHeader()}
      
      <div class="content">
        <h2 class="greeting">Hola {{contact.FIRSTNAME}},</h2>
        
        <p class="text">
          Como especialistas en <strong>{{contact.SECTOR}}</strong>, queremos compartir contigo 
          información actualizada sobre valoraciones en tu sector.
        </p>
        
        <div class="highlight-box">
          <p class="highlight-title">Múltiplos Q4 2024 - {{contact.SECTOR}}</p>
          <p class="highlight-value">5.5x - 7.2x EBITDA</p>
        </div>
        
        <p class="text"><strong>¿Qué está moviendo el mercado?</strong></p>
        
        <ul class="bullet-list">
          <li><strong>Consolidación activa:</strong> Fondos buscando empresas rentables en el sector</li>
          <li><strong>Primas por digitalización:</strong> Empresas con procesos digitalizados obtienen +15% de prima</li>
          <li><strong>Demanda de recurrencia:</strong> Modelos con ingresos recurrentes se valoran un 20% más alto</li>
        </ul>
        
        <p class="text">
          Si tu empresa tiene un EBITDA superior a 500K€, podrías estar en el rango de interés 
          de compradores estratégicos y financieros que trabajan con nosotros.
        </p>
        
        <div class="cta-container">
          <a href="https://capittal.es/lp/calculadora?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_value_added&utm_content=cta_updated_valuation" class="cta-button">
            Ver valoración actualizada →
          </a>
        </div>
        
        <div class="tip-box">
          <p class="tip-text">
            <span class="tip-icon">📊</span>
            <strong>Tu última valoración:</strong> {{contact.VALUATION}} (hace 45 días)
          </p>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px;">
          ¿Quieres un análisis personalizado de tu empresa? 
          <a href="https://capittal.es/contacto?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_value_added&utm_content=link_schedule_call" style="color: #c9a55c;">Agenda una llamada</a> 
          con nuestro equipo.
        </p>
      </div>
      
      ${generateFooter('reengagement_value_added')}
    </div>
  </div>
</body>
</html>
  `.trim();
};

// 4. Re-valorización (6+ meses)
export const generateRevaluationHtml = (): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¿Ha cambiado el valor de tu empresa?</title>
  ${baseStyles}
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${generateHeader()}
      
      <div class="content">
        <h2 class="greeting">Hola {{contact.FIRSTNAME}},</h2>
        
        <p class="text">
          Han pasado 6 meses desde que valoramos <strong>{{contact.COMPANY}}</strong>. 
          En ese tiempo, muchas cosas pueden haber cambiado:
        </p>
        
        <ul class="bullet-list">
          <li>Tus ingresos y EBITDA pueden haber crecido</li>
          <li>Los múltiplos del mercado se han actualizado</li>
          <li>Nuevos compradores han entrado en tu sector</li>
          <li>Las condiciones de financiación han evolucionado</li>
        </ul>
        
        <div class="highlight-box">
          <p class="highlight-title">Tu valoración anterior</p>
          <p class="highlight-value">{{contact.VALUATION}}</p>
          <p style="font-size: 14px; color: #718096; margin: 8px 0 0 0;">Hace 6 meses</p>
        </div>
        
        <p class="text">
          <strong>¿Quieres saber si el valor de tu empresa ha cambiado?</strong> 
          Actualiza tu valoración en menos de 3 minutos y compara.
        </p>
        
        <div class="cta-container">
          <a href="https://capittal.es/lp/calculadora?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_revaluation&utm_content=cta_update_valuation" class="cta-button">
            Actualizar mi valoración →
          </a>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item" style="border-right: 1px solid #e2e8f0;">
            <p class="stat-value">2.847</p>
            <p class="stat-label">Valoraciones este año</p>
          </div>
          <div class="stat-item">
            <p class="stat-value">89%</p>
            <p class="stat-label">Satisfacción</p>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px; color: #718096;">
          Si prefieres hablar directamente con un especialista, 
          <a href="https://capittal.es/contacto?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_revaluation&utm_content=link_schedule_call" style="color: #c9a55c;">agenda una llamada</a>. 
          Sin compromiso.
        </p>
      </div>
      
      ${generateFooter('reengagement_revaluation')}
    </div>
  </div>
</body>
</html>
  `.trim();
};

// 5. Nurturing Mensual
export const generateNurturingHtml = (): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novedades del mercado M&A</title>
  ${baseStyles}
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${generateHeader()}
      
      <div class="content">
        <h2 class="greeting">Hola {{contact.FIRSTNAME}},</h2>
        
        <p class="text">
          Te traemos las novedades más relevantes del mercado M&A de este mes, 
          especialmente enfocadas en <strong>{{contact.SECTOR}}</strong>.
        </p>
        
        <div class="divider"></div>
        
        <h3 style="font-size: 18px; color: #1a1a2e; margin: 0 0 16px 0;">📈 Mercado M&A España</h3>
        
        <div class="stats-grid">
          <div class="stat-item" style="border-right: 1px solid #e2e8f0;">
            <p class="stat-value">156</p>
            <p class="stat-label">Operaciones Q4</p>
          </div>
          <div class="stat-item" style="border-right: 1px solid #e2e8f0;">
            <p class="stat-value">+8%</p>
            <p class="stat-label">vs. Q3 2024</p>
          </div>
          <div class="stat-item">
            <p class="stat-value">6.1x</p>
            <p class="stat-label">Múltiplo medio</p>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <h3 style="font-size: 18px; color: #1a1a2e; margin: 0 0 16px 0;">🎯 Destacados del mes</h3>
        
        <ul class="bullet-list">
          <li><strong>Sectores más activos:</strong> Tecnología, Salud, Industria</li>
          <li><strong>Tendencia:</strong> Fondos PE priorizan empresas con EBITDA > 1M€</li>
          <li><strong>Oportunidad:</strong> Primas del 25% por sinergias claras</li>
        </ul>
        
        <div class="highlight-box">
          <p class="highlight-title">Operaciones en {{contact.SECTOR}}</p>
          <p class="highlight-value">12 transacciones cerradas</p>
          <p style="font-size: 14px; color: #718096; margin: 8px 0 0 0;">Múltiplo medio: 5.8x EBITDA</p>
        </div>
        
        <div class="cta-container">
          <a href="https://capittal.es/blog?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_nurturing&utm_content=cta_blog" class="cta-button">
            Ver análisis completo →
          </a>
          <br>
          <a href="https://capittal.es/lp/calculadora?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_nurturing&utm_content=cta_valuation" class="secondary-cta">
            ¿Cuánto vale mi empresa hoy?
          </a>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px; color: #718096; text-align: center;">
          ¿Te interesa explorar opciones para <strong>{{contact.COMPANY}}</strong>?<br>
          <a href="https://capittal.es/contacto?utm_source=brevo&utm_medium=email&utm_campaign=reengagement_nurturing&utm_content=link_contact" style="color: #c9a55c;">Hablemos sin compromiso</a>
        </p>
      </div>
      
      ${generateFooter('reengagement_nurturing')}
    </div>
  </div>
</body>
</html>
  `.trim();
};

// Main generator function
export const generateReengagementHtml = (type: ReengagementType): string => {
  switch (type) {
    case 'abandoned':
      return generateAbandonedValuationHtml();
    case 'reactivation':
      return generateReactivationHtml();
    case 'value_added':
      return generateValueAddedHtml();
    case 'revaluation':
      return generateRevaluationHtml();
    case 'nurturing':
      return generateNurturingHtml();
    default:
      return generateReactivationHtml();
  }
};

export const getReengagementTypeConfig = (type: ReengagementType): ReengagementConfig => {
  return REENGAGEMENT_TYPES.find((t) => t.id === type) || REENGAGEMENT_TYPES[0];
};

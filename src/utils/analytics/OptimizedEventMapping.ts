// ============= OPTIMIZED EVENT MAPPING =============
// Sistema de mapeo 1:1 optimizado entre Facebook Pixel y Google Analytics 4
// Implementa las mejores prácticas recomendadas por Meta para asignación de eventos

export interface EventMapping {
  facebookEvent: string;
  ga4Event: string;
  parameters: EventParameters;
  description: string;
  value?: number;
  category: string;
}

export interface EventParameters {
  // Parámetros unificados para ambas plataformas
  content_name?: string;
  content_category?: string;
  content_type?: string;
  value?: number;
  currency?: string;
  event_category?: string;
  event_label?: string;
  custom_parameter_1?: string;
  custom_parameter_2?: string;
  item_name?: string;
  item_category?: string;
  item_id?: string;
  // Parámetros de sincronización
  sync_timestamp?: string;
  sync_session?: string;
  [key: string]: any; // Permitir parámetros adicionales
}

// Mapeo optimizado 1:1 según recomendaciones de Meta
export const OPTIMIZED_EVENT_MAPPINGS: Record<string, EventMapping> = {
  // ===== LEAD GENERATION EVENTS =====
  calculator_used: {
    facebookEvent: 'InitiateCheckout',
    ga4Event: 'begin_checkout',
    parameters: {
      content_name: 'Calculadora de Valoración',
      content_category: 'Lead Generation',
      content_type: 'calculator',
      value: 1500,
      currency: 'EUR',
      event_category: 'engagement',
      event_label: 'valuation_calculator',
      item_name: 'Valuation Calculator',
      item_category: 'tools',
      item_id: 'calc_valuation_v4'
    },
    description: 'Usuario completó cálculo de valoración',
    value: 1500,
    category: 'Lead Generation'
  },

  form_submit: {
    facebookEvent: 'Lead',
    ga4Event: 'generate_lead',
    parameters: {
      content_name: 'Formulario de Contacto',
      content_category: 'Conversion',
      content_type: 'contact_form',
      value: 2000,
      currency: 'EUR',
      event_category: 'conversion',
      event_label: 'contact_form',
      item_name: 'Contact Form',
      item_category: 'forms',
      item_id: 'form_contact_main'
    },
    description: 'Lead generado mediante formulario',
    value: 2000,
    category: 'Conversion'
  },

  contact_form_submit: {
    facebookEvent: 'Lead',
    ga4Event: 'generate_lead',
    parameters: {
      content_name: 'Formulario de Contacto Avanzado',
      content_category: 'Conversion',
      content_type: 'advanced_contact_form',
      value: 2500,
      currency: 'EUR',
      event_category: 'conversion',
      event_label: 'advanced_contact_form',
      item_name: 'Advanced Contact Form',
      item_category: 'forms',
      item_id: 'form_contact_advanced'
    },
    description: 'Lead cualificado mediante formulario avanzado',
    value: 2500,
    category: 'Conversion'
  },

  // ===== ENGAGEMENT EVENTS =====
  pdf_download: {
    facebookEvent: 'ViewContent',
    ga4Event: 'view_item',
    parameters: {
      content_name: 'Recurso PDF',
      content_category: 'Resources',
      content_type: 'pdf',
      value: 500,
      currency: 'EUR',
      event_category: 'engagement',
      event_label: 'pdf_download',
      item_name: 'PDF Resource',
      item_category: 'downloads',
      item_id: 'pdf_resource'
    },
    description: 'Descarga de recurso PDF',
    value: 500,
    category: 'Engagement'
  },

  resource_download: {
    facebookEvent: 'ViewContent',
    ga4Event: 'view_item',
    parameters: {
      content_name: 'Recurso Descargado',
      content_category: 'Resources',
      content_type: 'resource',
      value: 300,
      currency: 'EUR',
      event_category: 'engagement',
      event_label: 'resource_download',
      item_name: 'Digital Resource',
      item_category: 'downloads',
      item_id: 'resource_general'
    },
    description: 'Descarga de recurso digital',
    value: 300,
    category: 'Engagement'
  },

  // ===== CONTACT EVENTS =====
  contact_clicked: {
    facebookEvent: 'Contact',
    ga4Event: 'contact',
    parameters: {
      content_name: 'Contacto Directo',
      content_category: 'Contact',
      content_type: 'direct_contact',
      value: 800,
      currency: 'EUR',
      event_category: 'interaction',
      event_label: 'contact_clicked',
      item_name: 'Direct Contact',
      item_category: 'contact',
      item_id: 'contact_direct'
    },
    description: 'Click en contacto directo',
    value: 800,
    category: 'Contact'
  },

  phone_clicked: {
    facebookEvent: 'Contact',
    ga4Event: 'contact',
    parameters: {
      content_name: 'Llamada Telefónica',
      content_category: 'Contact',
      content_type: 'phone_call',
      value: 1000,
      currency: 'EUR',
      event_category: 'interaction',
      event_label: 'phone_clicked',
      item_name: 'Phone Call',
      item_category: 'contact',
      item_id: 'contact_phone'
    },
    description: 'Click para llamada telefónica',
    value: 1000,
    category: 'Contact'
  },

  // ===== NAVIGATION EVENTS =====
  page_view: {
    facebookEvent: 'PageView',
    ga4Event: 'page_view',
    parameters: {
      content_name: 'Página Vista',
      content_category: 'Navigation',
      content_type: 'page',
      event_category: 'navigation',
      event_label: 'page_view'
    },
    description: 'Vista de página',
    category: 'Navigation'
  },

  // ===== CASE STUDY EVENTS =====
  case_study_view: {
    facebookEvent: 'ViewContent',
    ga4Event: 'view_item',
    parameters: {
      content_name: 'Caso de Estudio',
      content_category: 'Content',
      content_type: 'case_study',
      value: 400,
      currency: 'EUR',
      event_category: 'content',
      event_label: 'case_study_view',
      item_name: 'Case Study',
      item_category: 'content',
      item_id: 'case_study'
    },
    description: 'Vista de caso de estudio',
    value: 400,
    category: 'Content'
  },

  // ===== BLOG EVENTS =====
  blog_post_view: {
    facebookEvent: 'ViewContent',
    ga4Event: 'view_item',
    parameters: {
      content_name: 'Artículo de Blog',
      content_category: 'Content',
      content_type: 'blog_post',
      value: 200,
      currency: 'EUR',
      event_category: 'content',
      event_label: 'blog_post_view',
      item_name: 'Blog Post',
      item_category: 'blog',
      item_id: 'blog_post'
    },
    description: 'Vista de artículo de blog',
    value: 200,
    category: 'Content'
  },

  // ===== MICRO-CONVERSION EVENTS =====
  newsletter_signup: {
    facebookEvent: 'CompleteRegistration',
    ga4Event: 'sign_up',
    parameters: {
      content_name: 'Newsletter Signup',
      content_category: 'Registration',
      content_type: 'newsletter',
      value: 600,
      currency: 'EUR',
      event_category: 'conversion',
      event_label: 'newsletter_signup',
      item_name: 'Newsletter Subscription',
      item_category: 'subscriptions',
      item_id: 'newsletter_main'
    },
    description: 'Suscripción a newsletter',
    value: 600,
    category: 'Micro-Conversion'
  },

  demo_request: {
    facebookEvent: 'Schedule',
    ga4Event: 'generate_lead',
    parameters: {
      content_name: 'Solicitud de Demo',
      content_category: 'Lead Generation',
      content_type: 'demo_request',
      value: 3000,
      currency: 'EUR',
      event_category: 'conversion',
      event_label: 'demo_request',
      item_name: 'Demo Request',
      item_category: 'services',
      item_id: 'demo_valuation'
    },
    description: 'Solicitud de demostración',
    value: 3000,
    category: 'High-Value Lead'
  }
};

// Función para obtener el mapeo optimizado de un evento
export const getOptimizedMapping = (eventName: string): EventMapping | null => {
  return OPTIMIZED_EVENT_MAPPINGS[eventName] || null;
};

// Función para validar que el evento puede ser mapeado
export const canMapEvent = (eventName: string): boolean => {
  return eventName in OPTIMIZED_EVENT_MAPPINGS;
};

// Función para obtener todos los eventos disponibles por categoría
export const getEventsByCategory = (category: string): EventMapping[] => {
  return Object.values(OPTIMIZED_EVENT_MAPPINGS).filter(
    mapping => mapping.category === category
  );
};

// Función para generar reporte de eventos disponibles
export const generateEventMappingReport = (): string => {
  const categories = [...new Set(Object.values(OPTIMIZED_EVENT_MAPPINGS).map(m => m.category))];
  
  let report = '# Reporte de Mapeo de Eventos Optimizado\n\n';
  
  categories.forEach(category => {
    report += `## ${category}\n\n`;
    const events = getEventsByCategory(category);
    
    events.forEach(event => {
      report += `### ${event.description}\n`;
      report += `- **Facebook Event**: ${event.facebookEvent}\n`;
      report += `- **GA4 Event**: ${event.ga4Event}\n`;
      report += `- **Value**: ${event.value ? `€${event.value}` : 'N/A'}\n\n`;
    });
  });
  
  return report;
};
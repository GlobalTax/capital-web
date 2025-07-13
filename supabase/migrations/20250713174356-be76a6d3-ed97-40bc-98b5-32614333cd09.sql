-- Crear landing pages activas usando los tipos correctos de templates
INSERT INTO public.landing_pages (
  title,
  slug,
  template_id,
  content_config,
  analytics_config,
  conversion_goals,
  meta_title,
  meta_description,
  is_published,
  published_at
) VALUES
-- Landing page para calculadora de valoración
(
  'Calculadora de Valoración Empresarial Gratuita',
  'calculadora-valoracion-avanzada',
  (SELECT id FROM landing_page_templates WHERE type = 'valuation' LIMIT 1),
  '{
    "hero": {
      "title": "Calculadora de Valoración Empresarial Avanzada",
      "subtitle": "Obtén una valoración profesional de tu empresa en minutos",
      "cta_text": "Calcular Valoración Gratuita"
    },
    "benefits": [
      "Metodologías de valoración múltiples",
      "Análisis sectorial automatizado", 
      "Reporte PDF profesional",
      "Comparación con empresas similares"
    ],
    "form_fields": ["company_name", "sector", "revenue", "ebitda", "employees", "location", "contact_info"]
  }',
  '{
    "tracking": {
      "google_analytics": true,
      "facebook_pixel": true,
      "conversion_events": ["form_submit", "pdf_download"]
    }
  }',
  '[
    {"type": "lead_generation", "value": 100, "name": "Solicitud de valoración"},
    {"type": "form_completion", "value": 50, "name": "Formulario completado"}
  ]',
  'Calculadora de Valoración Empresarial Gratuita | Capittal',
  'Calcula el valor de tu empresa con nuestra herramienta avanzada. Metodologías profesionales, análisis sectorial y reporte PDF gratuito.',
  true,
  now()
),
-- Landing page para consulta gratuita
(
  'Consulta Gratuita M&A - Asesoramiento Especializado',
  'consulta-gratuita-ma',
  (SELECT id FROM landing_page_templates WHERE type = 'contact' LIMIT 1),
  '{
    "hero": {
      "title": "Consulta Gratuita con Expertos en M&A",
      "subtitle": "30 minutos de asesoramiento personalizado para tu operación",
      "cta_text": "Reservar Consulta Gratuita"
    },
    "services": [
      "Análisis de viabilidad de venta/compra",
      "Estrategia de valoración óptima",
      "Identificación de compradores potenciales",
      "Roadmap personalizado para tu operación"
    ],
    "form_fields": ["name", "company", "phone", "email", "operation_type", "timeline", "company_value_range"],
    "testimonials": true
  }',
  '{
    "tracking": {
      "google_analytics": true,
      "linkedin_insight": true,
      "conversion_events": ["consultation_request", "calendar_booking"]
    }
  }',
  '[
    {"type": "consultation_request", "value": 200, "name": "Solicitud de consulta"},
    {"type": "calendar_booking", "value": 300, "name": "Reserva de cita"}
  ]',
  'Consulta Gratuita M&A | Asesoramiento Especializado | Capittal',
  'Reserva tu consulta gratuita de 30 minutos con nuestros expertos en M&A. Análisis personalizado y estrategia para tu operación.',
  true,
  now()
),
-- Landing page para reporte sectorial
(
  'Reporte Sectorial Personalizado - Análisis M&A',
  'reporte-sectorial-personalizado',
  (SELECT id FROM landing_page_templates WHERE type = 'sector' LIMIT 1),
  '{
    "hero": {
      "title": "Reporte Sectorial M&A Personalizado",
      "subtitle": "Análisis completo de tendencias, múltiplos y oportunidades en tu sector",
      "cta_text": "Solicitar Reporte Gratuito"
    },
    "report_includes": [
      "Múltiplos de valoración actualizados",
      "Análisis de transacciones recientes",
      "Tendencias y outlook sectorial",
      "Identificación de oportunidades",
      "Benchmark competitivo"
    ],
    "sectors": [
      "Tecnología y Software",
      "Healthcare y Farmacéutico", 
      "Industrial y Manufacturing",
      "Financial Services",
      "Retail y E-commerce",
      "Real Estate",
      "Energy y Utilities"
    ],
    "form_fields": ["sector", "subsector", "company_name", "contact_name", "email", "phone", "specific_interests"]
  }',
  '{
    "tracking": {
      "google_analytics": true,
      "hubspot_tracking": true,
      "conversion_events": ["report_request", "email_signup"]
    }
  }',
  '[
    {"type": "report_request", "value": 150, "name": "Solicitud de reporte"},
    {"type": "email_signup", "value": 75, "name": "Suscripción email"}
  ]',
  'Reporte Sectorial M&A Personalizado | Análisis de Mercado | Capittal',
  'Descarga tu reporte sectorial gratuito con análisis M&A, múltiplos de valoración y tendencias de mercado actualizadas.',
  true,
  now()
);
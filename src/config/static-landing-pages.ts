export interface StaticLandingPage {
  id: string;
  title: string;
  slug: string;
  url: string;
  type: 'calculator' | 'conversion' | 'product' | 'event';
  description: string;
  source_project: string;
  features: string[];
  isActive: boolean;
  lastUpdated: string;
}

export const staticLandingPages: StaticLandingPage[] = [
  {
    id: 'lp-calculadora',
    title: 'Calculadora Principal',
    slug: 'calculadora',
    url: '/lp/calculadora',
    type: 'calculator',
    description: 'Calculadora de valoración multiidioma (ES, CA, VAL, GL)',
    source_project: 'lp-calculadora-principal',
    features: ['I18n', 'SEO Optimizado', 'Hreflang', 'Lead Capture'],
    isActive: true,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'lp-calculadora-fiscal',
    title: 'Calculadora Fiscal',
    slug: 'calculadora-fiscal',
    url: '/lp/calculadora-fiscal',
    type: 'calculator',
    description: 'Calculadora especializada en impacto fiscal de venta',
    source_project: 'lp-calculadora-fiscal',
    features: ['Cálculo Fiscal', 'Lead Capture', 'SEO Optimizado'],
    isActive: true,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'lp-calculadora-meta',
    title: 'Calculadora Meta Ads',
    slug: 'calculadora-meta',
    url: '/lp/calculadora-meta',
    type: 'calculator',
    description: 'Calculadora optimizada para campañas de Meta Ads',
    source_project: 'lp-calculadora-meta',
    features: ['Meta Pixel', 'Tracking Conversiones', 'Lead Capture'],
    isActive: true,
    lastUpdated: '2025-01-15'
  },
  {
    id: 'lp-venta-empresas',
    title: 'Venta de Empresas',
    slug: 'venta-empresas',
    url: '/lp/venta-empresas',
    type: 'conversion',
    description: 'Landing completa de conversión para vender empresas con máximo precio garantizado',
    source_project: 'lp-venta-empresas',
    features: [
      'Countdown Timer de Urgencia',
      'CTA Agresivo Funcional',
      'Garantías y Trust Signals',
      'Comparación Visual',
      'Casos de Éxito',
      'Testimoniales Expandidos',
      'FAQ Completo',
      'Integración BD',
      'Modal de Confirmación',
      'SEO Optimizado'
    ],
    isActive: true,
    lastUpdated: '2025-01-18'
  },
  {
    id: 'lp-suiteloop',
    title: 'SuiteLoop',
    slug: 'suiteloop',
    url: '/lp/suiteloop',
    type: 'product',
    description: 'Landing de producto B2B para asesorías',
    source_project: 'lp-suiteloop',
    features: ['ROI Calculator', 'Product Demo', 'Competitive Matrix', 'FAQ'],
    isActive: true,
    lastUpdated: '2024-11-30'
  },
  {
    id: 'lp-accountex',
    title: 'Accountex Madrid 2025',
    slug: 'accountex',
    url: '/lp/accountex',
    type: 'event',
    description: 'Landing para evento Accountex Madrid',
    source_project: 'lp-accountex',
    features: ['Lead Form', 'Scheduling', 'Event Info'],
    isActive: true,
    lastUpdated: '2025-01-10'
  },
  {
    id: 'lp-venta-empresas-v2',
    title: 'Venta de Empresas V2',
    slug: 'venta-empresas-v2',
    url: '/lp/venta-empresas-v2',
    type: 'conversion',
    description: 'Landing V2 de conversión optimizada - diseño simplificado para A/B testing',
    source_project: 'lp-venta-empresas-v2',
    features: ['Hero + Form Above Fold', 'Diseño Simplificado', 'A/B Testing Ready', 'Testimoniales', 'FAQ'],
    isActive: true,
    lastUpdated: '2025-01-20'
  },
  {
    id: 'lp-valoracion-2026',
    title: 'Valoración Cierre Año 2025',
    slug: 'valoracion-2026',
    url: '/lp/valoracion-2026',
    type: 'conversion',
    description: 'Landing de campaña estacional para valoración de cierre de año',
    source_project: 'lp-valoracion-2026',
    features: ['Formulario Simple', 'CIF + Financials', 'UTM Tracking', 'Campaña Email'],
    isActive: true,
    lastUpdated: '2025-01-01'
  }
];

/**
 * Centralized Route Registry — Single source of truth for all public indexable routes.
 * Used by: sitemap generator, prerender scanner, SEO debug page, index.html sync script.
 */

export interface SiteRoute {
  path: string;
  title: string;
  description: string;
  h1: string;
  internalLinks: string[];
  lastmod: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

const today = new Date().toISOString().split('T')[0];

export const siteRoutes: SiteRoute[] = [
  // === HOMEPAGE ===
  {
    path: '/',
    title: 'Capittal | Asesoramiento M&A en Barcelona',
    description: 'Asesoramiento M&A en Barcelona: venta de empresas, valoraciones y due diligence. +70 profesionales especializados en mid-market español.',
    h1: 'Especialistas en Fusiones y Adquisiciones',
    internalLinks: ['/venta-empresas', '/compra-empresas', '/servicios/valoraciones', '/contacto', '/lp/calculadora'],
    lastmod: today,
    priority: 1.0,
    changefreq: 'weekly',
  },

  // === MAIN BUSINESS PAGES ===
  {
    path: '/venta-empresas',
    title: 'Venta de Empresas | Capittal M&A',
    description: 'Asesoramiento integral en la venta de empresas. Proceso confidencial, maximización del valor y acompañamiento hasta el cierre.',
    h1: 'Venta de Empresas',
    internalLinks: ['/', '/lp/calculadora', '/contacto', '/servicios/valoraciones', '/casos-exito'],
    lastmod: today,
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    path: '/compra-empresas',
    title: 'Compra de Empresas | Capittal M&A',
    description: 'Identificación de oportunidades de adquisición y asesoramiento buy-side para inversores, fondos y corporates.',
    h1: 'Compra de Empresas',
    internalLinks: ['/', '/oportunidades', '/servicios/due-diligence', '/contacto'],
    lastmod: today,
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    path: '/contacto',
    title: 'Contacto | Capittal M&A',
    description: 'Contacta con Capittal para asesoramiento en operaciones M&A, valoraciones empresariales y due diligence.',
    h1: 'Contacto',
    internalLinks: ['/', '/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    path: '/equipo',
    title: 'Equipo | Capittal M&A',
    description: 'Conoce al equipo de profesionales de Capittal especializados en fusiones, adquisiciones y valoración de empresas.',
    h1: 'Nuestro Equipo',
    internalLinks: ['/', '/por-que-elegirnos', '/contacto'],
    lastmod: today,
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/por-que-elegirnos',
    title: 'Por Qué Elegirnos | Capittal M&A',
    description: 'Descubre por qué Capittal es la firma de M&A de referencia en el mid-market español: experiencia, metodología y resultados.',
    h1: 'Por Qué Elegirnos',
    internalLinks: ['/', '/equipo', '/casos-exito', '/contacto'],
    lastmod: today,
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/casos-exito',
    title: 'Casos de Éxito | Capittal M&A',
    description: 'Operaciones de M&A exitosas: venta de empresas, adquisiciones y valoraciones realizadas por Capittal.',
    h1: 'Casos de Éxito',
    internalLinks: ['/', '/venta-empresas', '/contacto', '/por-que-elegirnos'],
    lastmod: today,
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/programa-colaboradores',
    title: 'Programa de Colaboradores | Capittal M&A',
    description: 'Únete al programa de colaboradores de Capittal y participa en operaciones de M&A con comisiones competitivas.',
    h1: 'Programa de Colaboradores',
    internalLinks: ['/', '/contacto', '/venta-empresas'],
    lastmod: today,
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/de-looper-a-capittal',
    title: 'De Looper a Capittal | Evolución de Marca',
    description: 'Looper ahora es Capittal. Descubre la evolución de nuestra marca y cómo seguimos ofreciendo el mismo servicio de excelencia.',
    h1: 'De Looper a Capittal',
    internalLinks: ['/', '/lp/calculadora', '/contacto'],
    lastmod: today,
    priority: 0.5,
    changefreq: 'yearly',
  },

  // === SERVICE PAGES ===
  {
    path: '/servicios/venta-empresas',
    title: 'Servicio de Venta de Empresas | Capittal',
    description: 'Servicio especializado en la venta de empresas: valoración, búsqueda de compradores, negociación y cierre de operaciones.',
    h1: 'Venta de Empresas',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora', '/contacto'],
    lastmod: today,
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    path: '/servicios/valoraciones',
    title: 'Valoración de Empresas | Capittal',
    description: 'Informes de valoración profesional con múltiplos sectoriales, DCF y metodologías reconocidas internacionalmente.',
    h1: 'Valoración de Empresas',
    internalLinks: ['/lp/calculadora', '/servicios/venta-empresas', '/contacto'],
    lastmod: today,
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    path: '/servicios/due-diligence',
    title: 'Due Diligence | Capittal M&A',
    description: 'Análisis financiero, fiscal y legal para operaciones de M&A. Due diligence rigurosa y profesional.',
    h1: 'Due Diligence',
    internalLinks: ['/servicios/venta-empresas', '/compra-empresas', '/contacto'],
    lastmod: today,
    priority: 0.85,
    changefreq: 'monthly',
  },
  {
    path: '/servicios/asesoramiento-legal',
    title: 'Asesoramiento Legal M&A | Capittal',
    description: 'Asesoramiento legal especializado en fusiones y adquisiciones: contratos, due diligence legal y estructuración.',
    h1: 'Asesoramiento Legal',
    internalLinks: ['/servicios/due-diligence', '/servicios/venta-empresas', '/contacto'],
    lastmod: today,
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/servicios/reestructuraciones',
    title: 'Reestructuraciones Empresariales | Capittal',
    description: 'Soluciones para empresas en situaciones especiales: reestructuración financiera, operativa y estratégica.',
    h1: 'Reestructuraciones',
    internalLinks: ['/servicios/valoraciones', '/contacto'],
    lastmod: today,
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/servicios/planificacion-fiscal',
    title: 'Planificación Fiscal M&A | Capittal',
    description: 'Optimización fiscal en operaciones de compraventa de empresas. Planificación fiscal estratégica.',
    h1: 'Planificación Fiscal',
    internalLinks: ['/servicios/venta-empresas', '/lp/calculadora', '/contacto'],
    lastmod: today,
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/servicios/search-funds',
    title: 'Search Funds | Capittal M&A',
    description: 'Conectamos empresas con emprendedores de élite a través del modelo Search Fund. Sucesión empresarial moderna.',
    h1: 'Search Funds',
    internalLinks: ['/search-funds', '/venta-empresas', '/contacto'],
    lastmod: today,
    priority: 0.7,
    changefreq: 'monthly',
  },

  // === SECTOR PAGES ===
  {
    path: '/sectores/tecnologia',
    title: 'M&A Sector Tecnología | Capittal',
    description: 'Operaciones de M&A en el sector tecnológico: valoración y venta de empresas de software, SaaS, IT y servicios digitales.',
    h1: 'Sector Tecnología',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.75,
    changefreq: 'monthly',
  },
  {
    path: '/sectores/healthcare',
    title: 'M&A Sector Healthcare | Capittal',
    description: 'Operaciones de M&A en el sector salud: clínicas, farma, medtech y servicios sanitarios.',
    h1: 'Sector Healthcare',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.75,
    changefreq: 'monthly',
  },
  {
    path: '/sectores/industrial',
    title: 'M&A Sector Industrial | Capittal',
    description: 'Operaciones de M&A en el sector industrial y manufacturero en España.',
    h1: 'Sector Industrial',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.75,
    changefreq: 'monthly',
  },
  {
    path: '/sectores/retail',
    title: 'M&A Sector Retail y Consumo | Capittal',
    description: 'Operaciones de M&A en retail, distribución y bienes de consumo en España.',
    h1: 'Sector Retail y Consumo',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.75,
    changefreq: 'monthly',
  },
  {
    path: '/sectores/energia',
    title: 'M&A Sector Energía | Capittal',
    description: 'Operaciones de M&A en el sector energético: renovables, utilities y servicios energéticos.',
    h1: 'Sector Energía',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.75,
    changefreq: 'monthly',
  },
  {
    path: '/sectores/seguridad',
    title: 'M&A Sector Seguridad Privada | Capittal',
    description: 'Especialistas en operaciones de M&A en el sector de seguridad privada en España.',
    h1: 'Sector Seguridad Privada',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/sectores/construccion',
    title: 'M&A Sector Construcción | Capittal',
    description: 'Operaciones de M&A en construcción, obra civil e infraestructuras en España.',
    h1: 'Sector Construcción',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.75,
    changefreq: 'monthly',
  },
  {
    path: '/sectores/alimentacion',
    title: 'M&A Sector Alimentación y Bebidas | Capittal',
    description: 'Operaciones de M&A en alimentación, bebidas y agroindustria en España.',
    h1: 'Sector Alimentación y Bebidas',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.75,
    changefreq: 'monthly',
  },
  {
    path: '/sectores/logistica',
    title: 'M&A Sector Logística y Transporte | Capittal',
    description: 'Operaciones de M&A en logística, transporte y distribución en España.',
    h1: 'Sector Logística',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.75,
    changefreq: 'monthly',
  },
  {
    path: '/sectores/medio-ambiente',
    title: 'M&A Sector Medio Ambiente | Capittal',
    description: 'Operaciones de M&A en gestión ambiental, reciclaje y servicios medioambientales.',
    h1: 'Sector Medio Ambiente',
    internalLinks: ['/venta-empresas', '/servicios/valoraciones', '/lp/calculadora'],
    lastmod: today,
    priority: 0.75,
    changefreq: 'monthly',
  },

  // === RESOURCE PAGES ===
  {
    path: '/recursos/blog',
    title: 'Blog M&A | Capittal',
    description: 'Artículos sobre fusiones y adquisiciones, valoración de empresas, due diligence y mercado M&A español.',
    h1: 'Blog',
    internalLinks: ['/', '/venta-empresas', '/lp/calculadora'],
    lastmod: today,
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/recursos/test-exit-ready',
    title: 'Test Exit Ready | ¿Está tu empresa preparada para vender?',
    description: 'Evalúa si tu empresa está preparada para una operación de venta con nuestro test gratuito.',
    h1: 'Test Exit Ready',
    internalLinks: ['/venta-empresas', '/lp/calculadora', '/contacto'],
    lastmod: today,
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/search-funds',
    title: 'Search Funds España | Capittal M&A',
    description: 'Conectamos empresas con Search Funds: emprendedores de élite que buscan adquirir y liderar negocios consolidados.',
    h1: 'Search Funds',
    internalLinks: ['/venta-empresas', '/servicios/search-funds', '/contacto'],
    lastmod: today,
    priority: 0.7,
    changefreq: 'monthly',
  },

  // === CALCULATOR LANDING ===
  {
    path: '/lp/calculadora',
    title: 'Calculadora de Valoración de Empresas Gratis | Capittal',
    description: 'Calcula el valor de tu empresa gratis con nuestra calculadora online. Múltiplos sectoriales actualizados y resultado inmediato.',
    h1: 'Calculadora de Valoración de Empresas',
    internalLinks: ['/', '/venta-empresas', '/servicios/valoraciones', '/contacto'],
    lastmod: today,
    priority: 0.95,
    changefreq: 'weekly',
  },

  // === ADDITIONAL PUBLIC PAGES ===
  {
    path: '/valoracion-empresas',
    title: 'Valoración de Empresas en España | Capittal',
    description: 'Guía completa sobre valoración de empresas: métodos, múltiplos por sector y factores clave.',
    h1: 'Valoración de Empresas',
    internalLinks: ['/lp/calculadora', '/servicios/valoraciones', '/contacto'],
    lastmod: today,
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/guia-valoracion-empresas',
    title: 'Guía de Valoración de Empresas | Capittal',
    description: 'Guía profesional de valoración empresarial: metodologías DCF, múltiplos, precedentes y mejores prácticas.',
    h1: 'Guía de Valoración de Empresas',
    internalLinks: ['/lp/calculadora', '/servicios/valoraciones', '/contacto'],
    lastmod: today,
    priority: 0.65,
    changefreq: 'monthly',
  },
];

/**
 * Get a route entry by path
 */
export const getRouteByPath = (path: string): SiteRoute | undefined => {
  return siteRoutes.find(r => r.path === path);
};

/**
 * Duplicate of route data for edge functions (they can't import from src/)
 * This is the canonical list — edge functions should duplicate this.
 */
export const SITE_BASE_URL = 'https://capittal.es';

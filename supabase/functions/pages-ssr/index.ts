import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeJsonLd(str: string): string {
  return str.replace(/</g, "\\u003c");
}

// ─── Organization JSON-LD (shared, injected on ALL pages) ───
const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Capittal Transacciones",
  "legalName": "Capittal Transacciones S.L.",
  "url": "https://capittal.es",
  "logo": "https://capittal.es/logo.png",
  "description": "Firma de asesoramiento en M&A, valoraciones y due diligence especializada en el sector seguridad",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ausiàs March 36, Principal",
    "addressLocality": "Barcelona",
    "postalCode": "08010",
    "addressCountry": "ES",
  },
  "sameAs": ["https://www.linkedin.com/company/capittal-transacciones"],
};

// ─── Helper: build FAQPage schema ───
function buildFAQPageSchema(faqs: Array<{ question: string; answer: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer,
      },
    })),
  };
}

interface PageData {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogType: string;
  ogImage?: string;
  hreflang?: Record<string, string>;
  structuredData: object[];
  content: string;
}

// ─── Static pages map ───
const PAGES_DATA: Record<string, PageData> = {
  "/": {
    title: "Capittal | Asesores M&A Especializados en el Sector Seguridad - Barcelona",
    description:
      "Capittal Transacciones asesora en fusiones, adquisiciones, valoraciones y due diligence. Especialistas en el sector seguridad con más de 70 profesionales. Barcelona.",
    keywords:
      "M&A España, fusiones y adquisiciones, valoración de empresas, due diligence, asesoría financiera, compraventa empresas",
    canonical: "https://capittal.es/",
    ogType: "website",
    hreflang: {
      es: "https://capittal.es/",
      ca: "https://capittal.es/ca",
      en: "https://capittal.es/en",
      "x-default": "https://capittal.es/",
    },
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Capittal",
        url: "https://capittal.es",
        description:
          "Capittal Transacciones asesora en fusiones, adquisiciones, valoraciones y due diligence. Especialistas en el sector seguridad con más de 70 profesionales. Barcelona.",
        publisher: ORG_JSONLD,
      },
      {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: "Capittal Transacciones",
        url: "https://capittal.es",
        description:
          "Capittal Transacciones asesora en fusiones, adquisiciones, valoraciones y due diligence. Especialistas en el sector seguridad con más de 70 profesionales. Barcelona.",
        image: "https://capittal.es/og-image.png",
        telephone: "+34695717490",
        address: ORG_JSONLD.address,
        areaServed: { "@type": "Country", name: "España" },
        serviceType: [
          "Fusiones y Adquisiciones",
          "Valoración de Empresas",
          "Due Diligence",
          "Planificación Fiscal",
          "Mergers and Acquisitions Advisory",
        ],
      },
    ],
    content: `
      <h1>Especialistas en Fusiones y Adquisiciones</h1>
      <p>Capittal es una firma de asesoramiento financiero especializada en operaciones de M&A, valoraciones empresariales, due diligence y planificación fiscal. Con sede en Barcelona, asesoramos a empresarios y fondos de inversión en España y Europa.</p>
      <h2>Nuestros Servicios</h2>
      <p>Ofrecemos un servicio integral de asesoramiento en la compraventa de empresas: desde la valoración inicial hasta el cierre de la transacción, pasando por la búsqueda de compradores o vendedores, la negociación y la due diligence financiera, fiscal y legal.</p>
      <h2>Sectores de Especialización</h2>
      <p>Nos diferenciamos por nuestra especialización sectorial en seguridad privada, tecnología, industria, healthcare, energía, construcción, logística, medio ambiente, retail y alimentación.</p>
      <h2>¿Por qué Capittal?</h2>
      <p>Combinamos experiencia en banca de inversión con un profundo conocimiento sectorial. Nuestro equipo proviene de firmas como Deloitte, PwC y bancos de inversión internacionales. Garantizamos máxima confidencialidad en cada operación.</p>
    `,
  },

  // ─── SERVICIOS ───
  "/servicios/venta-empresas": {
    title: "Venta de Empresas | Asesoramiento M&A Profesional | Capittal",
    description:
      "Servicio profesional de asesoramiento en la venta de empresas en España. Maximice el valor de su empresa con Capittal. Proceso confidencial, búsqueda activa de compradores y negociación experta.",
    keywords:
      "venta de empresas, vender empresa España, asesor venta empresa, M&A sell-side, asesoría venta negocio",
    canonical: "https://capittal.es/servicios/venta-empresas",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Servicio de Venta de Empresas",
        provider: ORG_JSONLD,
        description:
          "Asesoramiento profesional integral en la venta de empresas. Búsqueda activa de compradores, valoración, negociación y cierre.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["Asesoramiento en venta de empresas", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cuánto tiempo tarda el proceso de venta?", answer: "El proceso completo suele durar entre 6 y 12 meses, dependiendo de la complejidad de la empresa, las condiciones del mercado y la disponibilidad de compradores cualificados." },
        { question: "¿Cuáles son vuestros honorarios?", answer: "Trabajamos con una estructura basada en resultados, cobrando un porcentaje del precio final de venta que varía entre el 3% y el 8% dependiendo del tamaño y complejidad de la operación." },
        { question: "¿Cómo se mantiene la confidencialidad?", answer: "Utilizamos acuerdos de confidencialidad (NDAs) con todos los potenciales compradores, creamos memorandos anónimos inicialmente, y solo revelamos la identidad de tu empresa tras confirmar el interés serio y la capacidad financiera del comprador." },
        { question: "¿Qué documentación necesito preparar?", answer: "Necesitarás estados financieros de los últimos 3-5 años, información detallada sobre clientes y contratos principales, estructura organizativa, activos principales, y cualquier documentación legal relevante." },
        { question: "¿Puedo seguir dirigiendo la empresa durante el proceso?", answer: "Absolutamente. Es esencial que mantengas el foco en el negocio durante el proceso de venta. Nosotros nos encargamos de la mayor parte del trabajo." },
        { question: "¿Qué sucede con mis empleados?", answer: "La retención del equipo es crucial para el éxito de la venta. Trabajamos con compradores que valoran el capital humano y buscamos estructuras que incentiven la continuidad del equipo clave." },
      ]),
    ],
    content: `
      <h1>Venta de Empresas - Asesoramiento Profesional</h1>
      <p>Capittal asesora a empresarios en el proceso integral de venta de su empresa. Nuestro enfoque maximiza el valor de la transacción y garantiza la máxima confidencialidad en todo el proceso.</p>
      <h2>Nuestro Proceso de Venta</h2>
      <p>El proceso de venta de una empresa incluye la valoración financiera, la preparación del memorando informativo confidencial, la identificación y contacto con compradores potenciales, la gestión del data room, la negociación de términos y el acompañamiento hasta el cierre de la operación.</p>
      <h2>¿Por qué elegirnos como asesores en la venta?</h2>
      <p>Contamos con una amplia red de contactos de fondos de inversión, family offices y compradores corporativos en España y Europa. Nuestra experiencia en sectores como seguridad, tecnología e industria nos permite identificar sinergias y maximizar el valor.</p>
    `,
  },

  "/servicios/valoraciones": {
    title: "Valoración de Empresas | Expertos en Valoración | Capittal",
    description:
      "Servicio de valoración de empresas profesional. Múltiplos sectoriales, DCF, y metodologías reconocidas. Informes de valoración para venta, compra, fiscalidad y planificación estratégica.",
    keywords:
      "valoración empresas, valorar empresa, informe valoración, múltiplos sectoriales, DCF, valoración financiera",
    canonical: "https://capittal.es/servicios/valoraciones",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Valoración de Empresas",
        provider: ORG_JSONLD,
        description:
          "Informes de valoración profesional utilizando múltiplos sectoriales, DCF y metodologías reconocidas internacionalmente.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["Valoración de empresas", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cuál es la diferencia entre una valoración gratuita y una profesional?", answer: "La valoración gratuita es una estimación orientativa basada en múltiplos sectoriales y datos básicos de la empresa. La valoración profesional incluye análisis detallado con múltiples metodologías, due diligence, proyecciones personalizadas y un informe certificado." },
        { question: "¿Cuándo necesito una valoración certificada?", answer: "Una valoración certificada es necesaria para operaciones de M&A, reestructuraciones societarias, herencias, divorcios, entrada/salida de socios, ampliaciones de capital, procesos judiciales, fusiones, escisiones, y para cumplir con normativas contables o fiscales específicas." },
        { question: "¿Qué metodología es más adecuada para mi empresa?", answer: "Depende del sector, tamaño, rentabilidad y propósito de la valoración. Empresas estables con historial: DCF. Sectores con comparables: Múltiplos. Holdings o asset-heavy: Patrimonial. Recomendamos un enfoque multimetodológico." },
        { question: "¿Cuánto cuesta una valoración profesional?", answer: "El coste varía según la complejidad, tamaño de la empresa y urgencia. Típicamente entre €3,000-€15,000 para PYMES, y €10,000-€50,000+ para empresas grandes." },
        { question: "¿Cuánto tiempo dura el proceso?", answer: "Una valoración estándar toma 4-6 semanas desde el inicio hasta la entrega del informe final. Procesos urgentes pueden completarse en 2-3 semanas." },
        { question: "¿Puedo usar la valoración para vender mi empresa?", answer: "Absolutamente. Nuestras valoraciones están diseñadas para soportar procesos de venta y proporcionan la base técnica para negociaciones." },
      ]),
    ],
    content: `
      <h1>Valoración de Empresas Profesional</h1>
      <p>Capittal ofrece servicios de valoración empresarial utilizando metodologías reconocidas internacionalmente: descuento de flujos de caja (DCF), múltiplos de transacciones comparables, múltiplos de mercado y valoración de activos.</p>
      <h2>Metodologías de Valoración</h2>
      <p>Nuestros informes de valoración combinan múltiples métodos para obtener un rango de valor fiable. Utilizamos bases de datos de transacciones reales en cada sector para aplicar múltiplos EBITDA, beneficio neto y facturación específicos.</p>
      <h2>Casos de Uso</h2>
      <p>Realizamos valoraciones para operaciones de compraventa, planificación de sucesión, reestructuraciones societarias, planificación fiscal, resolución de conflictos entre socios y reporting financiero.</p>
    `,
  },

  "/servicios/due-diligence": {
    title: "Due Diligence Financiera y Fiscal | Capittal",
    description:
      "Servicios de due diligence financiera, fiscal y legal para operaciones de M&A. Identificamos riesgos y oportunidades antes del cierre de la transacción.",
    keywords:
      "due diligence, due diligence financiera, due diligence fiscal, auditoría M&A, revisión empresarial",
    canonical: "https://capittal.es/servicios/due-diligence",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Due Diligence",
        provider: ORG_JSONLD,
        description:
          "Servicios de due diligence financiera, fiscal y legal para operaciones de M&A en España.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["Due Diligence", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cuál es la diferencia entre Buy-Side y Vendor Due Diligence?", answer: "El Buy-Side Due Diligence lo realiza el comprador para evaluar riesgos antes de la adquisición, mientras que el Vendor Due Diligence lo encarga el vendedor para preparar la venta, identificar problemas previos y maximizar el valor de la transacción." },
        { question: "¿Cuándo es recomendable realizar un Vendor Due Diligence?", answer: "Es ideal cuando planeas vender tu empresa en 6-12 meses. Permite identificar y resolver problemas con antelación, optimizar la valoración, preparar documentación completa y acelerar el proceso de venta." },
        { question: "¿Qué áreas cubre el proceso de due diligence?", answer: "Nuestro due diligence cubre análisis financiero, legal, comercial, operativo y estratégico." },
        { question: "¿Cuánto tiempo requiere un due diligence completo?", answer: "El proceso típico toma entre 6-8 semanas, dependiendo del tamaño y complejidad de la empresa. El Vendor DD puede ser más rápido (4-6 semanas)." },
        { question: "¿Cómo un Vendor Due Diligence mejora el precio de venta?", answer: "Al identificar y resolver problemas previos, presentar información transparente y completa, reducimos las contingencias del comprador y creamos confianza que se traduce en mejor valoración." },
        { question: "¿Cómo garantizan la confidencialidad del proceso?", answer: "Todos nuestros profesionales firman acuerdos de confidencialidad estrictos. Mantenemos protocolos de seguridad de información robustos y limitamos el acceso solo al equipo necesario." },
      ]),
    ],
    content: `
      <h1>Due Diligence Financiera y Fiscal</h1>
      <p>Nuestro equipo de due diligence analiza en profundidad la situación financiera, fiscal y legal de la empresa objetivo. Identificamos riesgos ocultos, contingencias y oportunidades de optimización antes del cierre.</p>
      <h2>Alcance de la Due Diligence</h2>
      <p>Cubrimos análisis financiero (calidad de beneficios, capital circulante, deuda neta), revisión fiscal (contingencias, optimización), aspectos legales y laborales, y evaluación comercial del negocio.</p>
      <h2>Experiencia en M&A</h2>
      <p>Hemos participado en procesos de due diligence en múltiples sectores, con especial foco en seguridad privada, tecnología e industria. Nuestro enfoque es práctico y orientado a la toma de decisiones.</p>
    `,
  },

  "/servicios/reestructuraciones": {
    title: "Reestructuración Empresarial | Asesoramiento Financiero | Capittal",
    description:
      "Asesoramiento en reestructuraciones empresariales y financieras. Soluciones para empresas en situaciones especiales: refinanciación, reestructuración de deuda y turnaround.",
    keywords:
      "reestructuración empresarial, reestructuración deuda, refinanciación, turnaround, situaciones especiales",
    canonical: "https://capittal.es/servicios/reestructuraciones",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Reestructuración Empresarial",
        provider: ORG_JSONLD,
        description:
          "Asesoramiento en reestructuraciones financieras y empresariales, refinanciación de deuda y turnaround.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["Reestructuración empresarial", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cuándo es necesaria una reestructuración empresarial?", answer: "Una reestructuración es necesaria cuando la empresa presenta pérdidas recurrentes, problemas de flujo de caja, alta carga de deuda, pérdida de competitividad, o cuando enfrenta cambios significativos en su mercado." },
        { question: "¿Qué tipos de reestructuración realizan?", answer: "Realizamos reestructuraciones operativas (optimización de procesos, reducción de costes), financieras (renegociación de deuda, inyección de capital), y estratégicas (reposicionamiento, diversificación, desinversiones)." },
        { question: "¿Cuánto tiempo toma una reestructuración completa?", answer: "El diagnóstico y plan toman 4-7 semanas, la implementación 6-12 meses, y el seguimiento es continuo hasta la estabilización completa de la empresa." },
        { question: "¿Cómo gestionan la continuidad del negocio durante el proceso?", answer: "Priorizamos la continuidad operativa mediante planes detallados que minimizan la disrupción. Trabajamos en fases y mantenemos la comunicación con stakeholders clave." },
        { question: "¿Cuál es la tasa de éxito de sus reestructuraciones?", answer: "Nuestra tasa de éxito es del 87%, medida por empresas que logran estabilidad financiera y operativa sostenible." },
      ]),
    ],
    content: `
      <h1>Reestructuración Empresarial</h1>
      <p>Capittal asesora a empresas en situaciones especiales que requieren una reestructuración financiera u operativa. Diseñamos soluciones a medida para recuperar la viabilidad del negocio.</p>
      <h2>Servicios de Reestructuración</h2>
      <p>Ofrecemos asesoramiento en refinanciación de deuda, reestructuración de balance, planes de viabilidad, negociación con acreedores, y búsqueda de inversores o socios estratégicos para operaciones de turnaround.</p>
    `,
  },

  "/servicios/planificacion-fiscal": {
    title: "Planificación Fiscal en M&A | Optimización Tributaria | Capittal",
    description:
      "Planificación fiscal especializada en operaciones de compraventa de empresas. Optimización del impacto tributario en fusiones, adquisiciones y reestructuraciones societarias.",
    keywords:
      "planificación fiscal M&A, impuestos venta empresa, optimización fiscal, fiscalidad M&A, tributación compraventa",
    canonical: "https://capittal.es/servicios/planificacion-fiscal",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Planificación Fiscal en M&A",
        provider: ORG_JSONLD,
        description:
          "Planificación fiscal especializada para operaciones de M&A. Optimización del impacto tributario en compraventa de empresas.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["Planificación fiscal", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cuánto puedo ahorrar con planificación fiscal?", answer: "El ahorro depende de múltiples factores. En promedio, nuestros clientes ahorran un 23% en su carga fiscal, llegando hasta un 50% en casos complejos con estructuras internacionales." },
        { question: "¿Es legal la planificación fiscal que realizáis?", answer: "Absolutamente. Todas nuestras estrategias están basadas en normativa vigente, interpretaciones de la AEAT y jurisprudencia consolidada." },
        { question: "¿Cuándo debe iniciarse la planificación fiscal?", answer: "Idealmente, 6-12 meses antes de la operación. La planificación anticipada permite implementar estrategias más sofisticadas y efectivas." },
        { question: "¿Qué diferencia vuestra planificación de la de otros?", answer: "Nuestro equipo combina experiencia en M&A con expertise fiscal especializado. Contamos con abogados fiscalistas senior, expertos en M&A y experiencia directa en más de 200 operaciones." },
        { question: "¿Cómo se estructura el coste del servicio?", answer: "Ofrecemos diferentes modalidades: tarifa fija para análisis estándar, porcentaje del ahorro generado para casos complejos, o una combinación de ambas. El análisis inicial siempre es gratuito." },
        { question: "¿Qué garantías ofrecéis sobre las estrategias fiscales?", answer: "Ofrecemos garantía de cumplimiento normativo al 100%. En caso de discrepancia con Hacienda, nos hacemos cargo de la defensa." },
      ]),
    ],
    content: `
      <h1>Planificación Fiscal en Operaciones de M&A</h1>
      <p>La fiscalidad es un componente crítico en cualquier operación de compraventa de empresas. Capittal ofrece asesoramiento fiscal especializado para optimizar el impacto tributario de la transacción tanto para el comprador como para el vendedor.</p>
      <h2>Áreas de Especialización Fiscal</h2>
      <p>Estructuración fiscal de operaciones de M&A, análisis del impacto en IRPF e Impuesto sobre Sociedades, planificación de la sucesión empresarial, reorganización societaria previa a la venta, y optimización de plusvalías.</p>
    `,
  },

  "/servicios/asesoramiento-legal": {
    title: "Asesoramiento Legal en M&A | Capittal",
    description:
      "Asesoramiento legal integral en operaciones de fusiones y adquisiciones. Contratos, due diligence legal, negociación y cierre de transacciones.",
    keywords:
      "asesoramiento legal M&A, abogados M&A, contratos compraventa empresa, due diligence legal",
    canonical: "https://capittal.es/servicios/asesoramiento-legal",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Asesoramiento Legal en M&A",
        provider: ORG_JSONLD,
        description:
          "Asesoramiento legal integral en operaciones de M&A: contratos, negociación, due diligence legal y cierre.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["Asesoramiento legal M&A", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Qué documentos legales son imprescindibles en una compraventa de empresas?", answer: "Los documentos esenciales incluyen: Letter of Intent (LOI), Share Purchase Agreement (SPA) o Asset Purchase Agreement (APA), Disclosure Letter, Transition Services Agreement (TSA), y documentos de garantías." },
        { question: "¿Qué riesgos se identifican en una due diligence legal?", answer: "Identificamos contingencias laborales, disputas comerciales, incumplimientos contractuales, problemas de propiedad intelectual, pasivos fiscales ocultos, problemas regulatorios sectoriales, litigios pendientes y cuestiones de compliance." },
        { question: "¿Cómo se estructura un earn-out en un contrato de compraventa?", answer: "El earn-out se estructura definiendo métricas objetivas (EBITDA, facturación, clientes), periodos de medición (2-3 años), umbrales mínimos y máximos, mecanismos de cálculo detallados, y cláusulas de protección." },
        { question: "¿Qué pasa si surgen contingencias tras el cierre?", answer: "Se activan las garantías contractuales: el vendedor responde según las warranty & indemnity clauses, se ejecutan las escrow accounts si las hay, y se aplican los caps y baskets acordados." },
        { question: "¿Cómo se coordina el asesoramiento legal con el proceso de valoración?", answer: "La coordinación es total: Capittal maneja la valoración y negociación comercial mientras el equipo legal gestiona todos los aspectos legales. Ambos equipos trabajan en paralelo con comunicación constante." },
      ]),
    ],
    content: `
      <h1>Asesoramiento Legal en Fusiones y Adquisiciones</h1>
      <p>Capittal, en colaboración con despachos de abogados especializados, ofrece cobertura legal completa en operaciones de M&A. Desde la redacción de la carta de intenciones hasta el contrato de compraventa (SPA).</p>
      <h2>Servicios Legales</h2>
      <p>Due diligence legal, redacción y negociación del SPA, cláusulas de garantías y representaciones, pactos de socios, acuerdos de confidencialidad (NDA) y contratos de gestión post-transacción.</p>
    `,
  },

  // ─── SECTORES ───
  "/sectores/seguridad": {
    title: "M&A Sector Seguridad | Fusiones y Adquisiciones Seguridad Privada - Capittal",
    description:
      "Capittal es la firma líder en M&A del sector seguridad en España. Asesoramos en compraventa de empresas de seguridad privada, alarmas, vigilancia y servicios auxiliares.",
    keywords:
      "M&A seguridad privada, fusiones adquisiciones seguridad, vender empresa vigilancia, valoración alarmas, compraventa empresas seguridad, ciberseguridad M&A, sistemas contra incendios, control de accesos",
    canonical: "https://capittal.es/sectores/seguridad",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Seguridad",
        provider: ORG_JSONLD,
        description:
          "Asesoramiento especializado en fusiones y adquisiciones para empresas de seguridad privada, alarmas, vigilancia y servicios auxiliares en España y Europa.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector seguridad", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cómo se valora una empresa de seguridad privada?", answer: "Las empresas de seguridad se valoran principalmente por múltiplo de EBITDA (5-9x según subsector). Los factores clave son: recurrencia de contratos, concentración de clientes, margen operativo y licencias/habilitaciones." },
        { question: "¿Qué diferencia hay entre valorar vigilancia vs seguridad electrónica?", answer: "La seguridad electrónica (alarmas, CCTV) cotiza a múltiplos superiores (7-9x) por mayor recurrencia, márgenes y escalabilidad. La vigilancia tradicional (5-7x) es más intensiva en personal." },
        { question: "¿Quién compra empresas de seguridad en España?", answer: "Los principales compradores son: grandes operadores (Prosegur, Securitas, Grupo Control), fondos de private equity armando plataformas de consolidación, y competidores regionales buscando escala." },
        { question: "¿Cuánto tiempo lleva vender una empresa de seguridad?", answer: "El proceso típico es de 6-9 meses. La due diligence se centra en contratos, personal habilitado, licencias y cumplimiento normativo." },
        { question: "¿Qué impacto tiene la regulación en la valoración?", answer: "El sector está muy regulado (Ley de Seguridad Privada). Las licencias, habilitaciones de personal y certificaciones son activos valiosos que impactan positivamente en la valoración." },
      ]),
    ],
    content: `
      <h1>Especialistas en M&A del Sector Seguridad</h1>
      <p>Líderes en asesoramiento de fusiones y adquisiciones para empresas de seguridad privada, sistemas de alarmas, vigilancia y servicios auxiliares en España y Europa.</p>
      <h2>Nuestro expertise en seguridad</h2>
      <p>En Capittal contamos con un conocimiento profundo del sector de la seguridad privada en España y Europa. Hemos asesorado en múltiples operaciones que abarcan desde empresas de vigilancia tradicional hasta compañías líderes en alarmas, sistemas contra incendios, control de accesos y ciberseguridad.</p>
      <h2>Operaciones destacadas</h2>
      <p>Scutum Group / APT Instalaciones (seguridad electrónica, sell-side). Scutum / Grupo SEA España (sistemas de seguridad, sell-side). Mitie / Visegurity (vigilancia, buy-side). Scutum / Kosmos Group (sistemas contra incendios, sell-side).</p>
      <h2>El sector seguridad en España: tendencias M&A</h2>
      <p>Consolidación: el mercado español de seguridad privada se encuentra altamente fragmentado. Tecnificación: transición de vigilancia humana a sistemas electrónicos inteligentes. Regulación: la Ley de Seguridad Privada establece barreras de entrada significativas. Internacionalización: grupos europeos como Scutum y Securitas adquieren activamente empresas españolas.</p>
      <h2>¿Por qué Capittal para el sector seguridad?</h2>
      <p>Conocimiento sectorial profundo. Red de contactos con PEs internacionales. Track record demostrable con compradores como Scutum Group y Mitie. Partnership con Francisco Garcia & Assessors para asesoramiento integral.</p>
    `,
  },

  "/sectores/tecnologia": {
    title: "M&A Sector Tecnología | Valoración de Empresas Tech - Capittal",
    description:
      "Asesoramiento especializado en fusiones y adquisiciones del sector tecnológico. Valoración, due diligence y negociación de operaciones tech.",
    keywords:
      "M&A tecnología, venta empresa tecnológica, compra startup tech, fusiones IT España, valoración SaaS",
    canonical: "https://capittal.es/sectores/tecnologia",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Tecnología",
        provider: ORG_JSONLD,
        description: "Asesoramiento especializado en fusiones y adquisiciones del sector tecnológico. Valoración, due diligence y negociación de operaciones tech.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector tecnología", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cómo se valora una empresa SaaS en 2025?", answer: "Las empresas SaaS se valoran principalmente por múltiplo de ARR (Annual Recurring Revenue), típicamente entre 4-8x en 2025. Los factores clave son: crecimiento YoY, Net Revenue Retention, márgenes brutos y eficiencia de CAC payback." },
        { question: "¿Qué múltiplos se pagan por startups tech en España?", answer: "Los múltiplos varían: SaaS B2B con buen crecimiento obtiene 5-8x ARR, FinTech regulado 6-10x, ciberseguridad 8-12x, y AI/deep tech puede alcanzar 10-20x por el valor de la IP." },
        { question: "¿Cuál es el estado del mercado tech español en 2025?", answer: "España se posiciona en el Top 5 europeo. La inversión VC alcanzó €2.9B en 2024 (+60% vs 2023), con más de 300 operaciones públicas." },
        { question: "¿Es necesario tener beneficios para vender una empresa tech?", answer: "No necesariamente. En tech, los compradores priorizan crecimiento, retención y potencial de mercado sobre rentabilidad actual. Sin embargo, la eficiencia (rule of 40) es cada vez más valorada." },
        { question: "¿Qué tipo de compradores buscan empresas tech españolas?", answer: "El mercado español atrae a grupos de software europeos y americanos en expansión, fondos de private equity con estrategias de buy & build, corporates buscando adquisiciones de producto/talento, y fondos especializados en ciberseguridad e IA." },
      ]),
    ],
    content: `
      <h1>M&A en el Sector Tecnológico</h1>
      <p>Capittal asesora en operaciones de compraventa de empresas tecnológicas en España y Europa. Nuestro equipo entiende las particularidades de valoración de empresas SaaS, software y servicios IT.</p>
      <h2>Áreas Tecnológicas</h2>
      <p>Software empresarial (SaaS, ERP, CRM), ciberseguridad, servicios IT gestionados, consultoría tecnológica, desarrollo de software, plataformas digitales y deep tech.</p>
      <h2>Valoración de Empresas Tech</h2>
      <p>Las empresas tecnológicas requieren metodologías de valoración específicas que consideren el ARR (Annual Recurring Revenue), las métricas SaaS (churn, LTV/CAC), la escalabilidad del modelo y el crecimiento futuro.</p>
    `,
  },

  "/sectores/industrial": {
    title: "M&A Sector Industrial | Compraventa de Empresas Industriales - Capittal",
    description:
      "Expertos en transacciones del sector industrial. Asesoramiento integral en valoración, compraventa y reestructuración de empresas industriales.",
    keywords:
      "M&A industrial, venta empresa industrial, compra fábrica, fusiones industria España, valoración empresa industrial",
    canonical: "https://capittal.es/sectores/industrial",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Industrial",
        provider: ORG_JSONLD,
        description: "Expertos en transacciones del sector industrial. Asesoramiento integral en valoración, compraventa y reestructuración de empresas industriales.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector industrial", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cómo se valora una empresa industrial?", answer: "Las empresas industriales se valoran principalmente por múltiplo de EBITDA (5-8x según subsector), pero también consideramos el valor de activos fijos (maquinaria, naves), contratos con clientes, eficiencia operativa y potencial de mejora." },
        { question: "¿Qué tipo de compradores buscan empresas industriales en España?", answer: "El mercado atrae a grupos industriales europeos (alemanes, franceses, italianos), fondos de private equity especializados en buy & build, y competidores nacionales en consolidación." },
        { question: "¿Cuánto vale la maquinaria en la valoración?", answer: "La maquinaria se valora a valor de mercado (no contable), considerando estado, antigüedad y vida útil. Suele representar el 20-40% del enterprise value." },
        { question: "¿Qué documentación necesito para vender mi empresa industrial?", answer: "Necesitarás: estados financieros de 3-5 años, inventario detallado de activos, contratos principales, licencias y certificaciones (ISO, medioambiente), organigramas, y documentación de propiedad industrial." },
        { question: "¿Cómo afecta la ubicación al valor de una empresa industrial?", answer: "La ubicación es crítica: acceso a infraestructuras (puertos, autovías), disponibilidad de mano de obra cualificada, costes laborales regionales. Empresas en polígonos bien conectados pueden alcanzar primas del 10-20%." },
      ]),
    ],
    content: `
      <h1>M&A en el Sector Industrial</h1>
      <p>Capittal asesora en operaciones de fusiones y adquisiciones del sector industrial en España. Desde empresas de fabricación y manufactura hasta servicios de ingeniería y mantenimiento industrial.</p>
      <h2>Subsectores Industriales</h2>
      <p>Metalurgia, plásticos, automoción, alimentación industrial, packaging, maquinaria, ingeniería y mantenimiento industrial, y servicios auxiliares a la industria.</p>
    `,
  },

  "/sectores/healthcare": {
    title: "M&A Sector Healthcare y Salud | Capittal",
    description:
      "Asesoramiento en fusiones y adquisiciones del sector salud y healthcare en España. Clínicas, laboratorios, farma, medtech y servicios sanitarios.",
    keywords:
      "M&A healthcare, venta clínica, compra laboratorio, fusiones salud España, valoración empresa sanitaria",
    canonical: "https://capittal.es/sectores/healthcare",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Healthcare",
        provider: ORG_JSONLD,
        description: "Asesoramiento en M&A del sector healthcare y salud: clínicas, laboratorios, farma y medtech.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector healthcare", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Qué múltiplos de valoración se utilizan en el sector healthcare?", answer: "Los múltiplos varían según subsector: clínicas dentales 8-10x EBITDA, oftalmología 9-12x por alta recurrencia, laboratorios dentales 6-8x, y residencias geriátricas €15-18K por cama en ubicaciones prime." },
        { question: "¿Qué papel juega el Private Equity en el sector salud español?", answer: "El PE es el motor de consolidación del sector. Alantra PE ha creado la mayor plataforma de laboratorios dentales con ~20 adquisiciones. Miura vendió Terrats a Avista por €250M." },
        { question: "¿Cómo afecta la regulación a la venta de una empresa sanitaria?", answer: "Las operaciones en healthcare requieren due diligence regulatoria específica: verificación de licencias sanitarias, cumplimiento RGPD sanitario, acreditaciones y autorizaciones autonómicas." },
        { question: "¿Qué tipos de compradores están activos en el sector salud español?", answer: "Fondos especializados en healthcare, grupos de consolidación europeos en dental y oftalmología, aseguradoras con integración vertical (Sanitas, Adeslas), y family offices buscando activos resilientes." },
        { question: "¿Cuánto tiempo lleva vender una clínica o empresa sanitaria?", answer: "El proceso típico dura entre 6-12 meses dependiendo de la complejidad regulatoria y el tamaño. Clínicas especializadas con documentación ordenada pueden cerrar en 4-6 meses." },
      ]),
    ],
    content: `
      <h1>M&A en el Sector Healthcare y Salud</h1>
      <p>Capittal asesora en operaciones de compraventa de empresas del sector salud en España. Las clínicas, laboratorios, empresas farmacéuticas y de tecnología médica son activos con alta demanda por parte de fondos de inversión y grupos hospitalarios.</p>
      <h2>Áreas de Especialización</h2>
      <p>Clínicas dentales, oftalmología, dermatología estética, laboratorios de análisis, distribución farmacéutica, medtech, residencias y servicios de atención domiciliaria.</p>
    `,
  },

  "/sectores/energia": {
    title: "M&A Sector Energía y Renovables | Capittal",
    description:
      "Asesoramiento en fusiones y adquisiciones del sector energético en España. Energías renovables, eficiencia energética, utilities e instalaciones.",
    keywords:
      "M&A energía, venta empresa energética, fusiones renovables, valoración empresa energía, M&A utilities",
    canonical: "https://capittal.es/sectores/energia",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Energía",
        provider: ORG_JSONLD,
        description: "Asesoramiento en M&A del sector energético: renovables, eficiencia energética y utilities.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector energía", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cómo se valora una planta solar o eólica en 2025?", answer: "Las plantas renovables se valoran principalmente por DCF considerando producción esperada, precios de energía y PPAs existentes. Los múltiplos de referencia son 10-14x EBITDA para activos con PPA a largo plazo." },
        { question: "¿Qué diferencia hay entre valorar un proyecto en desarrollo vs en operación?", answer: "Los proyectos en desarrollo se valoran por MW de capacidad, típicamente €50-150k/MW según fase. Los activos en operación se valoran por DCF con datos reales. El descuento por riesgo de desarrollo es del 40-60%." },
        { question: "¿Qué fondos están comprando renovables en España en 2024-2025?", answer: "El mercado atrae a fondos de infraestructuras (Blackrock, Brookfield, Macquarie), fondos de pensiones con mandatos ESG, utilities en expansión, y oil majors diversificando." },
        { question: "¿Cómo afecta el tipo de contrato PPA a la valoración?", answer: "Los PPAs corporativos a largo plazo (10-15 años) con contrapartes investment grade pueden añadir 1-2 puntos de múltiplo EBITDA. Un activo 100% merchant puede valorarse 20-30% por debajo de uno con PPA." },
        { question: "¿Cuánto tiempo lleva vender un activo renovable?", answer: "El proceso típico es de 6-10 meses para un portfolio en operación. La due diligence técnica es intensiva. Un data room bien preparado puede acelerar 2-3 meses el proceso." },
      ]),
    ],
    content: `
      <h1>M&A en el Sector Energía y Renovables</h1>
      <p>Capittal asesora en operaciones de M&A del sector energético en España: empresas de energías renovables, eficiencia energética, instalaciones eléctricas y utilities.</p>
      <h2>Oportunidades en Energía</h2>
      <p>La transición energética genera oportunidades de consolidación en fotovoltaica, eólica, almacenamiento de energía, puntos de recarga para vehículos eléctricos y servicios de eficiencia energética.</p>
    `,
  },

  "/sectores/construccion": {
    title: "M&A Sector Construcción e Inmobiliario | Capittal",
    description:
      "Asesoramiento en fusiones y adquisiciones del sector construcción e inmobiliario en España. Promotoras, constructoras, ingeniería civil y rehabilitación.",
    keywords:
      "M&A construcción, venta constructora, fusiones inmobiliaria, valoración empresa construcción",
    canonical: "https://capittal.es/sectores/construccion",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Construcción",
        provider: ORG_JSONLD,
        description: "Asesoramiento en M&A del sector construcción e inmobiliario en España.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector construcción", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cómo se valora una empresa constructora?", answer: "Las constructoras se valoran principalmente por múltiplo de EBITDA (5-8x) ajustado por la calidad de la cartera de obra. Factores clave: backlog de proyectos, márgenes históricos, concentración de clientes, maquinaria en propiedad." },
        { question: "¿Qué diferencia hay entre valorar obra civil vs rehabilitación?", answer: "La rehabilitación puede cotizar a múltiplos ligeramente superiores (6-8x) por el impulso de fondos europeos y mayor recurrencia. La obra civil pública (5-7x) tiene flujos más predecibles pero márgenes ajustados." },
        { question: "¿Quién compra empresas de construcción en España?", answer: "Los principales compradores son: grupos constructores medianos buscando capacidades o geografía, fondos de private equity, y empresas de instalaciones diversificando." },
        { question: "¿Cómo afectan las garantías de obra a la valoración?", answer: "Las garantías de obra pendientes se descuentan del precio. Se analiza el histórico de siniestralidad y las provisiones existentes." },
        { question: "¿Cuánto tiempo lleva vender una constructora?", answer: "El proceso típico es de 6-10 meses. La due diligence es intensiva: análisis de proyectos en curso, márgenes reales, garantías y litigios." },
      ]),
    ],
    content: `
      <h1>M&A en el Sector Construcción e Inmobiliario</h1>
      <p>Capittal asesora en operaciones de compraventa de empresas del sector construcción e inmobiliario. Desde constructoras y promotoras hasta empresas de ingeniería civil, rehabilitación y facility management.</p>
    `,
  },

  "/sectores/logistica": {
    title: "M&A Sector Logística y Transporte | Capittal",
    description:
      "Asesoramiento en fusiones y adquisiciones del sector logística y transporte en España. Transporte por carretera, almacenamiento, última milla y supply chain.",
    keywords:
      "M&A logística, venta empresa transporte, fusiones logística España, valoración empresa logística",
    canonical: "https://capittal.es/sectores/logistica",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Logística",
        provider: ORG_JSONLD,
        description: "Asesoramiento en M&A del sector logística y transporte: carretera, almacenamiento, última milla.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector logística", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cómo se valora una empresa de transporte?", answer: "Las empresas de transporte se valoran por múltiplo de EBITDA (4-8x) ajustado por calidad de flota y contratos. Factores clave: antigüedad media de flota, proporción propia vs subcontratada, concentración de clientes." },
        { question: "¿Qué diferencia hay entre transporte y operador logístico?", answer: "Los operadores logísticos 3PL cotizan a múltiplos superiores (6-8x) por mayor recurrencia, servicios de valor añadido y contratos a largo plazo. El transporte puro (4-6x) es más intensivo en activos." },
        { question: "¿Quién compra empresas de logística en España?", answer: "Los principales compradores son: grandes operadores logísticos (XPO, SEUR, Logista), fondos de private equity, y competidores regionales. Hay especial interés en última milla y operadores con tecnología avanzada." },
        { question: "¿Cómo afecta la flota a la valoración?", answer: "La flota es un activo clave. Se valora: antigüedad media (ideal <5 años), proporción Euro 6 y vehículos eléctricos, financiación pendiente, y programa de renovación. Una flota moderna puede añadir 0,5-1x al múltiplo." },
        { question: "¿Cuánto tiempo lleva vender una empresa logística?", answer: "El proceso típico es de 6-9 meses. La due diligence incluye análisis de contratos, flota, conductores y cumplimiento normativo." },
      ]),
    ],
    content: `
      <h1>M&A en el Sector Logística y Transporte</h1>
      <p>Capittal asesora en operaciones de M&A del sector logístico en España: empresas de transporte por carretera, almacenamiento y distribución, última milla, supply chain management y freight forwarding.</p>
    `,
  },

  "/sectores/medio-ambiente": {
    title: "M&A Sector Medio Ambiente y Gestión de Residuos | Capittal",
    description:
      "Asesoramiento en M&A del sector medio ambiente en España. Gestión de residuos, reciclaje, tratamiento de aguas, consultoría ambiental y economía circular.",
    keywords:
      "M&A medio ambiente, venta empresa residuos, fusiones reciclaje, valoración empresa ambiental",
    canonical: "https://capittal.es/sectores/medio-ambiente",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Medio Ambiente",
        provider: ORG_JSONLD,
        description: "Asesoramiento en M&A del sector medio ambiente: gestión de residuos, reciclaje y economía circular.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector medio ambiente", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cómo se valora una empresa de gestión de residuos?", answer: "Las empresas de residuos se valoran por múltiplo de EBITDA (7-11x) según calidad de contratos y activos. Concesiones con +10 años de duración obtienen primas significativas." },
        { question: "¿Qué diferencia hay entre residuos urbanos e industriales?", answer: "Los residuos urbanos con concesiones públicas cotizan a múltiplos superiores (8-11x) por flujos predecibles. Los residuos industriales (6-9x) tienen menor visibilidad pero mayores márgenes por especialización." },
        { question: "¿Quién compra empresas de medio ambiente?", answer: "Los principales compradores son: utilities (Urbaser, FCC, Ferrovial), fondos de infraestructuras con mandatos ESG, y operadores europeos buscando presencia en España." },
        { question: "¿Cómo afectan los pasivos ambientales?", answer: "Los pasivos ambientales son críticos en la due diligence. Se realizan auditorías ambientales específicas y se negocian garantías. Empresas con buen historial obtienen mejores valoraciones." },
        { question: "¿Cuánto tiempo lleva vender una empresa de residuos?", answer: "El proceso típico es de 8-12 meses por complejidad de due diligence ambiental y técnica." },
      ]),
    ],
    content: `
      <h1>M&A en el Sector Medio Ambiente</h1>
      <p>Capittal asesora en operaciones de compraventa de empresas del sector medioambiental: gestión de residuos, reciclaje, tratamiento de aguas, consultoría ambiental y economía circular. Un sector en plena consolidación por la creciente regulación y la demanda de sostenibilidad.</p>
    `,
  },

  "/sectores/retail-consumer": {
    title: "M&A Sector Retail y Consumo | Capittal",
    description:
      "Asesoramiento en fusiones y adquisiciones del sector retail y consumo en España. Distribución, franquicias, e-commerce y bienes de consumo.",
    keywords:
      "M&A retail, venta empresa consumo, fusiones distribución, valoración empresa retail",
    canonical: "https://capittal.es/sectores/retail-consumer",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Retail y Consumo",
        provider: ORG_JSONLD,
        description: "Asesoramiento en M&A del sector retail y consumo: distribución, franquicias y e-commerce.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector retail", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cómo se valora una marca de consumo?", answer: "Las marcas de consumo se valoran por múltiplo de EBITDA (6-12x según categoría) o ingresos para marcas en crecimiento. Factores clave: brand equity, márgenes, canales de distribución, recurrencia de compra y potencial de expansión." },
        { question: "¿Qué múltiplos se pagan en e-commerce?", answer: "Los múltiplos varían: 1-2x ingresos para retailers con márgenes bajos, 2-4x para marcas propias con buenos márgenes, y hasta 6-8x EBITDA para plataformas con recurrencia alta." },
        { question: "¿Qué tipo de compradores están activos en retail & consumer?", answer: "Grupos de retail y moda internacionales, fondos de private equity especializados en consumer, holdings de marcas, y corporate ventures de grandes retailers." },
        { question: "¿Cómo afecta el canal de venta a la valoración?", answer: "Las ventas DTC (direct-to-consumer) se valoran más que wholesale porque ofrecen mejores márgenes, datos de cliente y control de marca. Un modelo omnicanal equilibrado suele maximizar valor." },
        { question: "¿Es importante la sostenibilidad para la valoración?", answer: "Cada vez más. Las marcas con propuesta ESG auténtica obtienen primas de valoración del 10-20% y atraen a más compradores estratégicos." },
      ]),
    ],
    content: `
      <h1>M&A en el Sector Retail y Consumo</h1>
      <p>Capittal asesora en operaciones de M&A del sector retail y bienes de consumo en España: cadenas de distribución, franquicias, e-commerce, marcas de consumo y food & beverage.</p>
    `,
  },

  "/sectores/alimentacion": {
    title: "M&A Sector Alimentación y Agroalimentario | Capittal",
    description:
      "Asesoramiento en fusiones y adquisiciones del sector alimentación y agroalimentario en España. Empresas alimentarias, distribución, food service y agro.",
    keywords:
      "M&A alimentación, venta empresa alimentaria, fusiones agroalimentario, valoración empresa alimentación",
    canonical: "https://capittal.es/sectores/alimentacion",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Alimentación",
        provider: ORG_JSONLD,
        description: "Asesoramiento en M&A del sector alimentario y agroalimentario en España.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["M&A sector alimentación", "Mergers and Acquisitions Advisory"],
      },
      buildFAQPageSchema([
        { question: "¿Cómo se valora una empresa alimentaria?", answer: "Las empresas alimentarias se valoran por múltiplo de EBITDA (6-10x) según marca, canal y capacidad exportadora. Productos premium y DOP obtienen múltiplos superiores." },
        { question: "¿Qué diferencia hay entre producción y distribución?", answer: "Los fabricantes con marca propia cotizan a múltiplos superiores (6-9x). Los distribuidores (5-7x) se valoran por red logística, cartera de clientes y contratos recurrentes." },
        { question: "¿Quién compra empresas alimentarias en España?", answer: "Multinacionales alimentarias buscando productos españoles, fondos de private equity armando plataformas, y grupos familiares españoles consolidando. Hay especial interés en aceite, vino, conservas y gourmet." },
        { question: "¿Cómo afectan las certificaciones a la valoración?", answer: "Las certificaciones (IFS, BRC, ecológico, DOP, IGP) son muy valoradas. Una empresa con certificaciones completas puede obtener 0,5-1x adicional de múltiplo." },
        { question: "¿Cuánto tiempo lleva vender una empresa alimentaria?", answer: "El proceso típico es de 6-10 meses. La due diligence incluye análisis de certificaciones, contratos con distribuidores, calidad de producto y cadena de suministro." },
      ]),
    ],
    content: `
      <h1>M&A en el Sector Alimentación y Agroalimentario</h1>
      <p>Capittal asesora en operaciones de compraventa de empresas del sector alimentario en España: fabricantes, distribuidores, food service, catering, y empresas agroalimentarias. Un sector con alta actividad M&A por la consolidación y la entrada de fondos de inversión.</p>
    `,
  },

  // ─── OTRAS PÁGINAS ───
  "/contacto": {
    title: "Contacto | Capittal Transacciones - Asesores M&A Barcelona",
    description:
      "Contacta con Capittal para asesoramiento en M&A, valoraciones y due diligence. Oficinas en Ausiàs March 36, Barcelona.",
    keywords:
      "contacto M&A Barcelona, asesores fusiones adquisiciones, consulta valoración empresas, Capittal contacto",
    canonical: "https://capittal.es/contacto",
    ogType: "website",
    hreflang: {
      es: "https://capittal.es/contacto",
      ca: "https://capittal.es/contacte",
      en: "https://capittal.es/contact",
      "x-default": "https://capittal.es/contacto",
    },
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Capittal Transacciones",
        url: "https://capittal.es",
        image: "https://capittal.es/og-image.png",
        telephone: "+34695717490",
        email: "info@capittal.es",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Ausiàs March 36, Principal",
          addressLocality: "Barcelona",
          postalCode: "08010",
          addressCountry: "ES",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 41.3935,
          longitude: 2.1753,
        },
        areaServed: { "@type": "Country", name: "España" },
        description: "Firma líder en asesoramiento de fusiones y adquisiciones con sede en Barcelona. Especialistas en sector seguridad.",
        priceRange: "$$$$",
        openingHours: "Mo-Fr 09:00-19:00",
      },
    ],
    content: `
      <h1>Contacta con nosotros</h1>
      <p>Hablemos sobre tu próxima operación. Nuestro equipo de más de 70 profesionales está a tu disposición para asesorarte en M&A, valoraciones y due diligence con la máxima confidencialidad.</p>
      <h2>Oficina en Barcelona</h2>
      <p>Ausiàs March 36, Principal, 08010 Barcelona, España. Teléfono: +34 695 717 490. Email: info@capittal.es.</p>
      <h2>Nuestros servicios</h2>
      <p>Asesoramiento en venta de empresas, adquisiciones, valoraciones profesionales y due diligence financiero, legal y comercial.</p>
      <h2>¿Por qué Capittal?</h2>
      <p>Más de 70 profesionales, especialistas en el sector seguridad, operaciones con Private Equity internacional y máxima confidencialidad en cada proceso.</p>
    `,
  },

  "/equipo": {
    title: "Nuestro Equipo | +70 Profesionales en M&A - Capittal Transacciones",
    description:
      "Conoce al equipo de Capittal: profesionales con experiencia en Deloitte, ESADE y las principales firmas de corporate finance de España.",
    keywords:
      "equipo Capittal, profesionales M&A, asesores financieros Barcelona, equipo fusiones adquisiciones",
    canonical: "https://capittal.es/equipo",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "Equipo Capittal",
        url: "https://capittal.es/equipo",
        description: "Conoce al equipo de Capittal: profesionales con experiencia en Deloitte, ESADE y las principales firmas de corporate finance de España.",
        mainEntity: ORG_JSONLD,
      },
    ],
    content: `
      <h1>Nuestro Equipo</h1>
      <p>El equipo de Capittal está formado por profesionales con amplia experiencia en banca de inversión, consultoría estratégica y operaciones de M&A. Nuestros socios provienen de firmas como Deloitte, PwC y bancos de inversión internacionales, con formación en escuelas de negocio de primer nivel como ESADE.</p>
      <h2>Experiencia y Formación</h2>
      <p>Combinamos conocimiento financiero con experiencia sectorial profunda, especialmente en seguridad privada, tecnología e industria. Nuestro enfoque boutique nos permite ofrecer atención personalizada a cada cliente.</p>
    `,
  },

  "/por-que-elegirnos": {
    title: "¿Por Qué Elegir Capittal? | Diferenciación M&A | Capittal",
    description:
      "Descubra por qué Capittal es la firma de M&A de referencia en España. Especialización sectorial, confidencialidad, experiencia y resultados demostrables.",
    keywords:
      "por qué Capittal, ventajas M&A, mejor asesor venta empresa, especialistas M&A España",
    canonical: "https://capittal.es/por-que-elegirnos",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "¿Por Qué Elegir Capittal?",
        url: "https://capittal.es/por-que-elegirnos",
        description: "Razones para elegir Capittal como asesor en operaciones de M&A.",
        mainEntity: ORG_JSONLD,
      },
    ],
    content: `
      <h1>¿Por Qué Elegir Capittal?</h1>
      <p>Capittal se diferencia por su especialización sectorial, su enfoque boutique y su compromiso con la confidencialidad y los resultados. No somos una firma generalista: nos especializamos en los sectores donde tenemos verdadera experiencia y contactos.</p>
      <h2>Nuestras Ventajas</h2>
      <p>Especialización sectorial profunda (seguridad, tecnología, industria), red de contactos con fondos de inversión y compradores corporativos, equipo con experiencia en banca de inversión de primer nivel, y un track record verificable de operaciones completadas con éxito.</p>
    `,
  },

  "/casos-exito": {
    title: "Casos de Éxito y Track Record | Operaciones M&A | Capittal",
    description:
      "Track record de Capittal: operaciones de M&A completadas en seguridad, tecnología e industria. Scutum, APT Instalaciones, Mitie, Visegurity y más.",
    keywords:
      "casos éxito M&A, track record Capittal, operaciones completadas, transacciones M&A España",
    canonical: "https://capittal.es/casos-exito",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Casos de Éxito - Capittal",
        url: "https://capittal.es/casos-exito",
        description: "Track record de operaciones de M&A completadas por Capittal.",
      },
    ],
    content: `
      <h1>Casos de Éxito y Track Record</h1>
      <p>Capittal ha asesorado en numerosas operaciones de compraventa de empresas, principalmente en los sectores de seguridad privada, tecnología e industria. A continuación presentamos algunas de nuestras transacciones más representativas.</p>
      <h2>Operaciones Destacadas</h2>
      <p>Scutum Group / Kosmos Group (sistemas contra incendios), Scutum / APT Instalaciones (seguridad), Scutum / Grupo SEA España, Mitie / Visegurity, entre otras operaciones en España y Europa.</p>
      <h2>Sectores con Mayor Actividad</h2>
      <p>Seguridad privada y protección contra incendios, tecnología y servicios IT, industria y manufactura, y servicios profesionales.</p>
    `,
  },

  "/programa-colaboradores": {
    title: "Programa de Colaboradores | Red de Partners | Capittal",
    description:
      "Únase al programa de colaboradores de Capittal. Refiera operaciones de M&A y reciba comisiones de éxito. Red de asesores, abogados y consultores.",
    keywords:
      "programa colaboradores M&A, referir operaciones, comisiones M&A, partnership asesores, red partners",
    canonical: "https://capittal.es/programa-colaboradores",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Programa de Colaboradores - Capittal",
        url: "https://capittal.es/programa-colaboradores",
        description: "Programa de colaboradores y partners para referir operaciones de M&A.",
        mainEntity: ORG_JSONLD,
      },
    ],
    content: `
      <h1>Programa de Colaboradores</h1>
      <p>El programa de colaboradores de Capittal permite a asesores fiscales, abogados, consultores y otros profesionales colaborar con nosotros refiriendo operaciones de compraventa de empresas. Ofrecemos una compensación atractiva por cada operación que se cierre con éxito.</p>
      <h2>¿Cómo Funciona?</h2>
      <p>Identifique empresarios que deseen vender o comprar una empresa, preséntenos la oportunidad y nosotros nos encargamos del proceso completo de M&A. Usted recibe una comisión de éxito al cierre de la operación.</p>
      <h2>Beneficios del Programa</h2>
      <p>Comisión de éxito competitiva, soporte completo del equipo Capittal, confidencialidad garantizada, formación en M&A y acceso a herramientas exclusivas para colaboradores.</p>
    `,
  },

  "/venta-empresas": {
    title: "Venta de Empresas | Asesoramiento M&A Profesional - Capittal",
    description:
      "¿Quieres vender tu empresa? Capittal te acompaña en todo el proceso: valoración, búsqueda de comprador, negociación y cierre. Máxima confidencialidad.",
    keywords:
      "vender mi empresa, quiero vender empresa, venta de negocio, cómo vender empresa, asesor venta empresa",
    canonical: "https://capittal.es/venta-empresas",
    ogType: "website",
    hreflang: {
      es: "https://capittal.es/venta-empresas",
      ca: "https://capittal.es/venda-empreses",
      en: "https://capittal.es/sell-companies",
      "x-default": "https://capittal.es/venta-empresas",
    },
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Venta de Empresas",
        provider: ORG_JSONLD,
        description: "¿Quieres vender tu empresa? Capittal te acompaña en todo el proceso: valoración, búsqueda de comprador, negociación y cierre. Máxima confidencialidad.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["Venta de empresas", "Mergers and Acquisitions Advisory"],
      },
    ],
    content: `
      <h1>Vender mi Empresa</h1>
      <p>Capittal le asesora en todo el proceso de venta de su empresa, desde la valoración inicial hasta el cierre de la operación. Nuestro objetivo es maximizar el valor de la transacción garantizando la máxima confidencialidad.</p>
      <h2>Proceso de Venta</h2>
      <p>Valoración profesional, preparación del memorando informativo, identificación de compradores potenciales, gestión del data room virtual, negociación y cierre. Todo con el acompañamiento de nuestro equipo especializado.</p>
    `,
  },

  "/compra-empresas": {
    title: "Compra de Empresas | Asesoría Buy-Side M&A - Capittal",
    description:
      "Identificamos y evaluamos oportunidades de adquisición alineadas con tu estrategia de crecimiento. Especialistas en sector seguridad y servicios auxiliares.",
    keywords:
      "comprar empresa, adquirir negocio, buy-side M&A, búsqueda empresas comprar, adquisición empresa",
    canonical: "https://capittal.es/compra-empresas",
    ogType: "website",
    hreflang: {
      es: "https://capittal.es/compra-empresas",
      ca: "https://capittal.es/compra-empreses",
      en: "https://capittal.es/buy-companies",
      "x-default": "https://capittal.es/compra-empresas",
    },
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Compra de Empresas",
        provider: ORG_JSONLD,
        description: "Identificamos y evaluamos oportunidades de adquisición alineadas con tu estrategia de crecimiento. Especialistas en sector seguridad y servicios auxiliares.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["Compra de empresas", "Mergers and Acquisitions Advisory"],
      },
    ],
    content: `
      <h1>Comprar una Empresa</h1>
      <p>Capittal asesora a compradores corporativos y fondos de inversión en la identificación, evaluación y adquisición de empresas en España. Nuestro servicio buy-side cubre todo el proceso desde la definición de la estrategia de adquisición hasta el cierre.</p>
      <h2>Servicios Buy-Side</h2>
      <p>Definición de criterios de búsqueda, identificación de targets, aproximación confidencial, valoración, due diligence coordinada, negociación y cierre.</p>
    `,
  },

  "/recursos/blog": {
    title: "Blog de M&A y Valoraciones | Artículos y Análisis | Capittal",
    description:
      "Blog de Capittal sobre fusiones y adquisiciones, valoración de empresas, due diligence, tendencias sectoriales y casos de estudio de M&A en España.",
    keywords:
      "blog M&A, artículos fusiones adquisiciones, noticias M&A España, análisis valoración empresas, tendencias M&A",
    canonical: "https://capittal.es/recursos/blog",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Blog Capittal - M&A y Valoraciones",
        url: "https://capittal.es/recursos/blog",
        description: "Artículos y análisis sobre fusiones y adquisiciones, valoración de empresas y tendencias sectoriales en España.",
        publisher: ORG_JSONLD,
      },
    ],
    content: `
      <h1>Blog de M&A y Valoraciones</h1>
      <p>En el blog de Capittal publicamos artículos y análisis sobre fusiones y adquisiciones, valoración de empresas, due diligence, tendencias sectoriales y casos de estudio del mercado M&A en España.</p>
      <h2>Temas Principales</h2>
      <p>Valoración de empresas por sectores, guías para vender tu empresa, tendencias de M&A en seguridad privada, tecnología e industria, planificación fiscal en operaciones de compraventa, y análisis de múltiplos sectoriales.</p>
      <h2>Recursos para Empresarios</h2>
      <p>Calculadora de valoración gratuita, informes sectoriales, guías de due diligence y herramientas para preparar su empresa para la venta.</p>
    `,
  },

  "/de-looper-a-capittal": {
    title: "De Looper a Capittal | Nuestra Historia | Capittal",
    description:
      "Conoce la evolución de Looper a Capittal. Nuestra historia de transformación y crecimiento como firma de M&A de referencia en España.",
    keywords:
      "Looper Capittal, historia Capittal, evolución marca, rebranding M&A",
    canonical: "https://capittal.es/de-looper-a-capittal",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "De Looper a Capittal",
        url: "https://capittal.es/de-looper-a-capittal",
        description: "La evolución de Looper a Capittal como firma de M&A de referencia.",
      },
    ],
    content: `
      <h1>De Looper a Capittal</h1>
      <p>Capittal nace de la evolución natural de Looper, nuestra firma original de asesoramiento financiero. El cambio de marca refleja nuestro crecimiento, madurez y posicionamiento como firma de referencia en operaciones de M&A en España.</p>
      <h2>Nuestra Evolución</h2>
      <p>Desde nuestros inicios como Looper, hemos completado múltiples operaciones de compraventa de empresas, ampliado nuestro equipo y consolidado nuestra especialización sectorial en seguridad privada, tecnología e industria.</p>
    `,
  },

  "/lp/venta-empresas": {
    title: "¡Vende Tu Empresa Ahora! | Máximo Precio Garantizado | Capittal",
    description:
      "Vende tu empresa al máximo precio. Más de 200 operaciones exitosas. Consulta gratuita en 48h. Proceso 100% confidencial.",
    keywords:
      "vender empresa rápido, máximo precio empresa, valoración gratuita, venta empresa exitosa",
    canonical: "https://capittal.es/lp/venta-empresas",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Venta de Empresas - Capittal",
        provider: ORG_JSONLD,
        description: "Servicio de asesoramiento en venta de empresas. Máximo precio garantizado.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: ["Venta de empresas", "Mergers and Acquisitions Advisory"],
      },
    ],
    content: `
      <h1>¡Vende Tu Empresa al Máximo Precio!</h1>
      <p>En Capittal te ayudamos a vender tu empresa al mejor precio posible. Con más de 200 operaciones completadas con éxito, somos la firma de M&A de referencia en España.</p>
      <h2>¿Por qué elegir Capittal?</h2>
      <p>Consulta gratuita en 48 horas, proceso 100% confidencial, red de más de 500 compradores cualificados, equipo con experiencia en banca de inversión de primer nivel y resultados demostrables.</p>
      <h2>Proceso Sencillo</h2>
      <p>1. Valoración gratuita de su empresa. 2. Preparación del memorando informativo confidencial. 3. Contacto con compradores cualificados. 4. Negociación y cierre al mejor precio.</p>
    `,
  },

  // ─── LP CALCULADORAS ───
  "/lp/calculadora": {
    title: "Calculadora de Valoración de Empresas Gratuita | Capittal",
    ogImage: "https://capittal.es/og-calculadora.jpg",
    description:
      "Calcula el valor de tu empresa gratis con nuestra calculadora de valoración. Múltiplos sectoriales actualizados, resultado inmediato y confidencial.",
    keywords:
      "calculadora valoración empresas, valorar empresa gratis, cuánto vale mi empresa, calculadora EBITDA",
    canonical: "https://capittal.es/lp/calculadora",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Calculadora de Valoración de Empresas - Capittal",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        provider: ORG_JSONLD,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "¿Es gratuita la calculadora de valoración?", acceptedAnswer: { "@type": "Answer", text: "Sí, nuestra calculadora de valoración de empresas es completamente gratuita y sin compromiso. Puedes utilizarla tantas veces como necesites para obtener una estimación orientativa del valor de tu negocio." } },
          { "@type": "Question", name: "¿Qué métodos de valoración utilizáis?", acceptedAnswer: { "@type": "Answer", text: "Nuestra calculadora utiliza el método de múltiplos de EBITDA y de facturación, ajustados por sector, tamaño de empresa, márgenes operativos y tasa de crecimiento. Estos múltiplos se basan en transacciones reales del mercado español y europeo, actualizados periódicamente." } },
          { "@type": "Question", name: "¿Cuánto tarda una valoración profesional?", acceptedAnswer: { "@type": "Answer", text: "Una valoración profesional completa realizada por nuestro equipo de expertos en M&A suele tardar entre 2 y 4 semanas, dependiendo de la complejidad de la empresa y la disponibilidad de la documentación financiera." } },
          { "@type": "Question", name: "¿Los datos que introduzco son confidenciales?", acceptedAnswer: { "@type": "Answer", text: "Absolutamente. Todos los datos introducidos en la calculadora son tratados con total confidencialidad. No compartimos información con terceros y cumplimos con la normativa RGPD." } },
          { "@type": "Question", name: "¿Qué sectores cubre la calculadora?", acceptedAnswer: { "@type": "Answer", text: "La calculadora cubre más de 20 sectores, incluyendo tecnología, industrial, servicios profesionales, retail, hostelería, salud, educación, construcción, transporte y logística, alimentación, energía, y muchos más." } },
        ],
      },
    ],
    content: `
      <h1>Calculadora de Valoración de Empresas</h1>
      <p>Descubre cuánto vale tu empresa con nuestra herramienta gratuita. Diseñada para empresarios que consideran vender, inversores evaluando adquisiciones y emprendedores que quieren conocer el valor real de su negocio.</p>

      <h2>¿Cómo funciona nuestra calculadora de valoración?</h2>
      <p>Nuestra calculadora de valoración de empresas utiliza la metodología de múltiplos de EBITDA (beneficio antes de intereses, impuestos, depreciación y amortización), uno de los métodos más utilizados en el mundo de las fusiones y adquisiciones (M&A). Este enfoque permite obtener una estimación rápida y fundamentada del valor de un negocio, basándose en cómo el mercado valora empresas similares en el mismo sector.</p>
      <p>El proceso es sencillo: introduces los datos financieros básicos de tu empresa — facturación anual, EBITDA, sector de actividad y número de empleados — y la calculadora aplica los múltiplos sectoriales correspondientes. Estos múltiplos se extraen de bases de datos de transacciones reales del mercado español y europeo, y se actualizan periódicamente para reflejar las condiciones del mercado.</p>
      <p>Además del múltiplo sectorial base, la calculadora incorpora ajustes por tamaño de empresa, tasa de crecimiento y márgenes operativos. Una empresa con márgenes superiores a la media de su sector, o con un crecimiento sostenido, recibirá una valoración más alta que la media. Del mismo modo, empresas más pequeñas suelen tener un descuento por menor liquidez y mayor riesgo operativo.</p>
      <p>El resultado es un rango de valoración que refleja el intervalo en el que podría cerrarse una transacción real, no un número único. Esto te ofrece una perspectiva más realista del valor de mercado de tu empresa y te ayuda a tomar decisiones informadas antes de iniciar cualquier proceso de venta, inversión o reestructuración.</p>

      <h2>¿Cuándo necesitas valorar tu empresa?</h2>
      <p>Conocer el valor de tu empresa es fundamental en múltiples situaciones empresariales. No solo es necesario cuando planeas vender, sino en cualquier momento clave del ciclo de vida de tu negocio:</p>
      <ul>
        <li><strong>Venta de la empresa:</strong> conocer el valor de mercado es el primer paso para negociar con garantías y maximizar el precio de venta.</li>
        <li><strong>Entrada de un nuevo socio o inversor:</strong> una valoración objetiva determina el porcentaje de participación justo para ambas partes.</li>
        <li><strong>Herencia y sucesión:</strong> para planificar la transmisión generacional o calcular el impacto fiscal de una herencia empresarial.</li>
        <li><strong>Búsqueda de financiación:</strong> bancos e inversores necesitan una valoración actualizada para evaluar la solvencia y el potencial del negocio.</li>
        <li><strong>Planificación estratégica:</strong> monitorizar la evolución del valor de tu empresa año a año te permite medir el impacto de tus decisiones de gestión.</li>
      </ul>

      <h2>Valoración profesional vs. calculadora online</h2>
      <p>Nuestra calculadora online proporciona una estimación orientativa del valor de tu empresa basada en datos de mercado y múltiplos sectoriales. Es una excelente herramienta para obtener una primera aproximación rápida y gratuita, pero no sustituye a una valoración profesional completa.</p>
      <p>Una valoración profesional incluye un análisis detallado de los estados financieros, la posición competitiva, los activos tangibles e intangibles, la calidad del equipo directivo, los contratos recurrentes, y otros factores cualitativos que una calculadora automática no puede evaluar.</p>
      <p><a href="/contacto">Solicita una valoración profesional</a></p>

      <h2>Preguntas frecuentes</h2>
      <h3>¿Es gratuita la calculadora de valoración?</h3>
      <p>Sí, nuestra calculadora de valoración de empresas es completamente gratuita y sin compromiso. Puedes utilizarla tantas veces como necesites para obtener una estimación orientativa del valor de tu negocio.</p>
      <h3>¿Qué métodos de valoración utilizáis?</h3>
      <p>Nuestra calculadora utiliza el método de múltiplos de EBITDA y de facturación, ajustados por sector, tamaño de empresa, márgenes operativos y tasa de crecimiento. Estos múltiplos se basan en transacciones reales del mercado español y europeo, actualizados periódicamente.</p>
      <h3>¿Cuánto tarda una valoración profesional?</h3>
      <p>Una valoración profesional completa realizada por nuestro equipo de expertos en M&A suele tardar entre 2 y 4 semanas, dependiendo de la complejidad de la empresa y la disponibilidad de la documentación financiera.</p>
      <h3>¿Los datos que introduzco son confidenciales?</h3>
      <p>Absolutamente. Todos los datos introducidos en la calculadora son tratados con total confidencialidad. No compartimos información con terceros y cumplimos con la normativa RGPD.</p>
      <h3>¿Qué sectores cubre la calculadora?</h3>
      <p>La calculadora cubre más de 20 sectores, incluyendo tecnología, industrial, servicios profesionales, retail, hostelería, salud, educación, construcción, transporte y logística, alimentación, energía, y muchos más.</p>
    `,
  },

  "/lp/calculadora-fiscal": {
    title: "Calculadora de Impacto Fiscal en Venta de Empresas | Capittal",
    ogImage: "https://capittal.es/og-calculadora.jpg",
    description:
      "Calcula el impacto fiscal de la venta de tu empresa. Estima impuestos, plusvalías y opciones de optimización fiscal gratuita.",
    keywords:
      "calculadora fiscal venta empresa, impuestos venta empresa, plusvalía venta negocio, impacto fiscal M&A",
    canonical: "https://capittal.es/lp/calculadora-fiscal",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Calculadora de Impacto Fiscal en Venta de Empresas - Capittal",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        provider: ORG_JSONLD,
      },
    ],
    content: `
      <h1>Calculadora de Impacto Fiscal</h1>
      <p>Estima el impacto fiscal de la venta de tu empresa. Calcula impuestos sobre plusvalías, opciones de diferimiento y estrategias de optimización fiscal.</p>
      <h2>¿Cómo funciona?</h2>
      <p>Introduce los datos de la operación y obtén una estimación del impacto fiscal. Incluye recomendaciones de planificación fiscal personalizadas.</p>
    `,
  },

  "/valoracion-empresas": {
    title: "Valoración de Empresas en España: Guía Completa, Métodos y Calculadora Gratuita - Capittal",
    description: "Guía completa sobre valoración de empresas en España: métodos DCF, múltiplos EBITDA, comparables y patrimonial. Calculadora gratuita online. Asesoramiento profesional M&A.",
    keywords: "valoración de empresas, valorar empresa España, métodos valoración, DCF, múltiplos EBITDA, calculadora valoración empresas, valor empresa, Enterprise Value, M&A España",
    canonical: "https://capittal.es/valoracion-empresas",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Valoración de Empresas en España: Guía Completa, Métodos y Calculadora Gratuita",
        description: "Guía completa sobre valoración de empresas en España: métodos DCF, múltiplos EBITDA, comparables y patrimonial. Calculadora gratuita online.",
        url: "https://capittal.es/valoracion-empresas",
        isPartOf: { "@type": "WebSite", name: "Capittal", url: "https://capittal.es" },
      },
      buildFAQPageSchema([
        { question: "¿Es gratuita la calculadora de valoración?", answer: "Sí, nuestra calculadora de valoración de empresas es completamente gratuita y sin compromiso. Puedes utilizarla tantas veces como necesites para obtener una estimación orientativa del valor de tu negocio." },
        { question: "¿Qué métodos de valoración utilizáis?", answer: "Nuestra calculadora utiliza el método de múltiplos de EBITDA y de facturación, ajustados por sector, tamaño de empresa, márgenes operativos y tasa de crecimiento. Para valoraciones profesionales, combinamos DCF, múltiplos y comparables." },
        { question: "¿Cuánto tarda una valoración profesional?", answer: "Una valoración profesional completa suele tardar entre 2 y 4 semanas, dependiendo de la complejidad de la empresa y la disponibilidad de la documentación financiera." },
        { question: "¿Los datos que introduzco son confidenciales?", answer: "Absolutamente. Todos los datos son tratados con total confidencialidad y cumplimos con la normativa RGPD." },
        { question: "¿Qué sectores cubre la calculadora?", answer: "La calculadora cubre más de 20 sectores, incluyendo tecnología, industrial, servicios profesionales, retail, hostelería, salud, educación, construcción, transporte, alimentación, energía y muchos más." },
        { question: "¿Cómo se calcula el valor de una empresa en España?", answer: "El valor se calcula combinando varias metodologías: DCF, múltiplos de EBITDA sectoriales (entre 3x y 8x para PYMES en España), transacciones comparables y valoración patrimonial." },
        { question: "¿Cuánto vale una empresa que factura 1 millón de euros?", answer: "Depende del sector y la rentabilidad. Con un margen EBITDA del 20% (200.000€), podría valorarse entre 600.000€ y 1.600.000€ aplicando múltiplos de 3x a 8x EBITDA." },
        { question: "¿Qué múltiplo de EBITDA aplica a mi sector?", answer: "Varía por sector: tecnología/SaaS (8-15x), salud (7-10x), seguridad (6-9x), servicios profesionales (5-8x), industrial (4-7x), construcción (3-6x), hostelería (3-5x)." },
        { question: "¿Cuál es la diferencia entre Enterprise Value y valor de equity?", answer: "El Enterprise Value incluye el valor total del negocio (equity + deuda neta). El valor de equity es lo que recibe el vendedor tras descontar la deuda y sumar la caja excedente." },
        { question: "¿Es obligatorio valorar una empresa para venderla?", answer: "No es legalmente obligatorio, pero es altamente recomendable para negociar con datos objetivos y justificar el precio ante Hacienda." },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "Cómo valorar una empresa en España",
        description: "Proceso paso a paso para realizar una valoración empresarial profesional en España.",
        step: [
          { "@type": "HowToStep", position: 1, name: "Recopilación de información financiera", text: "Reunir estados financieros de los últimos 3-5 años, información sobre contratos, cartera de clientes y estructura de deuda." },
          { "@type": "HowToStep", position: 2, name: "Análisis del sector y mercado", text: "Estudiar tendencias de crecimiento, competencia, barreras de entrada y múltiplos de transacciones recientes del sector." },
          { "@type": "HowToStep", position: 3, name: "Aplicación de metodologías de valoración", text: "Aplicar al menos dos metodologías complementarias (DCF y múltiplos) para obtener un rango de valoración robusto." },
          { "@type": "HowToStep", position: 4, name: "Ajustes y normalización del EBITDA", text: "Normalizar el EBITDA eliminando partidas extraordinarias y gastos no recurrentes para reflejar la capacidad real de generación de beneficios." },
          { "@type": "HowToStep", position: 5, name: "Determinación del rango de valor", text: "Establecer un rango de valoración con escenarios conservador, base y optimista." },
          { "@type": "HowToStep", position: 6, name: "Elaboración del informe de valoración", text: "Documentar metodología, supuestos, datos de mercado y conclusiones en un informe profesional utilizable en negociaciones." },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Calculadora de Valoración de Empresas Gratuita - Capittal",
        description: "Herramienta online gratuita para calcular el valor de tu empresa usando múltiplos de EBITDA y facturación ajustados por sector.",
        url: "https://capittal.es/lp/calculadora",
        applicationCategory: "BusinessApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        provider: ORG_JSONLD,
        inLanguage: ["es", "ca", "en"],
        isAccessibleForFree: true,
      },
    ],
    content: `
      <h1>Valoración de Empresas en España: Guía Completa de Métodos, Herramientas y Asesoramiento Profesional</h1>
      <p>Conocer el valor real de tu empresa es una de las decisiones más importantes que puedes tomar como empresario. Ya sea que estés considerando vender tu negocio, buscar inversores, planificar una sucesión generacional o simplemente quieras entender tu posición competitiva en el mercado, una valoración empresarial rigurosa te proporciona la información necesaria para tomar decisiones con confianza.</p>
      <p>En España, el mercado de fusiones y adquisiciones (M&A) ha experimentado un crecimiento sostenido, con más de 2.800 operaciones anuales según TTR Data. Sin embargo, muchos empresarios desconocen el valor real de sus compañías o se basan en estimaciones subjetivas.</p>

      <h2>¿Por qué necesitas valorar tu empresa?</h2>
      <p>Existen múltiples situaciones: venta de la empresa, entrada o salida de socios, búsqueda de inversión, planificación fiscal y sucesoria, procesos judiciales o arbitrajes, y planificación estratégica.</p>

      <h2>Métodos de Valoración de Empresas</h2>
      <h3>Descuento de Flujos de Caja (DCF)</h3>
      <p>El método DCF estima el valor intrínseco proyectando flujos de caja libres futuros y descontándolos a valor presente mediante WACC. Es el método preferido por analistas y bancos de inversión. Adecuado para empresas con flujos predecibles.</p>
      <h3>Múltiplos de Mercado (EV/EBITDA, EV/Revenue)</h3>
      <p>Compara tu empresa con otras similares del sector usando ratios como EV/EBITDA. En España, los múltiplos para PYMES oscilan entre 3x y 8x. Empresas tecnológicas SaaS pueden alcanzar 10-15x EBITDA.</p>
      <h3>Valoración por Activos (Valor Patrimonial)</h3>
      <p>Calcula el valor neto de activos menos pasivos. Método más conservador, proporciona un suelo de valoración. Útil para inmobiliarias, holdings y empresas en liquidación.</p>
      <h3>Transacciones Comparables</h3>
      <p>Analiza precios pagados en transacciones reales de empresas similares. En Capittal mantenemos una base de datos propietaria de transacciones M&A en España.</p>

      <h2>Cómo valorar una empresa: proceso paso a paso</h2>
      <p>1. Recopilación de información financiera (estados financieros 3-5 años). 2. Análisis del sector y mercado. 3. Aplicación de metodologías de valoración. 4. Ajustes y normalización del EBITDA. 5. Determinación del rango de valor. 6. Elaboración del informe de valoración.</p>

      <h2>Factores clave que afectan la valoración</h2>
      <p>Crecimiento de ingresos, rentabilidad y márgenes, sector y posición competitiva, dependencia del fundador, diversificación de clientes, y recurrencia de ingresos.</p>

      <h2>Valoración online gratuita vs. profesional</h2>
      <p>La calculadora gratuita ofrece una estimación en 5 minutos basada en múltiplos sectoriales (precisión ±30%). La valoración profesional tarda 2-4 semanas, combina DCF+Múltiplos+Comparables, genera un informe certificado con validez fiscal/legal (precisión ±10%).</p>

      <h2>Calcula el valor de tu empresa gratis</h2>
      <p>Utiliza nuestra calculadora gratuita basada en múltiplos EBITDA y benchmarks sectoriales actualizados para el mercado español. Más de 20 sectores disponibles.</p>
      <p><a href="/lp/calculadora">Usar calculadora gratuita →</a></p>

      <h2>Preguntas frecuentes sobre valoración de empresas en España</h2>
      <h3>¿Cómo se calcula el valor de una empresa en España?</h3>
      <p>Combinando DCF, múltiplos EBITDA sectoriales (3x-8x para PYMES), transacciones comparables y valoración patrimonial.</p>
      <h3>¿Cuánto vale una empresa que factura 1 millón de euros?</h3>
      <p>Con un margen EBITDA del 20% (200.000€), entre 600.000€ y 1.600.000€ según el sector (múltiplos 3x-8x).</p>
      <h3>¿Qué múltiplo de EBITDA aplica a mi sector?</h3>
      <p>Tecnología/SaaS: 8-15x. Salud: 7-10x. Seguridad: 6-9x. Servicios profesionales: 5-8x. Industrial: 4-7x. Construcción: 3-6x.</p>
      <h3>¿Cuál es la diferencia entre Enterprise Value y valor de equity?</h3>
      <p>EV = equity + deuda neta. Equity = EV - deuda neta. El equity es lo que recibe el vendedor.</p>
      <h3>¿Es obligatorio valorar una empresa para venderla?</h3>
      <p>No es legalmente obligatorio, pero es altamente recomendable para negociar con datos objetivos y justificar el precio ante Hacienda.</p>

      <h2>¿Necesitas una valoración profesional?</h2>
      <p>Contacta con nuestro equipo de expertos en M&A. Más de 15 años de experiencia en valoraciones empresariales en España.</p>
      <p><a href="/contacto">Solicita una valoración profesional</a></p>
    `,
  },

  "/politica-privacidad": {
    title: "Política de Privacidad | Capittal",
    description:
      "Política de privacidad de Capittal. Información sobre el tratamiento de datos personales, derechos RGPD y protección de datos en operaciones de M&A.",
    keywords: "política privacidad, RGPD, protección datos, privacidad Capittal",
    canonical: "https://capittal.es/politica-privacidad",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Política de Privacidad - Capittal",
        url: "https://capittal.es/politica-privacidad",
        description: "Política de privacidad y protección de datos de Capittal.",
      },
    ],
    content: `
      <h1>Política de Privacidad</h1>
      <p>En Capittal nos comprometemos con la protección de sus datos personales conforme al Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos (LOPDGDD).</p>
      <h2>Responsable del Tratamiento</h2>
      <p>Capittal Transacciones S.L., con domicilio en Ausiàs March 36, Principal, 08010 Barcelona, España.</p>
      <h2>Derechos del Interesado</h2>
      <p>Puede ejercer sus derechos de acceso, rectificación, supresión, portabilidad, limitación y oposición al tratamiento de sus datos personales contactando con nosotros.</p>
    `,
  },

  "/terminos-uso": {
    title: "Términos de Uso | Capittal",
    description:
      "Términos y condiciones de uso del sitio web de Capittal. Condiciones legales, limitaciones de responsabilidad y uso aceptable.",
    keywords: "términos uso, condiciones legales, aviso legal, Capittal",
    canonical: "https://capittal.es/terminos-uso",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Términos de Uso - Capittal",
        url: "https://capittal.es/terminos-uso",
        description: "Términos y condiciones de uso del sitio web de Capittal.",
      },
    ],
    content: `
      <h1>Términos de Uso</h1>
      <p>El presente documento establece las condiciones de uso del sitio web capittal.es, propiedad de Capittal Transacciones S.L.</p>
      <h2>Uso del Sitio Web</h2>
      <p>El acceso y uso de este sitio web implica la aceptación de estos términos y condiciones. El contenido del sitio web tiene carácter informativo y no constituye asesoramiento financiero, fiscal o legal vinculante.</p>
      <h2>Propiedad Intelectual</h2>
      <p>Todos los contenidos, diseños, textos, gráficos, logos y software de este sitio web son propiedad de Capittal Transacciones S.L. y están protegidos por las leyes de propiedad intelectual.</p>
    `,
  },

  "/cookies": {
    title: "Política de Cookies | Capittal",
    description:
      "Política de cookies de Capittal. Información sobre las cookies utilizadas, tipos, finalidades y cómo gestionarlas.",
    keywords: "política cookies, cookies, gestión cookies, Capittal",
    canonical: "https://capittal.es/cookies",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Política de Cookies - Capittal",
        url: "https://capittal.es/cookies",
        description: "Política de cookies del sitio web de Capittal.",
      },
    ],
    content: `
      <h1>Política de Cookies</h1>
      <p>Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de navegación, analizar el tráfico y personalizar el contenido.</p>
    `,
  },

  // ─── HOMEPAGE MULTILINGUAL ───
  "/en": {
    title: "Capittal - Mergers & Acquisitions Advisory in Spain",
    description: "M&A advisory firm based in Barcelona. 70+ professionals specializing in company sales, business valuations and due diligence across Spain.",
    keywords: "M&A Spain, mergers acquisitions, business valuation, due diligence, sell company Spain",
    canonical: "https://capittal.es/en",
    ogType: "website",
    hreflang: { es: "https://capittal.es/", ca: "https://capittal.es/ca", en: "https://capittal.es/en", "x-default": "https://capittal.es/" },
    structuredData: [{ "@context": "https://schema.org", "@type": "WebSite", name: "Capittal", url: "https://capittal.es/en", description: "M&A advisory firm based in Barcelona.", publisher: ORG_JSONLD }],
    content: `<h1>Mergers & Acquisitions Specialists in Spain</h1><p>Capittal is a leading M&A advisory firm based in Barcelona, specializing in company sales, valuations, and due diligence across Spain and Europe.</p>`,
  },
  "/ca": {
    title: "Capittal Transaccions - Fusions i Adquisicions a Espanya",
    description: "Firma d'assessorament en fusions i adquisicions (M&A) a Barcelona. +70 professionals especialitzats en venda d'empreses, valoracions i due diligence a Espanya.",
    keywords: "M&A Espanya, fusions adquisicions, valoració empreses, due diligence, compravenda empreses",
    canonical: "https://capittal.es/ca",
    ogType: "website",
    hreflang: { es: "https://capittal.es/", ca: "https://capittal.es/ca", en: "https://capittal.es/en", "x-default": "https://capittal.es/" },
    structuredData: [{ "@context": "https://schema.org", "@type": "WebSite", name: "Capittal", url: "https://capittal.es/ca", description: "Firma d'assessorament en fusions i adquisicions a Barcelona.", publisher: ORG_JSONLD }],
    content: `<h1>Especialistes en Fusions i Adquisicions a Espanya</h1><p>Capittal és una firma d'assessorament financer especialitzada en operacions de M&A, valoracions empresarials, due diligence i planificació fiscal amb seu a Barcelona.</p>`,
  },

  // ─── RECURSOS ───
  "/recursos/noticias": {
    title: "Noticias M&A España | Capittal",
    description: "Últimas noticias sobre fusiones y adquisiciones en España. Operaciones cerradas, tendencias del mercado M&A y movimientos corporativos relevantes.",
    keywords: "noticias M&A, fusiones adquisiciones España, operaciones M&A, mercado corporativo",
    canonical: "https://capittal.es/recursos/noticias",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Noticias M&A España", url: "https://capittal.es/recursos/noticias", description: "Últimas noticias sobre fusiones y adquisiciones en España.", publisher: ORG_JSONLD }],
    content: `<h1>Noticias M&A España</h1><p>Últimas noticias sobre fusiones y adquisiciones en España. Operaciones cerradas, tendencias del mercado y movimientos corporativos.</p>`,
  },
  "/recursos/case-studies": {
    title: "Casos de Estudio M&A | Capittal",
    description: "Análisis detallado de operaciones de fusiones y adquisiciones realizadas por Capittal. Casos de éxito reales con datos y resultados verificables.",
    keywords: "casos estudio M&A, análisis operaciones, case studies fusiones",
    canonical: "https://capittal.es/recursos/case-studies",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Casos de Estudio M&A", url: "https://capittal.es/recursos/case-studies", description: "Análisis detallado de operaciones de M&A.", publisher: ORG_JSONLD }],
    content: `<h1>Casos de Estudio M&A</h1><p>Análisis detallado de operaciones de fusiones y adquisiciones realizadas por Capittal.</p>`,
  },
  "/recursos/newsletter": {
    title: "Newsletter M&A | Capittal Transacciones",
    description: "Suscríbete a la newsletter de Capittal. Recibe análisis de mercado M&A, oportunidades de inversión y tendencias del sector.",
    keywords: "newsletter M&A, suscripción Capittal, análisis mercado",
    canonical: "https://capittal.es/recursos/newsletter",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Newsletter M&A - Capittal", url: "https://capittal.es/recursos/newsletter" }],
    content: `<h1>Newsletter M&A</h1><p>Suscríbete a la newsletter de Capittal y recibe análisis de mercado, oportunidades de inversión y tendencias del sector M&A.</p>`,
  },
  "/recursos/webinars": {
    title: "Webinars M&A | Capittal Transacciones",
    description: "Webinars sobre fusiones y adquisiciones, valoración de empresas y tendencias M&A. Formación gratuita por expertos de Capittal.",
    keywords: "webinars M&A, formación fusiones adquisiciones, eventos Capittal",
    canonical: "https://capittal.es/recursos/webinars",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Webinars M&A - Capittal", url: "https://capittal.es/recursos/webinars" }],
    content: `<h1>Webinars M&A</h1><p>Webinars sobre fusiones y adquisiciones, valoración de empresas y tendencias M&A impartidos por expertos de Capittal.</p>`,
  },

  // ─── OPORTUNIDADES ───
  "/oportunidades": {
    title: "Oportunidades de Inversión | Empresas en Venta | Capittal",
    description: "Explore oportunidades de inversión y empresas en venta. Marketplace de operaciones M&A verificadas por Capittal.",
    keywords: "oportunidades inversión, empresas en venta, marketplace M&A, comprar empresa",
    canonical: "https://capittal.es/oportunidades",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Oportunidades de Inversión", url: "https://capittal.es/oportunidades", description: "Marketplace de operaciones M&A verificadas." }],
    content: `<h1>Oportunidades de Inversión</h1><p>Explore oportunidades de inversión y empresas en venta verificadas por Capittal.</p>`,
  },
  "/oportunidades/empleo": {
    title: "Empleo en M&A - Trabaja en Capittal",
    description: "Únete al equipo de Capittal Transacciones. Ofertas de empleo en fusiones y adquisiciones, valoraciones y asesoramiento financiero en Barcelona.",
    keywords: "empleo M&A, trabajo Capittal, ofertas asesoría financiera Barcelona",
    canonical: "https://capittal.es/oportunidades/empleo",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Empleo en M&A - Capittal", url: "https://capittal.es/oportunidades/empleo" }],
    content: `<h1>Trabaja en Capittal</h1><p>Únete al equipo de Capittal. Ofertas de empleo en M&A, valoraciones y asesoramiento financiero en Barcelona.</p>`,
  },

  // ─── SEARCH FUNDS ───
  "/search-funds": {
    title: "Search Funds - Asesoramiento Especializado | Capittal",
    description: "Asesoramiento integral para Search Funds en España. Desde la captación de capital hasta la adquisición y gestión de la empresa objetivo.",
    keywords: "search funds España, asesoramiento search fund, adquisición empresarial",
    canonical: "https://capittal.es/search-funds",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "Service", name: "Asesoramiento Search Funds", provider: ORG_JSONLD, areaServed: { "@type": "Country", name: "España" }, serviceType: ["Search Funds", "Mergers and Acquisitions Advisory"] }],
    content: `<h1>Search Funds</h1><p>Asesoramiento integral para Search Funds en España. Desde la captación de capital hasta la adquisición y gestión de la empresa objetivo.</p>`,
  },
  "/search-funds/recursos": {
    title: "Centro de Recursos Search Funds | Capittal",
    description: "Guías, herramientas y casos de éxito sobre Search Funds en España. Todo lo que necesitas para lanzar o invertir en un Search Fund.",
    keywords: "recursos search funds, guía search fund, herramientas searcher",
    canonical: "https://capittal.es/search-funds/recursos",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Centro de Recursos Search Funds", url: "https://capittal.es/search-funds/recursos", description: "Guías, herramientas y casos de éxito sobre Search Funds en España.", publisher: ORG_JSONLD }],
    content: `<h1>Centro de Recursos Search Funds</h1><p>Guías, herramientas y casos de éxito para lanzar o invertir en un Search Fund en España.</p>`,
  },
  "/search-funds/recursos/guia": {
    title: "Guía Completa de Search Funds | Capittal",
    description: "Guía completa sobre el modelo Search Fund en España. Desde la captación de capital hasta la adquisición y operación de la empresa objetivo.",
    keywords: "guía search funds, modelo search fund, captación capital",
    canonical: "https://capittal.es/search-funds/recursos/guia",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Guía Completa de Search Funds", url: "https://capittal.es/search-funds/recursos/guia" }],
    content: `<h1>Guía Completa de Search Funds</h1><p>Todo lo que necesitas saber sobre el modelo Search Fund: captación de capital, búsqueda, adquisición y operación.</p>`,
  },
  "/search-funds/recursos/glosario": {
    title: "Glosario de Search Funds | Capittal",
    description: "Diccionario con todos los términos clave del ecosistema Search Fund. Definiciones claras de conceptos financieros, legales y operativos.",
    keywords: "glosario search funds, terminología search fund, diccionario M&A",
    canonical: "https://capittal.es/search-funds/recursos/glosario",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Glosario de Search Funds", url: "https://capittal.es/search-funds/recursos/glosario" }],
    content: `<h1>Glosario de Search Funds</h1><p>Diccionario con todos los términos clave del ecosistema Search Fund.</p>`,
  },
  "/search-funds/recursos/herramientas": {
    title: "Herramientas para Search Funds | Capittal",
    description: "Plantillas, modelos financieros y herramientas prácticas para searchers. Recursos descargables para cada fase del proceso.",
    keywords: "herramientas search funds, plantillas searcher, modelos financieros",
    canonical: "https://capittal.es/search-funds/recursos/herramientas",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Herramientas para Search Funds", url: "https://capittal.es/search-funds/recursos/herramientas" }],
    content: `<h1>Herramientas para Search Funds</h1><p>Plantillas, modelos financieros y herramientas prácticas para searchers.</p>`,
  },
  "/search-funds/recursos/casos": {
    title: "Casos de Éxito Search Funds | Capittal",
    description: "Historias reales de Search Funds exitosos en España y Europa. Análisis de adquisiciones, crecimiento post-compra y retornos.",
    keywords: "casos éxito search funds, search fund exitoso, retornos inversores",
    canonical: "https://capittal.es/search-funds/recursos/casos",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Casos de Éxito Search Funds", url: "https://capittal.es/search-funds/recursos/casos" }],
    content: `<h1>Casos de Éxito Search Funds</h1><p>Historias reales de Search Funds exitosos en España y Europa.</p>`,
  },
  "/search-funds/recursos/biblioteca": {
    title: "Biblioteca Search Funds | Capittal",
    description: "Colección de libros, papers académicos y artículos esenciales sobre Search Funds.",
    keywords: "biblioteca search funds, libros search fund, papers académicos",
    canonical: "https://capittal.es/search-funds/recursos/biblioteca",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Biblioteca Search Funds", url: "https://capittal.es/search-funds/recursos/biblioteca" }],
    content: `<h1>Biblioteca Search Funds</h1><p>Colección de libros, papers académicos y artículos esenciales sobre Search Funds.</p>`,
  },
  "/search-funds/recursos/comunidad": {
    title: "Comunidad Search Funds España | Capittal",
    description: "Conecta con la comunidad de Search Funds en España. Red de searchers, inversores y asesores especializados.",
    keywords: "comunidad search funds, red searchers España, inversores search fund",
    canonical: "https://capittal.es/search-funds/recursos/comunidad",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Comunidad Search Funds España", url: "https://capittal.es/search-funds/recursos/comunidad" }],
    content: `<h1>Comunidad Search Funds España</h1><p>Conecta con la comunidad de Search Funds en España. Red de searchers, inversores y asesores.</p>`,
  },
  "/search-funds/recursos/sourcing": {
    title: "Sourcing de Empresas para Search Funds | Capittal",
    description: "Estrategias y técnicas de sourcing para identificar empresas objetivo en un Search Fund.",
    keywords: "sourcing search funds, búsqueda empresas, identificación targets",
    canonical: "https://capittal.es/search-funds/recursos/sourcing",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Sourcing para Search Funds", url: "https://capittal.es/search-funds/recursos/sourcing" }],
    content: `<h1>Sourcing de Empresas para Search Funds</h1><p>Estrategias y técnicas de sourcing para identificar empresas objetivo.</p>`,
  },
  "/search-funds/recursos/valoracion": {
    title: "Valoración en Search Funds | Capittal",
    description: "Metodologías de valoración específicas para operaciones de Search Fund. Múltiplos, DCF y criterios de precio.",
    keywords: "valoración search funds, múltiplos search fund, precio adquisición",
    canonical: "https://capittal.es/search-funds/recursos/valoracion",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Valoración en Search Funds", url: "https://capittal.es/search-funds/recursos/valoracion" }],
    content: `<h1>Valoración en Search Funds</h1><p>Metodologías de valoración específicas para operaciones de Search Fund.</p>`,
  },
  "/search-funds/recursos/negociacion": {
    title: "Negociación en Search Funds | Capittal",
    description: "Guía de negociación para searchers. Tácticas, estructura de deals y claves para cerrar la adquisición.",
    keywords: "negociación search funds, tácticas negociación, cierre adquisición",
    canonical: "https://capittal.es/search-funds/recursos/negociacion",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Negociación en Search Funds", url: "https://capittal.es/search-funds/recursos/negociacion" }],
    content: `<h1>Negociación en Search Funds</h1><p>Guía de negociación para searchers: tácticas, estructura de deals y claves para cerrar.</p>`,
  },
  "/search-funds/recursos/post-adquisicion": {
    title: "Post-Adquisición en Search Funds | Capittal",
    description: "Estrategias de creación de valor post-adquisición en Search Funds. Gestión del cambio y mejora operativa.",
    keywords: "post-adquisición search funds, creación valor, mejora operativa",
    canonical: "https://capittal.es/search-funds/recursos/post-adquisicion",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Post-Adquisición en Search Funds", url: "https://capittal.es/search-funds/recursos/post-adquisicion" }],
    content: `<h1>Post-Adquisición en Search Funds</h1><p>Estrategias de creación de valor post-adquisición: gestión del cambio y mejora operativa.</p>`,
  },
  "/search-funds/registro-searcher": {
    title: "Registro de Searcher - Search Funds | Capittal",
    description: "Regístrate como searcher en Capittal. Accede a oportunidades de inversión, herramientas y apoyo en tu proceso de Search Fund.",
    keywords: "registro searcher, alta search fund, búsqueda empresa",
    canonical: "https://capittal.es/search-funds/registro-searcher",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Registro de Searcher", url: "https://capittal.es/search-funds/registro-searcher" }],
    content: `<h1>Registro de Searcher</h1><p>Regístrate como searcher en Capittal y accede a oportunidades, herramientas y apoyo.</p>`,
  },

  // ─── SERVICIOS ADICIONALES ───
  "/servicios/search-funds": {
    title: "Search Funds | Asesoramiento Especializado | Capittal",
    description: "Asesoramiento integral para Search Funds. Desde la captación de capital hasta la adquisición y gestión de la empresa objetivo.",
    keywords: "search funds, asesoramiento search fund, adquisición empresarial",
    canonical: "https://capittal.es/servicios/search-funds",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "Service", name: "Asesoramiento Search Funds", provider: ORG_JSONLD, areaServed: { "@type": "Country", name: "España" }, serviceType: ["Search Funds"] }],
    content: `<h1>Asesoramiento en Search Funds</h1><p>Asesoramiento integral para Search Funds: captación de capital, búsqueda de targets, valoración, negociación y cierre.</p>`,
  },
  "/servicios/asesoramiento-legal/tecnico": {
    title: "Asesoramiento Legal Técnico en M&A | Capittal",
    description: "Soporte jurídico técnico especializado en operaciones de M&A. Análisis contractual, cumplimiento normativo y cierre de transacciones.",
    keywords: "asesoramiento legal técnico, M&A legal, contratos compraventa",
    canonical: "https://capittal.es/servicios/asesoramiento-legal/tecnico",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "Service", name: "Asesoramiento Legal Técnico M&A", provider: ORG_JSONLD, serviceType: ["Asesoramiento legal técnico"] }],
    content: `<h1>Asesoramiento Legal Técnico en M&A</h1><p>Soporte jurídico técnico especializado en operaciones de M&A complejas.</p>`,
  },

  // ─── POR QUÉ ELEGIRNOS SUBPAGES ───
  "/por-que-elegirnos": {
    title: "Por Qué Elegirnos | Capittal Transacciones",
    description: "Experiencia, metodología y resultados. Descubra por qué Capittal es su mejor socio en operaciones de M&A.",
    keywords: "por qué Capittal, ventajas M&A, experiencia fusiones adquisiciones",
    canonical: "https://capittal.es/por-que-elegirnos",
    ogType: "website",
    hreflang: { es: "https://capittal.es/por-que-elegirnos", ca: "https://capittal.es/per-que-triar-nos", en: "https://capittal.es/why-choose-us", "x-default": "https://capittal.es/por-que-elegirnos" },
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Por Qué Elegirnos - Capittal", url: "https://capittal.es/por-que-elegirnos" }],
    content: `<h1>Por Qué Elegirnos</h1><p>Experiencia, metodología y resultados en operaciones de M&A en España.</p>`,
  },
  "/por-que-elegirnos/experiencia": {
    title: "Nuestra Experiencia en M&A | Capittal",
    description: "Más de una década de experiencia en fusiones y adquisiciones en España. Track record de operaciones cerradas en múltiples sectores.",
    keywords: "experiencia M&A, track record Capittal, operaciones cerradas",
    canonical: "https://capittal.es/por-que-elegirnos/experiencia",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Nuestra Experiencia en M&A", url: "https://capittal.es/por-que-elegirnos/experiencia" }],
    content: `<h1>Nuestra Experiencia en M&A</h1><p>Más de una década asesorando en fusiones y adquisiciones en España.</p>`,
  },
  "/por-que-elegirnos/metodologia": {
    title: "Metodología de Trabajo M&A | Capittal",
    description: "Metodología probada en operaciones de M&A. Proceso estructurado desde la valoración hasta el cierre.",
    keywords: "metodología M&A, proceso venta empresa, estructura operación",
    canonical: "https://capittal.es/por-que-elegirnos/metodologia",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Metodología de Trabajo M&A", url: "https://capittal.es/por-que-elegirnos/metodologia" }],
    content: `<h1>Metodología de Trabajo M&A</h1><p>Proceso estructurado desde la valoración inicial hasta el cierre de la transacción.</p>`,
  },
  "/por-que-elegirnos/resultados": {
    title: "Resultados en Operaciones M&A | Capittal",
    description: "Resultados verificables en operaciones de fusiones y adquisiciones. Métricas de éxito y satisfacción.",
    keywords: "resultados M&A, métricas éxito, operaciones completadas",
    canonical: "https://capittal.es/por-que-elegirnos/resultados",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Resultados en Operaciones M&A", url: "https://capittal.es/por-que-elegirnos/resultados" }],
    content: `<h1>Resultados en Operaciones M&A</h1><p>Resultados verificables en operaciones de fusiones y adquisiciones.</p>`,
  },

  // ─── LP ADICIONALES ───
  "/lp/calculadora-b": {
    title: "Calculadora de Valoración B - Capittal",
    description: "Calcula el valor de tu empresa con nuestra calculadora alternativa. Estimación rápida basada en facturación, EBITDA y sector.",
    keywords: "calculadora valoración, cuanto vale mi empresa, valoración empresas gratis",
    canonical: "https://capittal.es/lp/calculadora-b",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebApplication", name: "Calculadora de Valoración B", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, provider: ORG_JSONLD }],
    content: `<h1>Calculadora de Valoración de Empresas</h1><p>Calcula el valor de tu empresa en minutos. Resultado orientativo gratuito.</p>`,
  },
  "/lp/calculadora-meta": {
    title: "Calculadora de Valoración de Empresas | Capittal",
    description: "Descubre cuánto vale tu empresa con nuestra calculadora gratuita. Valoración orientativa basada en múltiplos sectoriales.",
    keywords: "calculadora valoración, cuanto vale mi empresa, valoración EBITDA",
    canonical: "https://capittal.es/lp/calculadora-meta",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebApplication", name: "Calculadora de Valoración", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, provider: ORG_JSONLD }],
    content: `<h1>Calculadora de Valoración de Empresas</h1><p>Descubre cuánto vale tu empresa con nuestra calculadora gratuita.</p>`,
  },
  "/lp/venta-empresas-v2": {
    title: "Vender Tu Empresa al Mejor Precio | Capittal",
    description: "Maximiza el precio de venta de tu empresa con asesoramiento profesional. Acceso a compradores cualificados.",
    keywords: "vender empresa, mejor precio, compradores cualificados",
    canonical: "https://capittal.es/lp/venta-empresas-v2",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "Service", name: "Venta de Empresas", provider: ORG_JSONLD, serviceType: ["Venta de empresas"] }],
    content: `<h1>Vende Tu Empresa al Mejor Precio</h1><p>Maximiza el precio de venta con asesoramiento profesional y acceso a compradores cualificados.</p>`,
  },
  "/lp/suiteloop": {
    title: "SuiteLoop - Software M&A para Asesorías | Capittal",
    description: "SuiteLoop: plataforma tecnológica para gestionar operaciones de M&A. Herramientas de valoración, CRM de deals y gestión documental.",
    keywords: "SuiteLoop, software M&A, plataforma asesorías, CRM deals",
    canonical: "https://capittal.es/lp/suiteloop",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "SuiteLoop", applicationCategory: "BusinessApplication", operatingSystem: "Web", provider: ORG_JSONLD }],
    content: `<h1>SuiteLoop - Software M&A para Asesorías</h1><p>Plataforma tecnológica para gestionar operaciones de M&A: valoración, CRM de deals y gestión documental.</p>`,
  },
  "/lp/accountex": {
    title: "Capittal en Accountex Madrid 2025",
    description: "Visítanos en Accountex Madrid 2025. Capittal presenta servicios de M&A y herramientas de valoración para asesorías.",
    keywords: "Accountex Madrid, feria asesorías, Capittal stand",
    canonical: "https://capittal.es/lp/accountex",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "Event", name: "Capittal en Accountex Madrid 2025", location: { "@type": "Place", name: "IFEMA Madrid" }, organizer: ORG_JSONLD }],
    content: `<h1>Capittal en Accountex Madrid 2025</h1><p>Visítanos en Accountex Madrid. Presentamos servicios de M&A y herramientas de valoración.</p>`,
  },
  "/lp/valoracion-2026": {
    title: "Valoración de Tu Empresa - Cierre de Año | Capittal",
    description: "Conoce el valor de tu empresa antes del cierre de año. Valoración profesional gratuita con múltiplos actualizados.",
    keywords: "valoración cierre año, cuanto vale mi empresa 2026",
    canonical: "https://capittal.es/lp/valoracion-2026",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Valoración Cierre de Año", url: "https://capittal.es/lp/valoracion-2026" }],
    content: `<h1>Valoración de Tu Empresa - Cierre de Año</h1><p>Conoce el valor de tu empresa antes del cierre de año con múltiplos actualizados.</p>`,
  },
  "/lp/compra-empresas-meta": {
    title: "Compra de Empresas - Oportunidades de Inversión | Capittal",
    description: "Encuentra empresas en venta en España. Oportunidades de inversión verificadas en múltiples sectores.",
    keywords: "compra empresas, oportunidades inversión, empresas en venta España",
    canonical: "https://capittal.es/lp/compra-empresas-meta",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Compra de Empresas", url: "https://capittal.es/lp/compra-empresas-meta" }],
    content: `<h1>Compra de Empresas</h1><p>Encuentra empresas en venta en España. Oportunidades de inversión verificadas.</p>`,
  },
  "/lp/rod-linkedin": {
    title: "Descarga el ROD - Resumen de Operación | Capittal",
    description: "Descarga gratis el modelo de Resumen de Operación Detallado (ROD) de Capittal.",
    keywords: "ROD, resumen operación, plantilla M&A, documento inversión",
    canonical: "https://capittal.es/lp/rod-linkedin",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Descarga ROD", url: "https://capittal.es/lp/rod-linkedin" }],
    content: `<h1>Descarga el ROD</h1><p>Descarga gratis el modelo de Resumen de Operación Detallado (ROD) de Capittal.</p>`,
  },
  "/lp/open-deals": {
    title: "Open Deals - Empresas en Venta | Capittal",
    description: "Marketplace de empresas en venta gestionado por Capittal. Oportunidades de inversión verificadas.",
    keywords: "open deals, empresas en venta, marketplace M&A",
    canonical: "https://capittal.es/lp/open-deals",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Open Deals", url: "https://capittal.es/lp/open-deals" }],
    content: `<h1>Open Deals - Empresas en Venta</h1><p>Marketplace de empresas en venta gestionado por Capittal.</p>`,
  },
  "/lp/oportunidades-meta": {
    title: "Oportunidades de Inversión - Empresas en Venta | Capittal",
    description: "Explora oportunidades de inversión en empresas españolas. Operaciones verificadas por Capittal.",
    keywords: "oportunidades inversión, empresas venta España, inversión verificada",
    canonical: "https://capittal.es/lp/oportunidades-meta",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebPage", name: "Oportunidades de Inversión", url: "https://capittal.es/lp/oportunidades-meta" }],
    content: `<h1>Oportunidades de Inversión</h1><p>Explora oportunidades de inversión en empresas españolas verificadas por Capittal.</p>`,
  },
  "/lp/simulador-seguridad": {
    title: "Simulador de Valoración - Seguridad Privada | Capittal",
    description: "Simulador especializado para valorar empresas de seguridad privada. Múltiplos específicos de CRAs, vigilancia y servicios auxiliares.",
    keywords: "simulador valoración seguridad, valorar empresa seguridad, múltiplos CRA",
    canonical: "https://capittal.es/lp/simulador-seguridad",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebApplication", name: "Simulador Valoración Seguridad", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, provider: ORG_JSONLD }],
    content: `<h1>Simulador de Valoración - Seguridad Privada</h1><p>Simulador especializado para valorar empresas de seguridad privada.</p>`,
  },
  "/seguridad/calculadora": {
    title: "Calculadora de Valoración - Empresas de Seguridad | Capittal",
    description: "Calcula el valor de tu empresa de seguridad privada. Múltiplos especializados para CRAs, alarmas, vigilancia y servicios auxiliares.",
    keywords: "calculadora valoración seguridad, valor empresa seguridad, múltiplos alarmas",
    canonical: "https://capittal.es/seguridad/calculadora",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebApplication", name: "Calculadora Valoración Seguridad", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, provider: ORG_JSONLD }],
    content: `<h1>Calculadora de Valoración - Seguridad</h1><p>Calcula el valor de tu empresa de seguridad privada con múltiplos especializados.</p>`,
  },

  // ─── SECTORES FALTANTES ───
  "/sectores/construccion": {
    title: "M&A Sector Construcción | Capittal",
    description: "Operaciones de M&A en construcción e infraestructuras. Promotoras, constructoras e ingeniería civil.",
    keywords: "M&A construcción, venta constructora, fusiones infraestructuras",
    canonical: "https://capittal.es/sectores/construccion",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "Service", name: "M&A Sector Construcción", provider: ORG_JSONLD, areaServed: { "@type": "Country", name: "España" }, serviceType: ["M&A sector construcción"] }],
    content: `<h1>M&A Sector Construcción</h1><p>Operaciones de M&A en construcción e infraestructuras en España.</p>`,
  },
  "/sectores/logistica": {
    title: "M&A Sector Logística | Capittal",
    description: "Fusiones y adquisiciones en logística y transporte. Distribución, almacenaje y cadena de suministro.",
    keywords: "M&A logística, venta empresa transporte, fusiones distribución",
    canonical: "https://capittal.es/sectores/logistica",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "Service", name: "M&A Sector Logística", provider: ORG_JSONLD, areaServed: { "@type": "Country", name: "España" }, serviceType: ["M&A sector logística"] }],
    content: `<h1>M&A Sector Logística</h1><p>Fusiones y adquisiciones en logística y transporte en España.</p>`,
  },
  "/sectores/medio-ambiente": {
    title: "M&A Sector Medio Ambiente | Capittal",
    description: "Operaciones de M&A en medio ambiente. Gestión de residuos, tratamiento de aguas y sostenibilidad.",
    keywords: "M&A medio ambiente, venta empresa residuos, fusiones sostenibilidad",
    canonical: "https://capittal.es/sectores/medio-ambiente",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "Service", name: "M&A Sector Medio Ambiente", provider: ORG_JSONLD, areaServed: { "@type": "Country", name: "España" }, serviceType: ["M&A sector medio ambiente"] }],
    content: `<h1>M&A Sector Medio Ambiente</h1><p>Operaciones de M&A en medio ambiente, gestión de residuos y sostenibilidad.</p>`,
  },
  "/sectores/alimentacion": {
    title: "M&A Sector Alimentación | Capittal",
    description: "Operaciones de M&A en el sector alimentario. Producción, distribución y marcas de alimentación.",
    keywords: "M&A alimentación, venta empresa alimentaria, fusiones distribución alimentos",
    canonical: "https://capittal.es/sectores/alimentacion",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "Service", name: "M&A Sector Alimentación", provider: ORG_JSONLD, areaServed: { "@type": "Country", name: "España" }, serviceType: ["M&A sector alimentación"] }],
    content: `<h1>M&A Sector Alimentación</h1><p>Operaciones de M&A en el sector alimentario en España.</p>`,
  },

  // ─── LP CALCULADORA ASESORES ───
  "/lp/calculadora-asesores": {
    title: "Calculadora de Valoración para Asesores | Capittal",
    description: "Herramienta profesional de valoración para asesores financieros. Múltiplos sectoriales y metodologías avanzadas.",
    keywords: "calculadora asesores, valoración profesional, herramienta asesores financieros",
    canonical: "https://capittal.es/lp/calculadora-asesores",
    ogType: "website",
    structuredData: [{ "@context": "https://schema.org", "@type": "WebApplication", name: "Calculadora para Asesores", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, provider: ORG_JSONLD }],
    content: `<h1>Calculadora de Valoración para Asesores</h1><p>Herramienta profesional de valoración con múltiplos sectoriales y metodologías avanzadas.</p>`,
  },
};

// ─── Multilingual aliases (point to same PageData as the Spanish canonical) ───
const PATH_ALIASES: Record<string, string> = {
  // ─── Main pages multilingual ───
  "/team": "/equipo",
  "/equip": "/equipo",
  "/buy-companies": "/compra-empresas",
  "/compra-empreses": "/compra-empresas",
  "/sell-companies": "/venta-empresas",
  "/venda-empreses": "/venta-empresas",
  "/why-choose-us": "/por-que-elegirnos",
  "/per-que-triar-nos": "/por-que-elegirnos",
  "/success-stories": "/casos-exito",
  "/casos-exit": "/casos-exito",
  "/contact": "/contacto",
  "/contacte": "/contacto",
  "/collaborators-program": "/programa-colaboradores",
  "/partners-program": "/programa-colaboradores",
  // ─── Catalan service routes ───
  "/serveis/valoracions": "/servicios/valoraciones",
  "/serveis/venda-empreses": "/servicios/venta-empresas",
  "/serveis/due-diligence": "/servicios/due-diligence",
  "/serveis/assessorament-legal": "/servicios/asesoramiento-legal",
  "/serveis/reestructuracions": "/servicios/reestructuraciones",
  "/serveis/planificacio-fiscal": "/servicios/planificacion-fiscal",
  // ─── English service routes ───
  "/services/valuations": "/servicios/valoraciones",
  "/services/sell-companies": "/servicios/venta-empresas",
  "/services/due-diligence": "/servicios/due-diligence",
  "/services/legal-advisory": "/servicios/asesoramiento-legal",
  "/services/restructuring": "/servicios/reestructuraciones",
  "/services/tax-planning": "/servicios/planificacion-fiscal",
  // ─── Catalan sector routes ───
  "/sectors/tecnologia": "/sectores/tecnologia",
  "/sectors/salut": "/sectores/healthcare",
  "/sectors/industrial": "/sectores/industrial",
  "/sectors/retail-consum": "/sectores/retail-consumer",
  "/sectors/energia": "/sectores/energia",
  "/sectors/seguretat": "/sectores/seguridad",
  "/sectors/construccio": "/sectores/construccion",
  "/sectors/alimentacio": "/sectores/alimentacion",
  "/sectors/logistica": "/sectores/logistica",
  "/sectors/medi-ambient": "/sectores/medio-ambiente",
  // ─── English sector routes ───
  "/sectors/technology": "/sectores/tecnologia",
  "/sectors/healthcare": "/sectores/healthcare",
  "/sectors/retail-consumer": "/sectores/retail-consumer",
  "/sectors/energy": "/sectores/energia",
  "/sectors/security": "/sectores/seguridad",
  "/programa-col·laboradors": "/programa-colaboradores",
  "/programa-col-laboradors": "/programa-colaboradores",
  // ─── Homepage aliases ───
  "/inici": "/ca",
};

// ─── Build full HTML ───
function buildPageHtml(path: string, page: PageData): string {
  const hreflangTags = page.hreflang
    ? Object.entries(page.hreflang)
        .map(
          ([lang, url]) =>
            `<link rel="alternate" hreflang="${escapeHtml(lang)}" href="${escapeHtml(url)}">`
        )
        .join("\n  ")
    : "";

  // Page-specific structured data
  const jsonLdScripts = page.structuredData
    .map(
      (sd) =>
        `<script type="application/ld+json">${safeJsonLd(JSON.stringify(sd))}</script>`
    )
    .join("\n  ");

  // Global Organization schema (injected on ALL pages)
  const orgJsonLdScript = `<script type="application/ld+json">${safeJsonLd(JSON.stringify(ORG_JSONLD))}</script>`;

  const spaUrl = `https://capittal.es${path === "/" ? "" : path}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="keywords" content="${escapeHtml(page.keywords)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${escapeHtml(page.canonical)}">
  ${hreflangTags}
  <meta property="og:type" content="${escapeHtml(page.ogType)}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${escapeHtml(page.canonical)}">
  <meta property="og:image" content="${escapeHtml(page.ogImage || 'https://capittal.es/og-image.jpg')}">
  <meta property="og:site_name" content="Capittal Transacciones">
  <meta property="og:locale" content="es_ES">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="${escapeHtml(page.ogImage || 'https://capittal.es/og-image.jpg')}">
  ${orgJsonLdScript}
  ${jsonLdScripts}
  <meta http-equiv="refresh" content="3;url=${spaUrl}">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1a1a2e;background:#fff;line-height:1.7;max-width:800px;margin:0 auto;padding:24px 16px}
    header{padding:16px 0;border-bottom:1px solid #e2e8f0;margin-bottom:32px}
    header a{color:#1a1a2e;text-decoration:none;font-weight:700;font-size:1.25rem}
    nav{margin-top:8px;font-size:.875rem}
    nav a{color:#3b82f6;margin-right:16px;text-decoration:none}
    h1{font-size:2rem;line-height:1.3;margin-bottom:16px;color:#0f172a}
    h2{font-size:1.4rem;margin:24px 0 12px;color:#0f172a}
    p{margin-bottom:16px;font-size:1.05rem}
    .redirect-note{background:#f1f5f9;padding:12px 16px;border-radius:6px;font-size:.875rem;color:#475569;margin-bottom:24px}
    footer{margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:.875rem;color:#64748b;text-align:center}
    footer a{color:#3b82f6}
  </style>
</head>
<body>
  <header>
    <a href="https://capittal.es">Capittal</a>
    <nav>
      <a href="https://capittal.es/servicios/venta-empresas">Venta de Empresas</a>
      <a href="https://capittal.es/servicios/valoraciones">Valoraciones</a>
      <a href="https://capittal.es/sectores/seguridad">Sector Seguridad</a>
      <a href="https://capittal.es/contacto">Contacto</a>
      <a href="https://capittal.es/blog">Blog</a>
    </nav>
  </header>
  <main>
    <p class="redirect-note">Redirigiendo a la versión completa en <a href="${spaUrl}">capittal.es</a>…</p>
    ${page.content}
  </main>
  <footer>© ${new Date().getFullYear()} <a href="https://capittal.es">Capittal</a> · Especialistas en M&A, Valoraciones y Due Diligence · <a href="${spaUrl}">Ver versión completa</a></footer>
</body>
</html>`;
}

function buildErrorHtml(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Capittal</title>
  <meta name="robots" content="noindex">
  <style>body{font-family:sans-serif;max-width:600px;margin:80px auto;text-align:center;color:#1a1a2e}h1{margin-bottom:16px}a{color:#3b82f6}</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${message}</p>
  <p><a href="https://capittal.es">Volver a Capittal</a></p>
</body>
</html>`;
}

// ─── Main handler ───
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let path = url.searchParams.get("path") || "/";

    // Normalize: remove trailing slash (except root)
    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    // 301 redirects for deprecated/renamed paths
    const REDIRECTS_301: Record<string, string> = {
      "/home": "/",
      "/compra-empreses": "/compra-empresas",
    };
    if (REDIRECTS_301[path]) {
      return new Response(null, {
        status: 301,
        headers: {
          ...corsHeaders,
          "Location": `https://capittal.es${REDIRECTS_301[path]}`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Resolve aliases for multilingual paths
    const resolvedPath = PATH_ALIASES[path] || path;
    let page = PAGES_DATA[resolvedPath];

    if (!page) {
      // List available pages for debugging
      const available = Object.keys(PAGES_DATA).join(", ");
      console.log(`pages-ssr: 404 for path="${path}". Available: ${available}`);
      return new Response(
        buildErrorHtml(
          "Página no encontrada",
          `No se encontró la página "${escapeHtml(path)}".`
        ),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }

    // If path is an alias, override canonical to match the actual requested path
    // so each language variant is independently indexable
    const effectivePage = path !== resolvedPath
      ? { ...page, canonical: `https://capittal.es${path}` }
      : page;

    // Enrich /recursos/blog with dynamic blog post listing
    let finalPage = effectivePage;
    if (resolvedPath === "/recursos/blog") {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!
        );
        const { data: posts } = await supabase
          .from("blog_posts")
          .select("title, slug, excerpt, category, published_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(20);

        if (posts?.length) {
          const postsHtml = posts.map((p: any) => {
            const date = p.published_at ? new Date(p.published_at).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }) : "";
            return `<article><h3><a href="https://capittal.es/blog/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a></h3><p>${escapeHtml(p.excerpt || "")}</p><small>${escapeHtml(p.category)} · ${date}</small></article>`;
          }).join("\n      ");

          finalPage = {
            ...effectivePage,
            content: effectivePage.content + `\n      <h2>Últimos Artículos</h2>\n      ${postsHtml}`,
          };
        }
      } catch (e) {
        console.error("Error enriching blog listing:", e);
      }
    }

    const html = buildPageHtml(path, finalPage);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    console.error("pages-ssr error:", err);
    return new Response(
      buildErrorHtml("Error interno", "Ocurrió un error inesperado."),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  }
});

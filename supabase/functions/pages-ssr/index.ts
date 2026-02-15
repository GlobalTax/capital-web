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

// ─── Organization JSON-LD (shared) ───
const ORG_JSONLD = {
  "@type": "Organization",
  name: "Capittal",
  url: "https://capittal.es",
  logo: "https://capittal.es/lovable-uploads/capittal-logo.png",
  sameAs: ["https://www.linkedin.com/company/capittal/"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gran Vía 617, Principal",
    addressLocality: "Barcelona",
    postalCode: "08007",
    addressCountry: "ES",
  },
};

interface PageData {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogType: string;
  hreflang?: Record<string, string>;
  structuredData: object[];
  content: string;
}

// ─── Static pages map ───
const PAGES_DATA: Record<string, PageData> = {
  "/": {
    title: "Capittal - Especialistas en M&A, Valoraciones y Due Diligence",
    description:
      "Capittal es su socio estratégico en operaciones de fusiones y adquisiciones, due diligence, valoraciones empresariales y planificación fiscal en España. Máxima confidencialidad.",
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
          "Especialistas en fusiones y adquisiciones, valoraciones empresariales y due diligence en España.",
        publisher: ORG_JSONLD,
      },
      {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: "Capittal Transacciones",
        url: "https://capittal.es",
        description:
          "Asesoramiento profesional en M&A, valoraciones, due diligence y planificación fiscal.",
        image: "https://capittal.es/og-image.png",
        telephone: "+34 93 000 00 00",
        address: ORG_JSONLD.address,
        areaServed: { "@type": "Country", name: "España" },
        serviceType: [
          "Fusiones y Adquisiciones",
          "Valoración de Empresas",
          "Due Diligence",
          "Planificación Fiscal",
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
        serviceType: "Asesoramiento en venta de empresas",
      },
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
        serviceType: "Valoración de empresas",
      },
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
        serviceType: "Due Diligence",
      },
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
        serviceType: "Reestructuración empresarial",
      },
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
        serviceType: "Planificación fiscal",
      },
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
        serviceType: "Asesoramiento legal M&A",
      },
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
    title: "M&A Sector Seguridad Privada en España | Capittal",
    description:
      "Especialistas en fusiones y adquisiciones del sector seguridad privada en España. Asesoramos en compraventa de empresas de seguridad, vigilancia, sistemas de alarma y protección contra incendios.",
    keywords:
      "M&A seguridad privada, venta empresa seguridad, compra empresa vigilancia, fusiones seguridad España, valoración empresa seguridad",
    canonical: "https://capittal.es/sectores/seguridad",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "M&A Sector Seguridad Privada",
        provider: ORG_JSONLD,
        description:
          "Asesoramiento en fusiones y adquisiciones del sector seguridad privada en España. Vigilancia, alarmas, protección contra incendios.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: "M&A sector seguridad",
      },
    ],
    content: `
      <h1>M&A en el Sector de Seguridad Privada</h1>
      <p>Capittal es la firma de referencia en operaciones de fusiones y adquisiciones del sector seguridad privada en España. Hemos asesorado en operaciones con actores clave como Scutum Group, APT Instalaciones, Grupo SEA España, Mitie y Visegurity.</p>
      <h2>Subsectores de Seguridad</h2>
      <p>Cubrimos todos los segmentos del sector seguridad: vigilancia privada, sistemas de alarma y detección, protección contra incendios (PCI), ciberseguridad, control de accesos, transporte de fondos y seguridad electrónica.</p>
      <h2>Tendencias de Consolidación</h2>
      <p>El sector seguridad en España está experimentando una fuerte ola de consolidación, liderada por grupos internacionales como Securitas, Scutum y Prosegur. Las empresas medianas son objetivos atractivos de adquisición por su base de clientes recurrente y contratos a largo plazo.</p>
      <h2>Nuestras Credenciales</h2>
      <p>Hemos completado múltiples operaciones en el sector seguridad: Scutum/Kosmos Group (sistemas contra incendios), Scutum/APT Instalaciones, Mitie/Visegurity, entre otras. Nuestro partnership con Francisco Garcia & Assessors refuerza nuestra posición de liderazgo en M&A de seguridad.</p>
    `,
  },

  "/sectores/tecnologia": {
    title: "M&A Sector Tecnología | Tech M&A España | Capittal",
    description:
      "Asesoramiento en fusiones y adquisiciones de empresas tecnológicas en España. SaaS, software, ciberseguridad, IT services y startups tech.",
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
        description: "Asesoramiento en M&A de empresas tecnológicas: SaaS, software, IT services y ciberseguridad.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: "M&A sector tecnología",
      },
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
    title: "M&A Sector Industrial | Fusiones y Adquisiciones Industria | Capittal",
    description:
      "Asesoramiento en M&A del sector industrial en España. Fabricación, manufactura, ingeniería, mantenimiento industrial y servicios auxiliares.",
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
        description: "Asesoramiento en M&A del sector industrial: fabricación, manufactura, ingeniería y servicios industriales.",
        areaServed: { "@type": "Country", name: "España" },
        serviceType: "M&A sector industrial",
      },
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
        serviceType: "M&A sector healthcare",
      },
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
        serviceType: "M&A sector energía",
      },
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
        serviceType: "M&A sector construcción",
      },
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
        serviceType: "M&A sector logística",
      },
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
        serviceType: "M&A sector medio ambiente",
      },
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
        serviceType: "M&A sector retail",
      },
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
        serviceType: "M&A sector alimentación",
      },
    ],
    content: `
      <h1>M&A en el Sector Alimentación y Agroalimentario</h1>
      <p>Capittal asesora en operaciones de compraventa de empresas del sector alimentario en España: fabricantes, distribuidores, food service, catering, y empresas agroalimentarias. Un sector con alta actividad M&A por la consolidación y la entrada de fondos de inversión.</p>
    `,
  },

  // ─── OTRAS PÁGINAS ───
  "/contacto": {
    title: "Contacto | Capittal - Asesores M&A en Barcelona",
    description:
      "Contacte con Capittal para una consulta confidencial sobre la compraventa de su empresa. Oficinas en Barcelona. Valoraciones, M&A y due diligence.",
    keywords:
      "contacto Capittal, asesores M&A Barcelona, consulta venta empresa, oficina M&A Barcelona",
    canonical: "https://capittal.es/contacto",
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Capittal Transacciones",
        url: "https://capittal.es",
        image: "https://capittal.es/og-image.png",
        address: ORG_JSONLD.address,
        areaServed: { "@type": "Country", name: "España" },
        description: "Firma de asesoramiento en fusiones y adquisiciones con sede en Barcelona.",
      },
    ],
    content: `
      <h1>Contacte con Capittal</h1>
      <p>Estamos a su disposición para una consulta confidencial sobre la compraventa de su empresa, valoraciones o due diligence. Nuestro equipo le atenderá con la máxima discreción.</p>
      <h2>Oficina en Barcelona</h2>
      <p>Gran Vía 617, Principal, 08007 Barcelona, España.</p>
      <h2>Solicitar una reunión</h2>
      <p>Complete nuestro formulario de contacto o llámenos directamente. La primera consulta es gratuita y completamente confidencial.</p>
    `,
  },

  "/equipo": {
    title: "Nuestro Equipo | Profesionales M&A | Capittal",
    description:
      "Conozca al equipo de Capittal: profesionales con experiencia en banca de inversión, consultoría estratégica y M&A. Formación en ESADE, Deloitte y PwC.",
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
        description: "Equipo de profesionales de Capittal especializados en M&A, valoraciones y due diligence.",
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

  const jsonLdScripts = page.structuredData
    .map(
      (sd) =>
        `<script type="application/ld+json">${safeJsonLd(JSON.stringify(sd))}</script>`
    )
    .join("\n  ");

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
  <meta property="og:image" content="https://capittal.es/og-image.png">
  <meta property="og:site_name" content="Capittal">
  <meta property="og:locale" content="es_ES">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.description)}">
  <meta name="twitter:image" content="https://capittal.es/og-image.png">
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

    const page = PAGES_DATA[path];

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

    const html = buildPageHtml(path, page);

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

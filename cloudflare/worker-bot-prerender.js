/**
 * Cloudflare Worker - capittal.es  (v4 — Prerender.io integration)
 *
 * Flow:
 *   Bots    → Prerender.io (fully rendered HTML with JS executed)
 *             Falls back to server-generated HTML if Prerender.io fails
 *   Users   → Lovable upstream (SPA, unmodified)
 *
 * Why: Lovable is a CSR SPA — crawlers see an empty shell. Prerender.io
 * renders the full page with a headless browser, so bots get complete HTML
 * with correct meta tags, content, structured data, and internal links.
 */

const LOVABLE_UPSTREAM = "https://webcapittal.lovable.app";
const PUBLIC_HOST = "capittal.es";
const BASE_URL = "https://capittal.es";
const PRERENDER_URL = "https://service.prerender.io/";
const PRERENDER_TOKEN = "O4ymoBvl4whx6UQePxL5";
const SITEMAP_EDGE_FN = "https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/generate-sitemap";

const BOT_AGENTS = [
  "googlebot","yahoo! slurp","bingbot","yandex","baiduspider","facebookexternalhit",
  "twitterbot","rogerbot","linkedinbot","embedly","quora link preview","showyoubot",
  "outbrain","pinterest/0.","developers.google.com/+/web/snippet","slackbot","vkshare",
  "w3c_validator","redditbot","applebot","whatsapp","flipboard","tumblr","bitlybot",
  "skypeuripreview","nuzzel","discordbot","google page speed","qwantify","pinterestbot",
  "bitrix link preview","xing-contenttabreceiver","chrome-lighthouse","telegrambot",
  "oai-searchbot","chatgpt","gptbot","claudebot","amazonbot","perplexity",
  "google-inspectiontool","integration-test",
  "ahrefsbot","semrushbot","mj12bot","dotbot","bytespider",
];

const IGNORE_EXTENSIONS = [
  ".js",".css",".xml",".less",".png",".jpg",".jpeg",".gif",".pdf",".doc",".txt",".ico",
  ".rss",".zip",".mp3",".rar",".exe",".wmv",".avi",".ppt",".mpg",".mpeg",".tif",".wav",
  ".mov",".psd",".ai",".xls",".mp4",".m4a",".swf",".dat",".dmg",".iso",".flv",".m4v",
  ".torrent",".woff",".ttf",".svg",".webmanifest",
];

// =====================================================================
// SEO Route Data — used only as fallback if Prerender.io is down
// =====================================================================
const ROUTES = {
  "/":{t:"Capittal Transacciones | Fusiones y Adquisiciones en España - M&A Advisory",d:"Asesoramiento M&A en Barcelona: venta de empresas, valoraciones y due diligence. +70 profesionales especializados en mid-market español."},
  "/venta-empresas":{t:"Venta de Empresas en España | Asesoramiento M&A - Capittal",d:"¿Quieres vender tu empresa? Asesoramiento en venta, valoración y negociación. Proceso confidencial con acceso a fondos e inversores."},
  "/compra-empresas":{t:"Compra de Empresas en España | Asesoramiento Buy-Side - Capittal",d:"Asesoramiento buy-side para fondos de Private Equity e inversores corporativos. Identificación de targets, valoración y due diligence."},
  "/contacto":{t:"Contacto | Capittal Transacciones - M&A Barcelona",d:"Contacta con Capittal. Oficinas en Barcelona, Ausiàs March 36. Asesoramiento en fusiones y adquisiciones, valoraciones y due diligence."},
  "/equipo":{t:"Equipo de Profesionales M&A | Capittal Transacciones",d:"Equipo de +70 profesionales de Capittal. Expertos en fusiones y adquisiciones, valoraciones y due diligence con sede en Barcelona."},
  "/por-que-elegirnos":{t:"Por Qué Elegirnos | Capittal Transacciones",d:"Experiencia, metodología y resultados. Descubra por qué Capittal es su mejor socio en operaciones de M&A y valoraciones empresariales."},
  "/casos-exito":{t:"Casos de Éxito | Operaciones M&A | Capittal",d:"Operaciones cerradas con éxito por Capittal. Venta de empresas, adquisiciones y valoraciones en múltiples sectores."},
  "/programa-colaboradores":{t:"Programa de Colaboradores | Capittal",d:"Únase a nuestra red de colaboradores. Refiera operaciones de M&A y reciba compensación por cada transacción cerrada."},
  "/servicios/venta-empresas":{t:"Venta de Empresas en España | Asesoramiento M&A - Capittal",d:"¿Quieres vender tu empresa? Asesoramiento en venta, valoración y negociación. Proceso confidencial con acceso a fondos e inversores."},
  "/servicios/compra-empresas":{t:"Compra de Empresas en España | Asesoramiento Buy-Side - Capittal",d:"Asesoramiento buy-side para fondos de Private Equity e inversores corporativos. Identificación de targets, valoración y due diligence."},
  "/servicios/valoraciones":{t:"Valoración de Empresas | Múltiplos EBITDA y DCF - Capittal",d:"Valoración de empresas: múltiplos EBITDA, flujos de caja descontados (DCF) y comparables de mercado. Calculadora gratuita online."},
  "/servicios/due-diligence":{t:"Due Diligence Financiera y Fiscal | M&A España - Capittal",d:"Due diligence financiera, fiscal y legal para compraventa de empresas. Análisis riguroso para compradores y vendedores en procesos M&A."},
  "/servicios/reestructuraciones":{t:"Reestructuración de Empresas | Asesoramiento Financiero - Capittal",d:"Asesoramiento en reestructuraciones, refinanciación de deuda y situaciones especiales. Soluciones financieras para empresas en dificultades."},
  "/servicios/planificacion-fiscal":{t:"Planificación Fiscal en Venta de Empresas | Capittal",d:"Optimización fiscal en compraventa de empresas. Planificación pre-venta para maximizar el valor neto. Asesoramiento M&A especializado."},
  "/servicios/asesoramiento-legal":{t:"Asesoramiento Legal en M&A | Capittal",d:"Soporte jurídico especializado en fusiones y adquisiciones. Contratos, due diligence legal y cierre de transacciones en España."},
  "/servicios/search-funds":{t:"Search Funds | Asesoramiento Especializado | Capittal",d:"Asesoramiento integral para Search Funds. Captación de capital, adquisición y gestión de la empresa objetivo en España."},
  "/sectores/seguridad":{t:"M&A Seguridad Privada España | Venta Empresas Alarmas y Vigilancia - Capittal",d:"Especialistas en M&A en seguridad privada. Venta de empresas de alarmas, vigilancia y servicios auxiliares. Expertos en CRAs."},
  "/sectores/tecnologia":{t:"M&A Tecnología España | Venta Empresas Tech y SaaS - Capittal",d:"M&A de empresas tecnológicas: SaaS, ciberseguridad e infraestructura digital. Acceso a compradores estratégicos y fondos tech."},
  "/sectores/industrial":{t:"M&A Industrial España | Venta Empresas Industriales - Capittal",d:"Compraventa de empresas industriales: manufactura, ingeniería y servicios industriales. Acceso a fondos de Private Equity."},
  "/sectores/healthcare":{t:"M&A Healthcare España | Venta Empresas Sanitarias - Capittal",d:"M&A en el sector sanitario y healthcare. Operaciones con clínicas, laboratorios y empresas de servicios de salud en España."},
  "/sectores/energia":{t:"M&A Energía España | Venta Empresas Energéticas - Capittal",d:"Compraventa de empresas del sector energético. Renovables, infraestructura energética y servicios relacionados en España."},
  "/sectores/construccion":{t:"M&A Sector Construcción | Capittal",d:"Operaciones de M&A en construcción e infraestructuras. Promotoras, constructoras e ingeniería civil en España."},
  "/sectores/logistica":{t:"M&A Sector Logística | Capittal",d:"Fusiones y adquisiciones en logística y transporte. Distribución, almacenaje y cadena de suministro en España."},
  "/sectores/medio-ambiente":{t:"M&A Sector Medio Ambiente | Capittal",d:"Operaciones de M&A en medio ambiente. Gestión de residuos, tratamiento de aguas y sostenibilidad en España."},
  "/sectores/retail-consumer":{t:"M&A Sector Retail y Consumo | Capittal",d:"Asesoramiento M&A en retail y consumo. Distribución, franquicias, e-commerce y marcas de consumo en España."},
  "/sectores/retail":{t:"M&A Sector Retail y Consumo | Capittal",d:"Operaciones de M&A en retail, distribución y bienes de consumo en España."},
  "/sectores/alimentacion":{t:"M&A Sector Alimentación | Capittal",d:"Operaciones de M&A en el sector alimentario. Producción, distribución y marcas de alimentación en España."},
  "/recursos/blog":{t:"Blog M&A España | Fusiones, Adquisiciones y Valoraciones - Capittal",d:"Artículos sobre fusiones, adquisiciones, valoración de empresas y due diligence. Contenido M&A para empresarios e inversores."},
  "/lp/calculadora":{t:"Calculadora de Valoración de Empresas Gratuita | Capittal",d:"Calcula el valor de tu empresa gratis. Estimación basada en facturación, EBITDA y sector. Valoración orientativa en 2 minutos."},
  "/lp/calculadora-fiscal":{t:"Calculadora Fiscal de Venta de Empresas España | Capittal",d:"Calcula los impuestos de la venta de tu empresa. Simulador fiscal gratuito: impacto en IRPF, Sociedades y plusvalías."},
  "/lp/calculadora-asesores":{t:"Calculadora de Valoración para Asesores | Capittal",d:"Herramienta profesional de valoración para asesores financieros. Múltiplos sectoriales y metodologías avanzadas."},
  "/de-looper-a-capittal":{t:"De Looper a Capittal | Nuestra Historia",d:"La evolución de Looper a Capittal Transacciones. Nuestra historia, visión y compromiso con el mercado M&A español."},
  "/valoracion-empresas":{t:"Valoración de Empresas Online | Capittal",d:"Obtenga una valoración profesional de su empresa. Múltiplos sectoriales, DCF y comparables de mercado."},
  "/oportunidades":{t:"Oportunidades de Inversión | Empresas en Venta | Capittal",d:"Oportunidades de inversión y empresas en venta. Marketplace de operaciones M&A verificadas por Capittal en España."},
  "/lp/calculadora-b":{t:"Calculadora de Valoración B - Capittal",d:"Calcula el valor de tu empresa con nuestra calculadora alternativa. Estimación rápida basada en facturación, EBITDA y sector."},
  "/lp/calculadora-meta":{t:"Calculadora de Valoración de Empresas | Capittal",d:"Descubre cuánto vale tu empresa con nuestra calculadora gratuita. Valoración basada en múltiplos sectoriales de EBITDA."},
  "/lp/venta-empresas":{t:"Venta de Empresas - Valoración Gratuita | Capittal",d:"¿Quieres vender tu empresa? Valoración gratuita del valor de mercado de tu negocio. Asesoramiento confidencial de principio a fin."},
  "/lp/venta-empresas-v2":{t:"Vender Tu Empresa al Mejor Precio | Capittal",d:"Maximiza el precio de venta de tu empresa. Acceso a compradores cualificados, fondos de inversión e inversores estratégicos."},
  "/lp/suiteloop":{t:"SuiteLoop - Software M&A para Asesorías | Capittal",d:"SuiteLoop: plataforma para gestionar operaciones M&A. Valoración, CRM de deals y gestión documental para asesores financieros."},
  "/lp/accountex":{t:"Capittal en Accountex Madrid 2025",d:"Visítanos en Accountex Madrid 2025. Capittal presenta servicios M&A y herramientas de valoración para asesorías y despachos."},
  "/lp/valoracion-2026":{t:"Valoración de Tu Empresa - Cierre de Año | Capittal",d:"Conoce el valor de tu empresa antes del cierre de año. Valoración gratuita con múltiplos actualizados de EBITDA por sector."},
  "/lp/compra-empresas-meta":{t:"Compra de Empresas - Oportunidades de Inversión | Capittal",d:"Empresas en venta en España. Oportunidades verificadas en seguridad, tecnología, industrial y servicios. Acceso exclusivo."},
  "/lp/rod-linkedin":{t:"Descarga el ROD - Resumen de Operación | Capittal",d:"Descarga gratis el modelo ROD de Capittal. Documento profesional para presentar oportunidades de inversión a compradores."},
  "/lp/open-deals":{t:"Open Deals - Empresas en Venta | Capittal",d:"Marketplace de empresas en venta gestionado por Capittal. Oportunidades de inversión verificadas con información detallada."},
  "/lp/oportunidades-meta":{t:"Oportunidades de Inversión - Empresas en Venta | Capittal",d:"Oportunidades de inversión en empresas españolas. Operaciones verificadas en sectores de alto crecimiento y rentabilidad."},
  "/lp/simulador-seguridad":{t:"Simulador de Valoración - Seguridad Privada | Capittal",d:"Simulador para valorar empresas de seguridad privada. Múltiplos específicos de CRAs, vigilancia y servicios auxiliares."},
  "/seguridad/calculadora":{t:"Calculadora de Valoración - Empresas de Seguridad | Capittal",d:"Calcula el valor de tu empresa de seguridad privada. Múltiplos para CRAs, alarmas, vigilancia y servicios auxiliares."},
  "/recursos/noticias":{t:"Noticias M&A España | Capittal",d:"Noticias sobre fusiones y adquisiciones en España. Operaciones cerradas, tendencias del mercado M&A y movimientos corporativos."},
  "/recursos/case-studies":{t:"Casos de Estudio M&A | Capittal",d:"Análisis de operaciones M&A realizadas por Capittal. Casos de éxito reales con datos y resultados verificables."},
  "/recursos/newsletter":{t:"Newsletter M&A | Capittal Transacciones",d:"Suscríbete a la newsletter de Capittal. Análisis M&A, oportunidades de inversión y tendencias del sector en tu correo."},
  "/recursos/webinars":{t:"Webinars M&A | Capittal Transacciones",d:"Webinars sobre fusiones, adquisiciones y valoración de empresas. Formación gratuita por expertos de Capittal Transacciones."},
  "/search-funds/recursos":{t:"Centro de Recursos Search Funds | Capittal",d:"Guías, herramientas y casos de éxito sobre Search Funds en España. Todo para lanzar o invertir en un Search Fund."},
  "/search-funds/recursos/guia":{t:"Guía Completa de Search Funds | Capittal",d:"Guía del modelo Search Fund en España. Desde captación de capital hasta adquisición y operación de la empresa objetivo."},
  "/search-funds/recursos/glosario":{t:"Glosario de Search Funds | Capittal",d:"Diccionario con los términos clave del ecosistema Search Fund. Definiciones de conceptos financieros, legales y operativos."},
  "/search-funds/recursos/herramientas":{t:"Herramientas para Search Funds | Capittal",d:"Plantillas, modelos financieros y herramientas para searchers. Recursos descargables para cada fase del Search Fund."},
  "/search-funds/recursos/casos":{t:"Casos de Éxito Search Funds | Capittal",d:"Search Funds exitosos en España y Europa. Análisis de adquisiciones, crecimiento post-compra y retornos para inversores."},
  "/search-funds/recursos/biblioteca":{t:"Biblioteca Search Funds | Capittal",d:"Libros, papers académicos y artículos sobre Search Funds. Recursos seleccionados para searchers e inversores."},
  "/search-funds/recursos/comunidad":{t:"Comunidad Search Funds España | Capittal",d:"Conecta con la comunidad Search Funds en España. Red de searchers, inversores y asesores en adquisiciones empresariales."},
  "/search-funds/recursos/sourcing":{t:"Sourcing de Empresas para Search Funds | Capittal",d:"Estrategias de sourcing para identificar empresas objetivo. Cómo encontrar la mejor oportunidad de adquisición para tu Search Fund."},
  "/search-funds/recursos/valoracion":{t:"Valoración en Search Funds | Capittal",d:"Metodologías de valoración para operaciones de Search Fund. Múltiplos, DCF y criterios de precio en adquisiciones de pymes."},
  "/search-funds/recursos/negociacion":{t:"Negociación en Search Funds | Capittal",d:"Guía de negociación para searchers. Tácticas, estructura de deals y claves para cerrar la adquisición en un Search Fund."},
  "/search-funds/recursos/post-adquisicion":{t:"Post-Adquisición en Search Funds | Capittal",d:"Creación de valor post-adquisición en Search Funds. Gestión del cambio, mejora operativa y planificación del crecimiento."},
  "/search-funds/registro-searcher":{t:"Registro de Searcher - Search Funds | Capittal",d:"Regístrate como searcher en Capittal. Oportunidades de inversión, herramientas de valoración y apoyo en tu Search Fund."},
  "/oportunidades/empleo":{t:"Empleo en M&A - Trabaja en Capittal",d:"Únete a Capittal Transacciones. Ofertas de empleo en M&A, valoraciones y asesoramiento financiero en Barcelona."},
  "/guia-valoracion-empresas":{t:"Guía de Valoración de Empresas | Capittal",d:"Guía completa para valorar tu empresa. Métodos de valoración, múltiplos sectoriales y claves para maximizar el precio de venta."},
  "/recursos/test-exit-ready":{t:"Test Exit Ready - ¿Tu Empresa Está Lista para Vender? | Capittal",d:"Evalúa si tu empresa está preparada para una venta. Test gratuito con recomendaciones personalizadas para optimizar tu exit."},
  "/recursos/informes-ma":{t:"Informes M&A España | Capittal",d:"Informes y análisis del mercado de fusiones y adquisiciones en España. Datos, tendencias y previsiones del sector M&A."},
  "/recursos/biblioteca":{t:"Biblioteca de Recursos M&A | Capittal",d:"Biblioteca de recursos sobre fusiones y adquisiciones. Guías, plantillas y documentos para empresarios e inversores en España."},
  "/recursos/guia-vender-empresa":{t:"Guía para Vender tu Empresa | Capittal",d:"Guía paso a paso para vender tu empresa con éxito. Preparación, valoración, negociación y cierre de la operación M&A."},
  "/favoritos":{t:"Operaciones Guardadas | Capittal",d:"Tus operaciones de inversión guardadas en Capittal. Revisa y gestiona las oportunidades M&A que te interesan."},
  "/search-funds":{t:"Search Funds - Asesoramiento Especializado | Capittal",d:"Asesoramiento integral para Search Funds en España. Captación de capital, adquisición y gestión de la empresa objetivo."},
  "/por-que-elegirnos/experiencia":{t:"Nuestra Experiencia en M&A | Capittal",d:"Más de una década en fusiones y adquisiciones en España. Track record de operaciones cerradas en múltiples sectores."},
  "/por-que-elegirnos/metodologia":{t:"Metodología de Trabajo M&A | Capittal",d:"Metodología probada en M&A. Proceso estructurado desde la valoración inicial hasta el cierre con máxima confidencialidad."},
  "/por-que-elegirnos/resultados":{t:"Resultados en Operaciones M&A | Capittal",d:"Resultados verificables en fusiones y adquisiciones. Métricas de éxito, valoraciones alcanzadas y satisfacción de clientes."},
  "/ca":{t:"Capittal Transaccions - Fusions i Adquisicions a Espanya | M&A Advisory",d:"Assessorament M&A a Barcelona. +70 professionals en venda d'empreses, valoracions i due diligence. Especialistes en mid-market."},
  "/venda-empreses":{t:"Venda d'Empreses a Espanya - Assessorament M&A | Capittal",d:"Vols vendre la teva empresa? Assessorament en venda, valoració i negociació. Procés confidencial amb accés a fons d'inversió."},
  "/contacte":{t:"Contacte - Capittal Transaccions | M&A Barcelona",d:"Contacta amb Capittal. Oficines a Barcelona, Ausiàs March 36. Assessorament en fusions i adquisicions, valoracions i due diligence."},
  "/equip":{t:"Equip de Professionals M&A | Capittal Transaccions",d:"Equip de +70 professionals de Capittal. Experts en fusions i adquisicions, valoracions i due diligence amb seu a Barcelona."},
  "/casos-exit":{t:"Casos d'Èxit - Operacions M&A | Capittal",d:"Operacions tancades amb èxit per Capittal. Venda d'empreses, adquisicions i valoracions en múltiples sectors."},
  "/per-que-triar-nos":{t:"Per Què Triar-nos | Capittal Transaccions",d:"Experiència, metodologia i resultats. Capittal és el teu millor soci en operacions de M&A i valoracions empresarials."},
  "/programa-col-laboradors":{t:"Programa de Col·laboradors | Capittal",d:"Uneix-te a la nostra xarxa de col·laboradors. Refereix operacions de M&A i rep compensació per cada transacció tancada."},
  "/en":{t:"Capittal - Mergers & Acquisitions Advisory in Spain",d:"M&A advisory firm in Barcelona. 70+ professionals in company sales, valuations and due diligence across Spain."},
  "/sell-companies":{t:"Sell Your Company in Spain - M&A Advisory | Capittal",d:"Looking to sell your company? Professional M&A advisory. Confidential process with access to PE funds and international buyers."},
  "/buy-companies":{t:"Buy Companies in Spain - Buy-Side Advisory | Capittal",d:"Buy-side advisory for PE funds and corporate investors. Target identification, valuation and due diligence across Spain."},
  "/contact":{t:"Contact - Capittal | M&A Barcelona",d:"Get in touch with Capittal. Offices in Barcelona, Ausiàs March 36. Advisory in mergers and acquisitions, valuations and due diligence."},
  "/success-stories":{t:"Success Stories - M&A Transactions | Capittal",d:"Completed M&A transactions by Capittal. Company sales, acquisitions and valuations across multiple sectors in Spain."},
  "/why-choose-us":{t:"Why Choose Us | Capittal M&A Advisory",d:"Experience, methodology and results. Discover why Capittal is your best partner for M&A transactions and valuations in Spain."},
  "/collaborators-program":{t:"Collaborators Program | Capittal",d:"Join our collaborator network. Refer M&A opportunities and receive compensation for every closed transaction with Capittal."},
  "/partners-program":{t:"Partners Program | Capittal M&A Advisory",d:"Partner with Capittal. Strategic alliances for financial advisors, law firms and consulting firms in M&A deal referrals."},
};

// =====================================================================
// Hreflang mappings (used only in fallback HTML)
// =====================================================================
const HREFLANGS = {
  "/":{es:"/",ca:"/ca",en:"/en"},
  "/ca":{es:"/",ca:"/ca",en:"/en"},
  "/en":{es:"/",ca:"/ca",en:"/en"},
  "/venta-empresas":{es:"/venta-empresas",ca:"/venda-empreses",en:"/sell-companies"},
  "/venda-empreses":{es:"/venta-empresas",ca:"/venda-empreses",en:"/sell-companies"},
  "/sell-companies":{es:"/venta-empresas",ca:"/venda-empreses",en:"/sell-companies"},
  "/compra-empresas":{es:"/compra-empresas",en:"/buy-companies"},
  "/buy-companies":{es:"/compra-empresas",en:"/buy-companies"},
  "/contacto":{es:"/contacto",ca:"/contacte",en:"/contact"},
  "/contacte":{es:"/contacto",ca:"/contacte",en:"/contact"},
  "/contact":{es:"/contacto",ca:"/contacte",en:"/contact"},
  "/por-que-elegirnos":{es:"/por-que-elegirnos",ca:"/per-que-triar-nos",en:"/why-choose-us"},
  "/per-que-triar-nos":{es:"/por-que-elegirnos",ca:"/per-que-triar-nos",en:"/why-choose-us"},
  "/why-choose-us":{es:"/por-que-elegirnos",ca:"/per-que-triar-nos",en:"/why-choose-us"},
  "/equipo":{es:"/equipo",ca:"/equip"},
  "/equip":{es:"/equipo",ca:"/equip"},
  "/casos-exito":{es:"/casos-exito",ca:"/casos-exit",en:"/success-stories"},
  "/casos-exit":{es:"/casos-exito",ca:"/casos-exit",en:"/success-stories"},
  "/success-stories":{es:"/casos-exito",ca:"/casos-exit",en:"/success-stories"},
  "/programa-colaboradores":{es:"/programa-colaboradores",ca:"/programa-col-laboradors",en:"/collaborators-program"},
  "/programa-col-laboradors":{es:"/programa-colaboradores",ca:"/programa-col-laboradors",en:"/collaborators-program"},
  "/collaborators-program":{es:"/programa-colaboradores",ca:"/programa-col-laboradors",en:"/collaborators-program"},
  "/servicios/valoraciones":{es:"/servicios/valoraciones",ca:"/serveis/valoracions",en:"/services/valuations"},
  "/servicios/due-diligence":{es:"/servicios/due-diligence",ca:"/serveis/due-diligence",en:"/services/due-diligence"},
  "/servicios/asesoramiento-legal":{es:"/servicios/asesoramiento-legal",ca:"/serveis/assessorament-legal",en:"/services/legal-advisory"},
  "/servicios/reestructuraciones":{es:"/servicios/reestructuraciones",ca:"/serveis/reestructuracions",en:"/services/restructuring"},
  "/servicios/planificacion-fiscal":{es:"/servicios/planificacion-fiscal",ca:"/serveis/planificacio-fiscal",en:"/services/tax-planning"},
  "/sectores/tecnologia":{es:"/sectores/tecnologia",ca:"/sectors/tecnologia",en:"/sectors/technology"},
  "/sectores/healthcare":{es:"/sectores/healthcare",ca:"/sectors/salut",en:"/sectors/healthcare"},
  "/sectores/seguridad":{es:"/sectores/seguridad",ca:"/sectors/seguretat",en:"/sectors/security"},
  "/sectores/energia":{es:"/sectores/energia",ca:"/sectors/energia",en:"/sectors/energy"},
  "/sectores/industrial":{es:"/sectores/industrial",ca:"/sectors/industrial"},
  "/sectores/retail-consumer":{es:"/sectores/retail-consumer",ca:"/sectors/retail-consum",en:"/sectors/retail-consumer"},
  "/sectores/construccion":{es:"/sectores/construccion",ca:"/sectors/construccio"},
  "/sectores/alimentacion":{es:"/sectores/alimentacion",ca:"/sectors/alimentacio"},
  "/sectores/logistica":{es:"/sectores/logistica",ca:"/sectors/logistica"},
  "/sectores/medio-ambiente":{es:"/sectores/medio-ambiente",ca:"/sectors/medi-ambient"},
};

// =====================================================================
// Helpers
// =====================================================================
function isRedirect(status) { return [301,302,303,307,308].includes(status); }

function isBot(ua) {
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some(bot => lower.includes(bot));
}

function isIgnoredExtension(pathname) {
  const dot = pathname.lastIndexOf(".");
  if (dot < 0) return false;
  return IGNORE_EXTENSIONS.includes(pathname.substring(dot).toLowerCase());
}

function detectLang(path) {
  if (path === '/ca' || path.startsWith('/venda-') || path.startsWith('/serveis/') ||
      path === '/contacte' || path === '/equip' || path === '/casos-exit' ||
      path === '/per-que-triar-nos' || path.startsWith('/programa-col') ||
      path.startsWith('/sectors/')) return 'ca';
  if (path === '/en' || path.startsWith('/sell-') || path.startsWith('/buy-') ||
      path === '/contact' || path === '/success-stories' || path === '/why-choose-us' ||
      path.startsWith('/collaborators-') || path.startsWith('/partners-') ||
      path.startsWith('/services/')) return 'en';
  return 'es';
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// =====================================================================
// Prerender.io fetch — sends the request to Prerender.io's service
// which renders the page with headless Chrome and returns full HTML
// =====================================================================
async function fetchFromPrerender(requestUrl, originalHeaders) {
  const prerenderUrl = `${PRERENDER_URL}${requestUrl}`;
  const headers = new Headers(originalHeaders);
  headers.set('X-Prerender-Token', PRERENDER_TOKEN);

  const resp = await fetch(new Request(prerenderUrl, {
    headers,
    redirect: 'manual',
  }));

  return resp;
}

// =====================================================================
// Fallback: generate basic HTML if Prerender.io is unavailable
// =====================================================================
function generateFallbackHtml(pathname) {
  const p = pathname.replace(/\/+$/, '') || '/';
  const meta = ROUTES[p];
  const canonicalUrl = BASE_URL + p;
  const lang = detectLang(p);
  const title = meta ? esc(meta.t) : `Capittal Transacciones | ${esc(p)}`;
  const desc = meta ? esc(meta.d) : 'Asesoramiento M&A en Barcelona. Capittal Transacciones.';

  let hreflangTags = '';
  const hl = HREFLANGS[p];
  if (hl) {
    for (const [hrefLang, hrefPath] of Object.entries(hl)) {
      hreflangTags += `    <link rel="alternate" hreflang="${hrefLang}" href="${BASE_URL}${hrefPath}" />\n`;
    }
    hreflangTags += `    <link rel="alternate" hreflang="x-default" href="${BASE_URL}${hl.es || p}" />\n`;
  }

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Capittal Transacciones" />
    <meta property="og:locale" content="${lang === 'ca' ? 'ca_ES' : lang === 'en' ? 'en_US' : 'es_ES'}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${BASE_URL}/og-image.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${BASE_URL}/og-image.jpg" />
${hreflangTags}</head>
<body>
    <h1>${title}</h1>
    <p>${desc}</p>
    <nav>
      <a href="${BASE_URL}/">Inicio</a>
      <a href="${BASE_URL}/venta-empresas">Venta de Empresas</a>
      <a href="${BASE_URL}/compra-empresas">Compra de Empresas</a>
      <a href="${BASE_URL}/servicios/valoraciones">Valoraciones</a>
      <a href="${BASE_URL}/contacto">Contacto</a>
    </nav>
</body>
</html>`;
}

// =====================================================================
// Fetch from Lovable upstream (for normal users)
// =====================================================================
function fetchFromLovable(request, url, isGetLike) {
  const upstreamBase = new URL(LOVABLE_UPSTREAM);
  const upstreamUrl = new URL(url.href);
  upstreamUrl.protocol = upstreamBase.protocol;
  upstreamUrl.hostname = upstreamBase.hostname;

  const h = new Headers(request.headers);
  h.set("Host", upstreamBase.hostname);
  h.set("X-Forwarded-Host", PUBLIC_HOST);
  h.set("X-Forwarded-Proto", "https");
  h.delete("cf-connecting-ip");
  h.delete("x-forwarded-for");
  h.delete("forwarded");

  return fetch(new Request(upstreamUrl.toString(), {
    method: request.method,
    headers: h,
    body: isGetLike ? undefined : request.body,
    redirect: "manual",
  }));
}

// =====================================================================
// Main Worker
// =====================================================================
export default {
  async fetch(request, env) {
    try { return await handleRequest(request, env); }
    catch (err) { return new Response(err?.stack || String(err), { status: 500 }); }
  },
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const userAgent = (request.headers.get("User-Agent") || "");
  const isBotReq = isBot(userAgent);
  const isGetLike = request.method === "GET" || request.method === "HEAD";
  const xPrerender = request.headers.get("X-Prerender");

  // ── Sitemap proxy ──────────────────────────────────────────────────
  if (url.pathname === '/sitemap.xml') {
    const sitemapResp = await fetch(SITEMAP_EDGE_FN, {
      headers: {
        "apikey": env.SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
      }
    });
    const xml = await sitemapResp.text();
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  }

  // ── IndexNow verification ─────────────────────────────────────────
  if (url.pathname === '/zr9ub5nwpbrj74k31fttyeva7qu332fx.txt') {
    return new Response('zr9ub5nwpbrj74k31fttyeva7qu332fx', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  // ── SEO Debug endpoint ────────────────────────────────────────────
  if (url.pathname === '/__seo-debug') {
    const testPath = url.searchParams.get('path') || '/venta-empresas';
    const p = testPath.replace(/\/+$/, '') || '/';
    const meta = ROUTES[p];
    const hl = HREFLANGS[p];
    return new Response(JSON.stringify({
      worker_version: '4.0-prerender-io',
      deployed: true,
      test_path: p,
      route_found: !!meta,
      meta: meta || null,
      canonical: BASE_URL + p,
      hreflang: hl || null,
      lang: detectLang(p),
      total_routes: Object.keys(ROUTES).length,
      prerender_enabled: true,
    }, null, 2), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }

  // ── Bots → Prerender.io (with fallback to generated HTML) ─────────
  // Prerender.io renders the full SPA with headless Chrome, so bots
  // get the complete page with React-rendered content, meta tags, etc.
  // X-Prerender header check prevents infinite loops (Prerender.io
  // sets this header when fetching the original page).
  if (isGetLike && isBotReq && !xPrerender && !isIgnoredExtension(url.pathname)) {
    try {
      // Request fully-rendered HTML from Prerender.io
      const prerenderResp = await fetchFromPrerender(request.url, request.headers);

      // If Prerender.io returns a valid response, use it
      if (prerenderResp.ok) {
        const html = await prerenderResp.text();
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'X-Robots-Tag': 'index, follow',
            'X-Prerender-Source': 'prerender.io',
          },
        });
      }

      // Prerender.io returned an error — fall back to generated HTML
      console.log(`Prerender.io returned ${prerenderResp.status} for ${url.pathname}, using fallback`);
    } catch (err) {
      // Prerender.io is unreachable — fall back to generated HTML
      console.log(`Prerender.io fetch failed for ${url.pathname}: ${err.message}`);
    }

    // Fallback: serve generated HTML with correct meta tags
    const fallbackHtml = generateFallbackHtml(url.pathname);
    return new Response(fallbackHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'index, follow',
        'X-Prerender-Source': 'fallback',
      },
    });
  }

  // ── Normal users → Lovable upstream ───────────────────────────────
  const resp = await fetchFromLovable(request, url, isGetLike);

  if (isRedirect(resp.status)) {
    const upstreamBase = new URL(LOVABLE_UPSTREAM);
    const loc = resp.headers.get("Location") || "";
    let newLoc = loc.replaceAll(upstreamBase.hostname, PUBLIC_HOST);
    newLoc = newLoc.replace(/^http:\/\//i, "https://");
    const newHeaders = new Headers(resp.headers);
    if (loc) newHeaders.set("Location", newLoc);
    return new Response(resp.body, { status: resp.status, headers: newHeaders });
  }

  return resp;
}

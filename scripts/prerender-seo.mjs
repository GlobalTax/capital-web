/**
 * Post-build SEO Pre-rendering Script
 *
 * Problem: Ahrefs (and other crawlers that don't execute JS) see the same
 * static index.html for all routes in this SPA, causing:
 * - 108 "duplicate content" issues
 * - All pages showing homepage title/description/canonical
 * - 0 hreflang tags detected
 *
 * Solution: After vite build, this script generates individual HTML files
 * for each route (e.g., dist/venta-empresas/index.html) with the correct
 * title, description, canonical, og tags, and hreflang links baked into
 * the static HTML. The React app still loads and hydrates normally.
 *
 * Usage: node scripts/prerender-seo.mjs (run after vite build)
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');
const BASE_URL = 'https://capittal.es';

// Supabase config for fetching blog posts at build time
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fwhqtzkkvnjkazhaficj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I";

// Route meta data - same as the R object in index.html
const routes = {
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
  "/sectores/alimentacion":{t:"M&A Sector Alimentación | Capittal",d:"Operaciones de M&A en el sector alimentario. Producción, distribución y marcas de alimentación en España."},
  "/recursos/blog":{t:"Blog M&A España | Fusiones, Adquisiciones y Valoraciones - Capittal",d:"Artículos sobre fusiones, adquisiciones, valoración de empresas y due diligence. Contenido M&A para empresarios e inversores."},
  "/lp/calculadora":{t:"Calculadora de Valoración de Empresas Gratuita | Capittal",d:"Calcula el valor de tu empresa gratis. Estimación basada en facturación, EBITDA y sector. Valoración orientativa en 2 minutos."},
  "/lp/calculadora-fiscal":{t:"Calculadora Fiscal de Venta de Empresas España | Capittal",d:"Calcula los impuestos de la venta de tu empresa. Simulador fiscal gratuito: impacto en IRPF, Sociedades y plusvalías."},
  "/lp/calculadora-asesores":{t:"Calculadora de Valoración para Asesores | Capittal",d:"Herramienta profesional de valoración para asesores financieros. Múltiplos sectoriales y metodologías avanzadas."},
  "/de-looper-a-capittal":{t:"De Looper a Capittal | Nuestra Historia",d:"La evolución de Looper a Capittal Transacciones. Nuestra historia, visión y compromiso con el mercado M&A español."},
  "/valoracion-empresas":{t:"Valoración de Empresas Online | Capittal",d:"Obtenga una valoración profesional de su empresa. Múltiplos sectoriales, DCF y comparables de mercado."},
  "/oportunidades":{t:"Oportunidades de Inversión | Empresas en Venta | Capittal",d:"Oportunidades de inversión y empresas en venta. Marketplace de operaciones M&A verificadas por Capittal en España."},
  "/politica-privacidad":{t:"Política de Privacidad | Capittal",d:"Política de privacidad y protección de datos de Capittal Transacciones S.L."},
  "/terminos-uso":{t:"Términos de Uso | Capittal",d:"Términos y condiciones de uso del sitio web de Capittal Transacciones."},
  "/cookies":{t:"Política de Cookies | Capittal",d:"Información sobre el uso de cookies en el sitio web de Capittal Transacciones."},
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
  "/servicios/asesoramiento-legal/tecnico":{t:"Asesoramiento Legal Técnico en M&A | Capittal",d:"Soporte jurídico técnico en M&A. Análisis contractual, cumplimiento normativo y cierre de transacciones complejas."},
  // Catalan routes
  "/ca":{t:"Capittal Transaccions - Fusions i Adquisicions a Espanya | M&A Advisory",d:"Assessorament M&A a Barcelona. +70 professionals en venda d'empreses, valoracions i due diligence. Especialistes en mid-market."},
  "/venda-empreses":{t:"Venda d'Empreses a Espanya - Assessorament M&A | Capittal",d:"Vols vendre la teva empresa? Assessorament en venda, valoració i negociació. Procés confidencial amb accés a fons d'inversió."},
  "/contacte":{t:"Contacte - Capittal Transaccions | M&A Barcelona",d:"Contacta amb Capittal. Oficines a Barcelona, Ausiàs March 36. Assessorament en fusions i adquisicions, valoracions i due diligence."},
  "/equip":{t:"Equip de Professionals M&A | Capittal Transaccions",d:"Equip de +70 professionals de Capittal. Experts en fusions i adquisicions, valoracions i due diligence amb seu a Barcelona."},
  "/casos-exit":{t:"Casos d'Èxit - Operacions M&A | Capittal",d:"Operacions tancades amb èxit per Capittal. Venda d'empreses, adquisicions i valoracions en múltiples sectors."},
  "/per-que-triar-nos":{t:"Per Què Triar-nos | Capittal Transaccions",d:"Experiència, metodologia i resultats. Capittal és el teu millor soci en operacions de M&A i valoracions empresarials."},
  "/programa-col-laboradors":{t:"Programa de Col·laboradors | Capittal",d:"Uneix-te a la nostra xarxa de col·laboradors. Refereix operacions de M&A i rep compensació per cada transacció tancada."},
  "/serveis/valoracions":{t:"Valoració d'Empreses - Múltiples EBITDA i DCF | Capittal",d:"Valoració d'empreses: múltiples EBITDA, fluxos de caixa descomptats (DCF) i comparables de mercat. Calculadora gratuïta online."},
  "/serveis/venda-empreses":{t:"Venda d'Empreses a Espanya - Assessorament M&A | Capittal",d:"Assessorament en venda d'empreses. Valoració, negociació i tancament amb accés a fons d'inversió i compradors estratègics."},
  "/serveis/due-diligence":{t:"Due Diligence Financera i Fiscal - M&A Espanya | Capittal",d:"Due diligence financera, fiscal i legal per a compravenda d'empreses. Anàlisi rigurós per a compradors i venedors en M&A."},
  "/serveis/assessorament-legal":{t:"Assessorament Legal en M&A | Capittal",d:"Suport jurídic en fusions i adquisicions. Contractes, due diligence legal i tancament de transaccions a Espanya."},
  "/serveis/reestructuracions":{t:"Reestructuració d'Empreses - Assessorament Financer | Capittal",d:"Assessorament en reestructuracions, refinançament de deute i situacions especials. Solucions financeres per a empreses."},
  "/serveis/planificacio-fiscal":{t:"Planificació Fiscal en Venda d'Empreses | Capittal",d:"Optimització fiscal en compravenda d'empreses. Planificació fiscal pre-venda per maximitzar el valor net de l'operació."},
  "/sectors/tecnologia":{t:"M&A Tecnologia Espanya - Venda Empreses Tech | Capittal",d:"M&A d'empreses tecnològiques: SaaS, ciberseguretat i infraestructura digital. Compradors estratègics i fons tech a Espanya."},
  "/sectors/salut":{t:"M&A Salut Espanya - Venda Empreses Sanitàries | Capittal",d:"M&A en el sector sanitari i healthcare. Operacions amb clíniques, laboratoris i empreses de serveis de salut a Espanya."},
  "/sectors/industrial":{t:"M&A Industrial Espanya - Venda Empreses Industrials | Capittal",d:"Compravenda d'empreses industrials: manufactura, enginyeria i serveis industrials. Fons de Private Equity a Espanya."},
  "/sectors/retail-consum":{t:"M&A Retail i Consum | Capittal",d:"M&A en retail i consum. Distribució, franquícies, e-commerce i marques de consum a Espanya."},
  "/sectors/energia":{t:"M&A Energia Espanya - Venda Empreses Energètiques | Capittal",d:"Compravenda d'empreses del sector energètic. Renovables, infraestructura energètica i serveis relacionats a Espanya."},
  "/sectors/seguretat":{t:"M&A Seguretat Privada Espanya | Capittal",d:"M&A en seguretat privada. Venda d'empreses d'alarmes, vigilància i serveis auxiliars. Experts en el sector a Espanya."},
  "/sectors/construccio":{t:"M&A Sector Construcció | Capittal",d:"M&A en construcció i infraestructures a Espanya. Promotores, constructores i enginyeria civil."},
  "/sectors/alimentacio":{t:"M&A Sector Alimentació | Capittal",d:"M&A en el sector alimentari. Producció, distribució i marques d'alimentació a Espanya."},
  "/sectors/logistica":{t:"M&A Sector Logística | Capittal",d:"Fusions i adquisicions en logística i transport. Distribució, emmagatzematge i cadena de subministrament."},
  "/sectors/medi-ambient":{t:"M&A Sector Medi Ambient | Capittal",d:"M&A en medi ambient. Gestió de residus, tractament d'aigües i sostenibilitat a Espanya."},
  // English routes
  "/en":{t:"Capittal - Mergers & Acquisitions Advisory in Spain",d:"M&A advisory firm in Barcelona. 70+ professionals in company sales, valuations and due diligence across Spain."},
  "/sell-companies":{t:"Sell Your Company in Spain - M&A Advisory | Capittal",d:"Looking to sell your company? Professional M&A advisory. Confidential process with access to PE funds and international buyers."},
  "/buy-companies":{t:"Buy Companies in Spain - Buy-Side Advisory | Capittal",d:"Buy-side advisory for PE funds and corporate investors. Target identification, valuation and due diligence across Spain."},
  "/contact":{t:"Contact - Capittal | M&A Barcelona",d:"Get in touch with Capittal. Offices in Barcelona, Ausiàs March 36. Advisory in mergers and acquisitions, valuations and due diligence."},
  "/success-stories":{t:"Success Stories - M&A Transactions | Capittal",d:"Completed M&A transactions by Capittal. Company sales, acquisitions and valuations across multiple sectors in Spain."},
  "/why-choose-us":{t:"Why Choose Us | Capittal M&A Advisory",d:"Experience, methodology and results. Discover why Capittal is your best partner for M&A transactions and valuations in Spain."},
  "/collaborators-program":{t:"Collaborators Program | Capittal",d:"Join our collaborator network. Refer M&A opportunities and receive compensation for every closed transaction with Capittal."},
  "/partners-program":{t:"Partners Program | Capittal M&A Advisory",d:"Partner with Capittal. Strategic alliances for financial advisors, law firms and consulting firms in M&A deal referrals."},
  "/services/valuations":{t:"Business Valuation Services - EBITDA Multiples & DCF | Capittal",d:"Business valuation: EBITDA multiples, discounted cash flows (DCF) and market comparables. Free online valuation calculator."},
  "/services/sell-companies":{t:"Sell-Side M&A Advisory in Spain | Capittal",d:"Sell-side advisory for business owners. Valuation, buyer identification and negotiation. Confidential process with global reach."},
  "/services/due-diligence":{t:"Financial & Tax Due Diligence - M&A Spain | Capittal",d:"Financial, tax and legal due diligence for M&A transactions. Rigorous analysis for buyers and sellers in acquisitions."},
  "/services/legal-advisory":{t:"Legal Advisory in M&A | Capittal",d:"Legal support for mergers and acquisitions. Contract negotiation, legal due diligence and transaction closing across Spain."},
  "/services/restructuring":{t:"Business Restructuring Advisory | Capittal",d:"Corporate restructuring, debt refinancing and special situations. Financial solutions for companies facing challenges in Spain."},
  "/services/tax-planning":{t:"Tax Planning for Company Sales | Capittal",d:"Tax optimization for company sales. Pre-sale tax planning to maximize net proceeds. Specialized M&A tax advisory in Spain."},
  "/sectors/technology":{t:"M&A Technology Spain - Tech Company Sales | Capittal",d:"M&A advisory for tech companies in Spain. SaaS, cybersecurity and digital infrastructure acquisitions."},
  "/sectors/healthcare":{t:"M&A Healthcare Spain - Health Company Sales | Capittal",d:"M&A in the healthcare sector in Spain. Transactions with clinics, laboratories and healthcare services companies."},
  "/sectors/retail-consumer":{t:"M&A Retail & Consumer Spain | Capittal",d:"M&A in retail and consumer sectors. Distribution, franchises, e-commerce and consumer brands across Spain."},
  "/sectors/energy":{t:"M&A Energy Spain - Energy Company Sales | Capittal",d:"M&A for energy sector companies in Spain. Renewables, energy infrastructure and related services acquisitions."},
  "/sectors/security":{t:"M&A Private Security Spain | Capittal",d:"M&A in private security. Advisory for alarm companies, surveillance firms and auxiliary services in Spain."},
};

// Hreflang mappings - maps each route to its language variants
const hreflangs = {
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
  "/serveis/valoracions":{es:"/servicios/valoraciones",ca:"/serveis/valoracions",en:"/services/valuations"},
  "/services/valuations":{es:"/servicios/valoraciones",ca:"/serveis/valoracions",en:"/services/valuations"},
  "/servicios/venta-empresas":{es:"/servicios/venta-empresas",ca:"/serveis/venda-empreses",en:"/services/sell-companies"},
  "/serveis/venda-empreses":{es:"/servicios/venta-empresas",ca:"/serveis/venda-empreses",en:"/services/sell-companies"},
  "/services/sell-companies":{es:"/servicios/venta-empresas",ca:"/serveis/venda-empreses",en:"/services/sell-companies"},
  "/servicios/due-diligence":{es:"/servicios/due-diligence",ca:"/serveis/due-diligence",en:"/services/due-diligence"},
  "/serveis/due-diligence":{es:"/servicios/due-diligence",ca:"/serveis/due-diligence",en:"/services/due-diligence"},
  "/services/due-diligence":{es:"/servicios/due-diligence",ca:"/serveis/due-diligence",en:"/services/due-diligence"},
  "/servicios/asesoramiento-legal":{es:"/servicios/asesoramiento-legal",ca:"/serveis/assessorament-legal",en:"/services/legal-advisory"},
  "/serveis/assessorament-legal":{es:"/servicios/asesoramiento-legal",ca:"/serveis/assessorament-legal",en:"/services/legal-advisory"},
  "/services/legal-advisory":{es:"/servicios/asesoramiento-legal",ca:"/serveis/assessorament-legal",en:"/services/legal-advisory"},
  "/servicios/reestructuraciones":{es:"/servicios/reestructuraciones",ca:"/serveis/reestructuracions",en:"/services/restructuring"},
  "/serveis/reestructuracions":{es:"/servicios/reestructuraciones",ca:"/serveis/reestructuracions",en:"/services/restructuring"},
  "/services/restructuring":{es:"/servicios/reestructuraciones",ca:"/serveis/reestructuracions",en:"/services/restructuring"},
  "/servicios/planificacion-fiscal":{es:"/servicios/planificacion-fiscal",ca:"/serveis/planificacio-fiscal",en:"/services/tax-planning"},
  "/serveis/planificacio-fiscal":{es:"/servicios/planificacion-fiscal",ca:"/serveis/planificacio-fiscal",en:"/services/tax-planning"},
  "/services/tax-planning":{es:"/servicios/planificacion-fiscal",ca:"/serveis/planificacio-fiscal",en:"/services/tax-planning"},
  "/sectores/tecnologia":{es:"/sectores/tecnologia",ca:"/sectors/tecnologia",en:"/sectors/technology"},
  "/sectors/tecnologia":{es:"/sectores/tecnologia",ca:"/sectors/tecnologia",en:"/sectors/technology"},
  "/sectors/technology":{es:"/sectores/tecnologia",ca:"/sectors/tecnologia",en:"/sectors/technology"},
  "/sectores/healthcare":{es:"/sectores/healthcare",ca:"/sectors/salut",en:"/sectors/healthcare"},
  "/sectors/salut":{es:"/sectores/healthcare",ca:"/sectors/salut",en:"/sectors/healthcare"},
  "/sectores/seguridad":{es:"/sectores/seguridad",ca:"/sectors/seguretat",en:"/sectors/security"},
  "/sectors/seguretat":{es:"/sectores/seguridad",ca:"/sectors/seguretat",en:"/sectors/security"},
  "/sectors/security":{es:"/sectores/seguridad",ca:"/sectors/seguretat",en:"/sectors/security"},
  "/sectores/energia":{es:"/sectores/energia",ca:"/sectors/energia",en:"/sectors/energy"},
  "/sectors/energia":{es:"/sectores/energia",ca:"/sectors/energia",en:"/sectors/energy"},
  "/sectors/energy":{es:"/sectores/energia",ca:"/sectors/energia",en:"/sectors/energy"},
  "/sectores/industrial":{es:"/sectores/industrial",ca:"/sectors/industrial"},
  "/sectors/industrial":{es:"/sectores/industrial",ca:"/sectors/industrial"},
  "/sectores/retail-consumer":{es:"/sectores/retail-consumer",ca:"/sectors/retail-consum",en:"/sectors/retail-consumer"},
  "/sectors/retail-consum":{es:"/sectores/retail-consumer",ca:"/sectors/retail-consum",en:"/sectors/retail-consumer"},
  "/sectores/construccion":{es:"/sectores/construccion",ca:"/sectors/construccio"},
  "/sectors/construccio":{es:"/sectores/construccion",ca:"/sectors/construccio"},
  "/sectores/alimentacion":{es:"/sectores/alimentacion",ca:"/sectors/alimentacio"},
  "/sectors/alimentacio":{es:"/sectores/alimentacion",ca:"/sectors/alimentacio"},
  "/sectores/logistica":{es:"/sectores/logistica",ca:"/sectors/logistica"},
  "/sectors/logistica":{es:"/sectores/logistica",ca:"/sectors/logistica"},
  "/sectores/medio-ambiente":{es:"/sectores/medio-ambiente",ca:"/sectors/medi-ambient"},
  "/sectors/medi-ambient":{es:"/sectores/medio-ambiente",ca:"/sectors/medi-ambient"},
};

// Detect html lang from route
function detectLang(route) {
  if (route.startsWith('/ca') || route.startsWith('/sectors/') || route.startsWith('/serveis/') ||
      route.startsWith('/venda-') || route === '/contacte' || route === '/equip' ||
      route === '/casos-exit' || route === '/per-que-triar-nos' || route.startsWith('/programa-col')) {
    return 'ca';
  }
  if (route.startsWith('/en') || route.startsWith('/sell-') || route.startsWith('/buy-') ||
      route === '/contact' || route === '/success-stories' || route === '/why-choose-us' ||
      route.startsWith('/collaborators-') || route.startsWith('/partners-') ||
      route.startsWith('/services/')) {
    return 'en';
  }
  return 'es';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Generate route-specific noscript content so crawlers see unique body per page
function generateNoscriptContent(routePath, meta) {
  const title = escapeHtml(meta.t);
  const desc = escapeHtml(meta.d);
  const nav = `
      <header>
        <nav>
          <a href="/">Capittal</a>
          <a href="/venta-empresas">Venta de Empresas</a>
          <a href="/compra-empresas">Compra de Empresas</a>
          <a href="/servicios/valoraciones">Valoraciones</a>
          <a href="/contacto">Contacto</a>
        </nav>
      </header>`;

  return `<noscript>${nav}
      <main>
        <h1>${title}</h1>
        <p>${desc}</p>
      </main>
      <footer>
        <p>&copy; Capittal Transacciones S.L.</p>
      </footer>
    </noscript>`;
}

function generateHtmlForRoute(templateHtml, routePath, meta) {
  let html = templateHtml;
  const canonicalUrl = BASE_URL + routePath;
  const lang = detectLang(routePath);

  // Replace <html lang="es"> with correct language
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(meta.t)}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escapeHtml(meta.d)}">`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace og:url
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );

  // Replace og:title
  html = html.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${escapeHtml(meta.t)}">`
  );

  // Replace twitter:title
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${escapeHtml(meta.t)}">`
  );

  // Replace og:description
  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${escapeHtml(meta.d)}">`
  );

  // Replace twitter:description
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${escapeHtml(meta.d)}">`
  );

  // Replace body noscript content with route-specific content
  // This prevents all pages from showing the same homepage H1/H2/body to crawlers
  // Target the noscript block that contains <header> (body SEO content), not the font fallback one
  html = html.replace(
    /<noscript>\s*<header>[\s\S]*?<\/noscript>/,
    generateNoscriptContent(routePath, meta)
  );

  // Add hreflang links before </head>
  const hl = hreflangs[routePath];
  if (hl) {
    let hreflangTags = '\n    <!-- Hreflang alternate links -->\n';
    for (const [hrefLang, hrefPath] of Object.entries(hl)) {
      hreflangTags += `    <link rel="alternate" hreflang="${hrefLang}" href="${BASE_URL}${hrefPath}" />\n`;
    }
    // Add x-default pointing to Spanish variant
    const xDefaultPath = hl.es || routePath;
    hreflangTags += `    <link rel="alternate" hreflang="x-default" href="${BASE_URL}${xDefaultPath}" />\n`;

    html = html.replace('</head>', hreflangTags + '  </head>');
  }

  return html;
}

/**
 * Generate a neutral SPA fallback HTML (200.html / 404.html)
 *
 * When the hosting platform uses SPA catch-all routing, ALL unknown routes
 * get served this file. If it contained the homepage title/canonical/description,
 * crawlers like Ahrefs would report 100+ pages as duplicates of the homepage.
 *
 * This fallback has:
 * - NO canonical tag (prevents wrong canonical pointing to homepage)
 * - A generic, non-route-specific title
 * - NO og:url (prevents wrong og:url)
 * - Minimal noscript content (no homepage H1/H2)
 * - The inline JS script still runs and sets correct meta for JS-capable crawlers
 */
function generateSpaFallback(templateHtml) {
  let html = templateHtml;

  // Remove canonical tag entirely - the inline JS will set it dynamically
  // This prevents Ahrefs from seeing canonical=homepage on all SPA-fallback pages
  html = html.replace(
    /\s*<link rel="canonical" href="[^"]*" \/>/,
    ''
  );

  // Remove og:url - same reason, wrong og:url causes duplicate signals
  html = html.replace(
    /\s*<meta property="og:url" content="[^"]*" \/>/,
    ''
  );

  // Set a generic title that won't match any specific page's title
  // This way Ahrefs won't flag it as "duplicate title" with any real page
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>Capittal Transacciones</title>`
  );

  // Set generic og:title and twitter:title
  html = html.replace(
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="Capittal Transacciones">`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="Capittal Transacciones">`
  );

  // Set a generic description
  const genericDesc = 'Capittal Transacciones - Firma de asesoramiento en fusiones y adquisiciones en España.';
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${genericDesc}">`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${genericDesc}">`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${genericDesc}">`
  );

  // Replace noscript with minimal content (no homepage-specific H1/content)
  html = html.replace(
    /<noscript>\s*<header>[\s\S]*?<\/noscript>/,
    `<noscript>
      <header>
        <nav>
          <a href="/">Capittal</a>
          <a href="/venta-empresas">Venta de Empresas</a>
          <a href="/compra-empresas">Compra de Empresas</a>
          <a href="/servicios/valoraciones">Valoraciones</a>
          <a href="/contacto">Contacto</a>
        </nav>
      </header>
      <main>
        <p>Cargando...</p>
      </main>
    </noscript>`
  );

  // Add noindex to prevent SPA fallback from being indexed as a page
  // Real pages have their own pre-rendered HTML with correct meta
  html = html.replace(
    '</head>',
    '    <meta name="robots" content="noindex, nofollow" />\n  </head>'
  );

  return html;
}

// Fetch published blog posts from Supabase to pre-render their pages
async function fetchBlogPosts() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,excerpt,meta_description&is_published=eq.true&order=published_at.desc`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('⚠️  Could not fetch blog posts for pre-rendering:', e.message);
    return [];
  }
}

async function main() {
  // Check dist exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run "vite build" first.');
    process.exit(1);
  }

  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ dist/index.html not found.');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  let count = 0;

  // === STEP 0: Generate neutral SPA fallback BEFORE modifying any files ===
  // This is critical: when hosting uses SPA catch-all routing, ALL routes without
  // a pre-rendered file get served this fallback. Without it, the hosting would
  // serve index.html (with homepage title/canonical) for all unknown routes,
  // causing Ahrefs to report 100+ duplicate pages with homepage meta.
  const fallbackHtml = generateSpaFallback(templateHtml);
  const fallback200Path = path.join(DIST_DIR, '200.html');
  const fallback404Path = path.join(DIST_DIR, '404.html');
  fs.writeFileSync(fallback200Path, fallbackHtml, 'utf-8');
  fs.writeFileSync(fallback404Path, fallbackHtml, 'utf-8');
  console.log('  🛡️  Generated 200.html + 404.html (neutral SPA fallback, no homepage meta)');

  // Fetch blog posts and add them to routes dynamically
  const blogPosts = await fetchBlogPosts();
  console.log(`  📝 Fetched ${blogPosts.length} blog posts for pre-rendering`);
  for (const post of blogPosts) {
    const blogRoute = `/recursos/blog/${post.slug}`;
    if (!routes[blogRoute]) {
      const blogTitle = post.title
        ? `${post.title} | Blog M&A - Capittal`
        : `Blog M&A España | Capittal`;
      const blogDesc = post.meta_description || post.excerpt ||
        `Artículo sobre fusiones, adquisiciones y valoración de empresas. Contenido M&A especializado por Capittal.`;
      routes[blogRoute] = { t: blogTitle, d: blogDesc };
    }
  }

  // First, update the root index.html with homepage meta
  const homeMeta = routes['/'];
  if (homeMeta) {
    const homeHtml = generateHtmlForRoute(templateHtml, '/', homeMeta);
    fs.writeFileSync(templatePath, homeHtml, 'utf-8');
    count++;
    console.log(`  ✅ / (root index.html updated)`);
  }

  // Generate HTML for each non-root route
  for (const [routePath, meta] of Object.entries(routes)) {
    if (routePath === '/') continue;

    const dirPath = path.join(DIST_DIR, routePath);
    const filePath = path.join(dirPath, 'index.html');

    // Don't overwrite if directory already has a file (e.g., from static assets)
    // But do create new directories for SPA routes
    fs.mkdirSync(dirPath, { recursive: true });

    const html = generateHtmlForRoute(templateHtml, routePath, meta);
    fs.writeFileSync(filePath, html, 'utf-8');
    count++;
  }

  console.log(`\n🎉 Pre-rendered ${count} pages with unique SEO meta tags.`);
  console.log('   Each page now has correct: title, description, canonical, og tags, and hreflang links.');
  console.log('   SPA fallback (200.html/404.html) has neutral meta to prevent duplicate content.');
}

main().catch(err => {
  console.error('❌ Pre-rendering failed:', err);
  process.exit(1);
});

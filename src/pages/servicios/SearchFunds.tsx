import { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import {
  getOrganizationSchema,
  getWebPageSchema,
  getFAQSchema,
  getBreadcrumbSchema,
  getHowToSchema,
  getProfessionalServiceSchema
} from '@/utils/seo/schemas';
import {
  SearchFundsHero,
  SearchFundsWhatAre,
  SearchFundsWhyCapittal,
  SearchFundsForSellers,
  SearchFundsForSearchers,
  SearchFundsProcess,
  SearchFundsFAQ,
  SearchFundsCTA,
  SearchFundsComparison,
  SearchFundsFitCalculator,
  SearchFundsTestimonials,
  SearchFundsResources,
  SearchFundsVideo,
  SearchFundsOperationsGrid
} from '@/components/search-funds';

const SEO_CONFIG = {
  title: 'Search Funds España | Vende tu Empresa a Emprendedores | Capittal',
  description: 'Conectamos tu empresa con Search Funds en España. Emprendedores de élite de IESE y ESADE buscan adquirir pymes rentables. Valoración gratuita y confidencial.',
  canonical: 'https://capittal.es/servicios/search-funds',
  keywords: 'search funds españa, venta empresa search fund, searcher empresas, adquisición pymes, compra venta empresas, M&A españa, sucesión empresarial, vender empresa a emprendedor, search fund IESE, inversión en pymes, venta negocio familiar, emprendimiento por adquisición'
};

// Complete FAQ data for both UI and structured data (10 questions)
const FAQ_DATA = [
  {
    question: "¿Qué diferencia a un Search Fund de un Private Equity?",
    answer: "Los Search Funds son emprendedores individuales (o en pareja) que buscan una sola empresa para adquirir y dirigir personalmente durante 5-7 años. El Private Equity son fondos que invierten en múltiples empresas, con un horizonte más corto (3-5 años) y gestores profesionales que no se involucran en el día a día. Los Search Funds suelen ofrecer un trato más personal y un compromiso más largo con la empresa."
  },
  {
    question: "¿Cuánto paga un Search Fund por una empresa?",
    answer: "Los múltiplos típicos oscilan entre 4x y 7x EBITDA, dependiendo del sector, crecimiento y calidad del negocio. Son valoraciones de mercado, similares o incluso superiores a otros compradores. Los Search Funds buscan empresas de calidad, no gangas."
  },
  {
    question: "¿Qué pasa con mis empleados después de la venta?",
    answer: "Los Search Funds suelen mantener al equipo existente porque necesitan la continuidad operativa. El Searcher se convierte en CEO pero depende del conocimiento del equipo para tener éxito. Es uno de los compradores más seguros para la plantilla."
  },
  {
    question: "¿Puedo seguir involucrado después de vender?",
    answer: "Sí, es muy común. Muchos vendedores permanecen como advisors, mantienen una participación minoritaria o tienen un período de transición de 1-2 años. La estructura se negocia según tus preferencias."
  },
  {
    question: "¿Cómo sé si un Searcher es serio?",
    answer: "Capittal verifica: 1) Que tenga capital comprometido de inversores reconocidos, 2) Su formación y experiencia profesional, 3) Referencias de sus inversores o mentores, 4) Historial de comportamiento profesional en otras negociaciones. No presentamos Searchers que no pasen nuestro filtro."
  },
  {
    question: "¿Cuánto tarda el proceso de venta a un Search Fund?",
    answer: "Típicamente entre 6 y 12 meses desde el primer contacto hasta el cierre. Esto incluye: negociación inicial (1-2 meses), due diligence (2-3 meses), documentación legal (1-2 meses) y cierre. Es similar a una venta tradicional pero el trato es más directo."
  },
  {
    question: "¿Qué sectores interesan a los Search Funds?",
    answer: "Prefieren sectores estables y no cíclicos: servicios empresariales (B2B), tecnología/software, salud, manufactura especializada, distribución, educación. Evitan sectores muy regulados, muy cíclicos o con alto riesgo de disrupción tecnológica."
  },
  {
    question: "¿Cuánto cobra Capittal por este servicio?",
    answer: "Trabajamos con una estructura de éxito (success fee) alineada con tus intereses: solo cobramos si la operación se cierra. La valoración inicial es gratuita. Contacta con nosotros para conocer los detalles según el tamaño de tu operación."
  },
  {
    question: "¿Soy Searcher, cómo puedo acceder a vuestro deal flow?",
    answer: "Regístrate a través de nuestro formulario de Searchers. Verificaremos tu perfil (inversores, formación, criterios) y si encajas, te daremos acceso a empresas que cumplan tus criterios. El proceso de verificación tarda 48-72h."
  },
  {
    question: "¿Por qué España es líder europeo en Search Funds?",
    answer: "Varios factores: 1) Tejido empresarial fragmentado con muchas PYMES de calidad, 2) Generación de empresarios baby-boomer sin sucesión, 3) IESE Business School como epicentro formativo, 4) Red de inversores especializados ya establecida, 5) Valoraciones atractivas comparadas con otros mercados europeos."
  }
];

const SearchFunds = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout variant="home">
      <SEOHead
        title={SEO_CONFIG.title}
        description={SEO_CONFIG.description}
        canonical={SEO_CONFIG.canonical}
        keywords={SEO_CONFIG.keywords}
        structuredData={[
          getOrganizationSchema(),
          getWebPageSchema(
            SEO_CONFIG.title,
            SEO_CONFIG.description,
            SEO_CONFIG.canonical
          ),
          getProfessionalServiceSchema(
            'Search Funds España - Venta de Empresas a Emprendedores',
            'Conectamos empresas españolas con Search Funds verificados. Emprendedores de IESE, ESADE e IE buscan adquirir pymes rentables con potencial de crecimiento.',
            'Consultoría M&A para Search Funds'
          ),
          getHowToSchema(
            'Cómo vender tu empresa a un Search Fund en España',
            'Guía paso a paso del proceso de venta de una empresa a un Search Fund, desde la valoración inicial hasta el cierre de la operación.',
            [
              { name: 'Valoración inicial', text: 'Realizamos una valoración gratuita de tu empresa para determinar si encaja con el perfil de Search Funds.' },
              { name: 'Matching cualificado', text: 'Identificamos Searchers verificados cuyos criterios encajan con tu empresa y te los presentamos de forma confidencial.' },
              { name: 'Negociación estructurada', text: 'Facilitamos las conversaciones iniciales, LOI y estructuración del deal protegiendo tus intereses.' },
              { name: 'Due Diligence', text: 'Coordinamos el proceso de due diligence financiero, legal y operativo para ambas partes.' },
              { name: 'Cierre de operación', text: 'Acompañamos hasta la firma del SPA y transferencia, asegurando una transición ordenada.' }
            ]
          ),
          getFAQSchema(FAQ_DATA),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Search Funds', url: 'https://capittal.es/servicios/search-funds' }
          ])
        ]}
      />
      <SearchFundsHero />
      <SearchFundsWhatAre />
      <SearchFundsComparison />
      <SearchFundsOperationsGrid />
      <SearchFundsFitCalculator />
      <SearchFundsWhyCapittal />
      <SearchFundsForSellers />
      <SearchFundsForSearchers />
      <SearchFundsTestimonials />
      <SearchFundsProcess />
      <SearchFundsResources />
      <SearchFundsVideo />
      <SearchFundsFAQ />
      <SearchFundsCTA />
    </UnifiedLayout>
  );
};

export default SearchFunds;

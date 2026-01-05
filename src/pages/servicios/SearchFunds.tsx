import { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import {
  getOrganizationSchema,
  getWebPageSchema,
  getServiceSchema,
  getFAQSchema,
  getBreadcrumbSchema
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
  SearchFundsInstitutions,
  SearchFundsVideo
} from '@/components/search-funds';

const SEO_CONFIG = {
  title: 'Search Funds en España | Capittal - Venta de empresas a emprendedores',
  description: 'Conectamos empresas españolas con Search Funds profesionales. Servicio especializado para empresarios que buscan vender a emprendedores comprometidos con su legado. España #1 en Europa.',
  canonical: 'https://capittal.es/servicios/search-funds',
  keywords: 'search funds españa, venta empresa search fund, searcher empresas, adquisición pymes, compra venta empresas, M&A españa'
};

const FAQ_DATA = [
  {
    question: "¿Qué diferencia a un Search Fund de un Private Equity?",
    answer: "Los Search Funds son emprendedores individuales que buscan una sola empresa para adquirir y dirigir personalmente durante 5-7 años. El Private Equity son fondos que invierten en múltiples empresas, con un horizonte más corto y gestores profesionales."
  },
  {
    question: "¿Cuánto paga un Search Fund por una empresa?",
    answer: "Los múltiplos típicos oscilan entre 4x y 7x EBITDA, dependiendo del sector, crecimiento y calidad del negocio. Son valoraciones de mercado, similares o incluso superiores a otros compradores."
  },
  {
    question: "¿Qué pasa con mis empleados después de la venta?",
    answer: "Los Search Funds suelen mantener al equipo existente porque necesitan la continuidad operativa. El Searcher se convierte en CEO pero depende del conocimiento del equipo para tener éxito."
  },
  {
    question: "¿Cuánto tarda el proceso de venta a un Search Fund?",
    answer: "Típicamente entre 6 y 12 meses desde el primer contacto hasta el cierre. Esto incluye negociación inicial, due diligence, documentación legal y cierre."
  },
  {
    question: "¿Qué sectores interesan a los Search Funds?",
    answer: "Prefieren sectores estables: servicios empresariales B2B, tecnología/software, salud, manufactura especializada, distribución y educación."
  },
  {
    question: "¿Por qué España es líder europeo en Search Funds?",
    answer: "Tejido empresarial fragmentado con muchas PYMES de calidad, generación de empresarios baby-boomer sin sucesión, IESE Business School como epicentro formativo, y valoraciones atractivas."
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
          getServiceSchema(
            'Search Funds - Venta de Empresas a Emprendedores',
            'Servicio especializado en conectar empresas españolas con Search Funds profesionales para operaciones de M&A. España #1 en Europa.',
            'Business Consulting'
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
      <SearchFundsFitCalculator />
      <SearchFundsWhyCapittal />
      <SearchFundsForSellers />
      <SearchFundsForSearchers />
      <SearchFundsTestimonials />
      <SearchFundsProcess />
      <SearchFundsResources />
      <SearchFundsInstitutions />
      <SearchFundsVideo />
      <SearchFundsFAQ />
      <SearchFundsCTA />
    </UnifiedLayout>
  );
};

export default SearchFunds;

import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingBag, Store, Palette, TrendingUp } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';
import { useHreflang } from '@/hooks/useHreflang';
import {
  SectorHeroV2,
  SectorStatsV2,
  SectorMarketInsights,
  SectorExpertiseGrid,
  SectorMethodology,
  SectorCaseStudyV2,
  SectorFAQ,
  SectorCTAV2,
  SectorOperationsGrid
} from '@/components/sector-v2';

const RetailConsumer = () => {
  const location = useLocation();
  useHreflang();

  const heroMetrics = [
    { value: '€320B', label: 'Mercado retail España', trend: '+5.2%' },
    { value: '250+', label: 'Operaciones M&A/año' },
    { value: '6-10x', label: 'Múltiplo EBITDA' },
    { value: '€8M', label: 'Ticket medio operación' }
  ];

  const stats = [
    { 
      value: '€320B', 
      label: 'Mercado Retail', 
      trend: { value: '+5.2%', direction: 'up' as const },
      description: 'Ventas retail totales en España'
    },
    { 
      value: '250+', 
      label: 'Operaciones M&A', 
      trend: { value: '+15%', direction: 'up' as const },
      description: 'Transacciones anuales en retail & consumer'
    },
    { 
      value: '18%', 
      label: 'E-commerce Share', 
      trend: { value: '+3pp', direction: 'up' as const },
      description: 'Penetración del comercio online'
    },
    { 
      value: '€4.5B', 
      label: 'DTC Brands', 
      description: 'Ventas de marcas direct-to-consumer'
    }
  ];

  const marketInsights = {
    description: 'El retail español evoluciona hacia modelos omnicanal y sostenibles. Las marcas nativas digitales ganan cuota mientras el retail tradicional se transforma. La consolidación en franquicias y el interés de private equity en marcas de consumo impulsan la actividad M&A.',
    bulletPoints: [
      'Crecimiento acelerado de marcas DTC y digitally native',
      'Consolidación activa en franquicias (restauración, servicios)',
      'Premium en marcas con propuesta sostenible',
      'Private equity muy activo en consumer brands'
    ],
    insightCards: [
      { title: 'E-commerce', value: '1-3x', description: 'Múltiplo ingresos según márgenes' },
      { title: 'Marcas Premium', value: '8-12x', description: 'EBITDA para marcas con moat' },
      { title: 'Franquicias', value: '6-9x', description: 'Valor según recurrencia de royalties' },
      { title: 'Food & Bev', value: '7-10x', description: 'Premium para categorías en crecimiento' }
    ]
  };

  const expertiseItems = [
    {
      icon: ShoppingBag,
      title: 'E-commerce & DTC',
      description: 'Marcas nativas digitales, marketplaces y plataformas de comercio electrónico.',
      features: ['Unit economics', 'LTV/CAC analysis', 'Valoración de marca']
    },
    {
      icon: Store,
      title: 'Retail Físico',
      description: 'Cadenas de tiendas, franquicias y retail omnicanal.',
      features: ['Same-store sales', 'Análisis de ubicaciones', 'Potencial de expansión']
    },
    {
      icon: Palette,
      title: 'Consumer Brands',
      description: 'Marcas de consumo, alimentación, moda y lifestyle.',
      features: ['Brand equity', 'Canales de distribución', 'Posicionamiento']
    },
    {
      icon: TrendingUp,
      title: 'Food & Beverage',
      description: 'Restauración, food retail y marcas de alimentación.',
      features: ['Análisis de categoría', 'Tendencias de consumo', 'Escalabilidad']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis de Marca',
      description: 'Evaluación de brand equity, posicionamiento y percepción de consumidor.',
      features: ['Brand awareness', 'Net Promoter Score', 'Cuota de mercado', 'Tendencias de categoría']
    },
    {
      number: '2',
      title: 'Due Diligence Comercial',
      description: 'Análisis de canales, clientes, inventario y métricas de retail.',
      features: ['Mix de canales', 'Análisis de clientes', 'Rotación de inventario', 'Márgenes por categoría']
    },
    {
      number: '3',
      title: 'Estrategia de Venta',
      description: 'Identificación de compradores estratégicos y estructuración del deal.',
      features: ['Mapeo de compradores', 'Sinergias de marca', 'Earn-outs', 'Retención de equipo']
    }
  ];

  const caseStudy = {
    companyName: 'Moda Sostenible SA',
    sector: 'Marca de Moda DTC',
    description: 'Asesoramos en la venta del 75% a un grupo de moda europeo. La marca había crecido 100% YoY con excelentes métricas de retención y una comunidad de 500k+ followers.',
    metrics: [
      { value: '€28M', label: 'Valoración' },
      { value: '2.8x', label: 'Múltiplo Ingresos' },
      { value: '6 meses', label: 'Tiempo cierre' }
    ],
    testimonial: {
      quote: 'Capittal nos ayudó a valorar correctamente nuestra marca antes de la expansión internacional. Su expertise en retail y conocimiento de compradores estratégicos fue fundamental.',
      author: 'Ana Martínez',
      role: 'Fundadora'
    }
  };

  const faqs = [
    {
      question: '¿Cómo se valora una marca de consumo?',
      answer: 'Las marcas de consumo se valoran por múltiplo de EBITDA (6-12x según categoría) o ingresos para marcas en crecimiento. Factores clave: brand equity, márgenes, canales de distribución, recurrencia de compra y potencial de expansión. Las marcas con propuesta diferenciada y comunidad activa obtienen premium.'
    },
    {
      question: '¿Qué múltiplos se pagan en e-commerce?',
      answer: 'Los múltiplos en e-commerce varían significativamente: 1-2x ingresos para retailers con márgenes bajos, 2-4x para marcas propias con buenos márgenes, y hasta 6-8x EBITDA para plataformas con recurrencia alta. La eficiencia de CAC y LTV son determinantes.'
    },
    {
      question: '¿Qué tipo de compradores están activos en retail & consumer?',
      answer: 'El mercado atrae a grupos de retail y moda internacionales, fondos de private equity especializados en consumer, holdings de marcas, y cada vez más, corporate ventures de grandes retailers buscando innovación y nuevas categorías.'
    },
    {
      question: '¿Cómo afecta el canal de venta a la valoración?',
      answer: 'El mix de canales es crucial: las ventas DTC (direct-to-consumer) se valoran más que wholesale porque ofrecen mejores márgenes, datos de cliente y control de marca. Un modelo omnicanal equilibrado suele maximizar valor.'
    },
    {
      question: '¿Es importante la sostenibilidad para la valoración?',
      answer: 'Cada vez más. Las marcas con propuesta ESG auténtica (materiales sostenibles, producción ética, economía circular) obtienen primas de valoración del 10-20% y atraen a más compradores estratégicos. Los consumidores y inversores premian la sostenibilidad.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas Retail y Consumer - M&A Retail | Capittal"
        description="Expertos en M&A retail: e-commerce, marcas de consumo, franquicias, food & beverage. +250 operaciones anuales en retail en España."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="valoración empresas retail, M&A e-commerce, vender marca consumo, valoración franquicias"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas Retail y Consumer",
            "Servicios especializados de M&A y valoración para empresas del sector retail y consumo",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Retail & Consumer",
            "Especialización en M&A y valoración de empresas de retail",
            "https://capittal.es/sectores/retail-consumer"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Retail & Consumer"
        title="Expertos en M&A del Sector Retail"
        description="Asesoramiento especializado en valoración y venta de marcas de consumo. Conocimiento profundo de e-commerce, retail omnicanal y tendencias de consumidor."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Retail en Cifras"
        subtitle="El retail español se transforma hacia modelos digitales y sostenibles"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Retail"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores de retail y consumo"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Retail"
        subtitle="Un proceso adaptado a las particularidades del sector de consumo"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid sectorKey="retail" />
      
      <SectorCaseStudyV2
        title="Caso de Éxito Retail"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="slate"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Retail"
        subtitle="Resolvemos las dudas más habituales sobre M&A en el sector retail"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes una marca o negocio retail?"
        description="Obtén una valoración confidencial de tu marca, e-commerce o cadena de retail. Nuestros expertos en consumo te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default RetailConsumer;

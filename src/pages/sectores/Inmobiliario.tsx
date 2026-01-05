import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Building, Home, Warehouse, MapPin } from 'lucide-react';
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
  SectorCTAV2
} from '@/components/sector-v2';

const Inmobiliario = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€15B', label: 'Inversión inmob. España', trend: '+12%' },
    { value: '320+', label: 'Operaciones M&A/año' },
    { value: '15-20x', label: 'Múltiplo rentas prime' },
    { value: '€18M', label: 'Ticket medio operación' }
  ];

  const stats = [
    { 
      value: '€15B', 
      label: 'Inversión Inmobiliaria', 
      trend: { value: '+12%', direction: 'up' as const },
      description: 'Inversión institucional anual en España'
    },
    { 
      value: '320+', 
      label: 'Operaciones M&A', 
      trend: { value: '+8%', direction: 'up' as const },
      description: 'Transacciones anuales en real estate'
    },
    { 
      value: '4.5%', 
      label: 'Yield Prime Oficinas', 
      trend: { value: '-20bps', direction: 'down' as const },
      description: 'Rentabilidad oficinas CBD Madrid'
    },
    { 
      value: '€2.1B', 
      label: 'PropTech Investment', 
      description: 'Inversión en tecnología inmobiliaria'
    }
  ];

  const marketInsights = {
    description: 'El mercado inmobiliario español atrae capital institucional global, especialmente en logística, residencial en alquiler y activos alternativos. La profesionalización del sector y los yields atractivos vs norte de Europa impulsan la actividad inversora.',
    bulletPoints: [
      'España entre los top 5 mercados europeos de inversión inmobiliaria',
      'Logística y residencial lideran el interés inversor',
      'Creciente peso de activos alternativos (senior living, student housing)',
      'PropTech español atrayendo inversión significativa'
    ],
    insightCards: [
      { title: 'Logística', value: '18-22x', description: 'Múltiplo rentas para activos last-mile' },
      { title: 'Oficinas Prime', value: '15-18x', description: 'CBD Madrid y Barcelona' },
      { title: 'Residencial BTR', value: '20-25x', description: 'Build to Rent en ubicaciones prime' },
      { title: 'Retail', value: '10-14x', description: 'Activos high street seleccionados' }
    ]
  };

  const expertiseItems = [
    {
      icon: Building,
      title: 'Oficinas & Comercial',
      description: 'Valoración de edificios de oficinas, centros comerciales y retail high street.',
      features: ['Análisis de contratos', 'Valoración de ubicación', 'Potencial de reposicionamiento']
    },
    {
      icon: Warehouse,
      title: 'Logística & Industrial',
      description: 'Naves logísticas, plataformas de distribución y activos industriales.',
      features: ['Last-mile delivery', 'Cross-docking', 'Contratos con operadores']
    },
    {
      icon: Home,
      title: 'Residencial',
      description: 'Build to Rent, promoción residencial y carteras de viviendas.',
      features: ['Análisis de yields', 'Potencial de desarrollo', 'Gestión de alquileres']
    },
    {
      icon: MapPin,
      title: 'Alternativos',
      description: 'Senior living, student housing, data centers y activos especializados.',
      features: ['Operadores especializados', 'Contratos a largo plazo', 'Demografía']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Due Diligence Inmobiliaria',
      description: 'Análisis técnico, legal y urbanístico de los activos.',
      features: ['Estado físico', 'Situación urbanística', 'Cargas y servidumbres', 'Contratos de arrendamiento']
    },
    {
      number: '2',
      title: 'Valoración de Mercado',
      description: 'Análisis comparativo, yields de mercado y potencial de reposicionamiento.',
      features: ['Comparables de mercado', 'Análisis de rentas', 'Capex necesario', 'Potencial de mejora']
    },
    {
      number: '3',
      title: 'Estructuración de Operación',
      description: 'Optimización fiscal y estructuración de la transacción.',
      features: ['Estructuras SOCIMI', 'Sale & leaseback', 'JV structures', 'Financiación']
    }
  ];

  const caseStudy = {
    companyName: 'REIT Europeo',
    sector: 'Portfolio de Oficinas Prime',
    description: 'Asesoramos en la venta de un portfolio de 12 edificios de oficinas en Madrid y Barcelona a un inversor institucional asiático. Superficie total de 85.000m² con ocupación del 94%.',
    metrics: [
      { value: '€650M', label: 'Valoración' },
      { value: '4.8%', label: 'Yield inicial' },
      { value: '10 meses', label: 'Tiempo cierre' }
    ],
    testimonial: {
      quote: 'Capittal nos asesoró en la venta de nuestro portfolio de €650M. Su conocimiento del mercado inmobiliario español y su red de contactos con inversores internacionales fue excepcional.',
      author: 'Roberto Silva',
      role: 'Director General'
    }
  };

  const faqs = [
    {
      question: '¿Cómo se valora un activo inmobiliario para M&A?',
      answer: 'Los activos inmobiliarios se valoran principalmente por yield (rentabilidad) sobre rentas de mercado. Para oficinas prime en Madrid, los yields están en 4.5-5.5%, lo que implica múltiplos de 18-22x rentas. También se considera el potencial de mejora de rentas, capex necesario y posición competitiva del activo.'
    },
    {
      question: '¿Qué estructura es mejor para vender activos inmobiliarios?',
      answer: 'Depende del perfil del vendedor y comprador. Las SOCIMIs ofrecen ventajas fiscales para grandes carteras. Los sale & leaseback permiten monetizar inmuebles manteniendo uso. Las JV son útiles para desarrollos. Analizamos cada caso para recomendar la estructura óptima.'
    },
    {
      question: '¿Qué tipo de inversores compran inmobiliario en España?',
      answer: 'El mercado español atrae a fondos soberanos, fondos de pensiones, REITs internacionales, family offices, y private equity inmobiliario. Los inversores asiáticos y norteamericanos están especialmente activos en logística y oficinas prime.'
    },
    {
      question: '¿Cuánto tiempo lleva vender un portfolio inmobiliario?',
      answer: 'El proceso típico dura 6-12 meses para portfolios medianos. Activos individuales pueden cerrarse en 3-6 meses. La due diligence técnica y legal es intensiva. La preparación previa del vendor due diligence puede acelerar significativamente el proceso.'
    },
    {
      question: '¿Cómo afecta la ocupación al valor de un activo?',
      answer: 'La ocupación es crítica: un edificio con 100% ocupación y rentas de mercado maximiza valor. Vacíos significativos (>15%) generan descuentos importantes. Sin embargo, activos con potencial de mejora de rentas pueden valorarse considerando rentas ERV (Estimated Rental Value) tras estabilización.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas Inmobiliarias - M&A Real Estate | Capittal"
        description="Expertos en M&A inmobiliario: oficinas, logística, residencial, retail. +320 operaciones anuales en real estate en España."
        canonical="https://capittal.es/sectores/inmobiliario"
        keywords="valoración empresas inmobiliarias, M&A real estate, vender portfolio inmobiliario, valoración SOCIMI"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas Inmobiliarias",
            "Servicios especializados de M&A y valoración para empresas del sector inmobiliario",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Inmobiliario",
            "Especialización en M&A y valoración de empresas inmobiliarias",
            "https://capittal.es/sectores/inmobiliario"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Inmobiliario"
        title="Expertos en M&A del Sector Real Estate"
        description="Asesoramiento especializado en valoración y venta de activos inmobiliarios. Conocimiento profundo del mercado, inversores institucionales y estructuras óptimas."
        metrics={heroMetrics}
        accentColor="stone"
      />
      
      <SectorStatsV2 
        title="El Sector Inmobiliario en Cifras"
        subtitle="España es uno de los mercados inmobiliarios más atractivos de Europa para inversores institucionales"
        stats={stats}
        accentColor="stone"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Inmobiliario"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="stone"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los segmentos inmobiliarios"
        items={expertiseItems}
        accentColor="stone"
      />
      
      <SectorMethodology
        title="Metodología Específica Real Estate"
        subtitle="Un proceso adaptado a las particularidades del mercado inmobiliario"
        steps={methodologySteps}
        accentColor="stone"
      />
      
      <SectorCaseStudyV2
        title="Caso de Éxito Inmobiliario"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="stone"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Inmobiliario"
        subtitle="Resolvemos las dudas más habituales sobre M&A en el sector real estate"
        faqs={faqs}
        accentColor="stone"
      />
      
      <SectorCTAV2
        title="¿Tienes activos inmobiliarios?"
        description="Obtén una valoración confidencial de tu portfolio, edificio o empresa inmobiliaria. Nuestros expertos en real estate te asesorarán sin compromiso."
        accentColor="stone"
      />
      
      <Footer />
    </div>
  );
};

export default Inmobiliario;

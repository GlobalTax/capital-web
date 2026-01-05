import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Scissors, Package, GraduationCap, Store } from 'lucide-react';
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

const DistribucionCosmeticaProfesional = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€280M', label: 'Mercado core España', trend: '+8.9%' },
    { value: '45+', label: 'Operaciones M&A/año' },
    { value: '6-10x', label: 'Múltiplo EBITDA' },
    { value: '€2.8M', label: 'Ticket medio operación' }
  ];

  const stats = [
    { 
      value: '€280M', 
      label: 'Mercado Distribución', 
      trend: { value: '+8.9%', direction: 'up' as const },
      description: 'Distribución cosmética profesional en España'
    },
    { 
      value: '45+', 
      label: 'Operaciones M&A', 
      trend: { value: '+22%', direction: 'up' as const },
      description: 'Consolidación acelerada del sector'
    },
    { 
      value: '55.000+', 
      label: 'Salones Activos', 
      description: 'Salones de peluquería y estética en España'
    },
    { 
      value: '€450M', 
      label: 'Mercado Ampliado', 
      description: 'Incluyendo servicios y formación'
    }
  ];

  const marketInsights = {
    description: 'El sector de distribución de cosmética profesional en España está en plena consolidación. Los grandes grupos internacionales buscan presencia local mientras que operadores regionales con buena base de clientes son objetivos de adquisición. El canal profesional muestra mayor resiliencia que el consumer.',
    bulletPoints: [
      'Consolidación liderada por grupos como Provalliance y Henkel',
      'E-commerce B2B creciendo +35% anual en el sector',
      'Formación y academias como diferenciador clave',
      'Marcas exclusivas y propias aumentan márgenes'
    ],
    insightCards: [
      { title: 'Cash & Carry', value: '5-7x', description: 'Múltiplo EBITDA distribuidores tradicionales' },
      { title: 'E-commerce B2B', value: '8-12x', description: 'Premium por plataformas digitales' },
      { title: 'Multi-marca', value: '6-8x', description: 'Valoración por portfolio de marcas' },
      { title: 'Con Formación', value: '7-10x', description: 'Premium por academia integrada' }
    ]
  };

  const expertiseItems = [
    {
      icon: Store,
      title: 'Cash & Carry',
      description: 'Distribuidores mayoristas con puntos de venta físicos para profesionales.',
      features: ['Red de puntos de venta', 'Base de clientes', 'Cobertura geográfica']
    },
    {
      icon: Package,
      title: 'E-commerce B2B',
      description: 'Plataformas de venta online especializadas en productos profesionales.',
      features: ['Métricas digitales', 'Recurrencia de compra', 'Logística especializada']
    },
    {
      icon: GraduationCap,
      title: 'Formación & Academia',
      description: 'Centros de formación y academias de peluquería y estética.',
      features: ['Partnerships con marcas', 'Certificaciones', 'Comunidad de alumnos']
    },
    {
      icon: Scissors,
      title: 'Servicios Integrados',
      description: 'Modelos híbridos con distribución, formación y servicios de salón.',
      features: ['Sinergias cruzadas', 'Fidelización', 'Valor añadido']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis de Cartera',
      description: 'Evaluación de portfolio de marcas, acuerdos de distribución y base de clientes.',
      features: ['Exclusividades de marca', 'Concentración de clientes', 'Recurrencia de compra', 'Mix de productos']
    },
    {
      number: '2',
      title: 'Valoración de Activos',
      description: 'Análisis de inventario, puntos de venta, equipamiento de formación y digital.',
      features: ['Inventario valorizado', 'Ubicaciones', 'Plataforma tecnológica', 'Activos formativos']
    },
    {
      number: '3',
      title: 'Estrategia de Consolidación',
      description: 'Identificación de compradores estratégicos en el proceso de consolidación sectorial.',
      features: ['Grupos internacionales', 'Operadores regionales', 'Private equity', 'Sinergias operativas']
    }
  ];

  const caseStudy = {
    companyName: 'Distribuciones ProHair',
    sector: 'Mayorista Cosmética Profesional',
    description: 'Asesoramos en la venta del 100% a un grupo europeo de distribución. La compañía operaba 8 puntos de venta cash & carry y una academia con más de 3.000 salones clientes.',
    metrics: [
      { value: '€4.2M', label: 'Valoración' },
      { value: '7.5x', label: 'Múltiplo EBITDA' },
      { value: '5 meses', label: 'Tiempo cierre' }
    ],
    testimonial: {
      quote: 'Capittal entendió perfectamente las particularidades de nuestro sector. Su conocimiento del mercado de cosmética profesional y su red de contactos con grupos de consolidación fueron decisivos.',
      author: 'María López',
      role: 'Fundadora y Directora General'
    }
  };

  const faqs = [
    {
      question: '¿Cómo se valora un distribuidor de cosmética profesional?',
      answer: 'Los distribuidores se valoran principalmente por múltiplo de EBITDA (6-10x según perfil). Los factores clave son: exclusividades de marcas premium, base de clientes activos, recurrencia de compra, presencia de e-commerce B2B, y si incluye formación/academia. Los distribuidores con marca propia o exclusivas obtienen premium.'
    },
    {
      question: '¿Qué tipo de compradores están activos en el sector?',
      answer: 'El mercado español atrae principalmente a grupos de consolidación europeos (Provalliance, Henkel, Coty), fondos de private equity con estrategias de buy & build en beauty, y operadores regionales fuertes buscando expandir cobertura geográfica. También hay interés de marcas que buscan integración vertical.'
    },
    {
      question: '¿Importa tener tiendas físicas o es mejor solo e-commerce?',
      answer: 'El modelo ideal combina ambos: los puntos de venta físicos (cash & carry) proporcionan relación con el cliente y servicio inmediato, mientras el e-commerce B2B aporta recurrencia y escalabilidad. Los distribuidores omnicanal obtienen las mejores valoraciones.'
    },
    {
      question: '¿Cómo afectan las exclusividades de marca a la valoración?',
      answer: 'Las exclusividades con marcas premium son muy valoradas porque crean barreras de entrada y fidelización. Sin embargo, también generan dependencia. Lo ideal es un mix: algunas exclusivas premium para diferenciación y marca propia/varias marcas para diversificación.'
    },
    {
      question: '¿La formación y academia añade valor?',
      answer: 'Sí, significativamente. Una academia integrada con partnerships de marcas crea múltiples beneficios: ingresos recurrentes, fidelización de futuros profesionales, showcase de productos, y comunidad. Los distribuidores con academia pueden obtener 1-2 puntos extra de múltiplo.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Distribuidoras de Cosmética Profesional | Capittal"
        description="Expertos en M&A de distribución cosmética profesional: mayoristas B2B, productos de peluquería, formación. Consolidación del sector pro hair en España."
        canonical="https://capittal.es/sectores/distribucion-cosmetica-profesional"
        keywords="vender distribuidora cosmética profesional, valoración mayorista peluquería, M&A beauty B2B, consolidación cosmética profesional"
        structuredData={[
          getServiceSchema(
            "Valoración de Distribuidoras de Cosmética Profesional",
            "Servicios especializados de M&A y valoración para distribuidores de productos de peluquería y cosmética profesional",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Distribución Cosmética Profesional",
            "Especialización en M&A de mayoristas de productos de peluquería y beauty B2B",
            "https://capittal.es/sectores/distribucion-cosmetica-profesional"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Cosmética Profesional"
        title="Expertos en M&A de Distribución Beauty B2B"
        description="Asesoramiento especializado en valoración y venta de distribuidoras de cosmética profesional. Conocimiento profundo del sector pro hair y el proceso de consolidación en España."
        metrics={heroMetrics}
        accentColor="pink"
      />
      
      <SectorStatsV2 
        title="El Sector en Cifras"
        subtitle="La distribución de cosmética profesional española está en plena consolidación"
        stats={stats}
        accentColor="pink"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="pink"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los modelos de distribución profesional"
        items={expertiseItems}
        accentColor="pink"
      />
      
      <SectorMethodology
        title="Metodología Específica del Sector"
        subtitle="Un proceso adaptado a las particularidades de la distribución cosmética profesional"
        steps={methodologySteps}
        accentColor="pink"
      />
      
      <SectorCaseStudyV2
        title="Caso de Éxito"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="pink"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes"
        subtitle="Resolvemos las dudas más habituales sobre M&A en cosmética profesional"
        faqs={faqs}
        accentColor="pink"
      />
      
      <SectorCTAV2
        title="¿Tienes un negocio de distribución cosmética profesional?"
        description="Obtén una valoración confidencial de tu distribuidora, cash & carry o academia. Nuestros expertos en el sector te asesorarán sin compromiso."
        accentColor="pink"
      />
      
      <Footer />
    </div>
  );
};

export default DistribucionCosmeticaProfesional;

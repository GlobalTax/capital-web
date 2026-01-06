import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Factory, Truck, Cog, Wrench } from 'lucide-react';
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

const Industrial = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€180B', label: 'PIB industrial España', trend: '+4.1%' },
    { value: '420+', label: 'Operaciones M&A/año' },
    { value: '5-8x', label: 'Múltiplo EBITDA medio' },
    { value: '€3.2M', label: 'Ticket medio operación' }
  ];

  const stats = [
    { 
      value: '€180B', 
      label: 'PIB Industrial', 
      trend: { value: '+4.1%', direction: 'up' as const },
      description: 'Contribución de la industria al PIB español'
    },
    { 
      value: '420+', 
      label: 'Operaciones M&A', 
      trend: { value: '+12%', direction: 'up' as const },
      description: 'Transacciones anuales en sector industrial'
    },
    { 
      value: '2.2M', 
      label: 'Empleos Directos', 
      description: 'Trabajadores en el sector industrial'
    },
    { 
      value: '€45B', 
      label: 'Exportaciones', 
      trend: { value: '+8%', direction: 'up' as const },
      description: 'Exportaciones industriales anuales'
    }
  ];

  const marketInsights = {
    description: 'El sector industrial español vive un momento de transformación impulsado por la digitalización (Industria 4.0), la sostenibilidad y la relocalización de cadenas de suministro. España se posiciona como hub logístico del sur de Europa y atrae inversión en manufactura avanzada.',
    bulletPoints: [
      'Reindustrialización y nearshoring acelerados post-COVID',
      'Inversión récord en automatización y robótica industrial',
      'Consolidación activa en logística, packaging y componentes',
      'Fondos de infraestructuras entrando en activos industriales'
    ],
    insightCards: [
      { title: 'Manufactura', value: '5-7x', description: 'Múltiplo EBITDA para empresas con márgenes estables' },
      { title: 'Logística', value: '7-10x', description: 'Premium por contratos recurrentes y activos' },
      { title: 'Packaging', value: '6-9x', description: 'Alta demanda por sostenibilidad' },
      { title: 'Componentes', value: '5-8x', description: 'Valoración por especialización técnica' }
    ]
  };

  const expertiseItems = [
    {
      icon: Factory,
      title: 'Manufactura',
      description: 'Empresas de fabricación, producción y transformación industrial.',
      features: ['Análisis de capacidad productiva', 'Valoración de maquinaria', 'Eficiencia operativa']
    },
    {
      icon: Truck,
      title: 'Logística y Distribución',
      description: 'Operadores logísticos, almacenaje y distribución especializada.',
      features: ['Valoración de flotas', 'Análisis de contratos', 'Cobertura geográfica']
    },
    {
      icon: Cog,
      title: 'Componentes Industriales',
      description: 'Fabricantes de componentes, piezas y suministros industriales.',
      features: ['Cartera de clientes', 'Capacidad técnica', 'Barreras de entrada']
    },
    {
      icon: Wrench,
      title: 'Servicios Industriales',
      description: 'Mantenimiento, instalaciones y servicios técnicos especializados.',
      features: ['Contratos recurrentes', 'Cualificación técnica', 'Certificaciones']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis de Activos',
      description: 'Valoración detallada de maquinaria, instalaciones y activos físicos industriales.',
      features: ['Inventario de activos', 'Estado de maquinaria', 'Capacidad productiva', 'Mantenimiento preventivo']
    },
    {
      number: '2',
      title: 'Eficiencia Operativa',
      description: 'Evaluación de procesos productivos, cadenas de suministro y márgenes operativos.',
      features: ['Análisis de costes', 'Optimización de procesos', 'Benchmarking sectorial', 'Working capital']
    },
    {
      number: '3',
      title: 'Estrategia Industrial',
      description: 'Identificación de sinergias con compradores industriales y fondos especializados.',
      features: ['Mapeo de compradores', 'Análisis de sinergias', 'Estructuración fiscal', 'Plan de transición']
    }
  ];

  const caseStudy = {
    companyName: 'Industrias Mediterráneo',
    sector: 'Fabricante de Componentes Metálicos',
    description: 'Asesoramos en la venta a un grupo alemán de automoción. La operación incluyó dos plantas productivas con más de 120 empleados y contratos con principales OEMs europeos.',
    metrics: [
      { value: '€12.5M', label: 'Valoración' },
      { value: '6.8x', label: 'Múltiplo EBITDA' },
      { value: '8 meses', label: 'Tiempo cierre' }
    ],
    testimonial: {
      quote: 'La valoración de Capittal nos ayudó a identificar oportunidades de mejora que aumentaron significativamente el valor de nuestra empresa. Su conocimiento del sector industrial fue clave.',
      author: 'Carlos Mendoza',
      role: 'CEO y Fundador'
    }
  };

  const faqs = [
    {
      question: '¿Cómo se valora una empresa industrial?',
      answer: 'Las empresas industriales se valoran principalmente por múltiplo de EBITDA (5-8x según subsector), pero también consideramos el valor de activos fijos (maquinaria, naves), contratos con clientes, eficiencia operativa y potencial de mejora. Los activos inmobiliarios pueden valorarse separadamente.'
    },
    {
      question: '¿Qué tipo de compradores buscan empresas industriales en España?',
      answer: 'El mercado atrae principalmente a grupos industriales europeos (alemanes, franceses, italianos) en busca de expansión, fondos de private equity especializados en buy & build, y competidores nacionales en consolidación. También vemos interés de grupos asiáticos en sectores estratégicos.'
    },
    {
      question: '¿Cuánto vale la maquinaria en la valoración de una empresa industrial?',
      answer: 'La maquinaria se valora a valor de mercado (no contable), considerando estado, antigüedad y vida útil. En empresas rentables, el valor de maquinaria suele representar el 20-40% del enterprise value. En operaciones de turnaround puede pesar más.'
    },
    {
      question: '¿Qué documentación necesito para vender mi empresa industrial?',
      answer: 'Necesitarás: estados financieros de 3-5 años, inventario detallado de activos, contratos principales con clientes y proveedores, licencias y certificaciones (ISO, medioambiente), organigramas, y documentación de propiedad industrial si aplica.'
    },
    {
      question: '¿Cómo afecta la ubicación al valor de una empresa industrial?',
      answer: 'La ubicación es crítica: acceso a infraestructuras (puertos, autovías), disponibilidad de mano de obra cualificada, costes laborales regionales, y normativa medioambiental local. Empresas en polígonos bien conectados pueden alcanzar primas del 10-20%.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas Industriales - M&A Industrial | Capittal"
        description="Expertos en M&A y valoración de empresas industriales: manufactura, logística, componentes. +420 operaciones anuales en sector industrial en España."
        canonical="https://capittal.es/sectores/industrial"
        keywords="valoración empresas industriales, M&A manufactura, vender fábrica, valoración logística"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas Industriales",
            "Servicios especializados de M&A y valoración para empresas del sector industrial",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Industrial",
            "Especialización en M&A y valoración de empresas industriales",
            "https://capittal.es/sectores/industrial"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Industrial"
        title="Expertos en M&A del Sector Industrial"
        description="Asesoramiento especializado en valoración y venta de empresas industriales. Conocimiento profundo de activos físicos, eficiencia operativa y compradores estratégicos."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Industrial en Cifras"
        subtitle="España es la cuarta economía industrial de la UE con un mercado M&A muy activo"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Industrial"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores industriales"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Industrial"
        subtitle="Un proceso adaptado a las particularidades de activos y operaciones industriales"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid sectorKey="industrial" />
      
      <SectorCaseStudyV2
        title="Caso de Éxito Industrial"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="slate"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Industrial"
        subtitle="Resolvemos las dudas más habituales sobre M&A en el sector industrial"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa industrial?"
        description="Obtén una valoración confidencial de tu fábrica, empresa logística o negocio industrial. Nuestros expertos en industria te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default Industrial;

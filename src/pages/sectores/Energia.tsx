import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Zap, Sun, Wind, Leaf } from 'lucide-react';
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

const Energia = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€120B', label: 'Inversión renovables', trend: '+28%' },
    { value: '180+', label: 'Operaciones M&A/año' },
    { value: '10-14x', label: 'Múltiplo EBITDA' },
    { value: '€25M', label: 'Ticket medio operación' }
  ];

  const stats = [
    { 
      value: '€120B', 
      label: 'Inversión Renovables', 
      trend: { value: '+28%', direction: 'up' as const },
      description: 'Inversión acumulada en renovables España'
    },
    { 
      value: '180+', 
      label: 'Operaciones M&A', 
      trend: { value: '+25%', direction: 'up' as const },
      description: 'Transacciones anuales en energía'
    },
    { 
      value: '47%', 
      label: 'Mix Renovable', 
      trend: { value: '+5pp', direction: 'up' as const },
      description: 'Generación eléctrica renovable'
    },
    { 
      value: '85GW', 
      label: 'Capacidad Instalada', 
      description: 'Potencia renovable total en España'
    }
  ];

  const marketInsights = {
    description: 'España lidera la transición energética en Europa, con uno de los mejores recursos solares y eólicos del continente. El objetivo de alcanzar 74% de generación renovable en 2030 impulsa una actividad M&A sin precedentes, atrayendo capital institucional global.',
    bulletPoints: [
      'España entre los top 3 europeos en capacidad solar y eólica',
      'Inversión récord de fondos de infraestructuras en renovables',
      'Creciente demanda de PPAs corporativos acelera desarrollo',
      'Consolidación activa en distribución y servicios energéticos'
    ],
    insightCards: [
      { title: 'Solar FV', value: '10-12x', description: 'Múltiplo EBITDA para plantas con PPA' },
      { title: 'Eólica', value: '12-15x', description: 'Premium por activos operativos' },
      { title: 'Almacenamiento', value: '8-10x', description: 'Valoración emergente por potencial' },
      { title: 'Servicios', value: '6-8x', description: 'O&M y servicios energéticos' }
    ]
  };

  const expertiseItems = [
    {
      icon: Sun,
      title: 'Solar Fotovoltaica',
      description: 'Valoración de plantas solares, proyectos en desarrollo y carteras de PPAs.',
      features: ['Análisis de recurso solar', 'Valoración de PPAs', 'Due diligence técnica']
    },
    {
      icon: Wind,
      title: 'Energía Eólica',
      description: 'Parques eólicos onshore y offshore, proyectos greenfield y repowering.',
      features: ['Análisis de viento', 'Vida útil de activos', 'Contratos de mantenimiento']
    },
    {
      icon: Zap,
      title: 'Almacenamiento',
      description: 'Baterías, almacenamiento híbrido y soluciones de flexibilidad.',
      features: ['Tecnologías emergentes', 'Valoración de servicios auxiliares', 'Hibridación']
    },
    {
      icon: Leaf,
      title: 'Servicios Energéticos',
      description: 'Comercializadoras, O&M, eficiencia energética y movilidad eléctrica.',
      features: ['Contratos recurrentes', 'Valoración de cartera', 'Sinergias operativas']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Due Diligence Técnica',
      description: 'Análisis detallado de recurso energético, tecnología y rendimiento de activos.',
      features: ['Análisis de producción', 'Estado de equipos', 'Permisos y licencias', 'Conexión a red']
    },
    {
      number: '2',
      title: 'Análisis Regulatorio',
      description: 'Evaluación del marco regulatorio, retribución y riesgos de política energética.',
      features: ['Régimen retributivo', 'PPAs y merchant', 'Riesgos regulatorios', 'Fiscalidad']
    },
    {
      number: '3',
      title: 'Valoración y Estructuración',
      description: 'Modelización financiera especializada y estructuración óptima de la transacción.',
      features: ['Project finance', 'Yield compression', 'Tax equity', 'Estructuras híbridas']
    }
  ];

  const caseStudy = {
    companyName: 'Renovables Iberia',
    sector: 'Portfolio Solar Fotovoltaico',
    description: 'Asesoramos en la venta del 100% del portfolio de 200MW en operación a un fondo de infraestructuras nórdico. Incluía 8 plantas con PPAs a largo plazo.',
    metrics: [
      { value: '€380M', label: 'Valoración' },
      { value: '12.5x', label: 'Múltiplo EBITDA' },
      { value: '9 meses', label: 'Tiempo cierre' }
    ],
    testimonial: {
      quote: 'Capittal nos asesoró en la venta de nuestro portfolio de 200MW. Su expertise en energías renovables y su red de contactos con fondos de infraestructuras fue fundamental para el éxito.',
      author: 'Elena Vásquez',
      role: 'CEO'
    }
  };

  const faqs = [
    {
      question: '¿Cómo se valora una planta solar o eólica?',
      answer: 'Las plantas renovables se valoran principalmente por DCF (flujos descontados) considerando producción esperada, precios de energía, costes operativos y vida útil. Los múltiplos de referencia son 10-15x EBITDA para activos con PPA a largo plazo. La calidad del recurso y los contratos de venta son determinantes.'
    },
    {
      question: '¿Qué diferencia hay entre valorar un proyecto en desarrollo vs en operación?',
      answer: 'Los proyectos en desarrollo se valoran por MW de capacidad, típicamente €50-150k/MW según fase de desarrollo. Los activos en operación se valoran por DCF con datos reales de producción y contratos. El descuento por riesgo de desarrollo puede ser del 40-60% vs un activo operativo.'
    },
    {
      question: '¿Qué tipo de compradores están activos en renovables en España?',
      answer: 'El mercado español atrae principalmente a fondos de infraestructuras (Blackrock, Brookfield, Macquarie), utilities europeas en expansión, oil majors en transición energética (Repsol, TotalEnergies), y fondos de pensiones con mandatos ESG.'
    },
    {
      question: '¿Cómo afecta el tipo de contrato PPA a la valoración?',
      answer: 'Los PPAs corporativos a largo plazo (10-15 años) maximizan la valoración al reducir riesgo merchant. Un PPA con contraparte investment grade puede añadir 1-2 puntos de múltiplo EBITDA. Los activos merchant puros se valoran con mayor descuento pero mantienen optionalidad de precios.'
    },
    {
      question: '¿Cuánto tiempo lleva vender un activo renovable?',
      answer: 'El proceso típico dura 6-12 meses para activos en operación. La due diligence técnica, legal y regulatoria es intensiva. Los portfolios grandes o proyectos complejos pueden requerir más tiempo. La preparación previa del data room es clave para acelerar el proceso.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas de Energía y Renovables | Capittal"
        description="Expertos en M&A y valoración de activos energéticos: solar, eólica, almacenamiento. +180 operaciones anuales en renovables en España."
        canonical="https://capittal.es/sectores/energia"
        keywords="valoración empresas energía, M&A renovables, vender planta solar, valoración eólica"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas de Energía",
            "Servicios especializados de M&A y valoración para empresas del sector energético y renovables",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Energía y Renovables",
            "Especialización en M&A y valoración de empresas energéticas",
            "https://capittal.es/sectores/energia"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Energía"
        title="Expertos en M&A del Sector Energético"
        description="Asesoramiento especializado en valoración y venta de activos energéticos. Conocimiento profundo de renovables, regulación y compradores institucionales."
        metrics={heroMetrics}
        accentColor="amber"
      />
      
      <SectorStatsV2 
        title="El Sector Energético en Cifras"
        subtitle="España lidera la transición energética europea con un mercado M&A muy activo"
        stats={stats}
        accentColor="amber"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Energético"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="amber"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores energéticos"
        items={expertiseItems}
        accentColor="amber"
      />
      
      <SectorMethodology
        title="Metodología Específica Energía"
        subtitle="Un proceso adaptado a las particularidades técnicas y regulatorias del sector"
        steps={methodologySteps}
        accentColor="amber"
      />
      
      <SectorCaseStudyV2
        title="Caso de Éxito Energía"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="amber"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Energía"
        subtitle="Resolvemos las dudas más habituales sobre M&A en el sector energético"
        faqs={faqs}
        accentColor="amber"
      />
      
      <SectorCTAV2
        title="¿Tienes activos energéticos?"
        description="Obtén una valoración confidencial de tu planta solar, parque eólico o empresa energética. Nuestros expertos en energía te asesorarán sin compromiso."
        accentColor="amber"
      />
      
      <Footer />
    </div>
  );
};

export default Energia;

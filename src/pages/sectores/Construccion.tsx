import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Building2, Hammer, HardHat, Wrench } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';
import { useHreflang } from '@/hooks/useHreflang';
import {
  SectorHeroV2,
  SectorStatsV2,
  SectorMarketInsights,
  SectorExpertiseGrid,
  SectorMethodology,
  SectorFAQ,
  SectorCTAV2,
  SectorOperationsGrid
} from '@/components/sector-v2';

const Construccion = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€95.000M', label: 'Sector construcción 2024' },
    { value: '+4,5%', label: 'Crecimiento anual' },
    { value: '5-8x', label: 'Múltiplo EBITDA' },
    { value: '400.000+', label: 'Empresas activas' }
  ];

  const stats = [
    { 
      value: '€95.000M', 
      label: 'Facturación Sector', 
      trend: { value: '+4,5%', direction: 'up' as const },
      description: 'Producción del sector construcción en España 2024'
    },
    { 
      value: '1,3M', 
      label: 'Empleados', 
      description: 'Trabajadores directos en el sector construcción'
    },
    { 
      value: '+18%', 
      label: 'Obra Pública', 
      trend: { value: 'fondos UE', direction: 'up' as const },
      description: 'Incremento en licitaciones por fondos europeos'
    },
    { 
      value: '5-8x', 
      label: 'Múltiplo EBITDA', 
      description: 'Rango de valoración según especialización y cartera'
    }
  ];

  const marketInsights = {
    description: 'El sector construcción español vive un momento de transformación impulsado por los fondos europeos Next Generation. La escasez de mano de obra cualificada y la concentración del sector están generando operaciones de consolidación, especialmente en especialidades técnicas.',
    bulletPoints: [
      'Fondos Next Generation impulsan rehabilitación y eficiencia energética',
      'Escasez de mano de obra acelera consolidación sectorial',
      'Demanda creciente en construcción industrializada y modular',
      'Especialistas en obra civil y pavimentación muy demandados'
    ],
    insightCards: [
      { title: 'Obra Civil', value: '5-7x', description: 'Constructoras con cartera pública' },
      { title: 'Rehabilitación', value: '6-8x', description: 'Especialistas en reforma integral' },
      { title: 'Industrial', value: '6-8x', description: 'Pavimentos y estructuras metálicas' },
      { title: 'Instalaciones', value: '5-7x', description: 'Especialistas MEP' }
    ]
  };

  const expertiseItems = [
    {
      icon: Building2,
      title: 'Obra Civil',
      description: 'Constructoras de obra civil, infraestructuras y edificación.',
      features: ['Cartera de obra', 'Licitaciones públicas', 'Equipos y maquinaria']
    },
    {
      icon: Hammer,
      title: 'Rehabilitación',
      description: 'Empresas de reforma integral, rehabilitación y eficiencia energética.',
      features: ['Fondos Next Gen', 'Certificaciones', 'Cartera residencial']
    },
    {
      icon: HardHat,
      title: 'Construcción Industrial',
      description: 'Pavimentos industriales, estructuras metálicas y naves logísticas.',
      features: ['Proyectos llave en mano', 'Clientes industriales', 'Especialización técnica']
    },
    {
      icon: Wrench,
      title: 'Instalaciones',
      description: 'Empresas de instalaciones eléctricas, climatización y fontanería.',
      features: ['Contratos mantenimiento', 'Certificaciones', 'Personal cualificado']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis de Cartera',
      description: 'Evaluación de la cartera de obra, backlog y pipeline de proyectos.',
      features: ['Obra contratada', 'Márgenes por proyecto', 'Concentración clientes', 'Garantías']
    },
    {
      number: '2',
      title: 'Evaluación Operativa',
      description: 'Análisis de capacidades, equipos, personal y estructura organizativa.',
      features: ['Maquinaria propia', 'Subcontratación', 'Personal clave', 'Certificaciones']
    },
    {
      number: '3',
      title: 'Valoración y Cierre',
      description: 'Determinación del valor y gestión del proceso con compradores cualificados.',
      features: ['Múltiplos sector', 'Sinergias', 'Garantías de obra', 'Estructuración']
    }
  ];

  const faqs = [
    {
      question: '¿Cómo se valora una empresa constructora?',
      answer: 'Las constructoras se valoran principalmente por múltiplo de EBITDA (5-8x) ajustado por la calidad de la cartera de obra. Factores clave: backlog de proyectos, márgenes históricos, concentración de clientes, maquinaria en propiedad y personal cualificado. Se ajusta por garantías de obra pendientes.'
    },
    {
      question: '¿Qué diferencia hay entre valorar obra civil vs rehabilitación?',
      answer: 'La rehabilitación puede cotizar a múltiplos ligeramente superiores (6-8x) por el impulso de fondos europeos y mayor recurrencia. La obra civil pública (5-7x) tiene flujos más predecibles pero márgenes ajustados. Las especialidades técnicas (pavimentos, estructuras) obtienen primas por escasez.'
    },
    {
      question: '¿Quién compra empresas de construcción en España?',
      answer: 'Los principales compradores son: grupos constructores medianos buscando capacidades o geografía, fondos de private equity armando plataformas, y empresas de instalaciones diversificando. También hay interés de grupos franceses y portugueses por presencia en España.'
    },
    {
      question: '¿Cómo afectan las garantías de obra a la valoración?',
      answer: 'Las garantías de obra pendientes (defectos, retenciones) se descuentan del precio. Se analiza el histórico de siniestralidad y las provisiones existentes. Empresas con buena gestión de garantías y seguros adecuados obtienen mejores valoraciones.'
    },
    {
      question: '¿Cuánto tiempo lleva vender una constructora?',
      answer: 'El proceso típico es de 6-10 meses. La due diligence es intensiva: análisis de proyectos en curso, márgenes reales, garantías y litigios. Empresas con contabilidad de proyectos clara y documentación ordenada pueden acelerar significativamente el proceso.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas de Construcción | M&A Constructoras | Capittal"
        description="Expertos en M&A y valoración de empresas de construcción: obra civil, rehabilitación, pavimentos industriales, estructuras metálicas. Asesoramiento especializado."
        canonical="https://capittal.es/sectores/construccion"
        keywords="valoración empresas construcción, vender constructora, M&A construcción, valoración obra civil"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas de Construcción",
            "Servicios especializados de M&A y valoración para empresas del sector construcción",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Construcción",
            "Especialización en M&A y valoración de empresas de construcción",
            "https://capittal.es/sectores/construccion"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Construcción"
        title="Expertos en M&A del Sector Construcción"
        description="Asesoramiento especializado en valoración y venta de constructoras, empresas de rehabilitación, pavimentos industriales y estructuras metálicas."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Construcción en Cifras"
        subtitle="Un mercado impulsado por la transformación y los fondos europeos"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado de Construcción"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores de construcción"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Construcción"
        subtitle="Un proceso adaptado a las particularidades del sector"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid
        sectorKey="construccion"
        title="Operaciones en Cartera"
        subtitle="Oportunidades activas en el sector construcción"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Construcción"
        subtitle="Resolvemos las dudas más habituales sobre M&A en construcción"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa constructora?"
        description="Obtén una valoración confidencial de tu constructora o empresa de rehabilitación. Nuestros expertos te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default Construccion;

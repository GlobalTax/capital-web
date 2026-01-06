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
  SectorFAQ,
  SectorCTAV2,
  SectorOperationsGrid
} from '@/components/sector-v2';

const Energia = () => {
  useHreflang();

  // Datos verificados REE 2024 y fuentes públicas
  const heroMetrics = [
    { value: '56,8%', label: 'Mix renovable 2024', trend: '+10%' },
    { value: '200+', label: 'Operaciones M&A/año' },
    { value: '10-14x', label: 'Múltiplo EBITDA' },
    { value: '132GW', label: 'Potencia instalada' }
  ];

  const stats = [
    { 
      value: '56,8%', 
      label: 'Generación Renovable', 
      trend: { value: '+10,3%', direction: 'up' as const },
      description: 'Récord histórico de generación renovable en España (REE 2024)'
    },
    { 
      value: '200+', 
      label: 'Operaciones M&A', 
      trend: { value: '+15%', direction: 'up' as const },
      description: 'Transacciones anuales en energía renovable en España'
    },
    { 
      value: '7,3GW', 
      label: 'Nueva Potencia 2024', 
      trend: { value: 'récord', direction: 'up' as const },
      description: 'Mayor incremento anual de potencia FV+eólica en la historia'
    },
    { 
      value: '132GW', 
      label: 'Capacidad Total', 
      description: 'Potencia instalada sistema eléctrico español (REE 2024)'
    }
  ];

  const marketInsights = {
    description: 'España cerró 2024 con un récord de generación renovable del 56,8% y 7,3 GW de nueva potencia instalada. Los fondos de infraestructuras mantienen apetito por activos con PPAs a largo plazo, mientras utilities como Iberdrola y Acciona Energía ejecutan planes de rotación de activos por miles de millones.',
    bulletPoints: [
      'Fotovoltaica supera a la eólica como primera tecnología en potencia instalada',
      'Acciona Energía con plan de rotación de €1.700M en activos renovables',
      'Iberdrola busca socio para cartera Julieta de 1 GW fotovoltaico',
      'FRV (Abdul Latif Jameel) en proceso de venta activo en 2024-2025'
    ],
    insightCards: [
      { title: 'Solar FV', value: '10-12x', description: 'Múltiplo EBITDA para plantas con PPA' },
      { title: 'Eólica', value: '11-14x', description: 'Premium por activos operativos onshore' },
      { title: 'Almacenamiento', value: '8-10x', description: 'Baterías y sistemas híbridos' },
      { title: 'Servicios', value: '6-8x', description: 'O&M y comercializadoras' }
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

  const faqs = [
    {
      question: '¿Cómo se valora una planta solar o eólica en 2025?',
      answer: 'Las plantas renovables se valoran principalmente por DCF considerando producción esperada (datos REE), precios de energía y PPAs existentes. Los múltiplos de referencia en 2024-2025 son 10-14x EBITDA para activos con PPA a largo plazo. Activos merchant cotizan con descuento del 20-30%.'
    },
    {
      question: '¿Qué diferencia hay entre valorar un proyecto en desarrollo vs en operación?',
      answer: 'Los proyectos en desarrollo se valoran por MW de capacidad, típicamente €50-150k/MW según fase (RTB más valorado). Los activos en operación se valoran por DCF con datos reales. El descuento por riesgo de desarrollo es del 40-60% vs un activo operativo con historial.'
    },
    {
      question: '¿Qué fondos están comprando renovables en España en 2024-2025?',
      answer: 'El mercado español atrae a fondos de infraestructuras (Blackrock, Brookfield, Macquarie, Copenhagen Infrastructure Partners), fondos de pensiones canadienses y nórdicos con mandatos ESG, y utilities en expansión. También hay actividad de oil majors diversificando (Repsol, TotalEnergies).'
    },
    {
      question: '¿Cómo afecta el tipo de contrato PPA a la valoración?',
      answer: 'Los PPAs corporativos a largo plazo (10-15 años) con contrapartes investment grade pueden añadir 1-2 puntos de múltiplo EBITDA. Un activo 100% merchant puede valorarse 20-30% por debajo de uno con PPA. La tendencia es hacia estructuras híbridas (50-70% PPA + merchant).'
    },
    {
      question: '¿Cuánto tiempo lleva vender un activo renovable?',
      answer: 'El proceso típico es de 6-10 meses para un portfolio en operación. La due diligence técnica (recurso, equipos, conexión) es intensiva. Portfolios grandes como los de Acciona o Iberdrola pueden llevar 12+ meses. Un data room bien preparado puede acelerar 2-3 meses el proceso.'
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
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Energético en Cifras"
        subtitle="España lidera la transición energética europea con un mercado M&A muy activo"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Energético"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores energéticos"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Energía"
        subtitle="Un proceso adaptado a las particularidades técnicas y regulatorias del sector"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid
        sectorKey="energia"
        title="Operaciones en Cartera"
        subtitle="Oportunidades activas en el sector energético y renovables"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Energía"
        subtitle="Resolvemos las dudas más habituales sobre M&A en el sector energético"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes activos energéticos?"
        description="Obtén una valoración confidencial de tu planta solar, parque eólico o empresa energética. Nuestros expertos en energía te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default Energia;

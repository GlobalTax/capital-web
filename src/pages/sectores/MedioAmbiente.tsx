import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Recycle, Trash2, Leaf, Building } from 'lucide-react';
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

const MedioAmbiente = () => {
  const location = useLocation();
  useHreflang();

  const heroMetrics = [
    { value: '€12.000M', label: 'Sector residuos España' },
    { value: '+9%', label: 'Crecimiento anual' },
    { value: '7-11x', label: 'Múltiplo EBITDA' },
    { value: '5.000+', label: 'Empresas gestoras' }
  ];

  const stats = [
    { 
      value: '€12.000M', 
      label: 'Facturación Sector', 
      trend: { value: '+9,2%', direction: 'up' as const },
      description: 'Mercado de gestión de residuos en España'
    },
    { 
      value: '65%', 
      label: 'Objetivo Reciclaje', 
      trend: { value: 'UE 2035', direction: 'up' as const },
      description: 'Meta europea de reciclaje de residuos municipales'
    },
    { 
      value: '+25%', 
      label: 'Economía Circular', 
      description: 'Crecimiento en valorización y reciclaje'
    },
    { 
      value: '7-11x', 
      label: 'Múltiplo EBITDA', 
      description: 'Rango de valoración según contratos y activos'
    }
  ];

  const marketInsights = {
    description: 'El sector de gestión de residuos vive una transformación hacia la economía circular impulsada por regulación europea y objetivos climáticos. Los fondos de infraestructuras y utilities están muy activos adquiriendo plataformas con concesiones y activos de tratamiento.',
    bulletPoints: [
      'Regulación europea impulsa inversión en reciclaje y valorización',
      'Concesiones públicas de larga duración generan flujos predecibles',
      'Demanda creciente en residuos industriales especiales y RCDs',
      'Demoliciones y deconstrucción en auge por renovación urbana'
    ],
    insightCards: [
      { title: 'Gestión RSU', value: '8-11x', description: 'Concesiones residuos urbanos' },
      { title: 'Industriales', value: '6-9x', description: 'Residuos industriales y peligrosos' },
      { title: 'Reciclaje', value: '7-10x', description: 'Plantas de valorización' },
      { title: 'Demoliciones', value: '5-7x', description: 'Demolición y RCDs' }
    ]
  };

  const expertiseItems = [
    {
      icon: Recycle,
      title: 'Reciclaje y Valorización',
      description: 'Plantas de reciclaje, valorización energética y recuperación de materiales.',
      features: ['Plantas de tratamiento', 'Autorizaciones', 'Tecnología']
    },
    {
      icon: Trash2,
      title: 'Gestión de Residuos',
      description: 'Recogida, transporte y tratamiento de residuos urbanos e industriales.',
      features: ['Concesiones públicas', 'Flota especializada', 'Contratos largo plazo']
    },
    {
      icon: Building,
      title: 'Demoliciones y RCDs',
      description: 'Demolición, deconstrucción y gestión de residuos de construcción.',
      features: ['Maquinaria pesada', 'Licencias', 'Valorización RCDs']
    },
    {
      icon: Leaf,
      title: 'Servicios Ambientales',
      description: 'Consultoría ambiental, remediación de suelos y auditorías.',
      features: ['Acreditaciones', 'Cartera clientes', 'Personal técnico']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis de Concesiones',
      description: 'Evaluación de contratos, concesiones y autorizaciones vigentes.',
      features: ['Duración contratos', 'Renovaciones', 'Condiciones económicas', 'Autorizaciones']
    },
    {
      number: '2',
      title: 'Due Diligence Técnica',
      description: 'Análisis de activos, plantas de tratamiento y cumplimiento normativo.',
      features: ['Plantas y equipos', 'Estado técnico', 'Compliance', 'Pasivos ambientales']
    },
    {
      number: '3',
      title: 'Valoración y Proceso',
      description: 'Determinación del valor y acceso a compradores estratégicos del sector.',
      features: ['Múltiplos sector', 'Sinergias', 'Utilities y fondos', 'Estructuración']
    }
  ];

  const faqs = [
    {
      question: '¿Cómo se valora una empresa de gestión de residuos?',
      answer: 'Las empresas de residuos se valoran por múltiplo de EBITDA (7-11x) según calidad de contratos y activos. Factores clave: duración de concesiones, mix público/privado, plantas de tratamiento propias, autorizaciones y cumplimiento normativo. Concesiones con +10 años de duración obtienen primas significativas.'
    },
    {
      question: '¿Qué diferencia hay entre residuos urbanos e industriales?',
      answer: 'Los residuos urbanos con concesiones públicas cotizan a múltiplos superiores (8-11x) por flujos predecibles y barreras de entrada. Los residuos industriales (6-9x) tienen menor visibilidad pero mayores márgenes por especialización. La combinación de ambos es muy valorada por diversificación.'
    },
    {
      question: '¿Quién compra empresas de medio ambiente?',
      answer: 'Los principales compradores son: utilities (Urbaser, FCC, Ferrovial) consolidando posiciones, fondos de infraestructuras con mandatos ESG, y operadores europeos buscando presencia en España. Hay especial interés en plataformas con concesiones de larga duración y activos de valorización.'
    },
    {
      question: '¿Cómo afectan los pasivos ambientales?',
      answer: 'Los pasivos ambientales (sellado de vertederos, remediación) son críticos en la due diligence. Se realizan auditorías ambientales específicas y se negocian garantías. Empresas con buen historial de cumplimiento y provisiones adecuadas obtienen mejores valoraciones.'
    },
    {
      question: '¿Cuánto tiempo lleva vender una empresa de residuos?',
      answer: 'El proceso típico es de 8-12 meses por complejidad de due diligence ambiental y técnica. Se analizan concesiones, autorizaciones, pasivos y cumplimiento normativo. Empresas con documentación ordenada y auditorías ambientales recientes pueden acelerar el proceso.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas de Medio Ambiente | M&A Residuos | Capittal"
        description="Expertos en M&A y valoración de empresas de medio ambiente: gestión de residuos, reciclaje, demoliciones, servicios ambientales. Asesoramiento especializado."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="valoración empresas residuos, vender empresa medio ambiente, M&A reciclaje, valoración gestión residuos"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas de Medio Ambiente",
            "Servicios especializados de M&A y valoración para empresas del sector medioambiental",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Medio Ambiente y Residuos",
            "Especialización en M&A y valoración de empresas medioambientales",
            "https://capittal.es/sectores/medio-ambiente"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Medio Ambiente"
        title="Expertos en M&A del Sector Medioambiental"
        description="Asesoramiento especializado en valoración y venta de empresas de gestión de residuos, reciclaje, demoliciones y servicios ambientales."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Medioambiental en Cifras"
        subtitle="Un mercado en crecimiento impulsado por la economía circular"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Medioambiental"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores medioambientales"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Medio Ambiente"
        subtitle="Un proceso adaptado a las particularidades regulatorias y técnicas del sector"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid
        sectorKey="medio-ambiente"
        title="Operaciones en Cartera"
        subtitle="Oportunidades activas en el sector medio ambiente y residuos"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Medio Ambiente"
        subtitle="Resolvemos las dudas más habituales sobre M&A en medio ambiente"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa medioambiental?"
        description="Obtén una valoración confidencial de tu empresa de residuos, reciclaje o servicios ambientales. Nuestros expertos te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default MedioAmbiente;

import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Hospital, Heart, Pill, Stethoscope } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema, getBreadcrumbSchema } from '@/utils/seo/schemas';
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

const Healthcare = () => {
  const location = useLocation();
  useHreflang();

  const heroMetrics = [
    { value: '€105B', label: 'Gasto sanitario 2024', trend: '+7.5%' },
    { value: '400+', label: 'Operaciones M&A/año' },
    { value: '8-12x', label: 'Múltiplo EBITDA medio' },
    { value: '12.6M', label: 'Asegurados salud privada' }
  ];

  const stats = [
    { 
      value: '€105B', 
      label: 'Gasto Sanitario Total', 
      trend: { value: '+7.5%', direction: 'up' as const },
      description: 'Gasto sanitario público y privado en España 2024'
    },
    { 
      value: '400+', 
      label: 'Operaciones M&A', 
      trend: { value: '+18%', direction: 'up' as const },
      description: 'Transacciones anuales en el sector salud'
    },
    { 
      value: '12.6M', 
      label: 'Asegurados Privados', 
      trend: { value: '+7.4%', direction: 'up' as const },
      description: 'Pólizas de salud privada activas'
    },
    { 
      value: '€500M+', 
      label: 'Inversión PE 2024', 
      trend: { value: '+32%', direction: 'up' as const },
      description: 'Private equity en healthcare español'
    }
  ];

  const marketInsights = {
    description: 'El sector healthcare español vive una consolidación sin precedentes. Alantra PE ha invertido más de €100M en crear la mayor plataforma de laboratorios dentales, mientras Miura vendió Terrats a Avista por €250M. Los 12.6 millones de asegurados privados impulsan la demanda de servicios especializados.',
    bulletPoints: [
      'Alantra y Miura lideran la consolidación con >€350M invertidos en 2024',
      '12.6 millones de asegurados en salud privada (+7.4% interanual)',
      'Gasto sanitario público: 7.15% del PIB, por debajo de media UE',
      'IA impulsará el 30% de nuevos descubrimientos farmacéuticos en 2025'
    ],
    insightCards: [
      { title: 'Clínicas Dentales', value: '8-10x', description: 'Múltiplo EBITDA, consolidación activa (Alantra, Miura)' },
      { title: 'Laboratorios Dentales', value: '6-8x', description: 'Múltiplo EBITDA, digitalización premium' },
      { title: 'Oftalmología', value: '9-12x', description: 'Alta recurrencia y demanda creciente' },
      { title: 'Residencias', value: '15-18x', description: 'Múltiplo por cama en ubicaciones prime' }
    ]
  };

  const expertiseItems = [
    {
      icon: Hospital,
      title: 'Centros Sanitarios',
      description: 'Valoración de hospitales, clínicas y centros médicos con análisis de licencias y equipamiento.',
      features: ['Análisis de licencias sanitarias', 'Valoración de equipamiento', 'Cartera de pacientes']
    },
    {
      icon: Heart,
      title: 'Servicios Especializados',
      description: 'Clínicas dentales, oftalmología, dermatología y otras especialidades de alta demanda.',
      features: ['Ratios de recurrencia', 'Análisis de especialidades', 'Potencial de consolidación']
    },
    {
      icon: Pill,
      title: 'Farmacéutica',
      description: 'Empresas farmacéuticas, distribución y desarrollo de medicamentos.',
      features: ['Valoración de pipelines', 'Análisis de patentes', 'Due diligence regulatoria']
    },
    {
      icon: Stethoscope,
      title: 'Tecnología Sanitaria',
      description: 'Healthtech, dispositivos médicos y soluciones de salud digital.',
      features: ['Análisis de certificaciones', 'Valoración de tecnología', 'Escalabilidad']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis Regulatorio',
      description: 'Revisión exhaustiva de licencias, certificaciones y cumplimiento normativo sanitario.',
      features: ['Licencias sanitarias', 'Certificaciones ISO', 'Compliance RGPD sanitario', 'Acreditaciones']
    },
    {
      number: '2',
      title: 'Valoración Clínica',
      description: 'Evaluación de capacidades médicas, tecnología y protocolos de calidad asistencial.',
      features: ['Equipamiento médico', 'Protocolos clínicos', 'Cartera de servicios', 'Indicadores de calidad']
    },
    {
      number: '3',
      title: 'Estrategia de Venta',
      description: 'Identificación de compradores estratégicos y estructuración óptima de la operación.',
      features: ['Mapeo de compradores', 'Negociación regulada', 'Transición del equipo médico', 'Continuidad asistencial']
    }
  ];

  const caseStudy = {
    companyName: 'Grupo Clínico Mediterráneo',
    sector: 'Red de Clínicas Dentales',
    description: 'Asesoramos en la venta del 100% del capital a un grupo europeo de consolidación dental. La operación incluyó 12 clínicas en la Comunidad Valenciana con más de 45.000 pacientes activos.',
    metrics: [
      { value: '€8.2M', label: 'Valoración' },
      { value: '9.5x', label: 'Múltiplo EBITDA' },
      { value: '6 meses', label: 'Tiempo cierre' }
    ],
    testimonial: {
      quote: 'Capittal entendió perfectamente las particularidades de nuestro sector. Su conocimiento del mercado dental y su red de contactos fueron decisivos para conseguir las mejores condiciones.',
      author: 'Dr. Miguel Rodríguez',
      role: 'Fundador y Director Médico'
    }
  };

  const faqs = [
    {
      question: '¿Qué múltiplos de valoración se utilizan en el sector healthcare?',
      answer: 'Los múltiplos varían según el subsector: clínicas dentales entre 8-10x EBITDA (Alantra y Miura pagando premium), oftalmología 9-12x por alta recurrencia, laboratorios dentales 6-8x, y residencias geriátricas €15-18K por cama en ubicaciones prime. La operación de Terrats (€250M a ~10x EBITDA) marca referencia del mercado.'
    },
    {
      question: '¿Qué papel juega el Private Equity en el sector salud español?',
      answer: 'El PE es el motor de consolidación del sector. Alantra PE ha creado la mayor plataforma de laboratorios dentales con ~20 adquisiciones y objetivo de 25. Miura vendió Terrats a Avista por €250M y sigue activo con Dental Ibérica. Portobello, MCH y otros fondos compiten por activos de calidad, elevando los múltiplos.'
    },
    {
      question: '¿Cómo afecta la regulación a la venta de una empresa sanitaria?',
      answer: 'Las operaciones en healthcare requieren due diligence regulatoria específica: verificación de licencias sanitarias, cumplimiento RGPD sanitario, acreditaciones y autorizaciones autonómicas. En Capittal gestionamos todo el proceso regulatorio para asegurar una transición sin interrupciones.'
    },
    {
      question: '¿Qué tipos de compradores están activos en el sector salud español?',
      answer: 'Los más activos son: fondos especializados en healthcare (Alantra PE, Miura, Portobello), grupos de consolidación europeos en dental y oftalmología, aseguradoras con integración vertical (Sanitas, Adeslas), y family offices buscando activos resilientes con flujos recurrentes.'
    },
    {
      question: '¿Cuánto tiempo lleva vender una clínica o empresa sanitaria?',
      answer: 'El proceso típico dura entre 6-12 meses dependiendo de la complejidad regulatoria y el tamaño. Clínicas especializadas con documentación ordenada pueden cerrar en 4-6 meses. La alta competencia entre compradores en dental y oftalmología está acelerando los tiempos de cierre.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas Healthcare y Farmacéuticas | Capittal"
        description="Expertos en M&A y valoración de empresas del sector salud: clínicas, farmacéuticas, dispositivos médicos. +350 operaciones anuales en healthcare en España."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="valoración empresas healthcare, M&A farmacéuticas, vender clínica, valoración dispositivos médicos"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas Healthcare",
            "Servicios especializados de M&A y valoración para empresas del sector salud y farmacéutico",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Healthcare",
            "Especialización en M&A y valoración de empresas de salud",
            "https://capittal.es/sectores/healthcare"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Sectores', url: 'https://capittal.es/sectores' },
            { name: 'Healthcare', url: 'https://capittal.es/sectores/healthcare' }
          ])
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Healthcare"
        title="Expertos en M&A del Sector Salud"
        description="Asesoramiento especializado en valoración y venta de empresas sanitarias. Conocimiento profundo del mercado, regulación y compradores del sector healthcare español."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Healthcare en Cifras"
        subtitle="España es uno de los mercados sanitarios más activos de Europa en operaciones M&A"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Healthcare"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores del healthcare"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Healthcare"
        subtitle="Un proceso adaptado a las particularidades regulatorias del sector sanitario"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid sectorKey="healthcare" />
      
      <SectorCaseStudyV2
        title="Caso de Éxito Healthcare"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="slate"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Healthcare"
        subtitle="Resolvemos las dudas más habituales sobre M&A en el sector sanitario"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa del sector salud?"
        description="Obtén una valoración confidencial de tu clínica, empresa farmacéutica o negocio sanitario. Nuestros expertos en healthcare te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default Healthcare;

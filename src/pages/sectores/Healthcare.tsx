import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Hospital, Heart, Pill, Stethoscope } from 'lucide-react';
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

const Healthcare = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€85B', label: 'Mercado sanitario España', trend: '+6.2%' },
    { value: '350+', label: 'Operaciones M&A/año' },
    { value: '8-12x', label: 'Múltiplo EBITDA medio' },
    { value: '€2.5M', label: 'Ticket medio operación' }
  ];

  const stats = [
    { 
      value: '€85B', 
      label: 'Gasto Sanitario Total', 
      trend: { value: '+6.2%', direction: 'up' as const },
      description: 'Gasto sanitario público y privado en España'
    },
    { 
      value: '350+', 
      label: 'Operaciones M&A', 
      trend: { value: '+15%', direction: 'up' as const },
      description: 'Transacciones anuales en el sector salud'
    },
    { 
      value: '12%', 
      label: 'Crecimiento Privado', 
      trend: { value: '+2.1pp', direction: 'up' as const },
      description: 'Cuota de mercado de sanidad privada'
    },
    { 
      value: '€420M', 
      label: 'Inversión en Biotech', 
      trend: { value: '+28%', direction: 'up' as const },
      description: 'Capital invertido en biotecnología'
    }
  ];

  const marketInsights = {
    description: 'El sector healthcare español está experimentando una transformación acelerada impulsada por la digitalización, el envejecimiento demográfico y la creciente demanda de servicios especializados. España se posiciona como hub europeo de ensayos clínicos y desarrollo biotecnológico.',
    bulletPoints: [
      'Consolidación acelerada en clínicas dentales, oftalmología y dermatología',
      'Crecimiento del 15% anual en telemedicina y salud digital',
      'España entre los top 5 europeos en ensayos clínicos',
      'Inversión récord de fondos en residencias y servicios geriátricos'
    ],
    insightCards: [
      { title: 'Clínicas Especializadas', value: '8-10x', description: 'Múltiplo EBITDA para clínicas con alta recurrencia' },
      { title: 'Farmacéuticas', value: '12-15x', description: 'Valoración premium por I+D y patentes' },
      { title: 'Digital Health', value: '4-6x', description: 'Múltiplo ingresos para healthtech' },
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
      answer: 'Los múltiplos varían según el subsector: clínicas especializadas suelen valorarse entre 8-10x EBITDA, farmacéuticas entre 12-15x, y healthtech entre 4-6x ingresos. Factores como la recurrencia de pacientes, licencias y ubicación pueden elevar significativamente estos ratios.'
    },
    {
      question: '¿Cómo afecta la regulación a la venta de una empresa sanitaria?',
      answer: 'Las operaciones en healthcare requieren due diligence regulatoria específica: verificación de licencias sanitarias, cumplimiento RGPD sanitario, acreditaciones y autorizaciones autonómicas. En Capittal gestionamos todo el proceso regulatorio para asegurar una transición sin interrupciones.'
    },
    {
      question: '¿Qué tipos de compradores están activos en el sector salud español?',
      answer: 'El mercado español atrae principalmente a grupos de consolidación europeos (especialmente en dental y oftalmología), fondos de private equity especializados en healthcare, aseguradoras con estrategia de integración vertical, y grupos hospitalarios en expansión.'
    },
    {
      question: '¿Cuánto tiempo lleva vender una clínica o empresa sanitaria?',
      answer: 'El proceso típico dura entre 6-12 meses dependiendo de la complejidad regulatoria y el tamaño de la operación. Las clínicas especializadas con documentación ordenada pueden cerrar en 4-6 meses, mientras que operaciones con múltiples licencias pueden requerir más tiempo.'
    },
    {
      question: '¿Qué pasa con el equipo médico tras la venta?',
      answer: 'La continuidad del equipo médico es clave para el valor de la operación. Estructuramos acuerdos que protegen tanto al vendedor como al equipo, incluyendo cláusulas de permanencia, incentivos de retención y planes de transición ordenada.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas Healthcare y Farmacéuticas | Capittal"
        description="Expertos en M&A y valoración de empresas del sector salud: clínicas, farmacéuticas, dispositivos médicos. +350 operaciones anuales en healthcare en España."
        canonical="https://capittal.es/sectores/healthcare"
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
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Healthcare"
        title="Expertos en M&A del Sector Salud"
        description="Asesoramiento especializado en valoración y venta de empresas sanitarias. Conocimiento profundo del mercado, regulación y compradores del sector healthcare español."
        metrics={heroMetrics}
        accentColor="emerald"
      />
      
      <SectorStatsV2 
        title="El Sector Healthcare en Cifras"
        subtitle="España es uno de los mercados sanitarios más activos de Europa en operaciones M&A"
        stats={stats}
        accentColor="emerald"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Healthcare"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="emerald"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores del healthcare"
        items={expertiseItems}
        accentColor="emerald"
      />
      
      <SectorMethodology
        title="Metodología Específica Healthcare"
        subtitle="Un proceso adaptado a las particularidades regulatorias del sector sanitario"
        steps={methodologySteps}
        accentColor="emerald"
      />
      
      <SectorCaseStudyV2
        title="Caso de Éxito Healthcare"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="emerald"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Healthcare"
        subtitle="Resolvemos las dudas más habituales sobre M&A en el sector sanitario"
        faqs={faqs}
        accentColor="emerald"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa del sector salud?"
        description="Obtén una valoración confidencial de tu clínica, empresa farmacéutica o negocio sanitario. Nuestros expertos en healthcare te asesorarán sin compromiso."
        accentColor="emerald"
      />
      
      <Footer />
    </div>
  );
};

export default Healthcare;

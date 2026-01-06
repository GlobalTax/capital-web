import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Camera, Flame, Bug } from 'lucide-react';
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

const Seguridad = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€4.500M', label: 'Mercado español 2024' },
    { value: '+8%', label: 'Crecimiento anual' },
    { value: '6-9x', label: 'Múltiplo EBITDA' },
    { value: '3.500+', label: 'Empresas activas' }
  ];

  const stats = [
    { 
      value: '€4.500M', 
      label: 'Facturación Sector', 
      trend: { value: '+8,2%', direction: 'up' as const },
      description: 'Mercado español de seguridad privada 2024'
    },
    { 
      value: '95.000+', 
      label: 'Profesionales', 
      description: 'Vigilantes de seguridad habilitados en España'
    },
    { 
      value: '+12%', 
      label: 'Sistemas Electrónicos', 
      trend: { value: 'récord', direction: 'up' as const },
      description: 'Crecimiento en seguridad electrónica y alarmas'
    },
    { 
      value: '6-9x', 
      label: 'Múltiplo EBITDA', 
      description: 'Rango de valoración según recurrencia de contratos'
    }
  ];

  const marketInsights = {
    description: 'El sector de seguridad en España atraviesa una fase de consolidación activa. Grandes operadores como Prosegur, Securitas y Grupo Control buscan adquisiciones para ganar escala, mientras fondos de private equity apuestan por plataformas regionales con potencial de rollup.',
    bulletPoints: [
      'Consolidación activa: top 10 empresas controlan 60% del mercado',
      'Crecimiento en seguridad electrónica supera a vigilancia tradicional',
      'Demanda creciente en ciberseguridad y protección de infraestructuras críticas',
      'Contratos públicos de larga duración generan alta visibilidad de ingresos'
    ],
    insightCards: [
      { title: 'Vigilancia', value: '5-7x', description: 'Empresas de vigilancia con contratos' },
      { title: 'Sistemas', value: '7-9x', description: 'Alarmas y seguridad electrónica' },
      { title: 'Incendios', value: '6-8x', description: 'Protección contra incendios' },
      { title: 'Control Plagas', value: '5-7x', description: 'Sanidad ambiental y DDD' }
    ]
  };

  const expertiseItems = [
    {
      icon: Shield,
      title: 'Vigilancia Privada',
      description: 'Empresas de vigilantes, escoltas y protección de instalaciones.',
      features: ['Contratos públicos', 'Recurrencia de ingresos', 'Gestión de personal']
    },
    {
      icon: Camera,
      title: 'Seguridad Electrónica',
      description: 'Sistemas de alarmas, CCTV, control de accesos y centrales receptoras.',
      features: ['Cuotas mensuales', 'Tecnología y equipos', 'Cartera de clientes']
    },
    {
      icon: Flame,
      title: 'Protección Incendios',
      description: 'Instalación y mantenimiento de sistemas contra incendios.',
      features: ['Normativa técnica', 'Contratos de mantenimiento', 'Certificaciones']
    },
    {
      icon: Bug,
      title: 'Control de Plagas',
      description: 'Servicios DDD, sanidad ambiental y gestión medioambiental.',
      features: ['Contratos recurrentes', 'Licencias y permisos', 'Sector regulado']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis de Contratos',
      description: 'Evaluación de la cartera de contratos, recurrencia y concentración de clientes.',
      features: ['Duración contratos', 'Renovaciones históricas', 'Concentración clientes', 'Contratos públicos']
    },
    {
      number: '2',
      title: 'Evaluación Operativa',
      description: 'Análisis de la estructura de personal, licencias y cumplimiento normativo.',
      features: ['Habilitaciones', 'Gestión RRHH', 'Tecnología', 'Compliance']
    },
    {
      number: '3',
      title: 'Valoración y Proceso',
      description: 'Determinación del valor y gestión del proceso de venta con compradores estratégicos.',
      features: ['Múltiplos sector', 'Sinergias operativas', 'Compradores naturales', 'Estructuración']
    }
  ];

  const faqs = [
    {
      question: '¿Cómo se valora una empresa de seguridad privada?',
      answer: 'Las empresas de seguridad se valoran principalmente por múltiplo de EBITDA (5-9x según subsector). Los factores clave son: recurrencia de contratos, concentración de clientes, margen operativo y licencias/habilitaciones. Empresas con alta proporción de contratos públicos plurianuales obtienen valoraciones premium.'
    },
    {
      question: '¿Qué diferencia hay entre valorar vigilancia vs seguridad electrónica?',
      answer: 'La seguridad electrónica (alarmas, CCTV) cotiza a múltiplos superiores (7-9x) por mayor recurrencia, márgenes y escalabilidad. La vigilancia tradicional (5-7x) es más intensiva en personal y tiene márgenes más ajustados, aunque genera flujos predecibles si tiene buena cartera de contratos.'
    },
    {
      question: '¿Quién compra empresas de seguridad en España?',
      answer: 'Los principales compradores son: grandes operadores (Prosegur, Securitas, Grupo Control) buscando cuota de mercado, fondos de private equity armando plataformas de consolidación, y competidores regionales buscando escala. También hay interés de grupos internacionales europeos.'
    },
    {
      question: '¿Cuánto tiempo lleva vender una empresa de seguridad?',
      answer: 'El proceso típico es de 6-9 meses. La due diligence se centra en contratos, personal habilitado, licencias y cumplimiento normativo. Empresas con documentación ordenada y contratos bien estructurados pueden acelerar el proceso significativamente.'
    },
    {
      question: '¿Qué impacto tiene la regulación en la valoración?',
      answer: 'El sector está muy regulado (Ley de Seguridad Privada). Las licencias, habilitaciones de personal y certificaciones son activos valiosos que impactan positivamente en la valoración. El cumplimiento normativo es requisito esencial para cualquier transacción.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas de Seguridad | M&A Seguridad Privada | Capittal"
        description="Expertos en M&A y valoración de empresas de seguridad: vigilancia, alarmas, protección contra incendios, control de plagas. Asesoramiento especializado."
        canonical="https://capittal.es/sectores/seguridad"
        keywords="valoración empresas seguridad, vender empresa vigilancia, M&A seguridad privada, valoración alarmas"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas de Seguridad",
            "Servicios especializados de M&A y valoración para empresas del sector seguridad",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Seguridad",
            "Especialización en M&A y valoración de empresas de seguridad",
            "https://capittal.es/sectores/seguridad"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Seguridad"
        title="Expertos en M&A del Sector Seguridad"
        description="Asesoramiento especializado en valoración y venta de empresas de seguridad privada, sistemas electrónicos, protección contra incendios y control de plagas."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Seguridad en Cifras"
        subtitle="Un mercado en consolidación con alta demanda de adquisiciones"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado de Seguridad"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores de seguridad"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Seguridad"
        subtitle="Un proceso adaptado a las particularidades regulatorias del sector"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid
        sectorKey="seguridad"
        title="Operaciones en Cartera"
        subtitle="Oportunidades activas en el sector seguridad"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Seguridad"
        subtitle="Resolvemos las dudas más habituales sobre M&A en seguridad"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa de seguridad?"
        description="Obtén una valoración confidencial de tu empresa de vigilancia, alarmas o servicios de seguridad. Nuestros expertos te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default Seguridad;

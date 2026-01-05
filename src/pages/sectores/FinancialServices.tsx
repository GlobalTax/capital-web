import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Landmark, TrendingUp, Shield, Smartphone } from 'lucide-react';
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

const FinancialServices = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€3.2T', label: 'Activos sector financiero', trend: '+4.8%' },
    { value: '150+', label: 'Operaciones M&A/año' },
    { value: '1.2-1.8x', label: 'Múltiplo P/B' },
    { value: '€45M', label: 'Ticket medio operación' }
  ];

  const stats = [
    { 
      value: '€3.2T', 
      label: 'Activos Financieros', 
      trend: { value: '+4.8%', direction: 'up' as const },
      description: 'Activos totales del sector financiero español'
    },
    { 
      value: '150+', 
      label: 'Operaciones M&A', 
      trend: { value: '+12%', direction: 'up' as const },
      description: 'Transacciones anuales en servicios financieros'
    },
    { 
      value: '€2.8B', 
      label: 'Inversión FinTech', 
      trend: { value: '+45%', direction: 'up' as const },
      description: 'Capital invertido en fintech español'
    },
    { 
      value: '85%', 
      label: 'Digitalización', 
      description: 'Usuarios de banca digital en España'
    }
  ];

  const marketInsights = {
    description: 'El sector financiero español está en plena transformación digital con la banca tradicional adaptándose y las fintech ganando cuota. La consolidación bancaria continúa mientras nuevos players especializados capturan nichos de mercado.',
    bulletPoints: [
      'Consolidación bancaria acelerada tras fusiones recientes',
      'FinTech español entre los más maduros de Europa',
      'Creciente interés en wealth management y asset management',
      'InsurTech emergiendo como subsector con alto potencial'
    ],
    insightCards: [
      { title: 'Banca', value: '0.8-1.2x', description: 'Múltiplo P/B para banca regional' },
      { title: 'Asset Management', value: '2-4%', description: 'Sobre AUM para gestoras' },
      { title: 'FinTech', value: '5-10x', description: 'Múltiplo ingresos para scale-ups' },
      { title: 'Seguros', value: '1.0-1.5x', description: 'Múltiplo embedded value' }
    ]
  };

  const expertiseItems = [
    {
      icon: Landmark,
      title: 'Banca & Lending',
      description: 'Entidades bancarias, financieras de crédito y servicios de préstamo.',
      features: ['Análisis de cartera', 'Ratios regulatorios', 'Valoración P/B']
    },
    {
      icon: TrendingUp,
      title: 'Asset Management',
      description: 'Gestoras de fondos, wealth management y servicios de inversión.',
      features: ['Valoración de AUM', 'Fee structures', 'Performance track record']
    },
    {
      icon: Shield,
      title: 'Seguros',
      description: 'Compañías de seguros vida, no vida, corredurías y reaseguros.',
      features: ['Análisis actuarial', 'Embedded value', 'Reservas técnicas']
    },
    {
      icon: Smartphone,
      title: 'FinTech & InsurTech',
      description: 'Startups financieras, neo-banks, pagos y soluciones digitales.',
      features: ['Métricas digitales', 'Licencias regulatorias', 'Escalabilidad']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Due Diligence Regulatoria',
      description: 'Análisis exhaustivo del cumplimiento normativo y situación ante supervisores.',
      features: ['Licencias y autorizaciones', 'Requisitos de capital', 'Compliance AML/KYC', 'Reporting regulatorio']
    },
    {
      number: '2',
      title: 'Valoración Especializada',
      description: 'Aplicación de metodologías específicas del sector financiero.',
      features: ['Price-to-Book', 'Dividend Discount Model', 'Sum of parts', 'Embedded value']
    },
    {
      number: '3',
      title: 'Proceso Regulado',
      description: 'Gestión del proceso de autorización con supervisores (BdE, CNMV, DGS).',
      features: ['Notificaciones previas', 'Idoneidad de adquirentes', 'Condiciones de autorización', 'Integración']
    }
  ];

  const caseStudy = {
    companyName: 'Banco Regional',
    sector: 'Banca Comercial Regional',
    description: 'Asesoramos en la fusión con otra entidad regional, creando el tercer banco regional de España. Operación sujeta a autorización del Banco de España y CNMV.',
    metrics: [
      { value: '€850M', label: 'Enterprise Value' },
      { value: '0.95x', label: 'Múltiplo P/B' },
      { value: '14 meses', label: 'Tiempo cierre' }
    ],
    testimonial: {
      quote: 'La valoración de Capittal fue fundamental para nuestro proceso de fusión. Su profundo conocimiento del sector bancario y su enfoque metodológico nos proporcionaron la confianza necesaria.',
      author: 'Isabel García',
      role: 'CFO'
    }
  };

  const faqs = [
    {
      question: '¿Cómo se valora una entidad financiera?',
      answer: 'Las entidades financieras se valoran principalmente por múltiplo Price-to-Book (P/B), típicamente entre 0.8-1.5x según ROE y calidad de activos. También se usa Dividend Discount Model para bancos con dividendos estables. Las gestoras se valoran como % sobre AUM (2-4% típicamente).'
    },
    {
      question: '¿Qué rol juega el regulador en operaciones M&A financieras?',
      answer: 'El regulador (Banco de España, CNMV, DGS según tipo de entidad) debe autorizar la adquisición. Evalúa la idoneidad de los adquirentes, el impacto en la estabilidad de la entidad, y puede imponer condiciones. El proceso regulatorio puede añadir 6-12 meses al timeline.'
    },
    {
      question: '¿Qué múltiplos se pagan por fintech en España?',
      answer: 'Las fintech españolas en fase de crecimiento se valoran entre 5-10x ingresos según tracción y potencial. Las que tienen licencias regulatorias (EDE, EFC) obtienen premium. Los neo-banks y plataformas de pagos líderes pueden alcanzar múltiplos superiores.'
    },
    {
      question: '¿Es posible vender una correduría de seguros?',
      answer: 'Sí, hay un mercado activo de consolidación de corredurías. Se valoran típicamente por 1.5-3x comisiones recurrentes, con premium para carteras de empresas y seguros de vida. Los brokers con especialización (industria, cyber) obtienen mejores múltiplos.'
    },
    {
      question: '¿Cuánto tiempo lleva una operación M&A en servicios financieros?',
      answer: 'Las operaciones reguladas requieren más tiempo: 12-18 meses para bancos y aseguradoras, 9-12 meses para gestoras y corredurías, 6-9 meses para fintech sin licencia bancaria. La preparación previa del expediente regulatorio es clave para acortar plazos.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas de Servicios Financieros | Capittal"
        description="Expertos en M&A financiero: banca, asset management, seguros, fintech. +150 operaciones anuales en servicios financieros en España."
        canonical="https://capittal.es/sectores/servicios-financieros"
        keywords="valoración empresas financieras, M&A banca, vender gestora fondos, valoración fintech"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas de Servicios Financieros",
            "Servicios especializados de M&A y valoración para empresas del sector financiero",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Servicios Financieros",
            "Especialización en M&A y valoración de empresas financieras",
            "https://capittal.es/sectores/servicios-financieros"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Financiero"
        title="Expertos en M&A del Sector Financiero"
        description="Asesoramiento especializado en valoración y venta de entidades financieras. Conocimiento profundo de regulación, metodologías específicas y proceso de autorización."
        metrics={heroMetrics}
        accentColor="indigo"
      />
      
      <SectorStatsV2 
        title="El Sector Financiero en Cifras"
        subtitle="El sistema financiero español se transforma con consolidación y digitalización"
        stats={stats}
        accentColor="indigo"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Financiero"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="indigo"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores financieros"
        items={expertiseItems}
        accentColor="indigo"
      />
      
      <SectorMethodology
        title="Metodología Específica Financiera"
        subtitle="Un proceso adaptado a las particularidades regulatorias del sector"
        steps={methodologySteps}
        accentColor="indigo"
      />
      
      <SectorCaseStudyV2
        title="Caso de Éxito Financiero"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="indigo"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Financiero"
        subtitle="Resolvemos las dudas más habituales sobre M&A en servicios financieros"
        faqs={faqs}
        accentColor="indigo"
      />
      
      <SectorCTAV2
        title="¿Tienes una entidad financiera?"
        description="Obtén una valoración confidencial de tu banco, gestora, aseguradora o fintech. Nuestros expertos en servicios financieros te asesorarán sin compromiso."
        accentColor="indigo"
      />
      
      <Footer />
    </div>
  );
};

export default FinancialServices;

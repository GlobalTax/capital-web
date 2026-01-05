import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Computer, TrendingUp, Users, Cpu } from 'lucide-react';
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

const Tecnologia = () => {
  useHreflang();

  const heroMetrics = [
    { value: '€45B', label: 'Inversión tech España', trend: '+22%' },
    { value: '280+', label: 'Operaciones M&A/año' },
    { value: '4-8x', label: 'Múltiplo ARR SaaS' },
    { value: '€5.2M', label: 'Ticket medio operación' }
  ];

  const stats = [
    { 
      value: '€45B', 
      label: 'Inversión en Tech', 
      trend: { value: '+22%', direction: 'up' as const },
      description: 'Inversión total en sector tecnológico español'
    },
    { 
      value: '280+', 
      label: 'Operaciones M&A', 
      trend: { value: '+18%', direction: 'up' as const },
      description: 'Transacciones anuales en tech'
    },
    { 
      value: '€2.1B', 
      label: 'Venture Capital', 
      trend: { value: '+35%', direction: 'up' as const },
      description: 'Capital invertido en startups tech'
    },
    { 
      value: '45%', 
      label: 'Exits a Internac.', 
      description: 'Compradores internacionales en exits tech'
    }
  ];

  const marketInsights = {
    description: 'El ecosistema tech español ha madurado significativamente, con Barcelona y Madrid consolidándose como hubs europeos. La abundancia de talento técnico y costes competitivos atraen inversión internacional, mientras que los fondos locales incrementan su sofisticación.',
    bulletPoints: [
      'España en top 5 europeo en atracción de talento tech',
      'Múltiplos SaaS entre 4-8x ARR según crecimiento y retención',
      'Creciente interés de corporates europeos en adquisiciones',
      'Fondos growth locales con €500M+ para late stage'
    ],
    insightCards: [
      { title: 'SaaS B2B', value: '5-8x', description: 'Múltiplo ARR para SaaS con NRR >110%' },
      { title: 'FinTech', value: '6-10x', description: 'Premium por licencias reguladas' },
      { title: 'E-commerce', value: '1-3x', description: 'Múltiplo ingresos según márgenes' },
      { title: 'Deep Tech', value: '8-15x', description: 'Valoración basada en IP y potencial' }
    ]
  };

  const expertiseItems = [
    {
      icon: Computer,
      title: 'Software & SaaS',
      description: 'Valoración de empresas de software, SaaS y plataformas con modelos de suscripción.',
      features: ['Análisis de ARR/MRR', 'Métricas de retención', 'Unit economics']
    },
    {
      icon: TrendingUp,
      title: 'FinTech & InsurTech',
      description: 'Startups disruptivas en servicios financieros, pagos y seguros digitales.',
      features: ['Valoración de licencias', 'Análisis regulatorio', 'Escalabilidad']
    },
    {
      icon: Users,
      title: 'E-commerce & MarTech',
      description: 'Plataformas de comercio electrónico y tecnologías de marketing.',
      features: ['LTV/CAC analysis', 'Cohort analysis', 'Valoración de marca']
    },
    {
      icon: Cpu,
      title: 'Deep Tech & AI',
      description: 'Inteligencia artificial, machine learning y tecnologías emergentes.',
      features: ['Valoración de IP', 'Due diligence técnica', 'Potencial de mercado']
    }
  ];

  const methodologySteps = [
    {
      number: '1',
      title: 'Análisis de Métricas Tech',
      description: 'Evaluación profunda de KPIs específicos: ARR, NRR, LTV, CAC, churn y cohorts.',
      features: ['Unit economics', 'Análisis de cohorts', 'Benchmarking sectorial', 'Proyecciones de crecimiento']
    },
    {
      number: '2',
      title: 'Due Diligence Técnica',
      description: 'Revisión de stack tecnológico, escalabilidad de producto y propiedad intelectual.',
      features: ['Code review', 'Arquitectura técnica', 'Deuda técnica', 'Roadmap de producto']
    },
    {
      number: '3',
      title: 'Estrategia de Exit',
      description: 'Identificación de compradores estratégicos y financieros óptimos para maximizar valor.',
      features: ['Mapeo de compradores', 'Narrativa de crecimiento', 'Estructuración de deal', 'Earn-outs tech']
    }
  ];

  const caseStudy = {
    companyName: 'TechFlow Analytics',
    sector: 'SaaS B2B - Business Intelligence',
    description: 'Asesoramos en la venta a un grupo de software europeo. La compañía había alcanzado €3M ARR con excelentes métricas de retención (NRR 125%) y un equipo de 35 personas.',
    metrics: [
      { value: '€18M', label: 'Valoración' },
      { value: '6x', label: 'Múltiplo ARR' },
      { value: '5 meses', label: 'Tiempo cierre' }
    ],
    testimonial: {
      quote: 'Capittal entendió perfectamente las métricas SaaS y supo comunicar nuestra historia de crecimiento a los compradores. Conseguimos un múltiplo muy superior al que esperábamos.',
      author: 'David Torres',
      role: 'CEO y Co-fundador'
    }
  };

  const faqs = [
    {
      question: '¿Cómo se valora una empresa SaaS?',
      answer: 'Las empresas SaaS se valoran principalmente por múltiplo de ARR (Annual Recurring Revenue), típicamente entre 4-8x. Los factores clave son: crecimiento YoY (>40% es premium), Net Revenue Retention (>110% es excelente), márgenes brutos (>70%), y eficiencia de CAC payback.'
    },
    {
      question: '¿Qué múltiplos se pagan por startups tech en España?',
      answer: 'Los múltiplos varían significativamente: SaaS B2B con buen crecimiento obtiene 5-8x ARR, FinTech regulado 6-10x, e-commerce 1-3x ingresos según márgenes, y deep tech/AI puede alcanzar 8-15x por el valor de la IP. El contexto de mercado y el tipo de comprador influyen mucho.'
    },
    {
      question: '¿Es necesario tener beneficios para vender una empresa tech?',
      answer: 'No necesariamente. En tech, los compradores priorizan crecimiento, retención y potencial de mercado sobre rentabilidad actual. Sin embargo, la eficiencia (rule of 40: crecimiento + margen EBITDA >40%) es cada vez más valorada. Empresas pre-profit pueden obtener excelentes valoraciones si demuestran unit economics sólidos.'
    },
    {
      question: '¿Qué tipo de compradores buscan empresas tech españolas?',
      answer: 'El mercado español atrae principalmente a: grupos de software europeos y americanos en expansión, fondos de private equity con estrategias de buy & build en tech, corporates buscando adquisiciones de producto/talento, y cada vez más, grandes tech asiáticos explorando Europa.'
    },
    {
      question: '¿Cómo funciona el earn-out en operaciones tech?',
      answer: 'Los earn-outs son muy comunes en tech, típicamente representando 20-40% del precio. Se estructuran sobre métricas como ARR, crecimiento, retención de clientes clave o retención de equipo fundador. Es crítico negociar bien los términos para que sean alcanzables y medibles.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas Tecnológicas - M&A Tech | Capittal"
        description="Expertos en valoración de empresas tech: SaaS, FinTech, E-commerce, AI. Metodologías especializadas para startups y scale-ups tecnológicas en España."
        canonical="https://capittal.es/sectores/tecnologia"
        keywords="valoración empresas tech, M&A tecnología, valoración SaaS, vender startup"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas Tecnológicas",
            "Servicios especializados de M&A y valoración para empresas del sector tecnológico",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "Sector Tecnología",
            "Especialización en M&A y valoración de empresas tecnológicas",
            "https://capittal.es/sectores/tecnologia"
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Tecnología"
        title="Expertos en M&A del Sector Tech"
        description="Asesoramiento especializado en valoración y venta de empresas tecnológicas. Entendemos las métricas SaaS, los ciclos de funding y el ecosistema de compradores tech."
        metrics={heroMetrics}
        accentColor="blue"
      />
      
      <SectorStatsV2 
        title="El Sector Tech en Cifras"
        subtitle="España se consolida como hub tecnológico europeo con un ecosistema M&A cada vez más maduro"
        stats={stats}
        accentColor="blue"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Tech"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="blue"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores tecnológicos"
        items={expertiseItems}
        accentColor="blue"
      />
      
      <SectorMethodology
        title="Metodología Específica Tech"
        subtitle="Un proceso adaptado a las particularidades de valoración de empresas tecnológicas"
        steps={methodologySteps}
        accentColor="blue"
      />
      
      <SectorCaseStudyV2
        title="Caso de Éxito Tech"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="blue"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Tech"
        subtitle="Resolvemos las dudas más habituales sobre M&A en el sector tecnológico"
        faqs={faqs}
        accentColor="blue"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa tecnológica?"
        description="Obtén una valoración confidencial de tu startup, SaaS o empresa tech. Nuestros expertos en tecnología te asesorarán sin compromiso."
        accentColor="blue"
      />
      
      <Footer />
    </div>
  );
};

export default Tecnologia;

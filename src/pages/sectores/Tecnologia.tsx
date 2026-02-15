import React from 'react';
import { useLocation } from 'react-router-dom';
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
  SectorCTAV2,
  SectorOperationsGrid
} from '@/components/sector-v2';

const Tecnologia = () => {
  const location = useLocation();
  useHreflang();

  const heroMetrics = [
    { value: '€2.9B', label: 'Inversión VC 2024', trend: '+60%' },
    { value: '300+', label: 'Operaciones públicas 2024' },
    { value: '4-8x', label: 'Múltiplo ARR SaaS' },
    { value: '€9.7M', label: 'Ticket medio (+36% YoY)' }
  ];

  const stats = [
    { 
      value: '€2.9B', 
      label: 'Inversión VC 2024', 
      trend: { value: '+60%', direction: 'up' as const },
      description: 'Mejor dato desde 2021, recuperación fuerte'
    },
    { 
      value: '300+', 
      label: 'Operaciones Públicas', 
      trend: { value: '+15%', direction: 'up' as const },
      description: 'Transacciones en 2024, ecosistema maduro'
    },
    { 
      value: '€3.1B', 
      label: 'Captación Startups', 
      trend: { value: '+36%', direction: 'up' as const },
      description: 'Capital captado por startups españolas'
    },
    { 
      value: 'Top 5', 
      label: 'Ecosistema Europeo', 
      description: 'España en ranking Dealroom 2025'
    }
  ];

  const marketInsights = {
    description: 'El ecosistema tech español ha registrado un crecimiento del 60% en inversión VC en 2024, alcanzando €2.9B. Barcelona y Madrid se consolidan como hubs europeos, con mega-rondas como Sequra (+€100M), TravelPerk, Factorial y Exoticca liderando la actividad.',
    bulletPoints: [
      'España Top 5 europeo en ecosistema startup (Dealroom 2025)',
      'Software B2B domina el 65% del M&A tech en 2025',
      'Ciberseguridad e IA son los subsectores con mayor actividad',
      'M&A defensivo: consolidación y servicios IT lideran las operaciones'
    ],
    insightCards: [
      { title: 'SaaS B2B', value: '5-8x', description: 'Múltiplo ARR, premium por NRR >110%' },
      { title: 'FinTech', value: '6-10x', description: 'Premium por regulación y licencias' },
      { title: 'Ciberseguridad', value: '8-12x', description: 'Demanda récord, escasez de activos' },
      { title: 'AI / Deep Tech', value: '10-20x', description: 'Valoraciones premium por IP' }
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
    companyName: 'SaaS Analytics Platform',
    sector: 'SaaS B2B - Business Intelligence',
    description: 'Asesoramos en la venta a un grupo de software europeo. La compañía había alcanzado €4.5M ARR con excelentes métricas de retención (NRR 128%) y un equipo de 40 personas. Similar a operaciones como Sequra y TravelPerk en estructura.',
    metrics: [
      { value: '€32M', label: 'Valoración' },
      { value: '7.1x', label: 'Múltiplo ARR' },
      { value: '4 meses', label: 'Tiempo cierre' }
    ],
    testimonial: {
      quote: 'Capittal entendió perfectamente las métricas SaaS y supo comunicar nuestra historia de crecimiento a los compradores. Conseguimos un múltiplo muy superior al que esperábamos.',
      author: 'CEO y Co-fundador',
      role: 'SaaS B2B'
    }
  };

  const faqs = [
    {
      question: '¿Cómo se valora una empresa SaaS en 2025?',
      answer: 'Las empresas SaaS se valoran principalmente por múltiplo de ARR (Annual Recurring Revenue), típicamente entre 4-8x en 2025. Los factores clave son: crecimiento YoY (>40% es premium), Net Revenue Retention (>110% es excelente), márgenes brutos (>70%), y eficiencia de CAC payback. En España, rondas como Sequra (+€100M) y Factorial demuestran múltiplos premium.'
    },
    {
      question: '¿Qué múltiplos se pagan por startups tech en España?',
      answer: 'Los múltiplos en 2024-2025 varían: SaaS B2B con buen crecimiento obtiene 5-8x ARR, FinTech regulado 6-10x, ciberseguridad 8-12x (demanda récord), y AI/deep tech puede alcanzar 10-20x por el valor de la IP. El ticket medio ha subido a €9.7M (+36% vs 2023).'
    },
    {
      question: '¿Cuál es el estado del mercado tech español en 2025?',
      answer: 'España se posiciona en el Top 5 europeo (Dealroom 2025). La inversión VC alcanzó €2.9B en 2024 (+60% vs 2023), con más de 300 operaciones públicas. Las tendencias dominantes son M&A defensivo, software B2B (65% del mercado), ciberseguridad e infraestructura digital.'
    },
    {
      question: '¿Es necesario tener beneficios para vender una empresa tech?',
      answer: 'No necesariamente. En tech, los compradores priorizan crecimiento, retención y potencial de mercado sobre rentabilidad actual. Sin embargo, la eficiencia (rule of 40: crecimiento + margen EBITDA >40%) es cada vez más valorada. Empresas pre-profit pueden obtener excelentes valoraciones si demuestran unit economics sólidos.'
    },
    {
      question: '¿Qué tipo de compradores buscan empresas tech españolas?',
      answer: 'El mercado español atrae principalmente a: grupos de software europeos y americanos en expansión (65% M&A 2025), fondos de private equity con estrategias de buy & build en tech, corporates buscando adquisiciones de producto/talento, y fondos especializados en ciberseguridad e IA.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Valoración de Empresas Tecnológicas - M&A Tech | Capittal"
        description="Expertos en valoración de empresas tech: SaaS, FinTech, E-commerce, AI. Metodologías especializadas para startups y scale-ups tecnológicas en España."
        canonical={`https://capittal.es${location.pathname}`}
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
            `https://capittal.es${location.pathname}`
          )
        ]}
      />
      <Header />
      
      <SectorHeroV2
        badge="Sector Tecnología"
        title="Expertos en M&A del Sector Tech"
        description="Asesoramiento especializado en valoración y venta de empresas tecnológicas. Entendemos las métricas SaaS, los ciclos de funding y el ecosistema de compradores tech."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      <SectorStatsV2 
        title="El Sector Tech en Cifras"
        subtitle="España Top 5 europeo con €2.9B invertidos en 2024 (+60% YoY)"
        stats={stats}
        accentColor="slate"
      />
      
      <SectorMarketInsights
        title="Contexto del Mercado Tech 2024-2025"
        description={marketInsights.description}
        bulletPoints={marketInsights.bulletPoints}
        insightCards={marketInsights.insightCards}
        accentColor="slate"
      />
      
      <SectorExpertiseGrid 
        title="Áreas de Especialización"
        subtitle="Experiencia integral en todos los subsectores tecnológicos"
        items={expertiseItems}
        accentColor="slate"
      />
      
      <SectorMethodology
        title="Metodología Específica Tech"
        subtitle="Un proceso adaptado a las particularidades de valoración de empresas tecnológicas"
        steps={methodologySteps}
        accentColor="slate"
      />
      
      <SectorOperationsGrid sectorKey="tecnologia" />
      
      <SectorCaseStudyV2
        title="Caso de Éxito Tech"
        companyName={caseStudy.companyName}
        sector={caseStudy.sector}
        description={caseStudy.description}
        metrics={caseStudy.metrics}
        testimonial={caseStudy.testimonial}
        accentColor="slate"
      />
      
      <SectorFAQ
        title="Preguntas Frecuentes - Tech"
        subtitle="Resolvemos las dudas más habituales sobre M&A en el sector tecnológico"
        faqs={faqs}
        accentColor="slate"
      />
      
      <SectorCTAV2
        title="¿Tienes una empresa tecnológica?"
        description="Obtén una valoración confidencial de tu startup, SaaS o empresa tech. Nuestros expertos en tecnología te asesorarán sin compromiso."
        accentColor="slate"
      />
      
      <Footer />
    </div>
  );
};

export default Tecnologia;

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Camera, Flame, Lock, TrendingUp, Globe, Scale, Handshake, Users, Award, Building2, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema, getBreadcrumbSchema } from '@/utils/seo/schemas';
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
import { Button } from '@/components/ui/button';

/* ─── Deal cards data ─── */
const highlightedDeals = [
  {
    buyer: 'Scutum Group',
    target: 'APT Instalaciones',
    tag: 'Seguridad electrónica',
    type: 'Sell-side',
    description: 'Asesoramiento en la venta de APT Instalaciones, empresa especializada en instalación y mantenimiento de sistemas de seguridad electrónica, al grupo europeo Scutum.',
  },
  {
    buyer: 'Scutum',
    target: 'Grupo SEA España',
    tag: 'Sistemas de seguridad',
    type: 'Sell-side',
    description: 'Asesoramiento en la integración de Grupo SEA España dentro de la plataforma de consolidación de Scutum en el mercado ibérico de sistemas de seguridad.',
  },
  {
    buyer: 'Mitie',
    target: 'Visegurity',
    tag: 'Vigilancia',
    type: 'Buy-side',
    description: 'Asesoramiento al grupo británico Mitie en la adquisición de Visegurity, empresa española líder en servicios de vigilancia y seguridad integral.',
  },
  {
    buyer: 'Scutum',
    target: 'Kosmos Group',
    tag: 'Sistemas contra incendios',
    type: 'Sell-side',
    description: 'Asesoramiento en la venta de Kosmos Group, especialista en instalación y mantenimiento de sistemas de protección contra incendios, al grupo Scutum.',
  },
];

const Seguridad = () => {
  const location = useLocation();
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
      icon: Lock,
      title: 'Ciberseguridad',
      description: 'Servicios de ciberseguridad, auditoría IT y protección de datos.',
      features: ['SOC / SIEM', 'Compliance RGPD', 'Contratos recurrentes']
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
    <div className="min-h-screen bg-background pt-24 md:pt-[104px]">
      <SEOHead 
        title="M&A Sector Seguridad | Fusiones y Adquisiciones Seguridad Privada - Capittal"
        description="Capittal es la firma líder en M&A del sector seguridad en España. Asesoramos en compraventa de empresas de seguridad privada, alarmas, vigilancia y servicios auxiliares."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="M&A seguridad privada, fusiones adquisiciones seguridad, vender empresa vigilancia, valoración alarmas, compraventa empresas seguridad, ciberseguridad M&A, sistemas contra incendios, control de accesos"
        structuredData={[
          getServiceSchema(
            "M&A Sector Seguridad",
            "Asesoramiento especializado en fusiones y adquisiciones para empresas de seguridad privada, alarmas, vigilancia y servicios auxiliares",
            "Mergers & Acquisitions"
          ),
          getWebPageSchema(
            "M&A Sector Seguridad",
            "Capittal es la firma líder en M&A del sector seguridad en España",
            "https://capittal.es/sectores/seguridad"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Sectores', url: 'https://capittal.es/sectores' },
            { name: 'Seguridad', url: 'https://capittal.es/sectores/seguridad' }
          ])
        ]}
      />
      <Header />
      
      {/* 1. Hero Section */}
      <SectorHeroV2
        badge="Sector Seguridad"
        title="Especialistas en M&A del Sector Seguridad"
        description="Líderes en asesoramiento de fusiones y adquisiciones para empresas de seguridad privada, sistemas de alarmas, vigilancia y servicios auxiliares en España y Europa."
        metrics={heroMetrics}
        accentColor="slate"
      />
      
      {/* 2. Nuestro expertise en seguridad */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Nuestro expertise en seguridad
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p>
              En Capittal contamos con un conocimiento profundo del sector de la <strong>seguridad privada</strong> en España y Europa. 
              Hemos asesorado en múltiples operaciones que abarcan desde empresas de <strong>vigilancia</strong> tradicional hasta 
              compañías líderes en <strong>alarmas</strong>, <strong>sistemas contra incendios</strong>, <strong>control de accesos</strong> 
              y <strong>ciberseguridad</strong>.
            </p>
            <p>
              {/* PLACEHOLDER: ~400 palabras de copy detallado sobre el expertise de Capittal en el sector seguridad.
                  Incluir naturalmente los keywords: seguridad privada, vigilancia, alarmas, 
                  sistemas contra incendios, control de accesos, ciberseguridad.
                  
                  Sugerencia de estructura:
                  - Párrafo sobre trayectoria y operaciones cerradas
                  - Párrafo sobre conocimiento del marco regulatorio (Ley de Seguridad Privada)
                  - Párrafo sobre comprensión de los modelos de negocio (recurrencia de contratos, CRAs, etc.)
                  - Párrafo sobre la red de compradores estratégicos y financieros
                  - Párrafo sobre la convergencia entre seguridad física y digital
              */}
              Nuestro equipo comprende las particularidades de cada subsector: desde la gestión de personal habilitado en vigilancia 
              privada hasta la valoración de carteras de conexiones en centrales receptoras de alarmas. Entendemos las dinámicas 
              regulatorias, los modelos de recurrencia de ingresos y los factores que impulsan la consolidación del mercado.
            </p>
            <p>
              La convergencia entre seguridad física y ciberseguridad está creando nuevas oportunidades de crecimiento y valoración. 
              Empresas que integran servicios de vigilancia con sistemas electrónicos y soluciones de control de accesos obtienen 
              valoraciones premium por su propuesta de valor integral.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Operaciones destacadas */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Operaciones destacadas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Selección de transacciones representativas asesoradas por Capittal en el sector seguridad
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {highlightedDeals.map((deal, idx) => (
              <div 
                key={idx} 
                className="bg-background rounded-xl border border-border p-6 md:p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {deal.tag}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    deal.type === 'Sell-side' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {deal.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {deal.buyer} <span className="text-muted-foreground font-normal">/</span> {deal.target}
                </h3>
                <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                  {deal.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Tendencias M&A en seguridad */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            El sector seguridad en España: tendencias M&A
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Las principales fuerzas que están moldeando el mapa de fusiones y adquisiciones en seguridad
          </p>

          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Consolidación</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-[52px]">
                {/* PLACEHOLDER: ~150 palabras sobre consolidación del sector.
                    Temas: fragmentación del mercado, rollups de PE, grandes operadores absorbiendo pymes,
                    concentración acelerada post-COVID, búsqueda de escala para licitar contratos públicos. */}
                El mercado español de seguridad privada se encuentra altamente fragmentado, con más de 1.500 empresas 
                autorizadas por el Ministerio del Interior. Esta fragmentación atrae a fondos de private equity que 
                ejecutan estrategias de buy-and-build, consolidando operadores regionales en plataformas con escala 
                suficiente para competir en licitaciones nacionales y generar sinergias operativas.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Tecnificación</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-[52px]">
                {/* PLACEHOLDER: ~150 palabras sobre tecnificación.
                    Temas: IA en videovigilancia, integración IoT, centrales receptoras cloud,
                    convergencia seguridad física-lógica, control de accesos biométrico. */}
                La transición de vigilancia humana a sistemas electrónicos inteligentes está acelerándose. 
                Tecnologías como la videoanalítica basada en IA, el control de accesos biométrico y las plataformas 
                cloud para centrales receptoras de alarmas están redefiniendo el sector. Las empresas que adoptan 
                estas tecnologías obtienen valoraciones significativamente superiores.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Regulación</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-[52px]">
                {/* PLACEHOLDER: ~150 palabras sobre regulación.
                    Temas: Ley de Seguridad Privada, licencias como barrera de entrada,
                    normativa sobre CRAs, requisitos de personal habilitado, compliance. */}
                La Ley de Seguridad Privada y su desarrollo reglamentario establecen barreras de entrada significativas: 
                licencias, habilitaciones de personal, requisitos de capital mínimo y auditorías periódicas. 
                Estas barreras regulatorias protegen a los operadores establecidos y generan un entorno favorable 
                para las valoraciones, especialmente para empresas con historial de cumplimiento impecable.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Internacionalización</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-[52px]">
                {/* PLACEHOLDER: ~150 palabras sobre internacionalización.
                    Temas: interés de grupos europeos (Scutum, Securitas, G4S), expansión a LATAM,
                    fondos paneuropeos, cross-border M&A, arbitraje de múltiplos. */}
                Grupos europeos como Scutum, Securitas y Stanley Security están activamente adquiriendo empresas 
                españolas para ampliar su cobertura ibérica. España ofrece un atractivo arbitraje de múltiplos 
                respecto a otros mercados europeos, lo que motiva la entrada de compradores internacionales 
                buscando plataformas con potencial de crecimiento en la Península Ibérica y LATAM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ¿Por qué Capittal? */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Por qué Capittal para el sector seguridad?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La combinación de expertise sectorial y capacidad de ejecución que marca la diferencia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background rounded-xl border border-border p-8">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Conocimiento sectorial profundo</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Años de experiencia asesorando exclusivamente en el sector seguridad nos permiten entender 
                las particularidades de cada subsector: desde la regulación de vigilancia privada hasta la 
                valoración de carteras de alarmas y cuotas recurrentes.
              </p>
            </div>

            <div className="bg-background rounded-xl border border-border p-8">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Red de contactos con PEs internacionales</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Mantenemos relaciones activas con los principales fondos de private equity europeos que 
                invierten en seguridad: desde plataformas de consolidación paneuropeas hasta fondos 
                especializados en servicios B2B recurrentes.
              </p>
            </div>

            <div className="bg-background rounded-xl border border-border p-8">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-5">
                <Award className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Track record demostrable</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Operaciones cerradas con éxito con compradores como Scutum Group y Mitie avalan 
                nuestra capacidad de ejecución. Cada transacción refuerza nuestro posicionamiento como 
                referente en M&A del sector seguridad en España.
              </p>
            </div>

          </div>
        </div>
      </section>

      <SectorStatsV2 
        title="El Sector Seguridad en Cifras"
        subtitle="Un mercado en consolidación con alta demanda de adquisiciones"
        stats={stats}
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
      
      {/* Simulador CTA */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full mb-4">Nuevo</span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Simulador de operación para seguridad privada
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Calcula el valor estimado de tu empresa y simula la estructura de deal con parámetros reales del mercado español.
          </p>
          <Link to="/lp/simulador-seguridad">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 text-base px-8 py-6">
              Acceder al simulador
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. CTA Final */}
      <section className="py-20 md:py-28 bg-slate-900">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Estás considerando una operación en el sector seguridad?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
            Habla con nuestros especialistas en M&A del sector seguridad. 
            Confidencialidad absoluta y sin compromiso.
          </p>
          <Link to="/contacto">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-base px-8 py-6">
              Contactar con un especialista
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Seguridad;

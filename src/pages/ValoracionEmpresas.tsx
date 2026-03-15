import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Building, Scale, ArrowRight, Calculator, CheckCircle, Users, FileText, Target, Shield, Lightbulb } from 'lucide-react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getWebPageSchema, getFAQSchema, getHowToSchema, getWebApplicationSchema } from '@/utils/seo/schemas';

/* ─── Constants ─── */

const SCENARIOS = [
  {
    title: 'Venta de la empresa',
    text: 'Conocer el valor razonable te permite negociar con compradores potenciales desde una posición de fuerza, maximizando el precio final.',
    icon: TrendingUp,
  },
  {
    title: 'Búsqueda de inversores',
    text: 'Atrae inversores al demostrar el potencial de crecimiento y rentabilidad de tu negocio, justificando la inversión solicitada.',
    icon: BarChart3,
  },
  {
    title: 'Fusiones y adquisiciones',
    text: 'Identifica sinergias y oportunidades de crecimiento al fusionarte con otra empresa, estableciendo una valoración equitativa para ambas partes.',
    icon: Building,
  },
  {
    title: 'Reestructuración interna',
    text: 'Toma decisiones informadas sobre la asignación de recursos, la optimización de procesos y la mejora de la eficiencia operativa.',
    icon: Scale,
  },
];

const METHODS = [
  {
    title: 'Descuento de Flujos de Caja (DCF)',
    short: 'El método más preciso y completo',
    full: 'Proyecta los flujos de caja futuros de la empresa y los descuenta a una tasa que refleja el riesgo del negocio. Considera el valor del dinero en el tiempo y el potencial de crecimiento a largo plazo.',
    when: 'Empresas con flujos de caja predecibles y un historial operativo sólido.',
    advantage: 'Considera el valor del dinero en el tiempo y el potencial de crecimiento a largo plazo.',
    limitation: 'Requiere proyecciones financieras precisas y una tasa de descuento adecuada.',
    icon: TrendingUp,
  },
  {
    title: 'Múltiplos de Mercado',
    short: 'Rápido y fácil de aplicar',
    full: 'Compara la empresa con otras similares que cotizan en bolsa o que han sido vendidas recientemente. Utiliza ratios como el PER (precio/beneficio) o el EV/EBITDA (valor de empresa/EBITDA) para estimar el valor.',
    when: 'Empresas en sectores con muchas transacciones comparables y datos públicos disponibles.',
    advantage: 'Fácil de aplicar y entender, utiliza datos de mercado reales.',
    limitation: 'Puede no reflejar las características únicas de la empresa.',
    icon: BarChart3,
  },
  {
    title: 'Valoración Patrimonial',
    short: 'Útil para empresas con muchos activos',
    full: 'Suma el valor de todos los activos de la empresa (inmuebles, inventario, equipos, etc.) y resta los pasivos (deudas, obligaciones, etc.). Refleja el valor liquidativo de la empresa en caso de venta.',
    when: 'Empresas con muchos activos tangibles y un historial de pérdidas o baja rentabilidad.',
    advantage: 'Fácil de entender y calcular, proporciona un valor mínimo de referencia.',
    limitation: 'No considera el potencial de crecimiento ni la rentabilidad futura.',
    icon: Building,
  },
  {
    title: 'Transacciones Comparables',
    short: 'Basado en operaciones reales',
    full: 'Analiza las valoraciones de empresas similares que han sido adquiridas recientemente. Ajusta los precios de transacción por las diferencias en tamaño, rentabilidad y riesgo.',
    when: 'Empresas en sectores con un mercado M&A activo y datos de transacciones disponibles.',
    advantage: 'Refleja las condiciones reales del mercado y las expectativas de los compradores.',
    limitation: 'Requiere acceso a información detallada sobre transacciones comparables.',
    icon: Scale,
  },
];

const PROCESS_STEPS = [
  {
    name: 'Recopilación de información',
    text: 'Solicitamos los estados financieros de los últimos 3-5 años, el plan de negocio, la estructura organizativa, la lista de clientes y proveedores, los contratos relevantes y cualquier otra información que pueda influir en la valoración.',
  },
  {
    name: 'Análisis de la empresa y su entorno',
    text: 'Analizamos la situación financiera, la posición competitiva, las fortalezas y debilidades, las oportunidades y amenazas, el sector en el que opera y las perspectivas macroeconómicas.',
  },
  {
    name: 'Selección de los métodos de valoración',
    text: 'Seleccionamos los métodos de valoración más adecuados para la empresa, en función de sus características, su sector y la disponibilidad de información. Combinamos varios métodos para triangular un rango de valor razonable.',
  },
  {
    name: 'Cálculo del valor',
    text: 'Aplicamos los métodos de valoración seleccionados y calculamos el valor de la empresa. Realizamos ajustes para reflejar los factores cualitativos y cuantitativos que influyen en el precio final.',
  },
  {
    name: 'Elaboración del informe',
    text: 'Elaboramos un informe detallado que explica la metodología utilizada, los supuestos clave, los resultados obtenidos y las conclusiones. El informe incluye un rango de valor razonable y una justificación del mismo.',
  },
];

const FACTORS = [
  {
    title: 'Rentabilidad',
    text: 'Un historial de beneficios sólidos y crecientes aumenta el valor de la empresa. Los inversores buscan empresas que generen un retorno atractivo sobre el capital invertido.',
  },
  {
    title: 'Crecimiento',
    text: 'Las empresas con un alto potencial de crecimiento son más valiosas. Los inversores están dispuestos a pagar más por una empresa que puede aumentar sus ingresos y beneficios en el futuro.',
  },
  {
    title: 'Riesgo',
    text: 'Un menor riesgo reduce la tasa de descuento y aumenta el valor de la empresa. Los inversores prefieren empresas con un modelo de negocio estable, una base de clientes diversificada y una gestión experimentada.',
  },
  {
    title: 'Activos',
    text: 'Los activos tangibles (inmuebles, equipos, inventario) y los activos intangibles (marcas, patentes, fondo de comercio) contribuyen al valor de la empresa.',
  },
  {
    title: 'Deuda',
    text: 'Un alto nivel de deuda reduce el valor de la empresa. Los inversores consideran que la deuda es un riesgo, ya que reduce los flujos de caja disponibles para los accionistas.',
  },
  {
    title: 'Equipo directivo',
    text: 'Un equipo directivo experimentado y competente aumenta el valor de la empresa. Los inversores confían en que un buen equipo directivo puede ejecutar la estrategia y generar valor a largo plazo.',
  },
];

const FAQ_DATA = [
  {
    question: '¿Qué es una valoración de empresas?',
    answer: 'Una valoración de empresas es un proceso que determina el valor económico de una empresa o de una parte de ella. Se utiliza para tomar decisiones informadas sobre la compra, venta, fusión, inversión o reestructuración de una empresa.',
  },
  {
    question: '¿Por qué es importante valorar una empresa?',
    answer: 'Es importante para conocer el valor razonable de una empresa, negociar con compradores o vendedores, atraer inversores, planificar una sucesión o reestructuración, y tomar decisiones estratégicas.',
  },
  {
    question: '¿Qué métodos se utilizan para valorar una empresa?',
    answer: 'Se utilizan métodos como el descuento de flujos de caja (DCF), los múltiplos de mercado, la valoración patrimonial y las transacciones comparables. La elección del método depende de las características de la empresa y la disponibilidad de información.',
  },
  {
    question: '¿Qué factores influyen en la valoración de una empresa?',
    answer: 'Influyen factores como la rentabilidad, el crecimiento, el riesgo, los activos, la deuda, el equipo directivo, la posición competitiva, el sector y las perspectivas macroeconómicas.',
  },
  {
    question: '¿Quién puede realizar una valoración de empresas?',
    answer: 'Puede ser realizada por profesionales como analistas financieros, consultores de M&A, auditores o expertos independientes. Es importante elegir a un profesional con experiencia y conocimientos en el sector de la empresa.',
  },
  {
    question: '¿Cuánto cuesta una valoración de empresas?',
    answer: 'Depende de la complejidad de la empresa, la cantidad de información disponible y el alcance del trabajo. Puede variar desde unos pocos miles de euros hasta decenas de miles de euros.',
  },
];

/* ─── Component ─── */

const ValoracionEmpresas = () => {
  useEffect(() => {
    const canonicalUrl = 'https://capittal.es/valoracion-empresas';
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  }, []);

  const structuredData = [
    getWebPageSchema(
      'Valoración de Empresas en España: Guía Completa, Métodos y Calculadora Gratuita - Capittal',
      'Guía completa sobre valoración de empresas en España: métodos DCF, múltiplos EBITDA, comparables y patrimonial. Calculadora gratuita online. Asesoramiento profesional M&A.',
      'https://capittal.es/valoracion-empresas'
    ),
    getFAQSchema(FAQ_DATA),
    getHowToSchema(
      'Cómo valorar una empresa en España',
      'Proceso paso a paso para realizar una valoración empresarial profesional en España, desde la recopilación de datos hasta el informe final.',
      PROCESS_STEPS.map(s => ({ name: s.name, text: s.text, url: 'https://capittal.es/valoracion-empresas' }))
    ),
    getWebApplicationSchema(
      'Calculadora de Valoración de Empresas Gratuita - Capittal',
      'Herramienta online gratuita para calcular el valor de tu empresa usando múltiplos de EBITDA y facturación ajustados por sector. Resultado inmediato y confidencial.',
      'https://capittal.es/lp/calculadora',
      'BusinessApplication'
    ),
  ];

  return (
    <>
      <SEOHead
        title="Valoración de Empresas en España: Guía Completa, Métodos y Calculadora Gratuita - Capittal"
        description="Guía completa sobre valoración de empresas en España: métodos DCF, múltiplos EBITDA, comparables y patrimonial. Calculadora gratuita online. Asesoramiento profesional M&A."
        structuredData={structuredData}
      />
      <UnifiedLayout variant="home">
        {/* ═══ Section 1: Hero AEO ═══ */}
        <section className="pb-16 md:pb-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Valoración de Empresas en España: Guía Completa de Métodos, Herramientas y Asesoramiento Profesional
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
              Conocer el valor real de tu empresa es una de las decisiones más importantes que puedes tomar como empresario.
              Ya sea que estés considerando vender tu negocio, buscar inversores, planificar una sucesión generacional o
              simplemente quieras entender tu posición competitiva en el mercado, una valoración empresarial rigurosa te
              proporciona la información necesaria para tomar decisiones con confianza.
            </p>
            <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              En España, el mercado de fusiones y adquisiciones (M&A) ha experimentado un crecimiento sostenido en los
              últimos años, con más de 2.800 operaciones anuales según datos de TTR Data. Sin embargo, muchos empresarios
              desconocen el valor real de sus compañías o se basan en estimaciones subjetivas que no reflejan las condiciones
              del mercado. Esta guía te explica los principales métodos de valoración utilizados en España, los factores
              que influyen en el precio final y las herramientas disponibles para obtener una primera estimación.
            </p>
          </div>
        </section>

        {/* ═══ Section 2: Por qué valorar tu empresa ═══ */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              ¿Por qué necesitas valorar tu empresa?
            </h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-10 leading-relaxed">
              Existen múltiples situaciones en las que conocer el valor de tu empresa es fundamental.
              Estas son las más habituales en el mercado español:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SCENARIOS.map((s, i) => (
                <div key={i} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{s.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 3: Métodos de valoración ═══ */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              Métodos de Valoración de Empresas
            </h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-10 leading-relaxed">
              No existe un único método válido para todas las empresas. Los profesionales combinan varias
              metodologías para triangular un rango de valor razonable. Estos son los cuatro métodos más
              utilizados en España:
            </p>
            <div className="space-y-6">
              {METHODS.map((m, i) => (
                <div key={i} className="bg-card rounded-xl p-6 md:p-8 shadow-sm border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <m.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{m.title}</h3>
                      <p className="text-primary font-medium text-sm mb-3">{m.short}</p>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{m.full}</p>
                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <span className="font-medium text-foreground block mb-1">Cuándo usarlo</span>
                          <span className="text-muted-foreground">{m.when}</span>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <span className="font-medium text-foreground block mb-1">Ventaja</span>
                          <span className="text-muted-foreground">{m.advantage}</span>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <span className="font-medium text-foreground block mb-1">Limitación</span>
                          <span className="text-muted-foreground">{m.limitation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 4: CTA Calculadora ═══ */}
        <section className="py-16 px-4 bg-primary/5">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
              <Calculator className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Calcula gratis el valor de tu empresa
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Usa nuestra calculadora gratuita para obtener una estimación orientativa del valor de tu empresa
              basada en múltiplos de EBITDA y facturación ajustados por sector. Resultado inmediato y confidencial.
            </p>
            <Link
              to="/lp/calculadora"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
            >
              <Calculator className="w-5 h-5" />
              Acceder a la Calculadora Gratuita
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ═══ Section 5: Proceso ═══ */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              Proceso de Valoración Profesional
            </h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-10 leading-relaxed">
              Una valoración empresarial rigurosa sigue un proceso estructurado que garantiza la precisión
              y fiabilidad de los resultados. Estos son los pasos que nuestro equipo sigue:
            </p>
            <div className="space-y-6">
              {PROCESS_STEPS.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{step.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 6: Factores ═══ */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              Factores que influyen en la valoración
            </h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-10 leading-relaxed">
              El valor de una empresa no depende solo de sus estados financieros. Estos son los factores
              cualitativos y cuantitativos que más impactan en la valoración final:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FACTORS.map((f, i) => (
                <div key={i} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-foreground">{f.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 7: FAQ ═══ */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
              Preguntas Frecuentes sobre Valoración de Empresas
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQ_DATA.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ═══ Section 8: CTA Final ═══ */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              ¿Necesitas una valoración profesional?
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Nuestra calculadora ofrece una estimación inicial orientativa. Para una valoración formal
              con informe certificado, análisis de estados financieros, posición competitiva y factores
              cualitativos, contacta con nuestro equipo de expertos en M&A. Más de 15 años de experiencia
              en valoraciones empresariales en España.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
            >
              Solicita una valoración profesional
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </UnifiedLayout>
    </>
  );
};

export default ValoracionEmpresas;

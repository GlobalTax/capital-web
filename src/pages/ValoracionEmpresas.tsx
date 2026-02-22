import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Building, Scale, ArrowRight, Calculator, CheckCircle, Users, FileText, Target, Shield, Lightbulb } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getWebPageSchema, getFAQSchema, getHowToSchema, getWebApplicationSchema } from '@/utils/seo/schemas';

/* ─── Data ─── */

const SCENARIOS = [
  { icon: TrendingUp, title: 'Venta de la empresa', text: 'Conocer el valor de mercado es imprescindible para negociar con compradores desde una posición informada. Una valoración rigurosa evita malvender y permite justificar el precio pedido con datos objetivos.' },
  { icon: Users, title: 'Entrada o salida de socios', text: 'Cuando un socio quiere incorporarse o salir del capital, es necesario determinar el valor justo de las participaciones para evitar conflictos y garantizar una transacción equitativa para todas las partes.' },
  { icon: Target, title: 'Búsqueda de inversión', text: 'Los inversores —fondos de capital riesgo, business angels o family offices— exigen una valoración fundamentada antes de invertir. Un informe profesional acelera la captación de financiación y demuestra seriedad.' },
  { icon: FileText, title: 'Planificación fiscal y sucesoria', text: 'Las operaciones de herencia, donación o reestructuración societaria requieren una valoración a efectos fiscales. Una estimación incorrecta puede derivar en sanciones tributarias o en un pago excesivo de impuestos.' },
  { icon: Shield, title: 'Procesos judiciales o arbitrajes', text: 'En litigios entre socios, divorcios con patrimonio empresarial o reclamaciones contractuales, un informe de valoración pericial certificado es una pieza clave para defender la posición ante los tribunales.' },
  { icon: Lightbulb, title: 'Planificación estratégica', text: 'Conocer el valor de tu empresa te permite medir el impacto de tus decisiones estratégicas, desde abrir nuevas líneas de negocio hasta desinvertir en áreas no rentables, y comparar tu evolución año a año.' },
];

const METHODS = [
  {
    icon: TrendingUp,
    title: 'Descuento de Flujos de Caja (DCF)',
    short: 'El método más riguroso para valoraciones formales',
    full: 'El método DCF (Discounted Cash Flow) estima el valor intrínseco de una empresa proyectando sus flujos de caja libres futuros y descontándolos a valor presente mediante una tasa de descuento (WACC). Es el método preferido por analistas financieros y bancos de inversión porque captura el potencial real de generación de valor del negocio. Se basa en supuestos de crecimiento de ingresos, márgenes operativos, inversiones necesarias (CAPEX) y necesidades de capital circulante. Es especialmente adecuado para empresas con flujos de caja predecibles, contratos recurrentes o modelos de negocio estables. Su principal limitación es la sensibilidad a los supuestos: pequeñas variaciones en la tasa de crecimiento o el WACC pueden generar cambios significativos en la valoración final.',
    when: 'Empresas con historial financiero estable y flujos predecibles',
    advantage: 'Captura el valor intrínseco y potencial de crecimiento',
    limitation: 'Sensible a los supuestos de proyección',
  },
  {
    icon: BarChart3,
    title: 'Múltiplos de Mercado (EV/EBITDA, EV/Revenue)',
    short: 'Rápido, intuitivo y basado en el mercado actual',
    full: 'El método de múltiplos compara tu empresa con otras similares del mismo sector utilizando ratios como EV/EBITDA (Enterprise Value sobre EBITDA) o EV/Revenue (Enterprise Value sobre facturación). En España, los múltiplos EV/EBITDA para PYMES oscilan entre 3x y 8x dependiendo del sector, tamaño y crecimiento. Por ejemplo, una empresa tecnológica SaaS puede cotizar a 10-15x EBITDA, mientras que una empresa industrial madura puede situarse en 4-6x. Este método es especialmente útil cuando existen suficientes empresas comparables cotizadas o transacciones recientes en el sector. Su principal ventaja es la rapidez y la referencia directa al mercado; su limitación es que no captura las particularidades únicas de cada empresa.',
    when: 'Sectores con suficientes comparables y transacciones recientes',
    advantage: 'Refleja condiciones reales del mercado de M&A',
    limitation: 'No captura particularidades únicas de cada empresa',
  },
  {
    icon: Building,
    title: 'Valoración por Activos (Valor Patrimonial)',
    short: 'Ideal para empresas intensivas en activos',
    full: 'La valoración patrimonial calcula el valor neto contable ajustado de la empresa: el valor real de mercado de todos sus activos (inmuebles, maquinaria, existencias, cuentas por cobrar, patentes) menos el total de pasivos y deudas. Es el método más conservador y proporciona un «suelo» de valoración. Se utiliza principalmente en empresas inmobiliarias, holdings de participaciones, empresas industriales con activos tangibles significativos o negocios en situación de liquidación. Es importante distinguir entre valor contable y valor de mercado: un inmueble comprado hace 20 años puede tener un valor contable muy inferior a su valor de mercado actual. Por ello, se recomienda ajustar los activos a valor razonable para obtener una estimación precisa.',
    when: 'Inmobiliarias, holdings, empresas en liquidación',
    advantage: 'Método más conservador, proporciona un suelo de valoración',
    limitation: 'No refleja la capacidad de generación de beneficios futuros',
  },
  {
    icon: Scale,
    title: 'Transacciones Comparables',
    short: 'Basado en precios reales pagados en el mercado',
    full: 'Este método analiza el precio pagado en transacciones reales de compraventa de empresas similares en el mismo sector y geografía. Es muy valorado por inversores y fondos de adquisición porque refleja lo que el mercado realmente paga, no una estimación teórica. En Capittal, mantenemos una base de datos propietaria de transacciones de M&A en España que nos permite aplicar múltiplos específicos por sector, tamaño de empresa y región. Las fuentes incluyen registros mercantiles, bases de datos internacionales (MergerMarket, Capital IQ) y nuestra propia experiencia en operaciones cerradas. La principal limitación es la disponibilidad de datos: muchas transacciones de PYMES no son públicas, lo que puede dificultar encontrar comparables adecuados.',
    when: 'Cuando existen transacciones recientes de empresas similares',
    advantage: 'Refleja precios reales pagados en el mercado',
    limitation: 'Disponibilidad limitada de datos en transacciones privadas',
  },
];

const PROCESS_STEPS = [
  { name: 'Recopilación de información financiera', text: 'El primer paso es reunir los estados financieros de los últimos 3 a 5 años: cuenta de resultados, balance de situación y estado de flujos de efectivo. También se recopila información sobre contratos principales, cartera de clientes, activos tangibles e intangibles, y estructura de deuda. Cuanta mayor sea la calidad de la información, más precisa será la valoración.' },
  { name: 'Análisis del sector y mercado', text: 'Se estudia el sector en el que opera la empresa: tendencias de crecimiento, nivel de competencia, barreras de entrada, regulación aplicable y múltiplos de transacciones recientes. Este análisis contextual es esencial para determinar qué múltiplos y tasas de descuento son apropiados y cómo se posiciona la empresa frente a sus competidores.' },
  { name: 'Aplicación de metodologías de valoración', text: 'Se aplican al menos dos metodologías complementarias —típicamente DCF y múltiplos de mercado— para obtener un rango de valoración robusto. Cada método se calibra con datos específicos del sector y se ajusta por factores cualitativos como la dependencia del fundador, la diversificación de clientes o la calidad del equipo directivo.' },
  { name: 'Ajustes y normalización del EBITDA', text: 'Se normaliza el EBITDA eliminando partidas extraordinarias, gastos personales del empresario canalizados a través de la empresa, retribuciones por encima o por debajo de mercado, y otros elementos no recurrentes. Esta normalización refleja la capacidad real de generación de beneficios del negocio y es fundamental para una valoración justa.' },
  { name: 'Determinación del rango de valor', text: 'Combinando los resultados de las distintas metodologías y aplicando los ajustes pertinentes, se establece un rango de valoración con un valor mínimo, un valor central y un valor máximo. Este rango tiene en cuenta distintos escenarios (conservador, base, optimista) y proporciona una referencia sólida para la negociación.' },
  { name: 'Elaboración del informe de valoración', text: 'El proceso culmina con un informe profesional que documenta la metodología utilizada, los supuestos clave, los datos de mercado empleados, los ajustes realizados y las conclusiones de valor. Este informe es utilizable en procesos de venta, negociaciones con inversores, procedimientos judiciales y planificación fiscal.' },
];

const FACTORS = [
  { title: 'Crecimiento y tendencia de ingresos', text: 'Empresas con crecimiento sostenido de facturación reciben múltiplos superiores. Un crecimiento anual del 15-20% puede duplicar el múltiplo respecto a una empresa estancada.' },
  { title: 'Rentabilidad y márgenes operativos', text: 'Márgenes EBITDA superiores a la media del sector indican eficiencia operativa y capacidad de generación de caja, factores que aumentan directamente la valoración.' },
  { title: 'Sector y posición competitiva', text: 'Sectores con altas barreras de entrada, crecimiento estructural y consolidación activa (como tecnología, salud o seguridad) obtienen múltiplos más altos que sectores maduros o commoditizados.' },
  { title: 'Dependencia del fundador', text: 'Si la empresa depende excesivamente del fundador o propietario, los compradores aplicarán un descuento significativo. Un equipo directivo sólido y procesos documentados aumentan el valor.' },
  { title: 'Diversificación de clientes', text: 'Una cartera concentrada en pocos clientes supone un riesgo para el comprador. Empresas con una base diversificada —ningún cliente superior al 10-15% de la facturación— reciben valoraciones superiores.' },
  { title: 'Recurrencia de ingresos', text: 'Modelos de negocio con ingresos recurrentes (contratos a largo plazo, suscripciones, servicios continuados) son más valorados que los dependientes de proyectos puntuales o ventas únicas.' },
];

const FAQ_DATA = [
  { question: '¿Es gratuita la calculadora de valoración?', answer: 'Sí, nuestra calculadora de valoración de empresas es completamente gratuita y sin compromiso. Puedes utilizarla tantas veces como necesites para obtener una estimación orientativa del valor de tu negocio basada en múltiplos sectoriales actualizados.' },
  { question: '¿Qué métodos de valoración utilizáis?', answer: 'Nuestra calculadora utiliza el método de múltiplos de EBITDA y de facturación, ajustados por sector, tamaño de empresa, márgenes operativos y tasa de crecimiento. Para valoraciones profesionales, combinamos DCF (descuento de flujos de caja), múltiplos de mercado, transacciones comparables y valoración patrimonial.' },
  { question: '¿Cuánto tarda una valoración profesional?', answer: 'Una valoración profesional completa realizada por nuestro equipo de expertos en M&A suele tardar entre 2 y 4 semanas, dependiendo de la complejidad de la empresa y la disponibilidad de la documentación financiera necesaria.' },
  { question: '¿Los datos que introduzco son confidenciales?', answer: 'Absolutamente. Todos los datos introducidos en la calculadora son tratados con total confidencialidad. No compartimos información con terceros y cumplimos estrictamente con la normativa europea de protección de datos (RGPD).' },
  { question: '¿Qué sectores cubre la calculadora?', answer: 'La calculadora cubre más de 20 sectores, incluyendo tecnología, industrial, servicios profesionales, retail, hostelería, salud, educación, construcción, transporte y logística, alimentación, energía, medio ambiente, seguridad y muchos más.' },
  { question: '¿Cómo se calcula el valor de una empresa en España?', answer: 'El valor de una empresa en España se calcula habitualmente combinando varias metodologías: descuento de flujos de caja (DCF), múltiplos de EBITDA sectoriales (que en España oscilan entre 3x y 8x para PYMES), transacciones comparables y valoración patrimonial. El método más utilizado en operaciones de M&A es el de múltiplos de EBITDA, ajustado por factores como el crecimiento, los márgenes operativos y la posición competitiva.' },
  { question: '¿Cuánto vale una empresa que factura 1 millón de euros?', answer: 'El valor depende fundamentalmente del sector, la rentabilidad y el crecimiento. Una empresa que factura 1 millón de euros con un margen EBITDA del 20% (EBITDA de 200.000€) podría valorarse entre 600.000€ y 1.600.000€ aplicando múltiplos de 3x a 8x EBITDA según el sector. Empresas tecnológicas o con alto crecimiento pueden superar estos rangos significativamente.' },
  { question: '¿Qué múltiplo de EBITDA aplica a mi sector?', answer: 'Los múltiplos varían significativamente por sector en España: tecnología/SaaS (8-15x), salud/healthcare (7-10x), seguridad privada (6-9x), servicios profesionales (5-8x), industrial/manufactura (4-7x), construcción (3-6x), hostelería (3-5x). Estos rangos se ajustan además por el tamaño de la empresa, su tasa de crecimiento y la calidad de sus márgenes operativos.' },
  { question: '¿Cuál es la diferencia entre valor de empresa (Enterprise Value) y valor de equity?', answer: 'El Enterprise Value (EV) o valor de empresa incluye el valor total del negocio: equity más deuda neta. El valor de equity es lo que realmente recibe el vendedor después de descontar la deuda financiera y sumar la caja excedente. Por ejemplo, si una empresa tiene un EV de 5 millones y una deuda neta de 1 millón, el valor de equity para el accionista es de 4 millones de euros.' },
  { question: '¿Es obligatorio valorar una empresa para venderla?', answer: 'No es legalmente obligatorio, pero es altamente recomendable. Sin una valoración fundamentada, el vendedor carece de una referencia objetiva para negociar y corre el riesgo de aceptar un precio por debajo del valor real. Además, una valoración profesional acelera el proceso de venta, genera confianza en el comprador y puede ser necesaria a efectos fiscales para justificar el precio de la transacción ante Hacienda.' },
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
      <Header />

      <main className="min-h-screen bg-background">
        {/* ═══ Section 1: Hero AEO ═══ */}
        <section className="py-16 md:py-24 px-4">
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
              Una valoración profesional no solo te da un número: te proporciona una comprensión profunda
              de los generadores de valor de tu negocio y las palancas para mejorarlo.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SCENARIOS.map((s) => (
                <div key={s.title} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 3: Métodos de Valoración ampliados ═══ */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              Métodos de Valoración de Empresas
            </h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-10 leading-relaxed">
              No existe un único método para valorar una empresa. Los profesionales de M&A combinan varias
              metodologías para obtener un rango de valor fiable. A continuación, explicamos los cuatro métodos
              más utilizados en España, sus ventajas, limitaciones y cuándo aplicar cada uno.
            </p>
            <div className="space-y-8">
              {METHODS.map((method) => (
                <article key={method.title} className="bg-card border border-border rounded-xl p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <method.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg md:text-xl">{method.title}</h3>
                      <p className="text-primary text-sm font-medium">{method.short}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">{method.full}</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Cuándo usarlo</p>
                      <p className="text-sm text-muted-foreground">{method.when}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Ventaja principal</p>
                      <p className="text-sm text-muted-foreground">{method.advantage}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1">Limitación</p>
                      <p className="text-sm text-muted-foreground">{method.limitation}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 4: Proceso paso a paso ═══ */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              Cómo valorar una empresa: proceso paso a paso
            </h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-10 leading-relaxed">
              El proceso de valoración empresarial sigue una metodología estructurada que garantiza
              resultados rigurosos y defendibles. Estos son los seis pasos que seguimos en Capittal
              para cada valoración profesional.
            </p>
            <div className="space-y-6">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.name} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-2">{step.name}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 5: Factores que afectan la valoración ═══ */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              Factores clave que afectan la valoración de una empresa
            </h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-10 leading-relaxed">
              El valor de una empresa no depende únicamente de sus cifras financieras. Los compradores
              e inversores evalúan múltiples factores cualitativos y cuantitativos que pueden aumentar
              o reducir significativamente el precio final de una transacción.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {FACTORS.map((f) => (
                <div key={f.title} className="border border-border rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{f.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 6: Valoración gratuita vs profesional ═══ */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              Valoración online gratuita vs. valoración profesional
            </h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8 leading-relaxed">
              Ambas opciones tienen su utilidad dependiendo de tu situación. Una valoración online gratuita
              es ideal como primer paso para conocer un rango aproximado, mientras que una valoración
              profesional es imprescindible para tomar decisiones de alto impacto económico.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-xl overflow-hidden border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-4 font-semibold text-foreground">Característica</th>
                    <th className="text-center p-4 font-semibold text-foreground">Calculadora gratuita</th>
                    <th className="text-center p-4 font-semibold text-foreground">Valoración profesional</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-muted-foreground">
                  <tr className="border-t border-border"><td className="p-4">Tiempo</td><td className="p-4 text-center">5 minutos</td><td className="p-4 text-center">2-4 semanas</td></tr>
                  <tr className="border-t border-border"><td className="p-4">Coste</td><td className="p-4 text-center">Gratuito</td><td className="p-4 text-center">€3.000 - €50.000+</td></tr>
                  <tr className="border-t border-border"><td className="p-4">Metodología</td><td className="p-4 text-center">Múltiplos sectoriales</td><td className="p-4 text-center">DCF + Múltiplos + Comparables</td></tr>
                  <tr className="border-t border-border"><td className="p-4">Precisión</td><td className="p-4 text-center">Orientativa (±30%)</td><td className="p-4 text-center">Alta precisión (±10%)</td></tr>
                  <tr className="border-t border-border"><td className="p-4">Informe certificado</td><td className="p-4 text-center">No</td><td className="p-4 text-center">Sí</td></tr>
                  <tr className="border-t border-border"><td className="p-4">Uso en negociación</td><td className="p-4 text-center">Referencia inicial</td><td className="p-4 text-center">Documento vinculante</td></tr>
                  <tr className="border-t border-border"><td className="p-4">Validez fiscal/legal</td><td className="p-4 text-center">No</td><td className="p-4 text-center">Sí</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══ Section 7: CTA Calculadora ═══ */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
            <Calculator className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Calcula el valor de tu empresa gratis
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Utiliza nuestra calculadora gratuita de valoración basada en múltiplos de EBITDA y
              benchmarks sectoriales actualizados para el mercado español. Resultado inmediato,
              confidencial y sin compromiso. Más de 20 sectores disponibles.
            </p>
            <Link
              to="/lp/calculadora"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Usar calculadora gratuita
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ═══ Section 8: FAQ ampliado (10 preguntas) ═══ */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              Preguntas frecuentes sobre valoración de empresas en España
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_DATA.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ═══ Section 9: CTA Profesional ═══ */}
        <section className="py-16 px-4">
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
      </main>

      <Footer />
    </>
  );
};

export default ValoracionEmpresas;

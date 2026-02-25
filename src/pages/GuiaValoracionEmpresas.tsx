import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GuideSection, GuideTip, GuideChecklist, GuideCTA } from '@/components/search-funds-guides';
import { getArticleSchema, getFAQSchema, getHowToSchema } from '@/utils/seo/schemas';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BookOpen,
  TrendingUp,
  BarChart3,
  Scale,
  Building2,
  GitCompare,
  AlertTriangle,
  HelpCircle,
  Calculator,
  Phone,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── FAQ data ───
const FAQ_DATA = [
  {
    question: '¿Cuál es el método de valoración más fiable para una PYME española?',
    answer: 'No existe un único método óptimo. Para PYMEs con flujos estables, el DCF combinado con múltiplos sectoriales ofrece el rango más fiable. La clave es usar al menos dos metodologías y triangular resultados. En la práctica, los compradores profesionales (fondos, search funds) siempre aplican múltiples métodos.',
  },
  {
    question: '¿Qué múltiplo de EBITDA se paga en España por sector en 2025?',
    answer: 'Los rangos medios son: Tecnología/SaaS 8-15x, Salud 7-10x, Seguridad 6-9x, Servicios profesionales 5-8x, Industrial 4-7x, Construcción 3-6x, Hostelería 3-5x. Estos múltiplos varían según tamaño (las empresas >10M€ EBITDA cotizan con prima), crecimiento y recurrencia de ingresos.',
  },
  {
    question: '¿Cómo afecta el tamaño de la empresa a su valoración?',
    answer: 'Existe una prima por tamaño significativa. Empresas con EBITDA >5M€ suelen valorarse con múltiplos 1.5-2x superiores a empresas con EBITDA <1M€ del mismo sector. Esto refleja menor riesgo, mayor liquidez y mejor gobernanza corporativa.',
  },
  {
    question: '¿Qué es el descuento por iliquidez y cómo se aplica?',
    answer: 'Las empresas privadas (no cotizadas) aplican un descuento del 15-30% respecto a comparables cotizados, porque las acciones no pueden venderse fácilmente en un mercado público. En España, para PYMES este descuento suele situarse entre el 20-25%.',
  },
  {
    question: '¿Cuándo debo usar valoración patrimonial en lugar de DCF o múltiplos?',
    answer: 'La valoración patrimonial es preferible cuando los activos tangibles son el principal motor de valor: holdings inmobiliarios, empresas agrícolas con terrenos, negocios en liquidación o empresas con activos significativamente infravalorados en balance. No es adecuada para empresas de servicios o tecnología.',
  },
  {
    question: '¿Cómo se normaliza el EBITDA de una empresa familiar?',
    answer: 'Se ajustan gastos personales imputados a la empresa (coches, viajes, seguros), salarios fuera de mercado del propietario, operaciones con partes vinculadas a precios no de mercado, gastos extraordinarios no recurrentes y provisiones excesivas. Un EBITDA normalizado puede ser un 20-40% superior al reportado.',
  },
  {
    question: '¿Qué fuentes de datos existen para comparables en el mercado español?',
    answer: 'Las principales son: TTR (Transactional Track Record) para M&A en Iberia, Capital IQ y PitchBook para datos de transacciones globales, Registro Mercantil para cuentas anuales de empresas españolas, SABI (Bureau van Dijk) para análisis financiero de empresas, e informes sectoriales de KPMG, Deloitte y PwC.',
  },
  {
    question: '¿Es necesario contratar un asesor para valorar mi empresa?',
    answer: 'Para una estimación orientativa, herramientas como nuestra calculadora gratuita ofrecen un punto de partida válido. Sin embargo, para operaciones de compraventa, planificación fiscal, entrada/salida de socios o procesos judiciales, es imprescindible una valoración profesional con informe certificado que soporte la cifra ante terceros.',
  },
];

// ─── Structured data ───
const structuredData = [
  getArticleSchema(
    'Guía Completa de Métodos de Valoración de Empresas: Ejemplos Reales del Mercado Español',
    'Guía educativa de 4000+ palabras con ejemplos numéricos reales del mercado español. Métodos DCF, múltiplos EBITDA por sector, transacciones comparables y valoración patrimonial.',
    'https://capittal.es/guia-valoracion-empresas',
    'https://capittal.es/og-default.jpg',
    '2025-01-15',
    '2025-06-01',
    'Equipo Capittal'
  ),
  getFAQSchema(FAQ_DATA),
  getHowToSchema(
    'Cómo elegir el método de valoración adecuado para tu empresa',
    'Guía paso a paso para seleccionar la metodología de valoración más apropiada según el tipo de empresa, sector y propósito.',
    [
      { name: 'Identifica el propósito de la valoración', text: 'Define si la valoración es para venta, inversión, fiscalidad, sucesión o planificación estratégica. El propósito determina el nivel de detalle y la metodología más adecuada.' },
      { name: 'Analiza el perfil de tu empresa', text: 'Evalúa si tu empresa genera flujos de caja predecibles (favorece DCF), tiene comparables claros en el sector (favorece múltiplos), o su valor reside principalmente en activos tangibles (favorece patrimonial).' },
      { name: 'Selecciona al menos dos metodologías', text: 'Aplica un mínimo de dos métodos complementarios. Por ejemplo: DCF + Múltiplos para empresas operativas, o Patrimonial + Múltiplos para holdings con activos.' },
      { name: 'Recopila datos de mercado actualizados', text: 'Obtén múltiplos sectoriales recientes (TTR, Capital IQ), tasas de descuento actuales (prima de riesgo España) y transacciones comparables de los últimos 24 meses.' },
      { name: 'Triangula resultados y determina un rango', text: 'Compara los valores obtenidos por cada método. Si divergen más del 30%, revisa los supuestos. El rango final debe ser defendible y coherente con el mercado.' },
    ]
  ),
];

const GuiaValoracionEmpresas = () => {
  return (
    <>
      <SEOHead
        title="Guía Completa de Valoración de Empresas: Ejemplos Reales del Mercado Español | Capittal"
        description="Guía educativa con ejemplos numéricos reales: DCF paso a paso, múltiplos EBITDA por sector en España (2024-2025), transacciones comparables y valoración patrimonial. 4000+ palabras."
        canonical="https://capittal.es/guia-valoracion-empresas"
        keywords="cómo valorar una empresa, métodos de valoración de empresas, múltiplos EBITDA España, DCF valoración, transacciones comparables España, valoración PYME"
        structuredData={structuredData}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* ─── HERO ─── */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container max-w-4xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
              <span>/</span>
              <Link to="/valoracion-empresas" className="hover:text-foreground transition-colors">Valoración de Empresas</Link>
              <span>/</span>
              <span className="text-foreground">Guía Completa</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Guía Completa de Métodos de Valoración de Empresas: Ejemplos Reales del Mercado Español
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Valorar una empresa correctamente es una de las decisiones financieras más críticas que puede afrontar un empresario en España. Ya sea para vender tu negocio, negociar con inversores, planificar una sucesión familiar o resolver un conflicto entre socios, la diferencia entre una valoración rigurosa y una estimación superficial puede suponer cientos de miles —o millones— de euros.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              En esta guía, el equipo de <strong>Capittal</strong> —asesores especializados en M&A con experiencia en más de 200 operaciones en España— desglosamos los cuatro métodos principales de valoración con <strong>ejemplos numéricos reales</strong>, tablas de múltiplos actualizados por sector y los errores que vemos repetidamente en PYMEs españolas.
            </p>
            <p className="text-muted-foreground">
              <strong>Tiempo de lectura:</strong> 20 minutos · <strong>Última actualización:</strong> Junio 2025
            </p>
          </div>
        </section>

        <div className="container max-w-4xl py-12">
          {/* ─── ÍNDICE ─── */}
          <GuideSection id="indice" icon={List} title="Índice de Contenidos">
            <nav>
              <ol className="space-y-2 list-decimal list-inside">
                <li><a href="#dcf" className="text-primary hover:underline">Método DCF (Descuento de Flujos de Caja) — con ejemplo numérico completo</a></li>
                <li><a href="#multiplos" className="text-primary hover:underline">Método de Múltiplos — tabla de múltiplos EBITDA por sector en España</a></li>
                <li><a href="#comparables" className="text-primary hover:underline">Transacciones Comparables — fuentes de datos y ajustes</a></li>
                <li><a href="#patrimonial" className="text-primary hover:underline">Valoración Patrimonial — cuándo usar y ejemplo</a></li>
                <li><a href="#comparativa" className="text-primary hover:underline">Comparativa de métodos — cuándo usar cada uno</a></li>
                <li><a href="#errores" className="text-primary hover:underline">8 errores comunes en valoraciones de PYMEs españolas</a></li>
                <li><a href="#faq" className="text-primary hover:underline">Preguntas frecuentes</a></li>
              </ol>
            </nav>
          </GuideSection>

          {/* ─── SECCIÓN 1: DCF ─── */}
          <GuideSection id="dcf" icon={TrendingUp} title="Método DCF: Descuento de Flujos de Caja">
            <p>
              El método de <strong>Descuento de Flujos de Caja (DCF)</strong> es considerado el más robusto académicamente porque calcula el valor intrínseco de una empresa basándose en su capacidad futura de generar dinero, no en comparaciones con otras empresas. Es el método preferido por bancos de inversión, fondos de private equity y analistas financieros en todo el mundo.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3">¿Cómo funciona el DCF?</h3>
            <p>
              El DCF proyecta los <strong>flujos de caja libres (FCF)</strong> que generará la empresa durante un periodo explícito (normalmente 5 años), los descuenta al valor presente utilizando una tasa de descuento (WACC) y añade un <strong>valor terminal</strong> que captura el valor de los flujos más allá del periodo de proyección.
            </p>
            <p className="mt-2">
              La fórmula simplificada es: <strong>Valor Empresa = Σ (FCF<sub>t</sub> / (1+WACC)<sup>t</sup>) + Valor Terminal / (1+WACC)<sup>n</sup></strong>
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3">Ejemplo real: empresa industrial española</h3>
            <p>
              Tomemos una empresa industrial en Cataluña con las siguientes características:
            </p>
            <ul className="list-disc list-inside space-y-1 my-4">
              <li><strong>Facturación:</strong> 5.000.000 € anuales</li>
              <li><strong>EBITDA:</strong> 750.000 € (margen del 15%)</li>
              <li><strong>Crecimiento esperado:</strong> 4% anual</li>
              <li><strong>CAPEX de mantenimiento:</strong> 150.000 €/año</li>
              <li><strong>Variación de capital circulante:</strong> -50.000 €/año</li>
            </ul>

            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-3 text-left font-semibold">Concepto</th>
                    <th className="border p-3 text-right font-semibold">Año 1</th>
                    <th className="border p-3 text-right font-semibold">Año 2</th>
                    <th className="border p-3 text-right font-semibold">Año 3</th>
                    <th className="border p-3 text-right font-semibold">Año 4</th>
                    <th className="border p-3 text-right font-semibold">Año 5</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-3">Facturación</td><td className="border p-3 text-right">5.200.000 €</td><td className="border p-3 text-right">5.408.000 €</td><td className="border p-3 text-right">5.624.320 €</td><td className="border p-3 text-right">5.849.293 €</td><td className="border p-3 text-right">6.083.265 €</td></tr>
                  <tr><td className="border p-3">EBITDA (15%)</td><td className="border p-3 text-right">780.000 €</td><td className="border p-3 text-right">811.200 €</td><td className="border p-3 text-right">843.648 €</td><td className="border p-3 text-right">877.394 €</td><td className="border p-3 text-right">912.490 €</td></tr>
                  <tr><td className="border p-3">– Impuestos (25%)</td><td className="border p-3 text-right">-195.000 €</td><td className="border p-3 text-right">-202.800 €</td><td className="border p-3 text-right">-210.912 €</td><td className="border p-3 text-right">-219.349 €</td><td className="border p-3 text-right">-228.123 €</td></tr>
                  <tr><td className="border p-3">– CAPEX</td><td className="border p-3 text-right">-150.000 €</td><td className="border p-3 text-right">-156.000 €</td><td className="border p-3 text-right">-162.240 €</td><td className="border p-3 text-right">-168.730 €</td><td className="border p-3 text-right">-175.479 €</td></tr>
                  <tr><td className="border p-3">– Δ Capital circulante</td><td className="border p-3 text-right">-50.000 €</td><td className="border p-3 text-right">-52.000 €</td><td className="border p-3 text-right">-54.080 €</td><td className="border p-3 text-right">-56.243 €</td><td className="border p-3 text-right">-58.493 €</td></tr>
                  <tr className="font-semibold bg-muted/50"><td className="border p-3">FCF</td><td className="border p-3 text-right">385.000 €</td><td className="border p-3 text-right">400.400 €</td><td className="border p-3 text-right">416.416 €</td><td className="border p-3 text-right">433.073 €</td><td className="border p-3 text-right">450.395 €</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3">Cálculo del WACC</h3>
            <p>
              Para una PYME industrial española utilizamos: <strong>coste de equity del 12-15%</strong> (tasa libre de riesgo 3% + prima riesgo España 1.5% + prima de mercado 5% + prima por tamaño/iliquidez 3-6%), coste de deuda del 5% y una estructura de capital 70% equity / 30% deuda. Esto resulta en un <strong>WACC del 10-11%</strong>.
            </p>
            <p className="mt-2">
              Con un WACC del 10.5% y un crecimiento a perpetuidad del 2%, el <strong>valor terminal</strong> sería: 450.395 × (1+2%) / (10.5% - 2%) = <strong>5.402.384 €</strong>.
            </p>
            <p className="mt-2">
              Sumando el valor presente de los FCF explícitos (~1.560.000 €) y el valor terminal descontado (~3.280.000 €), obtenemos un <strong>Enterprise Value de aproximadamente 4.840.000 €</strong>, equivalente a <strong>6.5x EBITDA</strong>.
            </p>

            <GuideTip variant="info" title="¿Cuándo usar DCF?">
              Ideal para empresas con flujos de caja predecibles y un historial financiero sólido de al menos 3 años. No recomendado para startups, empresas cíclicas en fase de transformación o negocios con alta volatilidad de ingresos.
            </GuideTip>

            <GuideChecklist
              title="Ventajas y limitaciones del DCF"
              items={[
                'Ventaja: Captura el valor intrínseco basado en la capacidad real de generación de caja',
                'Ventaja: Permite modelar escenarios (optimista, base, pesimista)',
                'Ventaja: Independiente de las condiciones actuales del mercado',
                'Limitación: Muy sensible a los supuestos de crecimiento y tasa de descuento',
                'Limitación: Requiere proyecciones financieras detalladas',
                'Limitación: El valor terminal puede representar >60% del valor total',
              ]}
            />
          </GuideSection>

          {/* ─── SECCIÓN 2: MÚLTIPLOS ─── */}
          <GuideSection id="multiplos" icon={BarChart3} title="Método de Múltiplos: EV/EBITDA por Sector en España">
            <p>
              El método de <strong>múltiplos de mercado</strong> es el más utilizado en la práctica por su simplicidad y por reflejar directamente lo que el mercado está dispuesto a pagar. Consiste en aplicar un ratio (múltiplo) a una métrica financiera de la empresa —generalmente EBITDA, beneficio neto o facturación— basándose en transacciones reales o valoraciones de empresas comparables.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3">Tabla de múltiplos EV/EBITDA en España (2024-2025)</h3>
            <p className="mb-4">
              Basado en datos de transacciones reales (TTR, Capital IQ) y nuestra base de datos propietaria de operaciones M&A en España:
            </p>

            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-3 text-left font-semibold">Sector</th>
                    <th className="border p-3 text-center font-semibold">EBITDA &lt;500K€</th>
                    <th className="border p-3 text-center font-semibold">EBITDA 500K-2M€</th>
                    <th className="border p-3 text-center font-semibold">EBITDA 2M-10M€</th>
                    <th className="border p-3 text-center font-semibold">EBITDA &gt;10M€</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-3 font-medium">Tecnología / SaaS</td><td className="border p-3 text-center">5-8x</td><td className="border p-3 text-center">8-12x</td><td className="border p-3 text-center">10-15x</td><td className="border p-3 text-center">12-20x</td></tr>
                  <tr><td className="border p-3 font-medium">Salud / Healthcare</td><td className="border p-3 text-center">4-6x</td><td className="border p-3 text-center">6-8x</td><td className="border p-3 text-center">7-10x</td><td className="border p-3 text-center">9-13x</td></tr>
                  <tr><td className="border p-3 font-medium">Seguridad Privada</td><td className="border p-3 text-center">4-6x</td><td className="border p-3 text-center">6-8x</td><td className="border p-3 text-center">7-9x</td><td className="border p-3 text-center">8-11x</td></tr>
                  <tr><td className="border p-3 font-medium">Servicios Profesionales</td><td className="border p-3 text-center">3-5x</td><td className="border p-3 text-center">5-7x</td><td className="border p-3 text-center">6-8x</td><td className="border p-3 text-center">7-10x</td></tr>
                  <tr><td className="border p-3 font-medium">Industrial / Manufactura</td><td className="border p-3 text-center">3-5x</td><td className="border p-3 text-center">4-6x</td><td className="border p-3 text-center">5-7x</td><td className="border p-3 text-center">6-9x</td></tr>
                  <tr><td className="border p-3 font-medium">Alimentación</td><td className="border p-3 text-center">3-5x</td><td className="border p-3 text-center">5-7x</td><td className="border p-3 text-center">6-8x</td><td className="border p-3 text-center">7-10x</td></tr>
                  <tr><td className="border p-3 font-medium">Logística / Transporte</td><td className="border p-3 text-center">3-4x</td><td className="border p-3 text-center">4-6x</td><td className="border p-3 text-center">5-7x</td><td className="border p-3 text-center">6-8x</td></tr>
                  <tr><td className="border p-3 font-medium">Construcción</td><td className="border p-3 text-center">2-4x</td><td className="border p-3 text-center">3-5x</td><td className="border p-3 text-center">4-6x</td><td className="border p-3 text-center">5-7x</td></tr>
                  <tr><td className="border p-3 font-medium">Hostelería / Turismo</td><td className="border p-3 text-center">2-4x</td><td className="border p-3 text-center">3-5x</td><td className="border p-3 text-center">4-6x</td><td className="border p-3 text-center">5-8x</td></tr>
                  <tr><td className="border p-3 font-medium">Energía / Medio Ambiente</td><td className="border p-3 text-center">4-6x</td><td className="border p-3 text-center">5-8x</td><td className="border p-3 text-center">7-10x</td><td className="border p-3 text-center">8-12x</td></tr>
                </tbody>
              </table>
            </div>

            <GuideTip variant="tip" title="Prima por tamaño">
              Observa cómo los múltiplos aumentan significativamente con el tamaño. Una empresa de tecnología con EBITDA de 300.000€ puede valorarse a 6x (1.8M€), mientras que la misma empresa con EBITDA de 5M€ se valoraría a 12x (60M€). Esta "prima por tamaño" refleja menor riesgo, mayor gobernanza y mejor acceso a financiación.
            </GuideTip>

            <h3 className="text-xl font-semibold mt-8 mb-3">Ejemplo: empresa de servicios profesionales</h3>
            <p>
              Consideremos una <strong>consultora de ingeniería en Madrid</strong> con:
            </p>
            <ul className="list-disc list-inside space-y-1 my-4">
              <li><strong>Facturación:</strong> 3.200.000 €</li>
              <li><strong>EBITDA reportado:</strong> 640.000 €</li>
              <li><strong>EBITDA normalizado:</strong> 800.000 € (tras ajustar el salario del fundador a mercado y eliminar un gasto extraordinario de 60K€)</li>
              <li><strong>Deuda neta:</strong> 200.000 €</li>
            </ul>
            <p>
              Aplicando un múltiplo de <strong>6x EBITDA normalizado</strong> (rango medio para servicios profesionales con EBITDA 500K-2M€):
            </p>
            <ul className="list-disc list-inside space-y-1 my-4">
              <li><strong>Enterprise Value:</strong> 800.000 × 6 = <strong>4.800.000 €</strong></li>
              <li><strong>Equity Value:</strong> 4.800.000 – 200.000 = <strong>4.600.000 €</strong> (lo que recibiría el vendedor)</li>
              <li><strong>Rango realista:</strong> 5x-7x → <strong>3.800.000 € – 5.400.000 € de equity</strong></li>
            </ul>

            <GuideTip variant="warning" title="Error frecuente">
              Muchos empresarios aplican el múltiplo al EBITDA reportado en lugar del EBITDA normalizado, infravalorando su empresa. La normalización puede incrementar el valor un 20-40%.
            </GuideTip>
          </GuideSection>

          {/* ─── SECCIÓN 3: COMPARABLES ─── */}
          <GuideSection id="comparables" icon={GitCompare} title="Transacciones Comparables en el Mercado Español">
            <p>
              El método de <strong>transacciones comparables</strong> analiza precios realmente pagados en operaciones de compraventa de empresas similares. A diferencia de los múltiplos de mercado (basados en empresas cotizadas), este método refleja las condiciones reales de negociación, incluyendo primas de control, sinergias y descuentos por iliquidez.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3">Fuentes de datos en España</h3>
            <p>Acceder a datos de transacciones privadas en España es un reto. Las principales fuentes son:</p>
            <ul className="list-disc list-inside space-y-2 my-4">
              <li><strong>TTR (Transactional Track Record):</strong> La base de datos más completa de M&A en Iberia. Cubre operaciones con detalle de múltiplos y términos cuando están disponibles.</li>
              <li><strong>Capital IQ / PitchBook:</strong> Bases de datos globales con cobertura parcial del mercado español, especialmente para operaciones mid-market.</li>
              <li><strong>Registro Mercantil:</strong> Las cuentas anuales depositadas permiten estimar múltiplos implícitos cuando se conoce el precio de una operación.</li>
              <li><strong>SABI (Bureau van Dijk):</strong> Datos financieros de más de 2 millones de empresas españolas, útil para benchmarking.</li>
              <li><strong>Bases de datos propietarias:</strong> Firmas de M&A como Capittal mantenemos registros internos de operaciones asesoradas y monitorizadas.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-3">Ejemplo: transacción comparable en el sector seguridad</h3>
            <p>
              Supongamos que queremos valorar una <strong>empresa de seguridad privada en Valencia</strong> con facturación de 4M€ y EBITDA de 480.000€. Identificamos tres transacciones recientes en el sector:
            </p>

            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-3 text-left font-semibold">Transacción</th>
                    <th className="border p-3 text-right font-semibold">Facturación</th>
                    <th className="border p-3 text-right font-semibold">EBITDA</th>
                    <th className="border p-3 text-right font-semibold">EV pagado</th>
                    <th className="border p-3 text-center font-semibold">Múltiplo EV/EBITDA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-3">Empresa A (Madrid, 2024)</td><td className="border p-3 text-right">8.5M€</td><td className="border p-3 text-right">1.2M€</td><td className="border p-3 text-right">9.6M€</td><td className="border p-3 text-center">8.0x</td></tr>
                  <tr><td className="border p-3">Empresa B (Andalucía, 2024)</td><td className="border p-3 text-right">3.2M€</td><td className="border p-3 text-right">380K€</td><td className="border p-3 text-right">2.28M€</td><td className="border p-3 text-center">6.0x</td></tr>
                  <tr><td className="border p-3">Empresa C (País Vasco, 2023)</td><td className="border p-3 text-right">6.0M€</td><td className="border p-3 text-right">780K€</td><td className="border p-3 text-right">5.46M€</td><td className="border p-3 text-center">7.0x</td></tr>
                </tbody>
              </table>
            </div>

            <p>
              La mediana de múltiplos es <strong>7.0x</strong>. Sin embargo, nuestra empresa es más pequeña que las comparables, por lo que aplicamos un <strong>descuento por tamaño del 10-15%</strong>, resultando en un múltiplo ajustado de <strong>6.0-6.3x</strong>.
            </p>
            <p className="mt-2">
              <strong>Valoración estimada:</strong> 480.000 × 6.15x = <strong>2.952.000 €</strong> de Enterprise Value.
            </p>

            <GuideTip variant="info" title="Ajustes habituales en comparables">
              Además del tamaño, los ajustes más frecuentes incluyen: geografía (empresas en Madrid/Barcelona cotizan con prima del 5-10% vs. provincias), crecimiento relativo, concentración de clientes, y antigüedad de la transacción (descontar si tiene más de 24 meses).
            </GuideTip>
          </GuideSection>

          {/* ─── SECCIÓN 4: PATRIMONIAL ─── */}
          <GuideSection id="patrimonial" icon={Building2} title="Valoración Patrimonial: Cuándo el Valor Está en los Activos">
            <p>
              La <strong>valoración patrimonial</strong> calcula el valor de una empresa como la diferencia entre sus activos y pasivos ajustados a valor de mercado. Es el método más conservador y proporciona un "suelo" de valoración —el valor mínimo que cabría esperar.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3">¿Cuándo utilizar la valoración patrimonial?</h3>
            <ul className="list-disc list-inside space-y-2 my-4">
              <li><strong>Holdings inmobiliarios:</strong> Empresas cuyo principal activo son inmuebles</li>
              <li><strong>Empresas agrícolas:</strong> Con terrenos y explotaciones de valor significativo</li>
              <li><strong>Liquidaciones:</strong> Cuando la empresa va a cesar actividad</li>
              <li><strong>Empresas con activos infravalorados:</strong> Inmuebles adquiridos hace décadas a coste histórico</li>
              <li><strong>Como complemento:</strong> Para establecer el valor mínimo en una valoración multimetodológica</li>
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-3">Ejemplo: holding inmobiliario en Barcelona</h3>
            <p>
              Un <strong>holding familiar en Barcelona</strong> posee 5 locales comerciales y 2 naves industriales. El balance reporta activos inmobiliarios por 2.1M€ (coste de adquisición). Sin embargo, las tasaciones independientes revelan:
            </p>

            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-3 text-left font-semibold">Activo</th>
                    <th className="border p-3 text-right font-semibold">Valor contable</th>
                    <th className="border p-3 text-right font-semibold">Valor de mercado</th>
                    <th className="border p-3 text-right font-semibold">Plusvalía latente</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-3">5 locales comerciales</td><td className="border p-3 text-right">1.200.000 €</td><td className="border p-3 text-right">3.800.000 €</td><td className="border p-3 text-right">2.600.000 €</td></tr>
                  <tr><td className="border p-3">2 naves industriales</td><td className="border p-3 text-right">900.000 €</td><td className="border p-3 text-right">1.600.000 €</td><td className="border p-3 text-right">700.000 €</td></tr>
                  <tr className="font-semibold bg-muted/50"><td className="border p-3">Total</td><td className="border p-3 text-right">2.100.000 €</td><td className="border p-3 text-right">5.400.000 €</td><td className="border p-3 text-right">3.300.000 €</td></tr>
                </tbody>
              </table>
            </div>

            <p>
              Restando los pasivos (hipotecas pendientes de 800.000€), el <strong>Valor Neto Patrimonial Ajustado (NAV)</strong> sería: 5.400.000 – 800.000 = <strong>4.600.000 €</strong>, frente a un valor contable de solo 1.300.000 €.
            </p>

            <GuideTip variant="warning" title="Impacto fiscal de las plusvalías">
              Al vender participaciones de un holding con plusvalías latentes, el comprador "hereda" la carga fiscal futura. Es habitual aplicar un descuento del 20-25% sobre las plusvalías latentes para compensar al comprador por los impuestos diferidos.
            </GuideTip>
          </GuideSection>

          {/* ─── SECCIÓN 5: COMPARATIVA ─── */}
          <GuideSection id="comparativa" icon={Scale} title="Comparativa de Métodos: ¿Cuál Elegir?">
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-3 text-left font-semibold">Criterio</th>
                    <th className="border p-3 text-center font-semibold">DCF</th>
                    <th className="border p-3 text-center font-semibold">Múltiplos</th>
                    <th className="border p-3 text-center font-semibold">Comparables</th>
                    <th className="border p-3 text-center font-semibold">Patrimonial</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-3 font-medium">Precisión teórica</td><td className="border p-3 text-center">⭐⭐⭐⭐⭐</td><td className="border p-3 text-center">⭐⭐⭐⭐</td><td className="border p-3 text-center">⭐⭐⭐⭐</td><td className="border p-3 text-center">⭐⭐⭐</td></tr>
                  <tr><td className="border p-3 font-medium">Facilidad de aplicación</td><td className="border p-3 text-center">⭐⭐</td><td className="border p-3 text-center">⭐⭐⭐⭐⭐</td><td className="border p-3 text-center">⭐⭐⭐</td><td className="border p-3 text-center">⭐⭐⭐⭐</td></tr>
                  <tr><td className="border p-3 font-medium">Datos necesarios</td><td className="border p-3 text-center">Muchos</td><td className="border p-3 text-center">Pocos</td><td className="border p-3 text-center">Moderados</td><td className="border p-3 text-center">Moderados</td></tr>
                  <tr><td className="border p-3 font-medium">Mejor para</td><td className="border p-3 text-center">Empresas estables con flujos predecibles</td><td className="border p-3 text-center">Valoraciones rápidas, negociaciones</td><td className="border p-3 text-center">Sectores con actividad M&A</td><td className="border p-3 text-center">Holdings, inmobiliarias, liquidaciones</td></tr>
                  <tr><td className="border p-3 font-medium">Coste profesional típico</td><td className="border p-3 text-center">8.000-25.000 €</td><td className="border p-3 text-center">3.000-8.000 €</td><td className="border p-3 text-center">5.000-15.000 €</td><td className="border p-3 text-center">4.000-10.000 €</td></tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong>Nuestra recomendación:</strong> Para la mayoría de PYMEs españolas en proceso de venta, combinar <strong>múltiplos sectoriales + DCF simplificado</strong> ofrece el mejor equilibrio entre rigor y coste. Si hay transacciones comparables recientes disponibles, añadirlas refuerza significativamente la credibilidad del informe.
            </p>
          </GuideSection>

          {/* ─── SECCIÓN 6: ERRORES ─── */}
          <GuideSection id="errores" icon={AlertTriangle} title="8 Errores Comunes en Valoraciones de PYMEs Españolas">
            <ol className="space-y-4 list-decimal list-inside">
              <li>
                <strong>No normalizar el EBITDA:</strong> Incluir gastos personales del propietario (coche, viajes, seguros) como gasto de empresa puede reducir artificialmente el EBITDA un 20-40%. Un comprador sofisticado lo ajustará, pero si no lo presentas normalizado, la primera impresión de valor será baja.
              </li>
              <li>
                <strong>Usar un único método de valoración:</strong> Confiar exclusivamente en múltiplos sin contrastar con DCF o comparables genera riesgo de sobre o infravaloración. Siempre usa al menos dos métodos.
              </li>
              <li>
                <strong>Ignorar la deuda neta:</strong> Confundir Enterprise Value con Equity Value. Si tu empresa tiene 1M€ de deuda bancaria, ese millón se descuenta del EV para calcular lo que realmente recibirás como vendedor.
              </li>
              <li>
                <strong>Aplicar múltiplos de empresas cotizadas sin ajustar:</strong> Las empresas del IBEX35 cotizan con múltiplos significativamente superiores (10-15x EBITDA). Aplicar estos múltiplos a una PYME sin descuento por iliquidez (20-30%) infla artificialmente la valoración.
              </li>
              <li>
                <strong>Sobreestimar el crecimiento futuro:</strong> Proyectar crecimientos del 15-20% anual sin justificación histórica o contractual es el error más frecuente en DCFs. Un comprador descontará agresivamente proyecciones no soportadas.
              </li>
              <li>
                <strong>No considerar la dependencia del fundador:</strong> Si el 80% de las relaciones comerciales dependen del propietario, el comprador aplicará un descuento del 10-20%. Es recomendable profesionalizar la gestión antes de vender.
              </li>
              <li>
                <strong>Concentración excesiva de clientes:</strong> Si un solo cliente representa más del 30% de la facturación, el riesgo percibido aumenta significativamente. Esto puede reducir el múltiplo aplicable en 1-2x.
              </li>
              <li>
                <strong>Ignorar el capital circulante normalizado:</strong> Si el negocio requiere un nivel mínimo de capital circulante para operar, ese importe no es "caja excedente" y no debe sumarse al equity value. Este error puede distorsionar la valoración en 200-500K€.
              </li>
            </ol>
          </GuideSection>

          {/* ─── CTA CALCULADORA ─── */}
          <GuideCTA
            title="Obtén una estimación rápida del valor de tu empresa"
            description="Nuestra calculadora gratuita aplica múltiplos EBITDA actualizados por sector para darte un rango de valoración orientativo en menos de 5 minutos."
            primaryAction={{ label: 'Usar calculadora gratuita', href: '/lp/calculadora' }}
            secondaryAction={{ label: 'Ver métodos detallados', href: '/valoracion-empresas' }}
          />

          {/* ─── SECCIÓN 7: FAQ ─── */}
          <GuideSection id="faq" icon={HelpCircle} title="Preguntas Frecuentes sobre Valoración de Empresas">
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
          </GuideSection>

          {/* ─── CTA PROFESIONAL ─── */}
          <GuideCTA
            title="¿Necesitas una valoración profesional con informe certificado?"
            description="Nuestro equipo de expertos en M&A combina DCF, múltiplos y comparables para elaborar un informe de valoración defendible ante compradores, socios, Hacienda o tribunales."
            primaryAction={{ label: 'Solicitar valoración profesional', href: '/contacto' }}
            secondaryAction={{ label: 'Conoce nuestro equipo', href: '/equipo' }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GuiaValoracionEmpresas;

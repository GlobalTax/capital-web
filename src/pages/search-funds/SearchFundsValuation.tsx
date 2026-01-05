import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Calculator, TrendingUp, Scale, FileSearch, PiggyBank, AlertTriangle, BarChart3, CheckCircle } from 'lucide-react';
import { GuideHero, GuideTip, GuideChecklist, GuideCTA, GuideSection, GuideMetricsGrid } from '@/components/search-funds-guides';

const SearchFundsValuation = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <Helmet>
        <title>Valoración de Empresas en Search Funds | Guía Completa | Capittal</title>
        <meta 
          name="description" 
          content="Aprende a valorar empresas para Search Funds: múltiplos de EBITDA, ajustes normalizados, Quality of Earnings y técnicas de negociación del precio." 
        />
        <link rel="canonical" href="https://capittal.es/search-funds/recursos/valoracion" />
      </Helmet>

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <GuideHero
              icon={Calculator}
              tag="Valoración"
              title="Valoración de Empresas en Search Funds"
              description="Una valoración correcta es la base de cualquier adquisición exitosa. Aprende los métodos, ajustes y consideraciones específicas para valorar PYMEs en contexto Search Fund."
              readTime="18 min lectura"
            />

            <GuideMetricsGrid
              metrics={[
                { value: '3x-6x', label: 'Múltiplo EBITDA', description: 'Rango típico PYMEs' },
                { value: '€1-5M', label: 'EBITDA objetivo', description: 'Sweet spot Search Funds' },
                { value: '20-30%', label: 'Ajustes típicos', description: 'Sobre EBITDA reportado' },
                { value: '60-90', label: 'Días de due diligence', description: 'Tras LOI firmada' },
              ]}
            />

            <GuideSection id="fundamentos" icon={Scale} title="Fundamentos de Valoración para Search Funds">
              <p>
                La valoración en contexto Search Fund tiene características particulares que la distinguen de valoraciones de empresas cotizadas o grandes corporaciones:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Empresas más pequeñas:</strong> Típicamente €1-10M de facturación, donde pequeños ajustes tienen gran impacto</li>
                <li><strong>Información limitada:</strong> Contabilidad menos sofisticada, a veces sin auditar</li>
                <li><strong>Dependencia del propietario:</strong> El "key person risk" es crítico y afecta al valor</li>
                <li><strong>Mercado menos líquido:</strong> Menos comparables y más negociación individual</li>
              </ul>

              <GuideTip variant="info" title="El objetivo de la valoración">
                No se trata solo de calcular un número, sino de entender el negocio lo suficiente para pagar un precio justo que permita generar retornos atractivos para los inversores mientras se da al vendedor un exit digno.
              </GuideTip>
            </GuideSection>

            <GuideSection id="metodos" icon={BarChart3} title="Métodos de Valoración">
              <h3 className="text-xl font-semibold mt-6 mb-3">1. Múltiplos de EBITDA (el más común)</h3>
              <p>
                El método más utilizado en Search Funds. Se calcula como: <code className="bg-muted px-2 py-1 rounded">Valor Empresa = EBITDA Normalizado × Múltiplo</code>
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left font-semibold border">Tamaño EBITDA</th>
                      <th className="p-3 text-left font-semibold border">Múltiplo Típico</th>
                      <th className="p-3 text-left font-semibold border">Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-3 border">&lt; €500K</td><td className="p-3 border">2.5x - 3.5x</td><td className="p-3 border">Negocios pequeños, alto riesgo</td></tr>
                    <tr><td className="p-3 border">€500K - €1M</td><td className="p-3 border">3x - 4x</td><td className="p-3 border">Sweet spot búsquedas tradicionales</td></tr>
                    <tr><td className="p-3 border">€1M - €2M</td><td className="p-3 border">4x - 5x</td><td className="p-3 border">Empresas más sólidas</td></tr>
                    <tr><td className="p-3 border">€2M - €5M</td><td className="p-3 border">4.5x - 6x</td><td className="p-3 border">Competencia con PE pequeño</td></tr>
                    <tr><td className="p-3 border">&gt; €5M</td><td className="p-3 border">5x - 7x+</td><td className="p-3 border">Territorio de PE tradicional</td></tr>
                  </tbody>
                </table>
              </div>

              <GuideTip variant="tip" title="Factores que aumentan el múltiplo">
                Crecimiento sostenido, márgenes altos, baja concentración de clientes, equipo gestor independiente, sector en crecimiento, y barreras de entrada.
              </GuideTip>

              <h3 className="text-xl font-semibold mt-6 mb-3">2. Múltiplos de Ingresos</h3>
              <p>
                Útil cuando el EBITDA es negativo o muy bajo pero el negocio tiene potencial. Común en empresas de software o alto crecimiento.
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Negocios tradicionales: 0.5x - 1.5x ingresos</li>
                <li>Software/SaaS: 2x - 5x ARR (o más si hay alto crecimiento)</li>
                <li>Servicios profesionales: 0.8x - 1.2x ingresos</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3. DCF (Flujo de Caja Descontado)</h3>
              <p>
                Menos común en Search Funds debido a la dificultad de proyectar flujos en PYMEs. Se usa como método de validación, no como principal.
              </p>
              
              <GuideTip variant="warning" title="Cuidado con el DCF">
                En PYMEs, pequeñas variaciones en supuestos de crecimiento o tasa de descuento producen rangos de valor muy amplios. Úsalo con escepticismo.
              </GuideTip>
            </GuideSection>

            <GuideSection id="ajustes" icon={FileSearch} title="Ajustes al EBITDA (Normalización)">
              <p>
                El EBITDA contable raramente refleja la rentabilidad real del negocio bajo gestión profesional. Los ajustes de normalización son críticos:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Ajustes Típicos</h3>
              
              <div className="space-y-4 my-6">
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold text-green-600 dark:text-green-400">↑ Ajustes que AUMENTAN el EBITDA</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Salario excesivo del propietario (diferencia vs. gestor de mercado)</li>
                    <li>• Gastos personales pasados por la empresa (coches, viajes, etc.)</li>
                    <li>• Familiares en nómina sin función real</li>
                    <li>• Alquiler por debajo de mercado de inmuebles propios</li>
                    <li>• Gastos extraordinarios no recurrentes</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold text-red-600 dark:text-red-400">↓ Ajustes que REDUCEN el EBITDA</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Alquiler por encima de mercado de inmuebles del propietario</li>
                    <li>• Salario por debajo de mercado del propietario (si trabaja mucho)</li>
                    <li>• Ingresos no recurrentes incluidos</li>
                    <li>• Subvenciones que no continuarán</li>
                    <li>• Contratos one-off que inflaron el año</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Ejemplo de Normalización</h3>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left font-semibold border">Concepto</th>
                      <th className="p-3 text-right font-semibold border">Importe (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-3 border">EBITDA Contable</td><td className="p-3 border text-right">800.000</td></tr>
                    <tr><td className="p-3 border">+ Exceso salario propietario (200K → 120K mercado)</td><td className="p-3 border text-right text-green-600">+80.000</td></tr>
                    <tr><td className="p-3 border">+ Coche personal</td><td className="p-3 border text-right text-green-600">+25.000</td></tr>
                    <tr><td className="p-3 border">+ Viajes personales</td><td className="p-3 border text-right text-green-600">+15.000</td></tr>
                    <tr><td className="p-3 border">- Alquiler inmueble propietario sobre mercado</td><td className="p-3 border text-right text-red-600">-30.000</td></tr>
                    <tr><td className="p-3 border">- Ingreso extraordinario (venta maquinaria)</td><td className="p-3 border text-right text-red-600">-50.000</td></tr>
                    <tr className="bg-primary/5"><td className="p-3 border font-bold">EBITDA Normalizado</td><td className="p-3 border text-right font-bold">840.000</td></tr>
                  </tbody>
                </table>
              </div>
            </GuideSection>

            <GuideSection id="qoe" icon={CheckCircle} title="Quality of Earnings (QoE)">
              <p>
                El <strong>Quality of Earnings</strong> es un análisis profundo que valida la calidad y sostenibilidad del EBITDA reportado. Es crítico antes de cerrar la transacción.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">¿Qué revisa un QoE?</h3>
              <GuideChecklist
                items={[
                  'Reconciliación de ingresos (facturación vs. cobros vs. contabilidad)',
                  'Análisis de clientes principales y concentración',
                  'Sostenibilidad de márgenes (por producto, cliente, canal)',
                  'Working capital normalizado',
                  'CapEx de mantenimiento vs. crecimiento',
                  'Deuda oculta (litigios, contingencias fiscales, garantías)',
                  'Contratos clave (clientes, proveedores, empleados)',
                  'Dependencia del propietario y equipo de gestión',
                ]}
              />

              <h3 className="text-xl font-semibold mt-6 mb-3">¿Cuándo contratar un QoE externo?</h3>
              <GuideTip variant="tip">
                Para deals &gt; €2M, siempre es recomendable un QoE profesional (Big 4 o firma especializada). El coste (€30-60K) es pequeño comparado con el riesgo de descubrir problemas post-cierre.
              </GuideTip>
            </GuideSection>

            <GuideSection id="negociacion" icon={PiggyBank} title="Negociación del Precio">
              <p>
                La valoración es el punto de partida, pero el precio final se negocia. Existen herramientas para cerrar gaps entre expectativas:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Estructuras Creativas</h3>
              
              <div className="space-y-4 my-6">
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold">Earn-Out</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Parte del precio condicionada a resultados futuros. Ejemplo: €3M al cierre + €500K si EBITDA &gt; €1M en los próximos 2 años.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold">Vendor Financing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    El vendedor financia parte del precio (típicamente 10-30%), pagadero en 2-4 años. Señal de confianza en el negocio.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold">Rollover Equity</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    El vendedor mantiene 5-20% de equity, alineando intereses y dando señal de confianza.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold">Ajuste de Working Capital</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mecanismo de ajuste post-cierre según el WC entregado vs. acordado.
                  </p>
                </div>
              </div>

              <GuideTip variant="info" title="La regla del 70-80%">
                Típicamente, el vendedor recibe 70-80% del precio al cierre, y el resto se estructura en earn-outs, vendor notes o escrows. Esto protege al comprador y alinea incentivos.
              </GuideTip>
            </GuideSection>

            <GuideSection id="errores" icon={AlertTriangle} title="Errores de Valoración Comunes">
              <GuideTip variant="warning" title="Confiar en el EBITDA sin normalizar">
                El EBITDA contable de una PYME familiar casi nunca refleja la rentabilidad real bajo gestión profesional.
              </GuideTip>

              <GuideTip variant="warning" title="Ignorar el working capital">
                Un negocio puede parecer rentable pero requerir mucho capital circulante. Asegúrate de entender la estacionalidad y ciclo de cobros/pagos.
              </GuideTip>

              <GuideTip variant="warning" title="Subestimar el key person risk">
                Si el 50% de los ingresos depende de la relación personal del propietario con clientes clave, eso tiene que reflejarse en la valoración.
              </GuideTip>

              <GuideTip variant="warning" title="No validar la recurrencia de ingresos">
                ¿Los clientes compran por inercia, contratos largos, o cada venta es una nueva batalla comercial? Muy diferente valoración.
              </GuideTip>
            </GuideSection>

            <GuideCTA
              title="¿Necesitas valorar una empresa?"
              description="Nuestro equipo ha valorado más de 200 empresas para transacciones M&A. Te ayudamos a entender el valor real de tu empresa o target."
              primaryAction={{ label: 'Solicitar valoración', href: '/lp/calculadora' }}
              secondaryAction={{ label: 'Hablar con un experto', href: '/contacto' }}
            />
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsValuation;

import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Handshake, Brain, MessageSquare, Target, Shield, AlertTriangle, Users, FileText, Clock } from 'lucide-react';
import { GuideHero, GuideTip, GuideChecklist, GuideCTA, GuideSection, GuideMetricsGrid } from '@/components/search-funds-guides';

const SearchFundsNegotiation = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <Helmet>
        <title>Negociación con Vendedores en M&A | Guía para Search Funds | Capittal</title>
        <meta 
          name="description" 
          content="Técnicas de negociación para adquirir empresas: psicología del vendedor, estructuración creativa del deal, earn-outs, vendor financing y cómo cerrar el trato." 
        />
        <link rel="canonical" href="https://capittal.es/search-funds/recursos/negociacion" />
      </Helmet>

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <GuideHero
              icon={Handshake}
              tag="Negociación"
              title="Negociación con Vendedores de Empresas"
              description="La negociación en M&A es tanto un arte como una ciencia. Aprende a entender al vendedor, estructurar ofertas atractivas y cerrar deals exitosos."
              readTime="16 min lectura"
            />

            <GuideMetricsGrid
              metrics={[
                { value: '3-6', label: 'Meses de negociación', description: 'De primera reunión a cierre' },
                { value: '67%', label: 'Deals que no cierran', description: 'Por desalineación de expectativas' },
                { value: '10-20%', label: 'Vendor financing', description: 'Típico en Search Funds' },
                { value: '90', label: 'Días de exclusividad', description: 'Período típico post-LOI' },
              ]}
            />

            <GuideSection id="psicologia" icon={Brain} title="Psicología del Vendedor">
              <p>
                Entender las motivaciones y preocupaciones del vendedor es fundamental para una negociación exitosa. Recuerda: estás comprando lo que probablemente es la obra de su vida.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Motivaciones Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold mb-2">🎯 Jubilación</h4>
                  <p className="text-sm text-muted-foreground">60%+ de vendedores. Buscan liquidez para retiro, pero les importa el legado.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold mb-2">😓 Fatiga empresarial</h4>
                  <p className="text-sm text-muted-foreground">Cansancio tras décadas. Quieren liberarse pero con condiciones dignas.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold mb-2">👨‍👩‍👧 Sin sucesión familiar</h4>
                  <p className="text-sm text-muted-foreground">Hijos que no quieren o no pueden continuar. Buscan alternativa honorable.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold mb-2">🏥 Salud o circunstancias</h4>
                  <p className="text-sm text-muted-foreground">Problemas de salud, divorcio, o necesidad de liquidez. Mayor urgencia.</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Preocupaciones Típicas del Vendedor</h3>
              <GuideChecklist
                items={[
                  'Futuro de los empleados (especialmente los veteranos)',
                  'Continuidad del negocio y la marca',
                  'Confidencialidad durante el proceso',
                  'Trato justo en precio y condiciones',
                  'Su rol durante y después de la transición',
                  'Impacto fiscal de la venta',
                  'Qué dirán proveedores, clientes y comunidad',
                ]}
              />

              <GuideTip variant="tip" title="La regla de oro">
                Nunca hables mal del negocio ni critiques decisiones del propietario. Aunque veas ineficiencias, tu rol es mostrar respeto por lo construido mientras demuestras que puedes llevarlo al siguiente nivel.
              </GuideTip>
            </GuideSection>

            <GuideSection id="estructura" icon={MessageSquare} title="Estructura de la Negociación">
              <h3 className="text-xl font-semibold mt-6 mb-3">Primera Reunión: Qué hacer y qué evitar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">✓ Hacer</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Escuchar más que hablar (regla 70/30)</li>
                    <li>• Preguntar por la historia del negocio</li>
                    <li>• Mostrar interés genuino en su trabajo</li>
                    <li>• Explicar qué es un Search Fund sin jerga</li>
                    <li>• Hablar de tu background y motivación</li>
                    <li>• Ser transparente sobre el proceso</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">✗ Evitar</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Hablar de precio en primera reunión</li>
                    <li>• Criticar el negocio o sus decisiones</li>
                    <li>• Prometer cosas que no puedes cumplir</li>
                    <li>• Parecer que solo te importa el dinero</li>
                    <li>• Presionar por decisiones rápidas</li>
                    <li>• Usar jerga financiera excesiva</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Del Interés a la LOI</h3>
              <div className="space-y-3 my-6">
                {[
                  { num: 1, title: 'Primera reunión', desc: 'Conocer al propietario y el negocio. No hablar de precio.' },
                  { num: 2, title: 'Seguimiento', desc: 'Enviar carta de agradecimiento. Demostrar interés genuino.' },
                  { num: 3, title: 'Segunda reunión', desc: 'Profundizar en el negocio. Visita a instalaciones si aplica.' },
                  { num: 4, title: 'NDA e información', desc: 'Firma de confidencialidad. Recepción de datos financieros básicos.' },
                  { num: 5, title: 'Análisis preliminar', desc: 'Revisión de información. Identificar red flags y oportunidades.' },
                  { num: 6, title: 'Indicación de interés', desc: 'Comunicar interés formal y rango de valor preliminar.' },
                  { num: 7, title: 'Negociación LOI', desc: 'Discutir términos principales: precio, estructura, timeline.' },
                  { num: 8, title: 'Firma LOI', desc: 'Acuerdo no vinculante con exclusividad para due diligence.' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {step.num}
                    </div>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GuideSection>

            <GuideSection id="terminos" icon={FileText} title="Términos Negociables">
              <p>
                El precio es solo una parte del deal. La estructura puede ser igual de importante:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Precio vs. Estructura</h3>
              <GuideTip variant="info">
                Un vendedor que pide €5M puede aceptar €4.5M si la estructura le da más seguridad (menos earn-out, más al cierre). O puede aceptar €4M al cierre + €1.5M en earn-out si confía en el negocio.
              </GuideTip>

              <h3 className="text-xl font-semibold mt-6 mb-3">Herramientas de Estructuración</h3>
              <div className="space-y-4 my-6">
                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Vendor Financing (10-30%)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    El vendedor "presta" parte del precio, pagadero en 2-4 años. Típicamente subordinado a deuda senior. Señal de confianza en el negocio.
                  </p>
                  <p className="text-sm text-primary mt-2">Ejemplo: €3M al cierre + €1M vendor note a 4 años</p>
                </div>

                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Earn-Out (10-25%)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pago condicionado a resultados futuros. Alinea intereses pero puede crear conflictos si no está bien definido.
                  </p>
                  <p className="text-sm text-primary mt-2">Ejemplo: €500K si EBITDA &gt; €1.2M en años 1-2</p>
                </div>

                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Rollover Equity (5-20%)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    El vendedor mantiene participación minoritaria. Útil cuando quiere participar en el upside futuro.
                  </p>
                  <p className="text-sm text-primary mt-2">Ejemplo: 15% equity retenido con opción de venta en 5 años</p>
                </div>

                <div className="p-4 rounded-xl bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Escrow (5-10%)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Retención temporal para cubrir contingencias descubiertas post-cierre. Típicamente 12-18 meses.
                  </p>
                  <p className="text-sm text-primary mt-2">Ejemplo: €300K en escrow liberado si no hay reclamaciones en 12 meses</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Período de Transición</h3>
              <p>
                Acordar el rol del vendedor post-cierre es crítico:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Transición mínima (3-6 meses):</strong> Para negocios con equipo gestor independiente</li>
                <li><strong>Transición estándar (6-12 meses):</strong> Para mayoría de PYMEs</li>
                <li><strong>Transición extendida (12-24 meses):</strong> Si hay alta dependencia del propietario</li>
              </ul>
              
              <GuideTip variant="tip" title="Compensación durante transición">
                El vendedor típicamente cobra un salario de mercado durante la transición. No uses la transición como forma encubierta de reducir el precio.
              </GuideTip>
            </GuideSection>

            <GuideSection id="tecnicas" icon={Target} title="Técnicas de Negociación">
              <h3 className="text-xl font-semibold mt-6 mb-3">Anclaje</h3>
              <p>
                El primer número mencionado tiende a anclar la negociación. Intenta que el vendedor dé su precio primero, pero si debes anclar, hazlo con una oferta justificable.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">BATNA (Best Alternative to Negotiated Agreement)</h3>
              <GuideTip variant="info">
                Conoce tu alternativa si el deal no cierra. Si tienes otros deals en pipeline, negocias con más fuerza. Si es tu única oportunidad, podrías ceder demasiado.
              </GuideTip>

              <h3 className="text-xl font-semibold mt-6 mb-3">Crear Opciones Win-Win</h3>
              <GuideChecklist
                title="Técnicas para expandir el pastel:"
                items={[
                  'Ofrecer consultoría pagada al propietario post-transición',
                  'Nombrar un espacio o producto en su honor',
                  'Flexibilidad en timing del cierre según sus necesidades',
                  'Compromisos sobre empleados clave',
                  'Mantener relaciones con proveedores/clientes que le importan',
                ]}
              />

              <h3 className="text-xl font-semibold mt-6 mb-3">Gestionar Exclusividad</h3>
              <p>
                La exclusividad es valiosa. Cuánto tiempo pides y qué ofreces a cambio:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>60 días:</strong> Mínimo para due diligence básica</li>
                <li><strong>90 días:</strong> Estándar para DD completa</li>
                <li><strong>120+ días:</strong> Para deals complejos o con financiación pendiente</li>
              </ul>
            </GuideSection>

            <GuideSection id="redflags" icon={AlertTriangle} title="Red Flags Durante la Negociación">
              <GuideTip variant="warning" title="Cambios de posición constantes">
                Si el vendedor cambia términos acordados repetidamente, puede indicar falta de seriedad o que hay otro comprador en la sombra.
              </GuideTip>

              <GuideTip variant="warning" title="Prisa injustificada">
                Si el vendedor presiona por cerrar en semanas sin razón clara, pregúntate por qué. Puede haber problemas que quiere esconder.
              </GuideTip>

              <GuideTip variant="warning" title="Resistencia a due diligence">
                Reluctancia a compartir información o acceso es una señal de alerta seria. Puede indicar cosas que ocultar.
              </GuideTip>

              <GuideTip variant="warning" title="Dependencia excesiva">
                Si durante la negociación queda claro que TODO depende del propietario, el valor real del negocio es mucho menor.
              </GuideTip>

              <GuideTip variant="warning" title="Expectativas irreales de precio">
                Si tras varias conversaciones el gap de precio sigue siendo &gt;30%, probablemente no cerrará.
              </GuideTip>
            </GuideSection>

            <GuideSection id="asesor" icon={Users} title="El Rol del Asesor M&A">
              <p>
                Trabajar con o sin intermediario tiene pros y contras:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold mb-2">Con intermediario</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ Vendedor ya cualificado y preparado</li>
                    <li>✓ Proceso más estructurado</li>
                    <li>✓ Buffer emocional en negociación</li>
                    <li>✗ Coste de comisión (3-5%)</li>
                    <li>✗ Posible competencia con otros compradores</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold mb-2">Sin intermediario</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ Relación directa con propietario</li>
                    <li>✓ Potencialmente mejor precio</li>
                    <li>✓ Menos competencia</li>
                    <li>✗ Más trabajo de sourcing</li>
                    <li>✗ Vendedor puede estar menos preparado</li>
                  </ul>
                </div>
              </div>

              <GuideTip variant="tip" title="Cuándo contratar tu propio asesor">
                Si es tu primera adquisición, considera tener tu propio asesor M&A del lado comprador. El coste (€30-80K típico) puede ahorrarte errores costosos.
              </GuideTip>
            </GuideSection>

            <GuideCTA
              title="¿Estás en proceso de negociación?"
              description="Te ayudamos a estructurar tu oferta y negociar términos justos para ambas partes. Experiencia en más de 150 transacciones."
            />
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsNegotiation;

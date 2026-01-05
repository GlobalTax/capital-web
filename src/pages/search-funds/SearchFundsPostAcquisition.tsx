import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Calendar, Users, TrendingUp, MessageSquare, AlertTriangle, Target, CheckCircle, Clock, BarChart3, Heart } from 'lucide-react';
import { GuideHero, GuideTip, GuideChecklist, GuideCTA, GuideSection, GuideMetricsGrid } from '@/components/search-funds-guides';

const SearchFundsPostAcquisition = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <Helmet>
        <title>Los Primeros 100 Días Post-Adquisición | Guía para Search Funds | Capittal</title>
        <meta 
          name="description" 
          content="Plan de transición tras adquirir una empresa: comunicación con empleados, retención de talento, quick wins, KPIs a monitorear y errores comunes a evitar." 
        />
        <link rel="canonical" href="https://capittal.es/search-funds/recursos/post-adquisicion" />
      </Helmet>

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <GuideHero
              icon={Calendar}
              tag="Operaciones"
              title="Los Primeros 100 Días Post-Adquisición"
              description="La adquisición es solo el principio. Los primeros 100 días son críticos para establecer tu liderazgo, retener talento y sentar las bases del crecimiento futuro."
              readTime="14 min lectura"
            />

            <GuideMetricsGrid
              metrics={[
                { value: '100', label: 'Días críticos', description: 'Periodo de transición clave' },
                { value: '70%', label: 'Rotación evitable', description: 'Con buena comunicación' },
                { value: '6-12', label: 'Meses transición', description: 'Con vendedor típico' },
                { value: '3-5', label: 'Quick wins', description: 'Objetivo primer mes' },
              ]}
            />

            <GuideSection id="plan" icon={Calendar} title="Plan de Transición: Día 1 al 100">
              <p>
                Los primeros días marcan el tono de tu liderazgo. Planifica con detalle qué harás cada semana:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">🗓️ Día 1: El Anuncio</h3>
              <GuideChecklist
                items={[
                  'Reunión general con todos los empleados (presencial si es posible)',
                  'Mensaje claro: continuidad, respeto al legado, nuevas oportunidades',
                  'Presentación del vendedor apoyando la transición',
                  'Comunicación a clientes clave (carta o llamada)',
                  'Comunicación a proveedores estratégicos',
                  'Actualización de documentación legal básica',
                ]}
              />

              <GuideTip variant="tip" title="El discurso del Día 1">
                Prepara y ensaya tu discurso. Incluye: agradecimiento al propietario anterior, reconocimiento al equipo, tu visión (sin prometer cambios concretos), y apertura a escuchar.
              </GuideTip>

              <h3 className="text-xl font-semibold mt-6 mb-3">📅 Semana 1: Escuchar y Aprender</h3>
              <div className="space-y-4 my-6">
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold">Reuniones 1:1 con equipo clave</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Directivos y mandos intermedios</li>
                    <li>• Empleados veteranos (&gt;10 años)</li>
                    <li>• Personas que el vendedor identificó como críticas</li>
                    <li>• Pregunta: "¿Qué funciona bien? ¿Qué cambiarías?"</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <h4 className="font-semibold">Inmersión operativa</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Shadowing en todas las áreas (producción, ventas, admin)</li>
                    <li>• Entender flujos de trabajo actuales</li>
                    <li>• Identificar cuellos de botella obvios</li>
                    <li>• NO hacer cambios todavía</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">📅 Mes 1: Diagnóstico Operativo</h3>
              <GuideChecklist
                title="Áreas a evaluar en profundidad:"
                items={[
                  'Finanzas: Cash flow real, cobros pendientes, deuda, gastos recurrentes',
                  'Comercial: Pipeline, concentración clientes, margen por cliente/producto',
                  'Operaciones: Capacidad, eficiencia, dependencias de proveedores',
                  'Equipo: Organigrama real vs. formal, compensaciones, motivación',
                  'Sistemas: ERP, CRM, herramientas de gestión, automatización',
                  'Legal: Contratos clave, litigios pendientes, cumplimiento normativo',
                ]}
              />

              <h3 className="text-xl font-semibold mt-6 mb-3">📅 Meses 2-3: Primeras Acciones</h3>
              <p>
                Con el diagnóstico completo, puedes empezar a actuar. Prioriza acciones de alto impacto y bajo riesgo:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Implementar 3-5 "quick wins" identificados</li>
                <li>Establecer reuniones de equipo regulares</li>
                <li>Definir KPIs y sistema de reporting</li>
                <li>Iniciar optimizaciones operativas evidentes</li>
                <li>Formalizar procesos que solo estaban "en la cabeza" del dueño</li>
              </ul>
            </GuideSection>

            <GuideSection id="gestion-cambio" icon={Users} title="Gestión del Cambio">
              <h3 className="text-xl font-semibold mt-6 mb-3">Mantener vs. Cambiar</h3>
              <p>
                La tentación de "arreglar todo" es fuerte, pero la resistencia al cambio puede destruir valor:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">✓ Mantener (al menos 6 meses)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Cultura y tradiciones positivas</li>
                    <li>• Procesos que funcionan bien</li>
                    <li>• Relaciones con clientes y proveedores</li>
                    <li>• Equipo que performa</li>
                    <li>• Marca y posicionamiento</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">⚡ Cambiar cuando esté claro</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Ineficiencias obvias con ROI claro</li>
                    <li>• Herramientas anticuadas que limitan</li>
                    <li>• Procesos sin documentar</li>
                    <li>• Reporting y visibilidad financiera</li>
                    <li>• Roles mal definidos</li>
                  </ul>
                </div>
              </div>

              <GuideTip variant="warning" title="La regla del 80/20">
                En los primeros 100 días, mantén el 80% de las cosas como están. Solo cambia el 20% que tiene impacto claro y consenso del equipo.
              </GuideTip>

              <h3 className="text-xl font-semibold mt-6 mb-3">Retener Talento Crítico</h3>
              <p>
                Identificar y retener a las personas clave es una prioridad absoluta:
              </p>

              <GuideChecklist
                title="Estrategias de retención:"
                items={[
                  'Identificar las 5-10 personas más críticas para el negocio',
                  'Reuniones 1:1 frecuentes en los primeros meses',
                  'Entender sus motivaciones personales (no solo económicas)',
                  'Ofrecer claridad sobre su futuro y crecimiento',
                  'Considerar incentivos de retención (bonus, equity phantom)',
                  'Delegar responsabilidad real (señal de confianza)',
                ]}
              />

              <h3 className="text-xl font-semibold mt-6 mb-3">Gestionar Resistencia</h3>
              <GuideTip variant="info" title="Los tres grupos típicos">
                <ul className="mt-2 space-y-1">
                  <li><strong>Champions (20%):</strong> Entusiastas del cambio. Apóyate en ellos.</li>
                  <li><strong>Neutrales (60%):</strong> Esperan a ver qué pasa. Gánatelos con acciones, no palabras.</li>
                  <li><strong>Resistentes (20%):</strong> Activamente en contra. Escúchalos, pero no dejes que bloqueen.</li>
                </ul>
              </GuideTip>
            </GuideSection>

            <GuideSection id="quickwins" icon={TrendingUp} title="Quick Wins: Victorias Rápidas">
              <p>
                Los quick wins generan momentum y demuestran que el cambio de liderazgo trae mejoras tangibles:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Ejemplos de Quick Wins Comunes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-card border">
                  <BarChart3 className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold">Financieros</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Renegociar contrato de telefonía/internet</li>
                    <li>• Revisar seguros (a menudo sobredimensionados)</li>
                    <li>• Eliminar suscripciones no utilizadas</li>
                    <li>• Acelerar cobros pendientes antiguos</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold">Equipo</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Implementar reuniones de equipo regulares</li>
                    <li>• Mejorar espacio de trabajo (pequeñas inversiones)</li>
                    <li>• Celebrar victorias y reconocer buen trabajo</li>
                    <li>• Clarificar roles y responsabilidades</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <Target className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold">Comerciales</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Reactivar clientes dormidos</li>
                    <li>• Subir precios donde hay margen evidente</li>
                    <li>• Mejorar presencia online básica</li>
                    <li>• Responder leads más rápido</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold">Operativos</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Automatizar tareas manuales repetitivas</li>
                    <li>• Implementar herramientas de gestión básicas</li>
                    <li>• Documentar procesos críticos</li>
                    <li>• Eliminar pasos innecesarios en flujos</li>
                  </ul>
                </div>
              </div>

              <GuideTip variant="tip" title="Comunica los quick wins">
                Cuando logres una mejora, comunícala al equipo. Esto genera confianza y demuestra que el cambio trae beneficios.
              </GuideTip>
            </GuideSection>

            <GuideSection id="vendedor" icon={Heart} title="Relación con el Vendedor">
              <p>
                El período de transición con el vendedor es crítico. Manéjalo con cuidado:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Estructura Típica de Transición</h3>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left font-semibold border">Fase</th>
                      <th className="p-3 text-left font-semibold border">Duración</th>
                      <th className="p-3 text-left font-semibold border">Rol del Vendedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-3 border">Intensiva</td><td className="p-3 border">1-3 meses</td><td className="p-3 border">Full-time, transferencia activa de conocimiento</td></tr>
                    <tr><td className="p-3 border">Reducida</td><td className="p-3 border">3-6 meses</td><td className="p-3 border">Part-time, disponible para consultas</td></tr>
                    <tr><td className="p-3 border">Consultiva</td><td className="p-3 border">6-12 meses</td><td className="p-3 border">A demanda, para temas puntuales</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Transferencia de Conocimiento</h3>
              <GuideChecklist
                title="Información crítica a documentar:"
                items={[
                  'Relaciones clave con clientes (quién toma decisiones, historial)',
                  'Relaciones con proveedores (términos, contactos, alternativas)',
                  'Empleados clave (fortalezas, debilidades, motivaciones)',
                  'Procesos no documentados (el "cómo se hacen las cosas aquí")',
                  'Problemas pasados y cómo se resolvieron',
                  'Oportunidades identificadas pero no ejecutadas',
                  'Contraseñas, accesos y sistemas',
                ]}
              />

              <GuideTip variant="info" title="El café semanal">
                Establece una reunión semanal informal con el vendedor durante los primeros meses. Sin agenda formal, solo para hablar del negocio. Surgirán insights valiosos.
              </GuideTip>
            </GuideSection>

            <GuideSection id="kpis" icon={BarChart3} title="KPIs a Monitorear">
              <p>
                Establece un dashboard de métricas desde el día 1. Lo que no se mide, no se mejora:
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Métricas Financieras</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                {[
                  { name: 'Ingresos mensuales', freq: 'Mensual' },
                  { name: 'EBITDA mensual', freq: 'Mensual' },
                  { name: 'Cash flow operativo', freq: 'Semanal' },
                  { name: 'Días de cobro (DSO)', freq: 'Mensual' },
                  { name: 'Margen bruto %', freq: 'Mensual' },
                  { name: 'Gastos fijos', freq: 'Mensual' },
                  { name: 'Posición de caja', freq: 'Diario' },
                  { name: 'Deuda neta', freq: 'Mensual' },
                ].map((kpi) => (
                  <div key={kpi.name} className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="font-medium text-sm">{kpi.name}</p>
                    <p className="text-xs text-muted-foreground">{kpi.freq}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Métricas de Cliente</h3>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>NPS o satisfacción:</strong> Encuesta simple a clientes principales</li>
                <li><strong>Retención de clientes:</strong> % que repite o renueva</li>
                <li><strong>Concentración:</strong> % ingresos de top 5 clientes</li>
                <li><strong>Pipeline comercial:</strong> Oportunidades en proceso</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Métricas de Equipo</h3>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Rotación:</strong> % empleados que se van (alerta si &gt;20% año 1)</li>
                <li><strong>Absentismo:</strong> Indicador de clima laboral</li>
                <li><strong>Encuesta de clima:</strong> Pulso del equipo (cada 3-6 meses)</li>
                <li><strong>Cumplimiento objetivos:</strong> Por departamento/persona</li>
              </ul>
            </GuideSection>

            <GuideSection id="errores" icon={AlertTriangle} title="Errores Comunes a Evitar">
              <GuideTip variant="warning" title="Cambiar demasiado rápido">
                La impaciencia por "dejar tu marca" puede alienar al equipo y romper cosas que funcionaban. Los primeros 100 días son para escuchar y diagnosticar, no para revolucionar.
              </GuideTip>

              <GuideTip variant="warning" title="No escuchar al equipo existente">
                Los empleados conocen el negocio mejor que tú. Ignorar su input es perder información valiosa y generar resistencia innecesaria.
              </GuideTip>

              <GuideTip variant="warning" title="Subestimar la cultura">
                "Así se hacen las cosas aquí" no es siempre resistencia al cambio. A veces hay razones válidas para las prácticas establecidas. Entiéndelas antes de cambiarlas.
              </GuideTip>

              <GuideTip variant="warning" title="Descuidar la comunicación">
                En ausencia de información, la gente asume lo peor. Comunica frecuentemente, aunque no tengas novedades. El silencio genera ansiedad.
              </GuideTip>

              <GuideTip variant="warning" title="Olvidar a los clientes">
                Tan absorto en la operación interna que descuidas la relación con clientes. Son los que pagan las facturas.
              </GuideTip>

              <GuideTip variant="warning" title="No pedir ayuda">
                El orgullo de "puedo solo" es peligroso. Usa a tus inversores como recurso, consulta a mentores, y no dudes en contratar expertise externa cuando lo necesites.
              </GuideTip>
            </GuideSection>

            <GuideCTA
              title="¿Acabas de cerrar tu primera adquisición?"
              description="Felicidades. Si necesitas apoyo durante la transición o tienes preguntas sobre los primeros pasos, estamos aquí para ayudarte."
              primaryAction={{ label: 'Hablar con un experto', href: '/contacto' }}
              secondaryAction={{ label: 'Más guías', href: '/search-funds/recursos' }}
            />
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsPostAcquisition;

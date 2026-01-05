import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { Target, Mail, Phone, Users, Database, TrendingUp, AlertCircle, BarChart3, Briefcase, MessageSquare } from 'lucide-react';
import { GuideHero, GuideTip, GuideChecklist, GuideCTA, GuideSection, GuideMetricsGrid } from '@/components/search-funds-guides';

const SearchFundsSourcing = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <UnifiedLayout>
      <Helmet>
        <title>Cómo Conseguir Empresas para un Search Fund | Guía de Sourcing | Capittal</title>
        <meta 
          name="description" 
          content="Guía completa de sourcing para Search Funds: canales de adquisición, estrategias de outreach, métricas de embudo y gestión del pipeline de oportunidades." 
        />
        <link rel="canonical" href="https://capittal.es/search-funds/recursos/sourcing" />
      </Helmet>

      <div className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <GuideHero
              icon={Target}
              tag="Sourcing"
              title="Cómo Conseguir Empresas para un Search Fund"
              description="El sourcing es la fase más crítica y prolongada del proceso Search Fund. Aprende los canales, estrategias y métricas que utilizan los searchers más exitosos."
              readTime="15 min lectura"
            />

            <GuideMetricsGrid
              metrics={[
                { value: '500+', label: 'Contactos típicos', description: 'Durante la búsqueda' },
                { value: '2-3%', label: 'Ratio de interés', description: 'Contactos → reuniones' },
                { value: '18-24', label: 'Meses de búsqueda', description: 'Duración media' },
                { value: '1', label: 'Adquisición final', description: 'Objetivo del proceso' },
              ]}
            />

            <GuideSection id="introduccion" icon={Target} title="¿Qué es el Sourcing en Search Funds?">
              <p>
                El <strong>sourcing</strong> es el proceso sistemático de identificar, contactar y cultivar relaciones con propietarios de empresas que podrían estar interesados en vender su negocio. Es la actividad principal de un searcher durante la fase de búsqueda.
              </p>
              <p>
                A diferencia de los fondos de Private Equity que reciben dealflow a través de intermediarios, los Search Funds suelen generar su propio pipeline de oportunidades mediante contacto directo con propietarios. Esto requiere persistencia, metodología y una estrategia clara.
              </p>
              
              <GuideTip variant="info" title="El embudo del sourcing">
                De cada 100 contactos iniciales, típicamente 2-5 muestran interés inicial, 1-2 avanzan a reuniones serias, y solo una fracción llega a LOI. Por eso el volumen es clave.
              </GuideTip>
            </GuideSection>

            <GuideSection id="canales" icon={Database} title="Canales de Sourcing">
              <p>Existen múltiples canales para encontrar empresas target. Los searchers exitosos suelen combinar varios de ellos:</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">1. Outbound Directo (el más común)</h3>
              <p>
                Consiste en identificar empresas que encajan con tu tesis de inversión y contactar directamente al propietario. Fuentes de datos:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>SABI (Sistema de Análisis de Balances Ibéricos)</strong> - Base de datos financiera de empresas españolas y portuguesas</li>
                <li><strong>Orbis / BvD</strong> - Datos a nivel europeo</li>
                <li><strong>Axesor / Informa</strong> - Informes comerciales y datos de contacto</li>
                <li><strong>LinkedIn Sales Navigator</strong> - Para identificar directivos y propietarios</li>
                <li><strong>Registros mercantiles</strong> - Información pública de sociedades</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">2. Intermediarios M&A</h3>
              <p>
                Boutiques de M&A, asesores financieros y despachos de abogados que trabajan con vendedores:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Enviar tu "buyer profile" a intermediarios del sector</li>
                <li>Asistir a eventos del sector M&A</li>
                <li>Mantener relaciones con asesores locales en zonas industriales</li>
              </ul>
              
              <GuideTip variant="tip" title="Ventaja de los intermediarios">
                Aunque cobran una comisión (típicamente 3-5% del deal), los deals a través de intermediarios suelen cerrar más rápido porque el vendedor ya está "preparado" para vender.
              </GuideTip>

              <h3 className="text-xl font-semibold mt-6 mb-3">3. Red Personal y Referidos</h3>
              <p>
                Tu red de contactos puede ser una fuente valiosa de deal flow:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Alumni de escuelas de negocio (IESE, IE, ESADE)</li>
                <li>Ex-compañeros de trabajo y mentores</li>
                <li>Contables y asesores fiscales que trabajan con PYMEs</li>
                <li>Banqueros de empresas y gestores patrimoniales</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">4. Eventos de Propietarios</h3>
              <p>
                Eventos donde se concentran empresarios en edad de jubilación:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Ferias sectoriales y congresos de industria</li>
                <li>Asociaciones empresariales locales</li>
                <li>Cámaras de Comercio</li>
                <li>Clubes de empresarios</li>
              </ul>
            </GuideSection>

            <GuideSection id="outreach" icon={MessageSquare} title="Estrategia de Outreach">
              <p>
                El contacto inicial es crucial. Debes transmitir profesionalidad, respeto por el legado del empresario y una propuesta de valor clara.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Canales de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="p-4 rounded-xl bg-card border">
                  <Mail className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold">Carta física</h4>
                  <p className="text-sm text-muted-foreground">Mayor tasa de apertura. Ideal para primer contacto con propietarios tradicionales.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <Phone className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold">Llamada telefónica</h4>
                  <p className="text-sm text-muted-foreground">Seguimiento tras carta. Permite evaluar interés real rápidamente.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border">
                  <MessageSquare className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-semibold">Email + LinkedIn</h4>
                  <p className="text-sm text-muted-foreground">Para perfiles más digitales. Permite escalar el contacto.</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Estructura de la Carta Inicial</h3>
              <GuideChecklist
                title="Elementos clave de una carta efectiva:"
                items={[
                  'Presentación personal breve (quién eres, tu background)',
                  'Explicación clara de qué es un Search Fund (sin jerga financiera)',
                  'Por qué su empresa específicamente te interesa',
                  'Énfasis en continuidad del legado y empleados',
                  'Propuesta de conversación sin compromiso',
                  'Datos de contacto múltiples (teléfono, email, LinkedIn)',
                ]}
              />

              <GuideTip variant="warning" title="Errores comunes en outreach">
                Evita: cartas genéricas, hablar solo de dinero, presionar por una decisión rápida, o parecer que estás "comprando empresas en lote". Cada propietario debe sentir que te interesa SU empresa.
              </GuideTip>

              <h3 className="text-xl font-semibold mt-6 mb-3">Frecuencia de Seguimiento</h3>
              <p>
                El seguimiento persistente pero respetuoso es clave. Muchos deals se cierran después de múltiples contactos a lo largo de meses o años:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Semana 1:</strong> Envío de carta física</li>
                <li><strong>Semana 2:</strong> Llamada de seguimiento</li>
                <li><strong>Semana 4:</strong> Email de recordatorio si no hay respuesta</li>
                <li><strong>Cada 3-6 meses:</strong> Contacto de "nurturing" con novedades relevantes</li>
              </ul>
            </GuideSection>

            <GuideSection id="metricas" icon={BarChart3} title="Métricas de Sourcing">
              <p>
                Medir el rendimiento de tu sourcing es esencial para optimizar el proceso y proyectar timelines realistas.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">El Embudo Típico de un Search Fund</h3>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left font-semibold border">Etapa</th>
                      <th className="p-3 text-left font-semibold border">Cantidad Típica</th>
                      <th className="p-3 text-left font-semibold border">% Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-3 border">Empresas identificadas</td><td className="p-3 border">1,000 - 2,000</td><td className="p-3 border">100%</td></tr>
                    <tr><td className="p-3 border">Contactos enviados</td><td className="p-3 border">500 - 1,000</td><td className="p-3 border">50%</td></tr>
                    <tr><td className="p-3 border">Respuestas recibidas</td><td className="p-3 border">50 - 100</td><td className="p-3 border">10%</td></tr>
                    <tr><td className="p-3 border">Reuniones realizadas</td><td className="p-3 border">20 - 40</td><td className="p-3 border">40%</td></tr>
                    <tr><td className="p-3 border">NDAs firmados</td><td className="p-3 border">10 - 20</td><td className="p-3 border">50%</td></tr>
                    <tr><td className="p-3 border">LOIs enviadas</td><td className="p-3 border">2 - 5</td><td className="p-3 border">20%</td></tr>
                    <tr><td className="p-3 border font-semibold">Cierres</td><td className="p-3 border font-semibold">1</td><td className="p-3 border font-semibold">30-50%</td></tr>
                  </tbody>
                </table>
              </div>

              <GuideTip variant="info">
                Estos números varían significativamente según el sector, geografía y tesis de inversión. Lo importante es trackear tus propios ratios y optimizar.
              </GuideTip>

              <h3 className="text-xl font-semibold mt-6 mb-3">KPIs Semanales Recomendados</h3>
              <GuideChecklist
                items={[
                  'Nuevas empresas añadidas al pipeline: 20-50/semana',
                  'Cartas/emails enviados: 15-30/semana',
                  'Llamadas de seguimiento realizadas: 20-40/semana',
                  'Reuniones (calls/presenciales): 2-5/semana',
                  'NDAs en proceso: seguimiento activo',
                ]}
              />
            </GuideSection>

            <GuideSection id="pipeline" icon={Briefcase} title="Gestión del Pipeline">
              <p>
                Un pipeline bien organizado es crucial cuando estás gestionando cientos de contactos en diferentes etapas.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Herramientas CRM Recomendadas</h3>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>HubSpot (Free)</strong> - Excelente para empezar, versión gratuita muy completa</li>
                <li><strong>Pipedrive</strong> - Diseñado para ventas, muy visual</li>
                <li><strong>Notion</strong> - Flexible, ideal si prefieres personalizar</li>
                <li><strong>Airtable</strong> - Potente para bases de datos relacionales</li>
                <li><strong>Excel/Google Sheets</strong> - Funciona, pero escala mal</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Etapas del Pipeline</h3>
              <div className="space-y-3 my-6">
                {[
                  { stage: '1. Identificada', desc: 'Empresa que encaja con la tesis' },
                  { stage: '2. Contactada', desc: 'Primer contacto enviado' },
                  { stage: '3. Respuesta', desc: 'Ha respondido (positivo, negativo o neutro)' },
                  { stage: '4. Reunión', desc: 'Call o meeting realizado' },
                  { stage: '5. NDA', desc: 'Información confidencial compartida' },
                  { stage: '6. Análisis', desc: 'Due diligence preliminar' },
                  { stage: '7. LOI', desc: 'Oferta presentada' },
                  { stage: '8. Exclusividad', desc: 'LOI aceptada, due diligence final' },
                  { stage: '9. Cierre', desc: 'Transacción completada' },
                ].map((item) => (
                  <div key={item.stage} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="font-mono text-sm text-primary font-semibold">{item.stage}</span>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </GuideSection>

            <GuideSection id="errores" icon={AlertCircle} title="Errores Comunes en Sourcing">
              <GuideTip variant="warning" title="Tesis demasiado estrecha o amplia">
                Una tesis muy estrecha (solo restaurantes de sushi en Bilbao) limita el universo. Una muy amplia (cualquier empresa rentable) hace el outreach genérico e ineficiente.
              </GuideTip>

              <GuideTip variant="warning" title="No hacer seguimiento">
                El 80% de los deals se cierran después de múltiples contactos. Abandonar tras un "no" inicial o silencio es un error. Muchos propietarios necesitan tiempo para madurar la idea.
              </GuideTip>

              <GuideTip variant="warning" title="Descuidar la relación">
                Tratar el sourcing como una transacción pura, sin construir relación genuina con el propietario. Recuerda que estás comprando el "bebé" de alguien.
              </GuideTip>

              <GuideTip variant="warning" title="No trackear métricas">
                Sin datos, no puedes optimizar. Necesitas saber qué canales funcionan mejor, qué mensajes tienen mejor respuesta, y proyectar tiempos realistas.
              </GuideTip>
            </GuideSection>

            <GuideCTA
              title="¿Necesitas ayuda con el sourcing?"
              description="En Capittal conectamos a Search Funds con empresas cualificadas. Si eres un searcher buscando dealflow o un propietario explorando opciones, hablemos."
            />
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsSourcing;

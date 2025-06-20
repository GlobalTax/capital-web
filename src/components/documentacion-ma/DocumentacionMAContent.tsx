import React from 'react';
import { 
  Target,
  TrendingUp,
  Building2,
  CheckCircle,
  Clock,
  Calculator,
  DollarSign,
  Scale,
  Users
} from 'lucide-react';

const DocumentacionMAContent = () => {
  const navigationItems = [
    { label: 'Introducción a M&A', href: '#introduccion' },
    { label: 'Tipos de Operaciones', href: '#tipos-operaciones' },
    { label: 'Proceso de M&A', href: '#proceso-ma' },
    { label: 'Métodos de Valoración', href: '#valoracion' },
    { label: 'Due Diligence', href: '#due-diligence' },
    { label: 'Estructuras de Financiación', href: '#financiacion' },
    { label: 'Aspectos Legales', href: '#aspectos-legales' },
    { label: 'Integración Post-M&A', href: '#integracion' }
  ];

  const processSteps = [
    {
      fase: "Estrategia y Planificación",
      descripcion: "Definición de objetivos estratégicos y criterios de búsqueda",
      duracion: "2-4 semanas",
      numero: "01"
    },
    {
      fase: "Identificación y Screening",
      descripcion: "Búsqueda y evaluación preliminar de targets",
      duracion: "4-8 semanas",
      numero: "02"
    },
    {
      fase: "Valoración y Ofertas",
      descripcion: "Análisis detallado y presentación de ofertas",
      duracion: "6-10 semanas",
      numero: "03"
    },
    {
      fase: "Due Diligence",
      descripcion: "Análisis exhaustivo de la empresa objetivo",
      duracion: "8-12 semanas",
      numero: "04"
    },
    {
      fase: "Negociación y Cierre",
      descripcion: "Negociación final y firma de documentos",
      duracion: "4-8 semanas",
      numero: "05"
    }
  ];

  const valuationMethods = [
    {
      metodo: "DCF (Flujos Descontados)",
      descripcion: "Valoración basada en proyección de flujos de caja futuros descontados",
      caracteristicas: ["Proyección 5-10 años", "Valor terminal", "WACC como tasa descuento"],
      color: "blue"
    },
    {
      metodo: "Múltiplos Comparables",
      descripcion: "Valoración relativa basada en múltiplos de empresas similares",
      caracteristicas: ["EV/EBITDA", "P/E ratio", "P/B ratio"],
      color: "green"
    },
    {
      metodo: "Transacciones Precedentes",
      descripcion: "Valoración basada en transacciones M&A recientes del sector",
      caracteristicas: ["Prima de control", "Múltiplos de transacción", "Ajustes por tamaño"],
      color: "purple"
    }
  ];

  const dueDiligenceTypes = [
    {
      tipo: "Financiera",
      icon: DollarSign,
      color: "blue",
      areas: ["Estados financieros", "Calidad de earnings", "Working capital", "Deuda neta", "Proyecciones"]
    },
    {
      tipo: "Comercial",
      icon: TrendingUp,
      color: "green", 
      areas: ["Análisis de mercado", "Posición competitiva", "Clientes clave", "Canales venta", "Pricing"]
    },
    {
      tipo: "Legal",
      icon: Scale,
      color: "red",
      areas: ["Estructura societaria", "Contratos clave", "Litigios", "Compliance", "IP"]
    },
    {
      tipo: "Operacional",
      icon: Users,
      color: "purple",
      areas: ["Equipo directivo", "Sistemas IT", "Procesos", "Proveedores", "Instalaciones"]
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white p-8 rounded-lg border-0.5 border-black">
                <h3 className="text-xl font-semibold text-black mb-8">Contenidos</h3>
                <nav className="space-y-4">
                  {navigationItems.map((item, index) => (
                    <a 
                      key={index}
                      href={item.href} 
                      className="block text-gray-600 hover:text-black transition-colors py-2"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-24">
            
            {/* Introducción */}
            <section id="introduccion" className="scroll-mt-24">
              <h2 className="text-4xl font-bold text-black mb-10">Introducción a M&A</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-10 text-xl leading-relaxed">
                  Las fusiones y adquisiciones (M&A) son transacciones corporativas donde la propiedad, 
                  activos o unidades operativas de las empresas se transfieren o consolidan con otras entidades.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                  <div className="bg-blue-50 p-8 rounded-lg border-0.5 border-blue-200">
                    <h4 className="font-semibold text-black mb-4 text-lg">Fusión</h4>
                    <p className="text-gray-600">
                      Combinación de dos o más empresas en una sola entidad legal.
                    </p>
                  </div>
                  <div className="bg-green-50 p-8 rounded-lg border-0.5 border-green-200">
                    <h4 className="font-semibold text-black mb-4 text-lg">Adquisición</h4>
                    <p className="text-gray-600">
                      Una empresa compra otra empresa o una parte significativa de sus activos.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tipos de Operaciones */}
            <section id="tipos-operaciones" className="scroll-mt-24">
              <h2 className="text-4xl font-bold text-black mb-10">Tipos de Operaciones M&A</h2>
              <div className="space-y-10">
                <div className="bg-white border-0.5 border-black rounded-lg p-10">
                  <h3 className="text-2xl font-semibold text-black mb-6 flex items-center gap-4">
                    <Target className="w-6 h-6 text-blue-600" />
                    Integración Horizontal
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Fusión entre empresas que operan en la misma industria y etapa de la cadena de valor.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['Eliminación de competencia', 'Economías de escala', 'Mayor cuota de mercado', 'Reducción de costes'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border-0.5 border-black rounded-lg p-10">
                  <h3 className="text-2xl font-semibold text-black mb-6 flex items-center gap-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    Integración Vertical
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Adquisición de empresas en diferentes etapas de la cadena de suministro.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['Control cadena suministro', 'Reducción costes transacción', 'Mayor control calidad', 'Eliminación intermediarios'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border-0.5 border-black rounded-lg p-10">
                  <h3 className="text-2xl font-semibold text-black mb-6 flex items-center gap-4">
                    <Building2 className="w-6 h-6 text-purple-600" />
                    Fusión de Conglomerado
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Combinación de empresas en industrias no relacionadas.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['Diversificación riesgos', 'Sinergias financieras', 'Nuevos mercados', 'Optimización fiscal'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Proceso de M&A */}
            <section id="proceso-ma" className="scroll-mt-24">
              <h2 className="text-4xl font-bold text-black mb-10">Proceso de M&A</h2>
              <div className="space-y-8">
                {processSteps.map((fase, index) => (
                  <div key={index} className="bg-white border-0.5 border-black rounded-lg p-8">
                    <div className="flex items-start gap-8">
                      <div className="w-16 h-16 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {fase.numero}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-black mb-4">{fase.fase}</h3>
                        <p className="text-gray-600 mb-4 text-lg">{fase.descripcion}</p>
                        <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
                          <Clock className="w-4 h-4 mr-2" />
                          {fase.duracion}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Valoración */}
            <section id="valoracion" className="scroll-mt-24">
              <h2 className="text-4xl font-bold text-black mb-10">Métodos de Valoración</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {valuationMethods.map((metodo, index) => (
                  <div key={index} className="bg-white border-0.5 border-black rounded-lg p-8">
                    <div className={`w-16 h-16 bg-${metodo.color}-50 rounded-lg flex items-center justify-center mb-6`}>
                      <Calculator className={`w-8 h-8 text-${metodo.color}-600`} />
                    </div>
                    <h3 className="font-semibold text-black mb-4 text-lg">{metodo.metodo}</h3>
                    <p className="text-gray-600 mb-6">{metodo.descripcion}</p>
                    <ul className="space-y-2">
                      {metodo.caracteristicas.map((item, i) => (
                        <li key={i} className="text-gray-500 flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Due Diligence */}
            <section id="due-diligence" className="scroll-mt-24">
              <h2 className="text-4xl font-bold text-black mb-10">Due Diligence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {dueDiligenceTypes.map((dd, index) => (
                  <div key={index} className="bg-white border-0.5 border-black rounded-lg p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 bg-${dd.color}-50 rounded-lg flex items-center justify-center`}>
                        <dd.icon className={`w-6 h-6 text-${dd.color}-600`} />
                      </div>
                      <h3 className="font-semibold text-black text-lg">{dd.tipo}</h3>
                    </div>
                    <ul className="space-y-3">
                      {dd.areas.map((area, i) => (
                        <li key={i} className="text-gray-600 flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Financiación */}
            <section id="financiacion" className="scroll-mt-24">
              <h2 className="text-4xl font-bold text-black mb-10">Estructuras de Financiación</h2>
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { tipo: "Cash", descripcion: "Pago en efectivo al cierre de la transacción", color: "green" },
                    { tipo: "Stock", descripcion: "Intercambio de acciones entre comprador y vendedor", color: "blue" },
                    { tipo: "Earn-out", descripcion: "Pagos contingentes basados en performance futura", color: "purple" }
                  ].map((estructura, index) => (
                    <div key={index} className={`bg-${estructura.color}-50 border border-${estructura.color}-100 rounded-lg p-8 text-center`}>
                      <h4 className="font-semibold text-black mb-3 text-lg">{estructura.tipo}</h4>
                      <p className="text-gray-600">{estructura.descripcion}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white border-0.5 border-black rounded-lg p-10">
                  <h3 className="text-2xl font-semibold text-black mb-8">Estructura Típica de Financiación LBO</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-blue-50 rounded-lg border-0.5 border-blue-200">
                      <span className="font-medium text-black text-lg">Equity (20-40%)</span>
                      <span className="text-gray-600">Aportación del sponsor/management</span>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-green-50 rounded-lg border-0.5 border-green-200">
                      <span className="font-medium text-black text-lg">Senior Debt (40-60%)</span>
                      <span className="text-gray-600">Deuda bancaria senior</span>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-yellow-50 rounded-lg border-0.5 border-yellow-200">
                      <span className="font-medium text-black text-lg">Mezzanine (10-20%)</span>
                      <span className="text-gray-600">Deuda subordinada + warrants</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Aspectos Legales */}
            <section id="aspectos-legales" className="scroll-mt-24">
              <h2 className="text-4xl font-bold text-black mb-10">Aspectos Legales y Regulatorios</h2>
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-semibold text-black mb-8">Documentación Clave</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { doc: "LOI/MOU", descripcion: "Letter of Intent - Términos principales no vinculantes" },
                      { doc: "SPA", descripcion: "Share Purchase Agreement - Contrato definitivo" },
                      { doc: "Disclosure Letter", descripcion: "Excepciones a las garantías del vendedor" },
                      { doc: "Escrow Agreement", descripcion: "Retención de parte del precio para garantías" }
                    ].map((documento, index) => (
                      <div key={index} className="bg-white border-0.5 border-black rounded-lg p-6">
                        <h4 className="font-medium text-black mb-3 text-lg">{documento.doc}</h4>
                        <p className="text-gray-600">{documento.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-black mb-8">Autorizaciones Regulatorias</h3>
                  <div className="space-y-6">
                    {[
                      { tipo: "Competencia", descripcion: "CNMC en España, notificación si supera umbrales" },
                      { tipo: "Sectorial", descripcion: "Autorizaciones específicas (banca, seguros, telecoms, etc.)" },
                      { tipo: "IED", descripcion: "Inversión extranjera directa si aplica" },
                      { tipo: "Works Council", descripcion: "Consulta a representantes de trabajadores" }
                    ].map((autorizacion, index) => (
                      <div key={index} className="flex items-start gap-6 p-6 bg-gray-50 rounded-lg border-0.5 border-gray-200">
                        <div className="w-3 h-3 bg-black rounded-full mt-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-black text-lg">{autorizacion.tipo}</h4>
                          <p className="text-gray-600">{autorizacion.descripcion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Integración Post-M&A */}
            <section id="integracion" className="scroll-mt-24">
              <h2 className="text-4xl font-bold text-black mb-10">Integración Post-M&A</h2>
              <div className="space-y-10">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
                  <p className="text-gray-700 text-xl">
                    La integración post-adquisición es crítica para el éxito de la transacción. 
                    Estudios indican que 70-90% del valor se crea o destruye en esta fase.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white border-0.5 border-black rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-black mb-6">Primeros 100 Días</h3>
                    <ul className="space-y-3">
                      {[
                        "Comunicación a stakeholders clave",
                        "Retención de talento crítico", 
                        "Quick wins identificación",
                        "Plan de integración detallado",
                        "Establecimiento de PMO"
                      ].map((item, index) => (
                        <li key={index} className="text-gray-600 flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white border-0.5 border-black rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-black mb-6">Áreas de Integración</h3>
                    <ul className="space-y-3">
                      {[
                        "Sistemas IT y datos",
                        "Procesos operativos",
                        "Cultura organizacional", 
                        "Estructura reportes financieros",
                        "Políticas y compliance"
                      ].map((item, index) => (
                        <li key={index} className="text-gray-600 flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-white border-0.5 border-black rounded-lg p-10">
                  <h3 className="text-xl font-semibold text-black mb-8">KPIs de Integración</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { valor: "95%", descripcion: "Retención talento clave" },
                      { valor: "85%", descripcion: "Integración sistemas IT" },
                      { valor: "100%", descripcion: "Compliance políticas" },
                      { valor: "18 meses", descripcion: "Integración completa" }
                    ].map((kpi, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-black mb-2">{kpi.valor}</div>
                        <div className="text-gray-500">{kpi.descripcion}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentacionMAContent;

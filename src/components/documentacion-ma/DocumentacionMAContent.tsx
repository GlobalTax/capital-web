
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
      caracteristicas: ["Proyección 5-10 años", "Valor terminal", "WACC como tasa descuento"]
    },
    {
      metodo: "Múltiplos Comparables",
      descripcion: "Valoración relativa basada en múltiplos de empresas similares",
      caracteristicas: ["EV/EBITDA", "P/E ratio", "P/B ratio"]
    },
    {
      metodo: "Transacciones Precedentes",
      descripcion: "Valoración basada en transacciones M&A recientes del sector",
      caracteristicas: ["Prima de control", "Múltiplos de transacción", "Ajustes por tamaño"]
    }
  ];

  const dueDiligenceTypes = [
    {
      tipo: "Financiera",
      icon: DollarSign,
      areas: ["Estados financieros", "Calidad de earnings", "Working capital", "Deuda neta", "Proyecciones"]
    },
    {
      tipo: "Comercial",
      icon: TrendingUp,
      areas: ["Análisis de mercado", "Posición competitiva", "Clientes clave", "Canales venta", "Pricing"]
    },
    {
      tipo: "Legal",
      icon: Scale,
      areas: ["Estructura societaria", "Contratos clave", "Litigios", "Compliance", "IP"]
    },
    {
      tipo: "Operacional",
      icon: Users,
      areas: ["Equipo directivo", "Sistemas IT", "Procesos", "Proveedores", "Instalaciones"]
    }
  ];

  return (
    <div className="space-y-24">
      {/* Introducción */}
      <section id="introduccion" className="scroll-mt-24">
        <h2 className="text-4xl font-light text-gray-900 mb-12">Introducción a M&A</h2>
        <div className="prose prose-xl max-w-none">
          <p className="text-gray-600 mb-12 text-xl leading-relaxed font-light">
            Las fusiones y adquisiciones (M&A) son transacciones corporativas donde la propiedad, 
            activos o unidades operativas de las empresas se transfieren o consolidan con otras entidades.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
            <div className="bg-blue-50/30 p-10 rounded-2xl border-l-4 border-blue-200">
              <h4 className="text-xl font-medium text-gray-900 mb-4">Fusión</h4>
              <p className="text-gray-600 font-light leading-relaxed">
                Combinación de dos o más empresas en una sola entidad legal.
              </p>
            </div>
            <div className="bg-green-50/30 p-10 rounded-2xl border-l-4 border-green-200">
              <h4 className="text-xl font-medium text-gray-900 mb-4">Adquisición</h4>
              <p className="text-gray-600 font-light leading-relaxed">
                Una empresa compra otra empresa o una parte significativa de sus activos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tipos de Operaciones */}
      <section id="tipos-operaciones" className="scroll-mt-24">
        <h2 className="text-4xl font-light text-gray-900 mb-12">Tipos de Operaciones M&A</h2>
        <div className="space-y-12">
          <div className="bg-gray-50/30 p-12 rounded-2xl">
            <h3 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              Integración Horizontal
            </h3>
            <p className="text-gray-600 mb-8 text-lg font-light leading-relaxed">
              Fusión entre empresas que operan en la misma industria y etapa de la cadena de valor.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Eliminación de competencia', 'Economías de escala', 'Mayor cuota de mercado', 'Reducción de costes'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50/30 p-12 rounded-2xl">
            <h3 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              Integración Vertical
            </h3>
            <p className="text-gray-600 mb-8 text-lg font-light leading-relaxed">
              Adquisición de empresas en diferentes etapas de la cadena de suministro.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Control cadena suministro', 'Reducción costes transacción', 'Mayor control calidad', 'Eliminación intermediarios'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50/30 p-12 rounded-2xl">
            <h3 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              Fusión de Conglomerado
            </h3>
            <p className="text-gray-600 mb-8 text-lg font-light leading-relaxed">
              Combinación de empresas en industrias no relacionadas.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Diversificación riesgos', 'Sinergias financieras', 'Nuevos mercados', 'Optimización fiscal'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de M&A */}
      <section id="proceso-ma" className="scroll-mt-24">
        <h2 className="text-4xl font-light text-gray-900 mb-12">Proceso de M&A</h2>
        <div className="space-y-8">
          {processSteps.map((fase, index) => (
            <div key={index} className="bg-white border border-gray-100 p-10 rounded-2xl hover:shadow-sm transition-shadow duration-300">
              <div className="flex items-start gap-8">
                <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-light text-lg flex-shrink-0">
                  {fase.numero}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">{fase.fase}</h3>
                  <p className="text-gray-600 mb-6 text-lg font-light leading-relaxed">{fase.descripcion}</p>
                  <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-light">
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
        <h2 className="text-4xl font-light text-gray-900 mb-12">Métodos de Valoración</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valuationMethods.map((metodo, index) => (
            <div key={index} className="bg-gray-50/30 p-10 rounded-2xl">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-8 shadow-sm">
                <Calculator className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">{metodo.metodo}</h3>
              <p className="text-gray-600 mb-8 font-light leading-relaxed">{metodo.descripcion}</p>
              <ul className="space-y-3">
                {metodo.caracteristicas.map((item, i) => (
                  <li key={i} className="text-gray-500 flex items-center gap-3 font-light">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
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
        <h2 className="text-4xl font-light text-gray-900 mb-12">Due Diligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dueDiligenceTypes.map((dd, index) => (
            <div key={index} className="bg-gray-50/30 p-10 rounded-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <dd.icon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">{dd.tipo}</h3>
              </div>
              <ul className="space-y-3">
                {dd.areas.map((area, i) => (
                  <li key={i} className="text-gray-600 flex items-center gap-3 font-light">
                    <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0"></div>
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
        <h2 className="text-4xl font-light text-gray-900 mb-12">Estructuras de Financiación</h2>
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { tipo: "Cash", descripcion: "Pago en efectivo al cierre de la transacción" },
              { tipo: "Stock", descripcion: "Intercambio de acciones entre comprador y vendedor" },
              { tipo: "Earn-out", descripcion: "Pagos contingentes basados en performance futura" }
            ].map((estructura, index) => (
              <div key={index} className="bg-gray-50/30 p-10 rounded-2xl text-center">
                <h4 className="text-xl font-medium text-gray-900 mb-4">{estructura.tipo}</h4>
                <p className="text-gray-600 font-light leading-relaxed">{estructura.descripcion}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50/30 p-12 rounded-2xl">
            <h3 className="text-2xl font-medium text-gray-900 mb-10">Estructura Típica de Financiación LBO</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-8 bg-blue-50/50 rounded-xl">
                <span className="text-xl font-medium text-gray-900">Equity (20-40%)</span>
                <span className="text-gray-600 font-light">Aportación del sponsor/management</span>
              </div>
              <div className="flex items-center justify-between p-8 bg-green-50/50 rounded-xl">
                <span className="text-xl font-medium text-gray-900">Senior Debt (40-60%)</span>
                <span className="text-gray-600 font-light">Deuda bancaria senior</span>
              </div>
              <div className="flex items-center justify-between p-8 bg-yellow-50/50 rounded-xl">
                <span className="text-xl font-medium text-gray-900">Mezzanine (10-20%)</span>
                <span className="text-gray-600 font-light">Deuda subordinada + warrants</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aspectos Legales */}
      <section id="aspectos-legales" className="scroll-mt-24">
        <h2 className="text-4xl font-light text-gray-900 mb-12">Aspectos Legales y Regulatorios</h2>
        <div className="space-y-12">
          <div>
            <h3 className="text-2xl font-medium text-gray-900 mb-10">Documentación Clave</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { doc: "LOI/MOU", descripcion: "Letter of Intent - Términos principales no vinculantes" },
                { doc: "SPA", descripcion: "Share Purchase Agreement - Contrato definitivo" },
                { doc: "Disclosure Letter", descripcion: "Excepciones a las garantías del vendedor" },
                { doc: "Escrow Agreement", descripcion: "Retención de parte del precio para garantías" }
              ].map((documento, index) => (
                <div key={index} className="bg-gray-50/30 p-8 rounded-xl">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">{documento.doc}</h4>
                  <p className="text-gray-600 font-light leading-relaxed">{documento.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-medium text-gray-900 mb-10">Autorizaciones Regulatorias</h3>
            <div className="space-y-6">
              {[
                { tipo: "Competencia", descripcion: "CNMC en España, notificación si supera umbrales" },
                { tipo: "Sectorial", descripcion: "Autorizaciones específicas (banca, seguros, telecoms, etc.)" },
                { tipo: "IED", descripcion: "Inversión extranjera directa si aplica" },
                { tipo: "Works Council", descripcion: "Consulta a representantes de trabajadores" }
              ].map((autorizacion, index) => (
                <div key={index} className="flex items-start gap-6 p-8 bg-gray-50/30 rounded-xl">
                  <div className="w-3 h-3 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{autorizacion.tipo}</h4>
                    <p className="text-gray-600 font-light leading-relaxed">{autorizacion.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integración Post-M&A */}
      <section id="integracion" className="scroll-mt-24">
        <h2 className="text-4xl font-light text-gray-900 mb-12">Integración Post-M&A</h2>
        <div className="space-y-12">
          <div className="bg-yellow-50/30 p-12 rounded-2xl border-l-4 border-yellow-200">
            <p className="text-gray-700 text-lg font-light leading-relaxed">
              La integración post-adquisición es crítica para el éxito de la transacción. 
              Estudios indican que 70-90% del valor se crea o destruye en esta fase.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-50/30 p-10 rounded-2xl">
              <h3 className="text-xl font-medium text-gray-900 mb-8">Primeros 100 Días</h3>
              <ul className="space-y-4">
                {[
                  "Comunicación a stakeholders clave",
                  "Retención de talento crítico", 
                  "Quick wins identificación",
                  "Plan de integración detallado",
                  "Establecimiento de PMO"
                ].map((item, index) => (
                  <li key={index} className="text-gray-600 flex items-center gap-3 font-light">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50/30 p-10 rounded-2xl">
              <h3 className="text-xl font-medium text-gray-900 mb-8">Áreas de Integración</h3>
              <ul className="space-y-4">
                {[
                  "Sistemas IT y datos",
                  "Procesos operativos",
                  "Cultura organizacional", 
                  "Estructura reportes financieros",
                  "Políticas y compliance"
                ].map((item, index) => (
                  <li key={index} className="text-gray-600 flex items-center gap-3 font-light">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50/30 p-12 rounded-2xl">
            <h3 className="text-xl font-medium text-gray-900 mb-10">KPIs de Integración</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { valor: "95%", descripcion: "Retención talento clave" },
                { valor: "85%", descripcion: "Integración sistemas IT" },
                { valor: "100%", descripcion: "Compliance políticas" },
                { valor: "18 meses", descripcion: "Integración completa" }
              ].map((kpi, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">{kpi.valor}</div>
                  <div className="text-gray-500 font-light">{kpi.descripcion}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentacionMAContent;

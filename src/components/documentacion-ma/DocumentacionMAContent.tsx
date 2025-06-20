
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
    <div className="space-y-16">
      {/* Introducción */}
      <section id="introduccion">
        <h2 className="text-3xl font-light text-black mb-8">Introducción a M&A</h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Las fusiones y adquisiciones (M&A) son transacciones corporativas donde la propiedad, 
            activos o unidades operativas de las empresas se transfieren o consolidan con otras entidades.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-medium text-black mb-3">Fusión</h4>
              <p className="text-gray-600">
                Combinación de dos o más empresas en una sola entidad legal.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-medium text-black mb-3">Adquisición</h4>
              <p className="text-gray-600">
                Una empresa compra otra empresa o una parte significativa de sus activos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tipos de Operaciones */}
      <section id="tipos-operaciones">
        <h2 className="text-3xl font-light text-black mb-8">Tipos de Operaciones M&A</h2>
        <div className="space-y-8">
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-xl font-medium text-black mb-4 flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-600" />
              Integración Horizontal
            </h3>
            <p className="text-gray-600 mb-6">
              Fusión entre empresas que operan en la misma industria y etapa de la cadena de valor.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Eliminación de competencia', 'Economías de escala', 'Mayor cuota de mercado', 'Reducción de costes'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-xl font-medium text-black mb-4 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Integración Vertical
            </h3>
            <p className="text-gray-600 mb-6">
              Adquisición de empresas en diferentes etapas de la cadena de suministro.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Control cadena suministro', 'Reducción costes transacción', 'Mayor control calidad', 'Eliminación intermediarios'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-xl font-medium text-black mb-4 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-purple-600" />
              Fusión de Conglomerado
            </h3>
            <p className="text-gray-600 mb-6">
              Combinación de empresas en industrias no relacionadas.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Diversificación riesgos', 'Sinergias financieras', 'Nuevos mercados', 'Optimización fiscal'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proceso de M&A */}
      <section id="proceso-ma">
        <h2 className="text-3xl font-light text-black mb-8">Proceso de M&A</h2>
        <div className="space-y-6">
          {processSteps.map((fase, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center font-medium text-sm flex-shrink-0">
                  {fase.numero}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-black mb-2">{fase.fase}</h3>
                  <p className="text-gray-600 mb-3">{fase.descripcion}</p>
                  <span className="inline-flex items-center px-3 py-1 bg-white text-gray-600 rounded-full text-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {fase.duracion}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Valoración */}
      <section id="valoracion">
        <h2 className="text-3xl font-light text-black mb-8">Métodos de Valoración</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {valuationMethods.map((metodo, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                <Calculator className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-medium text-black mb-3">{metodo.metodo}</h3>
              <p className="text-gray-600 mb-4 text-sm">{metodo.descripcion}</p>
              <ul className="space-y-1">
                {metodo.caracteristicas.map((item, i) => (
                  <li key={i} className="text-gray-500 flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Due Diligence */}
      <section id="due-diligence">
        <h2 className="text-3xl font-light text-black mb-8">Due Diligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dueDiligenceTypes.map((dd, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <dd.icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="font-medium text-black">{dd.tipo}</h3>
              </div>
              <ul className="space-y-2">
                {dd.areas.map((area, i) => (
                  <li key={i} className="text-gray-600 flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Financiación */}
      <section id="financiacion">
        <h2 className="text-3xl font-light text-black mb-8">Estructuras de Financiación</h2>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { tipo: "Cash", descripcion: "Pago en efectivo al cierre de la transacción" },
              { tipo: "Stock", descripcion: "Intercambio de acciones entre comprador y vendedor" },
              { tipo: "Earn-out", descripcion: "Pagos contingentes basados en performance futura" }
            ].map((estructura, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg text-center">
                <h4 className="font-medium text-black mb-2">{estructura.tipo}</h4>
                <p className="text-gray-600 text-sm">{estructura.descripcion}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-xl font-medium text-black mb-6">Estructura Típica de Financiación LBO</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium text-black">Equity (20-40%)</span>
                <span className="text-gray-600 text-sm">Aportación del sponsor/management</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="font-medium text-black">Senior Debt (40-60%)</span>
                <span className="text-gray-600 text-sm">Deuda bancaria senior</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <span className="font-medium text-black">Mezzanine (10-20%)</span>
                <span className="text-gray-600 text-sm">Deuda subordinada + warrants</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aspectos Legales */}
      <section id="aspectos-legales">
        <h2 className="text-3xl font-light text-black mb-8">Aspectos Legales y Regulatorios</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-medium text-black mb-6">Documentación Clave</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { doc: "LOI/MOU", descripcion: "Letter of Intent - Términos principales no vinculantes" },
                { doc: "SPA", descripcion: "Share Purchase Agreement - Contrato definitivo" },
                { doc: "Disclosure Letter", descripcion: "Excepciones a las garantías del vendedor" },
                { doc: "Escrow Agreement", descripcion: "Retención de parte del precio para garantías" }
              ].map((documento, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-black mb-2">{documento.doc}</h4>
                  <p className="text-gray-600 text-sm">{documento.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-medium text-black mb-6">Autorizaciones Regulatorias</h3>
            <div className="space-y-4">
              {[
                { tipo: "Competencia", descripcion: "CNMC en España, notificación si supera umbrales" },
                { tipo: "Sectorial", descripcion: "Autorizaciones específicas (banca, seguros, telecoms, etc.)" },
                { tipo: "IED", descripcion: "Inversión extranjera directa si aplica" },
                { tipo: "Works Council", descripcion: "Consulta a representantes de trabajadores" }
              ].map((autorizacion, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-black">{autorizacion.tipo}</h4>
                    <p className="text-gray-600 text-sm">{autorizacion.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integración Post-M&A */}
      <section id="integracion">
        <h2 className="text-3xl font-light text-black mb-8">Integración Post-M&A</h2>
        <div className="space-y-8">
          <div className="bg-yellow-50 p-6 rounded-lg">
            <p className="text-gray-700">
              La integración post-adquisición es crítica para el éxito de la transacción. 
              Estudios indican que 70-90% del valor se crea o destruye en esta fase.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium text-black mb-4">Primeros 100 Días</h3>
              <ul className="space-y-2">
                {[
                  "Comunicación a stakeholders clave",
                  "Retención de talento crítico", 
                  "Quick wins identificación",
                  "Plan de integración detallado",
                  "Establecimiento de PMO"
                ].map((item, index) => (
                  <li key={index} className="text-gray-600 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium text-black mb-4">Áreas de Integración</h3>
              <ul className="space-y-2">
                {[
                  "Sistemas IT y datos",
                  "Procesos operativos",
                  "Cultura organizacional", 
                  "Estructura reportes financieros",
                  "Políticas y compliance"
                ].map((item, index) => (
                  <li key={index} className="text-gray-600 flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="font-medium text-black mb-6">KPIs de Integración</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { valor: "95%", descripcion: "Retención talento clave" },
                { valor: "85%", descripcion: "Integración sistemas IT" },
                { valor: "100%", descripcion: "Compliance políticas" },
                { valor: "18 meses", descripcion: "Integración completa" }
              ].map((kpi, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-black mb-1">{kpi.valor}</div>
                  <div className="text-gray-500 text-sm">{kpi.descripcion}</div>
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

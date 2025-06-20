
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Calculator, 
  FileText, 
  Users, 
  TrendingUp, 
  Scale,
  Clock,
  Target,
  DollarSign,
  Shield,
  ArrowRight,
  BookOpen,
  CheckCircle
} from 'lucide-react';

const DocumentacionMA = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold text-black mb-6 leading-tight">
              Documentación de M&A
            </h1>
            <p className="text-xl text-gray-500 mb-8 leading-relaxed">
              Guía completa sobre fusiones y adquisiciones. Todo lo que necesitas saber 
              sobre procesos, valoraciones, due diligence y mejores prácticas en M&A.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <BookOpen className="w-4 h-4" />
              <span>Tiempo de lectura: 25 minutos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Start Here Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Empieza aquí</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Explora los conceptos fundamentales de M&A organizados por área de conocimiento
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Introducción a M&A</h3>
                <p className="text-gray-500 mb-4">
                  Conceptos básicos, tipos de operaciones y marco estratégico
                </p>
                <div className="flex items-center justify-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                  <span>Leer más</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-100 transition-colors">
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Valoración</h3>
                <p className="text-gray-500 mb-4">
                  Métodos DCF, múltiplos comparables y transacciones precedentes
                </p>
                <div className="flex items-center justify-center text-green-600 font-medium group-hover:gap-2 transition-all">
                  <span>Leer más</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-100 transition-colors">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Due Diligence</h3>
                <p className="text-gray-500 mb-4">
                  Análisis financiero, comercial, legal y operacional
                </p>
                <div className="flex items-center justify-center text-purple-600 font-medium group-hover:gap-2 transition-all">
                  <span>Leer más</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-100 transition-colors">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Proceso M&A</h3>
                <p className="text-gray-500 mb-4">
                  Fases del proceso desde planificación hasta cierre
                </p>
                <div className="flex items-center justify-center text-orange-600 font-medium group-hover:gap-2 transition-all">
                  <span>Leer más</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-100 transition-colors">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Aspectos Legales</h3>
                <p className="text-gray-500 mb-4">
                  Documentación, autorizaciones y compliance regulatorio
                </p>
                <div className="flex items-center justify-center text-red-600 font-medium group-hover:gap-2 transition-all">
                  <span>Leer más</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-100 transition-colors">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Integración</h3>
                <p className="text-gray-500 mb-4">
                  Post-M&A, retención de talento y captura de sinergias
                </p>
                <div className="flex items-center justify-center text-teal-600 font-medium group-hover:gap-2 transition-all">
                  <span>Leer más</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-black mb-6">Contenidos</h3>
                  <nav className="space-y-3">
                    {[
                      { label: 'Introducción a M&A', href: '#introduccion' },
                      { label: 'Tipos de Operaciones', href: '#tipos-operaciones' },
                      { label: 'Proceso de M&A', href: '#proceso-ma' },
                      { label: 'Métodos de Valoración', href: '#valoracion' },
                      { label: 'Due Diligence', href: '#due-diligence' },
                      { label: 'Estructuras de Financiación', href: '#financiacion' },
                      { label: 'Aspectos Legales', href: '#aspectos-legales' },
                      { label: 'Integración Post-M&A', href: '#integracion' }
                    ].map((item, index) => (
                      <a 
                        key={index}
                        href={item.href} 
                        className="block text-gray-600 hover:text-black transition-colors py-2 text-sm"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-16">
              
              {/* Introducción */}
              <section id="introduccion" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-black mb-8">Introducción a M&A</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Las fusiones y adquisiciones (M&A) son transacciones corporativas donde la propiedad, 
                    activos o unidades operativas de las empresas se transfieren o consolidan con otras entidades.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-black mb-3">Fusión</h4>
                      <p className="text-gray-600 text-sm">
                        Combinación de dos o más empresas en una sola entidad legal.
                      </p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-black mb-3">Adquisición</h4>
                      <p className="text-gray-600 text-sm">
                        Una empresa compra otra empresa o una parte significativa de sus activos.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tipos de Operaciones */}
              <section id="tipos-operaciones" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-black mb-8">Tipos de Operaciones M&A</h2>
                <div className="space-y-8">
                  <div className="bg-white border border-gray-100 rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-black mb-4 flex items-center gap-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      Integración Horizontal
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Fusión entre empresas que operan en la misma industria y etapa de la cadena de valor.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Eliminación de competencia', 'Economías de escala', 'Mayor cuota de mercado', 'Reducción de costes'].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-black mb-4 flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Integración Vertical
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Adquisición de empresas en diferentes etapas de la cadena de suministro.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Control cadena suministro', 'Reducción costes transacción', 'Mayor control calidad', 'Eliminación intermediarios'].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-black mb-4 flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      Fusión de Conglomerado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Combinación de empresas en industrias no relacionadas.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Diversificación riesgos', 'Sinergias financieras', 'Nuevos mercados', 'Optimización fiscal'].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Proceso de M&A */}
              <section id="proceso-ma" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-black mb-8">Proceso de M&A</h2>
                <div className="space-y-6">
                  {[
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
                  ].map((fase, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-6">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {fase.numero}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-black mb-2">{fase.fase}</h3>
                          <p className="text-gray-600 mb-2">{fase.descripcion}</p>
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
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
              <section id="valoracion" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-black mb-8">Métodos de Valoración</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
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
                  ].map((metodo, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-6">
                      <div className={`w-12 h-12 bg-${metodo.color}-50 rounded-lg flex items-center justify-center mb-4`}>
                        <Calculator className={`w-6 h-6 text-${metodo.color}-600`} />
                      </div>
                      <h3 className="font-semibold text-black mb-3">{metodo.metodo}</h3>
                      <p className="text-gray-600 text-sm mb-4">{metodo.descripcion}</p>
                      <ul className="space-y-1">
                        {metodo.caracteristicas.map((item, i) => (
                          <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
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
                <h2 className="text-3xl font-bold text-black mb-8">Due Diligence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
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
                  ].map((dd, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 bg-${dd.color}-50 rounded-lg flex items-center justify-center`}>
                          <dd.icon className={`w-5 h-5 text-${dd.color}-600`} />
                        </div>
                        <h3 className="font-semibold text-black">{dd.tipo}</h3>
                      </div>
                      <ul className="space-y-2">
                        {dd.areas.map((area, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
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
              <section id="financiacion" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-black mb-8">Estructuras de Financiación</h2>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { tipo: "Cash", descripcion: "Pago en efectivo al cierre de la transacción", color: "green" },
                      { tipo: "Stock", descripcion: "Intercambio de acciones entre comprador y vendedor", color: "blue" },
                      { tipo: "Earn-out", descripcion: "Pagos contingentes basados en performance futura", color: "purple" }
                    ].map((estructura, index) => (
                      <div key={index} className={`bg-${estructura.color}-50 border border-${estructura.color}-100 rounded-lg p-6 text-center`}>
                        <h4 className="font-semibold text-black mb-2">{estructura.tipo}</h4>
                        <p className="text-sm text-gray-600">{estructura.descripcion}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white border border-gray-100 rounded-lg p-8">
                    <h3 className="text-xl font-semibold text-black mb-6">Estructura Típica de Financiación LBO</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <span className="font-medium text-black">Equity (20-40%)</span>
                        <span className="text-sm text-gray-600">Aportación del sponsor/management</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <span className="font-medium text-black">Senior Debt (40-60%)</span>
                        <span className="text-sm text-gray-600">Deuda bancaria senior</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                        <span className="font-medium text-black">Mezzanine (10-20%)</span>
                        <span className="text-sm text-gray-600">Deuda subordinada + warrants</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Aspectos Legales */}
              <section id="aspectos-legales" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-black mb-8">Aspectos Legales y Regulatorios</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-6">Documentación Clave</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { doc: "LOI/MOU", descripcion: "Letter of Intent - Términos principales no vinculantes" },
                        { doc: "SPA", descripcion: "Share Purchase Agreement - Contrato definitivo" },
                        { doc: "Disclosure Letter", descripcion: "Excepciones a las garantías del vendedor" },
                        { doc: "Escrow Agreement", descripcion: "Retención de parte del precio para garantías" }
                      ].map((documento, index) => (
                        <div key={index} className="bg-white border border-gray-100 rounded-lg p-4">
                          <h4 className="font-medium text-black mb-1">{documento.doc}</h4>
                          <p className="text-sm text-gray-600">{documento.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-6">Autorizaciones Regulatorias</h3>
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
                            <p className="text-sm text-gray-600">{autorizacion.descripcion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Integración Post-M&A */}
              <section id="integracion" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-black mb-8">Integración Post-M&A</h2>
                <div className="space-y-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <p className="text-gray-700 text-lg">
                      La integración post-adquisición es crítica para el éxito de la transacción. 
                      Estudios indican que 70-90% del valor se crea o destruye en esta fase.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-black mb-4">Primeros 100 Días</h3>
                      <ul className="space-y-2">
                        {[
                          "Comunicación a stakeholders clave",
                          "Retención de talento crítico", 
                          "Quick wins identificación",
                          "Plan de integración detallado",
                          "Establecimiento de PMO"
                        ].map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-white border border-gray-100 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-black mb-4">Áreas de Integración</h3>
                      <ul className="space-y-2">
                        {[
                          "Sistemas IT y datos",
                          "Procesos operativos",
                          "Cultura organizacional", 
                          "Estructura reportes financieros",
                          "Políticas y compliance"
                        ].map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-100 rounded-lg p-8">
                    <h3 className="text-lg font-semibold text-black mb-6">KPIs de Integración</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { valor: "95%", descripcion: "Retención talento clave" },
                        { valor: "85%", descripcion: "Integración sistemas IT" },
                        { valor: "100%", descripcion: "Compliance políticas" },
                        { valor: "18 meses", descripcion: "Integración completa" }
                      ].map((kpi, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-black mb-1">{kpi.valor}</div>
                          <div className="text-xs text-gray-500">{kpi.descripcion}</div>
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

      {/* Popular Articles Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Artículos Populares</h2>
            <p className="text-lg text-gray-500">
              Otros recursos que pueden interesarte
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Calculadora de Valoración",
                description: "Herramienta interactiva para valorar tu empresa",
                link: "/calculadora-valoracion",
                icon: Calculator
              },
              {
                title: "Casos de Éxito",
                description: "Ejemplos reales de transacciones exitosas",
                link: "/casos-exito", 
                icon: TrendingUp
              },
              {
                title: "Venta de Empresas",
                description: "Guía completa para vender tu empresa",
                link: "/venta-empresas",
                icon: Building2
              }
            ].map((articulo, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                    <articulo.icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">{articulo.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{articulo.description}</p>
                  <a 
                    href={articulo.link}
                    className="text-black font-medium hover:underline flex items-center gap-1 group"
                  >
                    <span>Leer más</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DocumentacionMA;

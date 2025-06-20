
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Shield
} from 'lucide-react';

const DocumentacionMA = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-black mb-6">
              Documentación de M&A
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Guía completa sobre fusiones y adquisiciones. Todo lo que necesitas saber 
              sobre procesos, valoraciones, due diligence y mejores prácticas en M&A.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-black">Contenidos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <a href="#introduccion" className="block text-sm text-gray-600 hover:text-black transition-colors py-1">
                      Introducción a M&A
                    </a>
                    <a href="#tipos-operaciones" className="block text-sm text-gray-600 hover:text-black transition-colors py-1">
                      Tipos de Operaciones
                    </a>
                    <a href="#proceso-ma" className="block text-sm text-gray-600 hover:text-black transition-colors py-1">
                      Proceso de M&A
                    </a>
                    <a href="#valoracion" className="block text-sm text-gray-600 hover:text-black transition-colors py-1">
                      Métodos de Valoración
                    </a>
                    <a href="#due-diligence" className="block text-sm text-gray-600 hover:text-black transition-colors py-1">
                      Due Diligence
                    </a>
                    <a href="#financiacion" className="block text-sm text-gray-600 hover:text-black transition-colors py-1">
                      Estructuras de Financiación
                    </a>
                    <a href="#aspectos-legales" className="block text-sm text-gray-600 hover:text-black transition-colors py-1">
                      Aspectos Legales
                    </a>
                    <a href="#integracion" className="block text-sm text-gray-600 hover:text-black transition-colors py-1">
                      Integración Post-M&A
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
              
              {/* Introducción */}
              <section id="introduccion">
                <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-black">
                      <Building2 className="w-6 h-6" />
                      Introducción a M&A
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Las fusiones y adquisiciones (M&A) son transacciones corporativas donde la propiedad, 
                      activos o unidades operativas de las empresas se transfieren o consolidan con otras entidades.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-gray-50 rounded-lg border-0.5 border-gray-300">
                        <h4 className="font-bold text-black mb-2">Fusión</h4>
                        <p className="text-sm text-gray-600">
                          Combinación de dos o más empresas en una sola entidad legal.
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border-0.5 border-gray-300">
                        <h4 className="font-bold text-black mb-2">Adquisición</h4>
                        <p className="text-sm text-gray-600">
                          Una empresa compra otra empresa o una parte significativa de sus activos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Tipos de Operaciones */}
              <section id="tipos-operaciones">
                <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-black">
                      <Target className="w-6 h-6" />
                      Tipos de Operaciones M&A
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="horizontal" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="horizontal">Horizontal</TabsTrigger>
                        <TabsTrigger value="vertical">Vertical</TabsTrigger>
                        <TabsTrigger value="conglomerate">Conglomerado</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="horizontal" className="space-y-4">
                        <h4 className="font-bold text-black">Integración Horizontal</h4>
                        <p className="text-gray-600">
                          Fusión entre empresas que operan en la misma industria y etapa de la cadena de valor.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                          <li>Eliminación de competencia directa</li>
                          <li>Economías de escala</li>
                          <li>Mayor cuota de mercado</li>
                          <li>Reducción de costes duplicados</li>
                        </ul>
                      </TabsContent>
                      
                      <TabsContent value="vertical" className="space-y-4">
                        <h4 className="font-bold text-black">Integración Vertical</h4>
                        <p className="text-gray-600">
                          Adquisición de empresas en diferentes etapas de la cadena de suministro.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                          <li>Control de la cadena de suministro</li>
                          <li>Reducción de costes de transacción</li>
                          <li>Mayor control de calidad</li>
                          <li>Eliminación de intermediarios</li>
                        </ul>
                      </TabsContent>
                      
                      <TabsContent value="conglomerate" className="space-y-4">
                        <h4 className="font-bold text-black">Fusión de Conglomerado</h4>
                        <p className="text-gray-600">
                          Combinación de empresas en industrias no relacionadas.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                          <li>Diversificación de riesgos</li>
                          <li>Aprovechamiento de sinergias financieras</li>
                          <li>Acceso a nuevos mercados</li>
                          <li>Optimización fiscal</li>
                        </ul>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </section>

              {/* Proceso de M&A */}
              <section id="proceso-ma">
                <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-black">
                      <Clock className="w-6 h-6" />
                      Proceso de M&A
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {[
                        {
                          fase: "1. Estrategia y Planificación",
                          descripcion: "Definición de objetivos estratégicos y criterios de búsqueda",
                          duracion: "2-4 semanas",
                          actividades: ["Análisis estratégico", "Definición de criterios", "Mandato de asesor"]
                        },
                        {
                          fase: "2. Identificación y Screening",
                          descripcion: "Búsqueda y evaluación preliminar de targets",
                          duracion: "4-8 semanas",
                          actividades: ["Identificación de targets", "Análisis preliminar", "Contactos iniciales"]
                        },
                        {
                          fase: "3. Valoración y Ofertas",
                          descripcion: "Análisis detallado y presentación de ofertas",
                          duracion: "6-10 semanas",
                          actividades: ["Due diligence inicial", "Valoración", "Negociación LOI"]
                        },
                        {
                          fase: "4. Due Diligence",
                          descripcion: "Análisis exhaustivo de la empresa objetivo",
                          duracion: "8-12 semanas",
                          actividades: ["DD financiera", "DD comercial", "DD legal", "DD fiscal"]
                        },
                        {
                          fase: "5. Negociación y Cierre",
                          descripcion: "Negociación final y firma de documentos",
                          duracion: "4-8 semanas",
                          actividades: ["Negociación SPA", "Obtención de autorizaciones", "Cierre"]
                        }
                      ].map((fase, index) => (
                        <div key={index} className="border-l-2 border-black pl-6 pb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-black mb-2">{fase.fase}</h4>
                              <p className="text-gray-600 mb-2">{fase.descripcion}</p>
                              <p className="text-sm text-gray-500 mb-2">Duración típica: {fase.duracion}</p>
                              <div className="flex flex-wrap gap-2">
                                {fase.actividades.map((actividad, i) => (
                                  <span key={i} className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                                    {actividad}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Valoración */}
              <section id="valoracion">
                <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-black">
                      <Calculator className="w-6 h-6" />
                      Métodos de Valoración
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 border-0.5 border-gray-300 rounded-lg">
                        <h4 className="font-bold text-black mb-3">DCF (Flujos Descontados)</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Valoración basada en proyección de flujos de caja futuros descontados.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Proyección 5-10 años</li>
                          <li>• Valor terminal</li>
                          <li>• WACC como tasa descuento</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border-0.5 border-gray-300 rounded-lg">
                        <h4 className="font-bold text-black mb-3">Múltiplos Comparables</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Valoración relativa basada en múltiplos de empresas similares.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• EV/EBITDA</li>
                          <li>• P/E ratio</li>
                          <li>• P/B ratio</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border-0.5 border-gray-300 rounded-lg">
                        <h4 className="font-bold text-black mb-3">Transacciones Precedentes</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Valoración basada en transacciones M&A recientes del sector.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Prima de control</li>
                          <li>• Múltiplos de transacción</li>
                          <li>• Ajustes por tamaño</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Due Diligence */}
              <section id="due-diligence">
                <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-black">
                      <FileText className="w-6 h-6" />
                      Due Diligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
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
                      ].map((dd, index) => (
                        <div key={index} className="p-4 border-0.5 border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-3">
                            <dd.icon className="w-5 h-5 text-black" />
                            <h4 className="font-bold text-black">{dd.tipo}</h4>
                          </div>
                          <ul className="space-y-1">
                            {dd.areas.map((area, i) => (
                              <li key={i} className="text-xs text-gray-600">• {area}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Financiación */}
              <section id="financiacion">
                <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-black">
                      <DollarSign className="w-6 h-6" />
                      Estructuras de Financiación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg border-0.5 border-gray-300">
                          <h4 className="font-bold text-black mb-2">Cash</h4>
                          <p className="text-sm text-gray-600">Pago en efectivo al cierre de la transacción</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg border-0.5 border-gray-300">
                          <h4 className="font-bold text-black mb-2">Stock</h4>
                          <p className="text-sm text-gray-600">Intercambio de acciones entre comprador y vendedor</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg border-0.5 border-gray-300">
                          <h4 className="font-bold text-black mb-2">Earn-out</h4>
                          <p className="text-sm text-gray-600">Pagos contingentes basados en performance futura</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <h4 className="font-bold text-black mb-4">Estructura Típica de Financiación LBO</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded border-0.5 border-blue-300">
                            <span className="text-sm font-medium">Equity (20-40%)</span>
                            <span className="text-sm text-gray-600">Aportación del sponsor/management</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded border-0.5 border-green-300">
                            <span className="text-sm font-medium">Senior Debt (40-60%)</span>
                            <span className="text-sm text-gray-600">Deuda bancaria senior</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border-0.5 border-yellow-300">
                            <span className="text-sm font-medium">Mezzanine (10-20%)</span>
                            <span className="text-sm text-gray-600">Deuda subordinada + warrants</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Aspectos Legales */}
              <section id="aspectos-legales">
                <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-black">
                      <Shield className="w-6 h-6" />
                      Aspectos Legales y Regulatorios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-black mb-3">Documentación Clave</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 border-0.5 border-gray-300 rounded">
                            <h5 className="font-medium text-black">LOI/MOU</h5>
                            <p className="text-xs text-gray-600">Letter of Intent - Términos principales no vinculantes</p>
                          </div>
                          <div className="p-3 border-0.5 border-gray-300 rounded">
                            <h5 className="font-medium text-black">SPA</h5>
                            <p className="text-xs text-gray-600">Share Purchase Agreement - Contrato definitivo</p>
                          </div>
                          <div className="p-3 border-0.5 border-gray-300 rounded">
                            <h5 className="font-medium text-black">Disclosure Letter</h5>
                            <p className="text-xs text-gray-600">Excepciones a las garantías del vendedor</p>
                          </div>
                          <div className="p-3 border-0.5 border-gray-300 rounded">
                            <h5 className="font-medium text-black">Escrow Agreement</h5>
                            <p className="text-xs text-gray-600">Retención de parte del precio para garantías</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-black mb-3">Autorizaciones Regulatorias</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Competencia:</strong> CNMC en España, notificación si supera umbrales</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Sectorial:</strong> Autorizaciones específicas (banca, seguros, telecoms, etc.)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>IED:</strong> Inversión extranjera directa si aplica</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                            <span><strong>Works Council:</strong> Consulta a representantes de trabajadores</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Integración Post-M&A */}
              <section id="integracion">
                <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-bold text-black">
                      <Users className="w-6 h-6" />
                      Integración Post-M&A
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-gray-600">
                        La integración post-adquisición es crítica para el éxito de la transacción. 
                        Estudios indican que 70-90% del valor se crea o destruye en esta fase.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-black mb-3">Primeros 100 Días</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Comunicación a stakeholders clave</li>
                            <li>• Retención de talento crítico</li>
                            <li>• Quick wins identificación</li>
                            <li>• Plan de integración detallado</li>
                            <li>• Establecimiento de PMO</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-black mb-3">Áreas de Integración</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Sistemas IT y datos</li>
                            <li>• Procesos operativos</li>
                            <li>• Cultura organizacional</li>
                            <li>• Estructura reportes financieros</li>
                            <li>• Políticas y compliance</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-0.5 border-blue-300">
                        <h4 className="font-bold text-black mb-2">KPIs de Integración</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-black">95%</div>
                            <div className="text-xs text-gray-600">Retención talento clave</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-black">85%</div>
                            <div className="text-xs text-gray-600">Integración sistemas IT</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-black">100%</div>
                            <div className="text-xs text-gray-600">Compliance políticas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-black">18 meses</div>
                            <div className="text-xs text-gray-600">Integración completa</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DocumentacionMA;

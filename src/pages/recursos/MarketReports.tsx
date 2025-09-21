import React, { useState } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { useMarketReports } from '@/hooks/useMarketReports';
import { useSectorCalculators, useSubmitCalculatorResult } from '@/hooks/useSectorCalculators';
import { SectorCalculatorForm } from '@/components/sector-calculators/SectorCalculatorForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Download, FileText, Users, TrendingUp, Star, Calendar, Calculator, ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';

const MarketReports = () => {
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [currentView, setCurrentView] = useState<'overview' | 'reports' | 'calculators'>('overview');
  
  const { data: marketReports, isLoading: reportsLoading } = useMarketReports();
  const { data: calculators, isLoading: calculatorsLoading } = useSectorCalculators();
  const submitCalculatorResult = useSubmitCalculatorResult();

  const handleCalculate = (calculator: any) => {
    setSelectedCalculator(calculator);
    setCurrentView('calculators');
  };

  const handleBack = () => {
    if (selectedCalculator) {
      setSelectedCalculator(null);
    } else {
      setCurrentView('overview');
    }
  };

  const handleDownload = (report: any) => {
    if (report.file_url) {
      window.open(report.file_url, '_blank');
    }
  };

  if (selectedCalculator) {
    return (
      <UnifiedLayout variant="home">
        <div className="pt-16">
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Button 
                onClick={handleBack}
                variant="ghost" 
                className="mb-6 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a calculadoras</span>
              </Button>
              
              <SectorCalculatorForm 
                calculator={selectedCalculator} 
                onBack={handleBack}
              />
            </div>
          </section>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout variant="home">
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-left">
                <Badge className="mb-6 text-sm font-medium bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Recursos Exclusivos
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  Informes de Mercado
                  <br />
                  <span className="text-slate-600">y Calculadoras Sectoriales</span>
                </h1>
                
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                  Accede a nuestros análisis exclusivos del mercado M&A, tendencias sectoriales 
                  y herramientas especializadas de valoración por sector.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <InteractiveHoverButton
                    variant="primary"
                    text="Explorar Informes"
                    className="px-8 py-3"
                    onClick={() => setCurrentView('reports')}
                  />
                  <InteractiveHoverButton
                    variant="outline"
                    text="Ver Calculadoras"
                    className="px-8 py-3"
                    onClick={() => setCurrentView('calculators')}
                  />
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{marketReports?.length || 0}</div>
                    <div className="text-sm text-slate-600">Informes Disponibles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">12+</div>
                    <div className="text-sm text-slate-600">Sectores Cubiertos</div>
                  </div>
                  <div className="md:col-span-1 col-span-2">
                    <div className="text-2xl font-bold text-slate-900 mb-1">24h</div>
                    <div className="text-sm text-slate-600">Actualización</div>
                  </div>
                </div>
              </div>

              {/* Right Visual */}
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        En Vivo
                      </Badge>
                      <div className="text-sm text-slate-600">Última actualización: Hoy</div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <h3 className="font-semibold text-slate-900 mb-3">Sectores Más Activos</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">Tecnología</span>
                          <div className="flex items-center">
                            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                            <span className="text-sm font-medium text-green-600">+12%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">Salud</span>
                          <div className="flex items-center">
                            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                            <span className="text-sm font-medium text-green-600">+8%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">Energía</span>
                          <div className="flex items-center">
                            <TrendingUp className="w-3 h-3 text-blue-500 mr-1" />
                            <span className="text-sm font-medium text-blue-600">+5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="py-12 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)} className="w-full">
              <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 h-12 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                <TabsTrigger 
                  value="overview"
                  className="text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-md transition-all"
                >
                  Vista General
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className="text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-md transition-all"
                >
                  Informes
                </TabsTrigger>
                <TabsTrigger 
                  value="calculators"
                  className="text-sm font-medium data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-md transition-all"
                >
                  Calculadoras
                </TabsTrigger>
              </TabsList>

              {/* Overview Content */}
              <TabsContent value="overview" className="mt-12">
                <div className="space-y-16">
                  {/* Market Reports Preview - FIRST PRIORITY */}
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Informes de Mercado</h2>
                        <p className="text-lg text-slate-600">Análisis profundo del mercado M&A por sectores</p>
                      </div>
                      <InteractiveHoverButton
                        variant="outline"
                        text="Ver todos los informes"
                        className="flex items-center space-x-2"
                        onClick={() => setCurrentView('reports')}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {reportsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="animate-pulse border border-slate-200 rounded-lg">
                            <CardHeader>
                              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="h-3 bg-slate-200 rounded"></div>
                                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : marketReports?.length === 0 ? (
                        <div className="col-span-full text-center py-16">
                          <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay informes disponibles</h3>
                          <p className="text-slate-600">Los informes de mercado estarán disponibles próximamente.</p>
                        </div>
                      ) : (
                        marketReports?.slice(0, 3).map((report) => (
                          <Card key={report.id} className="bg-white border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer rounded-lg">
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between mb-3">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                  {report.category}
                                </Badge>
                                <div className="flex items-center text-xs text-slate-500">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(report.last_updated).toLocaleDateString('es-ES')}
                                </div>
                              </div>
                              <CardTitle className="text-lg font-bold text-slate-900 leading-tight group-hover:text-slate-700 transition-colors">
                                {report.title}
                              </CardTitle>
                              <CardDescription className="text-sm text-slate-600">
                                {report.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <span className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    {report.pages} páginas
                                  </span>
                                  <span className="flex items-center">
                                    <Download className="w-3 h-3 mr-1" />
                                    {report.download_count || 0}
                                  </span>
                                </div>
                              </div>
                              <InteractiveHoverButton
                                variant="primary"
                                text="Descargar Informe"
                                size="sm"
                                className="w-full"
                                onClick={() => handleDownload(report)}
                                disabled={!report.file_url}
                              />
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Calculators Preview - SECOND */}
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Calculadoras Sectoriales</h2>
                        <p className="text-lg text-slate-600">Herramientas especializadas para valoración por sector</p>
                      </div>
                      <InteractiveHoverButton
                        variant="outline"
                        text="Ver todas las calculadoras"
                        className="flex items-center space-x-2"
                        onClick={() => setCurrentView('calculators')}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {calculatorsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="animate-pulse border border-slate-200 rounded-lg">
                            <CardHeader>
                              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </CardHeader>
                          </Card>
                        ))
                      ) : calculators?.length === 0 ? (
                        <div className="col-span-full text-center py-16">
                          <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Calculator className="w-8 h-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay calculadoras disponibles</h3>
                          <p className="text-slate-600">Las calculadoras sectoriales estarán disponibles próximamente.</p>
                        </div>
                      ) : (
                        calculators?.slice(0, 3).map((calculator) => (
                          <Card key={calculator.id} className="bg-white border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer rounded-lg">
                            <CardHeader>
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="outline" className="border-slate-300 text-slate-700">{calculator.sector}</Badge>
                              </div>
                              <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{calculator.name}</CardTitle>
                              <CardDescription className="text-sm text-slate-600">{calculator.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <InteractiveHoverButton
                                variant="primary"
                                text="Usar Calculadora"
                                className="w-full"
                                onClick={() => handleCalculate(calculator)}
                              />
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Market Reports Full View - PRIORITIZED */}
              <TabsContent value="reports" className="mt-12">
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Informes de Mercado</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      Descarga nuestros análisis exclusivos del mercado M&A con datos actualizados,
                      tendencias sectoriales e insights para optimizar tus decisiones estratégicas.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportsLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse border border-slate-200 rounded-lg">
                          <CardHeader>
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="h-3 bg-slate-200 rounded"></div>
                              <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : marketReports?.length === 0 ? (
                      <div className="col-span-full text-center py-16">
                        <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay informes disponibles</h3>
                        <p className="text-slate-600">Los informes de mercado estarán disponibles próximamente.</p>
                      </div>
                    ) : (
                      marketReports?.map((report) => (
                        <Card key={report.id} className="bg-white border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer rounded-lg">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between mb-3">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                {report.category}
                              </Badge>
                              <div className="flex items-center text-xs text-slate-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(report.last_updated).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900 leading-tight group-hover:text-slate-700 transition-colors">
                              {report.title}
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-600">
                              {report.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <span className="flex items-center">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {report.pages} páginas
                                </span>
                                <span className="flex items-center">
                                  <Download className="w-3 h-3 mr-1" />
                                  {report.download_count || 0}
                                </span>
                              </div>
                            </div>
                            <InteractiveHoverButton
                              variant="primary"
                              text="Descargar Informe"
                              size="sm"
                              className="w-full"
                              onClick={() => handleDownload(report)}
                              disabled={!report.file_url}
                            />
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Calculators Full View */}
              <TabsContent value="calculators" className="mt-12">
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Calculadoras Sectoriales</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                      Utiliza nuestras herramientas especializadas para obtener valoraciones 
                      precisas adaptadas a las características específicas de cada sector.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {calculatorsLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader>
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </CardHeader>
                        </Card>
                      ))
                    ) : calculators?.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No hay calculadoras disponibles</h3>
                        <p className="text-slate-600">Las calculadoras sectoriales estarán disponibles próximamente.</p>
                      </div>
                    ) : (
                      calculators?.map((calculator) => (
                        <Card key={calculator.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{calculator.sector}</Badge>
                            </div>
                            <CardTitle className="text-lg">{calculator.name}</CardTitle>
                            <CardDescription>{calculator.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button 
                              onClick={() => handleCalculate(calculator)}
                              className="w-full"
                            >
                              <Calculator className="w-4 h-4 mr-2" />
                              Usar Calculadora
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              ¿Necesitas un análisis personalizado?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Nuestro equipo de expertos puede crear informes específicos 
              para tu sector o empresa
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Users className="w-5 h-5 mr-2" />
              Solicitar Análisis Personalizado
            </Button>
          </div>
        </section>
      </div>
    </UnifiedLayout>
  );
};

export default MarketReports;
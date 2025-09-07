import React, { useState } from 'react';
import HomeLayout from '@/components/shared/HomeLayout';
import { useMarketReports } from '@/hooks/useMarketReports';
import { useSectorCalculators, useSubmitCalculatorResult } from '@/hooks/useSectorCalculators';
import { SectorCalculatorForm } from '@/components/sector-calculators/SectorCalculatorForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Users, TrendingUp, Star, Calendar, Calculator, ArrowLeft, ArrowRight } from 'lucide-react';

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
      <HomeLayout>
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
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Market Intelligence
              </h1>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Accede a nuestros informes exclusivos del mercado M&A y utiliza nuestras calculadoras 
                especializadas por sector para obtener insights precisos y datos actualizados.
              </p>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="overview">Vista General</TabsTrigger>
                <TabsTrigger value="reports">Informes</TabsTrigger>
                <TabsTrigger value="calculators">Calculadoras</TabsTrigger>
              </TabsList>

              {/* Overview Content */}
              <TabsContent value="overview" className="mt-12">
                <div className="space-y-16">
                  {/* Market Reports Preview - FIRST PRIORITY */}
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Informes de Mercado</h2>
                        <p className="text-slate-600">Análisis profundo del mercado M&A por sectores</p>
                      </div>
                      <Button onClick={() => setCurrentView('reports')} className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Ver todos los informes</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {reportsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="animate-pulse">
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
                        <div className="col-span-full text-center py-12">
                          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No hay informes disponibles</h3>
                          <p className="text-slate-600">Los informes de mercado estarán disponibles próximamente.</p>
                        </div>
                      ) : (
                        marketReports?.slice(0, 3).map((report) => (
                          <Card key={report.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <Badge variant="secondary">{report.category}</Badge>
                                <div className="flex items-center text-sm text-slate-500">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(report.last_updated).toLocaleDateString('es-ES')}
                                </div>
                              </div>
                              <CardTitle className="text-lg">{report.title}</CardTitle>
                              <CardDescription className="text-sm">
                                {report.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <span className="flex items-center">
                                    <FileText className="w-4 h-4 mr-1" />
                                    {report.pages} páginas
                                  </span>
                                  <span className="flex items-center">
                                    <Download className="w-4 h-4 mr-1" />
                                    {report.download_count || 0}
                                  </span>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleDownload(report)}
                                  disabled={!report.file_url}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Descargar
                                </Button>
                              </div>
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
                        <p className="text-slate-600">Herramientas especializadas para valoración por sector</p>
                      </div>
                      <Button onClick={() => setCurrentView('calculators')} variant="outline" className="flex items-center space-x-2">
                        <Calculator className="w-4 h-4" />
                        <span>Ver todas las calculadoras</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {calculatorsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
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
                        calculators?.slice(0, 3).map((calculator) => (
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
                </div>
              </TabsContent>

              {/* Market Reports Full View - PRIORITIZED */}
              <TabsContent value="reports" className="mt-12">
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Informes de Mercado</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                      Descarga nuestros análisis exclusivos del mercado M&A con datos actualizados,
                      tendencias sectoriales e insights para optimizar tus decisiones estratégicas.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportsLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
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
                      <div className="col-span-full text-center py-12">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No hay informes disponibles</h3>
                        <p className="text-slate-600">Los informes de mercado estarán disponibles próximamente.</p>
                      </div>
                    ) : (
                      marketReports?.map((report) => (
                        <Card key={report.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <Badge variant="secondary">{report.category}</Badge>
                              <div className="flex items-center text-sm text-slate-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(report.last_updated).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {report.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <span className="flex items-center">
                                  <FileText className="w-4 h-4 mr-1" />
                                  {report.pages} páginas
                                </span>
                                <span className="flex items-center">
                                  <Download className="w-4 h-4 mr-1" />
                                  {report.download_count || 0}
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => handleDownload(report)}
                                disabled={!report.file_url}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Descargar
                              </Button>
                            </div>
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
    </HomeLayout>
  );
};

export default MarketReports;
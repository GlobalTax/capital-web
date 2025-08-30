import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, FileText, Download, TrendingUp, BarChart3, Building2, Stethoscope, ShoppingCart, Cog, ArrowRight, Calculator } from 'lucide-react';
import { useSectorCalculators } from '@/hooks/useSectorCalculators';
import { SectorCalculatorCard } from '@/components/sector-calculators/SectorCalculatorCard';
import { SectorCalculatorForm } from '@/components/sector-calculators/SectorCalculatorForm';

// Market Reports data
const marketReports = [
  {
    id: 1,
    title: "Informe Sector Tecnológico Q4 2024",
    description: "Análisis completo del mercado tecnológico español, incluyendo múltiplos de valoración, tendencias M&A y outlook 2025.",
    pages: 45,
    lastUpdate: "Diciembre 2024",
    category: "Tecnología",
    icon: <BarChart3 className="h-5 w-5" />,
    downloadUrl: "#"
  },
  {
    id: 2,
    title: "Healthcare & MedTech Valuation Report",
    description: "Valoraciones del sector salud, análisis regulatorio y oportunidades de inversión en healthtech.",
    pages: 38,
    lastUpdate: "Noviembre 2024",
    category: "Salud",
    icon: <Stethoscope className="h-5 w-5" />,
    downloadUrl: "#"
  },
  {
    id: 3,
    title: "Retail & E-commerce Market Intelligence",
    description: "Transformación digital del retail, análisis de múltiplos y tendencias en e-commerce.",
    pages: 42,
    lastUpdate: "Octubre 2024",
    category: "Retail",
    icon: <ShoppingCart className="h-5 w-5" />,
    downloadUrl: "#"
  }
];

const MarketReports = () => {
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [currentView, setCurrentView] = useState<'overview' | 'calculators' | 'reports'>('overview');
  
  const { data: calculators, isLoading: calculatorsLoading } = useSectorCalculators();

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

  if (selectedCalculator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <Header />
        <div className="pt-16">
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectorCalculatorForm 
                calculator={selectedCalculator} 
                onBack={handleBack}
              />
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Market Intelligence
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Calculadoras especializadas por sector, informes de mercado y análisis con IA 
                para optimizar tus decisiones estratégicas de valoración y inversión.
              </p>
              
              {/* Navigation Tabs */}
              <div className="flex justify-center mt-12">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={currentView === 'overview' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('overview')}
                    className="rounded-md"
                  >
                    Vista General
                  </Button>
                  <Button
                    variant={currentView === 'calculators' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('calculators')}
                    className="rounded-md"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculadoras
                  </Button>
                  <Button
                    variant={currentView === 'reports' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('reports')}
                    className="rounded-md"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Informes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        {currentView === 'overview' && (
          <>
            {/* Sector Calculators Preview */}
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-black mb-4">
                    Calculadoras Sectoriales con IA
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Valoraciones precisas usando métricas específicas de cada sector, 
                    con reportes personalizados generados por inteligencia artificial.
                  </p>
                </div>
                
                {calculatorsLoading ? (
                  <div className="text-center py-8">Cargando calculadoras...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {calculators?.slice(0, 3).map((calculator) => (
                      <SectorCalculatorCard
                        key={calculator.id}
                        calculator={calculator}
                        onCalculate={handleCalculate}
                      />
                    ))}
                  </div>
                )}
                
                <div className="text-center mt-12">
                  <Button 
                    size="lg" 
                    onClick={() => setCurrentView('calculators')}
                    className="group"
                  >
                    Ver Todas las Calculadoras
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </section>

            {/* Market Reports Preview */}
            <section className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-black mb-4">
                    Informes de Mercado
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Análisis profundos del mercado con datos actualizados, 
                    múltiplos de valoración y tendencias por sector.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {marketReports.slice(0, 3).map((report) => (
                    <Card key={report.id} className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 bg-white">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                              {report.icon}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {report.category}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                          {report.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <CardDescription className="text-gray-600 leading-relaxed text-sm">
                          {report.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{report.pages} páginas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            <span>{report.lastUpdate}</span>
                          </div>
                        </div>
                        
                        <Button className="w-full" variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Descargar Informe
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center mt-12">
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => setCurrentView('reports')}
                    className="group"
                  >
                    Ver Todos los Informes
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Calculators Section */}
        {currentView === 'calculators' && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-black mb-4">
                  Calculadoras Sectoriales
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Selecciona la calculadora específica para tu sector y obtén una valoración 
                  precisa con reporte personalizado generado por IA.
                </p>
              </div>
              
              {calculatorsLoading ? (
                <div className="text-center py-8">Cargando calculadoras...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {calculators?.map((calculator) => (
                    <SectorCalculatorCard
                      key={calculator.id}
                      calculator={calculator}
                      onCalculate={handleCalculate}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Reports Section */}
        {currentView === 'reports' && (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-black mb-4">
                  Informes de Mercado
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Accede a nuestros informes especializados por sector con análisis de valoración, 
                  tendencias del mercado y datos exclusivos.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {marketReports.map((report) => (
                  <Card key={report.id} className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            {report.icon}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {report.category}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                        {report.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-gray-600 leading-relaxed text-sm">
                        {report.description}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{report.pages} páginas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>{report.lastUpdate}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full" variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Informe
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Necesitas un análisis personalizado?
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Nuestro equipo puede crear reportes específicos para tu sector o necesidades de análisis. 
              Obtén insights personalizados con IA para tu estrategia empresarial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100">
                Solicitar Análisis Personalizado
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                Contactar Equipo de Análisis
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MarketReports;
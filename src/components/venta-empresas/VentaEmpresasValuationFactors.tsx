import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Shield, Target, BarChart3, Lightbulb } from 'lucide-react';

const VentaEmpresasValuationFactors = () => {
  const [activeTab, setActiveTab] = useState('multiples');

  const sectorMultiples = [
    { sector: 'SaaS / Software', multiple: '4.5-8.0x', growth: '+15%', icon: '💻' },
    { sector: 'E-commerce / Retail', multiple: '2.5-4.5x', growth: '+8%', icon: '🛒' },
    { sector: 'Manufacturing', multiple: '3.0-5.0x', growth: '+5%', icon: '🏭' },
    { sector: 'Healthcare / Pharma', multiple: '5.0-12.0x', growth: '+12%', icon: '🏥' },
    { sector: 'Financial Services', multiple: '2.0-4.0x', growth: '+6%', icon: '🏦' },
    { sector: 'Professional Services', multiple: '2.5-4.5x', growth: '+7%', icon: '💼' }
  ];

  const valuationFactors = [
    {
      factor: 'Rentabilidad',
      icon: <TrendingUp className="w-6 h-6" />,
      weight: '30%',
      description: 'EBITDA y márgenes operativos estables',
      impact: 'Alto',
      color: 'text-green-600'
    },
    {
      factor: 'Flujo de Caja',
      icon: <BarChart3 className="w-6 h-6" />,
      weight: '25%',
      description: 'Generación consistente de cash flow',
      impact: 'Alto',
      color: 'text-blue-600'
    },
    {
      factor: 'Equipo Directivo',
      icon: <Users className="w-6 h-6" />,
      weight: '20%',
      description: 'Continuidad y capacidad de gestión',
      impact: 'Medio',
      color: 'text-purple-600'
    },
    {
      factor: 'Diversificación',
      icon: <Shield className="w-6 h-6" />,
      weight: '15%',
      description: 'Clientes, productos y geografías',
      impact: 'Medio',
      color: 'text-orange-600'
    },
    {
      factor: 'Posición Competitiva',
      icon: <Target className="w-6 h-6" />,
      weight: '10%',
      description: 'Ventajas competitivas sostenibles',
      impact: 'Medio',
      color: 'text-red-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Factores de Valoración
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprende qué factores determinan el valor de tu empresa y cómo optimizarlos 
            para maximizar el precio de venta.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12">
            <TabsTrigger value="multiples" className="text-lg py-3">
              Múltiplos por Sector
            </TabsTrigger>
            <TabsTrigger value="factors" className="text-lg py-3">
              Factores Clave
            </TabsTrigger>
          </TabsList>

          <TabsContent value="multiples" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectorMultiples.map((sector, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{sector.icon}</span>
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {sector.growth}
                      </div>
                    </div>
                    <CardTitle className="text-lg text-gray-900">
                      {sector.sector}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {sector.multiple}
                      </div>
                      <div className="text-sm text-gray-600">EBITDA Multiple</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <Lightbulb className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  ¿Quieres conocer el múltiplo específico de tu sector?
                </h3>
                <p className="text-gray-600 mb-6">
                  Solicita una valoración gratuita y descubre dónde está el potencial oculto de tu empresa.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Solicitar Valoración Gratuita
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="factors" className="space-y-8">
            <div className="grid gap-6">
              {valuationFactors.map((factor, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`${factor.color} bg-gray-50 p-3 rounded-lg`}>
                          {factor.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {factor.factor}
                          </h3>
                          <p className="text-gray-600">{factor.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {factor.weight}
                        </div>
                        <div className={`text-sm font-medium ${
                          factor.impact === 'Alto' ? 'text-red-600' : 
                          factor.impact === 'Medio' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          Impacto {factor.impact}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Interactive comparison */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Comparativa de Valoración
                </h3>
                <p className="text-gray-600">
                  Ejemplo práctico: Empresa con 2M€ EBITDA
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border-2 border-red-200">
                  <h4 className="text-lg font-semibold text-red-600 mb-4">Sin Optimización</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Múltiplo:</span>
                      <span className="font-medium">2.5x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valoración:</span>
                      <span className="font-medium">5M€</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mt-4">
                      <li>• Dependencia de fundador</li>
                      <li>• Clientes concentrados</li>
                      <li>• Procesos no documentados</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                  <h4 className="text-lg font-semibold text-green-600 mb-4">Optimizada</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Múltiplo:</span>
                      <span className="font-medium">4.0x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valoración:</span>
                      <span className="font-medium text-green-600 text-xl">8M€</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 mt-4">
                      <li>• Equipo directivo independiente</li>
                      <li>• Cartera diversificada</li>
                      <li>• Sistemas y procesos escalables</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <div className="text-3xl font-bold text-green-600 mb-2">+3M€</div>
                <div className="text-gray-600">Incremento de valor potencial</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default VentaEmpresasValuationFactors;
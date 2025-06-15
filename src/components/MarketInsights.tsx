
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MarketInsights = () => {
  const insights = [
    {
      value: "€300M",
      label: "Volumen Transaccional Q4",
      change: "+15%",
      positive: true
    },
    {
      value: "47",
      label: "Transacciones Activas",
      change: "+8%",
      positive: true
    },
    {
      value: "156",
      label: "Empresas Valoradas",
      change: "+23%",
      positive: true
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Capittal Market
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Accede a análisis de mercado en tiempo real y datos exclusivos del sector M&A 
            con nuestro sistema propietario de inteligencia de mercado.
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {insights.map((insight, index) => (
            <Card key={index} className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-black mb-1">
                  {insight.value}
                </div>
                <div className="text-gray-600 text-sm mb-2">
                  {insight.label}
                </div>
                <div className={`text-sm font-medium ${
                  insight.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {insight.change} vs Q3
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Intelligence CTA */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold text-black mb-4">
            Inteligencia de Mercado Capittal
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed text-base">
            Nuestro sistema propietario ofrece acceso exclusivo a valoraciones de mercado, 
            análisis de transacciones comparables y datos de inteligencia M&A actualizados en tiempo real.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="bg-white text-black border border-gray-300 rounded-lg px-6 py-3 text-lg font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out"
              onClick={() => window.open('https://capittalmarket.com', '_blank')}
            >
              Acceder a Capittal Market
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-transparent border border-gray-300 rounded-lg px-6 py-3 text-lg font-medium hover:bg-black hover:text-white transition-all duration-300"
            >
              Solicitar Acceso
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
            <div>
              <h4 className="font-semibold text-black mb-2 text-base">Valoraciones en Tiempo Real</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Metodologías DCF, múltiplos y transacciones comparables actualizadas diariamente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-2 text-base">Base de Datos M&A</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Acceso a más de 10,000 transacciones históricas con detalles financieros.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-2 text-base">Analytics Avanzados</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Dashboards interactivos y reportes personalizados para decisiones informadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketInsights;

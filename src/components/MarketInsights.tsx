
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Building, Target } from 'lucide-react';

const MarketInsights = () => {
  const insights = [
    {
      icon: TrendingUp,
      title: 'Múltiplos de Valoración',
      value: '8.5x EBITDA',
      change: '+12%',
      description: 'Promedio del sector tecnológico en 2024',
    },
    {
      icon: Users,
      title: 'Volumen de Transacciones',
      value: '€2.3B',
      change: '+23%',
      description: 'Valor total de M&A en España',
    },
    {
      icon: Building,
      title: 'Empresas Vendidas',
      value: '156',
      change: '+8%',
      description: 'Transacciones completadas este año',
    },
    {
      icon: Target,
      title: 'Tiempo Promedio',
      value: '6.2 meses',
      change: '-15%',
      description: 'Desde mandato hasta cierre',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Market Insights
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Datos actualizados del mercado de fusiones y adquisiciones para 
            que tomes decisiones informadas sobre tu empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <Card key={index} className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white border-0.5 border-black rounded-lg group-hover:shadow-sm transition-all duration-300 ease-out">
                      <IconComponent className="h-6 w-6 text-black" />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 bg-white border-0.5 border-black rounded-lg ${
                      insight.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {insight.change}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                      {insight.title}
                    </h3>
                    <div className="text-2xl font-bold text-black mb-1">
                      {insight.value}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {insight.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            ¿Quieres acceder a nuestros informes de mercado completos?
          </p>
          <button className="bg-white text-black border-0.5 border-black rounded-lg px-6 py-3 text-base font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Descargar Informes
          </button>
        </div>
      </div>
    </section>
  );
};

export default MarketInsights;

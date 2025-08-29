import React from 'react';
import { Link } from 'react-router-dom';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Calculator, TrendingUp, Award, BarChart3, Shield, Clock } from 'lucide-react';

const ValoracionesHero = () => {
  const benefits = [
    'Metodologías reconocidas internacionalmente',
    'Valoraciones precisas y objetivas',
    'Informes detallados y justificados',
    'Soporte para operaciones M&A y estratégicas'
  ];

  const metodologias = [
    {
      nombre: 'DCF',
      multiple: '12.5x',
      crecimiento: 'Flujos',
      sector: 'Proyecciones'
    },
    {
      nombre: 'Múltiplos',
      multiple: '8.2x',
      crecimiento: 'EV/EBITDA',
      sector: 'Sector'
    },
    {
      nombre: 'Patrimonial',
      multiple: '1.8x',
      crecimiento: 'Book Value',
      sector: 'Ajustado'
    },
    {
      nombre: 'Mixto',
      multiple: '10.1x',
      crecimiento: 'Ponderado',
      sector: 'Final'
    },
    {
      nombre: 'Liquidación',
      multiple: '0.6x',
      crecimiento: 'Orderly',
      sector: 'Distressed'
    }
  ];

  return (
    <section className="py-[120px] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-blue-800">Expertos en Valoración</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              Valoración Profesional de Empresas
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Valoraciones precisas con metodologías reconocidas internacionalmente. 
              Más de 15 años de experiencia en M&A y valoraciones corporativas.
            </p>

            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/lp/calculadora">
                <InteractiveHoverButton 
                  text="Calculadora Gratuita" 
                  variant="primary" 
                  size="lg" 
                />
              </Link>
              <InteractiveHoverButton 
                text="Valoración Profesional" 
                variant="outline" 
                size="lg" 
              />
            </div>
          </div>

          <div className="relative">
            {/* Valuation Dashboard Container */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-black">Metodologías de Valoración</h3>
                  <p className="text-gray-500 text-sm">Análisis multimetodológico</p>
                </div>
                <div className="bg-blue-100 rounded-lg px-3 py-1 text-sm font-semibold text-blue-800">
                  ±5% Precisión
                </div>
              </div>

              {/* Metodologías List */}
              <div className="space-y-4 mb-8">
                {metodologias.map((metodologia, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-sm" />
                      </div>
                      <div>
                        <div className="font-semibold text-black">{metodologia.nombre}</div>
                        <div className="text-xs text-gray-500">{metodologia.sector}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-black">{metodologia.multiple}</div>
                      <div className="text-blue-600 text-sm font-semibold">{metodologia.crecimiento}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-black">500+</div>
                  <div className="text-xs text-gray-500">Valoradas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">€2.8B</div>
                  <div className="text-xs text-gray-500">Valor Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">95%</div>
                  <div className="text-xs text-gray-500">Precisión</div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full opacity-40"></div>
            </div>
            
            {/* Floating indicators */}
            <div className="absolute -top-6 -right-6 bg-black text-white rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold">€45M</div>
                <div className="text-xs text-gray-300">Promedio</div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white border-2 border-blue-500 rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">15</div>
                <div className="text-xs text-gray-600">Años Exp.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesHero;
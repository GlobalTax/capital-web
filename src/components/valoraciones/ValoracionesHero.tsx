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
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Expertos en Valoración
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              Valoración Profesional de Empresas
            </h1>
            
            <p className="text-lg md:text-xl text-black mb-8 leading-relaxed">
              Valoraciones precisas con metodologías reconocidas internacionalmente. 
              Más de 15 años de experiencia en M&A y valoraciones corporativas.
            </p>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-black">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/lp/calculadora">
                <InteractiveHoverButton 
                  text="Calcular" 
                  variant="primary" 
                  size="lg" 
                />
              </Link>
              <InteractiveHoverButton 
                text="Valorar Empresa" 
                variant="secondary" 
                size="lg" 
              />
            </div>
          </div>

          <div>
            {/* Valuation Dashboard Container */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-black">Metodologías de Valoración</h3>
                  <p className="text-gray-500 text-sm">Análisis multimetodológico</p>
                </div>
                <div className="bg-gray-100 rounded px-3 py-1 text-sm font-medium text-black">
                  ±5% Precisión
                </div>
              </div>

              {/* Metodologías List */}
              <div className="space-y-3 mb-6">
                {metodologias.map((metodologia, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:border-gray-200 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-sm" />
                      </div>
                      <div>
                        <div className="font-medium text-black">{metodologia.nombre}</div>
                        <div className="text-xs text-gray-500">{metodologia.sector}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-black">{metodologia.multiple}</div>
                      <div className="text-primary text-sm font-medium">{metodologia.crecimiento}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">500+</div>
                  <div className="text-xs text-gray-500">Valoradas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">€2.8B</div>
                  <div className="text-xs text-gray-500">Valor Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">95%</div>
                  <div className="text-xs text-gray-500">Precisión</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesHero;
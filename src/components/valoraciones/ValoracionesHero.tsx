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
    <section className="pt-32 pb-12 bg-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center bg-slate-50 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-slate-600">Expertos en Valoración</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6 leading-tight">
              Valoración Profesional de Empresas
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Valoraciones precisas con metodologías reconocidas internacionalmente. 
              Más de 15 años de experiencia en M&A y valoraciones corporativas.
            </p>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-slate-600">{benefit}</span>
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
            <div className="bg-white rounded-lg p-6 border border-slate-200 relative">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Metodologías de Valoración</h3>
                  <p className="text-slate-500 text-sm">Análisis multimetodológico</p>
                </div>
                <div className="bg-slate-50 rounded px-3 py-1 text-sm font-medium text-slate-600">
                  ±5% Precisión
                </div>
              </div>

              {/* Metodologías List */}
              <div className="space-y-3 mb-6">
                {metodologias.map((metodologia, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-slate-100 rounded hover:border-slate-200 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-sm" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{metodologia.nombre}</div>
                        <div className="text-xs text-slate-500">{metodologia.sector}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{metodologia.multiple}</div>
                      <div className="text-primary text-sm font-medium">{metodologia.crecimiento}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">500+</div>
                  <div className="text-xs text-slate-500">Valoradas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">€2.8B</div>
                  <div className="text-xs text-slate-500">Valor Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900">95%</div>
                  <div className="text-xs text-slate-500">Precisión</div>
                </div>
              </div>
            </div>
            
            {/* Floating indicators */}
            <div className="absolute -top-4 -right-4 bg-slate-900 text-white rounded-lg p-3 border border-slate-200">
              <div className="text-center">
                <div className="text-sm font-semibold">€45M</div>
                <div className="text-xs text-slate-400">Promedio</div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white border border-primary rounded-lg p-3">
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">15</div>
                <div className="text-xs text-slate-600">Años Exp.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesHero;
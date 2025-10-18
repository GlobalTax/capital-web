import React from 'react';
import { CheckCircle } from 'lucide-react';

const VentaEmpresasHeroLanding = () => {
  const benefits = [
    { text: "Máximo precio de venta" },
    { text: "Proceso 100% confidencial" },
    { text: "Experiencia en +200 operaciones" }
  ];

  return (
    <section id="inicio" className="relative py-20 md:py-32 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Content Left */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium text-black mb-8">
              <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
              +200 empresas vendidas exitosamente
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              Vende tu empresa al{" "}
              <span className="text-primary">mejor precio</span>
            </h1>
            
            <p className="text-lg md:text-xl text-black mb-8 max-w-2xl mx-auto lg:mx-0">
              Asesoría especializada en M&A. Maximizamos el valor de tu empresa con 
              un proceso profesional, confidencial y orientado a resultados.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-black">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-border mt-8">
              <p className="text-sm text-black mb-3">Confianza garantizada:</p>
              <div className="flex flex-wrap gap-6 text-sm text-black">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>+15 años experiencia</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>€2.5B+ en transacciones</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>98,7% tasa de éxito</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Card Right */}
          <div className="relative">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-slate-900">Capittal M&A</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-8">
                {/* Stats Row */}
                <div className="flex items-center justify-between px-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">+25%</div>
                    <div className="text-sm text-slate-600">Precio vs. mercado</div>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">6-9</div>
                    <div className="text-sm text-slate-600">Meses proceso</div>
                  </div>
                </div>

                {/* Sectors List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 text-sm">Sectores Principales</h4>
                  <div className="text-sm text-slate-700 space-y-2">
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-2">•</span>
                      <span>Tecnología y Software</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-2">•</span>
                      <span>E-commerce y Retail</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-2">•</span>
                      <span>Servicios Profesionales</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-2">•</span>
                      <span>Industria y Manufactura</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button className="w-full py-3 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Valoración gratuita disponible
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHeroLanding;
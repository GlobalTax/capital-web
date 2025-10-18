import React from 'react';
import { 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Target, 
  Building2, 
  Cpu, 
  ShoppingCart, 
  Briefcase, 
  Factory,
  Calculator,
  ArrowRight 
} from 'lucide-react';

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

          {/* Visual Card Right - Dashboard Profesional */}
          <div className="relative">
            {/* Floating Badge - GRATIS */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg rotate-12 animate-pulse z-10">
              ¡GRATIS!
            </div>

            {/* Floating Badge - 48H */}
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg -rotate-12 z-10">
              48 HORAS
            </div>

            {/* Main Dashboard Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
              
              {/* Header with Status Live */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Capittal M&A</h3>
                    <p className="text-xs text-slate-500">Dashboard en tiempo real</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700">Activo</span>
                </div>
              </div>
              
              <div className="space-y-5">
                
                {/* Métricas con Gradientes */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Card 1: Precio Premium */}
                  <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Precio Premium</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700 mb-1">+25%</div>
                      <p className="text-xs text-green-600/80">vs. mercado</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-green-200/30 rounded-full blur-2xl"></div>
                  </div>

                  {/* Card 2: Tiempo de Proceso */}
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Tiempo Medio</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-700 mb-1">6-9</div>
                      <p className="text-xs text-blue-600/80">meses</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-200/30 rounded-full blur-2xl"></div>
                  </div>
                </div>

                {/* Barra de Progreso - Tasa de Éxito */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-slate-700" />
                      <span className="text-sm font-medium text-slate-900">Tasa de Éxito</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">98.7%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: '98.7%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">+200 operaciones completadas</p>
                </div>

                {/* Sectores con Iconos Profesionales */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-700" />
                    <h4 className="font-semibold text-slate-900 text-sm">Sectores de Especialización</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Cpu className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-slate-700">Tecnología y Software</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-slate-700">E-commerce y Retail</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-sm text-slate-700">Servicios Profesionales</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <Factory className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm text-slate-700">Industria y Manufactura</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button Premium */}
                <button className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-[2px] transition-all hover:scale-[1.02] hover:shadow-lg">
                  <div className="relative flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white transition-all">
                    <Calculator className="h-5 w-5" />
                    <span className="font-semibold">Solicitar Valoración Gratuita</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHeroLanding;
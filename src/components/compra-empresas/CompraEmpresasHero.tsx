import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const CompraEmpresasHero = () => {
  const benefits = [
    'Identificación de oportunidades exclusivas',
    'Due diligence completa incluida',
    'Negociación experta y representación',
    'Asesoramiento en integración post-compra'
  ];

  // Mock dashboard data
  const oportunidades = [
    { nombre: "SaaS Analytics", valor: "8.2M€", sector: "Tecnología", rentabilidad: "+18%" },
    { nombre: "Distribución Industrial", valor: "12.5M€", sector: "Industrial", rentabilidad: "+22%" },
    { nombre: "Servicios Profesionales", valor: "4.8M€", sector: "Servicios", rentabilidad: "+15%" },
    { nombre: "E-commerce B2B", valor: "6.1M€", sector: "Digital", rentabilidad: "+25%" }
  ];

  return (
    <section className="py-[120px] bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Adquisiciones Estratégicas
            </h1>
            <p className="text-xl text-slate-700 mb-8 leading-relaxed">
              Identificamos, evaluamos y ejecutamos adquisiciones que impulsan el crecimiento de tu empresa. 
              Acceso exclusivo a oportunidades fuera del mercado público con asesoramiento integral.
            </p>
            
            {/* Benefits List */}
            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                  <span className="text-slate-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <InteractiveHoverButton 
                text="Ver Oportunidades Actuales" 
                variant="primary"
                size="lg"
              />
              <InteractiveHoverButton 
                text="Solicitar Consulta" 
                variant="outline"
                size="lg"
              />
            </div>
          </div>

          {/* Right Dashboard */}
          <div className="relative">
            {/* Dashboard Container */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 relative z-10">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-slate-900">Oportunidades Disponibles</h3>
                <div className="text-sm text-emerald-600 font-medium">🟢 Actualizado hoy</div>
              </div>

              {/* Opportunities List */}
              <div className="space-y-4">
                {oportunidades.map((oportunidad, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-slate-900 text-sm">{oportunidad.nombre}</div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{oportunidad.sector}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{oportunidad.valor}</div>
                      <div className="text-xs text-emerald-600">{oportunidad.rentabilidad}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">24</div>
                  <div className="text-xs text-slate-600">Oportunidades activas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">€85M</div>
                  <div className="text-xs text-slate-600">Valor total disponible</div>
                </div>
              </div>
            </div>

            {/* Floating Indicators */}
            <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium z-20">
              Acceso Exclusivo
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium z-20">
              Due Diligence Incluida
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompraEmpresasHero;
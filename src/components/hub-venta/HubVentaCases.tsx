import React from 'react';
import { Building2, TrendingUp, Globe, Factory, ShoppingBag } from 'lucide-react';

const cases = [
  {
    icon: Building2,
    sector: 'Industria',
    title: 'Empresa industrial vendida a grupo alemán',
    value: '€8.5M',
    highlight: 'Proceso completado en 7 meses',
    buyerType: 'Comprador estratégico',
    timeline: '7 meses',
    vsExpected: '+18% sobre valoración inicial',
  },
  {
    icon: TrendingUp,
    sector: 'Retail',
    title: 'Cadena de retail adquirida por fondo de inversión',
    value: '€12M',
    highlight: '+30% sobre valoración inicial',
    buyerType: 'Private equity',
    timeline: '9 meses',
    vsExpected: 'Múltiples ofertas competitivas',
  },
  {
    icon: Globe,
    sector: 'Tecnología',
    title: 'Software company vendida a competidor internacional',
    value: '€6.2M',
    highlight: 'Múltiples ofertas competitivas',
    buyerType: 'Comprador estratégico',
    timeline: '5 meses',
    vsExpected: '+25% sobre primera oferta',
  },
  {
    icon: Factory,
    sector: 'Manufactura',
    title: 'Fabricante industrial vendido a grupo familiar',
    value: '€15M',
    highlight: 'Continuidad del equipo directivo',
    buyerType: 'Family office',
    timeline: '11 meses',
    vsExpected: 'Earnout adicional de €2M',
  },
  {
    icon: ShoppingBag,
    sector: 'E-commerce',
    title: 'Marketplace digital adquirido por agregador',
    value: '€4.8M',
    highlight: 'Cierre en tiempo récord',
    buyerType: 'Agregador especializado',
    timeline: '4 meses',
    vsExpected: 'Múltiplo 8x EBITDA',
  },
];

const HubVentaCases: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-500 mb-4">
            Track record
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4">
            Operaciones Recientes
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Casos reales de empresas que hemos vendido exitosamente.
          </p>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem, index) => (
            <div 
              key={index}
              className="relative bg-slate-900 text-white rounded-2xl p-8 overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                {/* Sector Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 mb-6">
                  <caseItem.icon className="h-3 w-3" />
                  <span>{caseItem.sector}</span>
                </div>

                {/* Value */}
                <div className="text-4xl font-bold text-white mb-4">
                  {caseItem.value}
                </div>

                {/* Title */}
                <h3 className="text-lg font-medium text-white/90 mb-4">
                  {caseItem.title}
                </h3>

                {/* Details Grid */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Tipo de comprador:</span>
                    <span className="text-white/80">{caseItem.buyerType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Timeline:</span>
                    <span className="text-white/80">{caseItem.timeline}</span>
                  </div>
                </div>

                {/* Highlight */}
                <div className="inline-flex items-center gap-2 text-sm text-green-400">
                  <span>✓</span>
                  <span>{caseItem.vsExpected}</span>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          * Datos reales de operaciones cerradas. Nombres de empresas omitidos por confidencialidad.
        </p>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-100 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-slate-900">+100</div>
            <div className="text-sm text-slate-600">Operaciones cerradas</div>
          </div>
          <div className="bg-slate-100 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-slate-900">€500M+</div>
            <div className="text-sm text-slate-600">Valor transaccionado</div>
          </div>
          <div className="bg-slate-100 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-slate-900">8 meses</div>
            <div className="text-sm text-slate-600">Tiempo medio de cierre</div>
          </div>
          <div className="bg-slate-100 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-slate-900">+22%</div>
            <div className="text-sm text-slate-600">Mejora media vs valoración</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HubVentaCases;

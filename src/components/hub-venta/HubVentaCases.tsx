import React from 'react';
import { Building2, TrendingUp, Globe } from 'lucide-react';

const cases = [
  {
    icon: Building2,
    sector: 'Industria',
    title: 'Empresa industrial vendida a grupo alemán',
    value: '€8.5M',
    highlight: 'Proceso completado en 7 meses',
  },
  {
    icon: TrendingUp,
    sector: 'Retail',
    title: 'Cadena de retail adquirida por fondo de inversión',
    value: '€12M',
    highlight: '+30% sobre valoración inicial',
  },
  {
    icon: Globe,
    sector: 'Tecnología',
    title: 'Software company vendida a competidor internacional',
    value: '€6.2M',
    highlight: 'Múltiples ofertas competitivas',
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
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900">
            Operaciones Recientes
          </h2>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                {/* Highlight */}
                <div className="inline-flex items-center gap-2 text-sm text-green-400">
                  <span>✓</span>
                  <span>{caseItem.highlight}</span>
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
      </div>
    </section>
  );
};

export default HubVentaCases;

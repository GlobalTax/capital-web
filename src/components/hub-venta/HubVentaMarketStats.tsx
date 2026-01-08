import React from 'react';
import { TrendingUp, Building2, Clock, Target } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: '€12.500M',
    label: 'En transacciones mid-market en España (2024)',
    source: 'TTR Data',
  },
  {
    icon: Building2,
    value: '66%',
    label: 'De empresas familiares sin plan de sucesión definido',
    source: 'Instituto Empresa Familiar',
  },
  {
    icon: Target,
    value: '4-7x',
    label: 'Múltiplo EBITDA medio en el mid-market español',
    source: 'Análisis Capittal',
  },
  {
    icon: Clock,
    value: '+23%',
    label: 'Crecimiento del mercado M&A español vs 2023',
    source: 'Mergermarket',
  },
];

const HubVentaMarketStats: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-500 mb-4">
            Contexto de mercado
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4">
            El Mercado M&A en España
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            2024 está siendo un año récord para las transacciones de empresas en España.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-slate-200 text-center hover:shadow-lg transition-shadow"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-700 mb-4 mx-auto">
                <stat.icon className="h-6 w-6" />
              </div>

              {/* Value */}
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {stat.value}
              </div>

              {/* Label */}
              <p className="text-sm text-slate-600 mb-3">
                {stat.label}
              </p>

              {/* Source */}
              <p className="text-xs text-slate-400">
                Fuente: {stat.source}
              </p>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center">
          <p className="text-lg text-white mb-2">
            <span className="font-semibold">¿Sabías que?</span>
          </p>
          <p className="text-slate-300 max-w-3xl mx-auto">
            El 73% de los empresarios que vendieron su empresa dicen que les hubiera gustado empezar a planificar la venta con más antelación. 
            El momento ideal para preparar la venta es cuando la empresa está en su mejor momento.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HubVentaMarketStats;

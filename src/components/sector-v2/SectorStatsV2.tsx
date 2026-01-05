import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  description?: string;
}

interface SectorStatsV2Props {
  title?: string;
  subtitle?: string;
  stats: Stat[];
  accentColor?: 'emerald' | 'blue' | 'amber' | 'slate' | 'stone' | 'rose' | 'indigo' | 'pink';
}

const SectorStatsV2: React.FC<SectorStatsV2Props> = ({
  title = "Cifras Clave del Sector",
  subtitle,
  stats,
}) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="group relative p-8 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-8 right-8 h-1 rounded-b-full bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-4xl md:text-5xl font-bold text-slate-900">
                    {stat.value}
                  </span>
                  
                  {stat.trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stat.trend.direction === 'up' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {stat.trend.direction === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {stat.trend.value}
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-slate-800">
                  {stat.label}
                </h3>
                
                {stat.description && (
                  <p className="text-sm text-slate-500">
                    {stat.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectorStatsV2;

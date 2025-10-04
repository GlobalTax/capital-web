
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface StatItem {
  number: string;
  label: string;
  description?: string;
  trend?: string;
}

interface PremiumSectorStatsProps {
  stats: StatItem[];
  title?: string;
  subtitle?: string;
}

const PremiumSectorStats: React.FC<PremiumSectorStatsProps> = ({ 
  stats, 
  title = "Resultados que Hablan por Sí Solos",
  subtitle = "Nuestro track record en el sector demuestra nuestra experiencia y capacidad de ejecución"
}) => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            {title}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="group text-center">
              <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="text-4xl md:text-5xl font-bold text-black mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium mb-2">
                  {stat.label}
                </div>
                {stat.description && (
                  <div className="text-sm text-slate-500">
                    {stat.description}
                  </div>
                )}
                {stat.trend && (
                  <div className="flex items-center justify-center mt-3 text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.trend}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumSectorStats;

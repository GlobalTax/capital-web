import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ExpertiseItem {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
}

interface SectorExpertiseGridProps {
  title?: string;
  subtitle?: string;
  items: ExpertiseItem[];
  accentColor?: 'emerald' | 'blue' | 'amber' | 'slate' | 'stone' | 'rose' | 'indigo' | 'pink';
}

const SectorExpertiseGrid: React.FC<SectorExpertiseGridProps> = ({
  title = "Nuestra Especialización",
  subtitle,
  items,
}) => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
              >
                {/* Number badge */}
                <div className="absolute top-6 right-6 text-6xl font-bold text-slate-100 group-hover:text-slate-200 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Icon */}
                <div className="relative w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-normal text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {item.description}
                </p>
                
                {/* Features */}
                {item.features && item.features.length > 0 && (
                  <ul className="space-y-2">
                    {item.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SectorExpertiseGrid;

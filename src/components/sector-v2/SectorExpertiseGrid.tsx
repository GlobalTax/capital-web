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

const colorClasses = {
  emerald: {
    iconGradient: 'from-emerald-500 to-emerald-600',
    titleHover: 'group-hover:text-emerald-700',
    dot: 'bg-emerald-500'
  },
  blue: {
    iconGradient: 'from-blue-500 to-blue-600',
    titleHover: 'group-hover:text-blue-700',
    dot: 'bg-blue-500'
  },
  amber: {
    iconGradient: 'from-amber-500 to-amber-600',
    titleHover: 'group-hover:text-amber-700',
    dot: 'bg-amber-500'
  },
  slate: {
    iconGradient: 'from-slate-500 to-slate-600',
    titleHover: 'group-hover:text-slate-700',
    dot: 'bg-slate-500'
  },
  stone: {
    iconGradient: 'from-stone-500 to-stone-600',
    titleHover: 'group-hover:text-stone-700',
    dot: 'bg-stone-500'
  },
  rose: {
    iconGradient: 'from-rose-500 to-rose-600',
    titleHover: 'group-hover:text-rose-700',
    dot: 'bg-rose-500'
  },
  indigo: {
    iconGradient: 'from-indigo-500 to-indigo-600',
    titleHover: 'group-hover:text-indigo-700',
    dot: 'bg-indigo-500'
  },
  pink: {
    iconGradient: 'from-pink-500 to-purple-600',
    titleHover: 'group-hover:text-pink-700',
    dot: 'bg-pink-500'
  }
};

const SectorExpertiseGrid: React.FC<SectorExpertiseGridProps> = ({
  title = "Nuestra Especialización",
  subtitle,
  items,
  accentColor = 'emerald'
}) => {
  const colors = colorClasses[accentColor];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
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
                className="group relative bg-white rounded-2xl p-8 border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Number badge */}
                <div className="absolute top-6 right-6 text-6xl font-bold text-slate-100 group-hover:text-slate-200 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.iconGradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className={`text-xl font-bold text-slate-900 mb-3 ${colors.titleHover} transition-colors`}>
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
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
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

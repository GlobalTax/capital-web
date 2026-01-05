import React from 'react';
import { TrendingUp, Users, Globe, Lightbulb } from 'lucide-react';

interface InsightCard {
  icon?: React.ReactNode;
  title: string;
  value?: string;
  description: string;
}

interface SectorMarketInsightsProps {
  title?: string;
  subtitle?: string;
  description: string;
  bulletPoints: string[];
  insightCards: InsightCard[];
  accentColor?: 'emerald' | 'blue' | 'amber' | 'slate' | 'stone' | 'rose' | 'indigo' | 'pink';
}

const colorClasses = {
  emerald: {
    bulletBg: 'bg-emerald-100',
    bulletIcon: 'text-emerald-600',
    cardBg: 'bg-emerald-50',
    cardText: 'text-emerald-600',
    cardHover: 'hover:border-emerald-200'
  },
  blue: {
    bulletBg: 'bg-blue-100',
    bulletIcon: 'text-blue-600',
    cardBg: 'bg-blue-50',
    cardText: 'text-blue-600',
    cardHover: 'hover:border-blue-200'
  },
  amber: {
    bulletBg: 'bg-amber-100',
    bulletIcon: 'text-amber-600',
    cardBg: 'bg-amber-50',
    cardText: 'text-amber-600',
    cardHover: 'hover:border-amber-200'
  },
  slate: {
    bulletBg: 'bg-slate-200',
    bulletIcon: 'text-slate-600',
    cardBg: 'bg-slate-100',
    cardText: 'text-slate-600',
    cardHover: 'hover:border-slate-300'
  },
  stone: {
    bulletBg: 'bg-stone-100',
    bulletIcon: 'text-stone-600',
    cardBg: 'bg-stone-50',
    cardText: 'text-stone-600',
    cardHover: 'hover:border-stone-200'
  },
  rose: {
    bulletBg: 'bg-rose-100',
    bulletIcon: 'text-rose-600',
    cardBg: 'bg-rose-50',
    cardText: 'text-rose-600',
    cardHover: 'hover:border-rose-200'
  },
  indigo: {
    bulletBg: 'bg-indigo-100',
    bulletIcon: 'text-indigo-600',
    cardBg: 'bg-indigo-50',
    cardText: 'text-indigo-600',
    cardHover: 'hover:border-indigo-200'
  },
  pink: {
    bulletBg: 'bg-pink-100',
    bulletIcon: 'text-pink-600',
    cardBg: 'bg-pink-50',
    cardText: 'text-pink-600',
    cardHover: 'hover:border-pink-200'
  }
};

const SectorMarketInsights: React.FC<SectorMarketInsightsProps> = ({
  title = "Contexto de Mercado",
  subtitle,
  description,
  bulletPoints,
  insightCards,
  accentColor = 'emerald'
}) => {
  const colors = colorClasses[accentColor];

  const defaultIcons = [
    <TrendingUp className={`h-6 w-6 ${colors.bulletIcon}`} />,
    <Users className={`h-6 w-6 ${colors.bulletIcon}`} />,
    <Globe className={`h-6 w-6 ${colors.bulletIcon}`} />,
    <Lightbulb className={`h-6 w-6 ${colors.bulletIcon}`} />
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-slate-600 mb-6">
                {subtitle}
              </p>
            )}
            
            <p className="text-slate-600 mb-8 leading-relaxed">
              {description}
            </p>
            
            <ul className="space-y-4">
              {bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.bulletBg} flex items-center justify-center mt-0.5`}>
                    <svg className={`w-4 h-4 ${colors.bulletIcon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right - Insight Cards */}
          <div className="grid grid-cols-2 gap-4">
            {insightCards.map((card, index) => (
              <div 
                key={index}
                className={`p-6 rounded-2xl border border-slate-100 ${colors.cardHover} hover:shadow-lg transition-all duration-300 ${
                  index === 0 ? 'bg-gradient-to-br from-slate-50 to-white' : 'bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${colors.cardBg} flex items-center justify-center mb-4`}>
                  {card.icon || defaultIcons[index % defaultIcons.length]}
                </div>
                
                {card.value && (
                  <div className={`text-2xl font-bold ${colors.cardText} mb-1`}>
                    {card.value}
                  </div>
                )}
                
                <h3 className="font-semibold text-slate-900 mb-2">
                  {card.title}
                </h3>
                
                <p className="text-sm text-slate-500">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorMarketInsights;

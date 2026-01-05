import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Building2, Users, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroMetric {
  value: string;
  label: string;
  trend?: string;
}

interface SectorHeroV2Props {
  badge: string;
  title: string;
  description: string;
  metrics: HeroMetric[];
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  accentColor?: 'emerald' | 'blue' | 'amber' | 'slate' | 'stone' | 'rose' | 'indigo' | 'pink';
}

const colorClasses = {
  emerald: {
    gradientAccent: 'from-emerald-50/30',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
    icon: 'text-emerald-500',
    decorative: 'from-emerald-100 to-emerald-50'
  },
  blue: {
    gradientAccent: 'from-blue-50/30',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    badgeBg: 'bg-blue-50',
    dot: 'bg-blue-500',
    icon: 'text-blue-500',
    decorative: 'from-blue-100 to-blue-50'
  },
  amber: {
    gradientAccent: 'from-amber-50/30',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    dot: 'bg-amber-500',
    icon: 'text-amber-500',
    decorative: 'from-amber-100 to-amber-50'
  },
  slate: {
    gradientAccent: 'from-slate-100/50',
    badgeBorder: 'border-slate-300',
    badgeText: 'text-slate-700',
    badgeBg: 'bg-slate-100',
    dot: 'bg-slate-500',
    icon: 'text-slate-500',
    decorative: 'from-slate-200 to-slate-100'
  },
  stone: {
    gradientAccent: 'from-stone-50/30',
    badgeBorder: 'border-stone-200',
    badgeText: 'text-stone-700',
    badgeBg: 'bg-stone-50',
    dot: 'bg-stone-500',
    icon: 'text-stone-500',
    decorative: 'from-stone-100 to-stone-50'
  },
  rose: {
    gradientAccent: 'from-rose-50/30',
    badgeBorder: 'border-rose-200',
    badgeText: 'text-rose-700',
    badgeBg: 'bg-rose-50',
    dot: 'bg-rose-500',
    icon: 'text-rose-500',
    decorative: 'from-rose-100 to-rose-50'
  },
  indigo: {
    gradientAccent: 'from-indigo-50/30',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-700',
    badgeBg: 'bg-indigo-50',
    dot: 'bg-indigo-500',
    icon: 'text-indigo-500',
    decorative: 'from-indigo-100 to-indigo-50'
  },
  pink: {
    gradientAccent: 'from-pink-50/30',
    badgeBorder: 'border-pink-200',
    badgeText: 'text-pink-700',
    badgeBg: 'bg-pink-50',
    dot: 'bg-pink-500',
    icon: 'text-pink-500',
    decorative: 'from-pink-100 to-purple-50'
  }
};

const SectorHeroV2: React.FC<SectorHeroV2Props> = ({
  badge,
  title,
  description,
  metrics,
  primaryCTA = { text: 'Calcular Valoración', href: '/lp/calculadora' },
  secondaryCTA = { text: 'Contactar Experto', href: '/contacto' },
  accentColor = 'emerald'
}) => {
  const metricIcons = [TrendingUp, Building2, Users, Target];
  const colors = colorClasses[accentColor];

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Gradient Accent */}
      <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l ${colors.gradientAccent} to-transparent`} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8">
            <Badge 
              variant="outline" 
              className={`px-4 py-2 text-sm font-medium ${colors.badgeBorder} ${colors.badgeText} ${colors.badgeBg}`}
            >
              {badge}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              {title}
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                asChild 
                size="lg" 
                className="capittal-button text-lg px-8 py-6 group"
              >
                <Link to={primaryCTA.href}>
                  {primaryCTA.text}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-slate-300 hover:bg-slate-50"
              >
                <Link to={secondaryCTA.href}>
                  {secondaryCTA.text}
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Metrics Dashboard */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                <span className="text-sm font-medium text-slate-500">Métricas del Sector</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {metrics.map((metric, index) => {
                  const Icon = metricIcons[index % metricIcons.length];
                  return (
                    <div 
                      key={index}
                      className="group p-5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Icon className={`h-5 w-5 ${colors.icon}`} />
                        {metric.trend && (
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            {metric.trend}
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {metric.value}
                      </div>
                      <div className="text-sm text-slate-500">
                        {metric.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className={`absolute -z-10 -top-4 -right-4 w-full h-full rounded-3xl bg-gradient-to-br ${colors.decorative}`} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorHeroV2;

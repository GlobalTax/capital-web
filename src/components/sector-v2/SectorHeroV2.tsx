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
  accentColor?: string;
}

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
      <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-${accentColor}-50/30 to-transparent`} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8">
            <Badge 
              variant="outline" 
              className={`px-4 py-2 text-sm font-medium border-${accentColor}-200 text-${accentColor}-700 bg-${accentColor}-50`}
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
                <div className={`w-3 h-3 rounded-full bg-${accentColor}-500`} />
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
                        <Icon className={`h-5 w-5 text-${accentColor}-500`} />
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
            <div className={`absolute -z-10 -top-4 -right-4 w-full h-full rounded-3xl bg-gradient-to-br from-${accentColor}-100 to-${accentColor}-50`} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorHeroV2;

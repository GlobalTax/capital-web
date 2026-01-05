import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Quote, TrendingUp, Clock, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CaseMetric {
  value: string;
  label: string;
}

interface SectorCaseStudyV2Props {
  title?: string;
  companyName: string;
  sector: string;
  description: string;
  metrics: CaseMetric[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  accentColor?: 'emerald' | 'blue' | 'amber' | 'slate' | 'stone' | 'rose' | 'indigo' | 'pink';
}

const colorClasses = {
  emerald: {
    avatarGradient: 'from-emerald-400 to-emerald-600',
    icon: 'text-emerald-400',
    testimonialGradient: 'from-emerald-600 to-emerald-700'
  },
  blue: {
    avatarGradient: 'from-blue-400 to-blue-600',
    icon: 'text-blue-400',
    testimonialGradient: 'from-blue-600 to-blue-700'
  },
  amber: {
    avatarGradient: 'from-amber-400 to-amber-600',
    icon: 'text-amber-400',
    testimonialGradient: 'from-amber-500 to-amber-600'
  },
  slate: {
    avatarGradient: 'from-slate-400 to-slate-600',
    icon: 'text-slate-400',
    testimonialGradient: 'from-slate-600 to-slate-700'
  },
  stone: {
    avatarGradient: 'from-stone-400 to-stone-600',
    icon: 'text-stone-400',
    testimonialGradient: 'from-stone-600 to-stone-700'
  },
  rose: {
    avatarGradient: 'from-rose-400 to-rose-600',
    icon: 'text-rose-400',
    testimonialGradient: 'from-rose-500 to-rose-600'
  },
  indigo: {
    avatarGradient: 'from-indigo-400 to-indigo-600',
    icon: 'text-indigo-400',
    testimonialGradient: 'from-indigo-600 to-indigo-700'
  },
  pink: {
    avatarGradient: 'from-pink-400 to-purple-600',
    icon: 'text-pink-400',
    testimonialGradient: 'from-pink-500 to-purple-600'
  }
};

const SectorCaseStudyV2: React.FC<SectorCaseStudyV2Props> = ({
  title = "Caso de Éxito",
  companyName,
  sector,
  description,
  metrics,
  testimonial,
  accentColor = 'emerald'
}) => {
  const metricIcons = [TrendingUp, Target, Clock];
  const colors = colorClasses[accentColor];

  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
            {title}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Resultados que hablan por sí solos
          </h2>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left - Company Info */}
            <div className="p-10 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.avatarGradient} flex items-center justify-center`}>
                  <span className="text-xl font-bold text-white">
                    {companyName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{companyName}</h3>
                  <p className="text-slate-400 text-sm">{sector}</p>
                </div>
              </div>
              
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                {description}
              </p>
              
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                {metrics.map((metric, index) => {
                  const Icon = metricIcons[index % metricIcons.length];
                  return (
                    <div key={index} className="text-center p-4 rounded-xl bg-white/5">
                      <Icon className={`h-5 w-5 ${colors.icon} mx-auto mb-2`} />
                      <div className="text-2xl font-bold text-white mb-1">
                        {metric.value}
                      </div>
                      <div className="text-xs text-slate-400">
                        {metric.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Right - Testimonial */}
            {testimonial && (
              <div className={`p-10 lg:p-12 bg-gradient-to-br ${colors.testimonialGradient} flex flex-col justify-center`}>
                <Quote className="h-10 w-10 text-white/30 mb-6" />
                
                <blockquote className="text-xl text-white font-medium mb-8 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-white/70">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white hover:text-slate-900 group">
            <Link to="/casos-exito">
              Ver más casos de éxito
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SectorCaseStudyV2;

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Quote, TrendingUp, Clock, Target, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

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
  operationLink?: string;
  isLoading?: boolean;
}

// Skeleton component for loading state
const CaseStudySkeleton: React.FC = () => (
  <section className="py-20 bg-slate-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <Skeleton className="h-6 w-32 mx-auto mb-4 bg-white/10" />
        <Skeleton className="h-10 w-80 mx-auto bg-white/10" />
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-0">
          <div className="p-10 lg:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="w-12 h-12 rounded-xl bg-white/10" />
              <div>
                <Skeleton className="h-6 w-40 mb-2 bg-white/10" />
                <Skeleton className="h-4 w-24 bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-20 w-full mb-8 bg-white/10" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
          <div className="p-10 lg:p-12 bg-slate-800">
            <Skeleton className="h-10 w-10 mb-6 bg-white/10" />
            <Skeleton className="h-32 w-full mb-8 bg-white/10" />
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
              <div>
                <Skeleton className="h-5 w-32 mb-2 bg-white/10" />
                <Skeleton className="h-4 w-24 bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SectorCaseStudyV2: React.FC<SectorCaseStudyV2Props> = ({
  title = "Caso de Éxito",
  companyName,
  sector,
  description,
  metrics,
  testimonial,
  operationLink,
  isLoading = false,
}) => {
  const metricIcons = [TrendingUp, Target, Clock];

  if (isLoading) {
    return <CaseStudySkeleton />;
  }

  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20">
            {title}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-normal text-white">
            Resultados que hablan por sí solos
          </h2>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left - Company Info */}
            <div className="p-10 lg:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
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
                      <Icon className="h-5 w-5 text-white/70 mx-auto mb-2" />
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

              {/* Link to operation if from marketplace */}
              {operationLink && (
                <div className="mt-8">
                  <Button asChild size="sm" className="bg-white text-slate-900 hover:bg-white/90 font-medium">
                    <Link to={operationLink}>
                      Ver operación en el marketplace
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            
            {/* Right - Testimonial */}
            {testimonial && (
              <div className="p-10 lg:p-12 bg-slate-800 flex flex-col justify-center">
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
          <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white hover:text-slate-900 group backdrop-blur-sm">
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

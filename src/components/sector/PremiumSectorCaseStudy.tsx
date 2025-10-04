
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Award, TrendingUp, Users, Clock } from 'lucide-react';

interface CaseStudyMetric {
  value: string;
  label: string;
  icon?: React.ComponentType<any>;
}

interface PremiumSectorCaseStudyProps {
  title: string;
  description: string;
  metrics: CaseStudyMetric[];
  buttonText: string;
  companyName?: string;
  sector?: string;
  timeline?: string;
}

const PremiumSectorCaseStudy: React.FC<PremiumSectorCaseStudyProps> = ({
  title,
  description,
  metrics,
  buttonText,
  companyName,
  sector,
  timeline
}) => {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900/50 to-transparent"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Award className="w-8 h-8 text-yellow-400" />
                <span className="text-yellow-400 font-medium uppercase tracking-wide text-sm">
                  Caso de Éxito Destacado
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                {title}
              </h2>
              
              {companyName && (
                <div className="flex items-center space-x-4 text-slate-300">
                  <span className="font-medium">{companyName}</span>
                  {sector && <span className="text-slate-400">•</span>}
                  {sector && <span>{sector}</span>}
                  {timeline && <span className="text-slate-400">•</span>}
                  {timeline && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{timeline}</span>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xl text-slate-300 leading-relaxed">
                {description}
              </p>
            </div>
            
            <InteractiveHoverButton
              text={buttonText}
              variant="secondary"
              size="lg"
              className="bg-white text-black hover:bg-gray-100 hover:shadow-2xl"
            />
          </div>

          {/* Right Side - Metrics Dashboard */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Resultados Obtenidos
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {metrics.map((metric, index) => (
                    <div key={index} className="group">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {metric.icon && <metric.icon className="w-6 h-6 text-blue-400" />}
                            <span className="text-slate-300 font-medium">
                              {metric.label}
                            </span>
                          </div>
                          <div className="text-3xl font-bold text-white">
                            {metric.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Success Indicator */}
                <div className="flex items-center justify-center space-x-2 pt-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">
                    Transacción Completada Exitosamente
                  </span>
                </div>
              </div>
            </div>
            
            {/* Floating Success Badge */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              100% Éxito
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumSectorCaseStudy;

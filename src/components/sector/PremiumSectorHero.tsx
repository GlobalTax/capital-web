
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Building, Zap } from 'lucide-react';

interface SectorMetric {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
  change?: string;
}

interface PremiumSectorHeroProps {
  sector: string;
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  metrics: SectorMetric[];
  gradientFrom?: string;
  gradientTo?: string;
}

const PremiumSectorHero = ({
  sector,
  title,
  description,
  primaryButtonText,
  secondaryButtonText = "Ver Casos de Éxito",
  metrics,
  gradientFrom = "from-slate-50",
  gradientTo = "to-white"
}: PremiumSectorHeroProps) => {
  return (
    <section className={`pt-32 pb-20 bg-gradient-to-br ${gradientFrom} ${gradientTo} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #000 1px, transparent 1px), radial-gradient(circle at 80% 50%, #000 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge className="bg-black text-white hover:bg-gray-800 text-sm uppercase tracking-wide font-medium px-4 py-2">
                Especialistas en {sector}
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight">
                {title}
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <InteractiveHoverButton
                text={primaryButtonText}
                variant="primary"
                size="lg"
                className="bg-black text-white border-black hover:shadow-2xl"
              />
              
              {secondaryButtonText && (
                <InteractiveHoverButton
                  text={secondaryButtonText}
                  variant="outline"
                  size="lg"
                  className="border-black text-black hover:bg-gray-50"
                />
              )}
            </div>
          </div>

          {/* Right Side - Interactive Dashboard */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-0.5 border-gray-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-black">Métricas del Sector</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {metrics.map((metric, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="bg-slate-50 rounded-xl p-4 border-0.5 border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                          <metric.icon className="w-6 h-6 text-blue-600" />
                          {metric.change && (
                            <span className="text-xs text-green-600 font-medium">
                              {metric.change}
                            </span>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-black mb-1">
                          {metric.value}
                        </div>
                        <div className="text-sm text-slate-600">
                          {metric.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Progress Indicators */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Crecimiento Anual</span>
                    <span className="text-sm font-medium text-black">+24%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-3/4 relative">
                      <div className="absolute right-0 top-0 w-2 h-2 bg-white rounded-full shadow-lg transform translate-x-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumSectorHero;

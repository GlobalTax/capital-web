
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SectorHeroProps {
  sector: string;
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const SectorHero = ({
  sector,
  title,
  description,
  primaryButtonText,
  secondaryButtonText = "Ver Casos de Éxito",
  gradientFrom = "from-slate-900",
  gradientTo = "to-slate-700"
}: SectorHeroProps) => {
  return (
    <section className={`pt-32 pb-20 bg-gradient-to-r ${gradientFrom} ${gradientTo} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 badge-text uppercase tracking-wide">
            Especialistas en {sector}
          </Badge>
          
          <h1 className="text-display text-white mb-8 leading-tight">
            {title}
          </h1>
          
          <p className="content-text text-white/90 max-w-4xl mx-auto mb-12">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button className="capittal-button button-label px-8 py-4 bg-white text-black hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {primaryButtonText}
            </Button>
            
            {secondaryButtonText && (
              <Button variant="outline" className="button-label px-8 py-4 border-white/30 text-white hover:bg-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {secondaryButtonText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorHero;

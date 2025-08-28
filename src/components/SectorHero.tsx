
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
  secondaryButtonText,
}: SectorHeroProps) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left max-w-4xl">
          <Badge className="mb-6 text-sm font-medium bg-white text-gray-600 border border-gray-300 px-4 py-1.5">
            {sector}
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-8 leading-tight">
            {title}
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mb-12 leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="text-sm px-6 py-3 bg-black text-white hover:bg-gray-800 transition-all font-medium">
              Solicitar consulta
            </Button>
            <Button variant="outline" className="text-sm px-6 py-3 border border-gray-300 text-black hover:bg-gray-50 transition-all font-medium">
              Ver casos de éxito
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorHero;

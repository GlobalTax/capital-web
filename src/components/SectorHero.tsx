
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
    <section className="pt-32 pb-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-black mb-8 leading-tight tracking-tight">
            {title}
          </h1>
          
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
            {description}
          </p>
          
          <div className="flex justify-center">
            <Button className="text-lg px-12 py-6 bg-black text-white hover:bg-gray-800 transition-all duration-300 rounded-lg">
              {primaryButtonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorHero;


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
    <section className="pt-40 pb-40 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-7xl md:text-9xl font-bold text-foreground mb-12 leading-[0.9] tracking-tight">
            {title}
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-4xl mx-auto mb-20 leading-relaxed">
            {description}
          </p>
          
          <div className="flex justify-center">
            <Button className="text-lg px-16 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1">
              {primaryButtonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorHero;

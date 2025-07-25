
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
    <section className="pt-32 pb-32 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            {description}
          </p>
          
          <div className="flex justify-center">
            <Button className="text-base px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {primaryButtonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorHero;


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
    <section className="pt-20 pb-24 bg-background border-b border-border">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-left max-w-4xl">
          <Badge className="mb-6 text-sm font-medium bg-muted text-muted-foreground border-border px-4 py-1.5">
            {sector}
          </Badge>
          
          <h1 className="text-3xl md:text-5xl font-light text-foreground mb-8 leading-tight tracking-tight">
            {title}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mb-12 leading-relaxed font-light">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="text-sm px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium">
              {primaryButtonText}
            </Button>
            {secondaryButtonText && (
              <Button variant="outline" className="text-sm px-6 py-3 border-border text-foreground hover:bg-muted transition-all font-medium">
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


import React from 'react';
import { Button } from '@/components/ui/button';

interface SectorCTAProps {
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
}

const SectorCTA: React.FC<SectorCTAProps> = ({
  title,
  description,
  primaryButtonText,
  secondaryButtonText
}) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
          {title}
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="capittal-button text-lg px-8 py-4">
            {primaryButtonText}
          </Button>
          <Button variant="outline" className="text-lg px-8 py-4 border-black text-black hover:bg-black hover:text-white">
            {secondaryButtonText}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SectorCTA;

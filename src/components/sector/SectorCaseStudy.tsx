
import React from 'react';
import { Button } from '@/components/ui/button';

interface CaseStudyMetric {
  value: string;
  label: string;
}

interface SectorCaseStudyProps {
  title: string;
  description: string;
  metrics: CaseStudyMetric[];
  buttonText: string;
}

const SectorCaseStudy: React.FC<SectorCaseStudyProps> = ({
  title,
  description,
  metrics,
  buttonText
}) => {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {title}
        </h2>
        <p className="text-xl text-slate-200 mb-8 max-w-4xl mx-auto">
          {description}
        </p>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {metrics.map((metric, index) => (
            <div key={index}>
              <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
              <div className="text-lg text-slate-300">{metric.label}</div>
            </div>
          ))}
        </div>
        <Button className="capittal-button bg-white text-black hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          {buttonText}
        </Button>
      </div>
    </section>
  );
};

export default SectorCaseStudy;

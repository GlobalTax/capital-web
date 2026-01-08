import React from 'react';
import { Check } from 'lucide-react';

interface MethodologyStep {
  number: string;
  title: string;
  description: string;
  features?: string[];
}

interface SectorMethodologyProps {
  title?: string;
  subtitle?: string;
  steps: MethodologyStep[];
  accentColor?: 'emerald' | 'blue' | 'amber' | 'slate' | 'stone' | 'rose' | 'indigo' | 'pink';
}

const SectorMethodology: React.FC<SectorMethodologyProps> = ({
  title = "Nuestra Metodología",
  subtitle,
  steps,
}) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
          
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step card */}
                <div className="bg-slate-50 rounded-2xl p-8 h-full border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                  {/* Number circle */}
                  <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6 shadow-lg relative z-10">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  
                  <h3 className="text-xl font-normal text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Features */}
                  {step.features && step.features.length > 0 && (
                    <ul className="space-y-3">
                      {step.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center mt-0.5">
                            <Check className="h-3 w-3 text-slate-700" />
                          </div>
                          <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                {/* Arrow connector for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectorMethodology;

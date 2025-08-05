import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ExpertiseItem {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
}

interface LegalExpertiseGridProps {
  title: string;
  subtitle?: string;
  items: ExpertiseItem[];
}

const LegalExpertiseGrid = ({ title, subtitle, items }: LegalExpertiseGridProps) => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-light text-foreground mb-4 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground font-light max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="bg-card border border-border p-6 hover:shadow-sm transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-foreground" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground mb-3">
                    {item.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-light">
                    {item.description}
                  </p>

                  {item.features && (
                    <ul className="space-y-1">
                      {item.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-xs text-muted-foreground flex items-center">
                          <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-2 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LegalExpertiseGrid;
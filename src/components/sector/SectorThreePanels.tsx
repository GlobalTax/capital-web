import React from 'react';
import { Button } from '@/components/ui/button';

interface Panel {
  type: 'image' | 'dashboard' | 'testimonial';
  title: string;
  content: string;
  imageUrl?: string;
  author?: string;
  role?: string;
  buttonText?: string;
}

interface SectorThreePanelsProps {
  panels: Panel[];
}

const SectorThreePanels = ({ panels }: SectorThreePanelsProps) => {
  return (
    <section className="py-40 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {panels.map((panel, index) => (
            <div key={index} className="group">
              {panel.type === 'image' && (
                <div className="space-y-10">
                  <div className="aspect-[4/5] bg-muted/50 rounded-xl overflow-hidden group-hover:shadow-lg transition-all duration-500 border border-border/50">
                    {panel.imageUrl ? (
                      <img 
                        src={panel.imageUrl} 
                        alt={panel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center">
                          <div className="w-16 h-16 bg-primary/40 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-6 leading-tight">{panel.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">{panel.content}</p>
                  </div>
                </div>
              )}

              {panel.type === 'dashboard' && (
                <div className="space-y-10">
                  <div className="aspect-[4/3] bg-background rounded-xl border border-border/50 p-8 group-hover:shadow-lg transition-all duration-500">
                    <div className="h-full bg-muted/30 rounded-lg p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-6 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/20 rounded-md border border-primary/10 flex items-center justify-center">
                        <div className="text-2xl">📊</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-6 leading-tight">{panel.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">{panel.content}</p>
                  </div>
                </div>
              )}

              {panel.type === 'testimonial' && (
                <div className="space-y-10">
                  <div className="bg-background rounded-xl p-10 group-hover:shadow-lg transition-all duration-500 border border-border/50">
                    <blockquote className="text-xl text-foreground leading-relaxed mb-8 font-medium">
                      "{panel.content}"
                    </blockquote>
                    {panel.author && (
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-muted rounded-full mr-6 flex items-center justify-center">
                          <div className="w-8 h-8 bg-primary/30 rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-lg">{panel.author}</p>
                          {panel.role && (
                            <p className="text-muted-foreground">{panel.role}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-6 leading-tight">{panel.title}</h3>
                    {panel.buttonText && (
                      <Button className="text-base px-10 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        {panel.buttonText}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectorThreePanels;
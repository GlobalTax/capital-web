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
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {panels.map((panel, index) => (
            <div key={index} className="group">
              {panel.type === 'image' && (
                 <div className="space-y-6">
                   <div className="aspect-[4/5] bg-muted/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-border/50">
                     {panel.imageUrl ? (
                       <img 
                         src={panel.imageUrl} 
                         alt={panel.title}
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center">
                         <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                           <div className="w-12 h-12 bg-primary/40 rounded-full"></div>
                         </div>
                       </div>
                     )}
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-foreground mb-4">{panel.title}</h3>
                     <p className="text-base text-muted-foreground">{panel.content}</p>
                   </div>
                </div>
              )}

              {panel.type === 'dashboard' && (
                 <div className="space-y-6">
                   <div className="aspect-[4/3] bg-background rounded-xl border border-border/50 p-6 hover:shadow-lg transition-shadow duration-300">
                     <div className="h-full bg-muted/30 rounded-lg p-4 flex flex-col justify-between">
                       <div className="space-y-3">
                         <div className="h-4 bg-muted rounded w-3/4"></div>
                         <div className="h-4 bg-muted rounded w-1/2"></div>
                       </div>
                       <div className="h-20 bg-gradient-to-r from-primary/10 to-primary/20 rounded-md border border-primary/10 flex items-center justify-center">
                         <div className="text-xl">📊</div>
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                         <div className="h-2 bg-muted rounded"></div>
                         <div className="h-2 bg-muted rounded"></div>
                         <div className="h-2 bg-muted rounded"></div>
                       </div>
                     </div>
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-foreground mb-4">{panel.title}</h3>
                     <p className="text-base text-muted-foreground">{panel.content}</p>
                   </div>
                </div>
              )}

              {panel.type === 'testimonial' && (
                 <div className="space-y-6">
                   <div className="bg-background rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 border border-border/50">
                     <blockquote className="text-lg text-foreground mb-6">
                       "{panel.content}"
                     </blockquote>
                     {panel.author && (
                       <div className="flex items-center">
                         <div className="w-12 h-12 bg-muted rounded-full mr-4 flex items-center justify-center">
                           <div className="w-6 h-6 bg-primary/30 rounded-full"></div>
                         </div>
                         <div>
                           <p className="font-bold text-foreground">{panel.author}</p>
                           {panel.role && (
                             <p className="text-sm text-muted-foreground">{panel.role}</p>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-foreground mb-4">{panel.title}</h3>
                     {panel.buttonText && (
                       <Button className="text-sm px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
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
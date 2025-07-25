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
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {panels.map((panel, index) => (
            <div key={index} className="space-y-8">
              {panel.type === 'image' && (
                <>
                  <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
                    {panel.imageUrl ? (
                      <img 
                        src={panel.imageUrl} 
                        alt={panel.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Imagen del equipo
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-4">{panel.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{panel.content}</p>
                  </div>
                </>
              )}

              {panel.type === 'dashboard' && (
                <>
                  <div className="aspect-[4/3] bg-gray-50 rounded-lg border border-gray-200 p-8 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-4">📊</div>
                      <p>Dashboard Preview</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-4">{panel.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{panel.content}</p>
                  </div>
                </>
              )}

              {panel.type === 'testimonial' && (
                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <blockquote className="text-xl text-gray-800 italic leading-relaxed mb-6">
                      "{panel.content}"
                    </blockquote>
                    {panel.author && (
                      <div>
                        <p className="font-semibold text-black">{panel.author}</p>
                        {panel.role && (
                          <p className="text-gray-600">{panel.role}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-4">{panel.title}</h3>
                    {panel.buttonText && (
                      <Button className="text-lg px-8 py-4 bg-black text-white hover:bg-gray-800 transition-all duration-300 rounded-lg">
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
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Search, Phone } from 'lucide-react';

const AcquisitionHero = () => {
  return (
    <section className="relative bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight">
              Conectamos empresas con 
              <span className="text-primary"> oportunidades</span> de crecimiento
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Facilitamos adquisiciones estratégicas que impulsan el crecimiento empresarial 
              y crean valor sostenible.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <InteractiveHoverButton
                text="Solicitar Consulta"
                variant="primary"
                size="lg"
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-slate-100">
              <div>
                <div className="text-xl font-semibold text-slate-900 mb-2">47</div>
                <div className="text-sm text-slate-500">Adquisiciones cerradas</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900 mb-2">€180M</div>
                <div className="text-sm text-slate-500">Valor gestionado</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900 mb-2">285%</div>
                <div className="text-sm text-slate-500">ROI promedio</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900 mb-2">92%</div>
                <div className="text-sm text-slate-500">Tasa de éxito</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Pipeline */}
          <div className="relative">
            <div className="bg-slate-25 border border-slate-100 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Pipeline Actual</h3>
                <p className="text-sm text-slate-500">Actualizado en tiempo real</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white border border-slate-100 rounded-lg">
                    <div className="text-lg font-semibold text-primary">47</div>
                    <div className="text-xs text-slate-500">Oportunidades</div>
                  </div>
                  <div className="text-center p-3 bg-white border border-slate-100 rounded-lg">
                    <div className="text-lg font-semibold text-slate-900">€325M</div>
                    <div className="text-xs text-slate-500">Valor total</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900 text-sm">Tecnología SaaS</div>
                      <div className="text-xs text-slate-500">€12M • 8.5x EBITDA</div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">Activa</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900 text-sm">Distribución</div>
                      <div className="text-xs text-slate-500">€8.5M • 6.2x EBITDA</div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">En proceso</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900 text-sm">Servicios B2B</div>
                      <div className="text-xs text-slate-500">€5.2M • 4.8x EBITDA</div>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">Valoración</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcquisitionHero;
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Search, Phone } from 'lucide-react';

const AcquisitionHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-tight">
                Compra de Empresas y{' '}
                <span className="text-primary">Oportunidades de Inversión</span>{' '}
                Exclusivas
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                Conectamos empresas en crecimiento, grupos estratégicos y fondos de Private Equity 
                con compañías familiares en transición y sectores con alto potencial de consolidación.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <InteractiveHoverButton
                text="🔍 Ver Oportunidades"
                variant="primary"
                size="lg"
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
              />
              <InteractiveHoverButton
                text="📞 Solicitar Consulta"
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-slate-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">150+</div>
                <div className="text-sm text-slate-600">Adquisiciones cerradas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">€2.8B</div>
                <div className="text-sm text-slate-600">Valor gestionado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">4.2x</div>
                <div className="text-sm text-slate-600">ROI promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">95%</div>
                <div className="text-sm text-slate-600">Tasa de éxito</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Pipeline Actual</h3>
                  <span className="text-sm text-green-600 font-medium">Actualizado hoy</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Oportunidades activas</div>
                      <div className="text-sm text-slate-600">Multi-sector</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">47</div>
                      <div className="text-sm text-slate-600">empresas</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Valor total disponible</div>
                      <div className="text-sm text-slate-600">Portfolio gestionado</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">€180M+</div>
                      <div className="text-sm text-slate-600">en activos</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Múltiplo promedio</div>
                      <div className="text-sm text-slate-600">EBITDA</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">6.8x</div>
                      <div className="text-sm text-slate-600">múltiplo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Deal sourcing exclusivo
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Red Private Equity
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcquisitionHero;
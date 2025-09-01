import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasHero = () => {
  const navigate = useNavigate();
  const benefits = [
    { text: "Máximo precio de venta" },
    { text: "Proceso 100% confidencial" },
    { text: "Experiencia en +200 operaciones" }
  ];

  return (
    <section id="inicio" className="relative py-20 md:py-32 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Content Left */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium text-black mb-8">
              <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
              +200 empresas vendidas exitosamente
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              Vende tu empresa al{" "}
              <span className="text-primary">mejor precio</span>
            </h1>
            
            <p className="text-lg md:text-xl text-black mb-8 max-w-2xl mx-auto lg:mx-0">
              Asesoría especializada en M&A. Maximizamos el valor de tu empresa con 
              un proceso profesional, confidencial y orientado a resultados.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-black">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <InteractiveHoverButton 
                text="Valorar Empresa" 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/lp/calculadora')}
              />
              <InteractiveHoverButton 
                text="Contactar Ahora" 
                variant="secondary" 
                size="lg"
                onClick={() => window.open('tel:+34695717490', '_self')}
              />
            </div>
          </div>

          {/* Simple Visual Right */}
          <div className="relative">
            <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Capittal M&A</h3>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-black">200+</div>
                    <div className="text-xs text-black">Operaciones</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">€902M</div>
                    <div className="text-xs text-black">Valor Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">98,7%</div>
                    <div className="text-xs text-black">Éxito</div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="text-sm font-medium text-black mb-2">Sectores Principales</div>
                  <div className="flex flex-wrap gap-2">
                    {['Industrial y Manufacturero', 'Retail y Consumo', 'Construcción', 'Alimentación y Bebidas'].map((sector) => (
                      <span key={sector} className="px-3 py-1 bg-muted text-black rounded-full text-xs font-medium">
                        {sector}
                      </span>
                    ))}
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
export default VentaEmpresasHero;
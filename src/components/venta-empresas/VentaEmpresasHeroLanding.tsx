import React from 'react';
import { CheckCircle, Phone } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasHeroLanding = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const callExpert = () => {
    window.open('tel:+34912345678', '_self');
  };

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
                variant="primary" 
                size="lg"
                onClick={scrollToContact}
              >
                Solicitar Valoración Gratuita
              </InteractiveHoverButton>
              
              <InteractiveHoverButton 
                variant="outline" 
                size="lg"
                onClick={callExpert}
              >
                <Phone className="mr-2 h-4 w-4" />
                Hablar con un Experto
              </InteractiveHoverButton>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-border mt-8">
              <p className="text-sm text-black mb-3">Confianza garantizada:</p>
              <div className="flex flex-wrap gap-6 text-sm text-black">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>+15 años experiencia</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>€2.5B+ en transacciones</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>95% tasa de éxito</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Card Right */}
          <div className="relative">
            <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Capittal M&A</h3>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-success">+25%</div>
                    <div className="text-sm text-black">Precio vs. mercado</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">6-9</div>
                    <div className="text-sm text-black">Meses proceso</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-black">Sectores Principales</h4>
                  <div className="text-sm text-black space-y-1">
                    <div>• Tecnología y Software</div>
                    <div>• E-commerce y Retail</div>
                    <div>• Servicios Profesionales</div>
                    <div>• Industria y Manufactura</div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border p-3 rounded-lg text-center">
                  <p className="text-sm font-medium text-black">
                    Valoración gratuita disponible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHeroLanding;
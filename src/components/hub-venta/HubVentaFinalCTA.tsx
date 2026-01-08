import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, ArrowRight } from 'lucide-react';
import { useHubVentaTracking } from '@/hooks/useHubVentaTracking';

const HubVentaFinalCTA: React.FC = () => {
  const { trackCTAClick, trackPhoneClick } = useHubVentaTracking();

  const scrollToTop = () => {
    trackCTAClick('final_cta_form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhoneClick = () => {
    trackPhoneClick();
    trackCTAClick('final_cta_phone');
  };

  return (
    <section className="relative py-20 md:py-28 bg-black text-white overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal mb-6">
          ¿Listo Para Dar el Siguiente Paso?
        </h2>
        
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Más de 200 empresarios han confiado en nosotros para vender su empresa. 
          Hablemos de tu caso.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={scrollToTop}
            className="bg-white text-slate-900 hover:bg-white/90 px-8 py-6 text-base font-medium"
          >
            Solicitar Valoración Gratuita
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <a 
            href="tel:+34695717490"
            onClick={handlePhoneClick}
            className="inline-flex items-center gap-2 px-8 py-3 border border-white/30 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="h-5 w-5" />
            <span>+34 695 717 490</span>
          </a>
        </div>

        <p className="mt-8 text-sm text-white/60">
          🔒 100% confidencial · Sin compromiso · Respuesta en 24h
        </p>
      </div>
    </section>
  );
};

export default HubVentaFinalCTA;

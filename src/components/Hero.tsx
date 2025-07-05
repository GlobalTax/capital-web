import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
const Hero = () => {
  const { isOnline } = useNetworkStatus();
  
  return (
    <ErrorBoundary fallback={<div className="min-h-[65vh] flex items-center justify-center bg-background"><p>Error cargando la sección principal</p></div>}>
      <section className="pt-32 pb-8 bg-[hsl(var(--background))] min-h-[65vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-lg text-sm font-medium mb-8">
              Líderes en M&A desde 2008
            </div>
            
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold text-[hsl(var(--foreground))] mb-6 leading-tight">
              Asesórate para vender tu empresa con el máximo valor
            </h1>
            
            <p className="text-lg text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed max-w-2xl mx-auto">
              +20 operaciones cerradas · 92% de éxito en pymes españolas
            </p>

            <div className="mb-12">
              <a 
                href="#contacto" 
                className="inline-flex items-center bg-[#ff6b00] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#e55a00] transition-all duration-200 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#ff6b00] focus:ring-offset-2"
                aria-label="Solicitar consultoría gratuita"
              >
                Solicita consultoría gratuita
              </a>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};
export default Hero;
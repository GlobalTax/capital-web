import React from 'react';
import TestLayout from './components/TestLayout';
import InstitutionalHeader from './components/InstitutionalHeader';
import DarkHeroSection from './components/DarkHeroSection';
import ServicesSection from './components/ServicesSection';
import CaseStudiesSection from './components/CaseStudiesSection';

/**
 * Página de prueba con el nuevo diseño institucional estilo Portobello Capital.
 * Ruta: /test/nuevo-diseno
 * 
 * Esta página es un prototipo aislado para experimentar con el nuevo diseño
 * sin afectar las páginas de producción.
 */
const NuevoDiseno: React.FC = () => {
  return (
    <TestLayout>
      <InstitutionalHeader />
      <DarkHeroSection />
      
      {/* Services Section */}
      <ServicesSection />

      {/* Case Studies Section */}
      <CaseStudiesSection />

      {/* Footer */}
      <footer className="py-16 border-t border-white/10 bg-[hsl(0,0%,5%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <span className="text-white text-2xl tracking-[0.1em]">Capittal</span>
              <p className="text-white/40 text-sm mt-2">
                Especialistas en M&A y valoraciones
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
              <a href="#" className="text-white/60 text-sm hover:text-white transition-colors">
                Política de privacidad
              </a>
              <a href="#" className="text-white/60 text-sm hover:text-white transition-colors">
                Aviso legal
              </a>
              <span className="text-white/40 text-sm">
                © 2025 Capittal
              </span>
            </div>
          </div>
        </div>
      </footer>
    </TestLayout>
  );
};

export default NuevoDiseno;

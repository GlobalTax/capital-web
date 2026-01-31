import React from 'react';
import TestLayout from './components/TestLayout';
import InstitutionalHeader from './components/InstitutionalHeader';
import DarkHeroSection from './components/DarkHeroSection';

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
      
      {/* Placeholder para futuras secciones */}
      <section className="py-24 bg-[hsl(var(--dark-bg-elevated))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="text-[hsl(var(--dark-text-secondary))] text-center text-sm tracking-wide uppercase">
            Próximamente: Sección de Servicios
          </p>
        </div>
      </section>

      <section className="py-24 bg-[hsl(var(--dark-bg))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="text-[hsl(var(--dark-text-secondary))] text-center text-sm tracking-wide uppercase">
            Próximamente: Casos de éxito
          </p>
        </div>
      </section>

      {/* Footer placeholder */}
      <footer className="py-12 border-t border-[hsl(var(--dark-border))] bg-[hsl(var(--dark-bg))]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-white text-lg tracking-wide">Capittal</span>
            <span className="text-[hsl(var(--dark-text-secondary))] text-sm">
              © 2024 Capittal. Todos los derechos reservados.
            </span>
          </div>
        </div>
      </footer>
    </TestLayout>
  );
};

export default NuevoDiseno;

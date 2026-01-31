import React from 'react';
import TestLayout from './components/TestLayout';
import InstitutionalHeader from './components/InstitutionalHeader';
import HeroSliderSection from './components/HeroSliderSection';
import AboutSection from './components/AboutSection';
import ServicesSectionWithImages from './components/ServicesSectionWithImages';
import TeamSection from './components/TeamSection';
import CaseStudiesSection from './components/CaseStudiesSection';
import InstitutionalFooter from './components/InstitutionalFooter';

/**
 * Página de prueba con el nuevo diseño institucional claro.
 * Ruta: /test/nuevo-diseno
 * 
 * Esta página es un prototipo aislado para experimentar con el nuevo diseño
 * sin afectar las páginas de producción.
 * 
 * Estructura:
 * 1. Hero Slider - 3 slides con transición automática
 * 2. La Firma - Sección institucional con stats animados
 * 3. Servicios - Cards con imágenes de alta calidad
 * 4. Equipo - Fotos B&W con hover a color
 * 5. Casos de Éxito - Cards de operaciones destacadas
 * 6. Footer - Con noticias y contacto
 */
const NuevoDiseno: React.FC = () => {
  return (
    <TestLayout>
      {/* Header */}
      <InstitutionalHeader />
      
      {/* Hero Slider */}
      <HeroSliderSection />
      
      {/* La Firma / About Section */}
      <AboutSection />

      {/* Services Section with Images */}
      <ServicesSectionWithImages />

      {/* Team Section */}
      <TeamSection />

      {/* Case Studies Section */}
      <CaseStudiesSection />

      {/* Institutional Footer */}
      <InstitutionalFooter />
    </TestLayout>
  );
};

export default NuevoDiseno;


import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import ValoracionesHero from '@/components/valoraciones/ValoracionesHero';
import ValoracionesMethodology from '@/components/valoraciones/ValoracionesMethodology';
import ValoracionesBenefits from '@/components/valoraciones/ValoracionesBenefits';
import ValoracionesFAQ from '@/components/valoraciones/ValoracionesFAQ';
import ValoracionesCTA from '@/components/valoraciones/ValoracionesCTA';

const Valoraciones = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main role="main">
        <ValoracionesHero />
        <ValoracionesMethodology />
        <ValoracionesBenefits />
        <ValoracionesFAQ />
        <ValoracionesCTA />
      </main>
      <Footer />
      
      {/* Herramientas de accesibilidad flotantes */}
      <AccessibilityTools />
      <NotificationCenter className="mr-16" />
      
      {/* Live region para anuncios de accesibilidad */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="accessibility-announcements"
      />
    </div>
  );
};

export default Valoraciones;

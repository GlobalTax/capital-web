
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';
import AsesoramientoLegalHero from '@/components/asesoramiento-legal/AsesoramientoLegalHero';
import AsesoramientoLegalProcess from '@/components/asesoramiento-legal/AsesoramientoLegalProcess';
import AsesoramientoLegalBenefits from '@/components/asesoramiento-legal/AsesoramientoLegalBenefits';
import AsesoramientoLegalFAQ from '@/components/asesoramiento-legal/AsesoramientoLegalFAQ';
import AsesoramientoLegalCTA from '@/components/asesoramiento-legal/AsesoramientoLegalCTA';

const AsesoramientoLegal = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main role="main">
        <div className="pt-16">
          <AsesoramientoLegalHero />
          <AsesoramientoLegalProcess />
          <AsesoramientoLegalBenefits />
          <AsesoramientoLegalFAQ />
          <AsesoramientoLegalCTA />
        </div>
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

export default AsesoramientoLegal;
